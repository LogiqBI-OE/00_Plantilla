/** Endpoints de /api/levels/*. */
import { api } from './client';
import type { LevelsResponse, PermissionOverride } from './types';

export interface MatrixEntry {
  level: number;
  permission_code: string;
  allowed: boolean;
}

export const levelsApi = {
  list: () => api.get<LevelsResponse>('/api/levels/'),

  updateLevel: (level: number, data: Partial<{
    label: string;
    description: string;
    is_reserved: boolean;
  }>) => api.patch<LevelsResponse>(`/api/levels/${level}/`, data),

  setMatrix: (matrix: MatrixEntry[]) =>
    api.put<LevelsResponse>('/api/levels/matrix/', { matrix }),
};

export type { PermissionOverride };
