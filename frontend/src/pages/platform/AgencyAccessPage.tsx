/** AgencyAccessPage — L9 asigna usuarios L8 a tenants. */
import { useCallback, useEffect, useState } from 'react';

import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  IconButton,
  SkeletonBox,
} from '@/components/ui';
import { tenantsApi, usersApi } from '@/lib/api';
import type { AgencyTenantAccess, Tenant, User } from '@/lib/api';
import { usePageTitle } from '@/lib/pageTitle';

interface TenantWithAccess {
  tenant: Tenant;
  accesses: AgencyTenantAccess[];
}

export default function AgencyAccessPage(): React.ReactElement {
  usePageTitle('Accesos de agencia');

  const [rows, setRows] = useState<TenantWithAccess[]>([]);
  const [l8Users, setL8Users] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const tenantsRes = await tenantsApi.list();
      const usersRes = await usersApi.list();
      const l8 = usersRes.results.filter((u) => u.level === 8);
      setL8Users(l8);
      const data: TenantWithAccess[] = [];
      for (const t of tenantsRes.results) {
        const accesses = await tenantsApi.agencyAccess(t.id);
        data.push({ tenant: t, accesses });
      }
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleGrant = async (tenantId: number, userId: number) => {
    await tenantsApi.grantAgency(tenantId, userId);
    await reload();
  };
  const handleRevoke = async (tenantId: number, userId: number) => {
    if (!confirm('Revocar acceso?')) return;
    await tenantsApi.revokeAgency(tenantId, userId);
    await reload();
  };

  if (loading) {
    return <SkeletonBox height={300} />;
  }

  if (rows.length === 0) {
    return <EmptyState icon="🔑" title="Sin tenants" description="Crea tenants primero." />;
  }

  if (l8Users.length === 0) {
    return (
      <EmptyState
        icon="🔑"
        title="Sin usuarios L8"
        description="Crea primero usuarios de nivel 8 desde la consola Platform."
      />
    );
  }

  return (
    <div className="space-y-4 max-w-5xl">
      {rows.map(({ tenant, accesses }) => {
        const assignedIds = new Set(accesses.map((a) => a.user));
        const available = l8Users.filter((u) => !assignedIds.has(u.id));
        return (
          <Card key={tenant.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{tenant.name}</h3>
                <p className="text-xs opacity-60 font-mono">/{tenant.slug}</p>
              </div>
              <Badge tone={tenant.is_active ? 'success' : 'danger'}>
                {tenant.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>

            {accesses.length === 0 ? (
              <p className="text-xs opacity-60">Sin L8 asignados.</p>
            ) : (
              <div className="space-y-1.5">
                {accesses.map((a) => {
                  const user = l8Users.find((u) => u.id === a.user);
                  return (
                    <div key={a.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar name={user?.full_name ?? a.user_email} size="sm" />
                        <span>{user?.full_name ?? a.user_email}</span>
                      </div>
                      <IconButton size="sm" onClick={() => void handleRevoke(tenant.id, a.user)}>
                        ✕
                      </IconButton>
                    </div>
                  );
                })}
              </div>
            )}

            {available.length > 0 && (
              <div className="flex gap-2 pt-2 border-t border-border">
                <select
                  className="flex-1 rounded-lg bg-card border border-border px-2 py-1.5 text-sm"
                  defaultValue=""
                  onChange={(e) => {
                    const id = parseInt(e.target.value, 10);
                    if (!Number.isNaN(id)) {
                      void handleGrant(tenant.id, id).then(() => undefined);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">+ Asignar L8…</option>
                  {available.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
