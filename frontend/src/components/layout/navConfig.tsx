/**
 * NAV_SECTIONS — configuracion centralizada del sidebar.
 *
 * Cada NavItem tiene un `gate`: predicado que recibe el user y decide
 * si se muestra. Asi la jerarquia L0-L9 + permisos custom controla la
 * visibilidad de cada item sin if/else regados en componentes.
 *
 * Los iconos vienen de lucide-react (estilo outline, wireframe-style).
 */
import {
  Building2,
  History,
  Home,
  Key,
  type LucideIcon,
  Settings,
  SlidersHorizontal,
  Users,
} from 'lucide-react';

import type { User } from '@/lib/api';

export interface NavItem {
  key: string;
  label_es: string;
  label_en: string;
  label_ko: string;
  to: string;
  icon?: LucideIcon;
  /** Si se setea, este item arranca una sub-seccion con este header. */
  subHeader_es?: string;
  subHeader_en?: string;
  subHeader_ko?: string;
  comingSoon?: boolean;
  /** Funcion que recibe user y devuelve true si se debe mostrar. */
  gate?: (user: User) => boolean;
  /** Solo accesible cuando hay tenant activo. Si no, se renderiza disabled. */
  requiresTenant?: boolean;
  /** Solo visible cuando el modo multi-tenant esta activo. */
  requiresMultitenant?: boolean;
}

export interface NavSection {
  key: string;
  title_es: string;
  title_en: string;
  title_ko: string;
  items: NavItem[];
}

/** Idiomas soportados por los labels de navegacion. */
export type NavLang = 'es' | 'en' | 'ko';

/** Normaliza un codigo i18next (ej. "ko-KR") al idioma de nav soportado. */
export function navLang(code: string): NavLang {
  const base = code.split('-')[0];
  return base === 'en' ? 'en' : base === 'ko' ? 'ko' : 'es';
}

/** Elige el texto segun idioma (es por defecto). */
export function pickNav(es: string, en: string, ko: string, lang: NavLang): string {
  return lang === 'ko' ? ko : lang === 'en' ? en : es;
}

/** Predicado helper: tener un permiso dado. */
const hasPerm = (code: string) => (user: User) => user.permissions.includes(code);
/** Predicado helper: nivel minimo. */
const minLevel = (n: number) => (user: User) => user.level >= n;

// --- Vista de tenant (siempre visible; items requieren tenant activo) ---------

export const NAV_SECTION_TENANT_VIEW: NavSection = {
  key: 'tenant-view',
  title_es: 'Vista de tenant',
  title_en: 'Tenant view',
  title_ko: '테넌트 보기',
  items: [
    {
      key: 'inicio',
      label_es: 'Inicio',
      label_en: 'Home',
      label_ko: '홈',
      to: '/',
      icon: Home,
      requiresTenant: true,
    },
    {
      key: 'usuarios',
      label_es: 'Usuarios',
      label_en: 'Users',
      label_ko: '사용자',
      to: '/usuarios',
      icon: Users,
      subHeader_es: 'Configuracion',
      subHeader_en: 'Configuration',
      subHeader_ko: '설정',
      gate: hasPerm('view_users'),
      requiresTenant: true,
    },
    {
      key: 'auditoria',
      label_es: 'Auditoria',
      label_en: 'Audit',
      label_ko: '감사 로그',
      to: '/auditoria',
      icon: History,
      gate: hasPerm('view_audit'),
      requiresTenant: true,
    },
    {
      key: 'configuracion',
      label_es: 'Brand',
      label_en: 'Brand',
      label_ko: '브랜드',
      to: '/configuracion',
      icon: Settings,
      gate: minLevel(7),
      requiresTenant: true,
    },
  ],
};

// --- Plataforma (solo L8/L9, no requiere tenant activo) ----------------------

export const NAV_SECTION_PLATFORM: NavSection = {
  key: 'plataforma',
  title_es: 'Plataforma',
  title_en: 'Platform',
  title_ko: '플랫폼',
  items: [
    {
      key: 'tenants',
      label_es: 'Tenants',
      label_en: 'Tenants',
      label_ko: '테넌트',
      to: '/platform/tenants',
      icon: Building2,
      gate: minLevel(8),
      requiresMultitenant: true,
    },
    {
      key: 'agency-access',
      label_es: 'Accesos de agencia',
      label_en: 'Agency access',
      label_ko: '대행사 접근',
      to: '/platform/agency-access',
      icon: Key,
      gate: minLevel(9),
      requiresMultitenant: true,
    },
    {
      key: 'global-settings',
      label_es: 'Configuracion global',
      label_en: 'Global settings',
      label_ko: '전역 설정',
      to: '/platform/global-settings',
      icon: SlidersHorizontal,
      gate: minLevel(9),
    },
  ],
};

/** Filtra una seccion segun el user, removiendo items sin gate aprobado. */
export function filterSection(section: NavSection, user: User): NavSection {
  return {
    ...section,
    items: section.items.filter((it) => !it.gate || it.gate(user)),
  };
}
