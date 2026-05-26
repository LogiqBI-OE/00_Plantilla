/**
 * ThemeToggle — boton para alternar entre Light y Dark.
 */
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/lib/theme';

export function ThemeToggle(): React.ReactElement {
  const { t } = useTranslation();
  const { theme, toggle } = useTheme();
  const next = theme === 'light' ? 'dark' : 'light';

  return (
    <button
      type="button"
      onClick={toggle}
      title={t('theme.toggle')}
      aria-label={t('theme.toggle')}
      className="p-2 rounded-lg border border-border hover:bg-elevated transition text-sm"
    >
      {theme === 'light' ? '☀️' : '🌙'}
      <span className="sr-only">{t(`theme.${next}`)}</span>
    </button>
  );
}
