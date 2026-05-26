import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './i18n'; // inicializa i18next antes de cualquier render
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './lib/auth';
import { ThemeProvider } from './lib/theme';

/**
 * Orden de providers:
 *   ThemeProvider (visual base) > AuthProvider (sesion)
 *
 * BrandProvider y TenantProvider se anidaran dentro del Router por scope
 * (RootLayout / PlatformLayout) en commits 22+ — dependen del usuario y
 * tenant resueltos.
 */
const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found in index.html');

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
