/** Endpoints de /api/brand/* y /api/global-brand/. */
import { api } from './client';
import type { BrandPaleta, BrandPublic, BrandSettings } from './types';

export const brandApi = {
  /** Sin auth — usado por la pantalla de Login antes de tener token. */
  getPublic: () => api.get<BrandPublic>('/api/brand/public/', { auth: false }),

  get: () => api.get<BrandSettings>('/api/brand/'),

  patch: (data: Partial<Pick<BrandSettings, 'marca' | 'alcance' | 'paleta_actual' | 'carrusel_segundos'>>) =>
    api.patch<BrandSettings>('/api/brand/', data),

  uploadLogo: (kind: 'login' | 'sidebar', data_url: string, filename: string) =>
    api.post<BrandSettings>('/api/brand/logos/', { kind, data_url, filename }),

  removeLogo: (kind: 'login' | 'sidebar') =>
    api.delete<void>(`/api/brand/logos/${kind}/`),

  addCarruselFoto: (data_url: string) =>
    api.post<BrandSettings>('/api/brand/carrusel/foto/', { data_url }),

  removeCarruselFoto: (idx: number) =>
    api.delete<void>(`/api/brand/carrusel/foto/${idx}/`),

  guardarPaletaMemoria: (nombre: string) =>
    api.post<BrandSettings>('/api/brand/paleta/memoria/', { nombre }),

  borrarPaletaMemoria: (idx: number) =>
    api.delete<void>(`/api/brand/paleta/memoria/${idx}/`),

  aplicarPaletaMemoria: (idx: number) =>
    api.post<BrandSettings>(`/api/brand/paleta/memoria/${idx}/aplicar/`),

  resetPaletaDefault: () =>
    api.post<BrandSettings>('/api/brand/paleta/default/'),
};

export const globalBrandApi = {
  get: () => api.get<BrandSettings>('/api/global-brand/'),
  patch: (data: Partial<BrandSettings>) =>
    api.patch<BrandSettings>('/api/global-brand/', data),
};

export type { BrandPaleta, BrandSettings, BrandPublic };
