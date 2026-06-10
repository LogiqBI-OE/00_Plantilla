/**
 * Topbar — barra superior con titulo + acciones + user menu.
 *
 * El TenantSwitcher fue movido al Sidebar (SidebarTenantSelector). El
 * topbar tiene Help + Notificaciones (placeholders visuales por ahora),
 * los toggles globales (idioma + tema) y el menu del usuario. Todos los
 * botones de accion son circulares (estilo Terra de Flora).
 */
import { Bell, HelpCircle, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { LanguageToggle, ThemeToggle, UserMenu } from '@/components/ui';
import { usePageTitleValue } from '@/lib/pageTitle';

interface TopbarProps {
  /** Abre el drawer del sidebar (solo visible en movil). */
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps): React.ReactElement {
  const { t } = useTranslation();
  const title = usePageTitleValue();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={t('common.menu')}
          className="md:hidden w-9 h-9 -ml-1 inline-flex items-center justify-center rounded-full hover:bg-elevated transition shrink-0"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
        <h1 className="text-base font-semibold truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          title={t('help.label')}
          aria-label={t('help.label')}
          className="w-9 h-9 inline-flex items-center justify-center rounded-full hover:bg-elevated transition opacity-70 hover:opacity-100"
        >
          <HelpCircle size={18} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          title={t('notifications.label')}
          aria-label={t('notifications.label')}
          className="w-9 h-9 inline-flex items-center justify-center rounded-full hover:bg-elevated transition opacity-70 hover:opacity-100"
        >
          <Bell size={18} strokeWidth={1.5} />
        </button>
        <LanguageToggle />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
