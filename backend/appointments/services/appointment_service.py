from datetime import date, datetime, time, timedelta

from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone

from api.exceptions import ServiceError
from appointments.models import Appointment
from doctors.models import Doctor, Patient

from .availability_service import AvailabilityService
from .slot_service import SLOT_DURATION_MINUTES, SlotService


class AppointmentService:
    """Book, reschedule, and cancel appointments with business-rule validation."""

    @staticmethod
    def _ensure_patient(user: User) -> Patient:
        patient, _ = Patient.objects.get_or_create(
            user=user,
            defaults={
                "first_name": user.first_name or "Unknown",
                "last_name": user.last_name or "User",
            },
        )
        return patient

    @staticmethod
    def _validate_future_date(appointment_date: date) -> None:
        today = timezone.now().date()
        if appointment_date < today:
            raise ServiceError("You cannot book an appointment in the past.")

    @staticmethod
    def _validate_slot_available(
        doctor: Doctor,
        appointment_date: date,
        start_time: time,
        *,
        exclude_appointment_id: int | None = None,
    ) -> None:
        available = SlotService.get_available_slots(
            doctor,
            appointment_date,
            exclude_appointment_id=exclude_appointment_id,
        )
        available_times = {slot["start_time"] for slot in available}
        if start_time not in available_times:
            raise ServiceError(
                "This time slot is not available. Please choose another slot.",
                errors={"start_time": ["Slot unavailable or already booked."]},
            )

    @classmethod
    def book(
        cls,
        user: User,
        doctor: Doctor,
        appointment_date: date,
        start_time: time,
        *,
        symptoms: str = "",
    ) -> Appointment:
        if not doctor.is_active:
            raise ServiceError("This doctor is not currently accepting appointments.")

        cls._ensure_patient(user)
        cls._validate_future_date(appointment_date)

        if not AvailabilityService.is_doctor_available_on_date(doctor, appointment_date):
            raise ServiceError("Doctor is not available on the selected date.")

        cls._validate_slot_available(doctor, appointment_date, start_time)

        end_time = (
            datetime.combine(appointment_date, start_time)
            + timedelta(minutes=SLOT_DURATION_MINUTES)
        ).time()

        with transaction.atomic():
            conflict = (
                Appointment.objects.select_for_update()
                .filter(
                    doctor=doctor,
                    date=appointment_date,
                    start_time=start_time,
                    status="BOOKED",
                )
                .exists()
            )
            if conflict:
                raise ServiceError("This slot is already booked. Please choose another slot.")

            return Appointment.objects.create(
                doctor=doctor,
                patient=user,
                date=appointment_date,
                start_time=start_time,
                end_time=end_time,
                symptoms=symptoms,
                status="BOOKED",
            )

    @classmethod
    def reschedule(
        cls,
        appointment: Appointment,
        appointment_date: date,
        start_time: time,
    ) -> Appointment:
        if appointment.status != "BOOKED":
            raise ServiceError("Only booked appointments can be rescheduled.")

        doctor = appointment.doctor
        cls._validate_future_date(appointment_date)

        if not AvailabilityService.is_doctor_available_on_date(doctor, appointment_date):
            raise ServiceError("Doctor is not available on the selected date.")

        cls._validate_slot_available(
            doctor,
            appointment_date,
            start_time,
            exclude_appointment_id=appointment.id,
        )

        end_time = (
            datetime.combine(appointment_date, start_time)
            + timedelta(minutes=SLOT_DURATION_MINUTES)
        ).time()

        with transaction.atomic():
            conflict = (
                Appointment.objects.select_for_update()
                .filter(
                    doctor=doctor,
                    date=appointment_date,
                    start_time=start_time,
                    status="BOOKED",
                )
                .exclude(id=appointment.id)
                .exists()
            )
            if conflict:
                raise ServiceError("This slot is already booked. Please choose another slot.")

            appointment.date = appointment_date
            appointment.start_time = start_time
            appointment.end_time = end_time
            appointment.save(update_fields=["date", "start_time", "end_time", "updated_at"])
            return appointment

    @staticmethod
    def cancel(appointment: Appointment) -> Appointment:
        if appointment.status != "BOOKED":
            raise ServiceError("Only booked appointments can be cancelled.")
        appointment.status = "CANCELLED"
        appointment.save(update_fields=["status", "updated_at"])
        return appointment

    @staticmethod
    def admin_update_status(appointment: Appointment, status: str, notes: str | None = None) -> Appointment:
        valid = {choice[0] for choice in Appointment.STATUS_CHOICES}
        if status not in valid:
            raise ServiceError(f"Invalid status. Must be one of: {', '.join(sorted(valid))}")

        appointment.status = status
        update_fields = ["status", "updated_at"]
        if notes is not None:
            appointment.notes = notes
            update_fields.append("notes")
        appointment.save(update_fields=update_fields)
        return appointment
