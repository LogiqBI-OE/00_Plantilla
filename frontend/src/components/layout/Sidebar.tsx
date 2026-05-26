/**
 * Sidebar — navegacion lateral fija.
 *
 * Aplica los CSS vars del scope sidebar (no cambian con tema dark/light).
 * Renderiza secciones filtradas por el nivel y permisos del usuario.
 */
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/lib/auth';
import { useBrand } from '@/lib/brand';

import { filterNavForUser, type NavSection } from './navConfig';
import { SidebarItem } from './SidebarItem';

interface SidebarProps {
  sections: NavSection[];
  variant?: 'tenant' | 'platform';
}

export function Sidebar({ sections, variant = 'tenant' }: SidebarProps): React.ReactElement | null {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const { brand } = useBrand();
  const lang = i18n.language.startsWith('en') ? 'en' : 'es';

  if (!user) return null;
  const visibleSections = filterNavForUser(sections, user);

  const logoSrc = brand?.logo_sidebar || '/brand/logiq/logo-white.png';
  const marca = brand?.marca ?? (variant === 'platform' ? 'LogiQ' : 'App');

  return (
    <aside
      className="w-60 shrink-0 flex flex-col h-screen sticky top-0"
      style={{
        background: 'var(--sidebar-bg)',
        color: 'var(--sidebar-text)',
        borderRight: '1px solid var(--sidebar-border)',
      }}
    >
      <div className="px-4 py-4 flex items-center gap-2.5 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <img
          src={logoSrc}
          alt={marca}
          className="w-8 h-8 object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate">{marca}</div>
          {variant === 'platform' && (
            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--sidebar-section-title)' }}>
              Plataforma
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {visibleSections.map((section) => (
          <div key={section.key}>
            <div
              className="px-3 py-1 text-[10px] uppercase tracking-wider font-semibold"
              style={{ color: 'var(--sidebar-section-title)' }}
            >
              {lang === 'es' ? section.title_es : section.title_en}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarItem
                  key={item.key}
                  item={item}
                  label={lang === 'es' ? item.label_es : item.label_en}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div
        className="px-4 py-2 text-[10px] border-t"
        style={{ borderColor: 'var(--sidebar-border)', color: 'var(--sidebar-section-title)' }}
      >
        v0.1.0
      </div>
    </aside>
  );
}
