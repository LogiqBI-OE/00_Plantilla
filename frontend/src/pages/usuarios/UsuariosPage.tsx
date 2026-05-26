import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/ui';
import { usePageTitle } from '@/lib/pageTitle';

export default function UsuariosPage(): React.ReactElement {
  const { t } = useTranslation();
  usePageTitle('Usuarios');
  return (
    <EmptyState
      icon="👥"
      title="Usuarios"
      description={`Tabla + drawer de edicion. Implementacion en commit 30. ${t('common.loading')}…`}
    />
  );
}
