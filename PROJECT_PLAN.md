# PROJECT_PLAN.md — 00_Plantilla

> **Propósito de este documento**: estado vivo del proyecto. Resume qué se ha decidido, qué falta por decidir y el orden en que se construirán las cosas. Si alguien pregunta "¿qué llevamos?" o "¿qué sigue?", se sintetiza desde aquí. **Actualizar cada vez que se complete algo grande o se tome una decisión nueva.**

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

### Pendiente
- Definir alcance del esqueleto mínimo (qué módulos entran en la v0.1)
- Crear estructura de carpetas `backend/` y `frontend/`
- Inicializar proyecto Django
- Inicializar proyecto Vite + React + Tailwind
- Configurar Postgres local (docker-compose probablemente)
- Configurar Celery + Redis
- Decidir esquema de autenticación
- Decidir destino de deploy y configurarlo
- Documentar `README.md` con instrucciones para clonar y arrancar

---

## 4. Decisiones pendientes

Estas son preguntas abiertas que hay que resolver antes de construir. **No asumir respuestas.**

1. **Multi-tenancy**: ¿la plantilla soporta múltiples organizaciones/clientes en una sola instancia, o cada app es de un solo "tenant"?
2. **Módulos base**: ¿qué tiene la plantilla "de fábrica" además de auth y shell? Posibles:
   - Gestión de usuarios
   - Panel de configuración del sistema (toggles runtime)
   - Logs/auditoría
   - Notificaciones (WhatsApp/email vía Celery)
   - Dashboard inicial
3. **Estilo visual**: ¿hay una identidad/paleta ya definida o se decide al inicio de cada app?
4. **i18n**: ¿la plantilla nace bilingüe (es/en) o monolingüe?

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
