"""
URL config principal.

Los grupos de endpoints de cada app se agregan en sus respectivos commits:
    path('api/tenants/', include('apps.tenants.urls')),        # commit 7
    path('api/users/', include('apps.accounts.urls_users')),   # commit 6
    path('api/brand/', include('apps.brand.urls')),            # commit 10
    path('api/system-config/', include('apps.system_config.urls')),  # commit 9
    path('api/audit/', include('apps.audit.urls')),            # commit 11
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
]
