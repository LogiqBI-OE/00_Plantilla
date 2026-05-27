/**
 * SidebarItem — link individual del sidebar con prefetch on hover.
 *
 * El prefetch dispara el import() del chunk de la page cuando el cursor
 * pasa encima del item. Cuando el usuario hace click, el chunk ya esta
 * en cache del browser y la transicion es instantanea.
 *
 * Soporta estado disabled (gris, no clickeable) para items que requieren
 * un tenant activo cuando no lo hay.
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
  disabled?: boolean;
}

export function SidebarItem({ item, label, disabled }: SidebarItemProps): React.ReactElement {
  const prefetch = useCallback(() => {
    if (disabled) return;
    const importFn = PREFETCH_MAP[item.to];
    if (importFn) void importFn().catch(() => undefined);
  }, [item.to, disabled]);

  const Icon = item.icon;
  const iconNode = Icon ? <Icon size={16} strokeWidth={1.5} className="shrink-0" /> : null;

  if (item.comingSoon || disabled) {
    return (
      <span
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm cursor-not-allowed"
        style={{ color: 'var(--sidebar-disabled-text)' }}
        title={disabled ? 'Selecciona un tenant primero' : 'Proximamente'}
      >
        {iconNode}
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
      {iconNode}
      <span className="truncate">{label}</span>
    </NavLink>
  );
}
