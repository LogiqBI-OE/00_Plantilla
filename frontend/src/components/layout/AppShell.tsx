/**
 * AppShell — esqueleto Sidebar + Topbar + main.
 *
 * Gotcha #6 SKELETON_GUIDE: AppShell vive en layout route compartido
 * (AppLayout), NUNCA dentro de cada page. Asi Sidebar y Topbar no se
 * remontean entre navegaciones.
 */
import type { ReactNode } from 'react';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps): React.ReactElement {
  return (
    <div className="min-h-screen flex bg-page">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto px-4 sm:px-6 py-4 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
