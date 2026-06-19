from datetime import date, datetime, time, timedelta

from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
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

            cancelled = (
                Appointment.objects.select_for_update()
                .filter(
                    doctor=doctor,
                    date=appointment_date,
                    start_time=start_time,
                    status="CANCELLED",
                )
                .first()
            )
            if cancelled:
                cancelled.patient = user
                cancelled.status = "BOOKED"
                cancelled.symptoms = symptoms
                cancelled.end_time = end_time
                cancelled.save(update_fields=["patient", "status", "symptoms", "end_time", "updated_at"])
                return cancelled

            try:
                return Appointment.objects.create(
                    doctor=doctor,
                    patient=user,
                    date=appointment_date,
                    start_time=start_time,
                    end_time=end_time,
                    symptoms=symptoms,
                    status="BOOKED",
                )
            except IntegrityError as exc:
                raise ServiceError("This slot is already booked. Please choose another slot.") from exc

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
            try:
                appointment.save(update_fields=["date", "start_time", "end_time", "updated_at"])
            except IntegrityError as exc:
                raise ServiceError("This slot is already booked. Please choose another slot.") from exc
            return appointment

    @classmethod
    def admin_update(
        cls,
        appointment: Appointment,
        *,
        doctor: Doctor | None = None,
        appointment_date: date | None = None,
        start_time: time | None = None,
        status: str | None = None,
        notes: str | None = None,
        symptoms: str | None = None,
    ) -> Appointment:
        target_doctor = doctor or appointment.doctor
        target_date = appointment_date or appointment.date
        target_start = start_time or appointment.start_time

        schedule_changed = (
            doctor is not None
            or appointment_date is not None
            or start_time is not None
        )

        if schedule_changed and appointment.status == "BOOKED":
            cls._validate_future_date(target_date)
            if not AvailabilityService.is_doctor_available_on_date(target_doctor, target_date):
                raise ServiceError("Doctor is not available on the selected date.")
            cls._validate_slot_available(
                target_doctor,
                target_date,
                target_start,
                exclude_appointment_id=appointment.id,
            )

        end_time = (
            datetime.combine(target_date, target_start) + timedelta(minutes=SLOT_DURATION_MINUTES)
        ).time()

        with transaction.atomic():
            if schedule_changed and appointment.status == "BOOKED":
                conflict = (
                    Appointment.objects.select_for_update()
                    .filter(
                        doctor=target_doctor,
                        date=target_date,
                        start_time=target_start,
                        status="BOOKED",
                    )
                    .exclude(id=appointment.id)
                    .exists()
                )
                if conflict:
                    raise ServiceError("This slot is already booked. Please choose another slot.")

            if doctor is not None:
                appointment.doctor = target_doctor
            if appointment_date is not None:
                appointment.date = target_date
            if start_time is not None:
                appointment.start_time = target_start
                appointment.end_time = end_time
            if status is not None:
                valid = {choice[0] for choice in Appointment.STATUS_CHOICES}
                if status not in valid:
                    raise ServiceError(f"Invalid status. Must be one of: {', '.join(sorted(valid))}")
                appointment.status = status
            if notes is not None:
                appointment.notes = notes
            if symptoms is not None:
                appointment.symptoms = symptoms

            try:
                appointment.save()
            except IntegrityError as exc:
                raise ServiceError("This slot is already booked. Please choose another slot.") from exc
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
