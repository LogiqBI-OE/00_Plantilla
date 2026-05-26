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
