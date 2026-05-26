/**
 * App — router principal con rutas tenant-scope y platform-scope.
 *
 * Patrones:
 * - Cada page se carga lazy via React.lazy() para code-splitting.
 * - Layout routes: RootLayout (tenant) y PlatformLayout (consola L9/L8)
 *   envuelven sus rutas hijas con AppShell + providers correctos.
 * - Suspense fallback global con un placeholder mientras carga el chunk.
 * - Cualquier ruta nueva debe agregarse a PREFETCH_MAP en SidebarItem.tsx.
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { PlatformLayout, RootLayout } from '@/components/layout';

const Login = lazy(() => import('@/pages/Login'));
const Home = lazy(() => import('@/pages/Home'));
const UsuariosPage = lazy(() => import('@/pages/usuarios/UsuariosPage'));
const AuditoriaPage = lazy(() => import('@/pages/auditoria/AuditoriaPage'));
const ConfiguracionPage = lazy(() => import('@/pages/configuracion/ConfiguracionPage'));
const TenantsPage = lazy(() => import('@/pages/platform/TenantsPage'));
const AgencyAccessPage = lazy(() => import('@/pages/platform/AgencyAccessPage'));
const GlobalSettingsPage = lazy(() => import('@/pages/platform/GlobalSettingsPage'));

function PageFallback(): React.ReactElement {
  return (
    <div className="flex items-center justify-center py-12">
      <span className="text-sm opacity-50">…</span>
    </div>
  );
}

function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Tenant scope */}
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/auditoria" element={<AuditoriaPage />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />
          </Route>

          {/* Platform scope (L9/L8) */}
          <Route element={<PlatformLayout />}>
            <Route path="/platform" element={<Navigate to="/platform/tenants" replace />} />
            <Route path="/platform/tenants" element={<TenantsPage />} />
            <Route path="/platform/agency-access" element={<AgencyAccessPage />} />
            <Route path="/platform/global-settings" element={<GlobalSettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
