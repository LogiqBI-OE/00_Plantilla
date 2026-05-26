"""URL config principal."""
import redis
from django.conf import settings
from django.contrib import admin
from django.db import connection
from django.http import JsonResponse
from django.urls import include, path


def health(_request):
    """
    Liveness probe. Devuelve 200 si el proceso esta vivo.

    Usado por Railway healthcheck y por keep-warm pings del frontend.
    NO toca DB ni Redis para no fallar por dependencias externas — su unico
    proposito es decir "el proceso responde". Para chequeos profundos, usar
    /readiness/.
    """
    return JsonResponse({'status': 'ok', 'service': 'plantilla-backend'})


def readiness(_request):
    """
    Readiness probe. Devuelve 200 solo si DB y Redis responden.

    Sirve para que un orchestrator decida si rutar trafico al pod. Si DB o
    Redis estan caidos, el servicio "esta vivo" (health=ok) pero "no esta
    listo" (readiness=503).
    """
    checks: dict[str, dict] = {}
    overall_ok = True

    # DB check
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
            cursor.fetchone()
        checks['db'] = {'status': 'ok'}
    except Exception as e:
        checks['db'] = {'status': 'fail', 'error': str(e)[:200]}
        overall_ok = False

    # Redis check
    try:
        r = redis.from_url(settings.CELERY_BROKER_URL, socket_connect_timeout=2)
        r.ping()
        checks['redis'] = {'status': 'ok'}
    except Exception as e:
        checks['redis'] = {'status': 'fail', 'error': str(e)[:200]}
        # Redis no es bloqueante para servir requests HTTP basicos, pero
        # SI lo es para Celery. Lo marcamos como warning, no fail.
        checks['redis']['blocking'] = False

    status_code = 200 if overall_ok else 503
    return JsonResponse(
        {'status': 'ready' if overall_ok else 'not_ready', 'checks': checks},
        status=status_code,
    )


urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health, name='health'),
    path('readiness/', readiness, name='readiness'),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/users/', include('apps.accounts.urls_users')),
    path('api/levels/', include('apps.accounts.urls_levels')),
    path('api/tenants/', include('apps.tenants.urls')),
    path('api/system-config/', include('apps.system_config.urls')),
    path('api/brand/', include('apps.brand.urls')),
    path('api/global-brand/', include('apps.brand.urls_global')),
    path('api/audit/', include('apps.audit.urls')),
]
