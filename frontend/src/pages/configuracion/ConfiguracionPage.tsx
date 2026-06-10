/**
 * ConfiguracionPage — configuracion del TENANT (no del sistema).
 *
 * La config global del sistema (Niveles/Permisos/Generales/Licencia) vive
 * en GlobalSettingsPage (plataforma L9). Aqui va lo especifico del tenant;
 * por ahora solo Marca (branding). El resto de config de tenant se define
 * mas adelante.
 */
import { useTranslation } from 'react-i18next';

import { BrandTab } from './sections/BrandTab';
import { usePageTitle } from '@/lib/pageTitle';

export default function ConfiguracionPage(): React.ReactElement {
  const { t } = useTranslation();
  usePageTitle(t('brand_page.title'));

  return (
    <div className="space-y-5">
      {/* Header de pagina */}
      <div>
        <h2 className="text-2xl font-bold">{t('brand_page.title')}</h2>
        <p className="text-sm opacity-60 mt-1">{t('brand_page.subtitle')}</p>
      </div>

      <BrandTab />
    </div>
  );
}
