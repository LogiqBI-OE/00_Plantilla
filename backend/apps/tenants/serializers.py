"""Serializers de la app `tenants`."""
from rest_framework import serializers

from apps.accounts.models import AgencyTenantAccess

from .models import Tenant


class TenantSerializer(serializers.ModelSerializer):
    """Tenant completo para CRUD."""

    class Meta:
        model = Tenant
        fields = ['id', 'slug', 'name', 'type', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_slug(self, value: str) -> str:
        value = value.strip().lower()
        qs = Tenant.objects.filter(slug__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Este slug ya esta en uso.')
        return value


class AgencyTenantAccessSerializer(serializers.ModelSerializer):
    """Membership agencia -> tenant cliente."""

    agency_slug = serializers.CharField(source='agency.slug', read_only=True)
    agency_name = serializers.CharField(source='agency.name', read_only=True)
    granted_by_email = serializers.CharField(
        source='granted_by.email', read_only=True, default=None,
    )

    class Meta:
        model = AgencyTenantAccess
        fields = [
            'id', 'agency', 'agency_slug', 'agency_name',
            'granted_by', 'granted_by_email', 'granted_at',
        ]
        read_only_fields = ['id', 'granted_by', 'granted_at']
