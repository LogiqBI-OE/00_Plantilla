"""
Endpoints de SystemConfig (Global Settings).

- GET   /api/system-config/          lista todas las claves con metadata + valor (L9)
- PATCH /api/system-config/          { items: { key: value, ... } } (L9)
- GET   /api/system-config/runtime/  subset publico (cualquier auth)
"""
from django.db import transaction
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import RequireLevel

from .defaults import (
    PUBLIC_RUNTIME_KEYS,
    SYSTEM_CONFIG_KEYS,
    get_config_key,
)
from .models import SystemConfig


def _serialize_all() -> list[dict]:
    """Lista de todas las claves del catalogo + su valor actual."""
    values = dict(SystemConfig.objects.values_list('key', 'value'))
    out = []
    for ck in SYSTEM_CONFIG_KEYS:
        out.append({
            'key': ck.key,
            'value': values.get(ck.key, ck.default),
            'default': ck.default,
            'label': ck.label,
            'description': ck.description,
            'section': ck.section,
            'input_type': ck.input_type,
            'options': list(ck.options),
            'managed': ck.managed,
        })
    return out


class SystemConfigView(APIView):
    """GET y PATCH de claves de configuracion (L9 only)."""

    permission_classes = [IsAuthenticated, RequireLevel(9)]

    def get(self, _request):
        return Response({'items': _serialize_all()})

    def patch(self, request):
        items = request.data.get('items')
        if not isinstance(items, dict):
            raise ValidationError({'items': 'Se espera un objeto { key: value, ... }.'})

        unknown = [k for k in items if get_config_key(k) is None]
        if unknown:
            raise ValidationError({
                'items': f'Claves desconocidas: {", ".join(unknown)}',
            })

        with transaction.atomic():
            for key, value in items.items():
                SystemConfig.objects.update_or_create(
                    pk=key,
                    defaults={'value': str(value)},
                )

        return Response({'items': _serialize_all()}, status=status.HTTP_200_OK)


class SystemConfigRuntimeView(APIView):
    """
    GET /api/system-config/runtime/

    Subset publico (sin contrasenas, sin secretos) accesible por cualquier
    usuario autenticado. Lo consume el frontend para configurar el keep-warm
    ping, intervalos de polling, etc.
    """
    permission_classes = [IsAuthenticated]

    def get(self, _request):
        out = {}
        for ck in SYSTEM_CONFIG_KEYS:
            if ck.key not in PUBLIC_RUNTIME_KEYS:
                continue
            try:
                value = SystemConfig.objects.get(pk=ck.key).value
            except SystemConfig.DoesNotExist:
                value = ck.default
            out[ck.key] = value
        return Response(out)
