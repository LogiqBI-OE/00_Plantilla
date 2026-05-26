/** Endpoints de /api/tenants/*. */
import { api } from './client';
import type { Paginated, Tenant } from './types';

export interface AgencyTenantAccess {
  id: number;
  user: number;
  user_email: string;
  user_full_name: string;
  granted_by: number | null;
  granted_by_email: string | null;
  granted_at: string;
}

export const tenantsApi = {
  list: () => api.get<Paginated<Tenant>>('/api/tenants/'),
  retrieve: (id: number) => api.get<Tenant>(`/api/tenants/${id}/`),
  create: (data: Partial<Tenant> & { slug: string; name: string }) =>
    api.post<Tenant>('/api/tenants/', data),
  update: (id: number, data: Partial<Tenant>) =>
    api.patch<Tenant>(`/api/tenants/${id}/`, data),
  remove: (id: number) => api.delete<void>(`/api/tenants/${id}/`),

  agencyAccess: (id: number) =>
    api.get<AgencyTenantAccess[]>(`/api/tenants/${id}/agency-access/`),
  grantAgency: (id: number, user_id: number) =>
    api.post<AgencyTenantAccess>(`/api/tenants/${id}/grant-agency/`, { user_id }),
  revokeAgency: (id: number, user_id: number) =>
    api.post<void>(`/api/tenants/${id}/revoke-agency/`, { user_id }),
};
