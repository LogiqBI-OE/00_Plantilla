/**
 * TenantProvider — tenants accesibles + helper para cambiar.
 *
 * Wrapper alrededor de useAuth().switchTenant que ademas mantiene la lista
 * de tenants disponibles para el usuario (L9 = todos, L8 = sus asignados).
 * Util para alimentar el TenantSwitcher en el topbar.
 */
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { ApiError, tenantsApi } from './api';
import type { Tenant } from './api';
import { useAuth } from './auth';

interface TenantContextValue {
  /** Tenants a los que el usuario actual tiene acceso. */
  available: Tenant[];
  /** Tenant actual (mismo que useAuth().tenant). */
  current: Tenant | null;
  /** True si el usuario puede ver el switcher (L8/L9 con >=2 opciones o L9). */
  canSwitch: boolean;
  /** Refresca la lista (util tras crear/desactivar tenants). */
  reload: () => Promise<void>;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps): React.ReactElement {
  const { user, tenant } = useAuth();
  const [available, setAvailable] = useState<Tenant[]>([]);

  const reload = useCallback(async () => {
    if (!user) {
      setAvailable([]);
      return;
    }
    try {
      const res = await tenantsApi.list();
      setAvailable(res.results);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        // Sin permisos o sin sesion -> simplemente vacio.
        setAvailable([]);
      } else {
        throw err;
      }
    }
  }, [user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const canSwitch = !!user && (user.level === 9 || (user.level === 8 && available.length >= 2));

  return (
    <TenantContext.Provider value={{ available, current: tenant, canSwitch, reload }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error('useTenant debe usarse dentro de un <TenantProvider>.');
  }
  return ctx;
}
