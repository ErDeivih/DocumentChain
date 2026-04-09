import subprocess, os, sys

os.chdir(r"e:\Universidad\tfg\anexos")

packages = {
    'uc_acceso': {
        'title': 'Gestión de Acceso',
        'direction': 'left to right direction',
        'ucs': [
            ('UC_0001', 'Registrar Usuario'),
            ('UC_0003', 'Iniciar Sesión con Credenciales'),
            ('UC_0005', 'Iniciar Sesión con Wallet'),
            ('UC_0006', 'Cerrar Sesión'),
            ('UC_0010', 'Ver Perfil'),
            ('UC_0013', 'Editar Perfil'),
            ('UC_0014', 'Conectar Wallet Adicional'),
            ('UC_0015', 'Desconectar Wallet'),
            ('UC_0017', 'Recuperar Contraseña'),
        ],
        'actors': ['Usuario', 'SistemaEmail'],
        'connections': {
            'Usuario': ['UC_0001','UC_0003','UC_0005','UC_0006','UC_0010','UC_0013','UC_0014','UC_0015','UC_0017'],
            'SistemaEmail': ['UC_0001','UC_0017'],
        }
    },
    'uc_documentos': {
        'title': 'Gestión de Documentos',
        'direction': 'left to right direction',
        'ucs': [
            ('UC_0019', 'Subir Documento'),
            ('UC_0020', 'Listar Documentos'),
            ('UC_0021', 'Ver Detalles de Documento'),
            ('UC_0022', 'Descargar Documento'),
            ('UC_0023', 'Buscar Documentos'),
            ('UC_0025', 'Editar Metadatos de Documento'),
            ('UC_0026', 'Archivar Documento'),
            ('UC_0028', 'Eliminar Documento'),
        ],
        'actors': ['Usuario', 'IPFSCluster', 'SmartContract'],
        'connections': {
            'Usuario': ['UC_0019','UC_0020','UC_0021','UC_0022','UC_0023','UC_0025','UC_0026','UC_0028'],
            'IPFSCluster': ['UC_0019','UC_0022'],
            'SmartContract': ['UC_0019','UC_0028'],
        }
    },
    'uc_versiones': {
        'title': 'Gestión de Versiones',
        'direction': 'left to right direction',
        'ucs': [
            ('UC_0029', 'Crear Nueva Versión'),
            ('UC_0030', 'Listar Versiones'),
            ('UC_0031', 'Ver Detalles de Versión'),
            ('UC_0032', 'Restaurar Versión Anterior'),
            ('UC_0033', 'Establecer Versión Operativa'),
        ],
        'actors': ['Usuario', 'SmartContract'],
        'connections': {
            'Usuario': ['UC_0029','UC_0030','UC_0031','UC_0032','UC_0033'],
            'SmartContract': ['UC_0029','UC_0033'],
        }
    },
    'uc_firmas': {
        'title': 'Gestión de Firmas',
        'direction': 'left to right direction',
        'ucs': [
            ('UC_0034', 'Firmar Documento'),
            ('UC_0035', 'Listar Firmas'),
            ('UC_0036', 'Verificar Firma'),
        ],
        'actors': ['Usuario', 'SmartContract'],
        'connections': {
            'Usuario': ['UC_0034','UC_0035','UC_0036'],
            'SmartContract': ['UC_0034','UC_0036'],
        }
    },
    'uc_comparticion': {
        'title': 'Gestión de Compartición',
        'direction': 'left to right direction',
        'ucs': [
            ('UC_0037', 'Compartir Documento'),
            ('UC_0038', 'Modificar Permisos'),
            ('UC_0039', 'Revocar Acceso'),
            ('UC_0040', 'Transferir Propiedad'),
        ],
        'actors': ['Usuario', 'SmartContract'],
        'connections': {
            'Usuario': ['UC_0037','UC_0038','UC_0039','UC_0040'],
            'SmartContract': ['UC_0037','UC_0040'],
        }
    },
    'uc_organizacion': {
        'title': 'Organización',
        'direction': 'left to right direction',
        'ucs': [
            ('UC_0041', 'Gestionar Carpetas'),
            ('UC_0042', 'Gestionar Categorías'),
            ('UC_0043', 'Asignar Tags'),
        ],
        'actors': ['Usuario'],
        'connections': {
            'Usuario': ['UC_0041','UC_0042','UC_0043'],
        }
    },
    'uc_auditoria': {
        'title': 'Auditoría y Estadísticas',
        'direction': 'left to right direction',
        'ucs': [
            ('UC_0044', 'Ver Timeline de Eventos'),
            ('UC_0045', 'Ver Estadísticas Personales'),
            ('UC_0046', 'Auditar Documento en Blockchain'),
            ('UC_0048', 'Exportar Reporte de Actividad'),
        ],
        'actors': ['Usuario', 'SmartContract'],
        'connections': {
            'Usuario': ['UC_0044','UC_0045','UC_0046','UC_0048'],
            'SmartContract': ['UC_0046'],
        }
    },
    'uc_administracion': {
        'title': 'Administración',
        'direction': 'left to right direction',
        'ucs': [
            ('UC_0049', 'Gestionar Usuarios'),
            ('UC_0050', 'Ver Estadísticas del Sistema'),
            ('UC_0052', 'Pausar Sistema Circuit Breaker'),
            ('UC_0054', 'Auditar Blockchain'),
        ],
        'actors': ['Administrador', 'SmartContract'],
        'connections': {
            'Administrador': ['UC_0049','UC_0050','UC_0052','UC_0054'],
            'SmartContract': ['UC_0052','UC_0054'],
        }
    },
    'uc_notificaciones': {
        'title': 'Notificaciones',
        'direction': 'left to right direction',
        'ucs': [
            ('UC_0056', 'Ver Notificaciones'),
            ('UC_0057', 'Configurar Preferencias de Notificación'),
        ],
        'actors': ['Usuario'],
        'connections': {
            'Usuario': ['UC_0056','UC_0057'],
        }
    },
}

actor_labels = {
    'SistemaEmail': 'Sistema Email',
    'IPFSCluster': 'IPFS Cluster',
    'SmartContract': 'Smart Contract',
    'Usuario': 'Usuario',
    'Administrador': 'Administrador',
}

for fname, pkg in packages.items():
    num_ucs = len(pkg['ucs'])
    dpi = 150 if num_ucs >= 7 else 120
    direction = pkg.get('direction', 'left to right direction')

    lines = ['@startuml',
             'skinparam monochrome true',
             'skinparam packageStyle rectangle',
             f'skinparam dpi {dpi}',
             direction, '']

    for actor in pkg['actors']:
        label = actor_labels.get(actor, actor)
        lines.append(f'actor "{label}" as {actor}')
    lines.append('')

    lines.append(f'package "{pkg["title"]}" {{')
    for uc_id, uc_name in sorted(pkg['ucs'], key=lambda x: int(x[0].replace('UC_', ''))):
        num = int(uc_id.replace('UC_', ''))
        label = f'UC-{num:02d}: {uc_name}'
        lines.append(f'  usecase "{label}" as {uc_id}')
    lines.append('}')
    lines.append('')

    for actor, uc_list in pkg['connections'].items():
        for uc_id in uc_list:
            lines.append(f'{actor} --> {uc_id}')

    lines.append('@enduml')
    puml_content = '\n'.join(lines)
    
    puml_file = f'temp_{fname}.puml'
    with open(puml_file, 'w', encoding='utf-8') as f:
        f.write(puml_content)
    
    result = subprocess.run(
        ['java', '-jar', 'plantuml.jar', '-charset', 'UTF-8', '-tpng', puml_file, '-o', 'diagramas'],
        capture_output=True, text=True
    )
    png_src = f'diagramas/temp_{fname}.png'
    png_dst = f'diagramas/{fname}.png'
    if os.path.exists(png_src):
        if os.path.exists(png_dst):
            os.remove(png_dst)
        os.rename(png_src, png_dst)
        print(f'OK: {fname}.png')
    else:
        print(f'FAILED: {fname} - {result.stderr[:200]}')
    
    os.remove(puml_file)

print('Done')
