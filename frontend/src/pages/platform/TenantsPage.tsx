/** TenantsPage — lista + crear/editar tenants (L9 desde platform). */
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { Building2, Pencil, Plus } from 'lucide-react';

import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  IconButton,
  SectionHeader,
  SkeletonTable,
  TextField,
} from '@/components/ui';
import { ApiError, tenantsApi, TENANT_TYPE_LABEL } from '@/lib/api';
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
  const th =
    'px-4 py-3 text-[11px] uppercase tracking-wider font-semibold opacity-80 bg-table-header border-b border-border';

  return (
    <div className="space-y-5">
      {/* Header de pagina */}
      <div>
        <h2 className="text-2xl font-bold">Tenants</h2>
        <p className="text-sm opacity-60 mt-1">
          Organizaciones de la plataforma. Solo nivel 9 puede crear o editar.
        </p>
      </div>

      {/* Canvas unico */}
      <Card>
        <div className="space-y-5">
          <SectionHeader
            title={loading ? 'Tenants' : `${data?.count ?? 0} tenants`}
            description="Cada tenant es un espacio de trabajo aislado (cliente, agencia o sistema)."
            actions={
              isL9 ? (
                <Button onClick={() => setCreating(true)}>
                  <Plus size={16} strokeWidth={1.5} className="-ml-0.5" />
                  Nuevo tenant
                </Button>
              ) : undefined
            }
          />

          {loading ? (
            <SkeletonTable rows={4} cols={5} />
          ) : tenants.length === 0 ? (
            <EmptyState
              icon={<Building2 strokeWidth={1.5} size={36} />}
              title="Sin tenants"
              description="Crea el primer tenant para comenzar."
            />
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr>
                      <th className={`text-left ${th}`}>Nombre</th>
                      <th className={`text-left ${th}`}>Slug</th>
                      <th className={`text-left ${th}`}>Tipo</th>
                      <th className={`text-left ${th}`}>Estado</th>
                      <th className={`text-right w-24 ${th}`}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((tn) => (
                      <tr
                        key={tn.id}
                        className="border-b border-border last:border-0 hover:bg-elevated/40 transition"
                      >
                        <td className="px-4 py-3 font-medium">{tn.name}</td>
                        <td className="px-4 py-3 opacity-80 font-mono text-xs">{tn.slug}</td>
                        <td className="px-4 py-3 opacity-80">{TENANT_TYPE_LABEL[tn.type]}</td>
                        <td className="px-4 py-3">
                          {tn.is_active ? (
                            <Badge tone="success">Activo</Badge>
                          ) : (
                            <Badge tone="danger">Inactivo</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isL9 && (
                            <IconButton size="sm" onClick={() => setEditing(tn)} title="Editar">
                              <Pencil size={14} strokeWidth={1.5} />
                            </IconButton>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Card>

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
