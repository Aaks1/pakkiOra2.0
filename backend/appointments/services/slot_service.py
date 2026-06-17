from datetime import date, datetime, timedelta
from typing import Any

from doctors.models import Doctor

from appointments.models import Appointment
from .availability_service import AvailabilityService

SLOT_DURATION_MINUTES = 30
DEFAULT_START = "09:00"
DEFAULT_END = "17:00"


class SlotService:
    """Parse doctor slot configuration and compute bookable times."""

    @staticmethod
    def parse_doctor_time_slots(doctor: Doctor, selected_date: date) -> list[dict[str, Any]]:
        raw_slots = [s.strip() for s in (doctor.time_slots or "").split(",") if s.strip()]
        parsed_slots = []
        for slot in raw_slots:
            try:
                start_time = datetime.strptime(slot, "%H:%M").time()
                end_time = (
                    datetime.combine(selected_date, start_time)
                    + timedelta(minutes=SLOT_DURATION_MINUTES)
                ).time()
                parsed_slots.append(
                    {
                        "start_time": start_time,
                        "end_time": end_time,
                        "start_str": datetime.combine(selected_date, start_time).strftime(
                            "%I:%M %p"
                        ),
                        "end_str": datetime.combine(selected_date, end_time).strftime(
                            "%I:%M %p"
                        ),
                    }
                )
            except ValueError:
                continue
        return parsed_slots

    @staticmethod
    def generate_default_time_slots(selected_date: date) -> list[dict[str, Any]]:
        slots = []
        start_time = datetime.strptime(DEFAULT_START, "%H:%M").time()
        end_time = datetime.strptime(DEFAULT_END, "%H:%M").time()
        current_time = datetime.combine(selected_date, start_time)
        end_datetime = datetime.combine(selected_date, end_time)

        while current_time < end_datetime:
            slot_end = current_time + timedelta(minutes=SLOT_DURATION_MINUTES)
            if slot_end <= end_datetime:
                slots.append(
                    {
                        "start_time": current_time.time(),
                        "end_time": slot_end.time(),
                        "start_str": current_time.strftime("%I:%M %p"),
                        "end_str": slot_end.strftime("%I:%M %p"),
                    }
                )
            current_time = slot_end
        return slots

    @classmethod
    def get_available_slots(
        cls,
        doctor: Doctor,
        selected_date: date,
        *,
        exclude_appointment_id: int | None = None,
    ) -> list[dict[str, Any]]:
        if not AvailabilityService.is_doctor_available_on_date(doctor, selected_date):
            return []

        slots = cls.parse_doctor_time_slots(doctor, selected_date) or cls.generate_default_time_slots(
            selected_date
        )

        booked_qs = Appointment.objects.filter(
            doctor=doctor,
            date=selected_date,
            status="BOOKED",
        )
        if exclude_appointment_id:
            booked_qs = booked_qs.exclude(id=exclude_appointment_id)

        booked_times = set(booked_qs.values_list("start_time", flat=True))
        return [slot for slot in slots if slot["start_time"] not in booked_times]

    @staticmethod
    def serialize_slots(slots: list[dict[str, Any]]) -> list[dict[str, str]]:
        return [
            {
                "start_time": slot["start_time"].strftime("%H:%M"),
                "end_time": slot["end_time"].strftime("%H:%M"),
                "start_display": slot["start_str"],
                "end_display": slot["end_str"],
            }
            for slot in slots
        ]
