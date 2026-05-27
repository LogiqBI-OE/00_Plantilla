/**
 * LanguageToggle — boton que cicla idiomas.
 *
 * Muestra la bandera del idioma actual (no del proximo). Click cicla
 * al siguiente idioma soportado.
 *
 * Si quieres cambiar las banderas (ej. 🇪🇸 en vez de 🇲🇽 para ES), edita
 * el mapa FLAGS abajo.
 */
import { useTranslation } from 'react-i18next';

import { SUPPORTED_LANGUAGES, type Language } from '@/i18n';

const FLAGS: Record<Language, string> = {
  es: '🇲🇽',
  en: '🇺🇸',
};

export function LanguageToggle(): React.ReactElement {
  const { i18n, t } = useTranslation();

  const current = (i18n.language.split('-')[0] ?? 'es') as Language;
  const idx = SUPPORTED_LANGUAGES.indexOf(current);
  const next = SUPPORTED_LANGUAGES[(idx + 1) % SUPPORTED_LANGUAGES.length] ?? 'es';

  return (
    <button
      type="button"
      onClick={() => void i18n.changeLanguage(next)}
      title={t('language.label')}
      aria-label={t('language.label')}
      className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-border hover:bg-elevated transition text-base leading-none"
    >
      <span aria-hidden="true">{FLAGS[current]}</span>
      <span className="sr-only">{t(`language.${current}`)}</span>
    </button>
  );
}
