# BRAND.md — Identidad visual LogiQ (default de la plantilla)

> Esta es la **identidad visual de LogiQ Business Intelligence** que la plantilla usa por defecto.
> - Las pantallas de **L9/L8 (consola de tenants, global settings)** siempre usan esta identidad — son producto LogiQ.
> - Las pantallas de **tenants (operación diaria)** heredan de su `BrandSettings`, no de este archivo. Si un tenant no personaliza, hereda esta misma paleta como fallback.

---

## 1. Logos

> 📍 Ubicación pendiente: `frontend/public/brand/logiq/` (se crea en Fase 2)

| Archivo | Uso | Formato preferido |
|---|---|---|
| Logo completo (isotipo + wordmark + tagline) | Login, header de consola admin, splash | SVG con `currentColor` |
| Favicon (solo isotipo cerebro) | Pestaña del navegador, PWA icon | SVG + PNG 32/192/512 |

**Variantes necesarias**: la versión SVG con `currentColor` cubre tanto fondo claro como oscuro con un solo archivo. Si solo hay PNG, se necesita una versión negra y una blanca.

---

## 2. Paleta de colores

### 2.1. Login (scope propio — no cambia con tema)

| Variable | Hex | Tailwind | Uso |
|---|---|---|---|
| `--brand-hero-bg` | `#0A1428` | custom (navy) | Fondo principal de la pantalla de login |
| `--brand-hero-accent` | `#D4B996` | custom (champagne) | Acento/decoración en login |

### 2.2. Sidebar (scope propio — no cambia con tema)

| Variable | Hex | Tailwind | Uso |
|---|---|---|---|
| `--sidebar-bg` | `#161513` | custom (warm graphite) | Fondo del sidebar |
| `--sidebar-active-text` | `#0A84FF` | Apple blue dark | Texto del item activo |
| `--sidebar-section-title` | `#787570` | stone-500 | Títulos de sección |
| `--sidebar-text` | `#F5F4F1` | stone-100 | Texto normal de items |
| `--sidebar-disabled-text` | `#52504C` | stone-600 | Items deshabilitados / "próximamente" |

### 2.3. ☀️ Tema Light

| Variable | Hex | Tailwind | Uso |
|---|---|---|---|
| `--bg-page` | `#F8FAFC` | slate-50 | Fondo general de la página |
| `--bg-card` | `#FFFFFF` | white | Fondo de tarjetas, modales, paneles |
| `--border` | `#E2E8F0` | slate-200 | Bordes, separadores |
| `--accent` | `#007AFF` | custom (Apple blue light) | Botones primarios, links, acentos |
| `--text-primary` | `#0F172A` | slate-900 | Texto principal |
| `--info` | `#0369A1` | sky-700 | Mensajes informativos / éxito |
| `--warning` | `#B45309` | amber-700 | Advertencias |
| `--danger` | `#DC2626` | red-600 | Errores / destructivo |

### 2.4. 🌙 Tema Dark

| Variable | Hex | Tailwind | Uso |
|---|---|---|---|
| `--bg-page` | `#1A1916` | custom (warm dark) | Fondo general de la página |
| `--bg-card` | `#23211D` | custom (warm raised) | Fondo de tarjetas, modales, paneles |
| `--border` | `#2D2A26` | custom (gris cálido) | Bordes, separadores |
| `--accent` | `#0A84FF` | custom (Apple blue dark) | Botones primarios, links, acentos |
| `--text-primary` | `#F5F4F1` | stone-100 | Texto principal (cálido, no blanco puro) |
| `--info` | `#7DD3FC` | sky-300 | Mensajes informativos / éxito |
| `--warning` | `#FCD34D` | amber-300 | Advertencias |
| `--danger` | `#FCA5A5` | red-300 | Errores / destructivo |

---

## 3. Implementación en Tailwind

> Pendiente Fase 2 — referencia para cuando se cree `tailwind.config.js`.

**Estrategia recomendada**: definir todos los colores como CSS custom properties en `index.css` y referenciarlos desde Tailwind. Cambiar de tema = togglear clase `dark` en `<html>`, no recompilar.

```css
/* index.css */
:root {
  --bg-page: #F8FAFC;
  --bg-card: #FFFFFF;
  /* ...resto del tema light */
}
:root.dark {
  --bg-page: #1A1916;
  --bg-card: #23211D;
  /* ...resto del tema dark */
}
/* Sidebar y Login NO cambian con :root.dark — siempre los mismos valores */
```

```js
// tailwind.config.js (extracto)
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        page: 'var(--bg-page)',
        card: 'var(--bg-card)',
        accent: 'var(--accent)',
        // ...
        sidebar: {
          bg: '#161513',
          'active-text': '#0A84FF',
          // ... (valores fijos, no variables)
        },
        brand: {
          'hero-bg': '#0A1428',
          'hero-accent': '#D4B996',
        },
      },
    },
  },
};
```

---

## 4. Notas de diseño

- **Texto en dark mode**: usar `stone-100` (#F5F4F1), no `white` puro. Reduce fatiga visual sobre fondos cálidos.
- **Acento azul Apple**: mismo color de marca en ambos temas, solo cambia el brillo (#007AFF light → #0A84FF dark).
- **"Próximamente" en sidebar**: usar `--sidebar-disabled-text` + cursor `not-allowed` + tooltip explicativo.
- **Estados de éxito**: comparten variable con `info` (no se diferencia "éxito" y "información" en esta paleta — usar iconografía/copy para distinguir).
