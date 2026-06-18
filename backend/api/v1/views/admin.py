from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.utils import timezone
from django_filters import rest_framework as filters
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.views import APIView

from api.permissions import IsAdminUser
from api.responses import success_response
from api.v1.serializers.admin import (
    AdminPatientUpdateSerializer,
    AdminUserSerializer,
    DashboardStatsSerializer,
    PatientAccountSerializer,
)
from api.v1.serializers.appointments import AdminAppointmentUpdateSerializer, AppointmentSerializer
from appointments.models import Appointment
from appointments.services import AppointmentService
from doctors.models import Doctor


class AdminUserFilter(filters.FilterSet):
    is_active = filters.BooleanFilter(field_name="is_active")

    class Meta:
        model = User
        fields = ["is_active"]


@extend_schema_view(
    list=extend_schema(tags=["Admin - Staff"]),
    retrieve=extend_schema(tags=["Admin - Staff"]),
    create=extend_schema(tags=["Admin - Staff"]),
    update=extend_schema(tags=["Admin - Staff"]),
    partial_update=extend_schema(tags=["Admin - Staff"]),
    destroy=extend_schema(tags=["Admin - Staff"]),
)
class AdminStaffViewSet(viewsets.ModelViewSet):
    """Manage admin/staff accounts."""
    permission_classes = [IsAdminUser]
    serializer_class = AdminUserSerializer
    queryset = User.objects.filter(is_staff=True).select_related("admin_profile").order_by("-date_joined")
    search_fields = ["username", "first_name", "last_name", "email"]
    ordering_fields = ["date_joined", "username"]
    http_method_names = ["get", "post", "put", "patch", "delete", "head", "options"]

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return success_response(data=response.data)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return success_response(
            data=response.data,
            message="Admin user created successfully",
            status_code=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return success_response(data=response.data, message="Admin user updated successfully")

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        return success_response(data=response.data, message="Admin user updated successfully")

    def destroy(self, request, *args, **kwargs):
        admin = self.get_object()
        if admin.id == request.user.id:
            from api.exceptions import ServiceError
            raise ServiceError("You cannot delete your own account.")
        super().destroy(request, *args, **kwargs)
        return success_response(message="Admin user deleted successfully")


class PatientFilter(filters.FilterSet):
    is_active = filters.BooleanFilter(field_name="is_active")
    has_profile = filters.BooleanFilter(method="filter_has_profile")

    class Meta:
        model = User
        fields = ["is_active"]

    def filter_has_profile(self, queryset, name, value):
        if value is True:
            return queryset.filter(patient_profile__isnull=False)
        if value is False:
            return queryset.filter(patient_profile__isnull=True)
        return queryset


@extend_schema_view(
    list=extend_schema(tags=["Admin - Patients"]),
    retrieve=extend_schema(tags=["Admin - Patients"]),
    partial_update=extend_schema(tags=["Admin - Patients"]),
    destroy=extend_schema(tags=["Admin - Patients"]),
)
class AdminPatientViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Manage patient accounts."""
    permission_classes = [IsAdminUser]
    serializer_class = PatientAccountSerializer
    queryset = User.objects.filter(is_staff=False).select_related("patient_profile").order_by("-date_joined")
    filterset_class = PatientFilter
    search_fields = [
        "username",
        "first_name",
        "last_name",
        "email",
        "patient_profile__phone",
    ]
    ordering_fields = ["date_joined", "username"]
    http_method_names = ["get", "patch", "delete", "post", "head", "options"]

    def get_queryset(self):
        qs = super().get_queryset()
        user_type = self.request.query_params.get("user_type")
        if user_type == "patient":
            qs = qs.filter(patient_profile__isnull=False)
        elif user_type == "regular":
            qs = qs.filter(patient_profile__isnull=True)
        return qs

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        data = PatientAccountSerializer(user).data
        if hasattr(user, "patient_profile"):
            from api.v1.serializers.profile import PatientProfileSerializer
            data["profile"] = PatientProfileSerializer(user.patient_profile).data
            data["appointments"] = AppointmentSerializer(
                Appointment.objects.filter(patient=user).select_related("doctor"),
                many=True,
            ).data
        return success_response(data=data)

    def partial_update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = AdminPatientUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        for field in ("first_name", "last_name", "email", "is_active"):
            if field in data:
                setattr(user, field, data[field])
        user.save()

        phone = data.get("phone")
        if phone is not None and hasattr(user, "patient_profile"):
            profile = user.patient_profile
            profile.phone = phone
            profile.save(update_fields=["phone", "updated_at"])

        return success_response(
            data=PatientAccountSerializer(user).data,
            message="Patient account updated successfully",
        )

    def destroy(self, request, *args, **kwargs):
        super().destroy(request, *args, **kwargs)
        return success_response(message="Patient account deleted successfully")

    @extend_schema(tags=["Admin - Patients"])
    @action(detail=True, methods=["post"], url_path="toggle-active")
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])
        return success_response(
            data={"is_active": user.is_active},
            message=f"Patient account {'activated' if user.is_active else 'deactivated'}",
        )


class AdminAppointmentViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """Admin appointment management."""
    permission_classes = [IsAdminUser]
    serializer_class = AppointmentSerializer
    queryset = Appointment.objects.select_related("doctor", "patient").order_by("-date", "-start_time")
    filterset_fields = ["status", "doctor", "date"]
    search_fields = [
        "patient__username",
        "patient__first_name",
        "patient__last_name",
        "doctor__first_name",
        "doctor__last_name",
    ]
    ordering_fields = ["date", "start_time", "status", "created_at"]

    def get_serializer_class(self):
        if self.action in ("update", "partial_update"):
            return AdminAppointmentUpdateSerializer
        return AppointmentSerializer

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return success_response(data=response.data)

    def partial_update(self, request, *args, **kwargs):
        appointment = self.get_object()
        serializer = AdminAppointmentUpdateSerializer(appointment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        updated = AppointmentService.admin_update(
            appointment,
            doctor=data.get("doctor"),
            appointment_date=data.get("date"),
            start_time=data.get("start_time"),
            status=data.get("status"),
            notes=data.get("notes"),
            symptoms=data.get("symptoms"),
        )
        return success_response(
            data=AppointmentSerializer(updated).data,
            message="Appointment updated successfully",
        )

    @extend_schema(tags=["Admin - Appointments"])
    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        cancelled = AppointmentService.cancel(appointment)
        return success_response(
            data=AppointmentSerializer(cancelled).data,
            message="Appointment cancelled successfully",
        )


class DashboardView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(responses=DashboardStatsSerializer, tags=["Admin - Dashboard"])
    def get(self, request):
        today = timezone.now().date()
        user_stats = User.objects.aggregate(
            total_users=Count("id", filter=Q(is_staff=False)),
            total_admins=Count("id", filter=Q(is_staff=True)),
        )
        doctor_stats = Doctor.objects.aggregate(
            total_doctors=Count("id"),
            active_doctors=Count("id", filter=Q(is_active=True)),
        )
        appt_stats = Appointment.objects.aggregate(
            total_appointments=Count("id"),
            booked_appointments=Count("id", filter=Q(status="BOOKED")),
            cancelled_appointments=Count("id", filter=Q(status="CANCELLED")),
            completed_appointments=Count("id", filter=Q(status="COMPLETED")),
            todays_appointments=Count("id", filter=Q(date=today, status="BOOKED")),
        )
        data = {**user_stats, **doctor_stats, **appt_stats}
        return success_response(data=data)
