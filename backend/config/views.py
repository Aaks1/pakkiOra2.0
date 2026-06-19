from django.http import JsonResponse


def api_root(request):
    """Health / discovery response for GET / — avoids a bare 404 in production."""
    return JsonResponse(
        {
            "service": "PakkiOra Health API",
            "status": "ok",
            "version": "v1",
            "endpoints": {
                "api": request.build_absolute_uri("/api/v1/"),
                "docs": request.build_absolute_uri("/api/docs/"),
                "schema": request.build_absolute_uri("/api/schema/"),
                "admin": request.build_absolute_uri("/admin/"),
            },
        }
    )
