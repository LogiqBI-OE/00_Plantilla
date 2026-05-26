"""
Endpoints de marca.

Per-tenant (consume request.tenant del JWT):
    GET    /api/brand/                        brand del tenant actual
    PATCH  /api/brand/                        editar marca/alcance/paleta_actual/segundos
    POST   /api/brand/logos/                  { kind: login|sidebar, data_url, filename }
    DELETE /api/brand/logos/{kind}/
    POST   /api/brand/carrusel/foto/          { data_url }
    DELETE /api/brand/carrusel/foto/{idx}/
    POST   /api/brand/paleta/memoria/         { nombre }     (max 5)
    DELETE /api/brand/paleta/memoria/{idx}/
    POST   /api/brand/paleta/memoria/{idx}/aplicar/
    POST   /api/brand/paleta/default/         resetea a PALETA_DEFAULT

Publico (sin auth):
    GET    /api/brand/public/                 brand del tenant (segun host) o
                                              default + requires_tenant_selector
                                              si hay 2+ tenants activos.

Global (L9 only):
    GET / PATCH /api/global-brand/
    (resto de acciones igual estructura, contra el singleton)
"""
from datetime import datetime, timezone

from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import HasPermission, RequireLevel
from apps.tenants.models import Tenant

from .defaults import (
    BRAND_DEFAULTS,
    MAX_CARRUSEL_FOTOS,
    MAX_PALETAS_MEMORIA,
    PALETA_DEFAULT,
)
from .models import BrandSettings, GlobalBrand
from .serializers import (
    BrandSettingsPublicSerializer,
    BrandSettingsSerializer,
    GlobalBrandSerializer,
)


def _get_or_create_brand_for(tenant: Tenant) -> BrandSettings:
    """Asegura que un tenant tenga BrandSettings (con defaults LogiQ)."""
    brand, created = BrandSettings.objects.get_or_create(
        tenant=tenant,
        defaults={
            'marca': BRAND_DEFAULTS['marca'],
            'alcance': BRAND_DEFAULTS['alcance'],
            'paleta_actual': PALETA_DEFAULT,
            'carrusel_segundos': BRAND_DEFAULTS['carrusel_segundos'],
        },
    )
    return brand


def _require_brand_edit(user, tenant_brand: BrandSettings) -> None:
    """Permiso de edicion: admin del tenant + L8/L9."""
    if user.level >= 8:
        return
    if not user.has_permission('manage_brand'):
        raise PermissionDenied('Requiere permiso manage_brand.')
    if user.tenant_id != tenant_brand.tenant_id:
        raise PermissionDenied('No puedes editar la marca de otro tenant.')


# --- Per-tenant views --------------------------------------------------------


class BrandView(APIView):
    """GET / PATCH del brand del tenant actual."""

    permission_classes = [IsAuthenticated]

    def _get_brand(self, request) -> BrandSettings:
        if request.tenant is None:
            raise NotFound('Sin tenant activo. Cambia a un tenant para acceder a su marca.')
        return _get_or_create_brand_for(request.tenant)

    def get(self, request):
        brand = self._get_brand(request)
        return Response(BrandSettingsSerializer(brand).data)

    def patch(self, request):
        brand = self._get_brand(request)
        _require_brand_edit(request.user, brand)

        # Solo campos editables en este endpoint (logos y carrusel via endpoints
        # dedicados; memorias via /paleta/memoria/).
        editable = {'marca', 'alcance', 'paleta_actual', 'carrusel_segundos'}
        updates = {k: v for k, v in request.data.items() if k in editable}
        for k, v in updates.items():
            setattr(brand, k, v)
        brand.save()
        return Response(BrandSettingsSerializer(brand).data)


class BrandLogosView(APIView):
    """POST / DELETE logos del tenant."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        brand = _get_or_create_brand_for(request.tenant) if request.tenant else None
        if brand is None:
            raise NotFound('Sin tenant activo.')
        _require_brand_edit(request.user, brand)

        kind = request.data.get('kind')
        data_url = request.data.get('data_url', '')
        filename = request.data.get('filename', '')

        if kind not in ('login', 'sidebar'):
            raise ValidationError({'kind': 'Debe ser "login" o "sidebar".'})
        if not isinstance(data_url, str) or not data_url.startswith('data:image/'):
            raise ValidationError({'data_url': 'Se espera un data URL de imagen.'})

        setattr(brand, f'logo_{kind}', data_url)
        setattr(brand, f'logo_{kind}_filename', filename or '')
        brand.save()
        return Response(BrandSettingsSerializer(brand).data)


class BrandLogoDeleteView(APIView):
    """DELETE /api/brand/logos/{kind}/."""

    permission_classes = [IsAuthenticated]

    def delete(self, request, kind: str):
        if kind not in ('login', 'sidebar'):
            raise ValidationError({'kind': 'login o sidebar.'})
        brand = _get_or_create_brand_for(request.tenant) if request.tenant else None
        if brand is None:
            raise NotFound('Sin tenant activo.')
        _require_brand_edit(request.user, brand)

        setattr(brand, f'logo_{kind}', '')
        setattr(brand, f'logo_{kind}_filename', '')
        brand.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BrandCarruselFotoView(APIView):
    """POST agregar foto al carrusel (max 12)."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        brand = _get_or_create_brand_for(request.tenant) if request.tenant else None
        if brand is None:
            raise NotFound('Sin tenant activo.')
        _require_brand_edit(request.user, brand)

        data_url = request.data.get('data_url', '')
        if not isinstance(data_url, str) or not data_url.startswith('data:image/'):
            raise ValidationError({'data_url': 'Se espera un data URL de imagen.'})
        if len(brand.carrusel_fotos) >= MAX_CARRUSEL_FOTOS:
            raise ValidationError({
                'carrusel_fotos': f'Maximo {MAX_CARRUSEL_FOTOS} fotos.',
            })

        brand.carrusel_fotos.append(data_url)
        brand.save()
        return Response(BrandSettingsSerializer(brand).data)


class BrandCarruselFotoDeleteView(APIView):
    """DELETE foto del carrusel por indice."""

    permission_classes = [IsAuthenticated]

    def delete(self, request, idx: int):
        brand = _get_or_create_brand_for(request.tenant) if request.tenant else None
        if brand is None:
            raise NotFound('Sin tenant activo.')
        _require_brand_edit(request.user, brand)

        if not 0 <= idx < len(brand.carrusel_fotos):
            raise NotFound('Indice de foto fuera de rango.')
        brand.carrusel_fotos.pop(idx)
        brand.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BrandPaletaMemoriaView(APIView):
    """POST guardar paleta actual como memoria (max 5)."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        brand = _get_or_create_brand_for(request.tenant) if request.tenant else None
        if brand is None:
            raise NotFound('Sin tenant activo.')
        _require_brand_edit(request.user, brand)

        nombre = (request.data.get('nombre') or '').strip()
        if not nombre:
            raise ValidationError({'nombre': 'Requerido.'})
        if len(brand.paletas_memoria) >= MAX_PALETAS_MEMORIA:
            raise ValidationError({
                'paletas_memoria': f'Maximo {MAX_PALETAS_MEMORIA} paletas. Borra una antes.',
            })

        brand.paletas_memoria.append({
            'nombre': nombre,
            'guardada_at': datetime.now(timezone.utc).isoformat(),
            'paleta': brand.paleta_actual,
        })
        brand.save()
        return Response(BrandSettingsSerializer(brand).data)


class BrandPaletaMemoriaDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, idx: int):
        brand = _get_or_create_brand_for(request.tenant) if request.tenant else None
        if brand is None:
            raise NotFound('Sin tenant activo.')
        _require_brand_edit(request.user, brand)

        if not 0 <= idx < len(brand.paletas_memoria):
            raise NotFound('Indice de memoria fuera de rango.')
        brand.paletas_memoria.pop(idx)
        brand.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BrandPaletaMemoriaAplicarView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, idx: int):
        brand = _get_or_create_brand_for(request.tenant) if request.tenant else None
        if brand is None:
            raise NotFound('Sin tenant activo.')
        _require_brand_edit(request.user, brand)

        if not 0 <= idx < len(brand.paletas_memoria):
            raise NotFound('Indice de memoria fuera de rango.')
        brand.paleta_actual = brand.paletas_memoria[idx]['paleta']
        brand.save()
        return Response(BrandSettingsSerializer(brand).data)


class BrandPaletaDefaultView(APIView):
    """POST resetea paleta_actual al PALETA_DEFAULT hardcoded."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        brand = _get_or_create_brand_for(request.tenant) if request.tenant else None
        if brand is None:
            raise NotFound('Sin tenant activo.')
        _require_brand_edit(request.user, brand)

        brand.paleta_actual = PALETA_DEFAULT
        brand.save()
        return Response(BrandSettingsSerializer(brand).data)


# --- Public view -------------------------------------------------------------


class BrandPublicView(APIView):
    """
    GET /api/brand/public/

    SIN AUTH. Lo consume el login para mostrar marca + paleta + carrusel
    sin que el usuario haya autenticado todavia.

    Logica del flag requires_tenant_selector:
    - 0 tenants activos: devuelve LogiQ default + flag false (caso recien
        instalado, no se puede loguear de todos modos).
    - 1 tenant activo: devuelve su brand + flag false.
    - 2+ tenants activos: devuelve LogiQ default + flag true (frontend
        muestra selector en el form).

    TODO: resolver tenant por subdomain/host antes de aplicar esta logica
    (ej. acme.app.com -> brand del tenant acme directo, sin selector).
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, _request):
        active_tenants = Tenant.objects.filter(is_active=True)
        count = active_tenants.count()

        if count == 1:
            brand = _get_or_create_brand_for(active_tenants.first())
            return Response({
                **BrandSettingsPublicSerializer(brand).data,
                'requires_tenant_selector': False,
                'tenant_slug': brand.tenant.slug,
            })

        # 0 o 2+: usa LogiQ global como default y deja que el frontend
        # decida si mostrar selector.
        global_brand = GlobalBrand.get_solo()
        return Response({
            **GlobalBrandSerializer(global_brand).data,
            'requires_tenant_selector': count >= 2,
            'tenant_slug': None,
        })


# --- Global Brand (L9 only) --------------------------------------------------


class GlobalBrandView(APIView):
    """GET / PATCH del singleton GlobalBrand (identidad LogiQ)."""

    permission_classes = [IsAuthenticated, RequireLevel(9)]

    def get(self, _request):
        return Response(GlobalBrandSerializer(GlobalBrand.get_solo()).data)

    def patch(self, request):
        brand = GlobalBrand.get_solo()
        editable = {'marca', 'alcance', 'paleta_actual', 'carrusel_segundos',
                    'logo_login', 'logo_sidebar',
                    'logo_login_filename', 'logo_sidebar_filename',
                    'carrusel_fotos', 'paletas_memoria'}
        for k, v in request.data.items():
            if k in editable:
                setattr(brand, k, v)
        brand.save()
        return Response(GlobalBrandSerializer(brand).data)
