/** AgencyAccessPage — L9 asigna agencias (Tenant type=agency) a tenants cliente. */
import { useCallback, useEffect, useState } from 'react';
import { Building2, KeyRound, X } from 'lucide-react';

import {
  Badge,
  Card,
  EmptyState,
  IconButton,
  SkeletonBox,
} from '@/components/ui';
import { tenantsApi } from '@/lib/api';
import type { AgencyTenantAccess, Tenant } from '@/lib/api';
import { usePageTitle } from '@/lib/pageTitle';

interface TenantWithAccess {
  tenant: Tenant;
  accesses: AgencyTenantAccess[];
}

export default function AgencyAccessPage(): React.ReactElement {
  usePageTitle('Accesos de agencia');

  const [rows, setRows] = useState<TenantWithAccess[]>([]);
  const [agencies, setAgencies] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const tenantsRes = await tenantsApi.list();
      const agencyTenants = tenantsRes.results.filter((t) => t.type === 'agency');
      const clientTenants = tenantsRes.results.filter((t) => t.type === 'cliente');
      setAgencies(agencyTenants);
      const data: TenantWithAccess[] = [];
      for (const t of clientTenants) {
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

  const handleGrant = async (tenantId: number, agencyId: number) => {
    await tenantsApi.grantAgency(tenantId, agencyId);
    await reload();
  };
  const handleRevoke = async (tenantId: number, agencyId: number) => {
    if (!confirm('Revocar acceso?')) return;
    await tenantsApi.revokeAgency(tenantId, agencyId);
    await reload();
  };

  if (loading) {
    return <SkeletonBox height={300} />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<KeyRound strokeWidth={1.5} size={36} />}
        title="Sin tenants cliente"
        description="Crea primero tenants de tipo cliente."
      />
    );
  }

  if (agencies.length === 0) {
    return (
      <EmptyState
        icon={<KeyRound strokeWidth={1.5} size={36} />}
        title="Sin agencias"
        description="Crea primero un tenant de tipo agencia desde la consola Platform."
      />
    );
  }

  return (
    <div className="space-y-4 max-w-5xl">
      {rows.map(({ tenant, accesses }) => {
        const assignedIds = new Set(accesses.map((a) => a.agency));
        const available = agencies.filter((a) => !assignedIds.has(a.id));
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
              <p className="text-xs opacity-60">Sin agencias asignadas.</p>
            ) : (
              <div className="space-y-1.5">
                {accesses.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 strokeWidth={1.5} size={16} className="opacity-60" />
                      <span>{a.agency_name}</span>
                      <span className="text-xs opacity-50 font-mono">/{a.agency_slug}</span>
                    </div>
                    <IconButton size="sm" onClick={() => void handleRevoke(tenant.id, a.agency)}>
                      <X strokeWidth={1.5} size={14} />
                    </IconButton>
                  </div>
                ))}
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
                  <option value="">+ Asignar agencia…</option>
                  {available.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (/{a.slug})
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
