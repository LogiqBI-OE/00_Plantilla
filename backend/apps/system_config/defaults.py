"""
Catalogo de claves de SystemConfig con metadata para la UI.

Cada ConfigKey define:
- key: identificador unico
- default: valor inicial
- label: nombre visible (es)
- description: tooltip / ayuda
- section: agrupacion en la UI
- input_type: text | password | number | boolean | select
- options: solo para input_type=select
"""
from dataclasses import dataclass, field


@dataclass(frozen=True)
class ConfigKey:
    key: str
    default: str
    label: str
    description: str
    section: str
    input_type: str = 'text'
    options: tuple[str, ...] = ()


SYSTEM_CONFIG_KEYS: list[ConfigKey] = [
    ConfigKey(
        key='standard_password',
        default='ChangeMe123!',
        label='Contrasena estandar',
        description='Se aplica al usuario cuando un admin presiona "Resetear contrasena".',
        section='Accesos',
        input_type='password',
    ),
    ConfigKey(
        key='token_lifetime_days',
        default='30',
        label='Duracion de la sesion (dias)',
        description='Cuanto dura el refresh token antes de exigir nuevo login.',
        section='Accesos',
        input_type='number',
    ),
    ConfigKey(
        key='keep_warm_ping_enabled',
        default='false',
        label='Mantener backend caliente',
        description='Si esta activo, el frontend hace ping periodico a /health para evitar cold starts.',
        section='Rendimiento',
        input_type='boolean',
    ),
    ConfigKey(
        key='keep_warm_ping_interval_minutes',
        default='5',
        label='Intervalo del ping (minutos)',
        description='Cada cuanto el frontend hace ping. Solo aplica si keep_warm esta activo.',
        section='Rendimiento',
        input_type='number',
    ),
    ConfigKey(
        key='default_language',
        default='es',
        label='Idioma por defecto',
        description='Idioma inicial para usuarios nuevos. El usuario puede cambiarlo despues.',
        section='Localizacion',
        input_type='select',
        options=('es', 'en'),
    ),
]


def get_config_key(key: str) -> ConfigKey | None:
    """Devuelve el ConfigKey con esa key, o None si no existe."""
    for ck in SYSTEM_CONFIG_KEYS:
        if ck.key == key:
            return ck
    return None


def get_value(key: str) -> str:
    """
    Devuelve el valor actual de la config (desde DB), con fallback al default
    si la fila no existe. Importable desde cualquier app:

        from apps.system_config.defaults import get_value
        password = get_value('standard_password')
    """
    from .models import SystemConfig
    ck = get_config_key(key)
    fallback = ck.default if ck else ''
    try:
        return SystemConfig.objects.get(pk=key).value
    except SystemConfig.DoesNotExist:
        return fallback


# Public subset: claves seguras de exponer sin auth (no contrasenas).
PUBLIC_RUNTIME_KEYS = {
    'keep_warm_ping_enabled',
    'keep_warm_ping_interval_minutes',
}
