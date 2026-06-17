from datetime import datetime

from rest_framework import serializers

from appointments.models import Appointment
from api.v1.serializers.doctors import DoctorSerializer


class AppointmentSerializer(serializers.ModelSerializer):
    doctor = DoctorSerializer(read_only=True)
    patient_username = serializers.CharField(source="patient.username", read_only=True)
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "patient_username",
            "patient_name",
            "doctor",
            "date",
            "start_time",
            "end_time",
            "status",
            "symptoms",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_patient_name(self, obj) -> str:
        if hasattr(obj.patient, "patient_profile"):
            patient = obj.patient.patient_profile
            return f"{patient.first_name} {patient.last_name}".strip()
        return obj.patient.get_full_name() or obj.patient.username


class AppointmentCreateSerializer(serializers.Serializer):
    doctor_id = serializers.IntegerField()
    date = serializers.DateField()
    start_time = serializers.TimeField(format="%H:%M", input_formats=["%H:%M", "%H:%M:%S"])
    symptoms = serializers.CharField(required=False, allow_blank=True)


class AppointmentUpdateSerializer(serializers.Serializer):
    date = serializers.DateField()
    start_time = serializers.TimeField(format="%H:%M", input_formats=["%H:%M", "%H:%M:%S"])


class AdminAppointmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["date", "start_time", "end_time", "status", "symptoms", "notes"]

    def validate(self, attrs):
        start_time = attrs.get("start_time", getattr(self.instance, "start_time", None))
        end_time = attrs.get("end_time", getattr(self.instance, "end_time", None))
        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError("End time must be later than start time.")
        return attrs

    def validate_start_time(self, value):
        if isinstance(value, str):
            return datetime.strptime(value, "%H:%M").time()
        return value
