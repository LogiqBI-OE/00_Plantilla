# 00_Plantilla — LogiQ

Plantilla esqueleto multi-tenant para arrancar nuevos SaaS internos.
Esta es la base de la futura skill `Crear-app`.

**Stack**
- Backend: Django 5 + DRF + simplejwt + Celery + PostgreSQL
- Frontend: React 19 + Vite + TypeScript (strict) + Tailwind v3 + react-i18next
- Deploy: Railway (servicios separados de backend, frontend, Postgres)

**Documentación**
- [`CLAUDE.md`](./CLAUDE.md) — convenciones, stack, workflow, reglas para futuras sesiones.
- [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) — estado vivo + decisiones tomadas.
- [`SKELETON_GUIDE.md`](./SKELETON_GUIDE.md) — guía técnica completa del esqueleto.
- [`BRAND.md`](./BRAND.md) — identidad visual default de LogiQ.

---

## Setup local

### Requisitos previos

- Python 3.12+
- Node.js 20+ (probado con 24.15)
- (Opcional) Docker para correr Postgres + Redis localmente.

### Backend

```bash
cd backend
python -m pip install -r requirements.txt
cp .env.example .env
# Editar .env: setear DJANGO_SECRET_KEY al menos.
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

El backend queda en `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend queda en `http://localhost:5173`. El dev server proxea `/api/*`,
`/health`, `/readiness` a `http://localhost:8000` automáticamente.

### Docker (opcional, Postgres + Redis)

```bash
docker-compose up -d
# Levanta postgres en :5432 y redis en :6379
# Edita backend/.env con DATABASE_URL=postgres://plantilla:plantilla@localhost:5432/plantilla
```

---

## Deploy en Railway

Cada push a `main` re-deploya automáticamente. La configuración de cada
servicio:

### Backend service

- **Root Directory**: `backend/`
- **Dockerfile**: `backend/Dockerfile`
- **Variables de entorno requeridas**:
  - `DJANGO_SECRET_KEY` — string random largo (`get_random_secret_key()`)
  - `DJANGO_DEBUG=False`
  - `DATABASE_URL` — auto-inyectada por Railway si conectas el Postgres add-on.
  - `REDIS_URL` — auto-inyectada si conectas el Redis add-on.
  - `CORS_ALLOWED_ORIGINS=https://<dominio-frontend>,http://localhost:5173`
- `RAILWAY_PUBLIC_DOMAIN` se inyecta solo y se agrega a `ALLOWED_HOSTS` y
  `CSRF_TRUSTED_ORIGINS` automáticamente.
- El entrypoint corre `migrate` + `compilemessages` + `collectstatic` antes
  de arrancar gunicorn.

### Frontend service

- **Root Directory**: `frontend/`
- Railway detecta Vite automáticamente (build: `npm run build`, serve: estático).
- **Variables de entorno requeridas**:
  - `VITE_API_URL=https://<dominio-backend>` — lectura en build-time.
    Cambiar requiere re-deploy.

### Postgres + Redis

Add-ons nativos de Railway. Conectarlos al servicio Backend para que las
variables `DATABASE_URL` y `REDIS_URL` se inyecten automáticamente.

---

## Estructura

```
backend/
├── manage.py
├── requirements.txt
├── Dockerfile + entrypoint.sh
├── locale/{es,en}/LC_MESSAGES/    # Django i18n .po
├── plantilla/                     # proyecto Django
│   ├── settings.py
│   ├── urls.py
│   └── celery.py
└── apps/
    ├── core/                      # TenantJWTAuthentication, permissions
    ├── tenants/                   # Tenant model + endpoints
    ├── accounts/                  # User + Level + PermissionMatrix + endpoints
    ├── brand/                     # BrandSettings + GlobalBrand + endpoints
    ├── system_config/             # Global settings (L9)
    └── audit/                     # AuditLog

frontend/
├── package.json
├── vite.config.ts                 # manualChunks + dev proxy
├── tailwind.config.js             # tokens via CSS vars
├── tsconfig.app.json              # strict: true
├── public/brand/logiq/            # assets LogiQ default
└── src/
    ├── i18n/                      # react-i18next + es.json + en.json
    ├── lib/
    │   ├── api/                   # cliente fetch tipado por dominio
    │   ├── auth.tsx               # AuthProvider
    │   ├── brand.tsx              # BrandProvider + applyPalette
    │   ├── tenant.tsx             # TenantProvider
    │   ├── theme.tsx              # ThemeProvider
    │   ├── pageTitle.tsx
    │   ├── colorPalettes.ts       # Tailwind v3 + OKLab matching
    │   └── paletaDerivada.ts      # 23 principales -> ~80 derivados
    ├── components/
    │   ├── ui/                    # primitives reutilizables
    │   └── layout/                # AppShell, RootLayout, PlatformLayout
    └── pages/                     # rutas (lazy + prefetch)
```

---

## Modelo conceptual

### Multi-tenancy

| Nivel | Alcance | `User.tenant` | Acceso a |
|---|---|---|---|
| L9 | Plataforma global | `null` | Todos los tenants + consola LogiQ |
| L8 | Agencia | `null` | Subconjunto via `AgencyTenantAccess` |
| L0-L7 | Single-tenant | `<id>` | Solo su propio tenant |

### Permisos efectivos

```
User.has_permission(code) =
  UserPermissionOverride.allowed (si existe)
  | PermissionMatrix[user.level, code].allowed
  | False
```

Editable desde `/configuracion` (matriz por nivel) y desde el drawer de
cada usuario (overrides por-usuario).

### Brand scoping

- `/api/brand/public/` — sin auth, lo consume el Login.
- `/api/brand/` — el brand del tenant actual (tenant scope).
- `/api/global-brand/` — identidad LogiQ para pantallas L9/L8 (platform scope).

---

## Crear una app nueva a partir de esta plantilla

Hasta que la skill `Crear-app` exista, el flow manual:

1. Crear un fork o clonar este repo.
2. Renombrar:
   - GitHub repo a `<nombre-app>`.
   - `backend/plantilla/` → `backend/<nombre_app>/` y todas las referencias.
   - Servicio en Railway.
3. Crear un Tenant inicial vía Django shell o `/api/tenants/` (L9).
4. Crear el primer usuario L9 admin con `python manage.py createsuperuser`.
5. Personalizar el brand desde `/configuracion → Brand` o vía API.
6. Comenzar a agregar modelos de dominio heredando de `TenantScopedModel`:

```python
from apps.core.models import TenantScopedModel

class Producto(TenantScopedModel):  # tenant FK gratis
    nombre = models.CharField(max_length=128)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
```

7. Crear el ViewSet correspondiente usando `MyModel.objects.for_request(request)`
   en `get_queryset()` para scoping automático por tenant.

---

## Endpoints API (resumen)

```
GET  /health/                              Liveness
GET  /readiness/                           DB + Redis check

POST /api/auth/login                       Login adaptativo
POST /api/auth/refresh                     Renovar access
GET  /api/auth/me                          User + tenant
POST /api/auth/switch-tenant               L8/L9 cambia tenant
GET  /api/auth/tenants-for-identifier      Helper login UI

GET    /api/users/                         Lista jerárquica
POST   /api/users/                         Crear (level ≤ self)
PATCH  /api/users/{id}/                    Editar (level < self)
DELETE /api/users/{id}/                    Borrar (level < self)
POST   /api/users/{id}/reset-password/     Aplica standard_password
POST   /api/users/{id}/permissions/        Set overrides

GET    /api/tenants/                       Scoped por nivel
POST   /api/tenants/                       Crear (L9)
PATCH  /api/tenants/{id}/                  Editar (L9)
POST   /api/tenants/{id}/grant-agency/     Asignar L8 (L9)
POST   /api/tenants/{id}/revoke-agency/    (L9)

GET    /api/levels/                        Niveles + matriz + catálogo
PATCH  /api/levels/{level}/                Editar metadata (L9)
PUT    /api/levels/matrix/                 Reemplazar matriz (L9)

GET    /api/system-config/                 L9
PATCH  /api/system-config/                 L9
GET    /api/system-config/runtime/         Subset público

GET    /api/brand/public/                  SIN AUTH, para login
GET    /api/brand/                         Brand del tenant
PATCH  /api/brand/                         + logos + carrusel + paleta + memoria
GET    /api/global-brand/                  L9 (consola LogiQ)

GET    /api/audit/                         Log con filtros
```

---

## Comandos útiles

### Backend

```bash
python manage.py runserver
python manage.py shell
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py makemessages -l es    # requiere gettext
python manage.py compilemessages
celery -A plantilla worker -l INFO     # tareas asincronas (requiere Redis)
```

### Frontend

```bash
npm run dev                # dev server con HMR + proxy
npm run build              # tsc + vite build a dist/
npm run preview            # serve dist/ localmente
npm run lint               # eslint
npx tsc -b                 # solo typecheck
```

### Git

Identidad local del repo: `LogiQ OE <orla.elizondos@gmail.com>` (ver
`.git/config`). Nunca usar la identidad global de la máquina para este
proyecto.

```bash
git config --local user.name "LogiQ OE"
git config --local user.email "orla.elizondos@gmail.com"
```

---

## License

Privado. Propiedad de LogiQ.
