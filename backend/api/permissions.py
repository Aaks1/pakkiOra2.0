from rest_framework.permissions import BasePermission, SAFE_METHODS


def is_admin_user(user) -> bool:
    return user.is_authenticated and user.is_active and (user.is_staff or user.is_superuser)


def is_patient_user(user) -> bool:
    if not user.is_authenticated or not user.is_active:
        return False
    if is_admin_user(user):
        return False
    return hasattr(user, "patient_profile")


class IsAdminUser(BasePermission):
    """Admin / staff access."""

    message = "Admin access required."

    def has_permission(self, request, view):
        return is_admin_user(request.user)


class IsPatientUser(BasePermission):
    """Authenticated patient (non-staff with patient profile)."""

    message = "Patient account required."

    def has_permission(self, request, view):
        return is_patient_user(request.user)


class IsAdminOrReadOnly(BasePermission):
    """Anyone authenticated can read; only admins can write."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        return is_admin_user(request.user)


class IsAppointmentOwnerOrAdmin(BasePermission):
    """Patients may access only their own appointments; admins see all."""

    message = "You do not have access to this appointment."

    def has_object_permission(self, request, view, obj):
        if is_admin_user(request.user):
            return True
        return obj.patient_id == request.user.id
