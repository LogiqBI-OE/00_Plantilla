"""
Authentication class custom para JWT + multi-tenancy.

Reemplaza el JWTAuthentication estandar de simplejwt. Cuando autentica
un request, ademas de resolver el usuario, lee el claim `tenant_slug`
del token, busca el Tenant correspondiente, valida que el usuario
tenga acceso, y deja todo disponible en el request:

    request.user         -> instancia de User
    request.auth         -> AccessToken validado (con sus claims)
    request.tenant       -> instancia de Tenant o None (None = modo platform L9)
    request.tenant_slug  -> string o None (raw del claim)

Configurar en settings:
    REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'] = (
        'apps.core.authentication.TenantJWTAuthentication',
    )

Para vistas publicas (login, brand/public, etc.) usar
`permission_classes = [AllowAny]` y este auth no aplica (no hay
header Authorization).
"""
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication

from apps.accounts.models import AgencyTenantAccess
from apps.system_config.defaults import multitenant_enabled
from apps.tenants.models import Tenant, get_default_tenant


class TenantJWTAuthentication(JWTAuthentication):
    """JWT auth que tambien resuelve y valida tenant en cada request."""

    def authenticate(self, request):
        result = super().authenticate(request)
        if result is None:
            return None

        user, validated_token = result

        # Modo single (multi-tenant apagado): un unico tenant fijo para todos,
        # sin importar el claim del JWT. Asi no hay que re-loguear al cambiar el
        # flag y L9 opera dentro del tenant sin seleccionarlo.
        if not multitenant_enabled():
            tenant = get_default_tenant()
            request.tenant = tenant
            request.tenant_slug = tenant.slug
            return user, validated_token

        tenant_slug = validated_token.get('tenant_slug')
        tenant: Tenant | None = None

        if tenant_slug:
            tenant = Tenant.objects.filter(slug=tenant_slug).first()
            if tenant is None:
                raise AuthenticationFailed('El tenant ya no existe.')
            if not tenant.is_active:
                raise AuthenticationFailed('El tenant esta inactivo.')
            self._enforce_access(user, tenant)
        else:
            # Sin tenant_slug solo se permite modo platform (L9).
            if user.level < 9:
                raise AuthenticationFailed('Tu sesion no tiene tenant asignado.')

        # Setea atributos en el request para que las views los consuman.
        request.tenant = tenant
        request.tenant_slug = tenant_slug
        return user, validated_token

    @staticmethod
    def _enforce_access(user, tenant) -> None:
        """Valida que el usuario tenga acceso al tenant."""
        if user.level == 9:
            return  # L9 accede a cualquier tenant activo.

        if user.level == 8:
            has_access = AgencyTenantAccess.objects.filter(
                user=user, tenant=tenant
            ).exists()
            if not has_access:
                raise AuthenticationFailed('Perdiste acceso a este tenant.')
            return

        # L0-L7: el tenant del JWT debe coincidir con el asignado al usuario.
        if user.tenant_id != tenant.id:
            raise AuthenticationFailed(
                'El tenant del token no coincide con tu asignacion.'
            )
