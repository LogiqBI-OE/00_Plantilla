/**
 * ConfiguracionPage — 4 tabs.
 *
 * Niveles y Permisos comparten data del mismo endpoint /api/levels/ — el
 * padre lo fetcha UNA vez y lo pasa por props a ambos tabs (dedupe).
 * Cambiar entre Niveles y Permisos NO re-fetchea.
 */
import { useCallback, useEffect, useState } from 'react';

import { Card, EmptyState, Tabs, type TabItem } from '@/components/ui';
import { levelsApi } from '@/lib/api';
import type { LevelsResponse } from '@/lib/api';
import { usePageTitle } from '@/lib/pageTitle';

import { NivelesTab } from './sections/NivelesTab';
import { PermisosTab } from './sections/PermisosTab';
import { BrandTab } from './sections/BrandTab';

type TabKey = 'niveles' | 'permisos' | 'brand' | 'licencia';

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
    { key: 'brand', label: 'Marca' },
    { key: 'licencia', label: 'Licencia' },
  ];

  return (
    <div className="space-y-5">
      <Tabs items={tabs} active={active} onChange={(k) => setActive(k as TabKey)} />

      <div>
        {active === 'niveles' && (
          <NivelesTab data={levelsData} loading={loading} onReload={reloadLevels} />
        )}
        {active === 'permisos' && (
          <PermisosTab data={levelsData} loading={loading} onReload={reloadLevels} />
        )}
        {active === 'brand' && <BrandTab />}
        {active === 'licencia' && (
          <Card>
            <EmptyState
              icon="📜"
              title="Licencia"
              description="Placeholder. Configurable cuando se conecte a un sistema de billing."
            />
          </Card>
        )}
      </div>
    </div>
  );
}
