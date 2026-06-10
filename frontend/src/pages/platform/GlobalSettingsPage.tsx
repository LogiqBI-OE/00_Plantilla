/**
 * GlobalSettingsPage — "Configuracion global" (L9, scope plataforma).
 *
 * Settings del sistema (no del tenant). Tabs estilo TdF:
 *   Niveles · Permisos · Generales · Licencia
 * El branding NO va aqui (es config del tenant, se ve por separado).
 *
 * Niveles y Permisos comparten data de /api/levels/ — se fetchea UNA vez
 * en el padre y se pasa por props (cambiar de tab no re-fetchea).
 */
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BadgeCheck, Layers, ShieldCheck, SlidersHorizontal } from 'lucide-react';

import { Card, Tabs, type TabItem } from '@/components/ui';
import { levelsApi } from '@/lib/api';
import type { LevelsResponse } from '@/lib/api';
import { usePageTitle } from '@/lib/pageTitle';
import { NivelesTab } from '@/pages/configuracion/sections/NivelesTab';
import { PermisosTab } from '@/pages/configuracion/sections/PermisosTab';
import { GeneralesTab } from '@/pages/configuracion/sections/GeneralesTab';
import { LicenciaTab } from '@/pages/configuracion/sections/LicenciaTab';

type TabKey = 'niveles' | 'permisos' | 'generales' | 'licencia';

export default function GlobalSettingsPage(): React.ReactElement {
  const { t } = useTranslation();
  usePageTitle(t('settings.title'));

  const [active, setActive] = useState<TabKey>('niveles');
  const [levelsData, setLevelsData] = useState<LevelsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadLevels = useCallback(async () => {
    setLoading(true);
    try {
      setLevelsData(await levelsApi.list());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadLevels();
  }, [reloadLevels]);

  const tabs: TabItem[] = [
    { key: 'niveles', label: t('settings.tab_niveles'), icon: Layers },
    { key: 'permisos', label: t('settings.tab_permisos'), icon: ShieldCheck },
    { key: 'generales', label: t('settings.tab_generales'), icon: SlidersHorizontal },
    { key: 'licencia', label: t('settings.tab_licencia'), icon: BadgeCheck },
  ];

  return (
    <div className="space-y-5">
      {/* Header de pagina */}
      <div>
        <h2 className="text-2xl font-bold">{t('settings.title')}</h2>
        <p className="text-sm opacity-60 mt-1">{t('settings.subtitle')}</p>
      </div>

      {/* Canvas unico: tabs arriba + contenido del tab activo */}
      <Card padding="none">
        <Tabs
          items={tabs}
          active={active}
          onChange={(k) => setActive(k as TabKey)}
          className="px-2"
        />
        <div className="p-5">
          {active === 'niveles' && (
            <NivelesTab data={levelsData} loading={loading} onReload={reloadLevels} />
          )}
          {active === 'permisos' && (
            <PermisosTab data={levelsData} loading={loading} onReload={reloadLevels} />
          )}
          {active === 'generales' && <GeneralesTab />}
          {active === 'licencia' && <LicenciaTab />}
        </div>
      </Card>
    </div>
  );
}
