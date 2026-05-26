"""
Permission classes factories para DRF.

Uso:
    from apps.core.permissions import RequireLevel, HasPermission

    class TenantListView(APIView):
        permission_classes = [IsAuthenticated, RequireLevel(8)]

    class CreateUserView(APIView):
        permission_classes = [IsAuthenticated, HasPermission('manage_users')]

Las clases son factories (devuelven una clase) porque DRF instancia
los permission_classes sin argumentos. Asi RequireLevel(8) -> clase
que se puede usar en la lista.
"""
from rest_framework.permissions import BasePermission


def RequireLevel(min_level: int):
    """
    Devuelve una permission class que exige `user.level >= min_level`.

    Ejemplo: `RequireLevel(9)` solo permite a L9.
             `RequireLevel(8)` permite a L8 y L9.
    """

    class _RequireLevel(BasePermission):
        message = f'Requiere nivel L{min_level} o superior.'

        def has_permission(self, request, view):
            user = getattr(request, 'user', None)
            if not user or not user.is_authenticated:
                return False
            return user.level >= min_level

    _RequireLevel.__name__ = f'RequireLevel{min_level}'
    _RequireLevel.__qualname__ = _RequireLevel.__name__
    return _RequireLevel


def HasPermission(code: str):
    """
    Devuelve una permission class que verifica `user.has_permission(code)`.

    Evalua la matriz global + overrides del usuario (ver
    `accounts.User.has_permission`).
    """

    class _HasPermission(BasePermission):
        message = f'Requiere el permiso "{code}".'

        def has_permission(self, request, view):
            user = getattr(request, 'user', None)
            if not user or not user.is_authenticated:
                return False
            return user.has_permission(code)

    _HasPermission.__name__ = f'HasPermission_{code}'
    _HasPermission.__qualname__ = _HasPermission.__name__
    return _HasPermission


class IsPlatformAdmin(BasePermission):
    """
    Permite acceso solo en modo platform (request.tenant es None y user es L9).

    Util para endpoints de la consola LogiQ (/api/platform/*).
    """
    message = 'Requiere consola plataforma (L9 sin tenant activo).'

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return user.level == 9 and getattr(request, 'tenant', None) is None
