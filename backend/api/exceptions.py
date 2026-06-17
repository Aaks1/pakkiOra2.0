import logging

from django.core.exceptions import PermissionDenied, ValidationError as DjangoValidationError
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler

from .responses import error_response

logger = logging.getLogger(__name__)


class ServiceError(APIException):
    """Raised by service layer for predictable business-rule failures."""

    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Request could not be completed."
    default_code = "service_error"

    def __init__(self, detail=None, code=None, errors=None):
        super().__init__(detail=detail, code=code)
        self.errors = errors or {}


def custom_exception_handler(exc, context):
    """Wrap all DRF errors in the standard { success, message, errors } envelope."""
    response = exception_handler(exc, context)

    if response is not None:
        errors = response.data
        if isinstance(errors, dict) and "detail" in errors and len(errors) == 1:
            message = str(errors["detail"])
            errors = {}
        elif isinstance(errors, list):
            message = "Validation failed"
            errors = {"non_field_errors": errors}
        elif isinstance(errors, dict):
            message = "Validation failed"
        else:
            message = str(errors)
            errors = {}

        if isinstance(exc, ServiceError) and exc.errors:
            errors = exc.errors

        response.data = {
            "success": False,
            "message": message,
            "errors": errors,
        }
        return response

    if isinstance(exc, Http404):
        return error_response("Resource not found.", status_code=status.HTTP_404_NOT_FOUND)

    if isinstance(exc, PermissionDenied):
        return error_response(
            "You do not have permission to perform this action.",
            status_code=status.HTTP_403_FORBIDDEN,
        )

    if isinstance(exc, DjangoValidationError):
        if hasattr(exc, "message_dict"):
            errors = exc.message_dict
        elif hasattr(exc, "messages"):
            errors = {"non_field_errors": exc.messages}
        else:
            errors = {"non_field_errors": [str(exc)]}
        return error_response("Validation failed", errors=errors, status_code=status.HTTP_400_BAD_REQUEST)

    logger.exception("Unhandled exception in API view", exc_info=exc)
    return error_response(
        "An unexpected error occurred.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
