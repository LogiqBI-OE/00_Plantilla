"""
Helper para registrar eventos de auditoria desde otras apps.

No loguear lecturas masivas (LIST endpoints) — solo mutaciones y eventos
de seguridad. El log no debe crecer sin control.

Si el registro falla por cualquier motivo (DB, etc.), NO debe tumbar la
operacion principal. Por eso encapsulamos en try/except.
"""
import logging
from typing import Any

from django.db.models import Model

from .models import AuditLog

logger = logging.getLogger(__name__)


def log_action(
    *,
    actor: Model | None,
    tenant: Model | None,
    action: str,
    target: Model | None = None,
    metadata: dict[str, Any] | None = None,
) -> AuditLog | None:
    """
    Registra una entrada en el AuditLog.

    Args:
        actor: User que ejecuta la accion. None si fue el sistema.
        tenant: Tenant en cuyo contexto se ejecuto. None para acciones plataforma.
        action: Codigo libre con namespace. Ej. 'user.created', 'brand.updated'.
        target: Objeto afectado (opcional). Se extraen target_type y target_id
            automaticamente.
        metadata: Dict JSON con info adicional. NO incluir contrasenas u otros
            secretos.

    Returns:
        La instancia de AuditLog creada, o None si el registro fallo (degraded
        gracefully — no rompe la operacion principal).
    """
    target_type = ''
    target_id = ''
    if target is not None:
        target_type = target._meta.model_name or ''
        target_id = str(target.pk) if target.pk is not None else ''

    try:
        return AuditLog.objects.create(
            user=actor,
            tenant=tenant,
            action=action,
            target_type=target_type,
            target_id=target_id,
            metadata=metadata or {},
        )
    except Exception:
        logger.exception('Failed to write AuditLog (action=%s)', action)
        return None
