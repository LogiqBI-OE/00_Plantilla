"""Serializers de audit."""
from rest_framework import serializers

from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True, default=None)
    tenant_slug = serializers.CharField(source='tenant.slug', read_only=True, default=None)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'tenant', 'tenant_slug',
            'user', 'user_email',
            'action', 'target_type', 'target_id',
            'metadata', 'created_at',
        ]
        read_only_fields = fields
