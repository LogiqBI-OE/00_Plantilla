#!/bin/sh
# Entrypoint para el container de produccion (Railway).
# Aplica migraciones, colecta static files, y arranca gunicorn.

set -e

echo "==> Running database migrations..."
python manage.py migrate --noinput

echo "==> Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "==> Starting gunicorn on port ${PORT:-8000}..."
exec gunicorn plantilla.wsgi:application \
    --bind "0.0.0.0:${PORT:-8000}" \
    --workers 3 \
    --access-logfile - \
    --error-logfile -
