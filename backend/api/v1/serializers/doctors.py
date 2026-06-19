from rest_framework import serializers

from doctors.models import Doctor, DoctorAvailability


class DoctorSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = [
            "id",
            "full_name",
            "first_name",
            "last_name",
            "email",
            "phone",
            "address",
            "specialization",
            "qualification",
            "experience_years",
            "license_number",
            "department",
            "bio",
            "available_days",
            "time_slots",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_full_name(self, obj) -> str:
        return f"Dr. {obj.first_name} {obj.last_name}"


class DoctorListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = [
            "id",
            "full_name",
            "first_name",
            "last_name",
            "email",
            "phone",
            "specialization",
            "qualification",
            "experience_years",
            "available_days",
            "time_slots",
            "is_active",
        ]

    def get_full_name(self, obj) -> str:
        return f"Dr. {obj.first_name} {obj.last_name}"


class DoctorWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone",
            "address",
            "specialization",
            "qualification",
            "experience_years",
            "license_number",
            "department",
            "bio",
            "available_days",
            "time_slots",
            "is_active",
        ]

    def validate_email(self, value):
        qs = Doctor.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A doctor with this email already exists.")
        return value

    def validate_license_number(self, value):
        qs = Doctor.objects.filter(license_number__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A doctor with this license number already exists.")
        return value


class DoctorSlotConfigSerializer(serializers.Serializer):
    available_days = serializers.ListField(
        child=serializers.ChoiceField(choices=Doctor.DAY_CHOICES),
        required=False,
    )
    time_slots = serializers.CharField(required=False, allow_blank=True)
    override_date = serializers.DateField(required=False, allow_null=True)
    override_is_available = serializers.BooleanField(required=False, allow_null=True)
    override_notes = serializers.CharField(required=False, allow_blank=True)


class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorAvailability
        fields = ["id", "date", "is_available", "notes", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
