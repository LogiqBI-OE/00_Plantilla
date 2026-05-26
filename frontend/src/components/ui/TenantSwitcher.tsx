/**
 * TenantSwitcher — dropdown en el topbar para que L8/L9 cambien de tenant.
 *
 * Mostrado solo si useTenant().canSwitch es true. Al elegir un tenant
 * dispara useAuth().switchTenant que re-emite tokens y reloadea providers.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/lib/auth';
import { useTenant } from '@/lib/tenant';

export function TenantSwitcher(): React.ReactElement | null {
  const { t } = useTranslation();
  const { current, available, canSwitch } = useTenant();
  const { switchTenant, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!canSwitch) return null;

  const showPlatform = user?.level === 9;

  const handleSelect = async (tenant_slug: string): Promise<void> => {
    setBusy(true);
    try {
      await switchTenant(tenant_slug);
    } finally {
      setBusy(false);
      setOpen(false);
      // Refrescar para que los providers (Brand, etc.) re-fetcheen contra el nuevo tenant.
      window.location.reload();
    }
  };

  const label = current ? current.name : t('common.empty');

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        className="px-3 py-1.5 rounded-lg text-sm border border-border hover:bg-elevated transition disabled:opacity-50"
      >
        {label} <span className="opacity-50 text-xs">▾</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
          role="menu"
        >
          {showPlatform && (
            <button
              type="button"
              onClick={() => void handleSelect('')}
              className="w-full text-left px-3 py-2 text-sm hover:bg-elevated transition flex items-center justify-between"
              role="menuitem"
            >
              <span className="font-medium opacity-80">Plataforma (LogiQ)</span>
              {!current && <span className="text-accent text-xs">●</span>}
            </button>
          )}
          {available.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => void handleSelect(t.slug)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-elevated transition flex items-center justify-between"
              role="menuitem"
            >
              <span>
                <span className="font-medium">{t.name}</span>
                <span className="opacity-50 text-xs ml-1">/{t.slug}</span>
              </span>
              {current?.slug === t.slug && <span className="text-accent text-xs">●</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
