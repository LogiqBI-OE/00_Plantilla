/**
 * Tipos compartidos por los modulos de la API.
 *
 * Los tipos siguen el shape del backend (DRF serializers + responses
 * custom de las views).
 */

export interface Tenant {
  id: number;
  slug: string;
  name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  email: string;
  username: string | null;
  first_name: string;
  last_name_paterno: string;
  last_name_materno: string;
  full_name: string;
  level: number;
  preferred_language: 'es' | 'en';
  is_active: boolean;
  permissions: string[];
  tenant?: Tenant | null;
  overrides?: PermissionOverride[];
}

export interface PermissionOverride {
  permission_code: string;
  allowed: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
  tenant: Tenant | null;
}

export interface MeResponse {
  user: User;
  tenant: Tenant | null;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Level {
  level: number;
  label: string;
  description: string;
  is_reserved: boolean;
  permissions: PermissionOverride[];
}

export interface PermissionCatalogEntry {
  key: string;
  label_es: string;
  label_en: string;
  description: string;
}

export interface LevelsResponse {
  levels: Level[];
  permission_catalog: PermissionCatalogEntry[];
}

export interface BrandPaleta {
  fixed: Record<string, string>;
  light: Record<string, string>;
  dark: Record<string, string>;
}

export interface BrandPaletaMemoria {
  nombre: string;
  guardada_at: string;
  paleta: BrandPaleta;
}

export interface BrandSettings {
  marca: string;
  alcance: string;
  logo_login: string;
  logo_sidebar: string;
  logo_login_filename: string;
  logo_sidebar_filename: string;
  paleta_actual: BrandPaleta;
  paletas_memoria: BrandPaletaMemoria[];
  carrusel_fotos: string[];
  carrusel_segundos: number;
  updated_at?: string;
  tenant_slug?: string;
}

export interface BrandPublic extends Omit<BrandSettings, 'paletas_memoria' | 'logo_login_filename' | 'logo_sidebar_filename' | 'tenant_slug'> {
  requires_tenant_selector: boolean;
  tenant_slug: string | null;
}
