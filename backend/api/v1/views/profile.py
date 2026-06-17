from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.views import APIView

from api.permissions import IsPatientUser
from api.responses import success_response
from api.v1.serializers.profile import ChangePasswordSerializer, PatientProfileSerializer
from doctors.models import Patient


class ProfileView(APIView):
    permission_classes = [IsPatientUser]

    def _get_patient(self, user) -> Patient:
        return Patient.objects.get(user=user)

    @extend_schema(responses=PatientProfileSerializer, tags=["Profile"])
    def get(self, request):
        patient = self._get_patient(request.user)
        serializer = PatientProfileSerializer(patient)
        return success_response(data=serializer.data)

    @extend_schema(request=PatientProfileSerializer, tags=["Profile"])
    def put(self, request):
        patient = self._get_patient(request.user)
        serializer = PatientProfileSerializer(patient, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_response(data=serializer.data, message="Profile updated successfully")

    @extend_schema(request=PatientProfileSerializer, tags=["Profile"])
    def patch(self, request):
        patient = self._get_patient(request.user)
        serializer = PatientProfileSerializer(patient, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_response(data=serializer.data, message="Profile updated successfully")


class ChangePasswordView(APIView):
    permission_classes = [IsPatientUser]

    @extend_schema(request=ChangePasswordSerializer, tags=["Profile"])
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return success_response(message="Password updated successfully", status_code=status.HTTP_200_OK)
