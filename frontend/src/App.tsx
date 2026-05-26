/**
 * App raiz minima.
 *
 * Demuestra Tailwind + i18next + toggle de tema manual. Los providers
 * (Auth, Theme, Brand, Tenant, Router) y rutas reales vienen en
 * commits 17-26.
 */
import { useTranslation } from 'react-i18next';

function App() {
  const { t, i18n } = useTranslation();

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
          <h2 className="font-semibold">{t('scaffold.status')}</h2>
          <ul className="text-sm space-y-1.5">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-info" />
              <span>{t('scaffold.vite_react_ts')}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-info" />
              <span>{t('scaffold.tailwind_tokens')}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-info" />
              <span>{t('scaffold.router_i18n')}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning" />
              <span>{t('scaffold.providers_pending')}</span>
            </li>
          </ul>
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
