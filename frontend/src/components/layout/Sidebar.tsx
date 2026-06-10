/**
 * Sidebar — navegacion lateral unificada para todos los niveles.
 *
 * Estructura:
 *   - Header: logo + marca/alcance (segun brand activo).
 *   - VISTA DE TENANT: selector de tenant + items (disabled si no hay tenant).
 *     Incluye sub-headers internos (ej. "Configuracion") definidos en navConfig.
 *   - PLATAFORMA: solo visible para L8/L9. Tenants, agency-access, global-settings.
 *   - Footer: version + Powered by LogiQ BI.
 *
 * Los CSS vars del scope sidebar NO cambian con el tema dark/light.
 */
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { useAuth } from '@/lib/auth';
import { useBrand } from '@/lib/brand';
import { useRuntimeConfig } from '@/lib/runtimeConfig';

import {
  NAV_SECTION_PLATFORM,
  NAV_SECTION_TENANT_VIEW,
  filterSection,
  navLang,
  pickNav,
} from './navConfig';
import { SidebarItem } from './SidebarItem';
import { SidebarTenantSelector } from './SidebarTenantSelector';

interface SidebarProps {
  /** En movil: si el drawer esta abierto. En md+ el sidebar es siempre visible. */
  mobileOpen?: boolean;
  /** Cierra el drawer (movil). */
  onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps): React.ReactElement | null {
  const { i18n } = useTranslation();
  const { user, tenant } = useAuth();
  const { brand } = useBrand();
  const { multitenantEnabled } = useRuntimeConfig();
  const lang = navLang(i18n.language);
  const location = useLocation();

  // Cierra el drawer al navegar (solo afecta movil; en md+ onClose es no-op visual).
  useEffect(() => {
    onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (!user) return null;

  const hasTenant = !!tenant;
  const showPlatform = user.level >= 8;

  // Filtrar items por gate. En modo single (multi-tenant apagado) tambien
  // ocultamos los items que solo aplican a multi-tenant (Tenants, agencia).
  const passesMultitenant = (it: { requiresMultitenant?: boolean }) =>
    multitenantEnabled || !it.requiresMultitenant;
  const tenantSection = {
    ...filterSection(NAV_SECTION_TENANT_VIEW, user),
    items: filterSection(NAV_SECTION_TENANT_VIEW, user).items.filter(passesMultitenant),
  };
  const platformSection = {
    ...filterSection(NAV_SECTION_PLATFORM, user),
    items: filterSection(NAV_SECTION_PLATFORM, user).items.filter(passesMultitenant),
  };

  const logoSrc = brand?.logo_sidebar || '/brand/logiq/favicon-white.png';
  const marca = brand?.marca ?? 'LogiQ';
  const alcance = brand?.alcance ?? '';

  return (
    <>
      {/* Backdrop (solo movil, cuando el drawer esta abierto) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-auto h-screen w-60 shrink-0 flex flex-col transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--sidebar-bg)',
          color: 'var(--sidebar-text)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
      {/* Header */}
      <div
        className="px-4 py-4 flex items-center gap-2.5 border-b"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        <img
          src={logoSrc}
          alt={marca}
          className="w-10 h-10 object-contain shrink-0"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="min-w-0">
          <div className="font-semibold text-base truncate">{marca}</div>
          {alcance && (
            <div
              className="text-[10px] uppercase tracking-wider truncate"
              style={{ color: 'var(--sidebar-section-title)' }}
            >
              {alcance}
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {/* Vista de tenant */}
        <div className="space-y-1.5">
          <div
            className="px-3 text-[10px] uppercase tracking-wider font-semibold"
            style={{ color: 'var(--sidebar-section-title)' }}
          >
            {pickNav(tenantSection.title_es, tenantSection.title_en, tenantSection.title_ko, lang)}
          </div>

          {multitenantEnabled && (
            <div className="px-2 pt-1">
              <SidebarTenantSelector />
            </div>
          )}

          <div className="space-y-0.5 pt-2">
            {tenantSection.items.map((item, idx) => {
              const subHeader = pickNav(
                item.subHeader_es ?? '', item.subHeader_en ?? '', item.subHeader_ko ?? '', lang,
              );
              // En single mode no hay selector: los items NO se exigen tenant.
              const requiresTenant = multitenantEnabled && item.requiresTenant && !hasTenant;
              const label = pickNav(item.label_es, item.label_en, item.label_ko, lang);
              return (
                <div key={item.key}>
                  {subHeader && (
                    <div
                      className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider font-semibold"
                      style={{ color: 'var(--sidebar-section-title)' }}
                    >
                      {subHeader}
                    </div>
                  )}
                  <SidebarItem
                    item={item}
                    label={label}
                    disabled={requiresTenant}
                  />
                  {/* gap visual entre Inicio y la sub-seccion Configuracion */}
                  {idx === 0 && (
                    <div
                      className="my-2 mx-3 border-t"
                      style={{ borderColor: 'var(--sidebar-border)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Plataforma (solo L8/L9) */}
        {showPlatform && platformSection.items.length > 0 && (
          <div className="space-y-1.5">
            <div
              className="px-3 text-[10px] uppercase tracking-wider font-semibold"
              style={{ color: 'var(--sidebar-section-title)' }}
            >
              {pickNav(platformSection.title_es, platformSection.title_en, platformSection.title_ko, lang)}
            </div>
            <div className="space-y-0.5">
              {platformSection.items.map((item) => (
                <SidebarItem
                  key={item.key}
                  item={item}
                  label={pickNav(item.label_es, item.label_en, item.label_ko, lang)}
                />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div
        className="px-4 py-3 border-t text-[10px] space-y-0.5"
        style={{
          borderColor: 'var(--sidebar-border)',
          color: 'var(--sidebar-section-title)',
        }}
      >
        <div>v0.1.0</div>
        <div className="opacity-70">Powered by LogiQ BI</div>
      </div>
      </aside>
    </>
  );
}
