/**
 * RootLayout — layout protegido para rutas tenant-scope.
 *
 * Auth gate: si no hay sesion -> redirige a /login. Si hay sesion pero el
 * user es L0-L7 sin tenant valido -> tambien al login.
 *
 * Anida los providers que SI dependen de tenant (Brand scope='tenant',
 * Tenant context).
 */
import { Navigate, Outlet } from 'react-router-dom';

import { BrandProvider } from '@/lib/brand';
import { useAuth } from '@/lib/auth';
import { PageTitleProvider } from '@/lib/pageTitle';
import { TenantProvider } from '@/lib/tenant';

import { AppShell } from './AppShell';

export function RootLayout(): React.ReactElement {
  const { loading, user, tenant } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page text-text-primary">
        <span className="text-sm opacity-50">…</span>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  // L0-L7 sin tenant valido -> al login (probablemente token stale)
  if (user.level < 8 && !tenant) return <Navigate to="/login" replace />;
  // L9/L8 sin tenant -> deberian estar en /platform/* no aqui
  if (!tenant) return <Navigate to="/platform" replace />;

  return (
    <BrandProvider scope="tenant">
      <TenantProvider>
        <PageTitleProvider>
          <AppShell variant="tenant">
            <Outlet />
          </AppShell>
        </PageTitleProvider>
      </TenantProvider>
    </BrandProvider>
  );
}
