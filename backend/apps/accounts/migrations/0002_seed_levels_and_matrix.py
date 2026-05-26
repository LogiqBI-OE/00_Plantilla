"""
Data migration: seed inicial de Levels y PermissionMatrix.

Idempotente: si los registros ya existen no los pisa. Solo crea los que
faltan. Asi una nueva instalacion arranca con un catalogo razonable, y
ediciones manuales sobreviven a futuras migraciones.
"""
from django.db import migrations


def seed(apps, _schema_editor):
    Level = apps.get_model('accounts', 'Level')
    PermissionMatrix = apps.get_model('accounts', 'PermissionMatrix')

    # Import dentro de la funcion para que la migracion sea importable
    # incluso si el modulo defaults cambia despues.
    from apps.accounts.defaults import LEVEL_DEFAULTS, MATRIX_DEFAULTS, PERMISSION_CATALOG

    for level, label, description, is_reserved in LEVEL_DEFAULTS:
        Level.objects.get_or_create(
            level=level,
            defaults={
                'label': label,
                'description': description,
                'is_reserved': is_reserved,
            },
        )

    # PermissionMatrix: una fila por (level, code) con allowed=True solo donde
    # el codigo esta en el set del nivel. El resto queda en False (default del
    # campo) si no existe la fila — `has_permission` la trata como denied.
    for code in PERMISSION_CATALOG:
        allowed_levels = MATRIX_DEFAULTS.get(code, set())
        for level_value, *_ in LEVEL_DEFAULTS:
            allowed = level_value in allowed_levels
            PermissionMatrix.objects.get_or_create(
                level=level_value,
                permission_code=code,
                defaults={'allowed': allowed},
            )


def unseed(apps, _schema_editor):
    Level = apps.get_model('accounts', 'Level')
    PermissionMatrix = apps.get_model('accounts', 'PermissionMatrix')
    PermissionMatrix.objects.all().delete()
    Level.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed, reverse_code=unseed),
    ]
