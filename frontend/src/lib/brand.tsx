/**
 * BrandProvider — paleta + logos + marca, aplicados al DOM en vivo.
 *
 * Responsabilidades:
 * - Cargar el brand del scope correcto:
 *     scope='tenant' -> /api/brand/ (necesita auth y tenant activo)
 *     scope='platform' -> /api/global-brand/ (L9 only, identidad LogiQ)
 *     scope='public' -> /api/brand/public/ (sin auth, para login)
 * - Aplicar la paleta al DOM via applyPalette() (CSS vars).
 * - Actualizar document.title = `${brand.marca} . ${brand.alcance}`.
 * - Actualizar el favicon dinamicamente si hay uno custom.
 *
 * Gotcha critico (heredado de Terra de Flora): los tokens temables NO
 * deben ir como inline styles en :root porque pisan a .theme-dark /
 * .theme-light. Se inyectan en un <style id="brand-themes"> con
 * selectores especificos.
 */
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { ApiError, brandApi, globalBrandApi } from './api';
import type { BrandPublic, BrandSettings } from './api';
import { expandirPaletaCompleta, type PaletaPrincipales } from './paletaDerivada';

export type BrandScope = 'tenant' | 'platform' | 'public';

interface BrandContextValue {
  loading: boolean;
  scope: BrandScope;
  brand: BrandSettings | BrandPublic | null;
  /** Aplica una paleta principal al DOM SIN persistir en backend (preview). */
  applyPaletaPreview: (paleta: PaletaPrincipales) => void;
  /** Recarga desde backend. */
  reload: () => Promise<void>;
}

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

interface BrandProviderProps {
  scope: BrandScope;
  children: ReactNode;
}

// --- Helpers para aplicar al DOM ---------------------------------------------

/**
 * Aplica una paleta al DOM. Los fixed van inline en :root, los temables
 * (light/dark) van en un <style id="brand-themes"> inyectado con
 * selectores correctos.
 */
export function applyPalette(raw: PaletaPrincipales): void {
  const root = document.documentElement;
  const p = expandirPaletaCompleta(raw);

  // 1) Limpiar inline residual de tokens temables (defensivo)
  for (const k of Object.keys(p.dark)) root.style.removeProperty(`--${k}`);
  for (const k of Object.keys(p.light)) root.style.removeProperty(`--${k}`);

  // 2) Tokens fijos: inline en :root
  for (const [k, v] of Object.entries(p.fixed)) {
    root.style.setProperty(`--${k}`, v);
  }

  // 3) Tokens temables: stylesheet inyectado con selectores correctos
  let style = document.getElementById('brand-themes') as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = 'brand-themes';
    document.head.appendChild(style);
  }
  const darkCss = Object.entries(p.dark).map(([k, v]) => `--${k}:${v};`).join('');
  const lightCss = Object.entries(p.light).map(([k, v]) => `--${k}:${v};`).join('');
  style.textContent = `
    :root, .theme-dark { ${darkCss} }
    .theme-light { ${lightCss} }
  `;
}

function updateDocumentTitle(brand: { marca?: string; alcance?: string }): void {
  const marca = brand.marca || 'LogiQ';
  const alcance = brand.alcance ? ` · ${brand.alcance}` : '';
  document.title = `${marca}${alcance}`;
}

function updateFavicon(brand: { logo_sidebar?: string }): void {
  if (!brand.logo_sidebar) return;
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (link) link.href = brand.logo_sidebar;
}

// --- Provider ----------------------------------------------------------------

export function BrandProvider({ scope, children }: BrandProviderProps): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState<BrandSettings | BrandPublic | null>(null);

  const fetchBrand = useCallback(async (): Promise<void> => {
    try {
      let result: BrandSettings | BrandPublic;
      if (scope === 'public') {
        result = await brandApi.getPublic();
      } else if (scope === 'platform') {
        result = await globalBrandApi.get();
      } else {
        result = await brandApi.get();
      }
      setBrand(result);
      // Aplicar inmediatamente al DOM
      if (result.paleta_actual) {
        applyPalette(result.paleta_actual);
      }
      updateDocumentTitle(result);
      updateFavicon(result);
    } catch (err: unknown) {
      // Tenant no activo / sin permisos: no es bloqueante, queda el default.
      if (!(err instanceof ApiError)) throw err;
    }
  }, [scope]);

  useEffect(() => {
    setLoading(true);
    void fetchBrand().finally(() => setLoading(false));
  }, [fetchBrand]);

  const applyPaletaPreview = useCallback((paleta: PaletaPrincipales) => {
    applyPalette(paleta);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    await fetchBrand();
    setLoading(false);
  }, [fetchBrand]);

  const value = useMemo<BrandContextValue>(
    () => ({ loading, scope, brand, applyPaletaPreview, reload }),
    [loading, scope, brand, applyPaletaPreview, reload],
  );

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand(): BrandContextValue {
  const ctx = useContext(BrandContext);
  if (!ctx) {
    throw new Error('useBrand debe usarse dentro de un <BrandProvider>.');
  }
  return ctx;
}
