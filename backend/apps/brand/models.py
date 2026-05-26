"""
Modelos de marca.

- BrandSettings: 1 por tenant (OneToOne). Logos, paleta y carrusel del tenant.
- GlobalBrand: singleton (id=1). Identidad LogiQ usada en consola L9/L8.

Ambos modelos comparten estructura. Mantenerlos separados (en vez de
una sola tabla con un campo tipo) permite que el GlobalBrand exista
sin necesidad de tenant y se acceda con menos joins.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _


class AbstractBrand(models.Model):
    """Campos compartidos entre BrandSettings y GlobalBrand."""

    marca = models.CharField(max_length=64, default='')
    alcance = models.CharField(max_length=64, default='')

    logo_login = models.TextField(blank=True, default='')          # data URL base64
    logo_sidebar = models.TextField(blank=True, default='')        # data URL base64
    logo_login_filename = models.CharField(max_length=128, blank=True, default='')
    logo_sidebar_filename = models.CharField(max_length=128, blank=True, default='')

    paleta_actual = models.JSONField(default=dict)
    paletas_memoria = models.JSONField(default=list)               # max 5
    carrusel_fotos = models.JSONField(default=list)                # max 12
    carrusel_segundos = models.FloatField(default=4.5)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class BrandSettings(AbstractBrand):
    """Marca por tenant (1:1)."""
    tenant = models.OneToOneField(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='brand',
    )

    class Meta:
        verbose_name = _('Brand Settings')
        verbose_name_plural = _('Brand Settings')

    def __str__(self) -> str:
        return f'BrandSettings({self.tenant.slug})'


class GlobalBrand(AbstractBrand):
    """
    Singleton: id=1. La identidad LogiQ para pantallas plataforma (L9/L8).

    Se asegura via clean() y un default en migration que solo existe una
    fila. No usar en relaciones — siempre acceder con GlobalBrand.get_solo().
    """
    id = models.IntegerField(primary_key=True, default=1)

    class Meta:
        verbose_name = _('Global Brand (LogiQ)')
        verbose_name_plural = _('Global Brand (LogiQ)')

    def save(self, *args, **kwargs):
        # Forzar siempre id=1
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_solo(cls) -> 'GlobalBrand':
        from .defaults import BRAND_DEFAULTS, PALETA_DEFAULT
        obj, created = cls.objects.get_or_create(
            pk=1,
            defaults={
                'marca': BRAND_DEFAULTS['marca'],
                'alcance': BRAND_DEFAULTS['alcance'],
                'paleta_actual': PALETA_DEFAULT,
                'carrusel_segundos': BRAND_DEFAULTS['carrusel_segundos'],
            },
        )
        return obj

    def __str__(self) -> str:
        return f'GlobalBrand({self.marca or "LogiQ"})'
