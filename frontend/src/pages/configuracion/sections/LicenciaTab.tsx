/**
 * LicenciaTab — informacion de licencia del workspace (single-tenant).
 *
 * UI-only por ahora: los valores aun no se persisten en BD (se conecta en
 * una fase posterior, junto con el modelo License por-tenant). En modo
 * multi-tenant esta vista cambiara a una lista de tenants con su licencia.
 */
import { useState } from 'react';

import { SectionHeader } from '@/components/ui';

const SELECT_CLASS =
  'w-full max-w-sm rounded-lg bg-card border border-border px-3 py-2 text-sm';
const INPUT_CLASS =
  'w-full max-w-sm rounded-lg bg-card border border-border px-3 py-2 text-sm';

export function LicenciaTab(): React.ReactElement {
  const [status, setStatus] = useState('activa');
  const [type, setType] = useState('standard');
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [maxUsers, setMaxUsers] = useState('50');

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Licencia"
        description="Informacion de la licencia del workspace. Los valores aun no se persisten en BD — se conecta en una fase posterior."
      />

      <div className="space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-medium">Estatus de licencia</label>
          <p className="text-xs opacity-60">¿La licencia esta activa?</p>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="activa">Activa</option>
            <option value="suspendida">Suspendida</option>
            <option value="vencida">Vencida</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Tipo de licencia</label>
          <p className="text-xs opacity-60">Plan contratado actual.</p>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="free">Free</option>
            <option value="standard">Standard</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Vigente hasta</label>
          <p className="text-xs opacity-60">Fecha de expiracion de la licencia.</p>
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Maximo de usuarios</label>
          <p className="text-xs opacity-60">Limite de cuentas activas que permite la licencia.</p>
          <input
            type="number"
            value={maxUsers}
            onChange={(e) => setMaxUsers(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>
    </div>
  );
}
