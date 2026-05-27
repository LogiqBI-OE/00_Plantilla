/**
 * App — router principal.
 *
 * Layout unico `AppLayout` envuelve TODAS las rutas autenticadas. El
 * sidebar adapta su contenido segun el nivel del user (L8/L9 ven seccion
 * Plataforma; todos ven Vista de Tenant con items habilitados solo
 * cuando hay tenant activo).
 *
 * Pages cargadas via React.lazy + Suspense para code-splitting.
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/components/layout';

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

          <Route element={<AppLayout />}>
            {/* Vista de tenant */}
            <Route path="/" element={<Home />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/auditoria" element={<AuditoriaPage />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />

            {/* Plataforma (L8/L9) */}
            <Route
              path="/platform"
              element={<Navigate to="/platform/tenants" replace />}
            />
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
