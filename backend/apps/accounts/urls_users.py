"""
URLs del CRUD de usuarios (montadas bajo /api/users/ desde plantilla.urls).

Usa DefaultRouter para generar automaticamente:
    GET    /api/users/                   list
    POST   /api/users/                   create
    GET    /api/users/{id}/              retrieve
    PATCH  /api/users/{id}/              partial_update
    PUT    /api/users/{id}/              update
    DELETE /api/users/{id}/              destroy
    POST   /api/users/{id}/reset-password/
    POST   /api/users/{id}/permissions/
"""
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'', views.UserViewSet, basename='user')

urlpatterns = router.urls
