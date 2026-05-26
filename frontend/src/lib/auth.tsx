/**
 * AuthProvider — estado global de autenticacion.
 *
 * Responsabilidades:
 * - Inicializar la sesion al cargar la app (rehidrata desde localStorage si
 *   hay token y lo valida contra /api/auth/me).
 * - Exponer user + tenant actual + permisos efectivos.
 * - Login / logout / switchTenant.
 *
 * El token vive en localStorage (lib/api/client.ts); este provider solo
 * mantiene el state derivado en React. Si el token se pierde, expira o
 * el servidor lo rechaza (401), el provider hace logout silencioso.
 */
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  ApiError,
  authApi,
  clearTokens,
  getAccessToken,
  setTokens,
} from './api';
import type {
  AuthResponse,
  LoginParams,
  Tenant,
  User,
} from './api';

interface AuthContextValue {
  /** True mientras se intenta rehidratar la sesion al cargar la app. */
  loading: boolean;
  /** Usuario logueado o null si no hay sesion valida. */
  user: User | null;
  /** Tenant actual (null si L9 esta en modo platform). */
  tenant: Tenant | null;

  login: (params: LoginParams) => Promise<AuthResponse>;
  logout: () => void;
  switchTenant: (tenant_slug: string) => Promise<AuthResponse>;
  /** Verifica si el usuario tiene un permiso efectivo. */
  hasPermission: (code: string) => boolean;
  /** True si el nivel del usuario es >= min. */
  hasMinLevel: (min: number) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  // Rehidratar al montar
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void authApi
      .me()
      .then((res) => {
        if (cancelled) return;
        setUser(res.user);
        setTenant(res.tenant);
      })
      .catch((err: unknown) => {
        // Token invalido o expirado -> logout silencioso
        if (err instanceof ApiError && err.status === 401) {
          clearTokens();
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (params: LoginParams): Promise<AuthResponse> => {
    const res = await authApi.login(params);
    setTokens(res.access, res.refresh);
    setUser(res.user);
    setTenant(res.tenant);
    return res;
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setTenant(null);
  }, []);

  const switchTenant = useCallback(async (tenant_slug: string): Promise<AuthResponse> => {
    const res = await authApi.switchTenant(tenant_slug);
    setTokens(res.access, res.refresh);
    setUser(res.user);
    setTenant(res.tenant);
    return res;
  }, []);

  const hasPermission = useCallback(
    (code: string): boolean => {
      if (!user) return false;
      return user.permissions.includes(code);
    },
    [user],
  );

  const hasMinLevel = useCallback(
    (min: number): boolean => {
      if (!user) return false;
      return user.level >= min;
    },
    [user],
  );

  const value: AuthContextValue = {
    loading,
    user,
    tenant,
    login,
    logout,
    switchTenant,
    hasPermission,
    hasMinLevel,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook para acceder al contexto de auth desde cualquier componente hijo. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>.');
  }
  return ctx;
}
