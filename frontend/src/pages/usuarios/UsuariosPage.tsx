/**
 * UsuariosPage — tabla + drawer CRUD jerarquico.
 *
 * Backend enforce la jerarquia (level <= self.level para crear, <
 * para editar/borrar) — el frontend hace lo mismo via guards en UI
 * para mejor UX.
 */
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  IconButton,
  SkeletonTable,
} from '@/components/ui';
import { usersApi } from '@/lib/api';
import type { Paginated, User } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { usePageTitle } from '@/lib/pageTitle';

import { UsuarioFormDrawer } from './sections/UsuarioFormDrawer';

export default function UsuariosPage(): React.ReactElement {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  usePageTitle('Usuarios');

  const [data, setData] = useState<Paginated<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersApi.list();
      setData(res);
    } catch (e) {
      setError(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (!me) return <></>;

  const canCreate = me.level >= 5;
  const users = data?.results ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-60">
            {loading ? '—' : `${data?.count ?? 0} ${t('common.loading') === 'Cargando' ? 'usuarios' : 'users'}`}
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setCreating(true)}>+ {t('common.create')}</Button>
        )}
      </div>

      {loading ? (
        <SkeletonTable rows={6} cols={5} />
      ) : error ? (
        <EmptyState icon="⚠️" title={t('errors.generic')} description={error} />
      ) : users.length === 0 ? (
        <EmptyState
          icon="👥"
          title={t('common.empty')}
          description="No hay usuarios en este tenant."
        />
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-elevated text-xs uppercase tracking-wider opacity-70">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Nombre</th>
                <th className="text-left px-4 py-2.5 font-medium">Email</th>
                <th className="text-left px-4 py-2.5 font-medium">Nivel</th>
                <th className="text-left px-4 py-2.5 font-medium">Estado</th>
                <th className="text-right px-4 py-2.5 font-medium">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const canEdit = u.id === me.id || u.level < me.level;
                return (
                  <tr key={u.id} className="border-t border-border hover:bg-elevated/50">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.full_name} size="sm" />
                        <span className="font-medium">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 opacity-80">{u.email}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone="neutral">L{u.level}</Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      {u.is_active ? (
                        <Badge tone="success">Activo</Badge>
                      ) : (
                        <Badge tone="danger">Inactivo</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1">
                        <IconButton
                          size="sm"
                          variant="ghost"
                          disabled={!canEdit}
                          onClick={() => setEditing(u)}
                          title={t('common.edit')}
                        >
                          ✏️
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <UsuarioFormDrawer
          mode="create"
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            void reload();
          }}
        />
      )}
      {editing && (
        <UsuarioFormDrawer
          mode="edit"
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void reload();
          }}
        />
      )}
    </div>
  );
}
