"""
ViewSet de tenants: /api/tenants/*.

Scopes:
- L9: ve todos los tenants, puede crear/editar/borrar.
- L8: ve solo los que su agencia tiene asignados (AgencyTenantAccess). Read-only.
- L0-L7: ve solo el suyo. Read-only.

Acciones custom:
- POST   /api/tenants/{id}/grant-agency/   (L9)  body {agency_id}
- POST   /api/tenants/{id}/revoke-agency/  (L9)  body {agency_id}
- GET    /api/tenants/{id}/agency-access/  (L8/L9)  lista agencias asignadas
"""
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.models import AgencyTenantAccess
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
            if not user.agency_id:
                return Tenant.objects.none()
            return qs.filter(agency_access__agency_id=user.agency_id).distinct()
        # L0-L7: solo su propio tenant
        if user.tenant_id:
            return qs.filter(pk=user.tenant_id)
        return Tenant.objects.none()

    # --- Agency access actions -----------------------------------------------

    @action(detail=True, methods=['get'], url_path='agency-access')
    def agency_access(self, request, pk=None):
        """Lista las agencias que tienen acceso a este tenant."""
        tenant = self.get_object()
        accesses = (
            AgencyTenantAccess.objects
            .filter(tenant=tenant)
            .select_related('agency', 'granted_by')
            .order_by('agency__name')
        )
        return Response(AgencyTenantAccessSerializer(accesses, many=True).data)

    @action(detail=True, methods=['post'], url_path='grant-agency')
    def grant_agency(self, request, pk=None):
        """Asigna a una agencia acceso a este tenant. Solo L9."""
        tenant = self.get_object()
        agency_id = request.data.get('agency_id')
        if not agency_id:
            raise ValidationError({'agency_id': 'Requerido.'})

        try:
            agency = Tenant.objects.get(pk=agency_id)
        except Tenant.DoesNotExist:
            raise NotFound('Agencia no encontrada.')

        if agency.type != Tenant.Type.AGENCY:
            raise ValidationError({
                'agency_id': 'El tenant seleccionado no es de tipo agencia.',
            })
        if agency_id == tenant.id:
            raise ValidationError({
                'agency_id': 'Una agencia no puede gestionarse a si misma.',
            })

        access, created = AgencyTenantAccess.objects.get_or_create(
            agency=agency,
            tenant=tenant,
            defaults={'granted_by': request.user},
        )
        return Response(
            AgencyTenantAccessSerializer(access).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    @action(detail=True, methods=['post'], url_path='revoke-agency')
    def revoke_agency(self, request, pk=None):
        """Revoca el acceso de una agencia a este tenant. Solo L9."""
        tenant = self.get_object()
        agency_id = request.data.get('agency_id')
        if not agency_id:
            raise ValidationError({'agency_id': 'Requerido.'})

        deleted, _ = AgencyTenantAccess.objects.filter(
            agency_id=agency_id, tenant=tenant,
        ).delete()

        if deleted == 0:
            raise NotFound('La agencia no tiene acceso a este tenant.')

        return Response(status=status.HTTP_204_NO_CONTENT)
