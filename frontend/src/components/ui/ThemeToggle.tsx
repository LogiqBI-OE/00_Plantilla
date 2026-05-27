/**
 * ThemeToggle — boton para alternar entre Light y Dark.
 *
 * Iconos Lucide outline (matching el estilo wireframe del sidebar):
 * - Tema actual = Light  -> muestra Sun (representando el estado actual)
 * - Tema actual = Dark   -> muestra Moon
 */
import { Moon, Sun } from 'lucide-react';
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
      className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-border hover:bg-elevated transition"
    >
      {theme === 'light' ? (
        <Sun size={16} strokeWidth={1.5} />
      ) : (
        <Moon size={16} strokeWidth={1.5} />
      )}
      <span className="sr-only">{t(`theme.${next}`)}</span>
    </button>
  );
}
