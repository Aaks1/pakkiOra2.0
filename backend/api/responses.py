from typing import Any, Optional

from rest_framework import status
from rest_framework.response import Response


def success_response(
    data: Any = None,
    message: str = "Operation completed successfully",
    status_code: int = status.HTTP_200_OK,
) -> Response:
    return Response(
        {
            "success": True,
            "message": message,
            "data": data if data is not None else {},
        },
        status=status_code,
    )


def error_response(
    message: str,
    errors: Optional[dict] = None,
    status_code: int = status.HTTP_400_BAD_REQUEST,
) -> Response:
    return Response(
        {
            "success": False,
            "message": message,
            "errors": errors or {},
        },
        status=status_code,
    )
