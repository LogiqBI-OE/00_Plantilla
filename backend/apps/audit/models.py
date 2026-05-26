"""
AuditLog: registro de acciones criticas.

Uso desde otras apps (via service helper):

    from apps.audit.services import log_action

    log_action(
        actor=request.user,
        tenant=request.tenant,
        action='user.created',
        target=created_user,
        metadata={'email': created_user.email},
    )

action es un string libre con namespace por dominio:
    user.created, user.deleted, user.password_reset
    tenant.created, tenant.deactivated, tenant.agency_granted
    brand.updated, brand.logo_replaced
    config.updated, levels.matrix_updated

target_type / target_id permiten reconstruir a que objeto se refiere.
metadata es un dict JSON libre para info adicional (no PII sensible).
"""
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class AuditLog(models.Model):
    tenant = models.ForeignKey(
        'tenants.Tenant',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='+',
        help_text=_('Null para eventos a nivel plataforma (L9 admin).'),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='+',
        help_text=_('Quien ejecuto la accion. Null si fue el sistema.'),
    )
    action = models.CharField(max_length=64)
    target_type = models.CharField(max_length=64, blank=True, default='')
    target_id = models.CharField(max_length=64, blank=True, default='')
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', '-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['action', '-created_at']),
        ]
        verbose_name = _('Audit Log')
        verbose_name_plural = _('Audit Logs')

    def __str__(self) -> str:
        who = self.user.email if self.user_id else 'system'
        return f'{self.created_at:%Y-%m-%d %H:%M} {who} -> {self.action}'
