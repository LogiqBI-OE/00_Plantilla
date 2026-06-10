# PROJECT_PLAN.md — 00_Plantilla

> **Propósito de este documento**: estado vivo del proyecto. Resume qué se ha decidido, qué falta por decidir y el orden en que se construirán las cosas. Si alguien pregunta "¿qué llevamos?" o "¿qué sigue?", se sintetiza desde aquí. **Actualizar cada vez que se complete algo grande o se tome una decisión nueva.**

---

## 0. Dónde retomar (memoria de sesión — actualizado 2026-06-10, sesión 6)

**Sesión 2026-06-10 #6 — i18n trilingüe (es/en/ko), UI responsive y restyle de pantallas:**

- **Coreano (`ko`) como 3er idioma** — 4 capas: catálogo react-i18next (`ko.json`), navegación
  (`navConfig` con `label_ko` + helpers `navLang`/`pickNav`), catálogo de permisos (`label_ko`,
  servido en vivo, sin re-seed), backend (`User.preferred_language` choice + `LANGUAGES`,
  migración `accounts.0007`). Bandera Taegukgi SVG. **Pusheado** (`e9f3118`).
- **LanguageToggle desplegable** — dropdown con bandera + código de país (MX/US/KR) + nombre
  nativo (antes era botón que ciclaba). **Sin pushear** (`e5de220`).
- **Restyle Tenants + Accesos de agencia** al estándar de Configuración global (header de
  página + Card canvas + `SectionHeader` + tabla estándar). `SectionHeader` ganó un slot
  `actions` reusable (ej. "+ Nuevo tenant"). Tenants ganó columna **Tipo**. Iba en el commit
  de i18n Fase 1 (`682e043`). **Sin pushear**.
- **Sidebar responsive** — en móvil es un drawer off-canvas (hamburguesa en Topbar + backdrop +
  cierra al navegar); en `md+` sigue sticky. **Sin pushear** (`dd3d459`).
- **PASE COMPLETO DE i18n (en curso)** — migrar TODO el texto hardcodeado a `t()` (es/en/ko).
  La app estaba construida con español hardcodeado en casi todas las páginas; solo login/sidebar
  pasaban por `t()`. Fases:
  - ✅ **Fase 1 (settings)** — GlobalSettings + 4 tabs + `SectionHeader`. Commit `682e043`.
  - ✅ **Fase 2 (plataforma)** — Tenants + Accesos de agencia. Commit `58d300c`.
  - ✅ **Fase 3 (operación)** — Usuarios, Auditoría, Home, ConfiguracionPage, SidebarTenantSelector,
    UserMenu, Topbar. `tenant_type` ahora traducido. Commit `d59105b`.
  - 🚧 **Fase 4 (Brand) — EN CURSO, SIN COMMITEAR**. Hecho: catálogos `brand.*`, `BrandTab`,
    `BrandNameSub`, `LogosSub` (parcial). **Falta**: terminar `LogosSub`, `CarruselSub`,
    `PaletaSub` (labels de color vía keys; los `info` tooltips técnicos de CSS-vars se dejan en
    español por ahora), `LoginPreview`. Luego `tsc -b` + commit.
- **PENDIENTE pedido por el usuario (diferido)**: **botón Guardar en el tab Licencia** — hoy es
  UI-only; hacerlo real = implementar el **Paso 4** de licensing (endpoint TenantLicense + front).
  El usuario eligió terminar i18n primero.
- **Sin pushear**: 5 commits (`e5de220`, `682e043`, `58d300c`, `dd3d459`, `d59105b`) + Fase 4.
  El push dispara deploy en Railway (migración `0007` es solo cambio de choices, riesgo nulo).

---

### Estado previo (sesión 2026-06-09 #5)

**Sesión 2026-06-09 #5 — Reconciliación de agencia (Opción A) + acceso por-agencia (2-A):**
- **Paso 1 — agencia = Tenant `type=agency`** (Opción A). Se **eliminaron** los modelos `Agency`
  y `AgencyLicense`. `User.agency` ahora es FK a **`tenants.Tenant`** (debe ser `type=agency`).
  Licencia **unificada en `TenantLicense`** para todos los tenants. Migración `accounts.0005`.
- **Paso 2 — acceso por-agencia (Opción 2-A)**. `AgencyTenantAccess` pasa de `(user L8, tenant)`
  a `(agency, tenant)`; todos los L8 de la agencia heredan el acceso. Migración `accounts.0006`.
  Backend (model, views, serializer, auth) + frontend (`AgencyAccessPage`, `tenantsApi`) listos.
- **Verificado**: `manage.py check` OK · migrate OK (SQLite local) · `tsc -b` OK · smoke
  end-to-end por shell (grant → L8 ve el cliente · enforce concede al gestionado y bloquea al
  ajeno · L8 sin agencia no ve nada) · seed L9 (orlando/rogelio) intacto.
- **Pendiente local de esta sesión**: **push** (2 commits sin pushear) → dispara migración en
  prod (Postgres) que dropea tablas `Agency`/`AgencyLicense` y reestructura `AgencyTenantAccess`
  (sin datos reales, seguro).

> **Nota**: el estado previo decía "falta pushear lo posterior a `7d019d5`" — eso ya estaba
> pusheado (`510ef32`, `6bceaa7`, `aa73c19` en `origin/main`). Esa nota era stale.

**Próximos pasos de licensing:**
- **Paso 2 ✅ HECHO (2026-06-09)** — `AgencyTenantAccess` refactorizado a **acceso por agencia**:
  de `(user L8, tenant)` a `(agency, tenant)` donde `agency` es un `Tenant type=agency`. Todos
  los L8 de la agencia heredan el acceso. Migración `accounts.0006`. Tocó: modelo, views/acciones
  `grant-agency`/`revoke-agency` (ahora `agency_id`), serializer, `_tenants_for_user`,
  `_enforce_access` y `LoginView`/`SwitchTenant`; frontend `AgencyAccessPage` (asigna agencias a
  tenants cliente) + `tenantsApi`. Verificado end-to-end por shell + `tsc -b`.
- **Paso 3** (pendiente) — **enforcement de licencia** en login/auth. Regla: **L9 nunca se
  bloquea**; **L8** según la licencia (`TenantLicense`) de **su agencia-tenant** (`User.agency`);
  **L0–L7** según la de **su tenant**. `max_users` se valida al **crear** usuario (no expulsa
  existentes).
- **Paso 4** (pendiente) — conectar la tabla de Licencia (UI) a `TenantLicense` real (todos los
  tenants).

**Estado de Login (de la sesión 4, ya pusheado):**
- **Tipo de tenant** `Tenant.type` = `system` | `agency` | `cliente`; el selector de login
  excluye los `system`. Migración `tenants.0003_tenant_type`.
- **Seed por migración** (`accounts.0004`): tenant **LogiQ** (system) + L9 **orlando** y
  **rogelio** (`logiqcrm`). Idempotente. ⚠️ La contraseña queda en el repo — cambiarla en
  cualquier despliegue real.
- **Login rediseñado al estándar Terra de Flora** + selector con preselección y grupo/tipo.
  Sin cablear (visual): Recuérdame, ¿Olvidaste tu contraseña?, Contacta a soporte.

---

### Estado previo (sesión 2026-06-02 #3)

**Estado general**: La plantilla está **completa y desplegada en Railway**.
Backend (Django) + Frontend (React) + Postgres corriendo. Login funcional
end-to-end con el usuario `orlando@logiqbi.com` (L9).

**Lo último que se hizo (sesión 2026-06-02 #3 — LOCAL, sin pushear todavía):**
- **Flag `tenant_mode` / `multitenant_enabled` (Fase 2)** — IMPLEMENTADO end-to-end:
  - Backend: nueva key `multitenant_enabled` (SystemConfig, default `false` = single),
    expuesta en `/api/system-config/runtime/`. Campo `managed` en `ConfigKey` para
    ocultarla del editor genérico "Generales". Helper `multitenant_enabled()`.
  - **Modo single (N=1)**: tenant fijo `logiq`/`LogiQ` autocreado (`get_default_tenant()`
    en `apps/tenants/models.py`). La capa de auth (`TenantJWTAuthentication`) resuelve
    `request.tenant` SIEMPRE al tenant por defecto cuando el flag está apagado, sin
    importar el claim del JWT (no hace falta re-loguear). `LoginView._resolve_tenant`
    igual. Así L9 entra sin seleccionar tenant y toda la app (brand, usuarios, auditoría)
    opera dentro de ese tenant.
  - Frontend: provider `lib/runtimeConfig.tsx` (`useRuntimeConfig().multitenantEnabled`
    + `reload`), montado en `AppLayout`. Sidebar oculta selector de tenant + items
    `requiresMultitenant` (Tenants, Accesos de agencia) en single; deja Configuración
    global. Guard `RequireMultitenant` en las rutas `/platform/tenants` y `/agency-access`.
  - Pestaña "Licencia" renombrada a **"Licencias y tenants"** con el **switch** de
    multi-tenant arriba (persiste y refresca runtime en vivo).
- **Branding estándar**: fallback login → `logo-white.png`, sidebar → `favicon-white.png`.
- **Página/nav "Configuración" (tenant) renombrada a "Brand"** (solo contiene el editor
  de marca; en single edita la marca del tenant fijo LogiQ: nombre, colores, logos, carrusel).
- **Sub-navegación interna por botones** (estilo pills, como Brand) en las pestañas de
  Configuración global que apilaban contenido: **Generales** (Accesos/Rendimiento/Localización,
  con badge ● por sección con cambios) y **Licencias y tenants** (sub-tabs Tenant/Licencia).
  Evita el scroll hacia abajo.
- **Licencia como tabla horizontal**: una fila por tenant (Tenant · Estatus · Tipo ·
  Vigente hasta · Máx. usuarios), estilo data-table. Aún UI-only.
- **Licensing — PASO 1 (modelos, sin enforcement todavía)**: ver decisión abajo. Creados
  `core.AbstractLicense` (status/type/valid_until/max_users + `is_currently_active()`),
  `tenants.TenantLicense` (1:1 tenant), `accounts.Agency` + `accounts.AgencyLicense` (1:1 agency),
  `User.agency` FK. Migraciones `accounts.0003` + `tenants.0002` aplicadas. Verificado en shell.
- Verificado: `manage.py check` OK, `tsc -b` OK, login single devuelve tenant LogiQ,
  `/api/brand/` 200, toggle ON/OFF refleja en runtime.
- **Pendiente de esta sesión**: revisar en navegador, y **pushear** (aún no se hizo).

**Licensing — pasos siguientes (pendiente #2 ampliado)**:
- Paso 2: refactor `AgencyTenantAccess` (hoy User↔Tenant) → **Agency↔Tenant**.
- Paso 3: **enforcement** en login/auth. Regla: **L9 nunca se bloquea**; **L8** bloqueado
  según licencia de **su agencia**; **L0–L7** según licencia de **su tenant**. `max_users`
  se valida al **crear** usuario (no expulsa existentes).
- Paso 4: conectar la tabla de Licencia (UI) a los modelos reales (tenants y agencias).

> **Nota entorno local (sesión 3)**: se creó venv en `backend/.venv` (Python 3.14) e
> instalaron requirements. DB local SQLite nueva (`backend/db.sqlite3`) con usuario L9
> `orlando@logiqbi.com` / username `orlando` / pass `logiqcrm` (solo local). No está
> conectada al Postgres de Railway.

**URLs producción**:
- Frontend: `https://logiq-plantilla.up.railway.app`
- Backend: `https://plantilla-backend.up.railway.app`

**Referencia visual**: Terra de Flora (`https://terradeflora.up.railway.app`)
es una app derivada de esta plantilla pero **más avanzada visualmente**. El
usuario la usa como referencia de diseño a replicar/backportar.

---

### Estado previo (sesión 2026-05-29 #2)

**Lo que se hizo** (sesión 2026-05-29 #2) — **TODO PUSHEADO** (hasta commit `2751959` + commit de docs):
- **Banderas SVG** en LanguageToggle (los emoji 🇲🇽/🇺🇸 NO renderizan en Windows). `02cb8ca`.
- **Topbar estilo TdF**: botones circulares, Help + Bell placeholders, avatar + nombre/rol + chevron. `5ab4efd`.
- **Sidebar estilo TdF**: `--sidebar-active-bg`/`--sidebar-border` (faltaban), marca/logo/espaciado, badge PRONTO. `5aa69e6`.
- **Configuración global look TdF** + **canvas full-width responsivo**. `2a81c46`, `aaeafd6`.
- **IA de settings + canvas unificado de tabs**: los tabs Niveles/Permisos/Generales/Licencia viven en
  **"Configuración global"** (L9 plataforma) dentro de UN Card. `238bb31`, `33e7835`.
- **Tabs como barra de navegación limpia + iconos** (Layers/ShieldCheck/SlidersHorizontal/BadgeCheck) +
  fix del scrollbar vertical fantasma (`overflow-y-hidden`). `e3fdb2b`.
- **`SectionHeader` reusable** (título + descripción + Descartar/Guardar) en Niveles/Permisos/Generales/Licencia.
- **Tablas con marco estilo data-table**: Niveles y Permisos con `rounded-xl border overflow-hidden`,
  header band `bg-table-header` (token nuevo, light/dark) + `border-b`, filas con hover, **sin iconos** en
  headers. `TextField variant="ghost"` para celdas editables. Niveles con guardado **batch**. `2751959`.

**Pendiente inmediato (próxima sesión)**:
1. **Fase 2 — flag `tenant_mode` (single | multi)** — NO iniciada. Decidido:
   single por defecto, enfoque "N=1, ocultar UI" (una sola base multi-tenant;
   single = 1 tenant fijo con selector/plataforma ocultos). Cascadas:
   - Sidebar: ocultar selector de tenant + sección PLATAFORMA en single.
   - Branding adaptativo: global (L9, aplica a toda la app) en single /
     por-tenant + LogiQ plataforma en multi.
   - Tab Licencia: card única (single) vs lista de tenants con su licencia (multi).
   - El flag vive como SystemConfig key, expuesto en `/api/system-config/runtime/`,
     leído por un provider único (fuente de verdad).
2. **Modelo `License` por-tenant en backend** (status, type, valid_until,
   max_users) — hoy el tab Licencia es UI-only (no persiste). Migración Django.
3. **Página "Configuración" (tenant)** quedó reducida a Marca/branding;
   definir el resto de config de tenant.
4. **Componente `DataTable` reutilizable** (estándar para tablas de datos
   grandes: checkbox de selección, headers con sort, drag-and-drop, paginación).
   Hoy Niveles/Permisos usan el estilo base de tabla (marco + header band, ver
   CLAUDE.md) sin esos extras porque no aplican a listas fijas. Encapsular cuando
   se hagan tablas grandes (usuarios, tenants, auditoría).

**Pendientes de fondo**:
- Validar la skill `crear-app` creando 1-2 apps reales (la skill `Crear-app`
  debería preguntar/setear `tenant_mode` al clonar).
- Configurar Watch Paths en Railway (`backend/**` y `frontend/**`).
- Cambiar la contraseña de `orlando@logiqbi.com` (pasó por chat/env vars).
- Traducciones .po del backend (estructura lista, contenido pendiente).

---

## 1. Visión

Construir una **app plantilla** mínima, rápida y bien estructurada, que sirva como base para crear muchas aplicaciones futuras. Cuando esté lista y probada, se convertirá en una **skill `Crear-app`** que clone esta plantilla y la adapte al dominio específico de cada nueva app.

**Prioridad explícita**: velocidad y responsividad — tanto de desarrollo (clonar y arrancar una app nueva debe ser rápido) como de runtime (la app debe sentirse fluida para el usuario final).

---

## 2. Stack (resumen — detalle en [CLAUDE.md](./CLAUDE.md))

| Capa | Tecnología |
|---|---|
| Backend | Django + Django REST Framework |
| Base de datos | PostgreSQL |
| Frontend | React + Vite + TypeScript + Tailwind |
| Tareas asíncronas | Celery + Redis |
| Migraciones | Nativas de Django |

---

## 3. Estado actual

### Hecho
- Repo creado y conectado: [`LogiqBI-OE/00_Plantilla`](https://github.com/LogiqBI-OE/00_Plantilla)
- Identidad de git configurada localmente (`LogiQ OE <orla.elizondos@gmail.com>`, scope del repo)
- `CLAUDE.md` con stack, convenciones y reglas de commits
- `.gitignore` cubriendo Python, Node, builds y archivos de editor
- Regla de idioma: español neutro en todo (código, comentarios, conversación)

### Hecho (cont.)
- ✅ Backend Django completo: 13 commits de Fase 1 (Tenant, accounts, core auth, users CRUD, tenants CRUD + agency-access, levels + matriz seed, system_config, brand + global brand, audit, i18n estructura, /readiness).
- ✅ Frontend Vite + React + TS: 16 commits de Fase 2 (scaffold, i18n, API client, AuthProvider, BrandProvider con OKLab, TenantProvider, ThemeProvider, UI primitives, InfoIcon + TailwindColorPicker via Portal, UserMenu, AppShell + Sidebar + Topbar + Layout routes, Login full, UsuariosPage CRUD, ConfiguracionPage con Brand editor completo (BrandName + Paleta + Logos + Carrusel + LoginPreview), platform pages Tenants/AgencyAccess/GlobalSettings, AuditoriaPage).
- ✅ Deploy Railway: Backend + Postgres + Frontend con env vars configuradas, VITE_API_URL para cross-origin, CORS_ALLOWED_ORIGINS multi-host.
- ✅ Documentos: CLAUDE.md, BRAND.md, SKELETON_GUIDE.md, README.md.

### Pendiente
- Skill `Crear-app` (Fase 11): script que clona la plantilla, renombra y adapta a una app nueva.

---

## 4. Decisiones pendientes

> ✅ **Todas las decisiones de arquitectura y de marca resueltas.** Lista para arrancar Fase 1.

Documentos de referencia:
- [`CLAUDE.md`](./CLAUDE.md) — convenciones, stack y workflow.
- [`BRAND.md`](./BRAND.md) — identidad visual default de LogiQ.
- [`SKELETON_GUIDE.md`](./SKELETON_GUIDE.md) — guía técnica completa del esqueleto (estructura de carpetas, modelos, endpoints, plan de implementación commit-por-commit).
- [`docs/legacy/SKELETON_PROMPT_PROPOSAL_TerraDeFlora.md`](./docs/legacy/SKELETON_PROMPT_PROPOSAL_TerraDeFlora.md) — referencia histórica (Terra de Flora, FastAPI).

Logos en `Logos/` (se mueven a `frontend/public/brand/logiq/` en Fase 2).

---

## 5. Roadmap por fases

> El orden de las fases es tentativo y se ajusta según las decisiones pendientes.

### Fase 0 — Setup del repo *(en curso)*
- [x] Crear repo y conectar
- [x] CLAUDE.md y .gitignore
- [x] Configurar identidad git local
- [x] PROJECT_PLAN.md inicial
- [ ] Resolver decisiones pendientes mínimas (auth, deploy)

### Fase 1 — Esqueleto backend
- [ ] Crear proyecto Django (`backend/`)
- [ ] Configurar Postgres (docker-compose para dev)
- [ ] Configurar DRF
- [ ] Endpoint `/health` funcionando
- [ ] Configurar Celery + Redis
- [ ] Modelo de usuario base + auth (según decisión)

### Fase 2 — Esqueleto frontend
- [ ] Crear proyecto Vite + React + TS + Tailwind (`frontend/`)
- [ ] Configurar cliente API (fetch/axios contra backend)
- [ ] Layout base (sidebar + topbar)
- [ ] Sistema de rutas con `React.lazy` + `PREFETCH_MAP`
- [ ] Login conectado al backend
- [ ] `usePolling` con visibility-aware pause
- [ ] `fmtMoney` en `lib/format.ts`
- [ ] Skeleton loaders

### Fase 3 — Módulos base
- [ ] Gestión de usuarios (lista, crear, editar, desactivar)
- [ ] Panel de configuración (SystemConfig runtime, según decisión)
- [ ] Otros módulos según decisiones

### Fase 4 — Deploy
- [ ] Configurar destino de deploy (según decisión)
- [ ] Pipeline de build (Dockerfiles, scripts)
- [ ] Variables de entorno documentadas
- [ ] Primer deploy de prueba

### Fase 5 — Documentación y limpieza
- [ ] `README.md` con instrucciones claras de clonado y arranque
- [ ] Script de "renombrar app" (cambiar nombres del template a una app nueva)
- [ ] Checklist de "cosas a borrar/cambiar" al crear una app nueva
- [ ] Snapshot de v1.0

### Fase 6 — Convertir en skill `Crear-app`
- [ ] Diseñar la skill (qué preguntas hace al usuario, qué archivos toca)
- [ ] Implementar la skill usando `skill-creator`
- [ ] Probar creando 1-2 apps reales con la skill
- [ ] Iterar hasta que el flujo sea fluido

---

## 6. Log de decisiones tomadas

| Fecha | Decisión | Razón |
|---|---|---|
| 2026-05-25 | Stack: Django + DRF + Postgres + React/Vite/TS/Tailwind + Celery + Redis | Definido explícitamente por el usuario |
| 2026-05-25 | Migraciones nativas de Django (no patrón `seed.py` defensivo) | Convención estándar de la comunidad Django; más confiable |
| 2026-05-25 | Repo: `LogiqBI-OE/00_Plantilla`, rama única `main`, push directo en fase desarrollo | Definido por el usuario |
| 2026-05-25 | Identidad git local: `LogiQ OE <orla.elizondos@gmail.com>` (scope repo) | Separar cuenta personal del global corporativo de la máquina |
| 2026-05-25 | Idioma: español neutro en todo | Definido por el usuario |
| 2026-05-25 | Autenticación: jerárquica L0-L9 con matriz de permisos editable | Definido por el usuario |
| 2026-05-25 | Deploy: Railway | Definido por el usuario |
| 2026-05-25 | Multi-tenancy: la plantilla la soporta nativamente | Definido por el usuario |
| 2026-05-25 | Login adaptativo: si solo hay 1 tenant activo no se pide en login; si hay 2+, sí se pide | UX progresiva — no pagar costo cuando no se usa |
| 2026-05-25 | Matriz de permisos: **global** (una sola para toda la instancia), **con overrides por usuario** (un usuario específico puede tener permisos custom además de los de su nivel) | Definido por el usuario — flexibilidad sin complicar el modelo por-tenant |
| 2026-05-25 | Alcance de niveles cross-tenant: **L9 global** (ve todos los tenants), **L8 agencia** (ve un subconjunto de tenants asignado por L9), **L0-L7 single-tenant** (solo ven su propio tenant). L9 asigna qué tenants gestiona cada L8. | Modelo agencia/reseller — permite operación tipo MSP donde L8 gestiona varios clientes pero no toda la plataforma |
| 2026-05-25 | Módulos base de la plantilla: **Gestión de usuarios**, **Gestión de tenants** (consola L9/L8), **SystemConfig runtime** (Global Settings — instance-wide, controlado por L9), **BrandSettings por-tenant** (cada tenant edita su marca: logo, colores, nombre visible), **Logs/auditoría** | Definido por el usuario |
| 2026-05-25 | i18n: **bilingüe es/en desde el día uno**. Frontend con `react-i18next`, backend con Django i18n (`.po`). Todos los textos pasan por funciones de traducción. Selector de idioma en topbar, preferencia almacenada por usuario. | Definido por el usuario — todas las apps que se generen desde la plantilla heredan multi-idioma sin trabajo extra |
| 2026-05-25 | Identidad visual: **pantallas L9/L8 (consola tenants, global settings) llevan marca LogiQ siempre**. **Pantallas del tenant (operación diaria) heredan de su `BrandSettings`**. | Definido por el usuario — separa el producto LogiQ del app que el tenant consume |
| 2026-05-25 | Paleta LogiQ documentada en [`BRAND.md`](./BRAND.md): scopes Login y Sidebar fijos; Light/Dark con CSS variables. Acento azul Apple (#007AFF / #0A84FF). Logos en PNG 2813×1125 (completo) y ~640×640 (favicon), en versiones negro/blanco con transparencia. | Definido por el usuario |
| 2026-05-29 | **Banderas como SVG inline, nunca emoji**: los emoji de bandera no renderizan en Windows (muestran el código de región, ej. "US"). | Bug visible en producción |
| 2026-05-29 | **IA de settings**: la config del SISTEMA (Niveles, Permisos, Generales/SystemConfig, Licencia) vive en **"Configuración global"** (L9 plataforma) como tabs dentro de un **Card único** (canvas unificado estilo TdF: tabs arriba + contenido abajo). La config del **TENANT** (Marca/branding, etc.) va en página aparte ("Configuración"). Branding NO va en los settings globales. | Definido por el usuario ("este tipo de configuración es la global, después vemos la del tenant") |
| 2026-05-29 | **Flag `tenant_mode` (single \| multi)**, **single por defecto**, enfoque **"N=1, ocultar UI"**: una sola base multi-tenant; en single hay 1 tenant fijo y se ocultan selector de tenant + sección Plataforma. El modo cambia branding (global vs por-tenant) y la vista de Licencia (card única vs lista de tenants). | Definido por el usuario — la mayoría de apps clonadas son una sola empresa; evita bifurcar el código |
| 2026-05-29 | **Tab components no se auto-envuelven en `Card`**: el canvas padre provee el panel único. | Para lograr el "canvas unificado con tabs adentro" estilo TdF |
| 2026-06-02 | **Single mode = tenant fijo `logiq`/`LogiQ` (N=1)**: la capa de auth resuelve `request.tenant` siempre al tenant por defecto cuando `multitenant_enabled=false`, sin importar el JWT. L9 opera dentro del tenant sin seleccionarlo; la marca del tenant aplica a toda la app. | Implementación concreta del enfoque "N=1, ocultar UI"; evita re-login al cambiar el flag |
| 2026-06-02 | **Branding default**: logo de login = `logo-white.png`, logo de sidebar = `favicon-white.png`. | Definido por el usuario |
| 2026-06-02 | **Página de marca del tenant se llama "Brand"** (antes "Configuración"); solo contiene el editor de marca. | Definido por el usuario |
| 2026-06-02 | **Licensing 3-capas con exención de L9**: `Agency` es entidad propia con su licencia (opción 1, los L8 pertenecen a una agencia). Bloqueo: **L9 nunca**; **L8** según licencia de su agencia; **L0–L7** según licencia de su tenant. `max_users` se valida al crear usuario. | Definido por el usuario — modelo reseller/MSP escalable; el super-admin siempre puede entrar a arreglar la licencia |
| 2026-06-03 | **Tipo de tenant** `system` / `agency` / `cliente`. El tenant `system` (LogiQ) no es un workspace elegible: se excluye del selector de login. | Definido por el usuario |
| 2026-06-03 | **Seed por defecto**: tenant de sistema **LogiQ** + L9 **orlando** y **rogelio** (`logiqcrm`), vía migración de datos idempotente. | Definido por el usuario (tabla de seed) |
| 2026-06-03 | **Estándar de pantalla de Login** = el de Terra de Flora (header `— MARCA` + pill de alcance, labels en mayúsculas, ojo en contraseña, recuérdame/olvidaste, soporte, Powered by anclado, hero con logo grande + alcance en color accent + profundidad). Selector con preselección de la 1ª opción y mostrando el grupo/tipo, no el slug. | Definido por el usuario (referencia visual TdF) |
| 2026-06-03 | ~~PENDIENTE — reconciliar agencia~~ → **resuelto 2026-06-09** (ver fila siguiente). | Surgió al definir los tipos de tenant |
| 2026-06-09 | **Reconciliación de agencia = Opción A**: una agencia **ES** un `Tenant` con `type=agency`. Se eliminaron los modelos `Agency` y `AgencyLicense` (migración `accounts.0005`); `User.agency` pasa a FK de `tenants.Tenant`; la licencia se unifica en `TenantLicense` para todos los tenants. | Elegido por el usuario — una sola entidad/jerarquía, menos código que mantener |
| 2026-06-09 | **Acceso de agencia por-agencia (Opción 2-A)**: `AgencyTenantAccess` pasa de `(user L8, tenant)` a `(agency, tenant)`. Se asignan tenants a la agencia una vez y todos sus L8 los heredan (migración `accounts.0006`). | Elegido por el usuario — coherente con modelo reseller/MSP; elimina redundancia con `User.agency` |
| 2026-06-09 | **Tercer idioma: coreano (`ko`)** en las 4 capas: catálogo react-i18next (`ko.json`), navegación (`navConfig` con `label_ko` + helpers `navLang`/`pickNav`), catálogo de permisos (`label_ko`, servido en vivo — sin re-seed), backend (`User.preferred_language` choice + `LANGUAGES`, migración `accounts.0007`). Bandera Taegukgi SVG en el toggle. | Pedido por el usuario — la plantilla soporta i18n N-idiomas, no solo es/en |
| 2026-06-10 | **LanguageToggle = dropdown** (bandera + código de país MX/US/KR + nombre nativo), no botón que cicla. | Pedido por el usuario |
| 2026-06-10 | **Estándar de pantalla de lista** = header de página + Card canvas + `SectionHeader` (con slot `actions`) + tabla estándar. Aplicado a Tenants y Accesos de agencia. | Pedido por el usuario (igualar a Configuración global) |
| 2026-06-10 | **Sidebar responsive**: drawer off-canvas en móvil (hamburguesa + backdrop), sticky en `md+`. | Pedido por el usuario (no era responsivo a celular) |
| 2026-06-10 | **Pase completo de i18n**: TODO el texto de UI pasa por `t()` con catálogos es/en/ko. La app tenía español hardcodeado en casi todas las páginas. Se migra por fases (settings → plataforma → operación → brand). Los labels de niveles (DB, editables) y los `info` tooltips técnicos de la paleta (CSS-vars) NO se traducen. | Pedido por el usuario — el toggle no cambiaba nada porque el texto no pasaba por `t()` |
