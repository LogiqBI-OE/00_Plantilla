import { EmptyState } from '@/components/ui';
import { usePageTitle } from '@/lib/pageTitle';

export default function ConfiguracionPage(): React.ReactElement {
  usePageTitle('Configuracion');
  return (
    <EmptyState
      icon="⚙️"
      title="Configuracion"
      description="Tabs: Niveles, Permisos, Brand, Licencia. Implementacion en commits 31-37."
    />
  );
}
