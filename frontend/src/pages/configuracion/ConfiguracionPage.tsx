/**
 * ConfiguracionPage — configuracion del TENANT (no del sistema).
 *
 * La config global del sistema (Niveles/Permisos/Generales/Licencia) vive
 * en GlobalSettingsPage (plataforma L9). Aqui va lo especifico del tenant;
 * por ahora solo Marca (branding). El resto de config de tenant se define
 * mas adelante.
 */
import { BrandTab } from './sections/BrandTab';
import { usePageTitle } from '@/lib/pageTitle';

export default function ConfiguracionPage(): React.ReactElement {
  usePageTitle('Configuracion');

  return (
    <div className="space-y-5">
      {/* Header de pagina */}
      <div>
        <h2 className="text-2xl font-bold">Configuracion</h2>
        <p className="text-sm opacity-60 mt-1">Configuracion del tenant.</p>
      </div>

      <BrandTab />
    </div>
  );
}
