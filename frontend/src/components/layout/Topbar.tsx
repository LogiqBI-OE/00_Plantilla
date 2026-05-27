/**
 * Topbar — barra superior con titulo + toggles + user menu.
 *
 * El TenantSwitcher fue movido al Sidebar (SidebarTenantSelector). El
 * topbar solo tiene los toggles globales y el menu del usuario.
 */
import { LanguageToggle, ThemeToggle, UserMenu } from '@/components/ui';
import { usePageTitleValue } from '@/lib/pageTitle';

export function Topbar(): React.ReactElement {
  const title = usePageTitleValue();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-base font-semibold truncate">{title}</h1>
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
