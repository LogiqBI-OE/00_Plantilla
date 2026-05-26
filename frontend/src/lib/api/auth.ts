/** Endpoints de autenticacion. */
import { api } from './client';
import type { AuthResponse, MeResponse, Tenant } from './types';

export interface LoginParams {
  identifier: string;
  password: string;
  tenant_slug?: string;
}

export const authApi = {
  login: (params: LoginParams) =>
    api.post<AuthResponse>('/api/auth/login/', params, { auth: false }),

  refresh: (refresh: string) =>
    api.post<{ access: string; refresh?: string }>('/api/auth/refresh/', { refresh }, { auth: false }),

  me: () => api.get<MeResponse>('/api/auth/me/'),

  switchTenant: (tenant_slug: string) =>
    api.post<AuthResponse>('/api/auth/switch-tenant/', { tenant_slug }),

  tenantsForIdentifier: (identifier: string) =>
    api.get<{ tenants: Tenant[]; allow_platform: boolean }>(
      '/api/auth/tenants-for-identifier/',
      { params: { identifier }, auth: false },
    ),
};
