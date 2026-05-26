"""
ViewSet de usuarios: /api/users/*.

Comportamiento por nivel:
    - L9 en modo platform (request.tenant=None) -> ve y administra L8/L9
      (usuarios cross-tenant). Solo L9 puede crear L8/L9.
    - L9 o L8 dentro de un tenant -> administran usuarios L0-L7 del tenant.
    - L5-L7 dentro de un tenant -> administran usuarios con level <= self.level
      del mismo tenant.
    - L0-L4 -> sin acceso (gate: RequireLevel(5)).

Jerarquia estricta:
    - LIST y RETRIEVE: ven usuarios con level <= self.level.
    - CREATE: pueden crear usuarios con level <= self.level.
    - UPDATE/DELETE/RESET: solo target.level < self.level (no peers ni superiores).
    - Un usuario no puede borrarse a si mismo.

TODO commit 9: cambiar `RequireLevel(5)` por `HasPermission('manage_users')`
una vez que SystemConfig + seed de la matriz esten en su lugar.
"""
from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.audit.services import log_action
from apps.core.permissions import RequireLevel
from apps.system_config.defaults import get_value as get_config

from .models import User, UserPermissionOverride
from .serializers import (
    UserCreateSerializer,
    UserDetailSerializer,
    UserUpdateSerializer,
)


class UserViewSet(viewsets.ModelViewSet):
    """CRUD jerarquico de usuarios + acciones reset_password / set_permissions."""

    permission_classes = [IsAuthenticated, RequireLevel(5)]

    def get_queryset(self):
        request = self.request
        self_user = request.user

        if request.tenant is None:
            # Modo platform (solo L9 sin tenant activo): cross-tenant admins.
            if self_user.level < 9:
                return User.objects.none()
            qs = User.objects.filter(tenant__isnull=True, level__lte=self_user.level)
        else:
            # Modo tenant: usuarios de ese tenant con nivel <= self.level.
            qs = User.objects.filter(
                tenant=request.tenant,
                level__lte=self_user.level,
            )

        return (
            qs.select_related('tenant')
            .prefetch_related('permission_overrides')
            .order_by('-level', 'email')
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        if self.action in ('update', 'partial_update'):
            return UserUpdateSerializer
        return UserDetailSerializer

    def create(self, request, *args, **kwargs):
        """Override para devolver el detalle completo (id + tenant + overrides)."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        detail = UserDetailSerializer(serializer.instance)
        return Response(detail.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Override para devolver el detalle completo despues de PATCH/PUT."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        detail = UserDetailSerializer(serializer.instance)
        return Response(detail.data)

    # --- Hooks de creacion/edicion/borrado --------------------------------

    def perform_create(self, serializer):
        request = self.request
        target_level = serializer.validated_data.get('level', 0)

        if target_level > request.user.level:
            raise PermissionDenied(
                'No puedes crear usuarios de nivel superior al tuyo.'
            )

        if target_level >= 8:
            # Crear admins cross-tenant: solo L9 desde modo platform.
            if request.user.level < 9:
                raise PermissionDenied('Solo L9 puede crear usuarios L8 o L9.')
            if request.tenant is not None:
                raise PermissionDenied(
                    'Para crear L8/L9, primero pasa a modo platform '
                    '(sin tenant activo).'
                )
            serializer.save(tenant=None)
            log_action(
                actor=request.user, tenant=None, action='user.created',
                target=serializer.instance,
                metadata={'email': serializer.instance.email, 'level': target_level},
            )
            return

        # L0-L7: deben pertenecer al tenant del request.
        if request.tenant is None:
            raise PermissionDenied(
                'Para crear usuarios L0-L7, primero entra a un tenant especifico.'
            )
        serializer.save(tenant=request.tenant)
        log_action(
            actor=request.user, tenant=request.tenant, action='user.created',
            target=serializer.instance,
            metadata={'email': serializer.instance.email, 'level': target_level},
        )

    def perform_update(self, serializer):
        instance = self.get_object()
        request = self.request

        # No puedes modificar pares ni superiores (excepto a ti mismo).
        if instance.id != request.user.id and instance.level >= request.user.level:
            raise PermissionDenied(
                'No puedes modificar usuarios de tu mismo o mayor nivel.'
            )

        # No puedes asignar un level superior al tuyo.
        new_level = serializer.validated_data.get('level')
        if new_level is not None and new_level > request.user.level:
            raise PermissionDenied(
                'No puedes asignar un nivel superior al tuyo.'
            )

        # No te puedes degradar a ti mismo (evita lock-out).
        if (
            instance.id == request.user.id
            and new_level is not None
            and new_level < request.user.level
        ):
            raise PermissionDenied('No puedes reducir tu propio nivel.')

        serializer.save()

    def perform_destroy(self, instance):
        request = self.request

        if instance.id == request.user.id:
            raise PermissionDenied('No puedes borrarte a ti mismo.')

        if instance.level >= request.user.level:
            raise PermissionDenied(
                'No puedes borrar usuarios de tu mismo o mayor nivel.'
            )

        log_action(
            actor=request.user, tenant=instance.tenant, action='user.deleted',
            target=instance,
            metadata={'email': instance.email, 'level': instance.level},
        )
        instance.delete()

    # --- Acciones custom --------------------------------------------------

    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        """
        POST /api/users/{id}/reset-password/

        Aplica la contrasena estandar al usuario y la devuelve en la response
        para que el admin pueda comunicarsela al usuario afectado.
        """
        target = self.get_object()

        if target.id == request.user.id:
            raise PermissionDenied(
                'Para cambiar tu propia contrasena usa el flujo de account settings.'
            )
        if target.level >= request.user.level:
            raise PermissionDenied(
                'No puedes resetear contrasena de usuarios de tu mismo o mayor nivel.'
            )

        standard = get_config('standard_password')
        target.set_password(standard)
        target.save(update_fields=['password'])

        log_action(
            actor=request.user, tenant=target.tenant, action='user.password_reset',
            target=target, metadata={'email': target.email},
        )

        return Response({
            'detail': 'Contrasena reseteada.',
            'standard_password': standard,
        })

    @action(detail=True, methods=['post'], url_path='permissions')
    def set_permissions(self, request, pk=None):
        """
        POST /api/users/{id}/permissions/

        Body: { overrides: [{permission_code: str, allowed: bool}, ...] }

        Reemplaza el set completo de overrides del usuario (idempotente).
        Lista vacia = sin overrides (queda con la matriz pura de su nivel).
        """
        target = self.get_object()

        if target.level >= request.user.level:
            raise PermissionDenied(
                'No puedes modificar permisos de usuarios de tu mismo o mayor nivel.'
            )

        overrides = request.data.get('overrides')
        if not isinstance(overrides, list):
            raise ValidationError({'overrides': 'Se espera una lista.'})

        # Validar formato de cada override antes de tocar la DB.
        cleaned: list[tuple[str, bool]] = []
        seen_codes: set[str] = set()
        for idx, o in enumerate(overrides):
            if not isinstance(o, dict):
                raise ValidationError({f'overrides[{idx}]': 'Debe ser un objeto.'})
            code = o.get('permission_code')
            allowed = o.get('allowed')
            if not isinstance(code, str) or not code:
                raise ValidationError(
                    {f'overrides[{idx}].permission_code': 'String no vacio.'}
                )
            if not isinstance(allowed, bool):
                raise ValidationError(
                    {f'overrides[{idx}].allowed': 'Debe ser booleano.'}
                )
            if code in seen_codes:
                raise ValidationError(
                    {f'overrides[{idx}].permission_code': f'Duplicado: {code}.'}
                )
            seen_codes.add(code)
            cleaned.append((code, allowed))

        # Reemplazo atomico.
        with transaction.atomic():
            target.permission_overrides.all().delete()
            UserPermissionOverride.objects.bulk_create([
                UserPermissionOverride(
                    user=target,
                    permission_code=code,
                    allowed=allowed,
                )
                for code, allowed in cleaned
            ])

        # Devolver el estado final.
        target.refresh_from_db()
        return Response(
            UserDetailSerializer(target).data,
            status=status.HTTP_200_OK,
        )
