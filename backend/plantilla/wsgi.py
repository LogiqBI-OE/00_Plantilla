"""WSGI entrypoint para servidores de produccion (gunicorn, etc.)."""
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plantilla.settings')
application = get_wsgi_application()
