/**
 * ConfiguracionPage — 4 tabs.
 *
 * Niveles y Permisos comparten data del mismo endpoint /api/levels/ — el
 * padre lo fetcha UNA vez y lo pasa por props a ambos tabs (dedupe).
 * Cambiar entre Niveles y Permisos NO re-fetchea.
 */
import { useCallback, useEffect, useState } from 'react';

import { Tabs, type TabItem } from '@/components/ui';
import { levelsApi } from '@/lib/api';
import type { LevelsResponse } from '@/lib/api';
import { usePageTitle } from '@/lib/pageTitle';

import { NivelesTab } from './sections/NivelesTab';
import { PermisosTab } from './sections/PermisosTab';
import { GeneralesTab } from './sections/GeneralesTab';
import { BrandTab } from './sections/BrandTab';
import { LicenciaTab } from './sections/LicenciaTab';

type TabKey = 'niveles' | 'permisos' | 'generales' | 'brand' | 'licencia';

export default function ConfiguracionPage(): React.ReactElement {
  usePageTitle('Configuracion');

  const [active, setActive] = useState<TabKey>('niveles');
  const [levelsData, setLevelsData] = useState<LevelsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadLevels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await levelsApi.list();
      setLevelsData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadLevels();
  }, [reloadLevels]);

  const tabs: TabItem[] = [
    { key: 'niveles', label: 'Niveles' },
    { key: 'permisos', label: 'Permisos' },
    { key: 'generales', label: 'Generales' },
    { key: 'brand', label: 'Marca' },
    { key: 'licencia', label: 'Licencia' },
  ];

  return (
    <div className="space-y-5">
      {/* Header de pagina */}
      <div>
        <h2 className="text-2xl font-bold">Configuracion</h2>
        <p className="text-sm opacity-60 mt-1">
          Niveles, permisos, parametros generales y licencia del sistema.
        </p>
      </div>

      <Tabs items={tabs} active={active} onChange={(k) => setActive(k as TabKey)} />

      <div>
        {active === 'niveles' && (
          <NivelesTab data={levelsData} loading={loading} onReload={reloadLevels} />
        )}
        {active === 'permisos' && (
          <PermisosTab data={levelsData} loading={loading} onReload={reloadLevels} />
        )}
        {active === 'generales' && <GeneralesTab />}
        {active === 'brand' && <BrandTab />}
        {active === 'licencia' && <LicenciaTab />}
      </div>
    </div>
  );
}
