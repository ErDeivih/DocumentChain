#!/usr/bin/env python3
"""
Corrige y completa AnexoV_ManualesUsuario.tex:
1. Añade pifont + amssymb (para \ding{} y \checkmark)
2. Corrige 52 errores de encoding (? en lugar de caracteres acentuados)
3. Añade tablas de esquema de acceso (por rol)
4. Añade \listoftables
5. Añade sección Bibliografía
6. Elimina emoji y texto problemático
"""
import io, re

SRC = r'e:\Universidad\tfg\anexos\AnexoV_ManualesUsuario.tex'

print("Leyendo AnexoV...")
with io.open(SRC, 'r', encoding='utf-8') as f:
    c = f.read()
print(f"  {len(c)} chars, {c.count(chr(10))+1} lineas")

# ── PASO 1: Añadir paquetes faltantes ────────────────────────────────────────
# Insertar después de \usepackage{booktabs}
c = c.replace(
    r'\usepackage{booktabs}',
    r'\usepackage{booktabs}' + '\n' + r'\usepackage{pifont}' + '\n' + r'\usepackage{amssymb}'
)
print("Paso 1: paquetes añadidos")

# ── PASO 2: Corregir errores de encoding (? → carácter correcto) ─────────────
encoding_fixes = [
    # Signos de apertura de interrogación/exclamación
    ('?No tienes cuenta', '¿No tienes cuenta'),
    ('?Listo!', '¡Listo!'),
    ('?IMPORTANTE', '¡IMPORTANTE'),
    # Palabras con ú final
    (r'solo t? puedes', 'solo tú puedes'),
    ('. T? pasarás', '. Tú pasarás'),
    # Palabras con á final (futuro de indicativo)
    ('cifrar? ', 'cifrará '),
    ('cifrar?.',  'cifrará.'),
    ('subir? el archivo cifrado', 'subirá el archivo cifrado'),
    ('subir? el', 'subirá el'),
    ('preparar? la transacción', 'preparará la transacción'),
    ('preparar? ', 'preparará '),
    ('permanecer? ', 'permanecerá '),
    ('permanecer?.', 'permanecerá.'),
    ('marcar? ', 'marcará '),
    ('marcar?.', 'marcará.'),
    ('desplegar? ', 'desplegará '),
    ('pedir? ', 'pedirá '),
    ('re-encriptar? ', 're-encriptará '),
    ('añadir?.',  'añadirá.'),
    ('añadir? ', 'añadirá '),
    ('perder? ', 'perderá '),
    ('conservar? ', 'conservará '),
    ('Eliminar? ', 'Eliminará '),
    ('Eliminar?\n', 'Eliminará\n'),
    ('Despinear? ', 'Despineará '),
    ('Despinear?\n', 'Despineará\n'),
    ('Archivar? ', 'Archivará '),
    ('Archivar?\n', 'Archivará\n'),
    ('har? que', 'hará que'),
    ('hacer? que', 'hará que'),
    ('volver? ', 'volverá '),
    ('entrar? ', 'entrará '),
    ('dar? ', 'dará '),
    ('estar? ', 'estará '),
    # Pasado ó
    ('activ? tracking', 'activó tracking'),
    ('descarg? ', 'descargó '),
    ('olvid? ', 'olvidó '),
    # Área/útil
    ('?rea principal', 'Área principal'),
    ('?rea:', 'Área:'),
    ('información adicional ?til', 'información adicional útil'),
    # avatar → "Perfil" (the ? is an arrow →)
    ('avatar ? \\textbf', 'avatar → \\textbf'),
    # Checkmark / X
    ('\\textbf{? Válida}', '\\textbf{\\checkmark{} Válida}'),
    ('\\textbf{? Inválida}', '\\textbf{$\\times$ Inválida}'),
    # Emoji ?? at end
    ('?Gracias por usar DocumentChain! ??', 'Gracias por usar DocumentChain.'),
    # cuál → cuál, quéé, etc.
    ('cuél es', 'cuál es'),
    ('que har?', 'que hará'),
    ('que podr?', 'que podrá'),
]

fixed_count = 0
for old, new in encoding_fixes:
    if old in c:
        c = c.replace(old, new)
        fixed_count += 1

print(f"Paso 2: {fixed_count} patrones de encoding corregidos")

# Generic pass: fix remaining "verb?" patterns at word boundaries (future tense)
def fix_future(m):
    word = m.group(1)
    return word + 'á'

c = re.sub(r'(\w{3,}r)\?(?=[\s.,;:])', fix_future, c)

# Check remaining
remaining = [ln+1 for ln, line in enumerate(c.split('\n'))
             if '?' in line and not line.strip().startswith('%')
             and 'http' not in line and '\\?' not in line
             and 'url' not in line.lower()]
print(f"  Lineas con ? restantes: {len(remaining)} -> {remaining[:15]}")

# ── PASO 3: Añadir \listoftables después de \listoffigures ───────────────────
c = c.replace(
    r'\listoffigures' + '\n' + r'\newpage',
    r'\listoffigures' + '\n' + r'\newpage' + '\n\n' + r'\listoftables' + '\n' + r'\newpage'
)
print("Paso 3: \\listoftables añadido")

# ── PASO 4: Añadir tablas de esquema de acceso  ──────────────────────────────
ACCESS_SCHEMA_SECTION = r"""
\section{Esquema de acceso al sistema}

En este apartado se presenta el esquema de acceso a las distintas vistas y funcionalidades del sistema \textbf{DocumentChain}, junto con los permisos requeridos para cada operación. El sistema cuenta con dos roles principales: \textbf{Usuario} (rol \texttt{USER}) y \textbf{Administrador} (rol \texttt{ADMIN}).

\subsection{Recursos accesibles como Usuario}

\begin{longtable}{|p{4.5cm}|p{7cm}|p{3cm}|}
\hline
\textbf{Ruta / Endpoint} & \textbf{Descripción} & \textbf{Restricción} \\
\hline
\endhead
\texttt{/login} & Inicio de sesión con usuario/contraseña. & Pública \\
\hline
\texttt{/register} & Registro de nuevo usuario. & Pública \\
\hline
\texttt{/recover-password} & Recuperación de contraseña con Recovery Key. & Pública \\
\hline
\texttt{/verify-email} & Verificación del correo electrónico. & Pública \\
\hline
\texttt{/verify} & Verificación pública de documentos (hash/CID/ID). & Pública \\
\hline
\texttt{/dashboard} & Panel principal con documentos recientes y estadísticas. & Autenticado \\
\hline
\texttt{/documents} & Listado de todos los documentos del usuario. & Autenticado \\
\hline
\texttt{/documents/:id} & Vista de detalle de un documento. & Autenticado (propietario/compartido) \\
\hline
\texttt{/documents/:id/versions} & Historial de versiones del documento. & Autenticado (propietario/compartido) \\
\hline
\texttt{/documents/:id/signatures} & Listado de firmas del documento. & Autenticado \\
\hline
\texttt{/documents/shared} & Documentos compartidos con el usuario. & Autenticado \\
\hline
\texttt{/documents/archived} & Documentos archivados. & Autenticado \\
\hline
\texttt{/folders} & Gestión de carpetas personales. & Autenticado \\
\hline
\texttt{/categories} & Gestión de categorías y etiquetas. & Autenticado \\
\hline
\texttt{/timeline} & Timeline global de actividad. & Autenticado \\
\hline
\texttt{/stats} & Estadísticas personales. & Autenticado \\
\hline
\texttt{/notifications} & Panel de notificaciones in-app. & Autenticado \\
\hline
\texttt{/profile} & Perfil de usuario (datos, wallets, seguridad). & Autenticado \\
\hline
\caption{Recursos accesibles por usuarios estándar}
\label{tab:access-user}
\end{longtable}

\subsection{Recursos exclusivos de Administrador}

\begin{longtable}{|p{4.5cm}|p{7cm}|p{3cm}|}
\hline
\textbf{Ruta / Endpoint} & \textbf{Descripción} & \textbf{Restricción} \\
\hline
\endhead
\texttt{/admin} & Panel principal de administración. & Rol ADMIN \\
\hline
\texttt{/admin/users} & Listado de todos los usuarios del sistema. & Rol ADMIN \\
\hline
\texttt{/admin/users/:id} & Perfil detallado de un usuario. & Rol ADMIN \\
\hline
\texttt{/admin/users/:id/role} & Cambio de rol de usuario (USER/ADMIN). & Rol ADMIN \\
\hline
\texttt{/admin/users/:id/suspend} & Suspensión de cuenta de usuario. & Rol ADMIN \\
\hline
\texttt{/admin/users/:id/unsuspend} & Reactivación de cuenta suspendida. & Rol ADMIN \\
\hline
\texttt{/admin/users/:id/delete} & Eliminación permanente de cuenta. & Rol ADMIN \\
\hline
\texttt{/admin/users/create} & Creación de nuevo usuario administrador. & Rol ADMIN \\
\hline
\texttt{/admin/stats} & Estadísticas globales del sistema. & Rol ADMIN \\
\hline
\texttt{/admin/blockchain} & Auditor blockchain (eventos e historial). & Rol ADMIN \\
\hline
\texttt{/admin/system} & Control del sistema (pausar/reanudar). & Rol ADMIN \\
\hline
\texttt{/admin/logs} & Visualización de logs del sistema. & Rol ADMIN \\
\hline
\caption{Recursos exclusivos del panel de administración}
\label{tab:access-admin}
\end{longtable}

"""

# Insert access schema section before Section 2 (Manual de Usuario)
marker = r'\section{Manual de Usuario}'
if marker in c:
    c = c.replace(marker, ACCESS_SCHEMA_SECTION + marker)
    print("Paso 4: tablas de esquema de acceso añadidas")
else:
    print("AVISO: marcador 'Manual de Usuario' no encontrado")

# ── PASO 5: Añadir bibliografía antes de \end{document} ──────────────────────
BIBLIO = r"""

\section{Bibliografía}

\begin{enumerate}
    \item MetaMask. (2024). \textit{MetaMask Documentation --- Getting Started}. \url{https://docs.metamask.io}

    \item Ethereum Foundation. (2024). \textit{Ethereum Developer Documentation}. \url{https://ethereum.org/en/developers/docs/}

    \item IPFS Project. (2024). \textit{IPFS Documentation --- How IPFS Works}. \url{https://docs.ipfs.tech}

    \item Mozilla Developer Network. (2024). \textit{Web Crypto API}. \url{https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API}

    \item Bitwarden. (2023). \textit{End-to-End Encryption Explained}. \url{https://bitwarden.com/resources/end-to-end-encryption/}
\end{enumerate}

"""

c = c.replace(r'\end{document}', BIBLIO + r'\end{document}')
print("Paso 5: sección Bibliografía añadida")

# ── PASO 6: Escribir resultado ────────────────────────────────────────────────
with io.open(SRC, 'w', encoding='utf-8') as f:
    f.write(c)

# ── VERIFICACIÓN ─────────────────────────────────────────────────────────────
print("\nVERIFICACIÓN:")
c = open(SRC, encoding='utf-8').read()
print(f"  Lineas totales: {c.count(chr(10))+1}")
print(f"  pifont: {'OK' if 'pifont' in c else 'FAIL'}")
print(f"  amssymb: {'OK' if 'amssymb' in c else 'FAIL'}")
print(f"  listoftables: {'OK' if 'listoftables' in c else 'FAIL'}")
print(f"  Esquema de acceso: {'OK' if 'Esquema de acceso' in c else 'FAIL'}")
print(f"  Bibliografía: {'OK' if 'Bibliografía' in c.split('end{document}')[0] else 'FAIL'}")
print(f"  longtables: {len(re.findall(r'begin..longtable', c))}")
remaining2 = [ln+1 for ln, line in enumerate(c.split('\n'))
              if '?' in line and not line.strip().startswith('%')
              and 'http' not in line and 'url' not in line.lower()
              and 'wont' not in line.lower()]
print(f"  Lineas con ? restantes: {len(remaining2)}")
print("DONE.")
