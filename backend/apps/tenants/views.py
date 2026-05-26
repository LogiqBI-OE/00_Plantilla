"""
ViewSet de tenants: /api/tenants/*.

Scopes:
- L9: ve todos los tenants, puede crear/editar/borrar.
- L8: ve solo los que tiene asignados en AgencyTenantAccess. Read-only.
- L0-L7: ve solo el suyo. Read-only.

Acciones custom:
- POST   /api/tenants/{id}/grant-agency/   (L9)  body {user_id}
- POST   /api/tenants/{id}/revoke-agency/  (L9)  body {user_id}
- GET    /api/tenants/{id}/agency-access/  (L8/L9)  lista L8s asignados
"""
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.models import AgencyTenantAccess, User
from apps.core.permissions import RequireLevel

from .models import Tenant
from .serializers import AgencyTenantAccessSerializer, TenantSerializer


class TenantViewSet(viewsets.ModelViewSet):
    """CRUD de tenants + agency access actions."""

    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        # Mutaciones: solo L9. Read: cualquier autenticado (filtrado por queryset).
        if self.action in ('create', 'update', 'partial_update', 'destroy',
                           'grant_agency', 'revoke_agency'):
            return [IsAuthenticated(), RequireLevel(9)()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = Tenant.objects.all().order_by('name')

        if user.level == 9:
            return qs
        if user.level == 8:
            return qs.filter(agency_users__user=user).distinct()
        # L0-L7: solo su propio tenant
        if user.tenant_id:
            return qs.filter(pk=user.tenant_id)
        return Tenant.objects.none()

    # --- Agency access actions -----------------------------------------------

    @action(detail=True, methods=['get'], url_path='agency-access')
    def agency_access(self, request, pk=None):
        """Lista los L8 que tienen acceso a este tenant."""
        tenant = self.get_object()
        accesses = (
            AgencyTenantAccess.objects
            .filter(tenant=tenant)
            .select_related('user', 'granted_by')
            .order_by('user__email')
        )
        return Response(AgencyTenantAccessSerializer(accesses, many=True).data)

    @action(detail=True, methods=['post'], url_path='grant-agency')
    def grant_agency(self, request, pk=None):
        """Asigna a un usuario L8 acceso a este tenant. Solo L9."""
        tenant = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            raise ValidationError({'user_id': 'Requerido.'})

        try:
            target = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            raise NotFound('Usuario no encontrado.')

        if target.level != 8:
            raise ValidationError({
                'user_id': f'El usuario debe ser nivel 8 (es L{target.level}).',
            })

        access, created = AgencyTenantAccess.objects.get_or_create(
            user=target,
            tenant=tenant,
            defaults={'granted_by': request.user},
        )
        return Response(
            AgencyTenantAccessSerializer(access).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    @action(detail=True, methods=['post'], url_path='revoke-agency')
    def revoke_agency(self, request, pk=None):
        """Revoca el acceso de un L8 a este tenant. Solo L9."""
        tenant = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            raise ValidationError({'user_id': 'Requerido.'})

        deleted, _ = AgencyTenantAccess.objects.filter(
            user_id=user_id, tenant=tenant,
        ).delete()

        if deleted == 0:
            raise NotFound('El usuario no tiene acceso a este tenant.')

        return Response(status=status.HTTP_204_NO_CONTENT)
