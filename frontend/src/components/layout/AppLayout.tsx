/**
 * AppLayout — layout unificado para todos los usuarios autenticados.
 *
 * Reemplaza a RootLayout y PlatformLayout (que estaban separados).
 * El sidebar adapta su contenido segun el nivel del user + si hay tenant
 * activo. Asi L9/L8 ven plataforma + vista de tenant en una sola pantalla.
 *
 * Auth gate:
 *   - Sin sesion -> /login.
 *   - L0-L7 sin tenant -> /login (probablemente token stale).
 *   - L8/L9 sin tenant -> OK, modo platform.
 *
 * BrandProvider scope dinamico: 'tenant' si hay tenant activo, 'platform' si no.
 */
import { Navigate, Outlet } from 'react-router-dom';

import { BrandProvider } from '@/lib/brand';
import { useAuth } from '@/lib/auth';
import { PageTitleProvider } from '@/lib/pageTitle';
import { TenantProvider } from '@/lib/tenant';

import { AppShell } from './AppShell';

export function AppLayout(): React.ReactElement {
  const { loading, user, tenant } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page text-text-primary">
        <span className="text-sm opacity-50">…</span>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  // L0-L7 deben tener tenant. Si lo perdieron, token stale -> re-login.
  if (user.level < 8 && !tenant) return <Navigate to="/login" replace />;

  const brandScope: 'tenant' | 'platform' = tenant ? 'tenant' : 'platform';

  return (
    <BrandProvider scope={brandScope}>
      <TenantProvider>
        <PageTitleProvider>
          <AppShell>
            <Outlet />
          </AppShell>
        </PageTitleProvider>
      </TenantProvider>
    </BrandProvider>
  );
}
