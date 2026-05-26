import { EmptyState } from '@/components/ui';
import { usePageTitle } from '@/lib/pageTitle';

export default function GlobalSettingsPage(): React.ReactElement {
  usePageTitle('Configuracion global');
  return (
    <EmptyState
      icon="⚙️"
      title="Configuracion global"
      description="SystemConfig key-value + GlobalBrand. Implementacion en commit 40."
    />
  );
}
