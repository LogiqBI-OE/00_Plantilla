/**
 * NAV_SECTIONS — configuracion centralizada del sidebar.
 *
 * Cada NavItem tiene un `gate`: predicado que recibe el user y decide
 * si se muestra. Asi la jerarquia L0-L9 + permisos custom controla la
 * visibilidad de cada item sin if/else regados en componentes.
 */
import type { User } from '@/lib/api';

export interface NavItem {
  key: string;
  label_es: string;
  label_en: string;
  to: string;
  icon?: string;
  comingSoon?: boolean;
  /** Funcion que recibe user y devuelve true si se debe mostrar. */
  gate?: (user: User) => boolean;
}

export interface NavSection {
  key: string;
  title_es: string;
  title_en: string;
  items: NavItem[];
}

/** Predicado helper: tener un permiso dado. */
const hasPerm = (code: string) => (user: User) => user.permissions.includes(code);
/** Predicado helper: nivel minimo. */
const minLevel = (n: number) => (user: User) => user.level >= n;

// --- Tenant scope (RootLayout) ------------------------------------------------

export const NAV_SECTIONS_TENANT: NavSection[] = [
  {
    key: 'principal',
    title_es: 'Principal',
    title_en: 'Main',
    items: [
      { key: 'inicio', label_es: 'Inicio', label_en: 'Home', to: '/', icon: '🏠' },
    ],
  },
  {
    key: 'administracion',
    title_es: 'Administracion',
    title_en: 'Administration',
    items: [
      {
        key: 'usuarios',
        label_es: 'Usuarios',
        label_en: 'Users',
        to: '/usuarios',
        icon: '👥',
        gate: hasPerm('view_users'),
      },
      {
        key: 'auditoria',
        label_es: 'Auditoria',
        label_en: 'Audit',
        to: '/auditoria',
        icon: '📋',
        gate: hasPerm('view_audit'),
      },
      {
        key: 'configuracion',
        label_es: 'Configuracion',
        label_en: 'Settings',
        to: '/configuracion',
        icon: '⚙️',
        gate: minLevel(7),
      },
    ],
  },
];

// --- Platform scope (PlatformLayout - L9/L8 consola LogiQ) -------------------

export const NAV_SECTIONS_PLATFORM: NavSection[] = [
  {
    key: 'plataforma',
    title_es: 'Plataforma',
    title_en: 'Platform',
    items: [
      {
        key: 'tenants',
        label_es: 'Tenants',
        label_en: 'Tenants',
        to: '/platform/tenants',
        icon: '🏢',
        gate: minLevel(8),
      },
      {
        key: 'agency-access',
        label_es: 'Accesos de agencia',
        label_en: 'Agency access',
        to: '/platform/agency-access',
        icon: '🔑',
        gate: minLevel(9),
      },
      {
        key: 'global-settings',
        label_es: 'Configuracion global',
        label_en: 'Global settings',
        to: '/platform/global-settings',
        icon: '⚙️',
        gate: minLevel(9),
      },
    ],
  },
];

/** Filtra secciones segun el user, removiendo items sin gate aprobado y secciones vacias. */
export function filterNavForUser(
  sections: NavSection[],
  user: User,
): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((it) => !it.gate || it.gate(user)),
    }))
    .filter((section) => section.items.length > 0);
}
