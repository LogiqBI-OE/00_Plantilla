"""
Defaults para el seed inicial de Levels y PermissionMatrix.

Estos defaults se aplican mediante una data migration (0002_seed_levels)
solo si las tablas estan vacias — son idempotentes y no pisan
configuracion editada por el usuario.

El catalogo de permisos define los `permission_code` que el resto del
sistema reconoce. Cuando se agregue una feature nueva con su permiso,
agregar el codigo aqui + definir defaults por nivel.
"""

# Catalogo de permisos: codigo -> (label_es, label_en, label_ko, description_es)
PERMISSION_CATALOG = {
    'view_users':       ('Ver usuarios',        'View users',        '사용자 보기',       'Listar usuarios del tenant.'),
    'manage_users':     ('Administrar usuarios','Manage users',      '사용자 관리',       'Crear, editar, borrar usuarios del tenant.'),
    'view_tenants':     ('Ver tenants',         'View tenants',      '테넌트 보기',       'Ver lista de tenants accesibles.'),
    'manage_tenants':   ('Administrar tenants', 'Manage tenants',    '테넌트 관리',       'Crear, editar y desactivar tenants.'),
    'view_brand':       ('Ver marca',           'View brand',        '브랜드 보기',       'Ver la configuracion de marca del tenant.'),
    'manage_brand':     ('Administrar marca',   'Manage brand',      '브랜드 관리',       'Editar logos, paleta y carrusel del tenant.'),
    'view_audit':       ('Ver auditoria',       'View audit',        '감사 로그 보기',    'Consultar el log de auditoria.'),
    'export_data':      ('Exportar datos',      'Export data',       '데이터 내보내기',   'Exportar listados a CSV/Excel.'),
    'view_system_config':   ('Ver config global',     'View global config',     '전역 설정 보기',  'Ver Global Settings (L9).'),
    'manage_system_config': ('Administrar config global','Manage global config','전역 설정 관리',  'Editar Global Settings (L9).'),
}

# Default labels y descripciones por nivel.
LEVEL_DEFAULTS = [
    (0, 'Sin acceso',  'Usuario inactivo o pendiente de asignar nivel.', False),
    (1, 'Lectura',     'Solo lectura basica.',                            False),
    (2, 'Operador',    'Operacion diaria limitada.',                      False),
    (3, 'Operador+',   'Operacion diaria estandar.',                      False),
    (4, 'Coordinador', 'Coordinacion de equipo.',                         False),
    (5, 'Supervisor',  'Gestiona usuarios y datos del tenant.',           False),
    (6, 'Manager',     'Gestion senior con visibilidad amplia.',          False),
    (7, 'Admin tenant','Administracion completa del tenant.',             False),
    (8, 'Agencia',     'Administra varios tenants (cross-tenant).',       False),
    (9, 'Super-admin', 'Acceso global a la plataforma.',                  False),
]

# Matriz default: permission_code -> set de niveles que lo tienen permitido.
# El resto de niveles tendran allowed=False (denied by default).
MATRIX_DEFAULTS: dict[str, set[int]] = {
    'view_users':           {5, 6, 7, 8, 9},
    'manage_users':         {5, 6, 7, 8, 9},
    'view_tenants':         {7, 8, 9},
    'manage_tenants':       {9},
    'view_brand':           {1, 2, 3, 4, 5, 6, 7, 8, 9},
    'manage_brand':         {7, 8, 9},
    'view_audit':           {5, 6, 7, 8, 9},
    'export_data':          {5, 6, 7, 8, 9},
    'view_system_config':   {9},
    'manage_system_config': {9},
}
