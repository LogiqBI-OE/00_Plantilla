/**
 * BrandTab — editor de marca del tenant.
 *
 * Layout split: sub-nav + sub-tab activo a la izquierda (2 cols),
 * LoginPreview sticky a la derecha (1 col).
 *
 * Orden de sub-tabs: Brand Name -> Paleta -> Logos -> Carrusel.
 * Razon: Logos usa la paleta como fondo del preview, paleta primero.
 */
import { useCallback, useEffect, useState } from 'react';

import { SkeletonBox } from '@/components/ui';
import { brandApi } from '@/lib/api';
import type { BrandSettings } from '@/lib/api';

import { BrandNameSub } from './brand/BrandNameSub';
import { PaletaSub } from './brand/PaletaSub';
import { LogosSub } from './brand/LogosSub';
import { CarruselSub } from './brand/CarruselSub';
import { LoginPreview } from './brand/LoginPreview';

type SubTab = 'name' | 'paleta' | 'logos' | 'carrusel';

const SUB_TABS: Array<{ key: SubTab; label: string }> = [
  { key: 'name', label: 'Brand Name' },
  { key: 'paleta', label: 'Paleta de colores' },
  { key: 'logos', label: 'Logos' },
  { key: 'carrusel', label: 'Carrusel' },
];

export function BrandTab(): React.ReactElement {
  const [active, setActive] = useState<SubTab>('name');
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await brandApi.get();
      setBrand(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (loading || !brand) {
    return <SkeletonBox height={400} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <div className="flex items-center gap-2 flex-wrap border-b border-border pb-3">
          {SUB_TABS.map((st) => {
            const isActive = st.key === active;
            return (
              <button
                key={st.key}
                type="button"
                onClick={() => setActive(st.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition border"
                style={{
                  background: isActive ? 'var(--accent-bg-soft)' : 'transparent',
                  color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)',
                  borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                }}
              >
                {st.label}
              </button>
            );
          })}
        </div>

        {active === 'name' && <BrandNameSub brand={brand} onSaved={reload} />}
        {active === 'paleta' && <PaletaSub brand={brand} onSaved={reload} />}
        {active === 'logos' && <LogosSub brand={brand} onSaved={reload} />}
        {active === 'carrusel' && <CarruselSub brand={brand} onSaved={reload} />}
      </div>

      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-4">
          <LoginPreview brand={brand} />
        </div>
      </div>
    </div>
  );
}
