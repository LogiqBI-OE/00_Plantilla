"""
Modelos de la app `tenants`.

Cada Tenant representa una organizacion/cliente con su propio aislamiento
de datos. Todas las tablas de dominio que se creen a futuro deberan
incluir un FK a Tenant (heredando de `core.TenantScopedModel` cuando exista).

Ver SKELETON_GUIDE.md seccion "Multi-tenancy y niveles".
"""
from django.db import models
from django.utils.translation import gettext_lazy as _


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
