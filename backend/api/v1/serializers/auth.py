from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers

from doctors.models import Patient


class PatientRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=20)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    address = serializers.CharField(required=False, allow_blank=True)
    blood_group = serializers.ChoiceField(
        choices=[
            ("A+", "A+"), ("A-", "A-"), ("B+", "B+"), ("B-", "B-"),
            ("AB+", "AB+"), ("AB-", "AB-"), ("O+", "O+"), ("O-", "O-"),
        ],
        required=False,
        allow_blank=True,
    )
    allergies = serializers.CharField(required=False, allow_blank=True)
    medical_conditions = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "confirm_password",
            "phone",
            "date_of_birth",
            "address",
            "blood_group",
            "allergies",
            "medical_conditions",
        ]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        profile_fields = {
            "phone": validated_data.pop("phone", ""),
            "date_of_birth": validated_data.pop("date_of_birth", None),
            "address": validated_data.pop("address", ""),
            "blood_group": validated_data.pop("blood_group", "") or None,
            "allergies": validated_data.pop("allergies", ""),
            "medical_history": validated_data.pop("medical_conditions", ""),
        }
        validated_data.pop("confirm_password")
        password = validated_data.pop("password")

        with transaction.atomic():
            user = User.objects.create_user(password=password, **validated_data)
            Patient.objects.create(
                user=user,
                first_name=user.first_name,
                last_name=user.last_name,
                **profile_fields,
            )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            username=attrs["username"],
            password=attrs["password"],
        )
        if not user:
            raise serializers.ValidationError("Invalid username or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is disabled.")
        attrs["user"] = user
        return attrs
