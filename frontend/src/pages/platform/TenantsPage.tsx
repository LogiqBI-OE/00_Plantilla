import { EmptyState } from '@/components/ui';
import { usePageTitle } from '@/lib/pageTitle';

export default function TenantsPage(): React.ReactElement {
  usePageTitle('Tenants');
  return (
    <EmptyState
      icon="🏢"
      title="Tenants"
      description="L9 ve y administra todos. Implementacion en commit 38."
    />
  );
}
