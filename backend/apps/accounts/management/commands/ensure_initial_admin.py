"""
Management command: crea un superuser L9 inicial si no existe ninguno.

Idempotente: si ya hay al menos un usuario L9, no hace nada (silencio).
Si no, lee las env vars INITIAL_ADMIN_* y crea el usuario.

Pensado para que corra en entrypoint.sh al boot del container. Asi
deployando con las env vars seteadas se obtiene un usuario L9 sin
necesidad de shell access.

Despues del primer deploy exitoso, el usuario debe borrar las env vars
para que la contrasena no quede expuesta como variable de entorno.

Uso:
    python manage.py ensure_initial_admin

Env vars leidas:
    INITIAL_ADMIN_EMAIL              (requerida)
    INITIAL_ADMIN_PASSWORD           (requerida)
    INITIAL_ADMIN_USERNAME           (opcional)
    INITIAL_ADMIN_FIRST_NAME         (default "Admin")
    INITIAL_ADMIN_LAST_NAME_PATERNO  (default "")
    INITIAL_ADMIN_LAST_NAME_MATERNO  (default "")
"""
import os

from django.core.management.base import BaseCommand

from apps.accounts.models import User


class Command(BaseCommand):
    help = 'Crea un superuser L9 inicial desde env vars si no existe ninguno.'

    def handle(self, *_args, **_options):
        # Si ya hay un L9, no hacer nada (idempotente).
        if User.objects.filter(level=9).exists():
            self.stdout.write('Ya existe al menos un usuario L9 — skip.')
            return

        email = os.environ.get('INITIAL_ADMIN_EMAIL', '').strip().lower()
        password = os.environ.get('INITIAL_ADMIN_PASSWORD', '')

        if not email or not password:
            self.stdout.write(
                'INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD no configuradas — skip. '
                'Configurarlas en env vars y re-deployar para crear el admin inicial.'
            )
            return

        # Si por algun motivo ya existe un user con ese email (pero no L9),
        # no lo pisamos.
        if User.objects.filter(email__iexact=email).exists():
            self.stdout.write(
                f'Ya existe un usuario con email {email} (nivel < 9). '
                f'Borra esa cuenta o cambia el email del admin inicial.'
            )
            return

        username = os.environ.get('INITIAL_ADMIN_USERNAME', '').strip().lower() or None
        first_name = os.environ.get('INITIAL_ADMIN_FIRST_NAME', 'Admin').strip()
        last_paterno = os.environ.get('INITIAL_ADMIN_LAST_NAME_PATERNO', '').strip()
        last_materno = os.environ.get('INITIAL_ADMIN_LAST_NAME_MATERNO', '').strip()

        user = User.objects.create_superuser(
            email=email,
            password=password,
            first_name=first_name,
            last_name_paterno=last_paterno or 'Admin',
            last_name_materno=last_materno,
        )
        if username:
            user.username = username
            user.save(update_fields=['username'])

        self.stdout.write(self.style.SUCCESS(
            f'L9 inicial creado: {user.email}. '
            f'RECUERDA borrar las env vars INITIAL_ADMIN_* despues del primer login.'
        ))
