import { EmptyState } from '@/components/ui';
import { usePageTitle } from '@/lib/pageTitle';

export default function AgencyAccessPage(): React.ReactElement {
  usePageTitle('Accesos de agencia');
  return (
    <EmptyState
      icon="🔑"
      title="Accesos de agencia"
      description="L9 asigna L8 a tenants. Implementacion en commit 39."
    />
  );
}
