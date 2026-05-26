/**
 * App raiz minima.
 *
 * Demo de Tailwind + i18n + Auth + Theme con los toggles UI reales.
 * Router y rutas en commits 22+.
 */
import { useTranslation } from 'react-i18next';

import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/lib/auth';

function App() {
  const { t } = useTranslation();
  const { loading, user, tenant, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-page text-text-primary p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="absolute top-4 right-4 flex gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{t('app.name')}</h1>
          <p className="text-sm opacity-60">{t('app.tagline')}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-3 text-left">
          <h2 className="font-semibold">Sesion</h2>
          {loading ? (
            <p className="text-sm opacity-60">{t('common.loading')}…</p>
          ) : user ? (
            <div className="text-sm space-y-1">
              <p>
                <span className="opacity-60">Usuario:</span> {user.full_name} ({user.email})
              </p>
              <p>
                <span className="opacity-60">Nivel:</span> L{user.level}
              </p>
              <p>
                <span className="opacity-60">Tenant:</span>{' '}
                {tenant ? `${tenant.name} (${tenant.slug})` : '— platform mode —'}
              </p>
              <p>
                <span className="opacity-60">Permisos:</span> {user.permissions.length}
              </p>
              <button
                type="button"
                onClick={logout}
                className="mt-3 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-elevated transition"
              >
                {t('auth.logout')}
              </button>
            </div>
          ) : (
            <p className="text-sm opacity-60">
              Sin sesion. El Login real viene en commit 22.
            </p>
          )}
        </div>

        <p className="text-xs opacity-40">
          Toggles arriba a la derecha: idioma + tema (persisten en localStorage).
        </p>
      </div>
    </div>
  );
}

export default App;
