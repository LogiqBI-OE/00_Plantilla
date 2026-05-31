/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tokens temables: vienen de CSS variables (cambian con .theme-dark / .theme-light).
        page: 'var(--bg-page)',
        card: 'var(--bg-card)',
        elevated: 'var(--bg-elevated)',
        'table-header': 'var(--bg-table-header)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        'text-primary': 'var(--text-primary)',
        info: 'var(--info)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',

        // Sidebar (scope propio, NO cambia con tema).
        sidebar: {
          bg: 'var(--sidebar-bg)',
          'active-text': 'var(--sidebar-active-text)',
          'section-title': 'var(--sidebar-section-title)',
          text: 'var(--sidebar-text)',
          'disabled-text': 'var(--sidebar-disabled-text)',
        },

        // Brand hero del Login (scope propio).
        'brand-hero': {
          bg: 'var(--brand-hero-bg)',
          accent: 'var(--brand-hero-accent)',
        },
      },
    },
  },
  plugins: [],
};
