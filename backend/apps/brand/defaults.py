"""
Paleta default LogiQ (ver BRAND.md para la fuente de verdad).

Esta paleta se aplica:
1. Al GlobalBrand (singleton id=1) en el primer seed: identidad LogiQ
   para pantallas L9/L8 (consola plataforma).
2. A cualquier BrandSettings nuevo que se cree sin personalizar:
   tenants recien creados arrancan con esta paleta como base.

Estructura: { fixed: {...}, dark: {...}, light: {...} }

Solo principales (23 colores). Los derivados (~70 tokens) se calculan
en el frontend via lib/paletaDerivada.ts.
"""

PALETA_DEFAULT: dict = {
    'fixed': {
        # Login (2)
        'brand-hero-bg': '#0A1428',
        'brand-hero-accent': '#D4B996',
        # Sidebar (5)
        'sidebar-bg': '#161513',
        'sidebar-active-text': '#0A84FF',
        'sidebar-section-title': '#787570',
        'sidebar-text': '#F5F4F1',
        'sidebar-disabled-text': '#52504C',
    },
    'light': {
        'bg-page': '#F8FAFC',
        'bg-card': '#FFFFFF',
        'border': '#E2E8F0',
        'accent': '#007AFF',
        'text-primary': '#0F172A',
        'info': '#0369A1',
        'warning': '#B45309',
        'danger': '#DC2626',
    },
    'dark': {
        'bg-page': '#1A1916',
        'bg-card': '#23211D',
        'border': '#2D2A26',
        'accent': '#0A84FF',
        'text-primary': '#F5F4F1',
        'info': '#7DD3FC',
        'warning': '#FCD34D',
        'danger': '#FCA5A5',
    },
}

BRAND_DEFAULTS: dict = {
    'marca': 'LogiQ',
    'alcance': 'Workspace',
    'carrusel_segundos': 4.5,
}

# Limites operativos
MAX_PALETAS_MEMORIA = 5
MAX_CARRUSEL_FOTOS = 12
MAX_LOGO_BYTES = 500 * 1024     # 500 KB para logos
MAX_FOTO_BYTES = 800 * 1024     # 800 KB para fotos del carrusel
