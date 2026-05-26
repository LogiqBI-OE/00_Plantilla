import { EmptyState } from '@/components/ui';
import { usePageTitle } from '@/lib/pageTitle';

export default function AuditoriaPage(): React.ReactElement {
  usePageTitle('Auditoria');
  return (
    <EmptyState
      icon="📋"
      title="Auditoria"
      description="Log de eventos con filtros. Implementacion en commit 41."
    />
  );
}
