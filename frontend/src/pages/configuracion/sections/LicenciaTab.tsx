/**
 * LicenciaTab ("Licencias y tenants") — control del modo multi-tenant +
 * informacion de licencia del workspace.
 *
 * El check de multi-tenant es la decision raiz: apagado = la app opera como
 * un solo tenant (se ocultan selector de tenant, paginas Tenants y Accesos
 * de agencia). Prendido = se habilitan esas funciones. Se persiste en
 * SystemConfig (key multitenant_enabled) y refresca el runtime config para
 * que el sidebar reaccione al instante.
 *
 * Los campos de licencia siguen siendo UI-only por ahora (se conectan con el
 * modelo License en una fase posterior).
 */
import { useState } from 'react';

import { SectionHeader } from '@/components/ui';
import { systemConfigApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRuntimeConfig } from '@/lib/runtimeConfig';

// Controles dentro de celdas de tabla: sin marco, heredan el fondo de la fila.
const CELL_CONTROL =
  'w-full bg-transparent border-0 px-0 py-1 text-sm focus:outline-none focus:ring-0';

type SubTab = 'tenant' | 'licencia';

const SUB_TABS: Array<{ key: SubTab; label: string }> = [
  { key: 'tenant', label: 'Tenant' },
  { key: 'licencia', label: 'Licencia' },
];

export function LicenciaTab(): React.ReactElement {
  const { multitenantEnabled, reload } = useRuntimeConfig();
  const { tenant } = useAuth();
  const [active, setActive] = useState<SubTab>('tenant');
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState('activa');
  const [type, setType] = useState('standard');
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [maxUsers, setMaxUsers] = useState('50');

  const toggleMultitenant = async (next: boolean): Promise<void> => {
    setSaving(true);
    try {
      await systemConfigApi.patch({ multitenant_enabled: next ? 'true' : 'false' });
      await reload();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Licencias y tenants"
        description="Controla el modo multi-tenant y la licencia del workspace."
      />

      {/* Sub-navegacion (sin scroll: solo la seccion activa) */}
      <div className="flex items-center gap-2 flex-wrap border-b border-border pb-3">
        {SUB_TABS.map((st) => {
          const isActive = st.key === active;
          return (
            <button
              key={st.key}
              type="button"
              onClick={() => setActive(st.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition border"
              style={{
                background: isActive ? 'var(--accent-bg-soft)' : 'transparent',
                color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)',
                borderColor: isActive ? 'var(--accent)' : 'var(--border)',
              }}
            >
              {st.label}
            </button>
          );
        })}
      </div>

      {/* Tenant: check raiz del modo multi-tenant */}
      {active === 'tenant' && (
        <div className="rounded-xl border border-border p-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Modo multi-tenant</p>
            <p className="text-xs opacity-60 max-w-md">
              Si esta activo, se habilitan las funciones de tenant: selector de
              tenant en el sidebar y las paginas <strong>Tenants</strong> y{' '}
              <strong>Accesos de agencia</strong>. Apagado, la app opera como un
              solo tenant y esas funciones se ocultan.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={multitenantEnabled}
            disabled={saving}
            onClick={() => void toggleMultitenant(!multitenantEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50 ${
              multitenantEnabled ? 'bg-accent' : 'bg-border'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                multitenantEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      )}

      {/* Licencia: una fila por tenant (UI-only por ahora) */}
      {active === 'licencia' && (
        <div className="space-y-3">
          <p className="text-xs opacity-60">
            Cada tenant es una fila con su licencia. Los valores aun no se
            persisten en BD — se conectan en una fase posterior junto con el
            modelo License.
          </p>

          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[680px]">
                <thead>
                  <tr className="bg-table-header border-b border-border text-left">
                    <th className="px-3 py-2.5 font-semibold">Tenant</th>
                    <th className="px-3 py-2.5 font-semibold">Estatus</th>
                    <th className="px-3 py-2.5 font-semibold">Tipo</th>
                    <th className="px-3 py-2.5 font-semibold">Vigente hasta</th>
                    <th className="px-3 py-2.5 font-semibold">Max. usuarios</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border last:border-0 hover:bg-elevated/40">
                    <td className="px-3 py-2 font-medium">{tenant?.name ?? 'Workspace'}</td>
                    <td className="px-3 py-2">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={CELL_CONTROL}
                      >
                        <option value="activa">Activa</option>
                        <option value="suspendida">Suspendida</option>
                        <option value="vencida">Vencida</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className={CELL_CONTROL}
                      >
                        <option value="free">Free</option>
                        <option value="standard">Standard</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        className={CELL_CONTROL}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={maxUsers}
                        onChange={(e) => setMaxUsers(e.target.value)}
                        className={CELL_CONTROL}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
