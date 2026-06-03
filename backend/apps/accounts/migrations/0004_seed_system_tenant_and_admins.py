"""
Seed por defecto: tenant de sistema LogiQ + usuarios L9 iniciales.

Idempotente: usa update_or_create / get_or_create, asi correr migrate
varias veces (o sobre una DB que ya los tenga) no duplica ni rompe.

NOTA DE SEGURIDAD: la contrasena por defecto (`logiqcrm`) queda en el
historial del repo. Es una credencial inicial — cambiala tras el primer
login en cualquier despliegue real.
"""
from django.contrib.auth.hashers import make_password
from django.db import migrations

SYSTEM_TENANT = {'slug': 'logiq', 'name': 'LogiQ', 'type': 'system'}

DEFAULT_PASSWORD = 'logiqcrm'
ADMINS = [
    {
        'email': 'orlando@logiqbi.com', 'username': 'orlando',
        'first_name': 'Orlando', 'last_name_paterno': 'Elizondo',
    },
    {
        'email': 'rogelio@logiqbi.com', 'username': 'rogelio',
        'first_name': 'Rogelio', 'last_name_paterno': '',
    },
]


def seed(apps, schema_editor):
    Tenant = apps.get_model('tenants', 'Tenant')
    User = apps.get_model('accounts', 'User')

    # Tenant de sistema (puede existir ya como tipo 'cliente' tras agregar el
    # campo type -> lo normalizamos a 'system').
    Tenant.objects.update_or_create(
        slug=SYSTEM_TENANT['slug'],
        defaults={
            'name': SYSTEM_TENANT['name'],
            'type': SYSTEM_TENANT['type'],
            'is_active': True,
        },
    )

    for a in ADMINS:
        User.objects.get_or_create(
            email=a['email'],
            defaults={
                'username': a['username'],
                'first_name': a['first_name'],
                'last_name_paterno': a['last_name_paterno'],
                'level': 9,
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
                'tenant': None,
                'password': make_password(DEFAULT_PASSWORD),
            },
        )


def unseed(apps, schema_editor):
    # No-op: no se borran datos sembrados al revertir.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_agency_user_agency_agencylicense'),
        ('tenants', '0003_tenant_type'),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]
