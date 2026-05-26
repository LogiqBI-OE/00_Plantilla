/**
 * Login stub — implementacion real en commit 26.
 *
 * Por ahora un formulario minimo que funciona: identifier + password +
 * tenant_slug opcional. La version full con BackgroundCarousel, marca
 * dinamica via BrandProvider scope='public', y selector adaptativo
 * de tenant viene en el siguiente commit.
 */
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button, Card, TextField } from '@/components/ui';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function Login(): React.ReactElement {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await login({
        identifier,
        password,
        tenant_slug: tenantSlug || undefined,
      });
      // L9 sin tenant -> consola platform
      if (res.user.level >= 8 && !res.tenant) {
        navigate('/platform');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.toUserMessage());
      } else {
        setError(t('errors.generic'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4">
      <Card padding="lg" className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center mb-2">
            <h1 className="text-2xl font-bold">{t('app.name')}</h1>
            <p className="text-sm opacity-60 mt-1">{t('auth.login.subtitle')}</p>
          </div>

          <TextField
            label={t('auth.login.identifier')}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            required
            autoFocus
          />

          <TextField
            label={t('auth.login.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <TextField
            label={`${t('auth.login.tenant_selector')} (opcional)`}
            value={tenantSlug}
            onChange={(e) => setTenantSlug(e.target.value.toLowerCase().trim())}
            placeholder="acme"
            hint="Slug del tenant. Vacio = tu tenant asignado o platform mode (L9)."
          />

          {error && (
            <div className="px-3 py-2 rounded-lg bg-danger/15 text-danger text-xs">
              {error}
            </div>
          )}

          <Button type="submit" loading={submitting} className="w-full">
            {t('auth.login.submit_generic')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
