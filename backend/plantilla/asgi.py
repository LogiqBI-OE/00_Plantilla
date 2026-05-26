"""ASGI entrypoint (preparado para websockets/async si se necesitan a futuro)."""
import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plantilla.settings')
application = get_asgi_application()
