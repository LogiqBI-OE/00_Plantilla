"""
Endpoints de autenticacion.

- POST /api/auth/login                   -> login adaptativo con tenant_slug opcional
- POST /api/auth/refresh                 -> renovar access token (estandar simplejwt)
- GET  /api/auth/me                      -> usuario + tenant actual desde el JWT
- POST /api/auth/switch-tenant           -> L8/L9 cambian de tenant activo
- GET  /api/auth/tenants-for-identifier  -> ayuda al frontend a mostrar el selector

Ver SKELETON_GUIDE.md seccion "Multi-tenancy y niveles" para el flujo completo.
"""
from django.contrib.auth.models import update_last_login
from django.db.models import Q
from rest_framework.exceptions import (
    AuthenticationFailed,
    NotFound,
    PermissionDenied,
    ValidationError,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from apps.system_config.defaults import multitenant_enabled
from apps.tenants.models import Tenant, get_default_tenant

from .models import AgencyTenantAccess, User
from .serializers import (
    TenantBriefSerializer,
    UserWithPermissionsSerializer,
)


# --- Helpers -----------------------------------------------------------------


def issue_tokens_for_user(user: User, tenant: Tenant | None) -> dict[str, str]:
    """
    Emite un par access + refresh para el usuario.

    Inyecta `tenant_slug` y `level` como claims custom. Los claims se
    propagan automaticamente al access_token derivado del refresh
    (simplejwt copia todos los claims excepto token_type/exp/iat/jti/aud).
    """
    refresh = RefreshToken.for_user(user)
    refresh['tenant_slug'] = tenant.slug if tenant else None
    refresh['level'] = user.level
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


def _resolve_user_by_identifier(identifier: str) -> User | None:
    """Busca usuario por email o username (case-insensitive)."""
    identifier = (identifier or '').strip().lower()
    if not identifier:
        return None
    return User.objects.filter(
        Q(email__iexact=identifier) | Q(username__iexact=identifier)
    ).first()


def _tenants_for_user(user: User) -> list[Tenant]:
    """Lista de tenants activos a los que el usuario puede acceder."""
    if user.level == 9:
        return list(Tenant.objects.filter(is_active=True))
    if user.level == 8:
        accesses = (
            AgencyTenantAccess.objects
            .filter(user=user, tenant__is_active=True)
            .select_related('tenant')
        )
        return [a.tenant for a in accesses]
    if user.tenant and user.tenant.is_active:
        return [user.tenant]
    return []


# --- Views -------------------------------------------------------------------


class LoginView(APIView):
    """
    POST /api/auth/login

    Body:
        identifier: email o username
        password: contrasena
        tenant_slug: opcional. Obligatorio para L8; opcional para L9 (sin
            slug -> modo platform sin tenant); ignorado para L0-L7
            (se usa su tenant asignado).

    Response 200:
        access, refresh, user (con permissions), tenant (o null si L9 platform).

    Errores 400/401 con detail explicativo.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get('identifier', '')
        password = request.data.get('password', '')
        tenant_slug = (request.data.get('tenant_slug') or '').strip().lower() or None

        if not identifier or not password:
            raise ValidationError({'detail': 'identifier y password son requeridos.'})

        user = _resolve_user_by_identifier(identifier)
        if user is None or not user.check_password(password):
            # Mensaje generico para no leak existencia del usuario.
            raise AuthenticationFailed('Credenciales invalidas.')

        if not user.is_active:
            raise AuthenticationFailed('Usuario inactivo.')

        tenant = self._resolve_tenant(user, tenant_slug)

        update_last_login(None, user)
        tokens = issue_tokens_for_user(user, tenant=tenant)

        return Response({
            **tokens,
            'user': UserWithPermissionsSerializer(user).data,
            'tenant': TenantBriefSerializer(tenant).data if tenant else None,
        })

    @staticmethod
    def _resolve_tenant(user: User, tenant_slug: str | None) -> Tenant | None:
        # Modo single: todos operan dentro del tenant fijo, sin seleccion.
        if not multitenant_enabled():
            return get_default_tenant()

        if user.level == 9:
            # L9 sin slug -> modo platform (tenant=None). Con slug -> entrar a ese tenant.
            if not tenant_slug:
                return None
            tenant = Tenant.objects.filter(slug=tenant_slug, is_active=True).first()
            if not tenant:
                raise ValidationError({'tenant_slug': 'Tenant no encontrado o inactivo.'})
            return tenant

        if user.level == 8:
            # L8 debe especificar tenant (su universo es ambiguo sin esto).
            if not tenant_slug:
                accessible = _tenants_for_user(user)
                raise ValidationError({
                    'tenant_required': True,
                    'detail': 'Debes seleccionar un tenant para continuar.',
                    'tenants': TenantBriefSerializer(accessible, many=True).data,
                })
            tenant = Tenant.objects.filter(slug=tenant_slug, is_active=True).first()
            if not tenant:
                raise ValidationError({'tenant_slug': 'Tenant no encontrado o inactivo.'})
            has_access = AgencyTenantAccess.objects.filter(user=user, tenant=tenant).exists()
            if not has_access:
                raise AuthenticationFailed('No tienes acceso a este tenant.')
            return tenant

        # L0-L7
        if not user.tenant:
            raise AuthenticationFailed('Usuario sin tenant asignado.')
        if not user.tenant.is_active:
            raise AuthenticationFailed('Tu tenant esta inactivo.')
        if tenant_slug and tenant_slug != user.tenant.slug:
            raise ValidationError({'tenant_slug': 'No coincide con tu tenant asignado.'})
        return user.tenant


class RefreshView(TokenRefreshView):
    """
    POST /api/auth/refresh

    Usa el flow estandar de simplejwt. Los claims custom (tenant_slug,
    level) se preservan automaticamente del refresh al nuevo access.
    """
    permission_classes = [AllowAny]


class MeView(APIView):
    """
    GET /api/auth/me

    Returns el usuario actual + tenant actual.

    `request.tenant` lo setea `TenantJWTAuthentication` desde el claim
    del JWT y ya validado contra el nivel del usuario.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'user': UserWithPermissionsSerializer(request.user).data,
            'tenant': (
                TenantBriefSerializer(request.tenant).data
                if request.tenant else None
            ),
        })


class SwitchTenantView(APIView):
    """
    POST /api/auth/switch-tenant

    Body: { tenant_slug: str }

    Solo L8/L9. Emite un nuevo par de tokens con el tenant_slug actualizado.
    El frontend reemplaza access+refresh y re-inicializa providers.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.level < 8:
            raise PermissionDenied('Solo L8/L9 pueden cambiar de tenant.')

        tenant_slug = (request.data.get('tenant_slug') or '').strip().lower()
        if not tenant_slug:
            raise ValidationError({'tenant_slug': 'Requerido.'})

        tenant = Tenant.objects.filter(slug=tenant_slug, is_active=True).first()
        if not tenant:
            raise NotFound('Tenant no encontrado o inactivo.')

        if request.user.level == 8:
            has_access = AgencyTenantAccess.objects.filter(
                user=request.user, tenant=tenant
            ).exists()
            if not has_access:
                raise PermissionDenied('No tienes acceso a este tenant.')
        # L9 puede entrar a cualquier tenant activo.

        tokens = issue_tokens_for_user(request.user, tenant=tenant)
        return Response({
            **tokens,
            'user': UserWithPermissionsSerializer(request.user).data,
            'tenant': TenantBriefSerializer(tenant).data,
        })


class TenantsForIdentifierView(APIView):
    """
    GET /api/auth/tenants-for-identifier?identifier=<email_o_username>

    Sin auth. Ayuda al frontend del login a mostrar el selector de tenant
    cuando aplica. Devuelve lista de tenants accesibles para ese usuario,
    o vacia si el usuario no existe (no leak).

    TODO(rate-limit): agregar throttle al endpoint para evitar enumeracion
    masiva. Pendiente para commit dedicado de rate limiting.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        identifier = request.query_params.get('identifier', '')
        user = _resolve_user_by_identifier(identifier)
        if user is None or not user.is_active:
            return Response({'tenants': [], 'allow_platform': False})

        tenants = _tenants_for_user(user)
        return Response({
            'tenants': TenantBriefSerializer(tenants, many=True).data,
            'allow_platform': user.level == 9,
        })
