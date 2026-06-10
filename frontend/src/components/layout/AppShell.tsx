/**
 * AppShell — esqueleto Sidebar + Topbar + main.
 *
 * Gotcha #6 SKELETON_GUIDE: AppShell vive en layout route compartido
 * (AppLayout), NUNCA dentro de cada page. Asi Sidebar y Topbar no se
 * remontean entre navegaciones.
 */
import { type ReactNode, useState } from 'react';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps): React.ReactElement {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-page">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto px-4 sm:px-6 py-4 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
