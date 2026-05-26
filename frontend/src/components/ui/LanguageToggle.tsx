/**
 * LanguageToggle — cycla entre los idiomas soportados.
 *
 * Cuando hay usuario logueado, idealmente esto deberia tambien hacer PATCH
 * a /api/users/me/ para persistir la preferencia en el backend — pero eso
 * lo agregamos cuando exista el endpoint de me update (futuro).
 */
import { useTranslation } from 'react-i18next';

import { SUPPORTED_LANGUAGES, type Language } from '@/i18n';

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
      className="px-2 py-1 rounded-lg border border-border hover:bg-elevated transition text-xs uppercase font-medium tracking-wide"
    >
      {current}
    </button>
  );
}
