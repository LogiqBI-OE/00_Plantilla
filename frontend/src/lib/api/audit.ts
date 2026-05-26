/** Endpoint de /api/audit/. */
import { api } from './client';
import type { Paginated } from './types';

export interface AuditLog {
  id: number;
  tenant: number | null;
  tenant_slug: string | null;
  user: number | null;
  user_email: string | null;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuditFilters {
  action?: string;
  user?: number;
  from?: string;
  to?: string;
  page?: number;
}

export const auditApi = {
  list: (filters: AuditFilters = {}) =>
    api.get<Paginated<AuditLog>>('/api/audit/', {
      params: { ...filters },
    }),
};
