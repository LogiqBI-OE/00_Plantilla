# SKELETON_GUIDE.md — Guía de construcción del esqueleto

> **Propósito**: documento técnico de referencia para construir la plantilla `LogiqBI-OE/00_Plantilla`. Es la guía viva del esqueleto y servirá como base para la futura skill `Crear-app`.
>
> **Origen**: reescritura del `docs/legacy/SKELETON_PROMPT_PROPOSAL_TerraDeFlora.md` (basado en Terra de Flora, stack FastAPI) adaptado a las decisiones de este proyecto: **Django + DRF + multi-tenant + i18n bilingüe**. Lecciones aprendidas y patrones de frontend conservados; backend reescrito.

---

## 🎯 Objetivo

Construir el **esqueleto base de un SaaS multi-tenant ligero** con:

1. **Login adaptativo** con logos/colores controlados desde Brand Settings — sin tocar código para rebrand. Si hay 1 solo tenant activo, el selector de tenant no se muestra; al activarse un 2.º tenant, aparece.
2. **AppShell estable** (Sidebar + Topbar + main) que no se remontea entre navegaciones.
3. **Multi-tenancy nativa**: cada tenant aislado, con su propia marca, usuarios y configuración. L9 administra todos; L8 administra un subconjunto; L0-L7 viven dentro de un solo tenant.
4. **CRUD de usuarios** jerárquico (no puedes editar/borrar a alguien de tu mismo o mayor nivel).
5. **Gestión de tenants** (consola L9/L8) para crear, desactivar y asignar agencias.
6. **Global Settings** (solo L9): clave-valor con tipos (text, number, boolean, password).
7. **Brand Settings por-tenant** con tabs: Brand Name · Paleta · Logos · Carrusel · Preview Login en vivo.
8. **Editor de paleta**: 23 colores principales editables; ~70 derivados (text muted, hover, halos, gradients, alphas semánticos) calculados con fórmulas. Color picker con paletas Tailwind v3 y matching perceptual OKLab.
9. **i18n bilingüe es/en** desde el día uno — `react-i18next` en frontend, Django i18n con `.po` en backend. Selector en topbar, preferencia persistida por usuario.
10. **Logs/auditoría** de acciones críticas.

No incluye lógica de negocio específica (proyectos, cotizaciones, calendario, etc.). Es la base sobre la que se construyen las apps futuras vía skill `Crear-app`.

---

## 🧱 Stack (definitivo — ver `CLAUDE.md`)

| Capa | Tecnología |
|---|---|
| Backend | Django 5 + Django REST Framework |
| Auth | `djangorestframework-simplejwt` (JWT con TTL configurable desde SystemConfig) |
| Tareas asíncronas | Celery + Redis |
| Base de datos | PostgreSQL |
| Migraciones | **Nativas de Django** (`makemigrations` + `migrate`). No editar migraciones aplicadas en producción. |
| Frontend | React 18 + Vite + TypeScript estricto + Tailwind CSS v3 |
| i18n | `react-i18next` (frontend) + Django i18n con `.po` (backend) |
| Deploy | Railway (servicios separados: web, worker Celery, Postgres addon, Redis addon) |
| Branch | Única `main` durante desarrollo; push directo = deploy |
| Sin cache de datos en frontend | Todo en vivo del backend. Única excepción: `localStorage` para token de sesión, idioma preferido y "remember email" |

---

## 📁 Estructura de carpetas

```
repo/
├── CLAUDE.md
├── PROJECT_PLAN.md
├── BRAND.md                        ← paleta default LogiQ
├── SKELETON_GUIDE.md               ← este archivo
├── README.md                       ← instrucciones de clonado/arranque
├── docs/legacy/                    ← documentos de referencia histórica
├── docker-compose.yml              ← Postgres + Redis para dev local
├── railway.toml                    ← config de Railway (servicios + variables)
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── pytest.ini
│   ├── locale/                     ← Django i18n (.po files)
│   │   ├── es/LC_MESSAGES/django.po
│   │   └── en/LC_MESSAGES/django.po
│   ├── plantilla/                  ← proyecto Django
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   ├── asgi.py
│   │   └── celery.py               ← Celery app
│   └── apps/
│       ├── core/                   ← utilidades compartidas
│       │   ├── permissions.py      ← RequireLevel, HasPermission
│       │   ├── middleware.py       ← TenantMiddleware, LanguageMiddleware
│       │   ├── models.py           ← TenantScopedModel (abstract)
│       │   ├── managers.py         ← TenantScopedManager
│       │   ├── pagination.py
│       │   └── exceptions.py
│       ├── tenants/
│       │   ├── models.py           ← Tenant, AgencyTenantAccess
│       │   ├── serializers.py
│       │   ├── views.py
│       │   ├── urls.py
│       │   ├── permissions.py      ← TenantAdminPermission
│       │   └── migrations/
│       ├── accounts/               ← usuarios + niveles + permisos
│       │   ├── models.py           ← User, Level, PermissionMatrix, UserPermissionOverride
│       │   ├── managers.py         ← UserManager con jerarquía
│       │   ├── serializers.py
│       │   ├── views.py            ← UserViewSet, LevelViewSet
│       │   ├── auth_views.py       ← login adaptativo, refresh, me
│       │   ├── permissions.py
│       │   ├── urls.py
│       │   ├── defaults.py         ← matriz de permisos default, niveles default
│       │   └── migrations/
│       ├── brand/
│       │   ├── models.py           ← BrandSettings (por-tenant), GlobalBrand (singleton LogiQ)
│       │   ├── serializers.py
│       │   ├── views.py
│       │   ├── urls.py
│       │   ├── defaults.py         ← PALETA_DEFAULT, brand defaults
│       │   └── migrations/
│       ├── system_config/          ← Global Settings (L9 only)
│       │   ├── models.py           ← SystemConfig (key-value)
│       │   ├── serializers.py
│       │   ├── views.py
│       │   ├── urls.py
│       │   ├── defaults.py         ← SYSTEM_CONFIG_KEYS
│       │   └── migrations/
│       └── audit/
│           ├── models.py           ← AuditLog
│           ├── services.py         ← log_action()
│           ├── serializers.py
│           ├── views.py
│           ├── urls.py
│           └── migrations/
│
└── frontend/
    ├── package.json
    ├── vite.config.ts              ← manualChunks
    ├── tsconfig.json (strict: true)
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html                  ← <title> fallback, favicons estáticos
    ├── Dockerfile
    ├── public/
    │   ├── system-defaults/        ← 1 asset por slot (logo, foto carrusel)
    │   └── brand/logiq/            ← assets LogiQ (default global)
    │       ├── logo-black.png
    │       ├── logo-white.png
    │       ├── favicon-black.png
    │       └── favicon-white.png
    └── src/
        ├── main.tsx                ← Providers: i18n > Brand > Theme > Router > Auth
        ├── App.tsx                 ← Routes con React.lazy + Layout Route
        ├── index.css               ← tokens CSS :root + .theme-dark + .theme-light
        ├── i18n/
        │   ├── index.ts            ← config de react-i18next
        │   ├── es.json
        │   └── en.json
        ├── lib/
        │   ├── api/
        │   │   ├── client.ts       ← fetch + ApiError + token + formatErrorDetail
        │   │   ├── auth.ts
        │   │   ├── users.ts
        │   │   ├── tenants.ts
        │   │   ├── systemConfig.ts
        │   │   ├── levels.ts
        │   │   ├── brand.ts
        │   │   ├── audit.ts
        │   │   └── index.ts
        │   ├── auth.tsx            ← AuthProvider + useAuth (incluye currentTenant)
        │   ├── theme.tsx           ← ThemeProvider + useTheme
        │   ├── brand.tsx           ← BrandProvider + useBrand + applyPalette
        │   ├── tenant.tsx          ← TenantProvider + useTenant + switchTenant
        │   ├── pageTitle.tsx       ← PageTitleProvider + usePageTitle
        │   ├── colorPalettes.ts    ← Tailwind v3 paletas + OKLab utils
        │   ├── paletaDerivada.ts   ← principales + fórmulas de derivación
        │   ├── systemDefaults.ts   ← paths a /public/system-defaults/
        │   ├── format.ts           ← fmtMoney (locale en-US), fmtDate
        │   ├── usePolling.ts       ← visibility-aware
        │   └── useKeepWarm.ts      ← opt-in ping /health
        ├── components/
        │   ├── ui/
        │   │   ├── Button.tsx
        │   │   ├── Card.tsx
        │   │   ├── Drawer.tsx
        │   │   ├── Modal.tsx
        │   │   ├── TextField.tsx
        │   │   ├── Tabs.tsx
        │   │   ├── Skeleton.tsx    ← SkeletonBox, SkeletonTable, SkeletonCards
        │   │   ├── ThemeToggle.tsx
        │   │   ├── LanguageToggle.tsx
        │   │   ├── UserMenu.tsx
        │   │   ├── TenantSwitcher.tsx
        │   │   ├── IconButton.tsx
        │   │   ├── InfoIcon.tsx    ← tooltip via Portal
        │   │   ├── TailwindColorPicker.tsx ← Portal + OKLab matching
        │   │   ├── EmptyState.tsx
        │   │   ├── Badge.tsx
        │   │   └── Avatar.tsx
        │   ├── icons/Icons.tsx
        │   ├── layout/
        │   │   ├── AppShell.tsx
        │   │   ├── RootLayout.tsx  ← auth gate + tenant resolve + AppShell + <Outlet/>
        │   │   ├── PlatformLayout.tsx ← layout para L9/L8 (consola LogiQ)
        │   │   ├── Sidebar.tsx
        │   │   ├── SidebarSection.tsx
        │   │   ├── SidebarItem.tsx ← prefetch al hover via PREFETCH_MAP
        │   │   ├── Topbar.tsx
        │   │   └── navConfig.tsx   ← NAV_SECTIONS por rol
        │   └── BackgroundCarousel.tsx
        └── pages/
            ├── Login.tsx
            ├── platform/           ← pantallas L9/L8 (marca LogiQ siempre)
            │   ├── TenantsPage.tsx
            │   ├── GlobalSettingsPage.tsx
            │   └── AgencyAccessPage.tsx
            ├── usuarios/
            │   ├── UsuariosPage.tsx
            │   └── sections/
            │       ├── UsuariosTable.tsx
            │       └── UsuarioFormDrawer.tsx
            ├── configuracion/      ← per-tenant (marca del tenant)
            │   ├── ConfiguracionPage.tsx
            │   └── sections/
            │       ├── NivelesTab.tsx
            │       ├── PermisosTab.tsx
            │       ├── BrandTab.tsx
            │       ├── ConfigItemEditor.tsx
            │       ├── LevelsDescriptionsTable.tsx
            │       ├── LevelsPermissionsMatrix.tsx
            │       └── brand/
            │           ├── BrandNameSub.tsx
            │           ├── PaletaSub.tsx
            │           ├── LogosSub.tsx
            │           ├── CarruselSub.tsx
            │           └── LoginPreview.tsx
            └── auditoria/
                └── AuditoriaPage.tsx
```

---

## 🔑 Convenciones (no negociar sin avisar)

### Frontend

- **AppShell vive en layout route compartido** (`RootLayout`). Las pages NO envuelven `<AppShell>` ellas mismas — solo renderizan su contenido. React Router mantiene AppShell estable; Topbar y Sidebar no se remontean. Crítico para no duplicar fetches del badge ni re-revalidar el logo en cada navegación.
- **Dos layouts**: `RootLayout` para tenant; `PlatformLayout` para pantallas L9/L8 (consola LogiQ con marca fija). Un L8/L9 puede saltar entre ambos.
- **`usePageTitle('título')`** solo setea el `h1` visual del Topbar. **`document.title` del browser** es FIJO y se setea desde `BrandProvider` como `${brand.marca} · ${brand.alcance}`.
- **Botón Guardar siempre en top-right**, no inferior. Excepción: drawers (Cancelar/Guardar en footer es patrón estándar de modal).
- **Skeleton loaders** (no `Cargando…` plano) para sensación de velocidad.
- **Prefetch al hover** en sidebar — `PREFETCH_MAP` con `() => import('./page')`.
- **Pages cargan en lazy chunks** con `React.lazy()`. Cualquier ruta nueva en `App.tsx` debe ir con lazy + entrada en `PREFETCH_MAP`.
- **`usePolling(callback, ms, enabled)`** para polling — pausa cuando tab no está visible. No usar `setInterval` raw.
- **Vite `manualChunks`** consolida UI/API/vendor en chunks reutilizables (evita la cascada de 30+ requests pequeños de Rollup default).
- **Color picker en Portal** con `position:fixed` — nunca embebido en flujo normal porque ancestros con `overflow:hidden` lo recortan.
- **Tooltips custom via Portal** — no usar `title=` nativo (tarda 1.5s y depende del browser).
- **i18n**: todo texto visible pasa por `t('clave.sub')`. Strings hardcoded prohibidos (excepto nombres propios, números, dirección de archivos).
- **`fmtMoney` de `lib/format.ts`** (locale `en-US`) — única función de dinero. No inventar otras.

### Backend (Django)

- **Sin N+1**: cada `ViewSet` con listas usa `select_related` / `prefetch_related`. Crear caches en memoria cuando se necesite agregar lookups masivos (`MaterialInfoCache`, `_badges_for_all`, etc.).
- **Multi-tenancy via middleware**: `TenantMiddleware` resuelve `request.tenant` desde el JWT. Todos los modelos de dominio heredan de `TenantScopedModel` (abstract) que tiene `tenant = ForeignKey(Tenant)` + manager que filtra automáticamente por `request.tenant`.
- **Migraciones nativas**: `python manage.py makemigrations` + `migrate`. Cada cambio de modelo = nueva migración versionada en `apps/<app>/migrations/`. **No editar migraciones ya aplicadas en producción**; si hay error, crear migración correctiva.
- **JWT TTL configurable** desde `SystemConfig` (clave `token_lifetime_days`). Customizar `AccessToken.lifetime` dinámicamente al emitir.
- **Endpoints públicos mínimos** — solo `/api/auth/login`, `/api/auth/tenants-for-identifier`, `/api/brand/public` y `/health`. Todo lo demás requiere auth.
- **Permisos**: clases custom `RequireLevel(min_level)` y `HasPermission(code)` en `apps/core/permissions.py`. La matriz global + overrides por usuario se evalúan en `User.has_permission(code)`.
- **Audit log**: usar `apps.audit.services.log_action(user, action, target, metadata)` en mutaciones críticas. No loguear lecturas masivas.

### i18n

- **Frontend**: `react-i18next` con `es.json` y `en.json` en `src/i18n/`. Llaves jerárquicas: `auth.login.title`, `users.table.column.name`. `useTranslation()` en cada componente que tenga UI.
- **Backend**: Django i18n con `gettext_lazy as _` para mensajes que el backend genera (errores de validación, emails, notificaciones). Archivos `.po` en `backend/locale/es/` y `backend/locale/en/`.
- **Detección de idioma**: el frontend envía `Accept-Language` header. El backend lee `request.LANGUAGE_CODE` (Django LocaleMiddleware). El usuario logueado tiene `preferred_language` que sobrescribe.
- **Idioma de trabajo del equipo**: español neutro (sin voseo ni modismos mexicanos en código, comentarios ni respuestas).

### Commits

- Scope chico: `feat(brand): ...`, `fix(login): ...`, `perf(...)`, `refactor(...)`, `ux(...)`, `chore(...)`, `i18n(...)`.
- Co-author en cada commit:
  `Co-Authored-By: Claude <noreply@anthropic.com>`
- Branch única `main` durante desarrollo. Push directo dispara deploy en Railway.
- Identidad de git **local al repo** (`git config --local`), nunca asumir el global de la máquina.
- Verificar build local antes de pushear cambios grandes:
  ```bash
  cd frontend && npx tsc -b && npx vite build
  cd ../backend && python manage.py check && python manage.py makemigrations --check --dry-run
  ```

---

## 🗄️ Modelo de datos

### Tenant
```python
class Tenant(models.Model):
    slug = models.CharField(max_length=64, unique=True)      # para subdominios/rutas
    name = models.CharField(max_length=128)                  # nombre visible
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### User (custom user model — `AUTH_USER_MODEL`)
```python
class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=64, unique=True, null=True, blank=True)
    first_name = models.CharField(max_length=64)
    last_name_paterno = models.CharField(max_length=64)
    last_name_materno = models.CharField(max_length=64, blank=True)
    level = models.IntegerField(default=0)                   # 0-9
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL)
                                                             # null => L8 (agencia) o L9 (global)
    preferred_language = models.CharField(max_length=4, choices=[('es', 'Español'), ('en', 'English')], default='es')
    is_active = models.BooleanField(default=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name_paterno']

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name_paterno} {self.last_name_materno}".strip()

    def has_permission(self, code: str) -> bool:
        # override por usuario gana
        override = self.permission_overrides.filter(permission_code=code).first()
        if override:
            return override.allowed
        return PermissionMatrix.objects.filter(level=self.level, permission_code=code, allowed=True).exists()
```

### Level (catálogo editable)
```python
class Level(models.Model):
    level = models.IntegerField(primary_key=True)            # 0-9
    label = models.CharField(max_length=64)                  # "Operador", "Supervisor", etc.
    description = models.TextField(blank=True)
    is_reserved = models.BooleanField(default=False)         # oculto del selector si True
```

### PermissionMatrix (global)
```python
class PermissionMatrix(models.Model):
    level = models.IntegerField()                            # 0-9
    permission_code = models.CharField(max_length=64)        # 'view_users', 'manage_users', etc.
    allowed = models.BooleanField(default=False)

    class Meta:
        unique_together = [('level', 'permission_code')]
```

### UserPermissionOverride (por-usuario)
```python
class UserPermissionOverride(models.Model):
    user = models.ForeignKey(User, related_name='permission_overrides', on_delete=models.CASCADE)
    permission_code = models.CharField(max_length=64)
    allowed = models.BooleanField()                          # True grants, False denies

    class Meta:
        unique_together = [('user', 'permission_code')]
```

### AgencyTenantAccess (L8 → tenants asignados)
```python
class AgencyTenantAccess(models.Model):
    user = models.ForeignKey(User, related_name='agency_access', on_delete=models.CASCADE)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    granted_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='+')
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('user', 'tenant')]
```

### SystemConfig (key-value global, solo L9)
```python
class SystemConfig(models.Model):
    key = models.CharField(max_length=64, primary_key=True)
    value = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)
```

Claves esperadas en `apps/system_config/defaults.py`:
```python
SYSTEM_CONFIG_KEYS = [
    ConfigKey("standard_password", "ChangeMe123!", "Contraseña estándar",
              "Aplicada al usuario cuando un admin presiona 'Resetear'", "Accesos"),
    ConfigKey("token_lifetime_days", "30", "Duración de la sesión (días)", ..., "Accesos",
              input_type="number"),
    ConfigKey("keep_warm_ping_enabled", "false", "Mantener backend caliente", ..., "Rendimiento",
              input_type="boolean"),
    ConfigKey("keep_warm_ping_interval_minutes", "5", "Intervalo del ping", ..., "Rendimiento",
              input_type="number"),
    ConfigKey("default_language", "es", "Idioma por defecto del sistema", ..., "Localización",
              input_type="select", options=["es", "en"]),
]
```

### BrandSettings (por-tenant)
```python
class BrandSettings(models.Model):
    tenant = models.OneToOneField(Tenant, related_name='brand', on_delete=models.CASCADE)
    marca = models.CharField(max_length=64)                  # "Mi Empresa"
    alcance = models.CharField(max_length=64)                # "Workspace", "Admin", "Showroom"
    logo_login = models.TextField(null=True, blank=True)     # data URL base64
    logo_sidebar = models.TextField(null=True, blank=True)
    logo_login_filename = models.CharField(max_length=128, null=True, blank=True)
    logo_sidebar_filename = models.CharField(max_length=128, null=True, blank=True)
    paleta_actual = models.JSONField(default=dict)           # { fixed: {...}, dark: {...}, light: {...} }
    paletas_memoria = models.JSONField(default=list)         # list[{nombre, guardada_at, paleta}], max 5
    carrusel_fotos = models.JSONField(default=list)          # list[data URL], max 12
    carrusel_segundos = models.FloatField(default=4.5)
    updated_at = models.DateTimeField(auto_now=True)
```

### GlobalBrand (singleton — identidad LogiQ para pantallas platform L9/L8)
```python
class GlobalBrand(models.Model):
    id = models.IntegerField(primary_key=True, default=1)
    # mismos campos que BrandSettings excepto FK
    # se llena con defaults LogiQ documentados en BRAND.md al hacer seed
```

### AuditLog
```python
class AuditLog(models.Model):
    tenant = models.ForeignKey(Tenant, null=True, on_delete=models.SET_NULL)
                                                             # null para eventos a nivel plataforma
    user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=64)                 # 'user.created', 'brand.updated', etc.
    target_type = models.CharField(max_length=64, blank=True) # 'user', 'tenant', 'brand'
    target_id = models.CharField(max_length=64, blank=True)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['tenant', '-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['action', '-created_at']),
        ]
```

### Modelo abstracto `TenantScopedModel`
Para que cualquier tabla de dominio futura herede multi-tenancy automáticamente:
```python
class TenantScopedManager(models.Manager):
    def for_request(self, request):
        if not getattr(request, 'tenant', None):
            return self.none()
        return self.filter(tenant=request.tenant)

class TenantScopedModel(models.Model):
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    objects = TenantScopedManager()

    class Meta:
        abstract = True
```

---

## 🔐 Multi-tenancy y niveles

### Modelo conceptual

| Nivel | Alcance | `User.tenant` | Acceso a |
|---|---|---|---|
| L9 | Plataforma global | `null` | Todos los tenants + consola LogiQ |
| L8 | Agencia | `null` | Subconjunto de tenants definido en `AgencyTenantAccess` |
| L0-L7 | Single-tenant | `<id>` (NOT NULL) | Solo su propio tenant |

### `TenantMiddleware`

Resuelve `request.tenant` en cada request:

1. Lee el JWT de `Authorization: Bearer ...`.
2. Si el usuario es L0-L7: `request.tenant = user.tenant`. Inmutable.
3. Si el usuario es L8/L9: lee el header `X-Tenant-Slug` (frontend lo manda según en qué tenant está parado). Valida acceso:
   - L9: cualquier tenant activo.
   - L8: solo tenants en `AgencyTenantAccess`.
   - Si la request es a un endpoint platform (`/api/platform/*`), `request.tenant = None`.

### Login adaptativo

Flujo del frontend al cargar `/login`:

1. **GET `/api/brand/public`** (sin auth). Devuelve:
   - Si el dominio/subdominio corresponde a un tenant: brand de ese tenant.
   - Si el dominio es raíz/genérico y hay 1 solo tenant activo: brand de ese tenant.
   - Si el dominio es raíz/genérico y hay ≥2 tenants activos: brand LogiQ default + flag `requires_tenant_selector: true`.

2. Usuario ingresa email + password (+ tenant si `requires_tenant_selector: true`).

3. **POST `/api/auth/login`** `{ identifier, password, tenant_slug? }`:
   - Valida credenciales.
   - Si el usuario es L0-L7: `tenant_slug` debe matchear `user.tenant.slug` (o ser omitido si solo hay 1).
   - Si el usuario es L8: `tenant_slug` debe estar en sus `AgencyTenantAccess`. Si no se pasa, redirige al selector post-login.
   - Si el usuario es L9: cualquier tenant válido, o entrar a "consola plataforma" si `tenant_slug` es omitido/especial.
   - Emite JWT con claim `tenant_slug` dentro.

4. Frontend persiste token en `localStorage`, redirige a `/` (que resuelve a dashboard según rol).

### Switch de tenant (solo L8/L9)

`TenantSwitcher.tsx` en el topbar muestra dropdown con tenants accesibles. Al cambiar:
1. Cierra sesión actual (limpia state).
2. POST `/api/auth/switch-tenant` `{ tenant_slug }` → nuevo JWT con tenant actualizado.
3. Reload de providers (BrandProvider re-fetcha el brand del nuevo tenant).

---

## 🌐 Endpoints backend (DRF)

### `/api/auth/*`
- POST `/api/auth/login` → `{ identifier, password, tenant_slug? }` → `{ access, refresh, user, tenant }`
- POST `/api/auth/refresh` → renovar access token
- POST `/api/auth/switch-tenant` (auth, L8/L9) → cambiar tenant activo
- POST `/api/auth/logout`
- GET `/api/auth/me` → usuario actual + tenant actual + permisos efectivos
- GET `/api/auth/tenants-for-identifier?identifier=...` (sin auth) — para login adaptativo cuando hay ≥2 tenants: devuelve qué tenants ese usuario podría loguear (sin password aún, solo para mostrar selector). Rate-limited.

### `/api/users/*` (auth, tenant-scoped por middleware)
- GET `/api/users/` → lista (L5+ ve hasta su level)
- POST `/api/users/` → crear (level ≤ self)
- PATCH `/api/users/{id}/` → actualizar metadata
- POST `/api/users/{id}/reset-password/` → aplica `standard_password`
- POST `/api/users/{id}/permissions/` → set overrides
- DELETE `/api/users/{id}/` → solo si target.level < self.level

### `/api/tenants/*` (auth)
- GET `/api/tenants/` → L9 ve todos; L8 ve sus asignados; L0-L7 solo el suyo
- POST `/api/tenants/` (L9) → crear nuevo tenant
- PATCH `/api/tenants/{id}/` (L9) → activar/desactivar/renombrar
- POST `/api/tenants/{id}/agency-access/` (L9) → asignar L8 a este tenant
- DELETE `/api/tenants/{id}/agency-access/{user_id}/` (L9)

### `/api/levels/*` (auth)
- GET `/api/levels/` → `{ levels: [...], permission_catalog: [{key, label_es, label_en}] }`
- PATCH `/api/levels/{level}/` (L9) → label/description/is_reserved
- PATCH `/api/levels/matrix/` (L9) → set matriz completa

### `/api/system-config/*` (L9 only)
- GET `/api/system-config/` → todas las claves con metadata
- PATCH `/api/system-config/` → `{ items: { key: value } }`
- GET `/api/system-config/runtime/` (auth, cualquier nivel) → subset público (keep-warm, etc.)

### `/api/brand/*`
- **GET `/api/brand/public`** (SIN AUTH) — login lo necesita pre-token. Devuelve brand del tenant correspondiente al host, o LogiQ default con `requires_tenant_selector` si hay ≥2 tenants y dominio es raíz.
- GET `/api/brand/` (auth) → brand del tenant actual
- PATCH `/api/brand/` (auth, admin del tenant o L8/L9 para ese tenant) → editar
- POST `/api/brand/logos/` → `{ kind: "login"|"sidebar", data_url, filename }`
- DELETE `/api/brand/logos/{kind}/`
- POST `/api/brand/carrusel/foto/` → `{ data_url }`. Max 12.
- DELETE `/api/brand/carrusel/foto/{idx}/`
- POST `/api/brand/paleta/memoria/` → `{ nombre }`. Max 5.
- DELETE `/api/brand/paleta/memoria/{idx}/`
- POST `/api/brand/paleta/memoria/{idx}/aplicar/`
- POST `/api/brand/paleta/default/` → reset a `PALETA_DEFAULT` de `apps/brand/defaults.py`.

### `/api/global-brand/*` (L9 only)
- GET / PATCH / etc. — mismos endpoints que `/api/brand/` pero contra `GlobalBrand` singleton. Se usa solo desde la consola LogiQ.

### `/api/audit/*` (auth)
- GET `/api/audit/` — query con filtros (tenant, user, action, date range). Per-tenant para L0-L7; cross-tenant para L9; subset asignado para L8.

### `/health` (sin auth)
- GET → `{ status: "ok", version, db: "ok", redis: "ok" }`

---

## 🌍 i18n bilingüe es/en

### Frontend (`react-i18next`)

```ts
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import es from './es.json';
import en from './en.json';

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en } },
  fallbackLng: 'es',
  detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
  interpolation: { escapeValue: false },
});
export default i18n;
```

Uso:
```tsx
const { t } = useTranslation();
return <button>{t('common.save')}</button>;
```

`LanguageToggle.tsx` en topbar cambia idioma + persiste en localStorage + envía PATCH `/api/users/me/preferences/` con `preferred_language`.

### Backend (Django i18n)

```python
# settings.py
LANGUAGE_CODE = 'es'
LANGUAGES = [('es', 'Español'), ('en', 'English')]
LOCALE_PATHS = [BASE_DIR / 'locale']
USE_I18N = True
MIDDLEWARE = [
    ...,
    'django.middleware.locale.LocaleMiddleware',  # entre Session y Common
    ...,
]
```

Uso:
```python
from django.utils.translation import gettext_lazy as _
class UserSerializer(serializers.ModelSerializer):
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(_("Este correo ya está registrado."))
```

Generación de `.po`:
```bash
django-admin makemessages -l en
django-admin compilemessages
```

---

## 🎨 Editor de paleta — núcleo del sistema

> Esta sección es el "oro" rescatado del documento original. Sin cambios mayores excepto: la paleta se guarda en `BrandSettings` por-tenant (antes era singleton), y los strings de UI pasan por `t(...)`.

### Principales editables (23 colores)

**Fijos (no cambian con tema)** — 7 colores:

*Login:*
- `--brand-hero-bg` → `t('brand.color.bg')` ("Color de fondo")
- `--brand-hero-accent` → `t('brand.color.accent')` ("Color de acento")

*Sidebar:*
- `--sidebar-bg` → "Color de fondo"
- `--sidebar-active-text` → "Texto de página activa" (active-bg derivado como mismo color + alpha)
- `--sidebar-section-title` → "Texto de título de sección"
- `--sidebar-text` → "Texto de páginas"
- `--sidebar-disabled-text` → "Texto de páginas próximamente"

**Por tema (Dark + Light)** — 8 cada uno × 2 = 16 colores:
- `--bg-page`, `--bg-card`, `--border`, `--accent`, `--text-primary`, `--info`, `--warning`, `--danger`

> Valores default en [`BRAND.md`](./BRAND.md).

### Derivados calculados (~70 tokens en `lib/paletaDerivada.ts`)

**Helpers**:
```ts
hexToRgb(hex): RGB
rgbToHex(rgb): string
withAlpha(hex, alpha): string                            // → "rgba(r, g, b, a)"
mix(a, b, t): string                                     // mezcla perceptual lineal
pickContrastInk(bgHex): "#000000" | "#FFFFFF"            // luma BT.709
```

**Fórmulas Fijos** (`expandirFixed`):
```ts
// Sidebar
'sidebar-text-secondary': mix(sidebarText, sidebarBg, 0.30)
'sidebar-text-muted':     mix(sidebarText, sidebarBg, 0.55)
'sidebar-active-bg':      withAlpha(sidebarActiveText, 0.16)
'sidebar-hover-bg':       withAlpha(pickContrastInk(sidebarBg), 0.06)
'sidebar-border':         withAlpha(pickContrastInk(sidebarBg), 0.06)

// Brand Hero (Login)
'brand-hero-bg': `linear-gradient(135deg, ${heroBg} 0%, ${mix(heroBg, '#FFFFFF', 0.18)} 60%, ${heroBg} 100%)`
'brand-hero-text':              pickContrastInk(heroBg)
'brand-hero-accent-ink':        pickContrastInk(heroAccent)  // tinta del chip MARCA·ALCANCE
'brand-hero-text-secondary':    mix(heroAccent, pickContrastInk(heroBg), 0.45)
'brand-hero-text-muted':        mix(heroAccent, heroBg, 0.50)
'brand-hero-accent-bg':         withAlpha(heroAccent, 0.18)
'brand-hero-accent-bg-soft':    withAlpha(heroAccent, 0.08)
'brand-hero-divider':           withAlpha(heroAccent, 0.40)
'brand-hero-quote-border':      withAlpha(heroAccent, 0.75)
```

**Fórmulas Temables** (`expandirTema(p, isDark)`): ver código completo en `docs/legacy/SKELETON_PROMPT_PROPOSAL_TerraDeFlora.md` líneas 376-455 (se copia tal cual al implementar; los alphas fueron afinados a mano).

### `applyPalette` — gotcha crítico

```ts
export function applyPalette(raw: PaletaContent): void {
  const root = document.documentElement;
  const p = expandirPaletaCompleta(raw);

  // 1) Limpia inline residual de tokens temables
  for (const k of Object.keys(p.dark || {})) root.style.removeProperty(`--${k}`);
  for (const k of Object.keys(p.light || {})) root.style.removeProperty(`--${k}`);

  // 2) Tokens fijos: inline en :root
  for (const [k, v] of Object.entries(p.fixed || {})) {
    root.style.setProperty(`--${k}`, v);
  }

  // 3) Tokens temables: stylesheet inyectado con selectores correctos
  let style = document.getElementById('brand-themes') as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = 'brand-themes';
    document.head.appendChild(style);
  }
  const darkCss = Object.entries(p.dark || {}).map(([k, v]) => `--${k}:${v};`).join('');
  const lightCss = Object.entries(p.light || {}).map(([k, v]) => `--${k}:${v};`).join('');
  style.textContent = `
    :root, .theme-dark { ${darkCss} }
    .theme-light { ${lightCss} }
  `;
}
```

**Por qué**: si escribes tokens temables como inline styles en `:root`, pisan a `.theme-dark` / `.theme-light` y el toggle deja de funcionar. El `<style>` inyectado con selectores específicos gana.

### Color picker Tailwind v3 + OKLab

`lib/colorPalettes.ts`:
- `TAILWIND_PALETTES`: 22 paletas × 11 shades (slate, gray, zinc, neutral, stone, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose).
- `PALETTE_GROUPS`: agrupadas en Neutros / Cálidos / Frescos.
- `findClosestTailwind(hex)`: **matching perceptual con OKLab** (NO RGB euclidiano — falla con `#D4B996` champagne que queda "cerca" de `red-300` rosa).

Implementación OKLab (verbatim del legacy doc):
```ts
function rgbToOklab({ r, g, b }: RGB): { L: number; a: number; b: number } {
  const lin = (c: number) => { const x = c / 255; return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
  const lr = lin(r), lg = lin(g), lb = lin(b);
  const l = 0.4122214708*lr + 0.5363325363*lg + 0.0514459929*lb;
  const m = 0.2119034982*lr + 0.6806995451*lg + 0.1073969566*lb;
  const s = 0.0883024619*lr + 0.2817188376*lg + 0.6299787005*lb;
  const lp = Math.cbrt(l), mp = Math.cbrt(m), sp = Math.cbrt(s);
  return {
    L: 0.2104542553*lp + 0.7936177850*mp - 0.0040720468*sp,
    a: 1.9779984951*lp - 2.4285922050*mp + 0.4505937099*sp,
    b: 0.0259040371*lp + 0.7827717662*mp - 0.8086757660*sp,
  };
}
```

`TailwindColorPicker.tsx`:
- Botón con swatch + hex chiquito.
- Popover via **React Portal en `document.body`** con `position: fixed` y `getBoundingClientRect` del botón.
- Recalcula en scroll/resize, ajusta clamp si no cabe.
- Botones rápidos: Negro, Blanco.
- "Más cercano: blue-500" en el header del popover.
- Highlight del shade activo.
- Click fuera o Escape cierra.

`InfoIcon.tsx`:
- Chip "(i)" con tooltip custom via Portal — no usar `title=` nativo (1.5s + dependiente de browser).
- Hover/focus muestra; mouseleave/blur oculta. `position: fixed`.

---

## 🖼️ Login (`pages/Login.tsx`)

Estructura:
- Wrapper relative + `BackgroundCarousel` cubriendo viewport.
- Tarjeta central `max-w-5xl rounded-2xl shadow-2xl grid-cols-2`.
- **Izquierda** (form): `background: rgba(255,255,255,0.48)` + `backdrop-filter: blur(16px) saturate(140%)`.
  - Top: chip "MARCA · ALCANCE" — `background: var(--brand-hero-accent)`, `color: var(--brand-hero-accent-ink)`.
  - `t('auth.login.welcome')` + descripción.
  - Si `requires_tenant_selector`: dropdown con tenants disponibles (visible solo si hay ≥2).
  - Inputs identifier + password (con eye toggle).
  - `LanguageToggle` esquina top-right del card form.
  - Recuérdame + ¿Olvidaste tu contraseña?
  - Botón `t('auth.login.submit', { alcance })` → "Entrar al Workspace" o "Enter the Workspace".
  - Footer "Powered by LogiQ".
- **Derecha** (brand hero): `background: var(--brand-hero-bg)` (gradient calculado).
  - Logo grande centrado.
  - Divisor + `${brand.alcance.toUpperCase()}` + divisor.

`BrandProvider` llama `brandApi.getPublic()` al montar. Si devuelve `requires_tenant_selector: true`, el form muestra el selector.

---

## 🪟 AppShell + Sidebar + Topbar

### `RootLayout.tsx` (para tenants)
```tsx
export default function RootLayout() {
  const { user, currentTenant } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!currentTenant && user.level < 8) return <Navigate to="/login" replace />;
  return (
    <TenantProvider tenant={currentTenant}>
      <BrandProvider scope="tenant">
        <PageTitleProvider>
          <AppShell>
            <Outlet />
          </AppShell>
        </PageTitleProvider>
      </BrandProvider>
    </TenantProvider>
  );
}
```

### `PlatformLayout.tsx` (para L9/L8 en consola LogiQ)
```tsx
export default function PlatformLayout() {
  const { user } = useAuth();
  if (!user || user.level < 8) return <Navigate to="/" replace />;
  return (
    <BrandProvider scope="platform">  {/* siempre LogiQ */}
      <PageTitleProvider>
        <AppShell variant="platform">
          <Outlet />
        </AppShell>
      </PageTitleProvider>
    </BrandProvider>
  );
}
```

### `AppShell.tsx`
```tsx
export default function AppShell({ children, variant = 'tenant' }: { children: ReactNode; variant?: 'tenant' | 'platform' }) {
  return (
    <div className="bg-hero min-h-screen flex">
      <Sidebar variant={variant} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar variant={variant} />
        <main className="flex-1 overflow-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
```

### `Topbar.tsx`
- `<h1>{usePageTitleValue()}</h1>` a la izquierda.
- A la derecha: `TenantSwitcher` (solo L8/L9) · Help · Bell · `LanguageToggle` · `ThemeToggle` · `UserMenu`.

### `App.tsx`
```tsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route element={<RootLayout />}>
    <Route path="/" element={<Navigate to="/usuarios" replace />} />
    <Route path="/usuarios" element={<Suspense fallback={<PageFallback />}><UsuariosPage /></Suspense>} />
    <Route path="/configuracion" element={<MinLevelGuard min={7}><Suspense ...><ConfiguracionPage /></Suspense></MinLevelGuard>} />
    <Route path="/auditoria" element={<Suspense ...><AuditoriaPage /></Suspense>} />
  </Route>
  <Route element={<PlatformLayout />}>
    <Route path="/platform" element={<Navigate to="/platform/tenants" replace />} />
    <Route path="/platform/tenants" element={<Suspense ...><TenantsPage /></Suspense>} />
    <Route path="/platform/global-settings" element={<Suspense ...><GlobalSettingsPage /></Suspense>} />
    <Route path="/platform/agency-access" element={<Suspense ...><AgencyAccessPage /></Suspense>} />
  </Route>
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### `vite.config.ts`
```ts
function has(id: string, needle: string) { return id.indexOf(needle) !== -1; }
function manualChunks(id: string) {
  if (!has(id, 'node_modules') && !has(id, '/src/')) return undefined;
  if (has(id, 'node_modules')) {
    if (has(id, 'react-router')) return 'vendor-router';
    if (has(id, 'i18next')) return 'vendor-i18n';
    if (has(id, 'react')) return 'vendor-react';
    return 'vendor';
  }
  if (has(id, '/src/lib/api/')) return 'app-api';
  if (has(id, '/src/components/ui/')) return 'app-ui';
  if (has(id, '/src/components/icons/')) return 'app-ui';
  if (has(id, '/src/lib/')) return 'app-lib';
}
```

**Nota**: usar `indexOf` no `includes` — Vite compila este config con target ES5.

---

## 👤 UsuariosPage (tenant scope)

- Header con título + breadcrumb + CTA `t('users.new')`.
- Tabla: nombre · email · username · nivel · permisos · acciones.
- Skeleton mientras carga.
- `UsuarioFormDrawer` para crear/editar:
  - Inputs: first_name, last_name_paterno, last_name_materno, email, username (lowercase), password (solo crear), level (selector con niveles ≤ self.level), permission overrides (multi-select del catálogo).
  - Validación: level ≤ self.level; no permitir borrar/editar a otros de mismo o mayor nivel.
  - Acciones por row: Edit · Reset password · Delete.

Backend `/api/users/*` enforce jerarquía siempre.

---

## 🏢 TenantsPage (platform scope — L9/L8)

L9: ve todos los tenants, puede crear/desactivar.
L8: ve solo los asignados, lectura + edición del brand del tenant (no crea ni desactiva).

- Tabla: slug · name · is_active · # usuarios · created_at · acciones.
- CTA "+ Nuevo tenant" (solo L9).
- `TenantFormDrawer`: slug (auto-generado al escribir name), name, is_active.
- Al crear un tenant: crea automáticamente su `BrandSettings` con paleta default LogiQ, y crea un usuario admin inicial L7 con el email que el L9 indique.

`AgencyAccessPage` (solo L9): tabla L8s con qué tenants tienen asignados. Editor para asignar/revocar.

---

## ⚙️ ConfiguracionPage (per-tenant — admin del tenant o L8/L9 sobre ese tenant)

Tabs:
1. **Niveles** — label/description editables + toggle Visible (`is_reserved` invertido).
2. **Permisos** — matriz nivel × permiso (checkbox grid). Filtra niveles ocultos.
3. **Brand** — sub-navegación.
4. **Licencia** — placeholder.

**Dedupe del fetch `/levels`**: NivelesTab y PermisosTab consumen el MISMO endpoint. Padre `ConfiguracionPage` lo fetcha una vez y pasa `data` + `onReload` a ambos hijos por props.

### Tab Brand (`BrandTab.tsx`)

Layout split:
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
  <div className="lg:col-span-2 space-y-5">
    {/* Sub-nav pill: Brand Name · Paleta · Logos · Carrusel */}
    {/* Contenido del sub-tab activo */}
  </div>
  <div className="lg:col-span-1">
    <LoginPreview />  {/* Sticky */}
  </div>
</div>
```

**Orden de sub-tabs**: Brand Name → Paleta → Logos → Carrusel.
**Razón**: Logos usa los colores de Paleta como fondo del preview. Configurar paleta primero.

Sub-nav: botones pill (no tabs anidados tradicionales — visualmente repetitivo).

### Sub-tabs
- **`BrandNameSub.tsx`**: form marca + alcance + previews inline.
- **`PaletaSub.tsx`**: Fijos colapsables + toggle Light/Dark + memorias (max 5) + aplicación en vivo. Al guardar PATCH `/api/brand/` con solo principales.
- **`LogosSub.tsx`**: 2 slots (login + sidebar). Preview con CSS vars. Max 500 KB. FileReader → data URL.
- **`CarruselSub.tsx`**: segundos por foto + grid 2/3/4 cols + max 12 fotos.
- **`LoginPreview.tsx`**: sticky `top-4`, miniatura del Login que reacciona en vivo a los CSS vars.

---

## 🛣️ Plan de implementación (commit-por-commit)

### Fase 0 — Setup ✅
- [x] `chore(repo): inicializar repositorio con CLAUDE.md y .gitignore`
- [x] `docs(brand): documentar paleta de colores LogiQ`
- [x] `docs(plan): crear PROJECT_PLAN.md inicial`
- [x] `assets(brand): agregar logos LogiQ`
- [ ] `docs(skeleton): crear SKELETON_GUIDE.md`
- [ ] `chore(deploy): docker-compose.yml + railway.toml + Dockerfiles`

### Fase 1 — Backend core
1. `chore(backend): scaffold Django + DRF + simplejwt + Celery + requirements.txt`
2. `feat(tenants): model Tenant + migrations`
3. `feat(accounts): custom User model + Level + PermissionMatrix + UserPermissionOverride + AgencyTenantAccess + migrations`
4. `feat(accounts): JWT login adaptativo + me + refresh + switch-tenant`
5. `feat(core): TenantMiddleware + TenantScopedModel + RequireLevel permission classes`
6. `feat(accounts): /api/users/* CRUD jerárquico`
7. `feat(tenants): /api/tenants/* + /api/agency-access/*`
8. `feat(levels): /api/levels/* + matriz`
9. `feat(system_config): SystemConfig + defaults + endpoints L9`
10. `feat(brand): BrandSettings + GlobalBrand + endpoints + defaults LogiQ`
11. `feat(audit): AuditLog model + service + endpoints`
12. `i18n(backend): configurar Django i18n + .po inicial es/en`
13. `feat(core): /health endpoint + readiness checks`

### Fase 2 — Frontend foundation
14. `chore(frontend): scaffold Vite + React 18 + TS estricto + Tailwind v3 + i18next`
15. `feat(frontend): tsconfig strict + tailwind.config + vite manualChunks + index.css con tokens default`
16. `i18n(frontend): config react-i18next + es.json + en.json iniciales + LanguageDetector`
17. `feat(api): lib/api/client.ts + ApiError + auth.ts + index.ts`
18. `feat(auth): AuthProvider + useAuth + token persistence`
19. `feat(brand): BrandProvider + applyPalette + paletaDerivada + colorPalettes + OKLab`
20. `feat(tenant): TenantProvider + TenantSwitcher`
21. `feat(theme): ThemeProvider + ThemeToggle + .theme-dark / .theme-light`

### Fase 3 — UI base
22. `feat(ui): Button + Card + Drawer + Modal + TextField + Tabs + Skeleton + IconButton`
23. `feat(ui): InfoIcon con Portal`
24. `feat(ui): TailwindColorPicker con Portal + matching OKLab`
25. `feat(ui): LanguageToggle + UserMenu + EmptyState + Badge + Avatar`

### Fase 4 — Layout
26. `feat(layout): AppShell + RootLayout + PlatformLayout + Sidebar + Topbar`
27. `feat(layout): SidebarItem prefetch al hover + PREFETCH_MAP + navConfig por rol`

### Fase 5 — Login
28. `feat(login): pantalla Login adaptativa (selector tenant si requires_tenant_selector)`
29. `feat(login): BackgroundCarousel + integración brand.carrusel_fotos`

### Fase 6 — Users
30. `feat(users): UsuariosPage + UsuariosTable + UsuarioFormDrawer`

### Fase 7 — Configuration (tenant-scope)
31. `feat(config): ConfiguracionPage skeleton + tab Niveles + tab Permisos (dedupe fetch)`
32. `feat(config): tab Licencia placeholder`

### Fase 8 — Brand editor ⭐
33. `feat(brand): tab Brand · BrandNameSub`
34. `feat(brand): tab Brand · PaletaSub (Fijos + Light + Dark + memorias)`
35. `feat(brand): tab Brand · LogosSub`
36. `feat(brand): tab Brand · CarruselSub`
37. `feat(brand): LoginPreview sticky lateral`

### Fase 9 — Platform (L9/L8)
38. `feat(platform): TenantsPage + creación de tenants + auto-seed brand default`
39. `feat(platform): AgencyAccessPage`
40. `feat(platform): GlobalSettingsPage + GlobalBrand editor`

### Fase 10 — Audit + polish
41. `feat(audit): AuditoriaPage + filtros`
42. `perf(build): manualChunks tuned + chunk size analysis`
43. `ux: skeletons en todas las pages async`
44. `docs(readme): instrucciones clonado + dev + deploy + crear nuevo tenant`

### Fase 11 — Skill `Crear-app`
45. `skill(crear-app): diseñar skill que clona la plantilla y la adapta`
46. Validación creando 1-2 apps reales con la skill.

---

## 🧪 Cómo validar el esqueleto

1. **Login mono-tenant**: con 1 tenant activo, login NO muestra selector. Cambias `is_active` del único tenant → no puedes loguear.
2. **Login multi-tenant**: activas un 2.º tenant → al volver al login, aparece el selector. Cada tenant muestra su propio brand al entrar a su URL.
3. **Brand en vivo**: cambias marca/alcance en Brand Name → chip del Login y botón "Entrar al X" cambian. Tab del browser dice `marca · alcance`.
4. **Logos en vivo**: subes un PNG → al instante el sidebar y favicon cambian.
5. **Paleta en vivo**: cambias accent → toda la app se repinta (botones, links, hover). "Back to default" → vuelve.
6. **Toggle Dark/Light** funciona en cualquier paleta personalizada (test crítico).
7. **Carrusel**: subes 2-3 fotos → logout → ves carrusel rotando con tu intervalo.
8. **Memorias**: guardas 2 paletas distintas → aplicas una → aplicas la otra.
9. **i18n**: cambias toggle ES↔EN → toda la UI se traduce sin recargar. Recargas página → idioma persiste. Backend devuelve errores en el idioma del header.
10. **Users jerárquico**: creas un L5 desde un L9 → ese L5 NO ve/edita otros L5+. Reset password aplica `standard_password`.
11. **Tenant aislamiento**: usuario L5 del tenant A NO ve usuarios ni datos del tenant B. Manipular `X-Tenant-Slug` no salta el aislamiento.
12. **L8 agencia**: L8 asignado a tenants A y B; ve y administra solo esos; tenant switcher muestra solo esos dos.
13. **L9 global**: ve consola plataforma. Crea tenant nuevo → automáticamente tiene BrandSettings con defaults LogiQ.

---

## ⚠️ Gotchas (no los repitas)

### Heredados del legacy (siguen aplicando):

1. **No escribas tokens temables como inline styles en `:root`**. Pisan a `.theme-dark` / `.theme-light` y el toggle Dark↔Light deja de funcionar. Usa el `<style id="brand-themes">` inyectado.

2. **`extractFixedPrincipales` y `extractThemedPrincipales` deben validar `isHex(...)`** antes de aceptar un valor del backend. Si en una versión anterior se guardaron derivados (gradients, rgba) como si fueran principales, el editor mostrará strings horribles. Defensivo: si no es hex puro, usa default.

3. **Al guardar paleta, manda SOLO los principales** (no expandidos). Si cambias fórmulas, las paletas viejas se recalculan automáticamente.

4. **El `find closest` del color picker en RGB euclidiano falla feo**. `#D4B996` (champagne) queda "cerca" de `red-300` (rosa). Usa OKLab.

5. **Popovers de pickers y tooltips DEBEN ir via Portal**. Acordeones tienen `overflow:hidden` (necesario para el border-radius) y clipan dropdowns embebidos.

6. **`AppShell` NO debe vivir dentro de cada page**. Si lo haces, cada navegación remontea Sidebar/Topbar → duplica fetches, parpadea el tema/brand. Layout route compartido obligatorio.

7. **`document.title` se setea desde BrandProvider**, no desde `usePageTitle`. El tab del browser es identidad de marca.

8. **Defaults del sistema separados de la marca**. `lib/systemDefaults.ts` centraliza paths en `/public/system-defaults/` (1 asset por slot). Que NO sean assets específicos del cliente — si alguien hace fork y no sube nada, no debe ver la marca de tu cliente.

9. **El chip "ALCANCE" del Login NO puede tener color hardcoded**. Usa `var(--brand-hero-accent)` para bg y `var(--brand-hero-accent-ink)` para text-color.

10. **`vite.config.ts` con `manualChunks` debe usar `id.indexOf(needle) !== -1` no `id.includes(...)`**. Vite compila el config con target ES5.

### Nuevos (multi-tenant + Django + i18n):

11. **Custom User model**: si vas a usar `AUTH_USER_MODEL = 'accounts.User'`, debes definirlo **antes de la primera `migrate`**. Cambiarlo después es doloroso (requiere reset de DB o migración manual compleja). Definir desde Fase 1 commit 3.

12. **`User.tenant` nullable**: SOLO L8 y L9 tienen `tenant=NULL`. L0-L7 deben tener tenant. Validar en `clean()` del modelo y en serializer del POST `/api/users/`.

13. **TenantMiddleware orden importa**: debe ir DESPUÉS de `AuthenticationMiddleware` (necesita `request.user`) pero ANTES de `LocaleMiddleware` si las traducciones dependen de preferencias del tenant.

14. **JWT con tenant en el claim**: el JWT debe llevar `tenant_slug` en el payload. Si solo llevas `user_id`, cada request tiene que hacer una query extra para resolver tenant. Y permite que el frontend cambie de tenant sin re-login (POST `/api/auth/switch-tenant` re-emite JWT con tenant nuevo).

15. **TenantScopedManager: cuidado con migraciones**. Django ejecuta migraciones sin `request.tenant`, así que el manager debe fallback a `all()` cuando no hay tenant en contexto. Usar `.for_request(request)` explícitamente en views, no confiar en el default manager.

16. **`makemessages` de Django**: por defecto NO escanea archivos `.py` dentro de virtualenvs. Pero sí escanea `apps/` — bien. Para templates HTML/JS, configurar `LOCALE_PATHS` y usar `{% load i18n %}`.

17. **react-i18next con Suspense**: si cargas traducciones async, el primer render puede mostrar las llaves crudas (`auth.login.title` en pantalla). Cargar `es.json` y `en.json` sincrónicos en el bundle inicial — son chicos.

18. **`Accept-Language` vs `preferred_language`**: si el usuario está logueado, prevalece `preferred_language`; si no, `Accept-Language` del browser. Documentar este orden en `core/middleware.py`.

19. **CORS en Railway**: el frontend (estático) y el backend (web service) suelen vivir en dominios separados. Configurar `CORS_ALLOWED_ORIGINS` desde variable de entorno + permitir el dominio de preview de Railway PR builds.

20. **Celery worker en Railway**: necesita su propio servicio en `railway.toml`. No correr con `--beat` y workers en el mismo proceso en prod — separar `celery -A plantilla worker` y `celery -A plantilla beat`.

---

## 🤖 Cómo usar este documento

### Para construir el esqueleto desde cero (en sesión nueva)

Pega este archivo + `CLAUDE.md` + `BRAND.md` + `PROJECT_PLAN.md` como contexto al agente. Instrucción base:

> "Vamos a construir el esqueleto descrito en `SKELETON_GUIDE.md`. Empieza por la **Fase 1 commit 1** (scaffold backend). Antes de cada commit, dime qué vas a hacer en una línea y procede. Build local limpio antes de cada `git push`. Co-author en cada commit. Pregúntame al final de cada commit si quiero continuar al siguiente."

### Para la futura skill `Crear-app`

La skill leerá:
1. `CLAUDE.md` → convenciones globales
2. `SKELETON_GUIDE.md` → este archivo, fuente de verdad de la arquitectura
3. `BRAND.md` → paleta default

Y le preguntará al usuario el nombre de la app + dominio + módulos extra, clonará la plantilla, renombrará tokens, ajustará `brand.marca` inicial, y dejará lista para `git push` → deploy.

---

*Fin del documento. Actualizar cada vez que se cambie una decisión de arquitectura o se agregue un patrón reutilizable.*
