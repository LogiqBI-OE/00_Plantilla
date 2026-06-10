"""
Endpoints de niveles y matriz de permisos.

- GET   /api/levels/             lista niveles + matriz + catalogo de permisos
- PATCH /api/levels/{level}/     editar label/description/is_reserved (L9)
- PUT   /api/levels/matrix/      reemplaza matriz completa (L9)
"""
from django.db import transaction
from rest_framework import status
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import RequireLevel

from .defaults import PERMISSION_CATALOG
from .models import Level, PermissionMatrix


def _serialize_levels_and_matrix() -> dict:
    """Devuelve el payload completo: niveles + matriz + catalogo."""
    levels = list(Level.objects.all().order_by('level'))
    matrix_qs = PermissionMatrix.objects.all()
    matrix_by_level: dict[int, list[dict]] = {}
    for entry in matrix_qs:
        matrix_by_level.setdefault(entry.level, []).append({
            'permission_code': entry.permission_code,
            'allowed': entry.allowed,
        })

    return {
        'levels': [
            {
                'level': lv.level,
                'label': lv.label,
                'description': lv.description,
                'is_reserved': lv.is_reserved,
                'permissions': sorted(
                    matrix_by_level.get(lv.level, []),
                    key=lambda x: x['permission_code'],
                ),
            }
            for lv in levels
        ],
        'permission_catalog': [
            {
                'key': code,
                'label_es': labels[0],
                'label_en': labels[1],
                'label_ko': labels[2],
                'description': labels[3],
            }
            for code, labels in sorted(PERMISSION_CATALOG.items())
        ],
    }


class LevelsView(APIView):
    """GET niveles + matriz."""

    permission_classes = [IsAuthenticated]

    def get(self, _request):
        return Response(_serialize_levels_and_matrix())


class LevelDetailView(APIView):
    """PATCH metadata de un nivel (L9 only)."""

    permission_classes = [IsAuthenticated, RequireLevel(9)]

    def patch(self, request, level: int):
        try:
            obj = Level.objects.get(level=level)
        except Level.DoesNotExist:
            raise NotFound(f'Nivel L{level} no existe.')

        for field in ('label', 'description', 'is_reserved'):
            if field in request.data:
                setattr(obj, field, request.data[field])
        obj.save()

        return Response(_serialize_levels_and_matrix())


class MatrixView(APIView):
    """
    PUT /api/levels/matrix/  (L9 only)

    Body: { matrix: [{level: int, permission_code: str, allowed: bool}, ...] }

    Reemplaza la matriz completa de forma atomica. Solo acepta codigos del
    catalogo (PERMISSION_CATALOG).
    """

    permission_classes = [IsAuthenticated, RequireLevel(9)]

    def put(self, request):
        matrix = request.data.get('matrix')
        if not isinstance(matrix, list):
            raise ValidationError({'matrix': 'Se espera una lista.'})

        valid_codes = set(PERMISSION_CATALOG.keys())
        cleaned: list[tuple[int, str, bool]] = []
        seen: set[tuple[int, str]] = set()

        for idx, row in enumerate(matrix):
            if not isinstance(row, dict):
                raise ValidationError({f'matrix[{idx}]': 'Debe ser un objeto.'})
            level_val = row.get('level')
            code = row.get('permission_code')
            allowed = row.get('allowed')
            if not isinstance(level_val, int) or not 0 <= level_val <= 9:
                raise ValidationError({f'matrix[{idx}].level': 'Entero 0-9.'})
            if not isinstance(code, str) or code not in valid_codes:
                raise ValidationError({
                    f'matrix[{idx}].permission_code': f'No esta en el catalogo.',
                })
            if not isinstance(allowed, bool):
                raise ValidationError({f'matrix[{idx}].allowed': 'Booleano.'})
            key = (level_val, code)
            if key in seen:
                raise ValidationError({
                    f'matrix[{idx}]': f'Duplicado (level={level_val}, code={code}).',
                })
            seen.add(key)
            cleaned.append((level_val, code, allowed))

        with transaction.atomic():
            PermissionMatrix.objects.all().delete()
            PermissionMatrix.objects.bulk_create([
                PermissionMatrix(level=lv, permission_code=code, allowed=allowed)
                for lv, code, allowed in cleaned
            ])

        return Response(_serialize_levels_and_matrix(), status=status.HTTP_200_OK)
