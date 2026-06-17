from datetime import date

from doctors.models import Doctor, DoctorAvailability


class AvailabilityService:
    """Doctor availability: recurring days plus per-date overrides."""

    @staticmethod
    def is_doctor_available_on_date(doctor: Doctor, selected_date: date) -> bool:
        override = DoctorAvailability.objects.filter(
            doctor=doctor, date=selected_date
        ).first()
        if override:
            return override.is_available
        day_name = selected_date.strftime("%A").lower()
        return day_name in (doctor.available_days or [])

    @staticmethod
    def get_available_dates(doctor: Doctor, start_date: date, days_ahead: int = 30) -> list[date]:
        dates = []
        for offset in range(days_ahead):
            candidate = start_date.fromordinal(start_date.toordinal() + offset)
            if AvailabilityService.is_doctor_available_on_date(doctor, candidate):
                dates.append(candidate)
        return dates
