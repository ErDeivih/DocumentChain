#!/usr/bin/env python3
"""
Extract PlantUML blocks from LaTeX annexes, replace figure+lstlisting pairs
with figure+includegraphics. Run plantuml to generate PNG files.

Usage: python extract_diagrams.py
Then compile with: lualatex AnexoX.tex (NO -shell-escape needed)
"""
import io
import re
import os
import subprocess
import sys

ANEXOS_DIR = os.path.dirname(os.path.abspath(__file__))
DIAGRAMAS_DIR = os.path.join(ANEXOS_DIR, 'diagramas')
PLANTUML_JAR = os.path.join(ANEXOS_DIR, 'plantuml.jar')

os.makedirs(DIAGRAMAS_DIR, exist_ok=True)

FILES = [
    'AnexoI_Especificaciones.tex',
    'AnexoII_AnalisisDiseno.tex',
    'AnexoIII_EstimacionPlanificacion.tex',
]

# ---------------------------------------------------------------------------
# STEP 1 — Extract PlantUML from lstlisting blocks, assign filenames
# ---------------------------------------------------------------------------

def extract_and_transform(tex_name):
    tex_path = os.path.join(ANEXOS_DIR, tex_name)
    with io.open(tex_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find every figure+lstlisting pair where lstlisting contains @startuml.
    # The figure may have arbitrary content between \end{figure} and \begin{lstlisting}.
    # Strategy: locate every \begin{lstlisting}...\end{lstlisting} that has @startuml,
    # then look backwards for the nearest preceding \begin{figure}...\end{figure}.

    lst_pattern = re.compile(
        r'\\begin\{lstlisting\}(\[.*?\])?\n(.*?)\\end\{lstlisting\}',
        re.DOTALL
    )
    fig_pattern = re.compile(
        r'\\begin\{figure\}\[H\](.*?)\\end\{figure\}',
        re.DOTALL
    )

    replacements = []  # list of (start, end, new_text) to apply in reverse order

    for lst_m in lst_pattern.finditer(content):
        lst_body = lst_m.group(2)
        if '@startuml' not in lst_body:
            continue

        # Extract @startuml ... @enduml
        puml_m = re.search(r'(@startuml.*?@enduml)', lst_body, re.DOTALL)
        if not puml_m:
            continue
        puml_code = puml_m.group(1).strip()

        lst_start = lst_m.start()
        lst_end = lst_m.end()

        # Find the closest figure block that ENDS before this lstlisting starts
        fig_end_before_lst = None
        for fig_m in fig_pattern.finditer(content, 0, lst_start):
            fig_end_before_lst = fig_m

        if fig_end_before_lst is None:
            # No preceding figure — just extract the puml file, leave .tex as-is
            label = 'diagram_%d' % lst_start
            puml_filename = label + '.puml'
            _save_puml(puml_filename, puml_code)
            print(f'  [INFO] No figure before lstlisting at pos {lst_start}, saved {puml_filename}')
            continue

        fig_body = fig_end_before_lst.group(1)  # inside \begin{figure}...\end{figure}

        # Extract label and caption from the figure
        label_m = re.search(r'\\label\{([^}]+)\}', fig_body)
        caption_m = re.search(r'\\caption\{(.*?)\}(?=\s*\\label|\s*\\end\{figure\})', fig_body, re.DOTALL)

        label = label_m.group(1) if label_m else 'fig_unknown_%d' % lst_start
        caption_raw = caption_m.group(1) if caption_m else 'Diagrama'

        # Clean caption: remove IMAGEN PENDIENTE notes
        caption_clean = re.sub(
            r'\s*[\(\[]\s*IMAGEN PENDIENTE[^)\]]*[\)\]]', '', caption_raw
        ).strip()
        caption_clean = re.sub(r'\s*---\s*generar desde [^\}]+', '', caption_clean).strip()
        caption_clean = re.sub(r'\s*-\s*Generar desde [^\}]+', '', caption_clean).strip()

        # Derive image filename from label (strip "fig:" prefix)
        img_base = label.replace('fig:', '').replace('fig-', '')
        puml_filename = img_base + '.puml'
        png_filename = img_base + '.png'

        # Save puml file
        _save_puml(puml_filename, puml_code)
        print(f'  Extracted: {puml_filename}  ({label})')

        # Determine replacement extent:
        # Replace from start of the figure block to end of lstlisting block
        # (this removes the figure placeholder AND the lstlisting code block)
        fig_start = fig_end_before_lst.start()

        # Check there's only whitespace (and possibly an intermediate text line) between figure and lstlisting
        gap = content[fig_end_before_lst.end():lst_start]
        # We'll replace the figure+gap+lstlisting with a proper figure+includegraphics
        new_figure = (
            '\\begin{figure}[H]\n'
            '    \\centering\n'
            '    \\includegraphics[width=0.9\\textwidth]{diagramas/' + png_filename + '}\n'
            '    \\caption{' + caption_clean + '}\n'
            '    \\label{' + label + '}\n'
            '\\end{figure}'
        )

        replacements.append((fig_start, lst_end, new_figure))

    # Apply replacements in reverse order (to not invalidate positions)
    replacements.sort(key=lambda x: x[0], reverse=True)

    # Deduplicate: if two replacements overlap, keep the wider one
    deduped = []
    for r in replacements:
        if deduped and r[1] > deduped[-1][0]:
            # overlaps with an already-queued replacement, skip
            continue
        deduped.append(r)

    new_content = content
    for (start, end, new_text) in deduped:
        new_content = new_content[:start] + new_text + new_content[end:]

    # Add \graphicspath if not already present
    if '\\graphicspath' not in new_content:
        new_content = new_content.replace(
            '\\begin{document}',
            '\\graphicspath{{diagramas/}}\n\\begin{document}',
            1
        )

    # Save transformed .tex (back to same file)
    with io.open(tex_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f'  -> Saved transformed {tex_name} ({len(deduped)} replacements)')
    return len(deduped)


def _save_puml(filename, code):
    """Save .puml file, skip if identical."""
    path = os.path.join(DIAGRAMAS_DIR, filename)
    if os.path.exists(path):
        with io.open(path, 'r', encoding='utf-8') as f:
            existing = f.read()
        if existing.strip() == code.strip():
            return  # unchanged
    with io.open(path, 'w', encoding='utf-8') as f:
        f.write(code + '\n')


# ---------------------------------------------------------------------------
# STEP 2 — Run PlantUML on all .puml files
# ---------------------------------------------------------------------------

def run_plantuml():
    puml_files = [f for f in os.listdir(DIAGRAMAS_DIR) if f.endswith('.puml')]
    if not puml_files:
        print('No .puml files found in diagramas/')
        return

    print(f'\nGenerating {len(puml_files)} PNG diagrams...')
    cmd = [
        'java', '-jar', PLANTUML_JAR,
        '-tpng',
        '-charset', 'UTF-8',
        '-o', DIAGRAMAS_DIR,
        os.path.join(DIAGRAMAS_DIR, '*.puml')
    ]
    result = subprocess.run(
        ' '.join(cmd),
        shell=True,
        capture_output=True,
        text=True,
        cwd=ANEXOS_DIR
    )
    if result.returncode != 0 and result.stderr:
        print('PlantUML stderr:', result.stderr[:500])
    else:
        generated = [f for f in os.listdir(DIAGRAMAS_DIR) if f.endswith('.png')]
        print(f'  Generated {len(generated)} PNG files')


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    total_replacements = 0
    for tex_file in FILES:
        path = os.path.join(ANEXOS_DIR, tex_file)
        if not os.path.exists(path):
            print(f'Skipping (not found): {tex_file}')
            continue
        print(f'\nProcessing {tex_file}...')
        n = extract_and_transform(tex_file)
        total_replacements += n

    print(f'\nTotal replacements: {total_replacements}')
    run_plantuml()
    print('\nDone. Now run build.ps1 to compile all annexes.')
