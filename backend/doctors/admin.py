from django.contrib import admin
from .models import Doctor, DoctorAvailability, Patient

admin.site.register(Doctor)
admin.site.register(DoctorAvailability)
admin.site.register(Patient)
