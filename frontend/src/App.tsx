/**
 * App raiz minima.
 *
 * Demuestra Tailwind + i18next + AuthProvider + toggle de tema manual.
 * El router y rutas reales (Login, Layouts, paginas) vienen en commits 22+.
 *
 * Mientras tanto, esta vista demuestra que la sesion se rehidrata
 * correctamente: si tienes un token valido en localStorage y el backend
 * esta arriba, vas a ver tu email + nivel + tenant.
 */
import { useTranslation } from 'react-i18next';

import { useAuth } from './lib/auth';

function App() {
  const { t, i18n } = useTranslation();
  const { loading, user, tenant, logout } = useAuth();

  const toggleTheme = () => {
    const html = document.documentElement;
    html.classList.toggle('theme-dark');
    html.classList.toggle('theme-light');
  };

  const toggleLanguage = () => {
    const next = i18n.language.startsWith('en') ? 'es' : 'en';
    void i18n.changeLanguage(next);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page text-text-primary p-8">
      <div className="max-w-md w-full text-center space-y-6">
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

        <div className="flex gap-2 justify-center">
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition"
            onClick={toggleTheme}
          >
            {t('scaffold.toggle_button')}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-border font-medium hover:bg-elevated transition"
            onClick={toggleLanguage}
          >
            {i18n.language.startsWith('en') ? 'ES' : 'EN'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
