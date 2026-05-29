/**
 * UserMenu — dropdown del usuario en el topbar.
 *
 * Muestra avatar circular + nombre arriba y rol (label del nivel) debajo,
 * con chevron. El label del nivel se trae de /api/levels/ (cualquier
 * usuario autenticado puede leerlo). Click abre dropdown con: nivel,
 * tenant, permisos, logout.
 */
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { levelsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';

import { Avatar } from './Avatar';

export function UserMenu(): React.ReactElement | null {
  const { t } = useTranslation();
  const { user, tenant, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [roleLabel, setRoleLabel] = useState<string | null>(null);
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

  useEffect(() => {
    if (!user) return;
    let alive = true;
    void levelsApi.list().then((res) => {
      if (!alive) return;
      const match = res.levels.find((l) => l.level === user.level);
      setRoleLabel(match?.label ?? `L${user.level}`);
    });
    return () => {
      alive = false;
    };
  }, [user]);

  if (!user) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-elevated transition"
      >
        <Avatar name={user.full_name} size="md" />
        <span className="hidden md:flex flex-col items-start leading-tight">
          <span className="text-sm font-medium">{user.first_name}</span>
          <span className="text-xs opacity-60">{roleLabel ?? `L${user.level}`}</span>
        </span>
        <ChevronDown size={16} strokeWidth={1.5} className="opacity-50" />
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
              {roleLabel ? ` · ${roleLabel}` : ''}
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
