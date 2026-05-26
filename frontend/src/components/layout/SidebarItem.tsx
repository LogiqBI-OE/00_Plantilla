/**
 * SidebarItem — link individual del sidebar con prefetch on hover.
 *
 * El prefetch dispara el import() del chunk de la page cuando el cursor
 * pasa encima del item. Cuando el usuario hace click, el chunk ya esta
 * en caché del browser y la transicion es instantanea.
 */
import { useCallback } from 'react';
import { NavLink } from 'react-router-dom';

import type { NavItem } from './navConfig';

/**
 * PREFETCH_MAP: ruta -> funcion que importa el chunk de esa page.
 * Agregar nuevas paginas aqui cuando se creen los archivos en src/pages/.
 */
const PREFETCH_MAP: Record<string, () => Promise<unknown>> = {
  '/': () => import('@/pages/Home'),
  '/usuarios': () => import('@/pages/usuarios/UsuariosPage'),
  '/auditoria': () => import('@/pages/auditoria/AuditoriaPage'),
  '/configuracion': () => import('@/pages/configuracion/ConfiguracionPage'),
  '/platform/tenants': () => import('@/pages/platform/TenantsPage'),
  '/platform/agency-access': () => import('@/pages/platform/AgencyAccessPage'),
  '/platform/global-settings': () => import('@/pages/platform/GlobalSettingsPage'),
};

interface SidebarItemProps {
  item: NavItem;
  label: string;
}

export function SidebarItem({ item, label }: SidebarItemProps): React.ReactElement {
  const prefetch = useCallback(() => {
    const importFn = PREFETCH_MAP[item.to];
    if (importFn) void importFn().catch(() => undefined);
  }, [item.to]);

  if (item.comingSoon) {
    return (
      <span
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm cursor-not-allowed"
        style={{ color: 'var(--sidebar-disabled-text)' }}
        title="Proximamente"
      >
        {item.icon && <span className="text-base shrink-0">{item.icon}</span>}
        <span className="truncate">{label}</span>
      </span>
    );
  }

  return (
    <NavLink
      to={item.to}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      end={item.to === '/'}
      className={({ isActive }) =>
        [
          'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition',
          isActive ? '' : 'hover:bg-white/5',
        ].join(' ')
      }
      style={({ isActive }) => ({
        color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
        background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
      })}
    >
      {item.icon && <span className="text-base shrink-0">{item.icon}</span>}
      <span className="truncate">{label}</span>
    </NavLink>
  );
}
