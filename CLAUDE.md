# CLAUDE.md

> **Antes de cualquier trabajo, lee [`PROJECT_PLAN.md`](./PROJECT_PLAN.md).**
> Ahí está el estado de cada módulo, decisiones tomadas con el usuario,
> roadmap y pendientes. Si te preguntan "¿qué llevamos?" o "¿qué sigue?",
> sintetiza desde ese documento. **Actualízalo cuando completes algo grande.**

Stack (versiones reales instaladas):
- **Backend**: Django 5.2 + Django REST Framework + `djangorestframework-simplejwt` — auth JWT con tenant claim.
- **Base de datos**: PostgreSQL (prod en Railway; SQLite solo para dev rápido local).
- **Frontend**: React 19 + Vite 8 + TypeScript 6 (strict) + Tailwind v3.4 + `react-i18next`.
- **Iconos**: `lucide-react` (outline, `strokeWidth={1.5}`, `size={16}`). NO emojis en UI (se ven inconsistentes en Windows).
- **Tareas asíncronas**: Celery + Redis — envío de WhatsApps, correos y trabajos en segundo plano.
Repo: `LogiqBI-OE/00_Plantilla` — https://github.com/LogiqBI-OE/00_Plantilla.git (rama única `main`, push = deploy).

> Nota: el SKELETON_GUIDE.md dice "React 18" pero Vite scaffoldeó React 19. Va con 19.

## Regla de oro: no asumir, siempre avisar

**Antes de tomar cualquier decisión que el usuario no haya confirmado explícitamente, preguntar.** Esto cubre, sin ser exhaustivo:

- Defaults técnicos cuando hay tradeoffs (UUID vs integer, sync vs async, etc.).
- Identidades de git, cuentas de servicios, emails.
- Posponer tareas ("lo dejamos para después", "no hace falta ahora") — eso es decisión del usuario, no mía.
- Crear/borrar/pausar servicios en plataformas externas (Railway, GitHub).
- Recomendar "Opción A vs B" y elegir una sin esperar respuesta.
- Cualquier cosa que altere su entorno (PATH global, archivos fuera del repo, tokens persistentes).

Cuando detecte que algo "habría que hacer eventualmente" (por ejemplo: crear servicio Frontend en Railway, instalar herramienta global, configurar variable de entorno), **avisar al usuario en ese mismo momento** con la decisión que enfrentará, no posponer mentalmente.

## Convenciones críticas (no las cambies sin preguntar)

- **Priorizar eficiencia** de responsividad y acceso a datos.
- **Todo conectado** evitar en la medida de lo posible los datos y textos hardcodeados.
- **Sin cache** de datos en frontend. Todo en vivo del backend.
- **`fmtMoney` de `lib/format.ts`** (locale `en-US`) — única función de dinero. No inventes otras.
- **Polling** vía `usePolling(callback, ms)` — pausa con visibility.
- **Páginas nuevas**: `React.lazy()` en `App.tsx` + entrada en `PREFETCH_MAP` de `SidebarItem.tsx`.
- **Migraciones**: nativas de Django (`python manage.py makemigrations` + `migrate`).
  Cada cambio de modelo → nueva migración versionada en `app/migrations/`. No editar migraciones ya aplicadas en producción.
- **Botón Guardar**: top-right en páginas. Footer del Drawer en modales.
- **Skeleton loaders** (no "Cargando..." plain).
- **Backend sin N+1**: precarga lookups en batch (`MaterialInfoCache`,
  `RecetaCostCache`, `_badges_for_all` son ejemplos).
- **Iconos**: `lucide-react`, estilo outline `strokeWidth={1.5}`. No emojis.
- **Banderas**: SVG inline, **nunca emoji** (los emoji de bandera no
  renderizan en Windows — muestran el código de región, ej. "US"). Ver
  `LanguageToggle.tsx`.
- **i18n (regla dura)**: **todo** texto de UI pasa por `t('clave')` con catálogos
  `es/en/ko.json`. Nunca hardcodear strings en componentes. Texto con formato
  (negritas inline, etc.) usa `<Trans>`. Idiomas soportados: `es` (default), `en`,
  `ko` — registrados en `SUPPORTED_LANGUAGES` (`i18n/index.ts`). Al agregar un idioma:
  nuevo `<lng>.json` + entrada en `SUPPORTED_LANGUAGES`/`resources` + bandera en `FLAGS`
  y código de país en `CODES` (`LanguageToggle.tsx`) + choice en `User.preferred_language`
  y `LANGUAGES` (backend). **No** se traducen: labels de niveles (DB, editables por L9) ni
  los `info` tooltips técnicos de la paleta (referencian CSS-vars).
- **Navegación i18n**: los `NavItem`/`NavSection` de `navConfig.tsx` llevan
  `label_<lng>`/`title_<lng>`; el consumidor usa los helpers `navLang(i18n.language)` +
  `pickNav(es, en, ko, lang)`. Tipos de tenant: `t('tenant_type.<type>')` (no el viejo
  `TENANT_TYPE_LABEL`).
- **LanguageToggle**: es un **dropdown** (bandera + código de país MX/US/KR + nombre nativo),
  no un botón que cicla. Mismo patrón de dropdown que `UserMenu` (click-fuera para cerrar).
- **Responsive**: el `Sidebar` es un **drawer off-canvas en móvil** (`fixed`, `-translate-x-full`,
  abre con hamburguesa del `Topbar` + backdrop, cierra al navegar) y `md:sticky` siempre visible
  en desktop. El estado (`mobileOpen`) vive en `AppShell`. Tablas con `overflow-x-auto`.
- **Estándar de pantalla de lista**: header de página (`h2` + `p`) → `Card` canvas → `SectionHeader`
  (título/descripción izquierda, acciones derecha vía slot `actions`, ej. "+ Nuevo") → tabla
  estándar. Mismo patrón que `GlobalSettingsPage`. Ver `TenantsPage`/`AgencyAccessPage`.
- **Settings (IA)**: la config del **sistema** (Niveles, Permisos,
  Generales/SystemConfig, Licencia) vive en **"Configuración global"**
  (`GlobalSettingsPage`, L9 plataforma) como tabs dentro de **un solo `Card`**
  (canvas unificado: tabs arriba + contenido abajo, estilo TdF). La config
  del **tenant** (Marca/branding, etc.) va en página aparte. El branding NO
  va en settings globales.
- **Tabs dentro de canvas**: los componentes de cada tab **no** se envuelven
  en su propio `Card` — el canvas padre provee el panel. Así los tabs y el
  contenido comparten un único panel redondeado.
- **Páginas anchas**: el `<main>` de `AppShell` da el gutter parejo (`px`);
  las páginas usan todo el ancho (sin `max-w` que deje hueco a la derecha).
  Responsivo: `px-4 sm:px-6`, tabs con `overflow-x-auto`, tablas con
  wrapper `overflow-x-auto` + `min-w`.
- **SectionHeader**: cada panel/tab usa `<SectionHeader>` (título + descripción
  a la izquierda, Descartar/Guardar a la derecha) para ser consistente. Los
  tabs **no** se auto-envuelven en `Card` (lo da el canvas padre).
- **Tablas (estándar)**: marco propio `rounded-xl border border-border
  overflow-hidden` con `overflow-x-auto` adentro; header con banda
  `bg-table-header` (token, claro pero distinto del card) + `border-b`, sin
  iconos; filas `border-b border-border last:border-0 hover:bg-elevated/40`
  con buen `py`; celdas editables = `TextField variant="ghost"`.
  Pendiente: encapsular en un componente `DataTable` reusable (selección,
  sort, drag-and-drop, paginación) para tablas de datos grandes.
- **Layout único `AppLayout`**: un solo layout para todos los niveles. El
  `Sidebar` adapta su contenido (L8/L9 ven sección Plataforma + Vista de
  Tenant; L0-L7 solo Vista de Tenant). `BrandProvider` scope dinámico:
  `tenant` si hay tenant activo, `platform` si no.
- **Multi-tenancy en modelos de dominio**: heredar de `apps.core.models.TenantScopedModel`
  y usar `MyModel.objects.for_request(request)` en las views (filtra por tenant).
- **Permisos en views**: `RequireLevel(N)` o `HasPermission(code)` (factories en `apps.core.permissions`).
- **Modo single/multi (`multitenant_enabled`)**: flag SystemConfig (default `false` =
  single), expuesto en `/api/system-config/runtime/`, leído en el front por
  `useRuntimeConfig()`. En **single** la auth resuelve `request.tenant` SIEMPRE al
  **tenant fijo de sistema** (`get_default_tenant()`, slug `logiq`), sin importar el JWT —
  el L9 opera dentro de él sin selector. El sidebar oculta selector + items
  `requiresMultitenant` (Tenants, Accesos de agencia) y deja Configuración global.
- **Tipo de tenant** (`Tenant.type`): `system` | `agency` | `cliente`. Los `system` NO son
  workspaces elegibles (se excluyen del selector de login). En los selectores se muestra el
  tipo (`TENANT_TYPE_LABEL`), no el slug.
- **Agencia = Tenant `type=agency`** (no hay tabla `Agency` aparte). Un L8 pertenece a una
  agencia vía `User.agency` (FK a `Tenant`, debe ser `type=agency`). La licencia es **única**:
  `TenantLicense` para todos los tenants (cliente y agencia); no existe `AgencyLicense`. Los
  tenants que una agencia gestiona se asignan vía `AgencyTenantAccess` (**Agencia ↔ Tenant
  cliente**; todos los L8 de la agencia heredan ese acceso, no se asigna por usuario). Las
  acciones `grant-agency`/`revoke-agency` reciben `agency_id` (un tenant `type=agency`).
- **Config del sistema con muchas secciones**: usar **sub-navegación de pills** (un botón por
  sección, solo se ve la activa) en vez de apilar y hacer scroll — como en `GeneralesTab`,
  `LicenciaTab` y `BrandTab`. Mismo estilo de pills (accent-bg-soft + borde accent al activo).
- **`managed` keys de SystemConfig**: las que tienen `managed=True` (ej. `multitenant_enabled`)
  se editan en una UI dedicada y NO aparecen en el editor genérico "Generales".
- **Pantalla de Login (estándar TdF)**: header `— MARCA` (color `--brand-hero-bg`) + alcance
  en pill (`--brand-hero-accent`); labels en mayúsculas + asterisco rojo; inputs redondeados
  claros; contraseña con toggle de ojo; fila Recuérdame + ¿Olvidaste tu contraseña?; pie
  ¿Necesitas ayuda? Contacta a soporte + "Powered by" anclado abajo-izquierda; hero derecho
  con logo grande, alcance en `--brand-hero-accent` y degradado de profundidad; backdrop de
  marca cuando no hay fotos de carrusel. La página de marca del tenant se llama **"Brand"**.

## Deploy en Railway (lecciones aprendidas)

- **Tres servicios**: Backend (root `backend/`, Dockerfile), Frontend (root `frontend/`,
  Vite autodetect), Postgres add-on. Redis add-on cuando se use Celery.
- **`VITE_API_URL`**: se lee en BUILD-TIME, no runtime. Si la cambias, hay que
  re-deployar el frontend. Sin ella, el frontend pega rutas relativas contra su
  propio dominio (404). Valor: la URL pública del backend.
- **`CORS_ALLOWED_ORIGINS`**: UNA sola variable, valores separados por coma sin
  espacios (`env.list` de django-environ la parsea). Debe incluir el dominio del
  frontend + `http://localhost:5173`.
- **`DJANGO_SECRET_KEY` + `DJANGO_DEBUG=False`** obligatorias en el backend.
  `RAILWAY_PUBLIC_DOMAIN` se inyecta solo y se agrega a `ALLOWED_HOSTS`/`CSRF_TRUSTED_ORIGINS`.
- **Bootstrap del admin inicial**: `python manage.py ensure_initial_admin` lee
  `INITIAL_ADMIN_*` env vars y crea un L9 si no existe. Corre en `entrypoint.sh`.
  Borrar las env vars después del primer login (la contraseña queda hasheada en DB).
- **Watch Paths**: por default Railway re-deploya ambos servicios en cada push.
  Para evitar re-builds inútiles, setear Watch Path `backend/**` y `frontend/**`
  en cada servicio (pendiente — el usuario lo hace en el panel).
- **El push a GitHub a veces falla por red** (timeout puerto 443). Reintentar.

## Workflow de commits

- **Identidad de git**: al **iniciar cualquier repo nuevo**, pregúntale al usuario a nombre de quién deben hacerse los commits (nombre + email). Nunca asumir lo del config global de la máquina — esa cuenta puede ser corporativa y el repo personal. Configurar con `git config --local user.name` y `user.email` (scope del repo, no global).
- **Idioma**: hablar siempre en **español neutro** (usar "tú", no "vos"). No usar modismos regionales (ni rioplatenses ni mexicanos) en código, comentarios ni respuestas al usuario.
- Commits pequeños, mensajes con scope: `feat(cotizacion): ...`, `fix(login): ...`, `refactor(...)`, `perf(...)`, `chore(...)`.
- Coautor en cada commit: `Co-Authored-By: Claude <noreply@anthropic.com>`.
- Verifica el build local antes de hacer push de cambios grandes: `cd frontend && npx tsc -b`.

### Fase desarrollo (pre-operativo)

- Rama única: `main`.
- Push directo a `main`.

### Fase operativa (post-go-live)
- `main` = producción. **No** se pushea directo.
- `develop` = integración. Aquí va el trabajo del día a día.
- Features/fixes salen de `develop` y vuelven a `develop` (ramas cortas `feat/...`, `fix/...` o commits directos a `develop` si sigues siendo el único dev).
- Para desplegar: merge `develop` → `main` (fast-forward o con tag de versión).
- Hotfix urgente: rama desde `main`, merge a `main` **y** a `develop`.

---

## Behavioral guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
