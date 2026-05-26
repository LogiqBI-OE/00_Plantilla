"""Serializers de brand."""
from rest_framework import serializers

from .models import BrandSettings, GlobalBrand


BRAND_FIELDS = [
    'marca', 'alcance',
    'logo_login', 'logo_sidebar',
    'logo_login_filename', 'logo_sidebar_filename',
    'paleta_actual', 'paletas_memoria',
    'carrusel_fotos', 'carrusel_segundos',
    'updated_at',
]


class BrandSettingsSerializer(serializers.ModelSerializer):
    """Brand de un tenant especifico."""
    tenant_slug = serializers.CharField(source='tenant.slug', read_only=True)

    class Meta:
        model = BrandSettings
        fields = BRAND_FIELDS + ['tenant_slug']
        read_only_fields = ['updated_at', 'tenant_slug']


class BrandSettingsPublicSerializer(serializers.ModelSerializer):
    """
    Subset publico para el login (sin auth). NO incluye paletas_memoria
    (es info interna del editor, no se expone en el login).
    """
    class Meta:
        model = BrandSettings
        fields = [
            'marca', 'alcance',
            'logo_login', 'logo_sidebar',
            'paleta_actual', 'carrusel_fotos', 'carrusel_segundos',
        ]


class GlobalBrandSerializer(serializers.ModelSerializer):
    """Brand global (singleton LogiQ)."""
    class Meta:
        model = GlobalBrand
        fields = BRAND_FIELDS
        read_only_fields = ['updated_at']
