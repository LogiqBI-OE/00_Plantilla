# CLAUDE.md

> **Antes de cualquier trabajo, lee [`PROJECT_PLAN.md`](./PROJECT_PLAN.md).**
> Ahí está el estado de cada módulo, decisiones tomadas con el usuario,
> roadmap y pendientes. Si te preguntan "¿qué llevamos?" o "¿qué sigue?",
> sintetiza desde ese documento. **Actualízalo cuando completes algo grande.**

Stack:
- **Backend**: Django + Django REST Framework — base de datos, seguridad, roles de usuario y API.
- **Base de datos**: PostgreSQL — almacenamiento seguro de datos del dominio.
- **Frontend**: React + Vite + TypeScript + Tailwind — interfaz visual moderna.
- **Tareas asíncronas**: Celery + Redis — envío de WhatsApps, correos y trabajos en segundo plano.
Repo: `LogiqBI-OE/00_Plantilla` — https://github.com/LogiqBI-OE/00_Plantilla.git (rama única `main`, push = deploy).

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
