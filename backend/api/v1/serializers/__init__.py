from .auth import LoginSerializer, PatientRegistrationSerializer
from .appointments import AppointmentCreateSerializer, AppointmentSerializer, AppointmentUpdateSerializer
from .doctors import DoctorSerializer, DoctorSlotConfigSerializer, DoctorWriteSerializer
from .profile import ChangePasswordSerializer, PatientProfileSerializer
from .admin import AdminUserSerializer, AdminProfileSerializer, DashboardStatsSerializer

__all__ = [
    "LoginSerializer",
    "PatientRegistrationSerializer",
    "AppointmentCreateSerializer",
    "AppointmentSerializer",
    "AppointmentUpdateSerializer",
    "DoctorSerializer",
    "DoctorSlotConfigSerializer",
    "DoctorWriteSerializer",
    "ChangePasswordSerializer",
    "PatientProfileSerializer",
    "AdminUserSerializer",
    "AdminProfileSerializer",
    "DashboardStatsSerializer",
]
