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
        end_date = start_date.fromordinal(start_date.toordinal() + days_ahead - 1)
        overrides = {
            row.date: row.is_available
            for row in DoctorAvailability.objects.filter(
                doctor=doctor,
                date__gte=start_date,
                date__lte=end_date,
            )
        }
        available_days = set(doctor.available_days or [])
        dates = []
        for offset in range(days_ahead):
            candidate = start_date.fromordinal(start_date.toordinal() + offset)
            if candidate in overrides:
                if overrides[candidate]:
                    dates.append(candidate)
                continue
            day_name = candidate.strftime("%A").lower()
            if day_name in available_days:
                dates.append(candidate)
        return dates
