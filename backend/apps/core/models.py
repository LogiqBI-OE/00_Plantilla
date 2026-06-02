"""
Modelo abstract para multi-tenancy.

Cualquier modelo de dominio futuro (clientes, proyectos, ordenes, etc.)
debe heredar de `TenantScopedModel` para que automaticamente tenga:

    - FK a Tenant con on_delete=CASCADE (si se borra el tenant, sus
      datos se borran tambien)
    - Manager `objects` con metodo `for_request(request)` que filtra
      automaticamente por el tenant del request actual

Ejemplo:

    from apps.core.models import TenantScopedModel

    class Project(TenantScopedModel):
        name = models.CharField(max_length=128)
        # `tenant` ya viene heredado

    # En la view:
    projects = Project.objects.for_request(request)
"""
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from .managers import TenantScopedManager


class TenantScopedModel(models.Model):
    """Base abstract para modelos aislados por tenant."""

    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='+',
    )

    objects = TenantScopedManager()

    class Meta:
        abstract = True


class AbstractLicense(models.Model):
    """
    Base abstract para licencias (de tenant y de agencia).

    Define el estado de la licencia. El enforcement (bloquear logins cuando
    no esta vigente) se hace en una capa aparte; aqui solo vive el dato +
    el helper `is_currently_active()`.
    """

    class Status(models.TextChoices):
        ACTIVA = 'activa', _('Activa')
        SUSPENDIDA = 'suspendida', _('Suspendida')
        VENCIDA = 'vencida', _('Vencida')

    class Type(models.TextChoices):
        FREE = 'free', _('Free')
        STANDARD = 'standard', _('Standard')
        PRO = 'pro', _('Pro')
        ENTERPRISE = 'enterprise', _('Enterprise')

    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.ACTIVA,
    )
    type = models.CharField(
        max_length=16, choices=Type.choices, default=Type.STANDARD,
    )
    valid_until = models.DateField(
        null=True, blank=True,
        help_text=_('Fecha de expiracion. Vacio = sin expiracion.'),
    )
    max_users = models.PositiveIntegerField(
        default=50,
        help_text=_('Limite de cuentas activas que permite la licencia.'),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def is_currently_active(self) -> bool:
        """True si el estado es 'activa' y no esta vencida por fecha."""
        if self.status != self.Status.ACTIVA:
            return False
        if self.valid_until is not None and self.valid_until < timezone.localdate():
            return False
        return True
