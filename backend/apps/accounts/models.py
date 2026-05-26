"""
Modelos de la app `accounts`.

Define el sistema de autenticacion y autorizacion:
- `User`: usuario con email + jerarquia L0-L9 + tenant opcional
- `Level`: catalogo editable de niveles (label, description, is_reserved)
- `PermissionMatrix`: matriz global nivel x permiso
- `UserPermissionOverride`: override por-usuario (gana sobre la matriz)
- `AgencyTenantAccess`: a que tenants accede un usuario L8 (agencia)

Ver SKELETON_GUIDE.md secciones "Multi-tenancy y niveles" y "Modelo de datos".
"""
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils.translation import gettext_lazy as _

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """
    Usuario del sistema. Email como identificador (USERNAME_FIELD).

    Niveles:
        - L9 global: tenant=None, acceso a todos los tenants
        - L8 agencia: tenant=None, acceso a un subconjunto (AgencyTenantAccess)
        - L0-L7 single-tenant: tenant=<FK>, solo accede a ese tenant

    Permisos efectivos:
        UserPermissionOverride (si existe) gana sobre PermissionMatrix[level].
    """

    email = models.EmailField(
        unique=True,
        help_text=_('Correo electronico. Usado como identificador para login.'),
    )
    username = models.CharField(
        max_length=64,
        unique=True,
        null=True,
        blank=True,
        help_text=_('Alias opcional, lowercase. Tambien acepta como identificador.'),
    )

    first_name = models.CharField(max_length=64)
    last_name_paterno = models.CharField(max_length=64)
    last_name_materno = models.CharField(max_length=64, blank=True)

    level = models.IntegerField(
        default=0,
        help_text=_('Nivel jerarquico 0-9.'),
    )
    tenant = models.ForeignKey(
        'tenants.Tenant',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='users',
        help_text=_('Tenant al que pertenece. NULL para L8 (agencia) y L9 (global).'),
    )

    preferred_language = models.CharField(
        max_length=4,
        choices=[('es', _('Espanol')), ('en', _('English'))],
        default='es',
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(
        default=False,
        help_text=_('Si puede ingresar al Django admin.'),
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name_paterno']

    class Meta:
        ordering = ['email']
        verbose_name = _('Usuario')
        verbose_name_plural = _('Usuarios')

    def __str__(self) -> str:
        return self.email

    @property
    def full_name(self) -> str:
        parts = [self.first_name, self.last_name_paterno, self.last_name_materno]
        return ' '.join(p for p in parts if p)

    def get_full_name(self) -> str:
        return self.full_name

    def get_short_name(self) -> str:
        return self.first_name

    def has_permission(self, code: str) -> bool:
        """
        Permiso efectivo del usuario para un codigo dado.

        Orden de evaluacion:
        1. Si hay UserPermissionOverride para (user, code) -> usa su `allowed`.
        2. Si no, busca en PermissionMatrix (level, code) -> True si `allowed=True`.
        3. Si no hay ninguna fila -> False (denied by default).
        """
        override = self.permission_overrides.filter(permission_code=code).first()
        if override:
            return override.allowed
        return PermissionMatrix.objects.filter(
            level=self.level,
            permission_code=code,
            allowed=True,
        ).exists()


class Level(models.Model):
    """Catalogo editable de niveles. Pre-cargado con L0-L9."""

    level = models.IntegerField(primary_key=True)
    label = models.CharField(
        max_length=64,
        help_text=_('Nombre visible del nivel (ej. "Operador", "Supervisor").'),
    )
    description = models.TextField(blank=True)
    is_reserved = models.BooleanField(
        default=False,
        help_text=_('Si True, este nivel esta oculto del selector al crear/editar usuarios.'),
    )

    class Meta:
        ordering = ['level']
        verbose_name = _('Nivel')
        verbose_name_plural = _('Niveles')

    def __str__(self) -> str:
        return f'L{self.level} - {self.label}'


class PermissionMatrix(models.Model):
    """
    Matriz global nivel x codigo_de_permiso.

    Una sola matriz para toda la instancia (decision: matriz global, no por-tenant).
    Editable solo por L9 desde Global Settings.
    """

    level = models.IntegerField()
    permission_code = models.CharField(max_length=64)
    allowed = models.BooleanField(default=False)

    class Meta:
        unique_together = [('level', 'permission_code')]
        ordering = ['level', 'permission_code']
        verbose_name = _('Permiso de nivel')
        verbose_name_plural = _('Matriz de permisos')

    def __str__(self) -> str:
        return f'L{self.level}: {self.permission_code} = {self.allowed}'


class UserPermissionOverride(models.Model):
    """
    Override por-usuario que gana sobre la matriz global.

    Si `allowed=True`: este usuario tiene el permiso aunque su nivel no lo de.
    Si `allowed=False`: este usuario NO tiene el permiso aunque su nivel si lo de.
    """

    user = models.ForeignKey(
        User,
        related_name='permission_overrides',
        on_delete=models.CASCADE,
    )
    permission_code = models.CharField(max_length=64)
    allowed = models.BooleanField()

    class Meta:
        unique_together = [('user', 'permission_code')]
        ordering = ['user', 'permission_code']
        verbose_name = _('Override de permiso de usuario')
        verbose_name_plural = _('Overrides de permisos de usuario')

    def __str__(self) -> str:
        verb = 'grant' if self.allowed else 'deny'
        return f'{self.user.email}: {verb} {self.permission_code}'


class AgencyTenantAccess(models.Model):
    """
    Asigna a un usuario L8 (agencia) acceso a un subconjunto de tenants.

    Solo L9 puede crear/borrar estas filas (controla quien administra que tenants).
    Si user.level != 8 la fila no tiene efecto (validacion en serializer).
    """

    user = models.ForeignKey(
        User,
        related_name='agency_access',
        on_delete=models.CASCADE,
        help_text=_('Usuario L8 al que se le otorga acceso.'),
    )
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='agency_users',
    )
    granted_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+',
        help_text=_('L9 que otorgo el acceso (auditoria).'),
    )
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('user', 'tenant')]
        ordering = ['user', 'tenant']
        verbose_name = _('Acceso de agencia a tenant')
        verbose_name_plural = _('Accesos de agencia a tenants')

    def __str__(self) -> str:
        return f'{self.user.email} -> {self.tenant.slug}'
