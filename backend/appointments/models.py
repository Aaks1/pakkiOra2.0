from datetime import date

from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q


class Appointment(models.Model):
    STATUS_CHOICES = [
        ("BOOKED", "Booked"),
        ("CANCELLED", "Cancelled"),
        ("COMPLETED", "Completed"),
        ("NO_SHOW", "No Show"),
    ]

    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="appointments")
    doctor = models.ForeignKey("doctors.Doctor", on_delete=models.CASCADE, related_name="patient_appointments")
    date = models.DateField(default=date.today)
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="BOOKED")
    symptoms = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date", "start_time"]
        constraints = [
            # Only one BOOKED row per doctor/date/time; cancelled slots can be rebooked.
            models.UniqueConstraint(
                fields=["doctor", "date", "start_time"],
                condition=Q(status="BOOKED"),
                name="unique_booked_doctor_slot",
            ),
        ]

    def __str__(self):
        return f"{self.patient.username} / Dr. {self.doctor.last_name} / {self.date}"
