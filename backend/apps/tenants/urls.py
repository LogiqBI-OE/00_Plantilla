"""URLs de tenants (montadas bajo /api/tenants/)."""
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'', views.TenantViewSet, basename='tenant')

urlpatterns = router.urls
