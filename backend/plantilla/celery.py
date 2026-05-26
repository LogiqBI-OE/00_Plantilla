"""Celery app — tareas asincronas (envio de correos, WhatsApp, etc.)."""
import os

from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plantilla.settings')

app = Celery('plantilla')

# Lee configuracion desde settings.py con prefijo CELERY_
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-descubre tasks.py en cada app instalada
app.autodiscover_tasks()
