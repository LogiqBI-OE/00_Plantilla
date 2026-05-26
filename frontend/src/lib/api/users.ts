/** Endpoints de /api/users/*. */
import { api } from './client';
import type { Paginated, PermissionOverride, User } from './types';

export interface UserCreatePayload {
  email: string;
  username?: string | null;
  password: string;
  first_name: string;
  last_name_paterno: string;
  last_name_materno?: string;
  level: number;
  preferred_language?: 'es' | 'en';
}

export type UserUpdatePayload = Partial<{
  username: string | null;
  first_name: string;
  last_name_paterno: string;
  last_name_materno: string;
  level: number;
  preferred_language: 'es' | 'en';
  is_active: boolean;
}>;

export const usersApi = {
  list: (page?: number) =>
    api.get<Paginated<User>>('/api/users/', { params: { page } }),

  retrieve: (id: number) => api.get<User>(`/api/users/${id}/`),

  create: (payload: UserCreatePayload) => api.post<User>('/api/users/', payload),

  update: (id: number, payload: UserUpdatePayload) =>
    api.patch<User>(`/api/users/${id}/`, payload),

  remove: (id: number) => api.delete<void>(`/api/users/${id}/`),

  resetPassword: (id: number) =>
    api.post<{ detail: string; standard_password: string }>(
      `/api/users/${id}/reset-password/`,
    ),

  setPermissions: (id: number, overrides: PermissionOverride[]) =>
    api.post<User>(`/api/users/${id}/permissions/`, { overrides }),
};
