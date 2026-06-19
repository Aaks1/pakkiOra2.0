from datetime import datetime

from django.utils import timezone
from django_filters import rest_framework as filters
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from api.permissions import IsAdminUser, is_admin_user
from api.responses import success_response
from api.v1.serializers.doctors import (
    DoctorAvailabilitySerializer,
    DoctorListSerializer,
    DoctorSerializer,
    DoctorSlotConfigSerializer,
    DoctorWriteSerializer,
)
from appointments.models import Appointment
from appointments.services import AvailabilityService, SlotService
from doctors.models import Doctor, DoctorAvailability


class DoctorFilter(filters.FilterSet):
    specialization = filters.CharFilter(field_name="specialization", lookup_expr="icontains")
    is_active = filters.BooleanFilter(field_name="is_active")

    class Meta:
        model = Doctor
        fields = ["specialization", "is_active", "department"]


@extend_schema_view(
    list=extend_schema(tags=["Doctors"]),
    retrieve=extend_schema(tags=["Doctors"]),
    create=extend_schema(tags=["Admin - Doctors"]),
    update=extend_schema(tags=["Admin - Doctors"]),
    partial_update=extend_schema(tags=["Admin - Doctors"]),
    destroy=extend_schema(tags=["Admin - Doctors"]),
)
class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all().order_by("first_name", "last_name")
    filterset_class = DoctorFilter
    search_fields = ["first_name", "last_name", "specialization", "email", "department"]
    ordering_fields = ["first_name", "last_name", "created_at", "specialization"]
    ordering = ["first_name", "last_name"]

    def get_permissions(self):
        if self.action in (
            "create",
            "update",
            "partial_update",
            "destroy",
            "toggle_active",
            "slot_config",
            "slot_overview",
        ):
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return DoctorWriteSerializer
        if self.action == "list":
            if is_admin_user(self.request.user):
                return DoctorSerializer
            return DoctorListSerializer
        return DoctorSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if not is_admin_user(self.request.user):
            qs = qs.filter(is_active=True)
        return qs

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return success_response(data=response.data)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return success_response(
            data=response.data,
            message="Doctor created successfully",
            status_code=response.status_code,
        )

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return success_response(data=response.data, message="Doctor updated successfully")

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        return success_response(data=response.data, message="Doctor updated successfully")

    def destroy(self, request, *args, **kwargs):
        doctor = self.get_object()
        today = timezone.now().date()
        if Appointment.objects.filter(
            doctor=doctor,
            date__gte=today,
            status="BOOKED",
        ).exists():
            from api.exceptions import ServiceError
            raise ServiceError(
                "Cannot delete doctor with future booked appointments. Cancel or reassign them first."
            )
        super().destroy(request, *args, **kwargs)
        return success_response(message="Doctor deleted successfully")

    @extend_schema(tags=["Doctors"])
    @action(detail=True, methods=["get"], url_path="booking-context")
    def booking_context(self, request, pk=None):
        """Doctor profile, available dates, and slots for one date in a single request."""
        doctor = self.get_object()
        today = timezone.now().date()
        days = int(request.query_params.get("days", 30))
        dates = [
            d for d in AvailabilityService.get_available_dates(doctor, today, days_ahead=days)
            if d >= today
        ]

        date_str = request.query_params.get("date")
        selected_date = None
        if date_str:
            try:
                selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                selected_date = None
        if selected_date is None and dates:
            selected_date = dates[0]

        slots = []
        if selected_date and selected_date >= today:
            slots = SlotService.serialize_slots(
                SlotService.get_available_slots(doctor, selected_date)
            )

        return success_response(
            data={
                "doctor": DoctorListSerializer(doctor).data,
                "dates": [d.isoformat() for d in dates],
                "date": selected_date.isoformat() if selected_date else None,
                "slots": slots,
            },
        )

    @extend_schema(tags=["Doctors"])
    @action(detail=True, methods=["get"], url_path="available-dates")
    def available_dates(self, request, pk=None):
        doctor = self.get_object()
        today = timezone.now().date()
        days = int(request.query_params.get("days", 30))
        dates = AvailabilityService.get_available_dates(doctor, today, days_ahead=days)
        return success_response(
            data={"dates": [d.isoformat() for d in dates if d >= today]},
        )

    @extend_schema(tags=["Doctors"])
    @action(detail=True, methods=["get"])
    def slots(self, request, pk=None):
        doctor = self.get_object()
        date_str = request.query_params.get("date")
        if not date_str:
            return success_response(
                data={"slots": []},
                message="Provide a date query parameter (YYYY-MM-DD)",
            )
        try:
            selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return success_response(
                data={"slots": []},
                message="Invalid date format. Use YYYY-MM-DD.",
            )

        today = timezone.now().date()
        if selected_date < today:
            return success_response(data={"slots": [], "date": date_str})

        slots = SlotService.get_available_slots(doctor, selected_date)
        return success_response(
            data={
                "date": date_str,
                "is_available": bool(slots),
                "slots": SlotService.serialize_slots(slots),
            },
        )

    @extend_schema(tags=["Admin - Doctors"])
    @action(detail=True, methods=["get"], url_path="slot-overview")
    def slot_overview(self, request, pk=None):
        """All slots for a date with available, booked, or cancelled status."""
        doctor = self.get_object()
        date_str = request.query_params.get("date")
        if not date_str:
            return success_response(data={"slots": []}, message="Provide date (YYYY-MM-DD).")
        try:
            selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return success_response(data={"slots": []}, message="Invalid date format.")

        day_available = AvailabilityService.is_doctor_available_on_date(doctor, selected_date)
        generated = SlotService.parse_doctor_time_slots(
            doctor, selected_date
        ) or SlotService.generate_default_time_slots(selected_date)

        appointments = {
            appt.start_time: appt
            for appt in Appointment.objects.filter(doctor=doctor, date=selected_date).select_related(
                "patient"
            )
        }

        overview = []
        serialized_slots = {
            slot["start_time"]: serialized
            for slot, serialized in zip(
                generated,
                SlotService.serialize_slots(generated),
                strict=True,
            )
        }
        for slot in generated:
            serialized = dict(serialized_slots[slot["start_time"]])
            appt = appointments.get(slot["start_time"])
            if appt and appt.status == "BOOKED":
                serialized["slot_status"] = "booked"
                serialized["appointment_id"] = appt.id
                serialized["patient_name"] = (
                    appt.patient.get_full_name() or appt.patient.username
                )
            elif appt and appt.status == "CANCELLED":
                serialized["slot_status"] = "cancelled"
                serialized["appointment_id"] = appt.id
            elif day_available:
                serialized["slot_status"] = "available"
            else:
                serialized["slot_status"] = "disabled"
            overview.append(serialized)

        return success_response(data={"date": date_str, "slots": overview})

    @extend_schema(request=DoctorSlotConfigSerializer, tags=["Admin - Doctors"])
    @action(detail=True, methods=["get", "patch"], url_path="slot-config")
    def slot_config(self, request, pk=None):
        doctor = self.get_object()

        if request.method == "GET":
            overrides = DoctorAvailability.objects.filter(doctor=doctor).order_by("-date")[:20]
            return success_response(
                data={
                    "available_days": doctor.available_days,
                    "time_slots": doctor.time_slots,
                    "overrides": DoctorAvailabilitySerializer(overrides, many=True).data,
                },
            )

        serializer = DoctorSlotConfigSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if "available_days" in data:
            doctor.available_days = data["available_days"]
        if "time_slots" in data:
            doctor.time_slots = data["time_slots"]
        doctor.save(update_fields=["available_days", "time_slots", "updated_at"])

        override_date = data.get("override_date")
        if override_date is not None and data.get("override_is_available") is not None:
            availability, _ = DoctorAvailability.objects.get_or_create(
                doctor=doctor,
                date=override_date,
            )
            availability.is_available = data["override_is_available"]
            availability.notes = data.get("override_notes", "")
            availability.save()

        return success_response(message="Slot configuration updated successfully")

    @extend_schema(tags=["Admin - Doctors"])
    @action(detail=True, methods=["post"], url_path="toggle-active")
    def toggle_active(self, request, pk=None):
        doctor = self.get_object()
        doctor.is_active = not doctor.is_active
        doctor.save(update_fields=["is_active", "updated_at"])
        return success_response(
            data={"is_active": doctor.is_active},
            message=f"Doctor {'activated' if doctor.is_active else 'deactivated'} successfully",
        )
