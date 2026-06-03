"""
Serializers de la app `accounts`.

- TenantBriefSerializer / UserBriefSerializer / UserWithPermissionsSerializer:
    para responses de auth (login, me, switch-tenant).
- UserCreateSerializer / UserUpdateSerializer / UserDetailSerializer:
    para el CRUD bajo /api/users/* (views.UserViewSet).
"""
from rest_framework import serializers

from apps.tenants.models import Tenant

from .models import PermissionMatrix, User


class TenantBriefSerializer(serializers.ModelSerializer):
    """Tenant minimo para responses de auth."""

    class Meta:
        model = Tenant
        fields = ['id', 'slug', 'name', 'type', 'is_active']
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


# --- Serializers para CRUD de usuarios (UserViewSet) -------------------------


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para POST /api/users/.

    `tenant` NO se acepta del body — lo setea la view desde request.tenant
    (o None para L8/L9). Esto previene cross-tenant pollution.
    """

    password = serializers.CharField(write_only=True, required=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'email', 'username', 'password',
            'first_name', 'last_name_paterno', 'last_name_materno',
            'level', 'preferred_language',
        ]

    def validate_email(self, value: str) -> str:
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Este email ya esta registrado.')
        return value

    def validate_username(self, value: str | None) -> str | None:
        if not value:
            return None
        value = value.strip().lower()
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('Este username ya esta en uso.')
        return value

    def validate_level(self, value: int) -> int:
        if not 0 <= value <= 9:
            raise serializers.ValidationError('level debe estar entre 0 y 9.')
        return value

    def create(self, validated_data: dict) -> User:
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para PATCH /api/users/{id}/.

    No permite cambiar email (requiere flujo de verificacion aparte) ni
    tenant (multi-tenancy es inmutable post-creacion).
    """

    class Meta:
        model = User
        fields = [
            'username',
            'first_name', 'last_name_paterno', 'last_name_materno',
            'level', 'preferred_language', 'is_active',
        ]

    def validate_username(self, value: str | None) -> str | None:
        if not value:
            return None
        value = value.strip().lower()
        existing = User.objects.filter(username__iexact=value).exclude(
            pk=self.instance.pk if self.instance else None
        )
        if existing.exists():
            raise serializers.ValidationError('Este username ya esta en uso.')
        return value

    def validate_level(self, value: int) -> int:
        if not 0 <= value <= 9:
            raise serializers.ValidationError('level debe estar entre 0 y 9.')
        return value


class UserDetailSerializer(UserBriefSerializer):
    """
    Serializer para GET /api/users/ (lista) y GET /api/users/{id}/ (detalle).

    Incluye overrides explicitos (no solo permisos efectivos) para que
    la UI pueda mostrarlos y editarlos uno-a-uno en la pantalla del usuario.
    """

    overrides = serializers.SerializerMethodField()
    tenant = TenantBriefSerializer(read_only=True)

    class Meta(UserBriefSerializer.Meta):
        fields = UserBriefSerializer.Meta.fields + ['tenant', 'overrides']

    def get_overrides(self, obj: User) -> list[dict]:
        return [
            {'permission_code': o.permission_code, 'allowed': o.allowed}
            for o in obj.permission_overrides.all()
        ]
