/**
 * LanguageToggle — boton que cicla idiomas.
 *
 * Muestra la bandera del idioma actual (no del proximo). Click cicla
 * al siguiente idioma soportado.
 *
 * Las banderas son SVG inline (no emojis): los emojis de bandera no se
 * renderizan en Windows (muestran el codigo de region, ej. "US"). Si
 * agregas un idioma nuevo a SUPPORTED_LANGUAGES, agrega su bandera al
 * mapa FLAGS abajo.
 */
import { useTranslation } from 'react-i18next';

import { SUPPORTED_LANGUAGES, type Language } from '@/i18n';

/** Bandera de Mexico (tricolor vertical verde/blanco/rojo). */
function FlagMX(): React.ReactElement {
  return (
    <svg viewBox="0 0 21 14" width="20" height="14" className="rounded-[2px]" aria-hidden="true">
      <rect width="7" height="14" x="0" fill="#006847" />
      <rect width="7" height="14" x="7" fill="#ffffff" />
      <rect width="7" height="14" x="14" fill="#ce1126" />
      <circle cx="10.5" cy="7" r="1.6" fill="#8b5a2b" />
    </svg>
  );
}

/** Bandera de Estados Unidos (13 franjas + canton azul). */
function FlagUS(): React.ReactElement {
  return (
    <svg viewBox="0 0 21 14" width="20" height="14" className="rounded-[2px]" aria-hidden="true">
      {Array.from({ length: 13 }).map((_, i) => (
        <rect
          key={i}
          x="0"
          y={(i * 14) / 13}
          width="21"
          height={14 / 13}
          fill={i % 2 === 0 ? '#b22234' : '#ffffff'}
        />
      ))}
      <rect x="0" y="0" width="9" height={(14 / 13) * 7} fill="#3c3b6e" />
    </svg>
  );
}

/** Bandera de Corea del Sur (Taegukgi: campo blanco + taegeuk rojo/azul). */
function FlagKR(): React.ReactElement {
  return (
    <svg viewBox="0 0 21 14" width="20" height="14" className="rounded-[2px]" aria-hidden="true">
      <rect width="21" height="14" fill="#ffffff" />
      {/* Taegeuk: mitad superior roja, inferior azul */}
      <path d="M10.5 3.5a3.5 3.5 0 0 1 0 7 1.75 1.75 0 0 1 0-3.5 1.75 1.75 0 0 0 0-3.5Z" fill="#c60c30" />
      <path d="M10.5 3.5a3.5 3.5 0 0 0 0 7 1.75 1.75 0 0 0 0-3.5 1.75 1.75 0 0 1 0-3.5Z" fill="#003478" />
      {/* Trigramas (simplificados) en las 4 esquinas */}
      <g fill="#000000">
        <rect x="2.5" y="3" width="3" height="0.7" />
        <rect x="2.5" y="4.2" width="3" height="0.7" />
        <rect x="2.5" y="5.4" width="3" height="0.7" />
        <rect x="15.5" y="3" width="3" height="0.7" />
        <rect x="15.5" y="4.2" width="3" height="0.7" />
        <rect x="15.5" y="5.4" width="3" height="0.7" />
        <rect x="2.5" y="7.9" width="3" height="0.7" />
        <rect x="2.5" y="9.1" width="3" height="0.7" />
        <rect x="2.5" y="10.3" width="3" height="0.7" />
        <rect x="15.5" y="7.9" width="3" height="0.7" />
        <rect x="15.5" y="9.1" width="3" height="0.7" />
        <rect x="15.5" y="10.3" width="3" height="0.7" />
      </g>
    </svg>
  );
}

const FLAGS: Record<Language, () => React.ReactElement> = {
  es: FlagMX,
  en: FlagUS,
  ko: FlagKR,
};

export function LanguageToggle(): React.ReactElement {
  const { i18n, t } = useTranslation();

  const current = (i18n.language.split('-')[0] ?? 'es') as Language;
  const idx = SUPPORTED_LANGUAGES.indexOf(current);
  const next = SUPPORTED_LANGUAGES[(idx + 1) % SUPPORTED_LANGUAGES.length] ?? 'es';

  const Flag = FLAGS[current];

  return (
    <button
      type="button"
      onClick={() => void i18n.changeLanguage(next)}
      title={t('language.label')}
      aria-label={t('language.label')}
      className="w-9 h-9 inline-flex items-center justify-center rounded-full hover:bg-elevated transition"
    >
      <Flag />
      <span className="sr-only">{t(`language.${current}`)}</span>
    </button>
  );
}
