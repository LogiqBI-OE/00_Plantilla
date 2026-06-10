/** AgencyAccessPage — L9 asigna agencias (Tenant type=agency) a tenants cliente. */
import { useCallback, useEffect, useState } from 'react';
import { Building2, KeyRound, X } from 'lucide-react';

import {
  Card,
  EmptyState,
  SectionHeader,
  SkeletonTable,
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

  const th =
    'px-4 py-3 text-[11px] uppercase tracking-wider font-semibold opacity-80 bg-table-header border-b border-border';

  const body = (() => {
    if (loading) return <SkeletonTable rows={4} cols={2} />;
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
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr>
                <th className={`text-left w-64 ${th}`}>Tenant cliente</th>
                <th className={`text-left ${th}`}>Agencias con acceso</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ tenant, accesses }) => {
                const assignedIds = new Set(accesses.map((a) => a.agency));
                const available = agencies.filter((a) => !assignedIds.has(a.id));
                return (
                  <tr
                    key={tenant.id}
                    className="border-b border-border last:border-0 hover:bg-elevated/40 transition align-top"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{tenant.name}</div>
                      <div className="text-xs opacity-50 font-mono">/{tenant.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {accesses.length === 0 && (
                          <span className="text-xs opacity-50">Sin agencias asignadas</span>
                        )}
                        {accesses.map((a) => (
                          <span
                            key={a.id}
                            className="inline-flex items-center gap-1.5 rounded-full bg-elevated border border-border pl-2.5 pr-1.5 py-1 text-xs"
                          >
                            <Building2 strokeWidth={1.5} size={12} className="opacity-60" />
                            {a.agency_name}
                            <button
                              type="button"
                              title="Revocar"
                              onClick={() => void handleRevoke(tenant.id, a.agency)}
                              className="opacity-50 hover:opacity-100 transition"
                            >
                              <X strokeWidth={1.5} size={13} />
                            </button>
                          </span>
                        ))}
                        {available.length > 0 && (
                          <select
                            className="rounded-lg bg-card border border-border px-2 py-1 text-xs"
                            defaultValue=""
                            onChange={(e) => {
                              const id = parseInt(e.target.value, 10);
                              if (!Number.isNaN(id)) {
                                void handleGrant(tenant.id, id);
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
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  })();

  return (
    <div className="space-y-5">
      {/* Header de pagina */}
      <div>
        <h2 className="text-2xl font-bold">Accesos de agencia</h2>
        <p className="text-sm opacity-60 mt-1">
          Asigna agencias a los tenants cliente que pueden gestionar. Solo nivel 9.
        </p>
      </div>

      {/* Canvas unico */}
      <Card>
        <div className="space-y-5">
          <SectionHeader
            title="Asignacion de agencias"
            description="Una agencia gestiona los tenants cliente que tenga asignados; todos sus usuarios L8 heredan el acceso."
          />
          {body}
        </div>
      </Card>
    </div>
  );
}
