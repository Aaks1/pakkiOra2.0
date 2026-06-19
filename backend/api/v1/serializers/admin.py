from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers

from accounts.models import AdminProfile


class AdminProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminProfile
        fields = ["phone", "department"]


class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    confirm_password = serializers.CharField(write_only=True, required=False)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=20)
    department = serializers.CharField(required=False, allow_blank=True, max_length=100)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "is_active",
            "password",
            "confirm_password",
            "phone",
            "department",
            "date_joined",
        ]
        read_only_fields = ["id", "date_joined"]

    def validate(self, attrs):
        password = attrs.get("password")
        confirm = attrs.get("confirm_password")
        if password or confirm:
            if password != confirm:
                raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        elif not self.instance:
            raise serializers.ValidationError({"password": "Password is required for new admin users."})
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        profile = getattr(instance, "admin_profile", None)
        data["phone"] = profile.phone if profile else ""
        data["department"] = profile.department if profile else ""
        return data

    def create(self, validated_data):
        phone = validated_data.pop("phone", "")
        department = validated_data.pop("department", "")
        validated_data.pop("confirm_password", None)
        password = validated_data.pop("password")

        with transaction.atomic():
            user = User.objects.create_user(**validated_data)
            user.is_staff = True
            user.is_superuser = False
            user.set_password(password)
            user.save()
            AdminProfile.objects.create(user=user, phone=phone, department=department)
        return user

    def update(self, instance, validated_data):
        phone = validated_data.pop("phone", None)
        department = validated_data.pop("department", None)
        validated_data.pop("confirm_password", None)
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()

        if phone is not None or department is not None:
            profile, _ = AdminProfile.objects.get_or_create(user=instance)
            if phone is not None:
                profile.phone = phone
            if department is not None:
                profile.department = department
            profile.save()
        return instance


class PatientAccountSerializer(serializers.ModelSerializer):
    has_patient_profile = serializers.SerializerMethodField()
    appointment_count = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    registration_date = serializers.DateTimeField(source="date_joined", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone",
            "is_active",
            "date_joined",
            "registration_date",
            "has_patient_profile",
            "appointment_count",
        ]
        read_only_fields = [
            "id",
            "username",
            "date_joined",
            "registration_date",
            "has_patient_profile",
            "appointment_count",
            "phone",
        ]

    def get_phone(self, obj) -> str:
        if hasattr(obj, "patient_profile"):
            return obj.patient_profile.phone or ""
        return ""

    def get_has_patient_profile(self, obj) -> bool:
        return hasattr(obj, "patient_profile")

    def get_appointment_count(self, obj) -> int:
        if hasattr(obj, "patient_profile"):
            return obj.appointments.count()
        return 0


class AdminPatientUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    is_active = serializers.BooleanField(required=False)
    phone = serializers.CharField(required=False, allow_blank=True)


class DashboardStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_admins = serializers.IntegerField()
    total_doctors = serializers.IntegerField()
    active_doctors = serializers.IntegerField()
    todays_appointments = serializers.IntegerField()
    total_appointments = serializers.IntegerField()
    booked_appointments = serializers.IntegerField()
    cancelled_appointments = serializers.IntegerField()
    completed_appointments = serializers.IntegerField()
