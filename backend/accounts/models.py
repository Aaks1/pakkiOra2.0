from django.contrib.auth.models import User
from django.db import models


class AdminProfile(models.Model):
    """Optional extra fields for staff users."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="admin_profile")
    phone = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Admin: {self.user.username}"
