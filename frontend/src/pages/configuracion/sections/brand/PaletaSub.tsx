/**
 * PaletaSub — editor de paleta principal (23 colores).
 *
 * Estructura:
 * - Acordeones Fijos (Login + Sidebar)
 * - Toggle Light / Dark para los 8 colores temables x tema
 * - Cada row: friendly name + InfoIcon + TailwindColorPicker + reset
 * - Memorias: lista de paletas guardadas con aplicar/borrar.
 * - Aplica EN VIVO: cada edit llama applyPalette(...) para preview.
 * - Guarda solo principales (backend hace expansion).
 */
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, X } from 'lucide-react';

import { Button, Card, InfoIcon, TailwindColorPicker } from '@/components/ui';
import { brandApi } from '@/lib/api';
import type { BrandPaleta, BrandSettings } from '@/lib/api';
import { applyPalette } from '@/lib/brand';
import { PALETA_DEFAULT } from '@/lib/paletaDerivada';

interface Props {
  brand: BrandSettings;
  onSaved: () => Promise<void>;
}

// Spec de cada principal editable. Orden = orden de render.
// `labelKey` -> clave i18n (brand.color.*); `info` queda en español (tooltip
// tecnico que referencia la CSS-var, no se traduce — ver CLAUDE.md).
const FIXED_LOGIN: Array<{ key: string; labelKey: string; info: string }> = [
  { key: 'brand-hero-bg', labelKey: 'brand.color.bg', info: '--brand-hero-bg · Fondo del panel derecho del Login.' },
  { key: 'brand-hero-accent', labelKey: 'brand.color.accent_color', info: '--brand-hero-accent · Chip MARCA·ALCANCE y decoraciones.' },
];

const FIXED_SIDEBAR: Array<{ key: string; labelKey: string; info: string }> = [
  { key: 'sidebar-bg', labelKey: 'brand.color.bg', info: '--sidebar-bg' },
  { key: 'sidebar-active-text', labelKey: 'brand.color.active_page_text', info: '--sidebar-active-text · El active-bg se deriva con alpha.' },
  { key: 'sidebar-section-title', labelKey: 'brand.color.section_title', info: '--sidebar-section-title' },
  { key: 'sidebar-text', labelKey: 'brand.color.pages_text', info: '--sidebar-text' },
  { key: 'sidebar-disabled-text', labelKey: 'brand.color.disabled_text', info: '--sidebar-disabled-text · Items "proximamente".' },
];

const THEMED: Array<{ key: string; labelKey: string; info: string }> = [
  { key: 'bg-page', labelKey: 'brand.color.page_bg', info: '--bg-page' },
  { key: 'bg-card', labelKey: 'brand.color.card_bg', info: '--bg-card' },
  { key: 'border', labelKey: 'brand.color.borders', info: '--border' },
  { key: 'accent', labelKey: 'brand.color.accent', info: '--accent · Botones primarios, links.' },
  { key: 'text-primary', labelKey: 'brand.color.text_primary', info: '--text-primary' },
  { key: 'info', labelKey: 'brand.color.info', info: '--info' },
  { key: 'warning', labelKey: 'brand.color.warning', info: '--warning' },
  { key: 'danger', labelKey: 'brand.color.danger', info: '--danger' },
];

export function PaletaSub({ brand, onSaved }: Props): React.ReactElement {
  const { t } = useTranslation();
  // Estado local: copia editable de la paleta. Los principales son hex puros.
  const initial = useMemo<BrandPaleta>(() => {
    const p = brand.paleta_actual ?? PALETA_DEFAULT;
    return {
      fixed: { ...PALETA_DEFAULT.fixed, ...(p.fixed ?? {}) },
      light: { ...PALETA_DEFAULT.light, ...(p.light ?? {}) },
      dark: { ...PALETA_DEFAULT.dark, ...(p.dark ?? {}) },
    };
  }, [brand.paleta_actual]);

  const [paleta, setPaleta] = useState<BrandPaleta>(initial);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [saving, setSaving] = useState(false);
  const [memoryName, setMemoryName] = useState('');

  // Aplicar en vivo al DOM cada vez que cambia la paleta editada.
  useEffect(() => {
    applyPalette(paleta);
  }, [paleta]);

  // Si el padre re-fetcha (otra ventana, etc.), resetear estado local.
  useEffect(() => {
    setPaleta(initial);
  }, [initial]);

  const dirty = JSON.stringify(paleta) !== JSON.stringify(initial);

  const setFixed = (k: string, hex: string) =>
    setPaleta((p) => ({ ...p, fixed: { ...p.fixed, [k]: hex } }));
  const setThemed = (k: string, hex: string) =>
    setPaleta((p) => ({ ...p, [theme]: { ...p[theme], [k]: hex } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await brandApi.patch({ paleta_actual: paleta });
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setPaleta(initial);
    applyPalette(initial);
  };

  const handleResetDefault = async () => {
    if (!confirm(t('brand.reset_palette_confirm'))) return;
    setSaving(true);
    try {
      const res = await brandApi.resetPaletaDefault();
      setPaleta(res.paleta_actual);
      applyPalette(res.paleta_actual);
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  const handleGuardarMemoria = async () => {
    if (!memoryName.trim()) return;
    await brandApi.guardarPaletaMemoria(memoryName.trim());
    setMemoryName('');
    await onSaved();
  };

  const renderRow = (
    item: { key: string; labelKey: string; info: string },
    value: string,
    onChange: (hex: string) => void,
  ) => (
    <div key={item.key} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
      <div className="flex-1 flex items-center gap-1.5">
        <span className="text-sm">{t(item.labelKey)}</span>
        <InfoIcon text={item.info} />
      </div>
      <TailwindColorPicker value={value} onChange={onChange} label={t(item.labelKey)} />
    </div>
  );

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold">{t('brand.palette')}</h3>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleResetDefault} loading={saving}>
            {t('brand.reset_default')}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDiscard} disabled={!dirty}>
            {t('common.discard')}
          </Button>
          <Button size="sm" onClick={handleSave} loading={saving} disabled={!dirty}>
            {t('common.save')}
          </Button>
        </div>
      </div>

      <details open className="border border-border rounded-lg p-3" style={{ overflow: 'visible' }}>
        <summary className="cursor-pointer font-medium text-sm">{t('brand.login_fixed')}</summary>
        <div className="mt-2">
          {FIXED_LOGIN.map((item) =>
            renderRow(item, paleta.fixed[item.key] ?? '#000000', (hex) => setFixed(item.key, hex)),
          )}
        </div>
      </details>

      <details open className="border border-border rounded-lg p-3" style={{ overflow: 'visible' }}>
        <summary className="cursor-pointer font-medium text-sm">{t('brand.sidebar_fixed')}</summary>
        <div className="mt-2">
          {FIXED_SIDEBAR.map((item) =>
            renderRow(item, paleta.fixed[item.key] ?? '#000000', (hex) => setFixed(item.key, hex)),
          )}
        </div>
      </details>

      <div className="border border-border rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-sm">{t('brand.by_theme')}</span>
          <div className="flex gap-1">
            {(['light', 'dark'] as const).map((th) => (
              <button
                key={th}
                type="button"
                onClick={() => setTheme(th)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1 ${theme === th ? 'bg-accent text-white' : 'opacity-60 hover:opacity-100'}`}
              >
                {th === 'light' ? <Sun size={13} strokeWidth={1.5} /> : <Moon size={13} strokeWidth={1.5} />}
                {th === 'light' ? t('theme.light') : t('theme.dark')}
              </button>
            ))}
          </div>
        </div>
        <div>
          {THEMED.map((item) =>
            renderRow(item, paleta[theme][item.key] ?? '#000000', (hex) => setThemed(item.key, hex)),
          )}
        </div>
      </div>

      <div className="border border-border rounded-lg p-3 space-y-2">
        <div className="font-medium text-sm">{t('brand.memories', { count: brand.paletas_memoria.length })}</div>
        {brand.paletas_memoria.map((m, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className="flex-1 truncate">{m.nombre}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                const res = await brandApi.aplicarPaletaMemoria(idx);
                setPaleta(res.paleta_actual);
                applyPalette(res.paleta_actual);
                await onSaved();
              }}
            >
              {t('brand.apply')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                await brandApi.borrarPaletaMemoria(idx);
                await onSaved();
              }}
            >
              <X strokeWidth={1.5} size={13} />
            </Button>
          </div>
        ))}
        {brand.paletas_memoria.length < 5 && (
          <div className="flex gap-2 pt-1">
            <input
              value={memoryName}
              onChange={(e) => setMemoryName(e.target.value)}
              placeholder={t('common.name')}
              className="flex-1 rounded-lg bg-card border border-border px-2 py-1 text-xs"
            />
            <Button size="sm" onClick={handleGuardarMemoria} disabled={!memoryName.trim()}>
              {t('brand.save_current')}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
