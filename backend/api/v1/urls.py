from django.urls import include, path
from rest_framework.routers import DefaultRouter

from api.v1.views.admin import (
    AdminAppointmentViewSet,
    AdminPatientViewSet,
    AdminStaffViewSet,
    DashboardView,
)
from api.v1.views.appointments import AppointmentViewSet
from api.v1.views.auth import LoginView, LogoutView, RefreshTokenView, RegisterView
from api.v1.views.doctors import DoctorViewSet
from api.v1.views.profile import ChangePasswordView, ProfileView

router = DefaultRouter()
router.register(r"doctors", DoctorViewSet, basename="doctor")
router.register(r"appointments", AppointmentViewSet, basename="appointment")
router.register(r"admin/staff", AdminStaffViewSet, basename="admin-staff")
router.register(r"admin/patients", AdminPatientViewSet, basename="admin-patient")
router.register(r"admin/appointments", AdminAppointmentViewSet, basename="admin-appointment")

urlpatterns = [
    # Authentication
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/refresh/", RefreshTokenView.as_view(), name="auth-refresh"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    # Profile
    path("profile/", ProfileView.as_view(), name="profile"),
    path("profile/change-password/", ChangePasswordView.as_view(), name="change-password"),
    # Admin dashboard
    path("admin/dashboard/", DashboardView.as_view(), name="admin-dashboard"),
    # ViewSets
    path("", include(router.urls)),
]
