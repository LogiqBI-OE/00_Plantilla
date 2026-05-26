# Traducciones del backend

Archivos `.po` (gettext) para los mensajes del backend marcados con
`gettext_lazy as _`. Cubre principalmente:

- `verbose_name` y `verbose_name_plural` de modelos
- Mensajes de validacion de serializers
- `help_text` de campos
- Errores de DRF (sobreescritos selectivamente)

Django expone estos archivos a Django mismo via `LOCALE_PATHS` en
`settings.py` (apunta a `BASE_DIR / 'locale'`).

## Idiomas soportados

- `es` (default): Espanol neutro
- `en`: English

## Workflow

### Generar/actualizar el `.po`

Cuando se agregan strings nuevos al codigo (envueltos en `_()` o
`gettext_lazy`), correr:

    cd backend
    python manage.py makemessages -l es
    python manage.py makemessages -l en

Esto requiere `gettext` instalado en el sistema:
- Windows: `choco install gettext` o descarga de
  https://mlocati.github.io/articles/gettext-iconv-windows.html
- macOS: `brew install gettext`
- Linux: `apt install gettext`

### Compilar a `.mo`

Despues de traducir el `.po`, compilar para que Django lo use:

    python manage.py compilemessages

Los `.mo` resultantes NO se commitean (estan en `.gitignore` via
`*.mo`). Se generan en runtime de Docker via `entrypoint.sh` o como
paso de build.

## Nota sobre la fase actual

En este commit dejamos solo la estructura. El catalogo `django.po`
de ambos idiomas se genera cuando arranquemos a traducir el backend
de verdad (probablemente en Fase 2 cuando empecemos las pages del
frontend y necesitemos traducciones consistentes con `react-i18next`).
