from django.contrib.auth.models import User
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from api.responses import success_response
from api.v1.serializers.auth import LoginSerializer, PatientRegistrationSerializer


def _user_payload(user: User) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "is_patient": hasattr(user, "patient_profile"),
    }


def _tokens_for_user(user: User) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=PatientRegistrationSerializer, tags=["Authentication"])
    def post(self, request):
        serializer = PatientRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return success_response(
            data={
                "user": _user_payload(user),
                "tokens": _tokens_for_user(user),
            },
            message="Registration successful",
            status_code=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=LoginSerializer, tags=["Authentication"])
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        # Frontend routing uses role; staff always maps to admin dashboard.
        if user.is_staff:
            role = "admin"
        elif hasattr(user, "patient_profile"):
            role = "patient"
        else:
            role = "user"

        return success_response(
            data={
                "user": {**_user_payload(user), "role": role},
                "tokens": _tokens_for_user(user),
            },
            message="Login successful",
        )


class LogoutView(APIView):
    @extend_schema(tags=["Authentication"])
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass
        return success_response(message="Logged out successfully")


class RefreshTokenView(TokenRefreshView):
    @extend_schema(tags=["Authentication"])
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            return success_response(
                data=response.data,
                message="Token refreshed successfully",
            )
        return response
