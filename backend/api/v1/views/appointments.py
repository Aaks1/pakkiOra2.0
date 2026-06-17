from django.utils import timezone
from django_filters import rest_framework as filters
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.decorators import action

from api.exceptions import ServiceError
from api.permissions import IsAdminUser, IsAppointmentOwnerOrAdmin, IsPatientUser, is_admin_user
from api.responses import success_response
from api.v1.serializers.appointments import (
    AdminAppointmentUpdateSerializer,
    AppointmentCreateSerializer,
    AppointmentSerializer,
    AppointmentUpdateSerializer,
)
from appointments.models import Appointment
from appointments.services import AppointmentService
from doctors.models import Doctor


class AppointmentFilter(filters.FilterSet):
    status = filters.CharFilter(field_name="status")
    doctor = filters.NumberFilter(field_name="doctor_id")
    date = filters.DateFilter(field_name="date")
    date_from = filters.DateFilter(field_name="date", lookup_expr="gte")
    date_to = filters.DateFilter(field_name="date", lookup_expr="lte")

    class Meta:
        model = Appointment
        fields = ["status", "doctor", "date"]


@extend_schema_view(
    list=extend_schema(tags=["Appointments"]),
    retrieve=extend_schema(tags=["Appointments"]),
    create=extend_schema(tags=["Appointments"]),
    partial_update=extend_schema(tags=["Appointments"]),
)
class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    filterset_class = AppointmentFilter
    search_fields = [
        "patient__username",
        "patient__first_name",
        "patient__last_name",
        "doctor__first_name",
        "doctor__last_name",
        "symptoms",
    ]
    ordering_fields = ["date", "start_time", "created_at", "status"]
    ordering = ["-date", "-start_time"]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_permissions(self):
        if is_admin_user(self.request.user):
            return [IsAdminUser()]
        if self.action in ("retrieve", "partial_update", "cancel"):
            return [IsPatientUser(), IsAppointmentOwnerOrAdmin()]
        return [IsPatientUser()]

    def get_queryset(self):
        qs = Appointment.objects.select_related("doctor", "patient").all()
        if not is_admin_user(self.request.user):
            qs = qs.filter(patient=self.request.user)
        return qs

    def get_serializer_class(self):
        if self.action == "create":
            return AppointmentCreateSerializer
        if self.action == "partial_update":
            return AppointmentUpdateSerializer
        if self.action in ("admin_update",) and is_admin_user(self.request.user):
            return AdminAppointmentUpdateSerializer
        return AppointmentSerializer

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return success_response(data=response.data)

    @extend_schema(request=AppointmentCreateSerializer, tags=["Appointments"])
    def create(self, request, *args, **kwargs):
        serializer = AppointmentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            doctor = Doctor.objects.get(pk=data["doctor_id"], is_active=True)
        except Doctor.DoesNotExist as exc:
            raise ServiceError("Doctor not found or inactive.") from exc

        appointment = AppointmentService.book(
            user=request.user,
            doctor=doctor,
            appointment_date=data["date"],
            start_time=data["start_time"],
            symptoms=data.get("symptoms", ""),
        )
        return success_response(
            data=AppointmentSerializer(appointment).data,
            message="Appointment booked successfully",
            status_code=status.HTTP_201_CREATED,
        )

    @extend_schema(request=AppointmentUpdateSerializer, tags=["Appointments"])
    def partial_update(self, request, *args, **kwargs):
        appointment = self.get_object()
        serializer = AppointmentUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        appointment_date = serializer.validated_data.get("date", appointment.date)
        start_time = serializer.validated_data.get("start_time", appointment.start_time)

        updated = AppointmentService.reschedule(
            appointment,
            appointment_date=appointment_date,
            start_time=start_time,
        )
        return success_response(
            data=AppointmentSerializer(updated).data,
            message="Appointment rescheduled successfully",
        )

    @extend_schema(tags=["Appointments"])
    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        cancelled = AppointmentService.cancel(appointment)
        return success_response(
            data=AppointmentSerializer(cancelled).data,
            message="Appointment cancelled successfully",
        )

    @extend_schema(tags=["Appointments"])
    @action(detail=False, methods=["get"])
    def history(self, request):
        """Grouped appointment history: upcoming, past, cancelled, completed."""
        qs = self.filter_queryset(self.get_queryset())
        today = timezone.now().date()

        data = {
            "upcoming": AppointmentSerializer(
                qs.filter(date__gte=today, status="BOOKED"), many=True
            ).data,
            "past": AppointmentSerializer(qs.filter(date__lt=today), many=True).data,
            "cancelled": AppointmentSerializer(qs.filter(status="CANCELLED"), many=True).data,
            "completed": AppointmentSerializer(qs.filter(status="COMPLETED"), many=True).data,
            "no_show": AppointmentSerializer(qs.filter(status="NO_SHOW"), many=True).data,
        }
        return success_response(data=data)
