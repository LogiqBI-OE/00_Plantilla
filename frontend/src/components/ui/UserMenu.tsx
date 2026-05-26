/**
 * UserMenu — dropdown del usuario en el topbar.
 *
 * Muestra avatar + nombre + dropdown con: nivel, tenant, logout.
 */
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/lib/auth';

import { Avatar } from './Avatar';

export function UserMenu(): React.ReactElement | null {
  const { t } = useTranslation();
  const { user, tenant, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

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

  if (!user) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-elevated transition"
      >
        <Avatar name={user.full_name} size="sm" />
        <span className="text-sm font-medium hidden md:block">{user.first_name}</span>
        <span className="opacity-50 text-xs">▾</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1 w-64 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
          role="menu"
        >
          <div className="px-4 py-3 border-b border-border">
            <div className="font-medium text-sm">{user.full_name}</div>
            <div className="text-xs opacity-60 truncate">{user.email}</div>
          </div>
          <div className="px-4 py-2 border-b border-border text-xs space-y-0.5">
            <div>
              <span className="opacity-50">Nivel:</span> L{user.level}
            </div>
            <div>
              <span className="opacity-50">Tenant:</span>{' '}
              {tenant ? tenant.name : <span className="italic opacity-60">platform</span>}
            </div>
            <div>
              <span className="opacity-50">Permisos:</span> {user.permissions.length}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 transition"
            role="menuitem"
          >
            {t('auth.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
