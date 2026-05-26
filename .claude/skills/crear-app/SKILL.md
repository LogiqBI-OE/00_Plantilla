---
name: crear-app
description: Crea una nueva app SaaS multi-tenant clonando la plantilla `LogiqBI-OE/00_Plantilla` y adaptandola con el nombre, branding y modulos especificos del nuevo proyecto. Usar cuando el usuario diga "nueva app", "crear app", "arrancar proyecto nuevo basado en la plantilla", "crear SaaS interno", o mencione querer construir algo nuevo desde esta plantilla.
---

# Skill: Crear-app

Genera un nuevo proyecto SaaS multi-tenant a partir de la plantilla
LogiQ. Funciona en dos modos:

1. **Local**: clona el repo, renombra todo lo necesario, deja un proyecto
   listo para `npm install` + `python manage.py migrate`.
2. **GitHub + Railway**: además crea el repo remoto y los servicios de
   Railway. (Requiere `gh` y/o Railway CLI autenticados.)

## Cuándo invocarme

Trigger phrases:
- "quiero crear una app nueva basada en la plantilla"
- "arrancar nuevo proyecto SaaS"
- "clonar plantilla para [nombre]"
- "nueva app multi-tenant"
- "necesito construir [X] sobre la plantilla"

NO invocarme si:
- El usuario ya está trabajando en una app existente (esto no es una
  refactorización ni un upgrade).
- El stack pedido es distinto (FastAPI/Next.js/Rails). Esta skill solo
  vale para Django + React + Tailwind multi-tenant.

## Pasos de la skill

### 0. Confirmar contexto (siempre)

Antes de ejecutar nada, **preguntar** al usuario (no asumir):

1. **Nombre de la app**: nombre humano legible (ej. "CRM Acme",
   "Inventario Talleres"). De ahí derivamos:
   - `slug` snake_case para Django app/module (ej. `crm_acme`).
   - `slug` kebab-case para repo + URL (ej. `crm-acme`).
2. **Repo destino**:
   - Solo local en una carpeta específica? Ruta?
   - O GitHub también? Org/user + nombre del repo?
3. **Railway**: ¿deployar ya o solo dejar listo para deploy manual?
4. **Identidad git**: ¿qué nombre/email para commits en este repo?
   (NUNCA usar el global de la máquina sin confirmar.)
5. **Idioma**: ¿qué idioma para la interacción y los comentarios del
   código? (Default heredado: español neutro.)
6. **Tenant inicial**: ¿slug y nombre del primer tenant que se crea
   automáticamente? Ej. slug=`acme`, name=`Acme Corp`.
7. **Brand**: ¿usar identidad LogiQ default o el usuario tiene assets
   propios (logos, paleta)?
8. **Módulos extra**: ¿solo el esqueleto base o agregar algún módulo
   de dominio específico (productos, clientes, etc.)?

Documentar cada respuesta en el PROJECT_PLAN.md del proyecto nuevo.

### 1. Clonar la plantilla

```bash
git clone https://github.com/LogiqBI-OE/00_Plantilla.git <target-dir>
cd <target-dir>
rm -rf .git
git init -b main
git config --local user.name "<nombre confirmado>"
git config --local user.email "<email confirmado>"
```

### 2. Renombrar identificadores

Tres renombres principales:

**Backend (Django project):**
- `backend/plantilla/` → `backend/<slug_snake>/`
- En cada archivo, `plantilla.` → `<slug_snake>.`
- En `manage.py`, `wsgi.py`, `asgi.py`, `celery.py`: actualizar
  `DJANGO_SETTINGS_MODULE`.

**Frontend (no necesita renombre — el package.json puede quedar
como "frontend" o cambiarse a `<slug>-frontend`).**

**Brand defaults**: en `backend/apps/brand/defaults.py`:
- `BRAND_DEFAULTS.marca` → nombre humano confirmado
- `BRAND_DEFAULTS.alcance` → "Workspace" o lo que diga el usuario

**README**: actualizar título, repo URL, comandos de Railway.

### 3. Reset de migraciones (opcional pero recomendado)

Para empezar limpio sin el historial migratorio de la plantilla:

```bash
find backend/apps -path '*/migrations/0*.py' -delete
cd backend && python manage.py makemigrations
```

Cuidado: si vas a importar datos de la plantilla original (poco común),
NO resetear migraciones.

### 4. Personalizar brand

Si el usuario trajo assets propios:
- Reemplazar `frontend/public/brand/logiq/*` con los nuevos logos.
- Actualizar `PALETA_DEFAULT` en `backend/apps/brand/defaults.py` y
  `frontend/src/lib/paletaDerivada.ts` con los hex nuevos.
- Actualizar `BRAND.md` con la paleta nueva.

Si no, dejar los defaults LogiQ — el usuario los va a personalizar
después desde la UI (`/configuracion → Brand`).

### 5. Setup de Railway (si corresponde)

Con `railway` CLI:

```bash
railway init --name <slug-kebab>
railway add postgres
railway add redis
# Servicios Backend y Frontend manualmente desde el panel apuntando al
# repo recién creado, con Root Directory backend/ y frontend/ respectivamente.
```

**Variables de entorno requeridas** (recordarle al usuario que las
configure en el panel — NO se ponen en código):

Backend:
- `DJANGO_SECRET_KEY` (generado con `get_random_secret_key()`)
- `DJANGO_DEBUG=False`
- `CORS_ALLOWED_ORIGINS=<frontend-url>,http://localhost:5173`

Frontend:
- `VITE_API_URL=<backend-url>`

### 6. GitHub remote (si corresponde)

```bash
gh repo create <org>/<slug-kebab> --private --source=. --remote=origin
git add .
git commit -m "chore(repo): inicializar desde plantilla 00_Plantilla"
git push -u origin main
```

### 7. Seed inicial

Si el usuario quiere arrancar con un tenant + usuario L9 listos:

```bash
cd backend && python manage.py shell -c "
from apps.tenants.models import Tenant
from apps.accounts.models import User
t = Tenant.objects.create(slug='<tenant-slug>', name='<tenant-name>')
u = User.objects.create_superuser(
    email='<email-admin>',
    password='<password-temporal>',
    first_name='Admin',
    last_name_paterno='<lastname>',
)
print(f'Tenant: {t.slug}, L9: {u.email}')
"
```

(En Railway, este seed se corre dentro del container con
`railway run python manage.py shell -c "..."`).

### 8. Documentar

Actualizar el `PROJECT_PLAN.md` del proyecto nuevo con:
- Origen: "Creado a partir de LogiqBI-OE/00_Plantilla en <fecha>"
- Decisiones tomadas durante la skill (nombre, tenant inicial, brand).
- Tabla de URLs (local y Railway).
- Próximos pasos sugeridos según los módulos de dominio que el usuario
  mencionó.

### 9. Reportar al usuario

Resumen claro de lo creado:
- Ruta local del proyecto.
- URL del repo GitHub (si aplica).
- URLs de Railway backend/frontend (si aplica).
- Credenciales del L9 inicial.
- Lista de cosas que el usuario tiene que hacer manualmente (env vars
  en Railway, primer login en UI, etc.).
- Sugerencia de próximos commits según los módulos de dominio
  prometidos.

## Convenciones que debo respetar

Heredadas de la plantilla (no negociar sin preguntar):

- **Migraciones nativas de Django** (no `seed.py` defensivo).
- **`TenantScopedModel`** para cualquier modelo de dominio nuevo —
  multi-tenancy es la regla.
- **Permisos via `RequireLevel(N)` o `HasPermission(code)`** factories.
- **Rutas nuevas**: lazy + agregar al `PREFETCH_MAP` de `SidebarItem.tsx`.
- **`fmtMoney`** única función de dinero (locale en-US).
- **Botón Guardar**: top-right; en drawers, footer.
- **Skeleton loaders**, no "Cargando…" plano.
- **Sin cache** de datos en frontend.
- **Identidad git local** al repo, nunca global.

## Antes de cerrar

Verificar que el proyecto nuevo:
- `cd backend && python manage.py check` pasa sin errores.
- `cd frontend && npx tsc -b` pasa sin errores.
- `cd frontend && npx vite build` produce dist/ sin errores.
- Si Railway: el primer deploy se completa verde.

Si algo falla, NO marcar la skill como terminada — diagnosticar y
arreglar antes.
