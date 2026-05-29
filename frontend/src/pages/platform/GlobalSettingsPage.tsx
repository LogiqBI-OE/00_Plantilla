/** GlobalSettingsPage — SystemConfig key-value editor (L9, scope plataforma). */
import { GeneralesTab } from '@/pages/configuracion/sections/GeneralesTab';
import { usePageTitle } from '@/lib/pageTitle';

export default function GlobalSettingsPage(): React.ReactElement {
  usePageTitle('Configuracion global');

  return (
    <div className="space-y-5">
      {/* Header de pagina */}
      <div>
        <h2 className="text-2xl font-bold">Configuracion global</h2>
        <p className="text-sm opacity-60 mt-1">
          Solo nivel 9. Parametros que controlan el comportamiento del sistema.
        </p>
      </div>

      <GeneralesTab />
    </div>
  );
}
