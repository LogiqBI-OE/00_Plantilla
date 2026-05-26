"""URLs de auth (montadas bajo /api/auth/ desde plantilla.urls)."""
from django.urls import path

from . import auth_views

app_name = 'accounts'

urlpatterns = [
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('refresh/', auth_views.RefreshView.as_view(), name='refresh'),
    path('me/', auth_views.MeView.as_view(), name='me'),
    path('switch-tenant/', auth_views.SwitchTenantView.as_view(), name='switch-tenant'),
    path(
        'tenants-for-identifier/',
        auth_views.TenantsForIdentifierView.as_view(),
        name='tenants-for-identifier',
    ),
]
