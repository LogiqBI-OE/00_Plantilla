/**
 * App raiz minima.
 *
 * Por ahora solo muestra una pagina de bienvenida que demuestra que
 * Tailwind esta configurado y que los CSS variables del tema funcionan.
 *
 * Los providers (Auth, Theme, Brand, Tenant, Router) y las rutas reales
 * se agregan en commits 17-26.
 */

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page text-text-primary p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">LogiQ</h1>
          <p className="text-sm opacity-60">Plantilla esqueleto · Fase 2</p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-3 text-left">
          <h2 className="font-semibold">Estado del scaffold</h2>
          <ul className="text-sm space-y-1.5">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-info"></span>
              <span>Vite + React + TypeScript estricto</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-info"></span>
              <span>Tailwind CSS v3 con tokens CSS-vars</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-info"></span>
              <span>react-router-dom + i18next instalados</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning"></span>
              <span>Providers, layouts y rutas: pendiente</span>
            </li>
          </ul>
        </div>

        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition"
          onClick={() => {
            const html = document.documentElement;
            html.classList.toggle('theme-dark');
            html.classList.toggle('theme-light');
          }}
        >
          Toggle dark / light
        </button>
      </div>
    </div>
  );
}

export default App;
