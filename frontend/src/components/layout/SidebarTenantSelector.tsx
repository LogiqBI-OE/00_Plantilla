/**
 * SidebarTenantSelector — dropdown inline en el sidebar para elegir tenant.
 *
 * Reemplaza al TenantSwitcher del topbar. Permite a L8/L9 cambiar entre:
 *   - "Sin tenant" (modo platform — solo L9)
 *   - Cualquier tenant accesible
 *
 * Al cambiar, hace switchTenant en backend, recarga la pagina para que
 * todos los providers re-fetcheen.
 *
 * Para L0-L7 muestra el tenant actual como label estatico (no pueden cambiar).
 */
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { TENANT_TYPE_LABEL } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useTenant } from '@/lib/tenant';

export function SidebarTenantSelector(): React.ReactElement {
  const { user, switchTenant } = useAuth();
  const { available, current } = useTenant();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const canSwitch = !!user && user.level >= 8;
  const showPlatformOption = user?.level === 9;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const handleSelect = async (slug: string | null): Promise<void> => {
    setBusy(true);
    setOpen(false);
    try {
      if (slug === null) {
        // Re-loguear como L9 sin tenant — necesitamos un endpoint para esto.
        // Por ahora, recargamos a /login (workaround simple).
        window.location.href = '/login';
        return;
      }
      await switchTenant(slug);
    } finally {
      setBusy(false);
      window.location.reload();
    }
  };

  const label = current?.name ?? '— Sin tenant —';

  // L0-L7: solo muestra label estatico sin dropdown.
  if (!canSwitch) {
    return (
      <div
        className="flex items-center px-3 py-2 rounded-lg text-sm"
        style={{
          background: 'rgba(255,255,255,0.05)',
          color: 'var(--sidebar-text)',
        }}
      >
        <span className="truncate flex-1">{label}</span>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition disabled:opacity-50"
        style={{
          background: 'rgba(255,255,255,0.06)',
          color: 'var(--sidebar-text)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span className="truncate">{label}</span>
        <ChevronDown size={14} strokeWidth={1.5} className="shrink-0 opacity-60" />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 mt-1 rounded-xl shadow-2xl z-50 overflow-hidden"
          style={{
            background: 'var(--sidebar-bg)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          role="menu"
        >
          {showPlatformOption && (
            <button
              type="button"
              onClick={() => void handleSelect(null)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition flex items-center justify-between"
              style={{ color: 'var(--sidebar-text)' }}
              role="menuitem"
            >
              <span className="italic opacity-70">— Sin tenant —</span>
              {!current && (
                <span style={{ color: 'var(--sidebar-active-text)' }}>●</span>
              )}
            </button>
          )}
          {available.length === 0 ? (
            <div
              className="px-3 py-2 text-xs italic"
              style={{ color: 'var(--sidebar-section-title)' }}
            >
              Sin tenants disponibles
            </div>
          ) : (
            available.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => void handleSelect(t.slug)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition flex items-center justify-between"
                style={{ color: 'var(--sidebar-text)' }}
                role="menuitem"
              >
                <span className="truncate">
                  <span>{t.name}</span>
                  <span
                    className="text-xs ml-1.5"
                    style={{ color: 'var(--sidebar-section-title)' }}
                  >
                    {TENANT_TYPE_LABEL[t.type]}
                  </span>
                </span>
                {current?.slug === t.slug && (
                  <span style={{ color: 'var(--sidebar-active-text)' }}>●</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
