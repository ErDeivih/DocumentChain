#!/usr/bin/env python3
"""Actualizar AnexoIII: renumerar UCs old→new + actualizar recuento 42→57."""
import re, io

SRC = r'e:\Universidad\tfg\anexos\AnexoIII_EstimacionPlanificacion.tex'

RENAME = {
    1:1,  2:3,  3:5,  4:6,  5:10,  6:13,  7:14,  8:15,  9:17,
    10:19, 11:20, 12:21, 13:22, 14:23, 15:25, 16:26, 17:28,
    18:29, 19:30, 20:31, 21:32, 22:33, 23:34, 24:35, 25:36,
    26:37, 27:38, 28:39, 29:40, 30:41, 31:42, 32:43, 33:44,
    34:45, 35:46, 36:48, 37:49, 38:50, 39:52, 40:54, 41:56, 42:57,
}

print(f"Leyendo {SRC}...")
with io.open(SRC, 'r', encoding='utf-8') as f:
    content = f.read()
print(f"  {len(content)} chars, {content.count(chr(10))+1} líneas")

# --- Paso 1: Renumerar UCs (two-pass to avoid collisions) ---
def replace_uc_temp(m):
    n = int(m.group(1))
    return f'UC-TTTT{RENAME.get(n, n):04d}' if n in RENAME else m.group(0)

content = re.sub(r'UC-(\d{4})', replace_uc_temp, content)
content = content.replace('UC-TTTT', 'UC-')

uc_now = sorted(set(re.findall(r'UC-\d{4}', content)))
print(f"  UC refs tras rename: {uc_now[:5]}...{uc_now[-5:]}")

# --- Paso 2: Actualizar recuento narrativo 42→57 ---
# L249: \textbf{42 casos de uso}
content = content.replace(r'\textbf{42 casos de uso}', r'\textbf{57 casos de uso}')

# L651: "Especificación completa de casos de uso (42 UC)" y "42 casos de uso con flujos"
content = content.replace('casos de uso (42 UC)', 'casos de uso (57 UC)')
content = content.replace('catálogo completo de 42 casos de uso', 'catálogo completo de 57 casos de uso')

# --- Paso 3: Actualizar tabla UUCW (añadir 15 nuevos como Medio: 22→37) ---
# Simple=10, Medio=22→37, Complejo=10  → Total 42→57, UUCW 420→570
content = content.replace(
    'Medio (4--7 Tx) & 22 & 10 & 220 \\\\',
    'Medio (4--7 Tx) & 37 & 10 & 370 \\\\'
)
content = content.replace(
    r'\textbf{Total} & \textbf{42} & --- & \textbf{420} \\',
    r'\textbf{Total} & \textbf{57} & --- & \textbf{570} \\'
)

# --- Paso 4: Actualizar fórmulas UCP ---
content = content.replace(
    r'\text{UUCP} &= \text{UAW} + \text{UUCW} = 10 + 420 = \mathbf{430} \\[4pt]',
    r'\text{UUCP} &= \text{UAW} + \text{UUCW} = 10 + 570 = \mathbf{580} \\[4pt]'
)
content = content.replace(
    r'\text{UCP} &= \text{UUCP} \times \text{TCF} \times \text{ECF} = 430 \times 1{,}195 \times 0{,}86 \approx \mathbf{442}',
    r'\text{UCP} &= \text{UUCP} \times \text{TCF} \times \text{ECF} = 580 \times 1{,}195 \times 0{,}86 \approx \mathbf{596}'
)
# Table values
content = content.replace(
    'Puntos de Caso de Uso Sin Ajustar (UUCP) & 430 \\\\',
    'Puntos de Caso de Uso Sin Ajustar (UUCP) & 580 \\\\'
)
content = content.replace(
    'Puntos de Caso de Uso Ajustados (UCP) & 442 \\\\',
    'Puntos de Caso de Uso Ajustados (UCP) & 596 \\\\'
)

# --- Paso 5: Escribir resultado ---
with io.open(SRC, 'w', encoding='utf-8') as f:
    f.write(content)

# --- Verificación ---
print("\nVERIFICACIÓN:")
lines = content.split('\n')
print(f"  Total líneas: {len(lines)}")
uc_final = sorted(set(re.findall(r'UC-\d{4}', content)))
print(f"  UC refs: {uc_final[:5]}...{uc_final[-5:]}")
print(f"  42 casos: {content.count('42 casos')}, 57 casos: {content.count('57 casos')}")
print(f"  UUCP 580: {'OK' if '580' in content else 'FAIL'}")
print(f"  UCP 596: {'OK' if '596' in content else 'FAIL'}")
print(f"  UUCW total 570: {'OK' if '570' in content else 'FAIL'}")
print("DONE.")
