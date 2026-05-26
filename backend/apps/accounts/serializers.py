"""
Serializers de la app `accounts`.

Por ahora solo serializers livianos para auth (login, me, switch-tenant).
Los serializers de CRUD de usuarios viven en `views.py` (commit 6).
"""
from rest_framework import serializers

from apps.tenants.models import Tenant

from .models import PermissionMatrix, User


class TenantBriefSerializer(serializers.ModelSerializer):
    """Tenant minimo para responses de auth."""

    class Meta:
        model = Tenant
        fields = ['id', 'slug', 'name', 'is_active']
        read_only_fields = fields


class UserBriefSerializer(serializers.ModelSerializer):
    """User basico sin permisos calculados (mas barato para listas)."""

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username',
            'first_name', 'last_name_paterno', 'last_name_materno', 'full_name',
            'level', 'preferred_language', 'is_active',
        ]
        read_only_fields = fields


class UserWithPermissionsSerializer(UserBriefSerializer):
    """
    User con sus permisos efectivos resueltos (matriz + overrides).

    Usado en /api/auth/login y /api/auth/me para que el frontend pueda
    mostrar/ocultar UI segun permisos sin hacer un round trip extra.
    """

    permissions = serializers.SerializerMethodField()

    class Meta(UserBriefSerializer.Meta):
        fields = UserBriefSerializer.Meta.fields + ['permissions']

    def get_permissions(self, obj: User) -> list[str]:
        # Codigos permitidos por la matriz para el nivel del usuario.
        codes = set(
            PermissionMatrix.objects.filter(level=obj.level, allowed=True)
            .values_list('permission_code', flat=True)
        )
        # Overrides ganan: True agrega, False quita.
        for override in obj.permission_overrides.all():
            if override.allowed:
                codes.add(override.permission_code)
            else:
                codes.discard(override.permission_code)
        return sorted(codes)
