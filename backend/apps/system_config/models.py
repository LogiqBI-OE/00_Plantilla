"""
SystemConfig: store key-value para configuracion runtime de la instancia.

Editable solo por L9 desde la consola plataforma. Los valores se guardan
como string (parseo a tipo correcto via input_type del defaults.py).
"""
from django.db import models
from django.utils.translation import gettext_lazy as _


class SystemConfig(models.Model):
    key = models.CharField(max_length=64, primary_key=True)
    value = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['key']
        verbose_name = _('Configuracion del sistema')
        verbose_name_plural = _('Configuracion del sistema')

    def __str__(self) -> str:
        return f'{self.key} = {self.value[:40]}'
