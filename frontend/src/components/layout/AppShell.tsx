/**
 * AppShell — esqueleto Sidebar + Topbar + main.
 *
 * Gotcha #6 SKELETON_GUIDE: AppShell vive en layout route compartido
 * (RootLayout / PlatformLayout), NUNCA dentro de cada page. Asi el
 * Sidebar y Topbar no se remontean entre navegaciones.
 */
import type { ReactNode } from 'react';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { NAV_SECTIONS_PLATFORM, NAV_SECTIONS_TENANT } from './navConfig';

interface AppShellProps {
  children: ReactNode;
  variant?: 'tenant' | 'platform';
}

export function AppShell({ children, variant = 'tenant' }: AppShellProps): React.ReactElement {
  const sections = variant === 'platform' ? NAV_SECTIONS_PLATFORM : NAV_SECTIONS_TENANT;

  return (
    <div className="min-h-screen flex bg-page">
      <Sidebar sections={sections} variant={variant} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
