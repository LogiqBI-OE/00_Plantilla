# Prompt: Esqueleto SaaS reusable

> ⚠️ **DOCUMENTO LEGACY — REFERENCIA HISTÓRICA**
>
> Este archivo es la guía técnica que se usó para construir **Terra de Flora** con stack **FastAPI + SQLAlchemy + Pydantic** y arquitectura **single-tenant**.
>
> **Está aquí solo como referencia histórica.** La guía vigente del proyecto `00_Plantilla` es [`SKELETON_GUIDE.md`](../../SKELETON_GUIDE.md), que adapta este conocimiento a:
> - Backend **Django + DRF** (no FastAPI)
> - Migraciones **nativas de Django** (no `seed.py` defensivo)
> - **Multi-tenancy real** (no singleton)
> - **i18n bilingüe es/en** (no monolingüe)
> - Niveles cross-tenant (L9 global, L8 agencia, L0-L7 single-tenant)
>
> Lo que conserva valor de este documento legacy: el sistema de paleta (23 principales + ~70 derivados), las fórmulas de color (`mix`, `withAlpha`, `pickContrastInk`), el matching OKLab, el patrón `AppShell` como Layout Route, los Portals para pickers/tooltips, los `manualChunks` de Vite, y los 10 gotchas. Todo eso fue migrado a `SKELETON_GUIDE.md`.

---

# Contenido original (verbatim)

> **Cómo usarlo**: copia este archivo completo y pégalo como primer mensaje en
> una sesión nueva de Claude Code. Trabaja sobre un repo vacío (o casi vacío).
> Te va a guiar para construir el esqueleto exacto que ya validamos en Terra
> de Flora: Login con branding configurable, AppShell estable, CRUD de
> usuarios, y System Settings con editor visual de marca, paleta de colores y
> assets.

---

## 🎯 Goal

Construye el **esqueleto base de un SaaS multitenant ligero** con:

1. **Login** con logos, hero y colores controlados desde System Settings → Brand. Sin tocar código para rebrand.
2. **AppShell estable** (Sidebar + Topbar + main) que no se remontea entre navegaciones.
3. **CRUD de usuarios** con drawer de edición y jerarquía de niveles.
4. **System Settings** (solo L9) con tabs: Generales · Niveles · Permisos · Brand · Licencia.
5. **Editor de Brand** con sub-navegación (Brand Name · Paleta · Logos · Carrusel) y preview lateral del Login en vivo.
6. **Editor de paleta**: solo ~23 colores principales editables; ~70 derivados (text muted, hover, halos, gradients, alphas semánticos) se calculan con fórmulas. Color picker con paletas Tailwind v3 (Slate/.../Rose × 50-950) y matching perceptual OKLab.

No incluye lógica de negocio específica (proyectos, cotizaciones, calendario, etc.). Es la base sobre la que se construyen.

---

## 🧱 Stack (no negociable)

- **Backend**: FastAPI + SQLAlchemy v2 + Pydantic v2 + Postgres
- **Frontend**: React 18 + Vite + TypeScript estricto + Tailwind CSS
- **Auth**: JWT con TTL configurable desde System Settings
- **Deploy**: Railway (backend container + frontend estático)
- **Branch única `main`** — push directo = deploy
- **Sin Alembic** — migraciones ligeras en `backend/app/seed.py` (idempotentes, defensivas, cada `ALTER` en su propia transacción con try/except)
- **Sin cache de datos en frontend** — todo en vivo del backend cada vez. Excepción: `localStorage` explícito para token de sesión y "remember email" del login

---

## 📁 Estructura de carpetas

```
repo/
├── CLAUDE.md
├── PROJECT_PLAN.md
├── backend/
│   └── app/
│       ├── core/
│       │   ├── config.py              (Settings con DATABASE_URL, SECRET_KEY, SEED_*)
│       │   ├── deps.py                (get_current_user, require_level_N)
│       │   ├── security.py            (hash_password, verify_password, JWT)
│       │   ├── system_config_defaults.py (claves del SystemConfig)
│       │   └── brand_defaults.py      (PALETA_DEFAULT, MAX_*, defaults strings)
│       ├── models/
│       │   ├── __init__.py            (re-export para SQLAlchemy)
│       │   ├── user.py
│       │   ├── level.py
│       │   ├── level_permission.py
│       │   ├── system_config.py
│       │   ├── brand_config.py
│       │   └── login_event.py         (opcional: log de logins)
│       ├── schemas/
│       │   ├── user.py
│       │   ├── system_config.py
│       │   └── brand_config.py
│       ├── routers/
│       │   ├── auth.py
│       │   ├── users.py
│       │   ├── levels.py
│       │   ├── system_config.py
│       │   └── brand.py
│       ├── services/
│       │   ├── system_config_service.py
│       │   ├── levels_service.py
│       │   └── brand_service.py
│       ├── db.py                      (engine, SessionLocal, get_db)
│       ├── seed.py                    (Base.metadata.create_all + migraciones ligeras + seed)
│       └── main.py                    (FastAPI + CORS + routers)
└── frontend/
    ├── vite.config.ts                 (manualChunks)
    ├── tsconfig.json (strict: true)
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html                     (<title> fallback, favicons estáticos)
    └── src/
        ├── main.tsx                   (Providers: Brand > Theme > Router > Auth)
        ├── App.tsx                    (Routes con React.lazy + Layout Route)
        ├── index.css                  (tokens CSS :root + .theme-dark + .theme-light)
        ├── lib/
        │   ├── api/
        │   │   ├── client.ts          (fetch + ApiError + token + formatErrorDetail)
        │   │   ├── auth.ts
        │   │   ├── users.ts
        │   │   ├── systemConfig.ts
        │   │   ├── levels.ts
        │   │   ├── brand.ts
        │   │   └── index.ts           (re-exports)
        │   ├── auth.tsx               (AuthProvider + useAuth)
        │   ├── theme.tsx              (ThemeProvider + useTheme)
        │   ├── brand.tsx              (BrandProvider + useBrand + applyPalette)
        │   ├── pageTitle.tsx          (PageTitleProvider + usePageTitle + usePageTitleValue)
        │   ├── colorPalettes.ts       (Tailwind v3 paletas + OKLab utils + helpers)
        │   ├── paletaDerivada.ts      (principales + fórmulas de derivación)
        │   ├── systemDefaults.ts      (1 asset por slot, paths a /public/system-defaults/)
        │   ├── usePolling.ts          (visibility-aware)
        │   └── useKeepWarm.ts         (opt-in ping /health)
        ├── components/
        │   ├── ui/
        │   │   ├── Button.tsx
        │   │   ├── Card.tsx
        │   │   ├── Drawer.tsx
        │   │   ├── Modal.tsx
        │   │   ├── TextField.tsx
        │   │   ├── Tabs.tsx
        │   │   ├── Skeleton.tsx       (SkeletonBox, SkeletonTable, SkeletonCards)
        │   │   ├── ThemeToggle.tsx
        │   │   ├── UserMenu.tsx
        │   │   ├── IconButton.tsx
        │   │   ├── InfoIcon.tsx       (tooltip via Portal)
        │   │   ├── TailwindColorPicker.tsx (Portal + OKLab matching)
        │   │   ├── EmptyState.tsx
        │   │   ├── Badge.tsx
        │   │   └── Avatar.tsx
        │   ├── icons/Icons.tsx        (heroicons inline o lucide)
        │   ├── layout/
        │   │   ├── AppShell.tsx       (no recibe title prop; lo lee del context)
        │   │   ├── RootLayout.tsx     (auth gate + AppShell + <Outlet/>)
        │   │   ├── Sidebar.tsx
        │   │   ├── SidebarSection.tsx
        │   │   ├── SidebarItem.tsx    (prefetch al hover via PREFETCH_MAP)
        │   │   ├── Topbar.tsx         (lee título del context)
        │   │   ├── NewProjectButton.tsx (CTA principal — adáptalo a tu dominio)
        │   │   └── navConfig.tsx      (NAV_SECTIONS)
        │   └── BackgroundCarousel.tsx (fade entre imágenes)
        └── pages/
            ├── Login.tsx
            ├── usuarios/
            │   ├── UsuariosPage.tsx
            │   └── sections/
            │       ├── UsuariosTable.tsx
            │       └── UsuarioFormDrawer.tsx
            └── configuracion/
                ├── ConfiguracionPage.tsx
                └── sections/
                    ├── GeneralesTab.tsx
                    ├── NivelesTab.tsx
                    ├── PermisosTab.tsx
                    ├── BrandTab.tsx         (contenedor con sub-nav + LoginPreview lateral)
                    ├── LicenciaTab.tsx      (placeholder por ahora)
                    ├── ConfigItemEditor.tsx
                    ├── LevelsDescriptionsTable.tsx
                    ├── LevelsPermissionsMatrix.tsx
                    └── brand/
                        ├── BrandNameSub.tsx
                        ├── PaletaSub.tsx
                        ├── LogosSub.tsx
                        ├── CarruselSub.tsx
                        └── LoginPreview.tsx
```

---

## 🔑 Convenciones (no negociar sin avisar al usuario)

### Frontend
- **AppShell vive en layout route compartido** (`RootLayout`). Las pages NO envuelven `<AppShell>` ellas mismas — solo renderizan su contenido. React Router mantiene AppShell estable; el Topbar y Sidebar no se remontan. Critical para no duplicar fetches del badge ni re-revalidar el logo en cada navegación.
- **`usePageTitle('título')`** solo setea el `h1` visual del Topbar. **`document.title` del browser** es FIJO y se setea desde `BrandProvider` como `${brand.marca} · ${brand.alcance}`.
- **Botón Guardar siempre en top-right**, no inferior. Excepción: drawers (Cancelar/Guardar en footer es patrón estándar de modal).
- **Skeleton loaders** (no `Cargando…` plano) para sensación de velocidad.
- **Prefetch al hover** en sidebar — `PREFETCH_MAP` con `() => import('./page')`.
- **Pages cargan en lazy chunks** con `React.lazy()`. Cualquier ruta nueva en `App.tsx` debe ir con lazy + entrada en `PREFETCH_MAP`.
- **`usePolling(callback, ms, enabled)`** para polling — pausa cuando tab no está visible. No usar `setInterval` raw.
- **Vite `manualChunks`** consolida UI/API/vendor en chunks reutilizables (evita la cascada de 30+ requests pequeños de Rollup default).
- **Color picker en Portal** con `position:fixed` — nunca embebido en flujo normal porque ancestros con `overflow:hidden` lo recortan.
- **Tooltips custom via Portal** — no usar `title=` nativo (tarda 1.5s y depende del browser).

### Backend
- **Sin N+1**: cada router con listas precarga lookups en batch. Crea caches (`MaterialInfoCache`, `_badges_for_all`, etc.) si se necesita.
- **Migraciones ligeras en `seed.py`** — cada `ALTER` en su propia transacción con try/except. `_run_lightweight_migrations()` se llama al boot.
- **JWT TTL configurable** desde `SystemConfig` (clave `token_lifetime_days`).
- **Endpoints públicos mínimos** — solo `/auth/login`, `/brand/public` y `/health`. Todo lo demás requiere auth.

### Commits
- Scope chico: `feat(brand): ...`, `fix(login): ...`, `perf(...)`, `refactor(...)`, `ux(...)`, `chore(...)`.
- Co-author en cada commit:
  `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`
- Branch única `main`. Push directo dispara deploy en Railway.
- Verificar build local antes de pushear cambios grandes: `cd frontend && npx tsc -b`.

---

## 🗄️ Modelo de datos

### User
```python
class User(Base):
    id: int
    email: str (unique)
    username: str | None (unique, lowercase)
    hashed_password: str
    first_name: str
    last_name_paterno: str
    last_name_materno: str
    full_name: str  # compose_full_name
    role: UserRole  # enum derivado de level
    level: int  # 0-9
    permissions: list[str]  # JSON
    is_active: bool
    last_login_at: datetime | None
    created_at, updated_at
```

### Level
```python
class Level(Base):
    level: int (PK, 0-9)
    label: str
    description: str
    is_reserved: bool  # hidden / disabled del selector
```

### LevelPermission
```python
class LevelPermission(Base):
    level: int (FK)
    permission: str  # "view_users", "manage_users", "manage_config", etc.
    PRIMARY KEY (level, permission)
```

### SystemConfig (key-value)
```python
class SystemConfig(Base):
    key: str (PK, max 64)
    value: str (Text)
    updated_at
```

Claves esperadas en `core/system_config_defaults.py`:
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
]
```

### BrandConfig (singleton — siempre id=1)
```python
class BrandConfig(Base):
    id: int (PK, default=1)
    marca: str  # "Mi Empresa"
    alcance: str  # "Workspace", "Admin", "Showroom"
    logo_login: str | None  # data URL base64
    logo_sidebar: str | None  # data URL base64
    logo_login_filename: str | None  # "mi-logo.png" (informativo)
    logo_sidebar_filename: str | None
    paleta_actual: dict  # JSON { fixed: {...}, dark: {...}, light: {...} } — solo principales
    paletas_memoria: list  # JSON list[ { nombre, guardada_at, paleta } ], max 5
    carrusel_fotos: list  # JSON list[data URL], max 12
    carrusel_segundos: float  # default 4.5
    updated_at
```

---

## 🌐 Endpoints backend

### `/auth/login` (sin auth)
- POST `{ identifier, password }` → `{ access_token, user_id, email, username, full_name, role, level, level_label, permissions, ... }`
- `identifier` acepta email o username (lowercase).
- TTL del JWT viene de `SystemConfig.token_lifetime_days`.

### `/users/*` (auth, jerárquico por level)
- GET `/users` → lista (L5+ ve hasta su level)
- POST `/users` → crear (solo niveles ≤ self)
- PATCH `/users/{id}` → actualizar metadata (level, permissions, full_name)
- POST `/users/{id}/reset-password` → aplica `standard_password`
- DELETE `/users/{id}` → solo si target.level < self.level

### `/levels/*` (auth)
- GET `/levels` → `{ levels: [{ level, label, description, is_reserved, permissions: [str] }], permission_catalog: [{ key, label, description }] }`
- PATCH `/levels/{level}` → actualizar label/description/is_reserved (L9)
- PATCH `/levels/matrix` → setear la matriz completa de permisos (L9)

### `/system-config/*`
- GET `/system-config` (L9) → lista de todas las claves con metadata
- PATCH `/system-config` (L9) → `{ items: { key: value } }`
- GET `/system-config/runtime` (auth) → `{ keep_warm_ping_enabled, keep_warm_ping_interval_minutes }`

### `/brand/*`
- **GET `/brand/public`** (SIN AUTH) — el Login lo necesita pre-token. Devuelve marca + alcance + logos + paleta_actual + carrusel + carrusel_segundos.
- GET `/brand` (auth)
- PATCH `/brand` (L9) — `{ marca?, alcance?, paleta_actual?, carrusel_segundos? }`
- POST `/brand/logos` (L9) — `{ kind: "login"|"sidebar", data_url: "data:image/...;base64,...", filename: "mi-logo.png" }`
- DELETE `/brand/logos/{kind}` (L9)
- POST `/brand/carrusel/foto` (L9) — `{ data_url }`. Max 12 fotos.
- DELETE `/brand/carrusel/foto/{idx}` (L9)
- POST `/brand/paleta/memoria` (L9) — `{ nombre }`. Guarda paleta_actual como memoria. Max 5.
- DELETE `/brand/paleta/memoria/{idx}` (L9)
- POST `/brand/paleta/memoria/{idx}/aplicar` (L9)
- POST `/brand/paleta/default` (L9) — resetea a `PALETA_DEFAULT` hardcoded.

---

## 🎨 Editor de paleta — núcleo del sistema

### Principales editables (23 colores en total)

**Fijos (no cambian con el tema)** — 7 colores:

*Login:*
- `--brand-hero-bg` → "Color de fondo" (yo armo el gradient a partir de este)
- `--brand-hero-accent` → "Color de acento"

*Sidebar:*
- `--sidebar-bg` → "Color de fondo"
- `--sidebar-active-text` → "Texto de página activa" (active-bg se deriva como mismo color + alpha)
- `--sidebar-section-title` → "Texto de título de sección"
- `--sidebar-text` → "Texto de páginas"
- `--sidebar-disabled-text` → "Texto de páginas próximamente"

**Por tema (Dark + Light)** — 8 cada uno × 2 = 16 colores:
- `--bg-page` → "Color de fondo de página"
- `--bg-card` → "Color de fondo de tarjetas"
- `--border` → "Color de bordes"
- `--accent` → "Color de acento"
- `--text-primary` → "Color de texto principal"
- `--info` → "Color de éxito / info"
- `--warning` → "Color de advertencia"
- `--danger` → "Color de error"

### Derivados calculados (~70 tokens — `lib/paletaDerivada.ts`)

**Helpers**:
```ts
// hex ⟷ RGB
hexToRgb(hex: string): RGB
rgbToHex(rgb: RGB): string

// alpha
withAlpha(hex: string, alpha: number): string  // → "rgba(r, g, b, a)"

// mezcla perceptual lineal
mix(a: string, b: string, t: number): string  // 0=a, 1=b, 0.5=mitad

// contrast
pickContrastInk(bgHex: string): "#000000" | "#FFFFFF"  // luma BT.709
```

**Fórmulas Fijos** (`expandirFixed`):
```ts
// Sidebar
'sidebar-text-secondary': mix(sidebarText, sidebarBg, 0.30)
'sidebar-text-muted':     mix(sidebarText, sidebarBg, 0.55)
'sidebar-active-bg':      withAlpha(sidebarActiveText, 0.16)
'sidebar-hover-bg':       withAlpha(pickContrastInk(sidebarBg), 0.06)
'sidebar-border':         withAlpha(pickContrastInk(sidebarBg), 0.06)

// Brand Hero (Login right)
'brand-hero-bg': `linear-gradient(135deg, ${heroBg} 0%, ${mix(heroBg, '#FFFFFF', 0.18)} 60%, ${heroBg} 100%)`
'brand-hero-text':              pickContrastInk(heroBg)
'brand-hero-accent-ink':        pickContrastInk(heroAccent)   // ¡importante! tinta del chip WORKSPACE
'brand-hero-text-secondary':    mix(heroAccent, pickContrastInk(heroBg), 0.45)
'brand-hero-text-muted':        mix(heroAccent, heroBg, 0.50)
'brand-hero-accent-bg':         withAlpha(heroAccent, 0.18)
'brand-hero-accent-bg-soft':    withAlpha(heroAccent, 0.08)
'brand-hero-divider':           withAlpha(heroAccent, 0.40)
'brand-hero-quote-border':      withAlpha(heroAccent, 0.75)
```

**Fórmulas Temables** (`expandirTema(p, isDark)`):

Constants:
```ts
ALPHAS_DARK = {
  bgInput: 0.04, bgHover: 0.05, bgToggle: 0.06, bgMenu: 0.78,
  borderSoft: 0.40, borderStrong: 0.30,
  accentBgSoft: 0.16, accentBgSofter: 0.07, accentShadow: 0.35, accentRing: 0.30,
  semBg: 0.15, semBorder: 0.40,
  shadowOpacity: 0.55, ringOpacity: 0.06,
  heroHaloA: 0.12, heroHaloB: 0.06,
}
ALPHAS_LIGHT = {
  bgInput: 0.05, bgHover: 0.04, bgToggle: 0.10, bgMenu: 0.78,
  borderSoft: 0.50, borderStrong: 0.25,
  accentBgSoft: 0.10, accentBgSofter: 0.04, accentShadow: 0.30, accentRing: 0.20,
  semBg: 0.08, semBorder: 0.30,
  shadowOpacity: 0.18, ringOpacity: 0.06,
  heroHaloA: 0.06, heroHaloB: 0.03,
}
```

Lógica:
```ts
const ink = pickContrastInk(bgPage)  // ink contrario al fondo

return {
  // Surfaces
  'bg-page':            bgPage,
  'bg-page-2':          mix(bgPage, ink, 0.03),
  'bg-card':            bgCard,
  'bg-card-soft':       withAlpha(bgCard, 0.6),
  'bg-elevated':        mix(bgPage, bgCard, 0.5),
  'bg-elevated-strong': mix(bgCard, ink, 0.04),
  'bg-input':           withAlpha(ink, a.bgInput),
  'bg-hover':           withAlpha(ink, a.bgHover),
  'bg-toggle':          withAlpha(ink, a.bgToggle),
  'bg-menu':            withAlpha(bgCard, a.bgMenu),
  'shadow-menu':        `0 16px 48px ${withAlpha(isDark ? '#000' : textPrimary, a.shadowOpacity)},
                         0 0 0 1px ${withAlpha(ink, a.ringOpacity)}`,

  // Borders
  'border':         border,
  'border-soft':    mix(border, bgPage, a.borderSoft),
  'border-strong':  mix(border, ink, a.borderStrong),

  // Text
  'text-primary':   textPrimary,
  'text-secondary': mix(textPrimary, bgPage, 0.30),
  'text-muted':     mix(textPrimary, bgPage, 0.55),
  'text-faint':     mix(textPrimary, bgPage, 0.70),
  'text-on-accent': pickContrastInk(accent),

  // Accent
  'accent':            accent,
  'accent-text':       isDark ? mix(accent, '#FFFFFF', 0.20) : accent,
  'accent-dark':       mix(accent, '#000000', 0.20),
  'accent-bg-soft':    withAlpha(accent, a.accentBgSoft),
  'accent-bg-softer':  withAlpha(accent, a.accentBgSofter),
  'accent-shadow':     withAlpha(accent, a.accentShadow),
  'accent-ring':       withAlpha(accent, a.accentRing),

  // Semantic
  'danger':         danger,
  'danger-bg':      withAlpha(danger, a.semBg),
  'danger-border':  withAlpha(danger, a.semBorder),
  'warning':        warning,
  'warning-bg':     withAlpha(warning, a.semBg),
  'info':           info,
  'info-bg':        withAlpha(info, a.semBg),
  'neutral-bg':     withAlpha(mix(textPrimary, bgPage, 0.55), a.semBg),
  'neutral-text':   mix(textPrimary, bgPage, 0.30),
  'on-danger':      pickContrastInk(danger),

  // Hero gradient (fondo de pages, no Login)
  'hero-gradient':
    `radial-gradient(900px 500px at 85% 15%, ${withAlpha(accent, a.heroHaloA)}, transparent 60%),` +
    `radial-gradient(700px 500px at 10% 90%, ${withAlpha(accent, a.heroHaloB)}, transparent 60%),` +
    `linear-gradient(180deg, ${bgPage} 0%, ${mix(bgPage, ink, 0.03)} 100%)`,
}
```

### `applyPalette` (lib/brand.tsx)

Crítico: el toggle Dark↔Light no funciona si los tokens temables se escriben como **inline styles** en `:root`. Tienen que ir en un `<style>` inyectado con selectores `.theme-dark` y `.theme-light` para que las clases ganen.

```ts
export function applyPalette(raw: PaletaContent): void {
  const root = document.documentElement
  const p = expandirPaletaCompleta(raw)  // principales → todos los tokens

  // 1) Limpia inline residual de tokens temables (defensivo)
  for (const k of Object.keys(p.dark || {})) root.style.removeProperty(`--${k}`)
  for (const k of Object.keys(p.light || {})) root.style.removeProperty(`--${k}`)

  // 2) Tokens fijos: inline en :root (no dependen del tema)
  for (const [k, v] of Object.entries(p.fixed || {})) {
    root.style.setProperty(`--${k}`, v)
  }

  // 3) Tokens temables: stylesheet inyectado con selectores correctos
  let style = document.getElementById('brand-themes') as HTMLStyleElement | null
  if (!style) {
    style = document.createElement('style')
    style.id = 'brand-themes'
    document.head.appendChild(style)
  }
  const darkCss = Object.entries(p.dark || {}).map(([k, v]) => `--${k}:${v};`).join('')
  const lightCss = Object.entries(p.light || {}).map(([k, v]) => `--${k}:${v};`).join('')
  style.textContent = `
    :root, .theme-dark { ${darkCss} }
    .theme-light { ${lightCss} }
  `
}
```

### Color picker Tailwind v3

`lib/colorPalettes.ts` debe exportar:
- `TAILWIND_PALETTES`: 22 paletas × 11 shades. Las 22 son: slate, gray, zinc, neutral, stone, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose.
- `PALETTE_GROUPS`: agrupadas en Neutros / Cálidos / Frescos para el picker.
- `findClosestTailwind(hex)`: **matching perceptual con OKLab** (NO RGB euclidiano — falla feo: `#D4B996` champagne queda "cerca" de `red-300` rosa).

Implementación OKLab:
```ts
function rgbToOklab({ r, g, b }: RGB): { L; a; b } {
  // sRGB → linear
  const lin = (c) => { const x = c / 255; return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4) }
  const lr = lin(r), lg = lin(g), lb = lin(b)
  // → LMS
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb
  // → OKLab via cbrt
  const lp = Math.cbrt(l), mp = Math.cbrt(m), sp = Math.cbrt(s)
  return {
    L: 0.2104542553 * lp + 0.7936177850 * mp - 0.0040720468 * sp,
    a: 1.9779984951 * lp - 2.4285922050 * mp + 0.4505937099 * sp,
    b: 0.0259040371 * lp + 0.7827717662 * mp - 0.8086757660 * sp,
  }
}
```

`components/ui/TailwindColorPicker.tsx`:
- Botón con swatch + hex chiquito
- Popover via **React Portal en document.body** con `position:fixed` y `getBoundingClientRect` del botón
- Recalcula posición en scroll/resize, ajusta clamp si no cabe en viewport
- Botones rápidos: Negro, Blanco
- "Más cercano: blue-500" en el header del popover
- Highlight del shade activo
- Click fuera o Escape cierra

`components/ui/InfoIcon.tsx`:
- Chip "(i)" con tooltip custom **via Portal** (no `title=` nativo — tarda 1.5s)
- Hover/focus muestra; mouseleave/blur oculta
- Tooltip con `position:fixed` calculado desde el chip

---

## 🖼️ Login (`pages/Login.tsx`)

Estructura:
- Wrapper relative + `BackgroundCarousel` cubriendo viewport
- Tarjeta central `max-w-5xl rounded-2xl shadow-2xl grid-cols-2`
- **Izquierda** (form): `background: rgba(255,255,255,0.48)` + `backdrop-filter: blur(16px) saturate(140%)`
  - Top: chip "MARCA · ALCANCE" — `background: var(--brand-hero-accent)`, `color: var(--brand-hero-accent-ink)`
  - "Bienvenido" + descripción
  - Inputs identifier + password (con eye toggle)
  - Recuérdame + ¿Olvidaste tu contraseña?
  - Botón "Entrar al ${brand.alcance}" — gradient navy hardcoded (lo dejas así o lo agregas como derivado)
  - Footer "Powered by LOGIQ" (o tu marca)
- **Derecha** (brand hero): `background: var(--brand-hero-bg)` (gradient calculado)
  - Logo grande centrado: `<img src={brand.logo_login ?? SYSTEM_DEFAULTS.logoLogin} />`
  - Bajo el logo: divisor + `{brand.alcance.toUpperCase()}` + divisor

Llama `brandApi.getPublic()` al montar (lo dispara `BrandProvider`).

---

## 🪟 AppShell + Sidebar + Topbar

### `RootLayout.tsx`
```tsx
export default function RootLayout() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return (
    <PageTitleProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </PageTitleProvider>
  )
}
```

### `AppShell.tsx` (sin prop title)
```tsx
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-hero min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto px-8 py-8">{children}</main>
      </div>
    </div>
  )
}
```

### `Sidebar.tsx`
- Header: `<img src={brand.logo_sidebar ?? SYSTEM_DEFAULTS.logoSidebar} />` + `<span>{brand.marca}</span>`
- CTA: NewProjectButton (cambia el copy según dominio)
- `NAV_SECTIONS.map(SidebarSection)`
- Footer: versión

### `Topbar.tsx`
- `<h1>{usePageTitleValue()}</h1>` a la izquierda
- A la derecha: Help · Bell (con badge si aplica) · ThemeToggle · UserMenu
- Polling visibility-aware del badge si hay sistema de notificaciones

### `App.tsx` (Layout Route)
```tsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route element={<RootLayout />}>
    <Route path="/" element={<Navigate to="/usuarios" replace />} />
    <Route path="/usuarios" element={<Suspense fallback={<PageFallback />}><UsuariosPage /></Suspense>} />
    <Route path="/configuracion" element={<MinLevelGuard min={9}><Suspense fallback={<PageFallback />}><ConfiguracionPage /></Suspense></MinLevelGuard>} />
    {/* aquí van las demás pages del dominio */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Route>
</Routes>
```

### `vite.config.ts`
```ts
function has(id, needle) { return id.indexOf(needle) !== -1 }
function manualChunks(id) {
  if (!has(id, 'node_modules') && !has(id, '/src/')) return undefined
  if (has(id, 'node_modules')) {
    if (has(id, 'react-router')) return 'vendor-router'
    if (has(id, 'react')) return 'vendor-react'
    return 'vendor'
  }
  if (has(id, '/src/lib/api/')) return 'app-api'
  if (has(id, '/src/components/ui/')) return 'app-ui'
  if (has(id, '/src/components/icons/')) return 'app-ui'
  if (has(id, '/src/lib/')) return 'app-lib'
}

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173, strictPort: true, watch: { usePolling: true } },
  build: { rollupOptions: { output: { manualChunks } } },
})
```

---

## 👤 UsuariosPage

- Header con título + breadcrumb + CTA "+ Nuevo usuario"
- Tabla con columnas: nombre · email · username · nivel · permisos · acciones
- Skeleton mientras carga
- Drawer `UsuarioFormDrawer` para crear/editar:
  - Inputs: first_name, last_name_paterno, last_name_materno, email, username (lowercase), password (solo crear), level (selector con niveles visibles ≤ self.level), permissions (multi-select del catálogo)
  - Validación: level ≤ self.level; no permitir borrar a otro de mismo o mayor nivel
  - Acciones por row: Edit · Reset password · Delete

Backend `/users/*` enforce la jerarquía siempre — no confíes solo en frontend.

---

## ⚙️ ConfiguracionPage ⭐

Solo L9. 5 tabs:
1. **Generales** — claves del SystemConfig agrupadas por `section`. ConfigItemEditor renderea según `input_type` (text/password/number/boolean).
2. **Niveles** — tabla con label/description editables + toggle Visible (`is_reserved` invertido).
3. **Permisos** — matriz nivel × permiso (checkbox grid). Filtra niveles ocultos.
4. **Brand** — sub-navegación interna.
5. **Licencia** — placeholder (no conectado a DB inicialmente).

**Dedupe del fetch /levels**: NivelesTab y PermisosTab consumen el MISMO endpoint. El padre `ConfiguracionPage` lo fetcha UNA vez y pasa `data` + `onReload` a ambos hijos por props. Cambiar entre esos tabs no re-fetchea.

### Tab Brand (`BrandTab.tsx`)

Layout split:
```
<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
  <div className="lg:col-span-2 space-y-5">
    {/* Sub-nav con botones pill: Brand Name · Paleta · Logos · Carrusel */}
    {/* Contenido del sub-tab activo */}
  </div>
  <div className="lg:col-span-1">
    <LoginPreview />  {/* Sticky */}
  </div>
</div>
```

**Orden de sub-tabs**: Brand Name → Paleta de colores → Logos → Carrusel.
Razón: Logos usa los colores de Paleta como fondo del preview. Configurar paleta primero.

Sub-nav es **botones pill** (NO un sistema de tabs anidado tradicional — para no sentirse repetitivo):
```tsx
<div className="flex items-center gap-2 flex-wrap border-b pb-3" style={{borderColor: 'var(--border-soft)'}}>
  {SUB_TABS.map(t => (
    <button
      onClick={() => setActive(t.key)}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
      style={{
        background: isActive ? 'var(--accent-bg-soft)' : 'transparent',
        color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)',
        border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
      }}
    >
      {t.label}
    </button>
  ))}
</div>
```

### `BrandNameSub.tsx`
- Form con marca + alcance
- Vista previa inline del chip MARCA · ALCANCE
- Vista previa inline del botón "Entrar al ${alcance}"
- Botón Guardar arriba derecha (dirty cuando hay edits)

### `PaletaSub.tsx`
- Header con acciones top-right: Back to default · Descartar · Guardar cambios
- **Sección Fijos** (acordeones colapsables):
  - Login (2 colores)
  - Sidebar (5 colores)
- **Sección Por tema** con toggle `[☀️ Light | 🌙 Dark]` (Light primero, default activo Light):
  - 8 colores del tema activo
- Cada row: friendly name + InfoIcon (i) con tooltip → `--var-name · hint` + TailwindColorPicker + botón "reset" si difiere del default
- Memorias (max 5): card con 5 swatches representativos + Aplicar + Borrar; input "Nombre" + botón "+ Guardar paleta actual"
- **Aplicación EN VIVO**: cada edit llama `applyPaletaPreview(palette)` que reescribe los CSS vars
- Descartar reaplica el state guardado (sin tocar backend)
- Al guardar PATCH `/brand` con solo los **principales** (no derivados — applyPalette del frontend expande)

### `LogosSub.tsx`
- 2 slots: Logo de login + Logo de sidebar
- Cada slot:
  - Título + descripción
  - Preview con fondo = `var(--brand-hero-bg)` o `var(--sidebar-bg)` (responde a paleta)
  - Imagen actual con fallback a `SYSTEM_DEFAULTS.logoLogin/logoSidebar`
  - Nombre del archivo subido (`<code>mi-logo.png</code>`)
  - Botones Subir/Reemplazar + Quitar
- File input oculto; `accept="image/*"`; max 500 KB; convertir a data URL con FileReader
- `brandApi.uploadLogo(kind, dataUrl, file.name)`

### `CarruselSub.tsx`
- Input "Segundos por foto" (1-60, step 0.5)
- Drop zone "Elegir imagen" (max 12 fotos, 800 KB c/u)
- Grid 2/3/4 cols de fotos con hover overlay → botón Borrar
- Si lista vacía: card "Default del sistema" no borrable con `SYSTEM_DEFAULTS.carruselFoto`

### `LoginPreview.tsx`
- Miniatura del Login con:
  - Fondo = primera foto del carrusel
  - Tarjeta con chip MARCA·ALCANCE + form simulado + botón "Entrar al ${alcance}"
  - Panel derecho con logo + alcance
- Usa CSS vars del `:root` → cuando aplicas preview en vivo en paleta, se actualiza
- Sticky `top-4` en la columna lateral

---

## 🛣️ Plan de implementación recomendado (orden de commits)

**Setup**
1. `chore: scaffold backend + frontend + railway config`
2. `chore: tsconfig strict + tailwind + vite manualChunks`

**Auth + core**
3. `feat(auth): models User + Level + LevelPermission + seed`
4. `feat(auth): /auth/login + JWT con TTL de SystemConfig`
5. `feat(frontend): AuthProvider + ThemeProvider + main.tsx providers`
6. `feat(frontend): index.css con tokens default + .theme-dark / .theme-light`

**Layout**
7. `feat(layout): AppShell + RootLayout + Sidebar + Topbar`
8. `feat(layout): SidebarItem prefetch al hover + navConfig`
9. `feat(theme): ThemeToggle + persistencia localStorage`
10. `feat(ui): Button + Card + Drawer + TextField + Skeleton + Tabs + IconButton`

**Brand foundation**
11. `feat(brand): backend BrandConfig + endpoints + seed singleton`
12. `feat(brand): lib/colorPalettes.ts (Tailwind v3 + OKLab utils)`
13. `feat(brand): lib/paletaDerivada.ts (principales + fórmulas)`
14. `feat(brand): BrandProvider + applyPalette + integración Login/Sidebar/favicon/title`
15. `feat(brand): SYSTEM_DEFAULTS módulo + assets en /public/system-defaults/`

**Users**
16. `feat(users): /users CRUD jerárquico backend`
17. `feat(users): UsuariosPage + UsuariosTable + UsuarioFormDrawer`

**System Settings**
18. `feat(config): ConfiguracionPage skeleton + tab Generales + ConfigItemEditor`
19. `feat(config): tabs Niveles + Permisos (dedupe fetch /levels)`
20. `feat(config): tab Licencia placeholder`

**Brand editor (lo bueno)**
21. `feat(ui): InfoIcon con Portal`
22. `feat(ui): TailwindColorPicker con Portal + position fixed`
23. `feat(brand): tab Brand · BrandNameSub`
24. `feat(brand): tab Brand · PaletaSub (Fijos + Light + Dark + memorias)`
25. `feat(brand): tab Brand · LogosSub (preview con CSS vars + filename)`
26. `feat(brand): tab Brand · CarruselSub`
27. `feat(brand): LoginPreview sticky lateral`

**Polish**
28. `perf(build): manualChunks consolidados`
29. `ux: skeleton loaders en system settings`
30. `docs: PROJECT_PLAN.md inicial + CLAUDE.md`

---

## 🧪 Cómo validar al final

1. **Login**: cambia marca/alcance en Brand Name → guarda. El chip del Login y el botón "Entrar al X" cambian. El tab del browser dice `marca · alcance`.
2. **Logos**: sube un PNG → al instante el sidebar y favicon cambian. Login muestra logo nuevo.
3. **Paleta**: cambia accent → toda la app se repinta en vivo (botones, links, hover). Click "Back to default" → vuelve.
4. **Toggle Dark/Light**: funciona en cualquier paleta personalizada (test crítico).
5. **Carrusel**: sube 2-3 fotos JPG → logout → ves carrusel rotando con tu intervalo.
6. **Memorias**: guarda 2 paletas distintas → aplica una → confirma → aplica la otra.
7. **Users**: crea un L5 desde un L9 → ese L5 NO puede ver/editar otros L5+. Reset password aplica `standard_password`.

---

## ⚠️ Gotchas que ya pisé (no las repitas)

1. **No escribas tokens temables como inline styles en `:root`**. Pisan a `.theme-dark` / `.theme-light` y el toggle Dark↔Light deja de funcionar. Usa el `<style id="brand-themes">` inyectado.

2. **`extractFixedPrincipales` y `extractThemedPrincipales` deben validar `isHex(...)`** antes de aceptar un valor del backend. Si en una versión anterior se guardaron derivados (gradients, rgba) como si fueran principales, el editor mostrará strings horribles en el campo. Defensivo: si no es hex puro, usa default.

3. **Al guardar la paleta, manda SOLO los principales** (no expandidos). El backend queda limpio y si cambias las fórmulas, las paletas viejas se recalculan automáticamente.

4. **El `find closest` del color picker en RGB euclidiano falla feo**. `#D4B996` (champagne) queda "cerca" de `red-300` (rosa). Usa OKLab.

5. **Popovers de pickers y tooltips DEBEN ir via Portal**. Acordeones tienen `overflow:hidden` (necesario para el border-radius) y clipan dropdowns embebidos.

6. **`AppShell` NO debe vivir dentro de cada page**. Si lo haces, cada navegación remontea Sidebar/Topbar → duplica fetches del badge, revalida el logo (304 lentos), y el toggle de tema/brand "parpadea". Layout route compartido obligatorio.

7. **`document.title` se setea desde BrandProvider, NO desde `usePageTitle`**. `usePageTitle` solo controla el `h1` del Topbar. Esto lo discutimos explícitamente en sesión — el tab del browser es identidad de marca, no del page.

8. **Defaults del sistema separados de la marca**. `lib/systemDefaults.ts` centraliza paths en `/public/system-defaults/` (1 asset por slot — un solo logo de login, un solo logo de sidebar, una sola foto del carrusel). Que NO sean los assets específicos del cliente — porque si alguien hace fork y nunca sube nada, la app no debe verse como tu cliente.

9. **El chip "ALCANCE" del Login NO puede estar hardcoded en color**. Usa `var(--brand-hero-accent)` para bg y `var(--brand-hero-accent-ink)` para text-color (derivado calculado con `pickContrastInk(heroAccent)`). Si lo hardcodeas, al cambiar el accent el chip se queda con el color viejo.

10. **`vite.config.ts` con `manualChunks` debe usar `id.indexOf(needle) !== -1` no `id.includes(...)`**. Vite compila el config con un target ES5 que no tiene `String.prototype.includes`.

---

## 🤖 Cómo arrancar en la sesión nueva

Pega este archivo completo como primer mensaje y dile a Claude:

> "Vamos a construir el esqueleto descrito en este documento. Empieza por el **commit 1** (scaffold). Antes de cada commit, dime qué vas a hacer en una línea y procede. Build local (`cd frontend && npx tsc -b` + `npx vite build` + `python -m py_compile`) limpio antes de cada `git push`. Co-author en cada commit. Pregúntame al final de cada commit si quiero continuar al siguiente."

Si tu repo está vacío:
```bash
git init
git remote add origin <tu-repo>
git branch -m main
# crea CLAUDE.md y PROJECT_PLAN.md mínimos antes
```

Si quieres avanzar más rápido, pídele al agente que agrupe commits 1-6 en una "Fase 0 — Setup" y los meta en un solo PR.
