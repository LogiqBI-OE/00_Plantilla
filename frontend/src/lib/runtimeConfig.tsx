/**
 * RuntimeConfigProvider — config runtime de la instancia (subset publico).
 *
 * Lee /api/system-config/runtime/ una vez al montar y la expone tipada.
 * Lo consumen el Sidebar y los guards de ruta para decidir, por ejemplo, si
 * el modo multi-tenant esta activo.
 *
 * Se monta dentro de AppLayout (sesion ya resuelta). `reload()` permite
 * refrescar tras cambiar un flag desde la UI (ej. el toggle de multi-tenant).
 */
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Navigate } from 'react-router-dom';

import { systemConfigApi } from './api';

interface RuntimeConfigValue {
  /** True mientras se hace el primer fetch. */
  loading: boolean;
  /** Modo multi-tenant activo (flag multitenant_enabled). */
  multitenantEnabled: boolean;
  /** Vuelve a leer el runtime config del backend. */
  reload: () => Promise<void>;
}

const RuntimeConfigContext = createContext<RuntimeConfigValue | undefined>(undefined);

export function RuntimeConfigProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [multitenantEnabled, setMultitenantEnabled] = useState(false);

  const reload = useCallback(async () => {
    try {
      const res = await systemConfigApi.runtime();
      setMultitenantEnabled(res.multitenant_enabled === 'true');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <RuntimeConfigContext.Provider value={{ loading, multitenantEnabled, reload }}>
      {children}
    </RuntimeConfigContext.Provider>
  );
}

export function useRuntimeConfig(): RuntimeConfigValue {
  const ctx = useContext(RuntimeConfigContext);
  if (!ctx) {
    throw new Error('useRuntimeConfig debe usarse dentro de un <RuntimeConfigProvider>.');
  }
  return ctx;
}

/**
 * Guard de ruta: bloquea paginas que solo aplican en modo multi-tenant.
 * Si el modo esta apagado, redirige al inicio.
 */
export function RequireMultitenant({ children }: { children: ReactNode }): React.ReactElement {
  const { loading, multitenantEnabled } = useRuntimeConfig();
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-sm opacity-50">…</span>
      </div>
    );
  }
  if (!multitenantEnabled) return <Navigate to="/" replace />;
  return <>{children}</>;
}
