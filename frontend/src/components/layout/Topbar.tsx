/**
 * Topbar — barra superior con titulo (del pageTitle context) + toggles + user menu.
 */
import { LanguageToggle, TenantSwitcher, ThemeToggle, UserMenu } from '@/components/ui';
import { usePageTitleValue } from '@/lib/pageTitle';

export function Topbar(): React.ReactElement {
  const title = usePageTitleValue();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-base font-semibold truncate">{title}</h1>
      <div className="flex items-center gap-2">
        <TenantSwitcher />
        <LanguageToggle />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
