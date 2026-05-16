import os

src_dst = [
    ('E:/Universidad/tfg/anexos/AnexoI_Especificaciones.tex', 'E:/Universidad/tfg/anexos/AnexoI_EspecificacionRequisitos_NUEVO.tex'),
    ('E:/Universidad/tfg/anexos/AnexoII_AnalisisDiseno.tex', 'E:/Universidad/tfg/anexos/AnexoIII_AnalisisDiseno_NUEVO.tex'),
    ('E:/Universidad/tfg/anexos/AnexoIII_EstimacionPlanificacion.tex', 'E:/Universidad/tfg/anexos/AnexoII_EstimacionTamanioEsfuerzo_NUEVO.tex')
]

for src, dst in src_dst:
    with open(src, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    content = content.replace('\ufffd', 'i')
    if 'Julio 2026' not in content:
        content = content.replace('\n    \vfill\n\n    \asignatura', '\n    {\\large Julio 2026}\n\n    \vfill\n\n    \asignatura')
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(content)
    with open(dst, 'r', encoding='utf-8') as f:
        check = f.read()
    print(os.path.basename(dst) + ' lines=' + str(len(check.splitlines())))
    print('  Perez=' + str('Perez' in check or 'Pérez' in check))
    print('  Gonzalez=' + str('Gonzalez' in check or 'González' in check))
    print('  Garcia=' + str('Garcia' in check or 'García' in check))
