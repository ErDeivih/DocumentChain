import io

with io.open('AnexoI_Especificaciones.tex', encoding='utf-8') as f:
    content = f.read()

# Add pdflscape after geometry block
old = '\\usepackage{geometry}\n\\geometry{\n    left       = 2.5cm,\n    right      = 2.5cm,\n    top        = 3cm,\n    bottom     = 2.5cm,\n    headheight = 55pt,\n    headsep    = 0.8cm\n}'
new = old + '\n\n\\usepackage{pdflscape}'
if old in content:
    content = content.replace(old, new, 1)
    print('Add pdflscape: OK')
else:
    print('Add pdflscape: FAIL - pattern not found')

# Wrap architecture diagram in landscape
old_fig = '\\begin{figure}[H]\n    \\centering\n    \\includegraphics[width=0.95\\linewidth]{diagramas/arquitectura.png}\n    \\caption{Arquitectura del sistema DocumentChain por paquetes funcionales}\n    \\label{fig:arquitectura}\n\\end{figure}'

new_fig = '\\clearpage\n\\begin{landscape}\n\\thispagestyle{fancy}\n\\begin{figure}[p]\n    \\centering\n    \\includegraphics[width=\\linewidth,height=0.82\\textheight,keepaspectratio]{diagramas/arquitectura.png}\n    \\caption{Arquitectura del sistema DocumentChain por paquetes funcionales}\n    \\label{fig:arquitectura}\n\\end{figure}\n\\end{landscape}\n\\clearpage'

if old_fig in content:
    content = content.replace(old_fig, new_fig, 1)
    print('Landscape arch: OK')
else:
    print('Landscape arch: FAIL - pattern not found')
    # Debug: show what's near arquitectura
    idx = content.find('arquitectura.png')
    print('Near arquitectura.png:', repr(content[max(0,idx-100):idx+200]))

with io.open('AnexoI_Especificaciones.tex', 'w', encoding='utf-8') as f:
    f.write(content)
print('Written.')
