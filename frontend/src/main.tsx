import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './i18n'; // inicializa i18next antes de cualquier render
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './lib/auth';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found in index.html');

createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
