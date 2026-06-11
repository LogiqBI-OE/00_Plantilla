/**
 * LoginPreview — miniatura sticky del Login que reacciona EN VIVO a la paleta.
 *
 * Usa las mismas CSS vars que la pantalla real -> al editar paleta, se ve
 * el cambio aqui sin recargar.
 */
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui';
import type { BrandSettings } from '@/lib/api';

interface Props {
  brand: BrandSettings;
}

export function LoginPreview({ brand }: Props): React.ReactElement {
  const { t } = useTranslation();
  const foto = brand.carrusel_fotos[0];

  return (
    <Card padding="sm" className="space-y-2">
      <p className="text-xs font-medium opacity-70">{t('brand.preview_title')}</p>
      <div className="relative rounded-xl overflow-hidden border border-border aspect-[3/4]">
        {/* Fondo: primera foto del carrusel o gris */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: foto ? `url(${foto})` : 'none',
            background: foto ? undefined : 'var(--bg-elevated)',
          }}
        />
        <div className="absolute inset-0 bg-black/40" />

        {/* Card mini */}
        <div className="absolute inset-4 flex items-center justify-center">
          <div className="w-full max-w-[260px] rounded-lg overflow-hidden shadow-xl grid grid-cols-2">
            {/* Form mini */}
            <div
              className="p-2.5 text-[8px]"
              style={{
                background: 'rgba(255,255,255,0.85)',
                color: '#0f172a',
              }}
            >
              <div
                className="inline-block px-1 py-0.5 rounded-full text-[6px] font-bold uppercase tracking-wider mb-1"
                style={{
                  background: 'var(--brand-hero-accent)',
                  color: 'var(--brand-hero-accent-ink)',
                }}
              >
                {brand.marca} · {brand.alcance}
              </div>
              <div className="font-bold text-[10px]">{t('auth.login.title')}</div>
              <div className="space-y-1 mt-1">
                <div className="h-2 bg-slate-200 rounded" />
                <div className="h-2 bg-slate-200 rounded" />
              </div>
              <div className="h-3 mt-1.5 rounded text-[6px] text-white text-center leading-3" style={{ background: '#0a1428' }}>
                {t('auth.login.submit', { alcance: brand.alcance })}
              </div>
            </div>

            {/* Hero mini */}
            <div
              className="p-2.5 flex flex-col items-center justify-center text-center text-[6px]"
              style={{
                background: 'var(--brand-hero-bg)',
                color: 'var(--brand-hero-text)',
              }}
            >
              {brand.logo_login ? (
                <img src={brand.logo_login} alt="" className="max-h-[40px] max-w-full object-contain" />
              ) : (
                <div className="font-bold">{brand.marca}</div>
              )}
              <div
                className="uppercase tracking-wider mt-1"
                style={{ color: 'var(--brand-hero-text)' }}
              >
                {brand.alcance.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
