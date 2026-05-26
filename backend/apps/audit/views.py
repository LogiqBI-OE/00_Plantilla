"""
Endpoints de auditoria.

GET /api/audit/?action=&user=&from=&to=&page=

Scope:
- L9 sin tenant (modo platform): ve TODOS los logs (incluye tenant=null).
- L9/L8 dentro de un tenant: ve logs del tenant actual.
- L0-L7: requiere permiso 'view_audit'. Ve solo logs de su tenant.
"""
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from apps.core.permissions import HasPermission

from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        # L0-L7 necesitan view_audit; L8/L9 siempre.
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        tenant = self.request.tenant
        qs = AuditLog.objects.select_related('user', 'tenant')

        if user.level == 9 and tenant is None:
            # Platform mode: ve todo
            pass
        elif user.level >= 8:
            # L8/L9 con tenant activo: solo ese tenant
            qs = qs.filter(tenant=tenant)
        else:
            # L0-L7: scope por tenant + requiere view_audit
            if not user.has_permission('view_audit'):
                raise PermissionDenied('Requiere permiso view_audit.')
            if tenant is None:
                return AuditLog.objects.none()
            qs = qs.filter(tenant=tenant)

        # Filtros opcionales
        params = self.request.query_params
        if action := params.get('action'):
            qs = qs.filter(action__icontains=action)
        if user_id := params.get('user'):
            qs = qs.filter(user_id=user_id)
        if dfrom := params.get('from'):
            qs = qs.filter(created_at__gte=dfrom)
        if dto := params.get('to'):
            qs = qs.filter(created_at__lte=dto)

        return qs.order_by('-created_at')
