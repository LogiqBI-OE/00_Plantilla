"""
Modelos de la app `tenants`.

Cada Tenant representa una organizacion/cliente con su propio aislamiento
de datos. Todas las tablas de dominio que se creen a futuro deberan
incluir un FK a Tenant (heredando de `core.TenantScopedModel` cuando exista).

Ver SKELETON_GUIDE.md seccion "Multi-tenancy y niveles".
"""
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import AbstractLicense


class Tenant(models.Model):
    """Una organizacion/cliente. Aislamiento total entre tenants."""

    slug = models.SlugField(
        max_length=64,
        unique=True,
        help_text=_('Identificador URL-friendly. Usado para subdominios y rutas.'),
    )
    name = models.CharField(
        max_length=128,
        help_text=_('Nombre visible del tenant.'),
    )
    is_active = models.BooleanField(
        default=True,
        help_text=_('Si esta inactivo, sus usuarios no pueden iniciar sesion.'),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = _('Tenant')
        verbose_name_plural = _('Tenants')

    def __str__(self) -> str:
        return self.name


# Tenant fijo usado en modo single (multi-tenant apagado). Toda la app opera
# dentro de el; la UI multi-tenant (selector, paginas Tenants) queda oculta.
DEFAULT_TENANT_SLUG = 'logiq'
DEFAULT_TENANT_NAME = 'LogiQ'


def get_default_tenant() -> 'Tenant':
    """
    Devuelve (creando si hace falta) el tenant fijo del modo single.

    Idempotente: una vez creado, las llamadas siguientes solo lo leen.
    """
    tenant, _created = Tenant.objects.get_or_create(
        slug=DEFAULT_TENANT_SLUG,
        defaults={'name': DEFAULT_TENANT_NAME, 'is_active': True},
    )
    return tenant


class TenantLicense(AbstractLicense):
    """Licencia de un tenant (1:1). Controla a sus usuarios L0-L7."""

    tenant = models.OneToOneField(
        Tenant,
        on_delete=models.CASCADE,
        related_name='license',
    )

    class Meta:
        verbose_name = _('Licencia de tenant')
        verbose_name_plural = _('Licencias de tenant')

    def __str__(self) -> str:
        return f'TenantLicense({self.tenant.slug}: {self.status})'
