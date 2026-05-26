/** Endpoints de /api/system-config/*. */
import { api } from './client';

export interface SystemConfigItem {
  key: string;
  value: string;
  default: string;
  label: string;
  description: string;
  section: string;
  input_type: 'text' | 'password' | 'number' | 'boolean' | 'select';
  options: string[];
}

export const systemConfigApi = {
  list: () => api.get<{ items: SystemConfigItem[] }>('/api/system-config/'),

  patch: (items: Record<string, string>) =>
    api.patch<{ items: SystemConfigItem[] }>('/api/system-config/', { items }),

  runtime: () =>
    api.get<Record<string, string>>('/api/system-config/runtime/'),
};
