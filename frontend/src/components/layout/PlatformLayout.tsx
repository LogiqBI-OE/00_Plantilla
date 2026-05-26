/**
 * PlatformLayout — layout para consola L9/L8 (modo platform sin tenant).
 *
 * Auth gate: requiere user.level >= 8.
 * BrandProvider scope='platform' (siempre identidad LogiQ).
 * TenantProvider para que el TenantSwitcher pueda saltar a un tenant.
 */
import { Navigate, Outlet } from 'react-router-dom';

import { BrandProvider } from '@/lib/brand';
import { useAuth } from '@/lib/auth';
import { PageTitleProvider } from '@/lib/pageTitle';
import { TenantProvider } from '@/lib/tenant';

import { AppShell } from './AppShell';

export function PlatformLayout(): React.ReactElement {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page text-text-primary">
        <span className="text-sm opacity-50">…</span>
      </div>
    );
  }
  if (!user || user.level < 8) return <Navigate to="/login" replace />;

  return (
    <BrandProvider scope="platform">
      <TenantProvider>
        <PageTitleProvider>
          <AppShell variant="platform">
            <Outlet />
          </AppShell>
        </PageTitleProvider>
      </TenantProvider>
    </BrandProvider>
  );
}
