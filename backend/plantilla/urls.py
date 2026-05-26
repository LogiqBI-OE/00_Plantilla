"""
URL config principal.

Los grupos de endpoints de cada app se agregan en sus respectivos commits:
    path('api/auth/', include('apps.accounts.urls')),
    path('api/tenants/', include('apps.tenants.urls')),
    path('api/brand/', include('apps.brand.urls')),
    path('api/system-config/', include('apps.system_config.urls')),
    path('api/audit/', include('apps.audit.urls')),
"""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path


def health(_request):
    """Endpoint publico de salud. Usado por Railway y por keep-warm pings."""
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health, name='health'),
]
