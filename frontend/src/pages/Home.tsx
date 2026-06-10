import { Trans, useTranslation } from 'react-i18next';

import { Card } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { usePageTitle } from '@/lib/pageTitle';

export default function Home(): React.ReactElement {
  const { t } = useTranslation();
  const { user, tenant } = useAuth();
  usePageTitle(t('app.name'));

  return (
    <div className="max-w-3xl space-y-4">
      <Card>
        <h2 className="font-semibold mb-2">{t('home.welcome')}</h2>
        <p className="text-sm opacity-70">
          <Trans
            i18nKey="home.greeting"
            values={{ name: user?.first_name ?? '', scope: tenant?.name ?? t('home.platform_mode') }}
            components={{ s: <span className="font-medium" /> }}
          />
        </p>
      </Card>
    </div>
  );
}
