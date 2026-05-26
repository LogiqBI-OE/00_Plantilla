"""
URL config principal.

"""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health(_request):
    """Endpoint publico de salud. Usado por Railway y por keep-warm pings."""
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health, name='health'),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/users/', include('apps.accounts.urls_users')),
    path('api/levels/', include('apps.accounts.urls_levels')),
    path('api/tenants/', include('apps.tenants.urls')),
    path('api/system-config/', include('apps.system_config.urls')),
    path('api/brand/', include('apps.brand.urls')),
    path('api/global-brand/', include('apps.brand.urls_global')),
    path('api/audit/', include('apps.audit.urls')),
]
