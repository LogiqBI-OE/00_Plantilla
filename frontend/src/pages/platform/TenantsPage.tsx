/** TenantsPage — lista + crear/editar tenants (L9 desde platform). */
import { type FormEvent, useCallback, useEffect, useState } from 'react';

import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  IconButton,
  SkeletonTable,
  TextField,
} from '@/components/ui';
import { ApiError, tenantsApi } from '@/lib/api';
import type { Paginated, Tenant } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { usePageTitle } from '@/lib/pageTitle';

export default function TenantsPage(): React.ReactElement {
  const { user } = useAuth();
  usePageTitle('Tenants');

  const [data, setData] = useState<Paginated<Tenant> | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tenantsApi.list();
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const isL9 = (user?.level ?? 0) >= 9;
  const tenants = data?.results ?? [];

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <p className="text-sm opacity-60">{loading ? '—' : `${data?.count ?? 0} tenants`}</p>
        {isL9 && <Button onClick={() => setCreating(true)}>+ Nuevo tenant</Button>}
      </div>

      {loading ? (
        <SkeletonTable rows={4} cols={4} />
      ) : tenants.length === 0 ? (
        <EmptyState icon="🏢" title="Sin tenants" />
      ) : (
        <Card padding="none">
          <table className="w-full text-sm">
            <thead className="bg-elevated text-xs uppercase tracking-wider opacity-70">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Nombre</th>
                <th className="text-left px-4 py-2.5 font-medium">Slug</th>
                <th className="text-left px-4 py-2.5 font-medium">Estado</th>
                <th className="text-right px-4 py-2.5 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tn) => (
                <tr key={tn.id} className="border-t border-border hover:bg-elevated/50">
                  <td className="px-4 py-2.5 font-medium">{tn.name}</td>
                  <td className="px-4 py-2.5 opacity-80 font-mono text-xs">{tn.slug}</td>
                  <td className="px-4 py-2.5">
                    {tn.is_active ? (
                      <Badge tone="success">Activo</Badge>
                    ) : (
                      <Badge tone="danger">Inactivo</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {isL9 && (
                      <IconButton size="sm" onClick={() => setEditing(tn)} title="Editar">
                        ✏️
                      </IconButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {(creating || editing) && (
        <TenantFormDrawer
          tenant={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            void reload();
          }}
        />
      )}
    </div>
  );
}

interface TenantFormDrawerProps {
  tenant?: Tenant;
  onClose: () => void;
  onSaved: () => void;
}

function TenantFormDrawer({ tenant, onClose, onSaved }: TenantFormDrawerProps): React.ReactElement {
  const [name, setName] = useState(tenant?.name ?? '');
  const [slug, setSlug] = useState(tenant?.slug ?? '');
  const [isActive, setIsActive] = useState(tenant?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (tenant) {
        await tenantsApi.update(tenant.id, { name, slug, is_active: isActive });
      } else {
        await tenantsApi.create({ name, slug, is_active: isActive });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.toUserMessage() : 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open
      onClose={onClose}
      title={tenant ? `Editar: ${tenant.name}` : 'Nuevo tenant'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            Guardar
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
        <TextField
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
          required
          hint="URL-friendly: a-z, 0-9, guiones."
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Activo
        </label>
        {error && <div className="px-3 py-2 rounded-lg bg-danger/15 text-danger text-xs">{error}</div>}
      </form>
    </Drawer>
  );
}
