import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Helper: usa indexOf en vez de includes para que Vite pueda compilar
// el config con target ES5 sin romper (gotcha #10 del SKELETON_GUIDE).
function has(id: string, needle: string): boolean {
  return id.indexOf(needle) !== -1;
}

function manualChunks(id: string): string | undefined {
  if (!has(id, 'node_modules') && !has(id, '/src/')) return undefined;

  if (has(id, 'node_modules')) {
    if (has(id, 'react-router')) return 'vendor-router';
    if (has(id, 'i18next')) return 'vendor-i18n';
    if (has(id, 'react')) return 'vendor-react';
    return 'vendor';
  }

  if (has(id, '/src/lib/api/')) return 'app-api';
  if (has(id, '/src/components/ui/')) return 'app-ui';
  if (has(id, '/src/components/icons/')) return 'app-ui';
  if (has(id, '/src/lib/')) return 'app-lib';
  return undefined;
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      // Proxy API al backend Django en dev. En produccion el frontend hace
      // requests al dominio publico del backend (configurable via env).
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/health': 'http://localhost:8000',
      '/readiness': 'http://localhost:8000',
    },
  },
  build: {
    rollupOptions: {
      output: { manualChunks },
    },
    chunkSizeWarningLimit: 1000,
  },
});
