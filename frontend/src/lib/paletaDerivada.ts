/**
 * Calcula los ~70 tokens derivados a partir de los 23 principales editables.
 *
 * Permite que el editor de Brand muestre solo 23 swatches al usuario, y
 * todos los hover/borders/halos/alphas se calculen automaticamente. Si
 * cambias las formulas en este archivo, todas las paletas guardadas se
 * "recalculan" en el siguiente render — no hay que migrar nada en backend.
 *
 * Ver SKELETON_GUIDE.md seccion "Editor de paleta".
 */
import { hexToRgb, rgbToHex, type RGB } from './colorPalettes';

// --- Helpers de color --------------------------------------------------------

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** rgba(r, g, b, a) */
export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

/** Mezcla perceptual lineal: 0=a, 1=b. */
export function mix(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const f = clamp(t, 0, 1);
  return rgbToHex({
    r: ca.r + (cb.r - ca.r) * f,
    g: ca.g + (cb.g - ca.g) * f,
    b: ca.b + (cb.b - ca.b) * f,
  });
}

/** Tinta negra o blanca segun luma (BT.709) del fondo. */
export function pickContrastInk(bgHex: string): '#000000' | '#FFFFFF' {
  const { r, g, b }: RGB = hexToRgb(bgHex);
  const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luma > 0.55 ? '#000000' : '#FFFFFF';
}

// --- Validacion --------------------------------------------------------------

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
export function isHex(value: unknown): value is string {
  return typeof value === 'string' && HEX_RE.test(value);
}

// --- Tipos -------------------------------------------------------------------

export interface PaletaPrincipales {
  fixed: Record<string, string>;
  light: Record<string, string>;
  dark: Record<string, string>;
}

export interface PaletaExpandida {
  fixed: Record<string, string>;
  light: Record<string, string>;
  dark: Record<string, string>;
}

// --- Alphas semanticos (afinados a mano en Terra de Flora) -------------------

const ALPHAS_DARK = {
  bgInput: 0.04, bgHover: 0.05, bgToggle: 0.06, bgMenu: 0.78,
  borderSoft: 0.40, borderStrong: 0.30,
  accentBgSoft: 0.16, accentBgSofter: 0.07, accentShadow: 0.35, accentRing: 0.30,
  semBg: 0.15, semBorder: 0.40,
  shadowOpacity: 0.55, ringOpacity: 0.06,
  heroHaloA: 0.12, heroHaloB: 0.06,
};

const ALPHAS_LIGHT = {
  bgInput: 0.05, bgHover: 0.04, bgToggle: 0.10, bgMenu: 0.78,
  borderSoft: 0.50, borderStrong: 0.25,
  accentBgSoft: 0.10, accentBgSofter: 0.04, accentShadow: 0.30, accentRing: 0.20,
  semBg: 0.08, semBorder: 0.30,
  shadowOpacity: 0.18, ringOpacity: 0.06,
  heroHaloA: 0.06, heroHaloB: 0.03,
};

// --- Expansion de tokens fijos (Login + Sidebar) -----------------------------

function expandirFixed(p: Record<string, string>): Record<string, string> {
  const out = { ...p };

  // Sidebar derivados
  const sidebarText = p['sidebar-text'];
  const sidebarBg = p['sidebar-bg'];
  const sidebarActiveText = p['sidebar-active-text'];
  if (sidebarText && sidebarBg) {
    out['sidebar-text-secondary'] = mix(sidebarText, sidebarBg, 0.30);
    out['sidebar-text-muted'] = mix(sidebarText, sidebarBg, 0.55);
    out['sidebar-active-bg'] = withAlpha(sidebarActiveText, 0.16);
    out['sidebar-hover-bg'] = withAlpha(pickContrastInk(sidebarBg), 0.06);
    out['sidebar-border'] = withAlpha(pickContrastInk(sidebarBg), 0.06);
  }

  // Brand Hero (Login derecha)
  const heroBg = p['brand-hero-bg'];
  const heroAccent = p['brand-hero-accent'];
  if (heroBg && heroAccent) {
    out['brand-hero-bg'] = `linear-gradient(135deg, ${heroBg} 0%, ${mix(heroBg, '#FFFFFF', 0.18)} 60%, ${heroBg} 100%)`;
    out['brand-hero-text'] = pickContrastInk(heroBg);
    out['brand-hero-accent-ink'] = pickContrastInk(heroAccent);
    out['brand-hero-text-secondary'] = mix(heroAccent, pickContrastInk(heroBg), 0.45);
    out['brand-hero-text-muted'] = mix(heroAccent, heroBg, 0.50);
    out['brand-hero-accent-bg'] = withAlpha(heroAccent, 0.18);
    out['brand-hero-accent-bg-soft'] = withAlpha(heroAccent, 0.08);
    out['brand-hero-divider'] = withAlpha(heroAccent, 0.40);
    out['brand-hero-quote-border'] = withAlpha(heroAccent, 0.75);
  }

  return out;
}

// --- Expansion de tokens temables (Light o Dark) -----------------------------

function expandirTema(p: Record<string, string>, isDark: boolean): Record<string, string> {
  const a = isDark ? ALPHAS_DARK : ALPHAS_LIGHT;
  const bgPage = p['bg-page'];
  const bgCard = p['bg-card'];
  const border = p['border'];
  const accent = p['accent'];
  const textPrimary = p['text-primary'];
  const info = p['info'];
  const warning = p['warning'];
  const danger = p['danger'];

  // Si falta algo, devolver lo que hay (defensivo)
  if (!bgPage || !bgCard || !border || !accent || !textPrimary || !info || !warning || !danger) {
    return { ...p };
  }

  const ink = pickContrastInk(bgPage);

  return {
    ...p,

    // Surfaces
    'bg-page-2': mix(bgPage, ink, 0.03),
    'bg-card-soft': withAlpha(bgCard, 0.6),
    'bg-elevated': mix(bgPage, bgCard, 0.5),
    'bg-elevated-strong': mix(bgCard, ink, 0.04),
    'bg-input': withAlpha(ink, a.bgInput),
    'bg-hover': withAlpha(ink, a.bgHover),
    'bg-toggle': withAlpha(ink, a.bgToggle),
    'bg-menu': withAlpha(bgCard, a.bgMenu),
    'shadow-menu':
      `0 16px 48px ${withAlpha(isDark ? '#000000' : textPrimary, a.shadowOpacity)}, ` +
      `0 0 0 1px ${withAlpha(ink, a.ringOpacity)}`,

    // Borders
    'border-soft': mix(border, bgPage, a.borderSoft),
    'border-strong': mix(border, ink, a.borderStrong),

    // Text
    'text-secondary': mix(textPrimary, bgPage, 0.30),
    'text-muted': mix(textPrimary, bgPage, 0.55),
    'text-faint': mix(textPrimary, bgPage, 0.70),
    'text-on-accent': pickContrastInk(accent),

    // Accent derivados
    'accent-text': isDark ? mix(accent, '#FFFFFF', 0.20) : accent,
    'accent-dark': mix(accent, '#000000', 0.20),
    'accent-bg-soft': withAlpha(accent, a.accentBgSoft),
    'accent-bg-softer': withAlpha(accent, a.accentBgSofter),
    'accent-shadow': withAlpha(accent, a.accentShadow),
    'accent-ring': withAlpha(accent, a.accentRing),

    // Semantic
    'danger-bg': withAlpha(danger, a.semBg),
    'danger-border': withAlpha(danger, a.semBorder),
    'warning-bg': withAlpha(warning, a.semBg),
    'info-bg': withAlpha(info, a.semBg),
    'neutral-bg': withAlpha(mix(textPrimary, bgPage, 0.55), a.semBg),
    'neutral-text': mix(textPrimary, bgPage, 0.30),
    'on-danger': pickContrastInk(danger),

    // Hero gradient (fondo de pages, NO Login)
    'hero-gradient':
      `radial-gradient(900px 500px at 85% 15%, ${withAlpha(accent, a.heroHaloA)}, transparent 60%), ` +
      `radial-gradient(700px 500px at 10% 90%, ${withAlpha(accent, a.heroHaloB)}, transparent 60%), ` +
      `linear-gradient(180deg, ${bgPage} 0%, ${mix(bgPage, ink, 0.03)} 100%)`,
  };
}

/** Expansion completa de la paleta: principales + ~70 derivados. */
export function expandirPaletaCompleta(p: PaletaPrincipales): PaletaExpandida {
  return {
    fixed: expandirFixed(p.fixed ?? {}),
    light: expandirTema(p.light ?? {}, false),
    dark: expandirTema(p.dark ?? {}, true),
  };
}
