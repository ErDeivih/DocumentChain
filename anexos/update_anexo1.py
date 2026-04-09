"""
Script de actualización de AnexoI_Especificaciones.tex
- Renumera UC-0001..UC-0042 → nueva numeración (57 UCs total)
- Inserta 15 nuevas especificaciones de caso de uso
- Expande UC-0056 (notificaciones) con acciones de marcar/eliminar
- Reconstruye matrices UC-NFR, UC-IRQ, UC-OBJ con las 57 filas
- Actualiza rangos en matriz UC-UC
- Actualiza referencias textuales a "42 casos de uso" → "57 casos de uso"
"""

import re, io

# ─────────────────────────────────────────────────────────────────────────────
# MAPA DE RENUMERACIÓN: viejo número → nuevo número
# ─────────────────────────────────────────────────────────────────────────────
RENAME = {
    1:1,  2:3,  3:5,  4:6,  5:10,  6:13,  7:14,  8:15,  9:17,
    10:19, 11:20, 12:21, 13:22, 14:23, 15:25, 16:26, 17:28,
    18:29, 19:30, 20:31, 21:32, 22:33, 23:34, 24:35, 25:36,
    26:37, 27:38, 28:39, 29:40, 30:41, 31:42, 32:43, 33:44,
    34:45, 35:46, 36:48, 37:49, 38:50, 39:52, 40:54, 41:56, 42:57,
}

# ─────────────────────────────────────────────────────────────────────────────
# NUEVAS ESPECIFICACIONES DE CASO DE USO (LaTeX puro)
# ─────────────────────────────────────────────────────────────────────────────

def uc_spec(num, name, version, deps, desc, pre, normal, post, exc, imp, urg, coment, extra_seqs=None):
    """Genera el bloque longtable de un UC."""
    rows = f"""\\subsubsection{{UC-{num:04d}: {name}}}

\\begin{{longtable}}{{|p{{4cm}}|p{{10cm}}|}}
\\hline
\\textbf{{UC-{num:04d}}} & {name} \\\\
\\hline
\\textbf{{Versión}} & {version} \\\\
\\hline
\\textbf{{Autores}} & David Pérez Velasco \\\\
\\hline
\\textbf{{Fuentes}} & A. Durán, B. Bernárdez \\\\
\\hline
\\textbf{{Dependencias}} & {deps} \\\\
\\hline
\\textbf{{Descripción}} & {desc} \\\\
\\hline
\\textbf{{Precondición}} & {pre} \\\\
\\hline
\\textbf{{Secuencia normal}} & {normal} \\\\
\\hline"""
    if extra_seqs:
        for label, seq in extra_seqs:
            rows += f"\n\\textbf{{{label}}} & {seq} \\\\\n\\hline"
    rows += f"""
\\textbf{{Postcondición}} & {post} \\\\
\\hline
\\textbf{{Excepciones}} & {exc} \\\\
\\hline
\\textbf{{Importancia}} & {imp} \\\\
\\hline
\\textbf{{Urgencia}} & {urg} \\\\
\\hline
\\textbf{{Estado}} & Completado \\\\
\\hline
\\textbf{{Estabilidad}} & Alta \\\\
\\hline
\\textbf{{Comentarios}} & {coment} \\\\
\\hline
\\caption{{Especificación del caso de uso UC-{num:04d}}}
\\end{{longtable}}

"""
    return rows


UC_0002 = uc_spec(
    2, "Registrar Usuario con Wallet", "1.0",
    "OBJ-0001, OBJ-0003, IRQ-0001, NFR-0001, UC-0006",
    "Permite a un nuevo usuario crear una cuenta en el sistema utilizando una wallet Ethereum (MetaMask) como mecanismo de autenticación principal, sin necesidad de contraseña. El sistema genera claves criptográficas E2E derivadas de la wallet.",
    "El usuario dispone de MetaMask u otra wallet compatible instalada en el navegador. La dirección de wallet no está registrada previamente en el sistema.",
    (r"\textbf{Paso 1:} El usuario accede a la página de registro y selecciona ``Registrar con Wallet''.\newline"
     r"\textbf{Paso 2:} MetaMask solicita permiso de acceso y devuelve la dirección pública del usuario.\newline"
     r"\textbf{Paso 3:} El frontend envía \texttt{POST /auth/prepare-register} con la dirección de wallet.\newline"
     r"\textbf{Paso 4:} El sistema genera un desafío criptográfico asociado a esa dirección.\newline"
     r"\textbf{Paso 5:} MetaMask solicita al usuario firmar el desafío (\texttt{eth\_signTypedData\_v4}).\newline"
     r"\textbf{Paso 6:} El usuario introduce username, email y nombre completo (sin contraseña).\newline"
     r"\textbf{Paso 7:} El sistema verifica la firma del desafío.\newline"
     r"\textbf{Paso 8:} El sistema genera el par de claves ECDH P-256 para cifrado E2E.\newline"
     r"\textbf{Paso 9:} El sistema deriva una clave de cifrado a partir de la wallet y cifra la clave privada ECDH.\newline"
     r"\textbf{Paso 10:} El sistema genera una clave de recuperación (recovery key) mostrada al usuario una única vez.\newline"
     r"\textbf{Paso 11:} El sistema almacena el usuario en la base de datos con la wallet como método de autenticación primario.\newline"
     r"\textbf{Paso 12:} El sistema envía email de verificación.\newline"
     r"\textbf{Paso 13:} El sistema genera JWT y devuelve al usuario junto con la recovery key."),
    "Usuario registrado con wallet como autenticación principal y claves criptográficas generadas.",
    (r"\textbf{Paso 2:} MetaMask no instalada o permiso denegado $\rightarrow$ Error de frontend ``Wallet no disponible''.\newline"
     r"\textbf{Paso 7:} Firma inválida $\rightarrow$ Error 401 ``Firma criptográfica no válida''.\newline"
     r"\textbf{Paso 11:} Dirección de wallet ya registrada $\rightarrow$ Error 409 Conflict.\newline"
     r"\textbf{Paso 11:} Username o email duplicado $\rightarrow$ Error 409 Conflict."),
    "Alta", "Alta",
    "Flujo de registro principal en la arquitectura final del sistema. La cuenta se crea sin contraseña; la wallet actúa como único factor de autenticación y fuente de derivación de claves criptográficas."
)

UC_0004 = uc_spec(
    4, "Iniciar Sesión con Wallet", "1.0",
    "OBJ-0001, OBJ-0002, IRQ-0001, NFR-0001, UC-0006",
    "Permite a un usuario ya registrado autenticarse en el sistema mediante su wallet Ethereum a través de un mecanismo de desafío-respuesta criptográfico, sin necesitar contraseña.",
    "El usuario dispone de MetaMask instalada y su wallet está asociada a una cuenta en el sistema.",
    (r"\textbf{Paso 1:} El usuario accede a la pantalla de inicio de sesión y hace clic en ``Iniciar Sesión con Wallet''.\newline"
     r"\textbf{Paso 2:} MetaMask devuelve la dirección pública del usuario.\newline"
     r"\textbf{Paso 3:} El frontend solicita un desafío criptográfico: \texttt{GET /auth/challenge/:walletAddress}.\newline"
     r"\textbf{Paso 4:} El sistema genera un nonce único y lo almacena temporalmente.\newline"
     r"\textbf{Paso 5:} MetaMask solicita al usuario firmar el desafío.\newline"
     r"\textbf{Paso 6:} El frontend envía la firma a \texttt{POST /auth/wallet-login}.\newline"
     r"\textbf{Paso 7:} El sistema verifica la firma y localiza el usuario asociado a esa wallet.\newline"
     r"\textbf{Paso 8:} El sistema comprueba que el usuario no está suspendido y si tiene 2FA activo.\newline"
     r"\textbf{Paso 9:} El sistema crea sesión y genera JWT + token de refresco.\newline"
     r"\textbf{Paso 10:} El usuario es redirigido al dashboard."),
    "Usuario autenticado con JWT válido. Sesión registrada en la base de datos.",
    (r"\textbf{Paso 7:} Wallet no asociada a ninguna cuenta $\rightarrow$ Error 401.\newline"
     r"\textbf{Paso 7:} Firma inválida o nonce expirado $\rightarrow$ Error 401.\newline"
     r"\textbf{Paso 8:} Usuario suspendido $\rightarrow$ Error 403.\newline"
     r"\textbf{Paso 8:} 2FA activo $\rightarrow$ Se solicita código TOTP antes de emitir JWT."),
    "Vital", "Inmediata",
    "Método de autenticación principal del sistema. El nonce generado tiene una caducidad corta para evitar ataques de repetición."
)

UC_0007 = uc_spec(
    7, "Eliminar Wallet", "1.0",
    "OBJ-0001, IRQ-0001, NFR-0001, UC-0006",
    "Permite al usuario eliminar una wallet previamente asociada a su cuenta. El sistema impide la eliminación si es la única vía de autenticación disponible.",
    "Usuario autenticado con JWT válido. El usuario tiene al menos una wallet registrada.",
    (r"\textbf{Paso 1:} El usuario accede a Configuración $\rightarrow$ Wallets.\newline"
     r"\textbf{Paso 2:} El usuario hace clic en el icono de eliminación junto a la wallet deseada.\newline"
     r"\textbf{Paso 3:} El sistema verifica que existe algún otro método de autenticación (otra wallet u otro mecanismo).\newline"
     r"\textbf{Paso 4:} El sistema solicita confirmación al usuario.\newline"
     r"\textbf{Paso 5:} El frontend envía \texttt{DELETE /api/wallets/:walletId}.\newline"
     r"\textbf{Paso 6:} El sistema elimina el registro de wallet de la base de datos.\newline"
     r"\textbf{Paso 7:} La wallet desaparece de la lista del usuario."),
    "La wallet queda eliminada de la cuenta del usuario y ya no puede usarse para autenticación.",
    (r"\textbf{Paso 3:} Es la única wallet y no hay otro método de autenticación $\rightarrow$ Error 400 ``No se puede eliminar el único método de autenticación''.\newline"
     r"\textbf{Paso 3:} La wallet es la principal y es la única $\rightarrow$ Error 400.\newline"
     r"\textbf{Paso 6:} Wallet no encontrada o no pertenece al usuario $\rightarrow$ Error 404."),
    "Media", "Media",
    "Operación reversible a nivel de datos (puede añadirse de nuevo la wallet), pero la sesión activa no se invalida por este cambio."
)

UC_0008 = uc_spec(
    8, "Establecer Wallet Principal", "1.0",
    "OBJ-0001, OBJ-0002, IRQ-0001, NFR-0003, UC-0006",
    "Permite al usuario designar una de sus wallets como la wallet principal utilizada por defecto en las operaciones blockchain (subir documentos, firmar, compartir).",
    "Usuario autenticado. El usuario tiene al menos dos wallets registradas o una que aún no es la principal.",
    (r"\textbf{Paso 1:} El usuario accede a Configuración $\rightarrow$ Wallets.\newline"
     r"\textbf{Paso 2:} El usuario hace clic en ``Establecer como principal'' sobre la wallet deseada.\newline"
     r"\textbf{Paso 3:} El frontend envía \texttt{PUT /api/wallets/:walletId/primary}.\newline"
     r"\textbf{Paso 4:} El sistema desactiva el flag \texttt{isPrimary} de la wallet anterior.\newline"
     r"\textbf{Paso 5:} El sistema activa el flag \texttt{isPrimary} en la wallet seleccionada.\newline"
     r"\textbf{Paso 6:} La interfaz actualiza el indicador visual mostrando la nueva wallet principal."),
    "La wallet seleccionada queda marcada como principal. Todas las operaciones blockchain posteriores usarán esta wallet por defecto.",
    (r"\textbf{Paso 3:} Wallet no encontrada o no pertenece al usuario $\rightarrow$ Error 404.\newline"
     r"\textbf{Paso 3:} La wallet ya es la principal $\rightarrow$ Operación idempotente, respuesta 200."),
    "Media", "Media",
    "La wallet principal se muestra destacada en la interfaz y se preselecciona en los contratos de MetaMask."
)

UC_0009 = uc_spec(
    9, "Renombrar/Etiquetar Wallet", "1.0",
    "OBJ-0001, IRQ-0001, NFR-0003, UC-0006",
    "Permite al usuario asignar una etiqueta descriptiva (label) a cada una de sus wallets para facilitar su identificación cuando dispone de varias.",
    "Usuario autenticado con JWT válido. El usuario tiene al menos una wallet registrada.",
    (r"\textbf{Paso 1:} El usuario accede a Configuración $\rightarrow$ Wallets.\newline"
     r"\textbf{Paso 2:} El usuario hace clic en el icono de edición junto a la wallet.\newline"
     r"\textbf{Paso 3:} El sistema muestra un campo de texto con la etiqueta actual (si la hay).\newline"
     r"\textbf{Paso 4:} El usuario introduce la nueva etiqueta y confirma.\newline"
     r"\textbf{Paso 5:} El frontend envía \texttt{PUT /api/wallets/:walletId/label} con la nueva etiqueta.\newline"
     r"\textbf{Paso 6:} El sistema actualiza el campo \texttt{label} en la base de datos.\newline"
     r"\textbf{Paso 7:} La nueva etiqueta aparece junto a la dirección de la wallet en la interfaz."),
    "La wallet muestra la etiqueta personalizada en todos los contextos de la interfaz.",
    (r"\textbf{Paso 5:} Etiqueta vacía $\rightarrow$ Se borra la etiqueta existente (operación válida).\newline"
     r"\textbf{Paso 5:} Etiqueta demasiado larga (>100 caracteres) $\rightarrow$ Error 400."),
    "Baja", "Baja",
    "Función de conveniencia especialmente útil para usuarios con múltiples wallets (personal, trabajo, hardware wallet)."
)

UC_0011 = uc_spec(
    11, "Desactivar Propia Cuenta", "1.0",
    "OBJ-0001, IRQ-0001, NFR-0001",
    "Permite al propio usuario suspender voluntariamente su cuenta, bloqueando el acceso al sistema e invalidando todas sus sesiones activas. La suspensión se propaga también a las wallets en la blockchain.",
    "Usuario autenticado con JWT válido. La cuenta no está ya suspendida.",
    (r"\textbf{Paso 1:} El usuario accede a Configuración $\rightarrow$ Privacidad.\newline"
     r"\textbf{Paso 2:} El usuario hace clic en ``Desactivar mi cuenta''.\newline"
     r"\textbf{Paso 3:} El sistema solicita confirmación y, opcionalmente, un motivo.\newline"
     r"\textbf{Paso 4:} El frontend envía \texttt{PUT /api/users/me/suspend} con el motivo.\newline"
     r"\textbf{Paso 5:} El sistema marca la cuenta como suspendida en la base de datos (\texttt{isSuspended=true}).\newline"
     r"\textbf{Paso 6:} El sistema llama a \texttt{BlockchainAdminService.suspendUserOnChain} para suspender todas las wallets del usuario en el smart contract.\newline"
     r"\textbf{Paso 7:} El sistema invalida todos los tokens JWT y de refresco activos.\newline"
     r"\textbf{Paso 8:} El usuario es desconectado del sistema."),
    "Cuenta suspendida en base de datos y en blockchain. Ninguna sesión activa del usuario permanece válida.",
    (r"\textbf{Paso 5:} Cuenta ya suspendida $\rightarrow$ Error 409.\newline"
     r"\textbf{Paso 6:} Error de comunicación con blockchain $\rightarrow$ La BD se actualiza igualmente; el sistema registra el error para reintento."),
    "Media", "Baja",
    "Caso de uso de privacidad y seguridad. Permite al usuario proteger su cuenta inmediatamente si sospecha de un compromiso. La reactivación se realiza mediante UC-0012."
)

UC_0012 = uc_spec(
    12, "Reactivar Propia Cuenta", "1.0",
    "OBJ-0001, IRQ-0001, NFR-0001, UC-0011",
    "Permite a un usuario con cuenta suspendida por él mismo (ver UC-0011) reactivarla para recuperar el acceso al sistema.",
    "El usuario tiene una cuenta suspendida voluntariamente (no por administrador). El usuario recuerda sus credenciales de acceso.",
    (r"\textbf{Paso 1:} El usuario accede a la pantalla de inicio de sesión e introduce sus credenciales.\newline"
     r"\textbf{Paso 2:} El sistema detecta que la cuenta está suspendida y muestra opción de reactivación.\newline"
     r"\textbf{Paso 3:} El usuario hace clic en ``Reactivar mi cuenta'' y confirma.\newline"
     r"\textbf{Paso 4:} El sistema autentica temporalmente al usuario con un token restringido.\newline"
     r"\textbf{Paso 5:} El frontend envía \texttt{PUT /api/users/me/unsuspend}.\newline"
     r"\textbf{Paso 6:} El sistema marca la cuenta como activa en la base de datos (\texttt{isSuspended=false}).\newline"
     r"\textbf{Paso 7:} El sistema llama a \texttt{BlockchainAdminService.unsuspendUserOnChain} para las wallets.\newline"
     r"\textbf{Paso 8:} El sistema emite JWT completo y el usuario accede al dashboard."),
    "Cuenta reactivada en base de datos y blockchain. El usuario puede operar normalmente.",
    (r"\textbf{Paso 2:} La suspensión fue impuesta por un administrador $\rightarrow$ El sistema no muestra la opción de reactivación; solo el admin puede reactivarla.\newline"
     r"\textbf{Paso 5:} Credenciales inválidas $\rightarrow$ Error 401."),
    "Media", "Baja",
    "Solo es posible si la suspensión fue iniciada por el propio usuario. Las suspensiones administrativas requieren intervención de un administrador."
)

UC_0016 = uc_spec(
    16, "Reenviar Email de Verificación", "1.0",
    "OBJ-0001, IRQ-0001, IRQ-0007, NFR-0001, UC-0015",
    "Permite al usuario solicitar el reenvío de un email de verificación de cuenta cuando el original no fue recibido, fue eliminado o su token ha expirado.",
    "Usuario autenticado o recién registrado. El email de la cuenta aún no ha sido verificado.",
    (r"\textbf{Paso 1:} El usuario observa el aviso ``Email no verificado'' en la interfaz.\newline"
     r"\textbf{Paso 2:} El usuario hace clic en ``Reenviar email de verificación''.\newline"
     r"\textbf{Paso 3:} El frontend envía \texttt{POST /email/resend-verification}.\newline"
     r"\textbf{Paso 4:} El sistema invalida cualquier token de verificación anterior.\newline"
     r"\textbf{Paso 5:} El sistema genera un nuevo token de verificación con fecha de expiración renovada.\newline"
     r"\textbf{Paso 6:} El sistema envía el nuevo email de verificación al email registrado.\newline"
     r"\textbf{Paso 7:} El sistema informa al usuario de que el email ha sido enviado."),
    "Nuevo token de verificación generado y email enviado. El token anterior queda invalidado.",
    (r"\textbf{Paso 3:} Email ya verificado $\rightarrow$ Error 409 ``El email ya ha sido verificado''.\newline"
     r"\textbf{Paso 3:} Demasiadas solicitudes en poco tiempo $\rightarrow$ Error 429 (rate limiting).\newline"
     r"\textbf{Paso 6:} Fallo en el servicio SMTP $\rightarrow$ Error 500 con mensaje descriptivo."),
    "Media", "Media",
    "Los tokens de verificación de email tienen una ventana de expiración. El rate limiting protege contra el abuso de reenvíos masivos."
)

UC_0018 = uc_spec(
    18, "Regenerar Códigos de Backup 2FA", "1.0",
    "OBJ-0001, IRQ-0001, NFR-0001, UC-0017",
    "Permite al usuario autenticado regenerar sus códigos de recuperación de autenticación de dos factores cuando los ha consumido o extravíado.",
    "Usuario autenticado con JWT válido. La autenticación de dos factores está activa en la cuenta.",
    (r"\textbf{Paso 1:} El usuario accede a Configuración $\rightarrow$ Seguridad $\rightarrow$ 2FA.\newline"
     r"\textbf{Paso 2:} El usuario hace clic en ``Regenerar códigos de respaldo''.\newline"
     r"\textbf{Paso 3:} El sistema solicita confirmación (esta acción invalida todos los códigos anteriores).\newline"
     r"\textbf{Paso 4:} El frontend envía \texttt{POST /auth/2fa/regenerate-backup-codes}.\newline"
     r"\textbf{Paso 5:} El sistema invalida todos los códigos de respaldo anteriores en la base de datos.\newline"
     r"\textbf{Paso 6:} El sistema genera 10 nuevos códigos de respaldo.\newline"
     r"\textbf{Paso 7:} El sistema hashea los códigos con Argon2id y los almacena en la base de datos.\newline"
     r"\textbf{Paso 8:} El sistema muestra los códigos en texto plano al usuario una única vez.\newline"
     r"\textbf{Paso 9:} El usuario descarga o anota los códigos y confirma haberlos guardado."),
    "10 nuevos códigos de respaldo generados y almacenados. Los anteriores quedan invalidados permanentemente.",
    (r"\textbf{Paso 4:} 2FA no está activo en la cuenta $\rightarrow$ Error 400.\newline"
     r"\textbf{Paso 9:} El usuario cierra la ventana sin confirmar $\rightarrow$ Los códigos ya están generados; se le muestra un aviso de que no podrá verlos de nuevo."),
    "Alta", "Media",
    "Los códigos se muestran una única vez por razones de seguridad. Una vez cerrada la ventana, solo quedan los hashes almacenados."
)

UC_0024 = uc_spec(
    24, "Desarchivar Documento", "1.0",
    "OBJ-0002, OBJ-0003, IRQ-0002, NFR-0003, UC-0023",
    "Permite al propietario de un documento restaurar a estado activo un documento previamente archivado. La operación se registra en blockchain.",
    "Usuario autenticado. El documento existe en estado archivado y el usuario es su propietario.",
    (r"\textbf{Paso 1:} El usuario accede a la sección ``Archivados'' de su biblioteca de documentos.\newline"
     r"\textbf{Paso 2:} El usuario selecciona un documento y hace clic en ``Desarchivar''.\newline"
     r"\textbf{Paso 3:} El frontend envía \texttt{POST /api/documents/:documentId/archive/prepare}.\newline"
     r"\textbf{Paso 4:} El backend retorna los datos necesarios para firmar la transacción blockchain (\texttt{setArchiveStatus(false)}).\newline"
     r"\textbf{Paso 5:} MetaMask solicita al usuario confirmar y firmar la transacción.\newline"
     r"\textbf{Paso 6:} El frontend envía \texttt{POST /api/documents/:documentId/archive/confirm} con el \texttt{txHash}.\newline"
     r"\textbf{Paso 7:} El backend actualiza el estado del documento a \texttt{TX\_SUBMITTED}.\newline"
     r"\textbf{Paso 8:} El event listener detecta la confirmación en blockchain y actualiza el estado a \texttt{SYNCED} y \texttt{archived=false}."),
    "El documento aparece de nuevo en la lista activa de documentos del usuario. El cambio queda registrado en blockchain y en el timeline.",
    (r"\textbf{Paso 3:} Usuario no es propietario $\rightarrow$ Error 403.\newline"
     r"\textbf{Paso 3:} Documento no está archivado $\rightarrow$ Error 400.\newline"
     r"\textbf{Paso 6:} Transacción rechazada por el usuario en MetaMask $\rightarrow$ El frontend lo gestiona sin cambios en la base de datos."),
    "Media", "Media",
    "Operación inversa a UC-0023 (Archivar Documento). Requiere el mismo flujo prepare/confirm con interacción blockchain."
)

UC_0027 = uc_spec(
    27, "Transferir Documento", "1.0",
    "OBJ-0002, OBJ-0003, OBJ-0006, IRQ-0002, IRQ-0005, NFR-0001, NFR-0002, UC-0019",
    "Permite al propietario de un documento ceder su propiedad completa a otro usuario del sistema. La transferencia implica el re-cifrado de la clave simétrica del documento con la clave pública del nuevo propietario y la actualización del control de acceso en blockchain.",
    "Usuario autenticado y propietario del documento. El destinatario debe ser un usuario registrado en el sistema con wallet vinculada.",
    (r"\textbf{Paso 1:} El propietario accede al detalle del documento y hace clic en ``Transferir propiedad''.\newline"
     r"\textbf{Paso 2:} El usuario busca y selecciona al nuevo propietario.\newline"
     r"\textbf{Paso 3:} El frontend obtiene la clave pública ECDH del nuevo propietario mediante \texttt{GET /api/users/:username}.\newline"
     r"\textbf{Paso 4:} El frontend descifra la clave simétrica del documento con la clave privada del propietario actual.\newline"
     r"\textbf{Paso 5:} El frontend re-cifra la clave simétrica con la clave pública del nuevo propietario.\newline"
     r"\textbf{Paso 6:} El frontend envía \texttt{POST /api/documents/:documentId/transfer/prepare} con la clave re-cifrada.\newline"
     r"\textbf{Paso 7:} El backend retorna los datos para la transacción blockchain (\texttt{transferOwnership}).\newline"
     r"\textbf{Paso 8:} MetaMask solicita al usuario firmar la transacción.\newline"
     r"\textbf{Paso 9:} El frontend envía \texttt{POST /api/documents/:documentId/transfer/confirm} con el \texttt{txHash}.\newline"
     r"\textbf{Paso 10:} El event listener confirma la transacción y actualiza el propietario en base de datos."),
    "El documento pertenece al nuevo propietario. El propietario anterior pierde el acceso salvo que sea re-invitado. La transferencia queda registrada en blockchain y en el timeline.",
    (r"\textbf{Paso 2:} Usuario destinatario no encontrado $\rightarrow$ Error 404.\newline"
     r"\textbf{Paso 2:} Usuario destinatario suspendido $\rightarrow$ Error 400.\newline"
     r"\textbf{Paso 6:} Error en el descifrado de la clave simétrica $\rightarrow$ Error 400.\newline"
     r"\textbf{Paso 8:} Transacción rechazada en MetaMask $\rightarrow$ Sin cambios en base de datos."),
    "Alta", "Alta",
    "Operación criptográficamente compleja: implica re-cifrado asimétrico de la clave simétrica del documento. Es irreversible sin la cooperación del nuevo propietario."
)

UC_0047 = uc_spec(
    47, "Verificar Autenticidad de Documento", "1.0",
    "OBJ-0002, OBJ-0004, OBJ-0005, IRQ-0002, IRQ-0004, IRQ-0005, NFR-0001, NFR-0002",
    "Permite a cualquier persona (sin necesidad de estar registrada) verificar criptográficamente la existencia, integridad y trazabilidad de un documento en la blockchain, comprobando que no ha sido alterado desde su registro.",
    "Ninguna. Este caso de uso es de acceso público y no requiere autenticación.",
    (r"\textbf{Paso 1:} El usuario (registrado o no) accede a la sección de Verificación Pública.\newline"
     r"\textbf{Paso 2:} El usuario elige el método de verificación: (a) subir el archivo original, (b) introducir el hash IPFS, o (c) introducir el ID de blockchain.\newline"
     r"\textbf{Paso 3:} Según el método: (a) \texttt{POST /api/verification/file} con el archivo; (b) \texttt{POST /api/verification/ipfs} con el CID; (c) \texttt{POST /api/verification/blockchain} con el blockchainId.\newline"
     r"\textbf{Paso 4:} El sistema calcula el hash del archivo (si aplica) y consulta el registro en blockchain.\newline"
     r"\textbf{Paso 5:} El sistema retorna: existencia del documento, propietario (wallet), fecha de registro, versiones, estado de archivo y coincidencia de hash.\newline"
     r"\textbf{Paso 6:} La interfaz muestra el resultado de la verificación con semáforo visual (válido/inválido/no encontrado)."),
    "El usuario conoce el estado criptográfico del documento: si existe en blockchain, si su contenido coincide con el original y la cadena de custodia completa.",
    (r"\textbf{Paso 4:} Documento no encontrado en blockchain $\rightarrow$ Resultado ``Documento no registrado''.\newline"
     r"\textbf{Paso 4:} Hash del archivo no coincide con el registrado $\rightarrow$ Resultado ``Documento alterado''.\newline"
     r"\textbf{Paso 3:} Archivo supera el límite de tamaño (100~MB) $\rightarrow$ Error 413."),
    "Alta", "Alta",
    "Feature diferencial del sistema: permite la verificación trustless sin depender del servidor de DocumentChain. Cualquier tercero puede auditar la autenticidad de un documento."
)

UC_0051 = uc_spec(
    51, "Crear Usuario Administrador", "1.0",
    "OBJ-0001, OBJ-0003, IRQ-0001, NFR-0001, UC-0050",
    "Permite a un administrador crear una nueva cuenta con privilegios de administrador, generando sus claves criptográficas y una clave de recuperación que se muestra una única vez.",
    "El actor es un usuario con rol ADMIN. El nombre de usuario y email del nuevo administrador no deben existir previamente.",
    (r"\textbf{Paso 1:} El administrador accede al Panel de Administración $\rightarrow$ Usuarios.\newline"
     r"\textbf{Paso 2:} El administrador hace clic en ``Crear Administrador''.\newline"
     r"\textbf{Paso 3:} El administrador introduce: username, email, contraseña temporal y nombre completo.\newline"
     r"\textbf{Paso 4:} El frontend envía \texttt{POST /api/admin/users} con los datos del formulario.\newline"
     r"\textbf{Paso 5:} El backend crea el usuario con rol ADMIN en la base de datos.\newline"
     r"\textbf{Paso 6:} El sistema genera un par de claves ECDH P-256 para el nuevo administrador.\newline"
     r"\textbf{Paso 7:} El sistema genera una recovery key única para el nuevo administrador.\newline"
     r"\textbf{Paso 8:} El sistema envía un email de bienvenida al nuevo administrador con instrucciones.\newline"
     r"\textbf{Paso 9:} El sistema muestra la recovery key generada al administrador creador (una única vez)."),
    "Nuevo usuario administrador creado con claves criptográficas y recovery key. El nuevo admin puede iniciar sesión con sus credenciales.",
    (r"\textbf{Paso 4:} Username o email ya existen $\rightarrow$ Error 409 Conflict.\newline"
     r"\textbf{Paso 4:} Contraseña no cumple requisitos de seguridad $\rightarrow$ Error 400.\newline"
     r"\textbf{Paso 8:} Fallo en el envío de email $\rightarrow$ El usuario se crea igualmente; se registra el error."),
    "Alta", "Media",
    "La recovery key generada es la única forma de recuperar el acceso criptográfico del nuevo administrador. El administrador creador debe comunicarla de forma segura al nuevo admin."
)

UC_0053 = uc_spec(
    53, "Eliminar Cuenta de Usuario (Admin)", "1.0",
    "OBJ-0001, IRQ-0001, NFR-0001, NFR-0005, UC-0049",
    "Permite a un administrador eliminar permanentemente la cuenta de un usuario junto con todos sus datos asociados (documentos, sesiones, wallets). Esta acción es irreversible.",
    "El actor es un usuario con rol ADMIN. El usuario a eliminar existe en el sistema.",
    (r"\textbf{Paso 1:} El administrador accede al Panel de Administración $\rightarrow$ Usuarios.\newline"
     r"\textbf{Paso 2:} El administrador selecciona al usuario y hace clic en ``Eliminar usuario''.\newline"
     r"\textbf{Paso 3:} El sistema muestra una advertencia de irreversibilidad y solicita confirmación.\newline"
     r"\textbf{Paso 4:} El frontend envía \texttt{DELETE /api/admin/users/:userId}.\newline"
     r"\textbf{Paso 5:} El backend elimina en cascada: sesiones, tokens, wallets, comparticiones, firmas y documentos del usuario en la base de datos.\newline"
     r"\textbf{Paso 6:} El backend revoca los permisos del usuario en los documentos compartidos donde era destinatario.\newline"
     r"\textbf{Paso 7:} El usuario desaparece de todos los listados del sistema."),
    "El usuario y todos sus datos han sido eliminados permanentemente del sistema. Las entradas de auditoría en blockchain permanecen (inmutables).",
    (r"\textbf{Paso 4:} Un administrador intenta eliminarse a sí mismo $\rightarrow$ Error 400 ``No puedes eliminar tu propia cuenta''.\newline"
     r"\textbf{Paso 4:} Usuario no encontrado $\rightarrow$ Error 404."),
    "Alta", "Baja",
    "Los registros blockchain del usuario permanecen inmutables por diseño. Solo se eliminan los datos en la base de datos centralizada. Acción cubierta por RGPD (derecho al olvido)."
)

UC_0055 = uc_spec(
    55, "Reanudar Sistema", "1.0",
    "OBJ-0001, OBJ-0002, IRQ-0005, IRQ-0007, NFR-0001, NFR-0002, UC-0054",
    "Permite a un administrador reanudar el sistema tras una pausa de emergencia (Circuit Breaker), rehabilitando todas las operaciones blockchain y desbloqueando el acceso de los usuarios.",
    "El actor es un usuario con rol ADMIN. El sistema se encuentra en estado de pausa (UC-0054 fue ejecutado previamente).",
    (r"\textbf{Paso 1:} El administrador accede al Panel de Administración $\rightarrow$ Estado del Sistema.\newline"
     r"\textbf{Paso 2:} El administrador observa el indicador de estado ``Sistema en pausa'' y hace clic en ``Reanudar Sistema''.\newline"
     r"\textbf{Paso 3:} El sistema solicita confirmación y, opcionalmente, un mensaje de reanudación.\newline"
     r"\textbf{Paso 4:} El frontend envía \texttt{POST /api/admin/system/unpause}.\newline"
     r"\textbf{Paso 5:} El backend llama a la función \texttt{unpause()} del smart contract \texttt{DocumentRegistry}.\newline"
     r"\textbf{Paso 6:} El backend actualiza la configuración del sistema en la base de datos (\texttt{system\_paused=false}).\newline"
     r"\textbf{Paso 7:} El sistema envía una notificación a todos los usuarios indicando que el sistema ha sido reanudado.\newline"
     r"\textbf{Paso 8:} Los usuarios pueden volver a realizar operaciones blockchain normalmente."),
    "El smart contract está en estado activo. Los usuarios con sesión activa recuperan la capacidad de operar con la blockchain.",
    (r"\textbf{Paso 4:} El sistema no está en pausa $\rightarrow$ Error 400 ``El sistema no está pausado''.\newline"
     r"\textbf{Paso 5:} Error de comunicación con la blockchain $\rightarrow$ Error 503; el sistema permanece pausado."),
    "Alta", "Alta",
    "Operación simétrica a UC-0054. Debe realizarse tan pronto como se haya resuelto la incidencia que motivó la pausa, para minimizar la interrupción del servicio."
)


# ─────────────────────────────────────────────────────────────────────────────
# DICCIONARIO: insertar ANTES del \subsubsection cuyo número es la clave
# ─────────────────────────────────────────────────────────────────────────────
INSERTIONS = {
    3:  UC_0002,           # insert UC-0002 before UC-0003
    5:  UC_0004,           # insert UC-0004 before UC-0005
    10: UC_0007 + UC_0008 + UC_0009,   # insert 3 UCs before UC-0010
    13: UC_0011 + UC_0012,             # insert 2 UCs before UC-0013
    17: UC_0016,           # insert UC-0016 before UC-0017
    19: UC_0018,           # insert UC-0018 before UC-0019
    25: UC_0024,           # insert UC-0024 before UC-0025
    28: UC_0027,           # insert UC-0027 before UC-0028
    48: UC_0047,           # insert UC-0047 before UC-0048
    52: UC_0051,           # insert UC-0051 before UC-0052
    54: UC_0053,           # insert UC-0053 before UC-0054
    56: UC_0055,           # insert UC-0055 before UC-0056
}


# ─────────────────────────────────────────────────────────────────────────────
# DATOS PARA RECONSTRUIR LAS MATRICES
# Formato: {new_uc_num: [NFR1, NFR2, NFR3, NFR4, NFR5, NFR6]}
#          {new_uc_num: [IRQ1, IRQ2, IRQ3, IRQ4, IRQ5, IRQ6, IRQ7]}
#          {new_uc_num: [OBJ1, OBJ2, OBJ3, OBJ4, OBJ5, OBJ6]}
#  'X' = X, '' = vacío
# ─────────────────────────────────────────────────────────────────────────────

# Primero definimos los datos ORIGINALES (old UC → data), luego renombramos
_nfr_old = {
    1: ['','','','','',''],
    2: ['X','','X','','',''],
    3: ['X','','','','',''],
    4: ['X','','','','',''],
    5: ['','','X','','',''],
    6: ['X','','','','',''],
    7: ['X','','','','',''],
    8: ['X','','','','',''],
    9: ['X','','','','',''],
    10: ['','','','','',''],
    11: ['','','X','','',''],
    12: ['','','X','','',''],
    13: ['X','X','','','',''],
    14: ['','','X','','',''],
    15: ['X','','','','X',''],
    16: ['','','X','','',''],
    17: ['','','X','','',''],
    18: ['X','X','','','',''],
    19: ['','','X','','',''],
    20: ['','','','','',''],
    21: ['','','','','',''],
    22: ['X','','','','',''],
    23: ['','','','','',''],
    24: ['X','','','','',''],
    25: ['X','X','','','',''],
    26: ['','','','','',''],
    27: ['X','','','','',''],
    28: ['X','','','','',''],
    29: ['','','X','','',''],
    30: ['','','X','','',''],
    31: ['','','X','','',''],
    32: ['','','X','','',''],
    33: ['X','','','','',''],
    34: ['','','X','','',''],
    35: ['X','','','','',''],
    36: ['X','X','','','',''],
    37: ['X','','','','',''],
    38: ['X','','','','',''],
    39: ['X','','','','',''],
    40: ['X','X','','','',''],
    41: ['','','X','','',''],
    42: ['','','X','','',''],
}
_irq_old = {
    1: ['','','','','','',''],
    2: ['X','','','','','',''],
    3: ['','','','','','',''],
    4: ['X','','','','','',''],
    5: ['X','','','','','',''],
    6: ['X','','','','','',''],
    7: ['X','','','','','',''],
    8: ['X','','','','','',''],
    9: ['X','','','','','',''],
    10: ['','','','','','',''],
    11: ['','X','','','','',''],
    12: ['','X','X','','','',''],
    13: ['','X','X','','','',''],
    14: ['','X','','','','',''],
    15: ['','X','','','','',''],
    16: ['','X','','','','',''],
    17: ['','X','','','','',''],
    18: ['','X','X','','','',''],
    19: ['','X','','','','',''],
    20: ['','X','','','','',''],
    21: ['','X','','','','',''],
    22: ['','X','','','','',''],
    23: ['','','','','','',''],
    24: ['','','','X','','',''],
    25: ['','','','X','','',''],
    26: ['','','','','','',''],
    27: ['','','','','X','',''],
    28: ['','','','','X','',''],
    29: ['','X','','','X','',''],
    30: ['','','','','','X',''],
    31: ['','','','','','X',''],
    32: ['','X','','','','',''],
    33: ['','','','','','','X'],
    34: ['','','','','','','X'],
    35: ['','','','','','','X'],
    36: ['','','','','','','X'],
    37: ['X','','','','','',''],
    38: ['X','','','','','',''],
    39: ['X','','','','','',''],
    40: ['','','','','','','X'],
    41: ['','','','','','X',''],
    42: ['','','','','','X',''],
}
_obj_old = {
    1: ['','','','','',''],
    2: ['X','','','','',''],
    3: ['','','','','',''],
    4: ['X','X','','','',''],
    5: ['X','','','','',''],
    6: ['X','','X','','',''],
    7: ['X','','X','','',''],
    8: ['X','','','','',''],
    9: ['X','','','','',''],
    10: ['','','','','',''],
    11: ['','','X','','',''],
    12: ['','X','X','','',''],
    13: ['','X','X','','',''],
    14: ['','','X','','',''],
    15: ['','X','X','','',''],
    16: ['','','X','','',''],
    17: ['','','X','','',''],
    18: ['','X','X','','',''],
    19: ['','','X','','',''],
    20: ['','','X','','',''],
    21: ['','','X','','',''],
    22: ['','X','X','','',''],
    23: ['','','','','',''],
    24: ['','X','','X','',''],
    25: ['','X','','X','',''],
    26: ['','','','','',''],
    27: ['','X','','X','',''],
    28: ['','X','','X','',''],
    29: ['','','X','','',''],
    30: ['','','X','','',''],
    31: ['','','X','','',''],
    32: ['','','X','','',''],
    33: ['','','X','X','',''],
    34: ['','','X','','',''],
    35: ['X','','X','','',''],
    36: ['','X','','X','',''],
    37: ['X','','','','',''],
    38: ['X','','','','',''],
    39: ['X','','','','',''],
    40: ['X','X','','','',''],
    41: ['','','X','','',''],
    42: ['','','X','','',''],
}

# Renombrar datos de viejos a nuevos números
NFR = {RENAME[k]: v for k, v in _nfr_old.items()}
IRQ = {RENAME[k]: v for k, v in _irq_old.items()}
OBJ = {RENAME[k]: v for k, v in _obj_old.items()}

# Agregar datos de las 15 nuevas UCs
NFR.update({
    2:  ['X','','','','',''],
    4:  ['X','','','','',''],
    7:  ['X','','','','',''],
    8:  ['','','X','','',''],
    9:  ['','','X','','',''],
    11: ['X','','','','',''],
    12: ['X','','','','',''],
    16: ['X','','','','',''],
    18: ['X','','','','',''],
    24: ['','','X','','',''],
    27: ['X','X','','','',''],
    47: ['X','X','','','',''],
    51: ['X','','','','',''],
    53: ['X','','','','X',''],
    55: ['X','X','','','',''],
})
IRQ.update({
    2:  ['X','','','','','','X'],
    4:  ['X','','','','','',''],
    7:  ['X','','','','','',''],
    8:  ['X','','','','','',''],
    9:  ['X','','','','','',''],
    11: ['X','','','','','','X'],
    12: ['X','','','','','',''],
    16: ['X','','','','','','X'],
    18: ['X','','','','','',''],
    24: ['','X','','','','',''],
    27: ['','X','','','X','',''],
    47: ['','X','','X','X','',''],
    51: ['X','','','','','',''],
    53: ['X','','','','','',''],
    55: ['','','','','X','','X'],
})
OBJ.update({
    2:  ['X','','X','','',''],
    4:  ['X','X','','','',''],
    7:  ['X','','','','',''],
    8:  ['X','X','','','',''],
    9:  ['X','','','','',''],
    11: ['X','','','','',''],
    12: ['X','','','','',''],
    16: ['X','','','','',''],
    18: ['X','','','','',''],
    24: ['','X','X','','',''],
    27: ['','X','X','','','X'],
    47: ['','X','','X','X',''],
    51: ['X','','X','','',''],
    53: ['X','','','','',''],
    55: ['X','X','','','',''],
})


# ─────────────────────────────────────────────────────────────────────────────
# GENERADORES DE MATRICES
# ─────────────────────────────────────────────────────────────────────────────

def matrix_uc_nfr(data):
    header = r"""\subsubsection{Matriz UC-NFR}

\begin{table}[H]
\centering
\small
\begin{tabular}{|p{2.2cm}|p{2.0cm}|p{2.0cm}|p{2.0cm}|p{2.0cm}|p{2.0cm}|p{2.0cm}|}
\hline
\textbf{ID} & \textbf{NFR-0001} & \textbf{NFR-0002} & \textbf{NFR-0003} & \textbf{NFR-0004} & \textbf{NFR-0005} & \textbf{NFR-0006} \\
\hline
\hline
"""
    rows = ''
    for n in sorted(data.keys()):
        cells = ' & '.join(data[n])
        rows += f'\\textbf{{UC-{n:04d}}} & {cells} \\\\\n\\hline\n'
    footer = r"""\end{tabular}
\caption{Matriz de rastreabilidad UC-NFR}
\label{tab:matriz-uc-nfr}
\end{table}

"""
    return header + rows + footer


def matrix_uc_irq(data):
    header = r"""\subsubsection{Matriz UC-IRQ}

{\setlength{\tabcolsep}{3pt}
\begin{table}[H]
\centering
\footnotesize
\begin{tabular}{|p{1.6cm}|p{1.55cm}|p{1.55cm}|p{1.55cm}|p{1.55cm}|p{1.55cm}|p{1.55cm}|p{1.55cm}|}
\hline
\textbf{ID} & \textbf{IRQ-0001} & \textbf{IRQ-0002} & \textbf{IRQ-0003} & \textbf{IRQ-0004} & \textbf{IRQ-0005} & \textbf{IRQ-0006} & \textbf{IRQ-0007} \\
\hline
\hline
"""
    rows = ''
    for n in sorted(data.keys()):
        cells = ' & '.join(data[n])
        rows += f'\\textbf{{UC-{n:04d}}} & {cells} \\\\\n\\hline\n'
    footer = r"""\end{tabular}
\caption{Matriz de rastreabilidad UC-IRQ}
\label{tab:matriz-uc-irq}
\end{table}}

"""
    return header + rows + footer


def matrix_uc_obj(data):
    header = r"""\subsubsection{Matriz UC-OBJ}

\begin{table}[H]
\centering
\small
\begin{tabular}{|p{2.2cm}|p{2.0cm}|p{2.0cm}|p{2.0cm}|p{2.0cm}|p{2.0cm}|p{2.0cm}|}
\hline
\textbf{ID} & \textbf{OBJ-0001} & \textbf{OBJ-0002} & \textbf{OBJ-0003} & \textbf{OBJ-0004} & \textbf{OBJ-0005} & \textbf{OBJ-0006} \\
\hline
\hline
"""
    rows = ''
    for n in sorted(data.keys()):
        cells = ' & '.join(data[n])
        rows += f'\\textbf{{UC-{n:04d}}} & {cells} \\\\\n\\hline\n'
    footer = r"""\end{tabular}
\caption{Matriz de rastreabilidad UC-OBJ}
\label{tab:matriz-uc-obj}
\end{table}

"""
    return header + rows + footer


# UC-UC matrix updated ranges  
UC_UC_TABLE = r"""\subsubsection{Matriz UC-UC}

La matriz UC-UC agrupa los 57 casos de uso en nueve paquetes funcionales y muestra las dependencias de ejecución entre ellos. Una X indica que el paquete de la fila requiere la funcionalidad del paquete de la columna para su correcto funcionamiento.

{\setlength{\tabcolsep}{2pt}
\begin{table}[H]
\centering
\footnotesize
\begin{tabular}{|p{2.6cm}|p{1.1cm}|p{1.1cm}|p{1.1cm}|p{1.1cm}|p{1.1cm}|p{1.1cm}|p{1.1cm}|p{1.1cm}|p{1.1cm}|}
\hline
\textbf{Paquete} & \textbf{Acceso} & \textbf{Docs} & \textbf{Versio\-nado} & \textbf{Firmas} & \textbf{Compar\-tir} & \textbf{Organ\-ización} & \textbf{Audit.} & \textbf{Admin} & \textbf{Notif.} \\
\hline
\hline
\textbf{Acceso\newline(01--18)} & --- & & & & & & & & \\
\hline
\textbf{Documentos\newline(19--28)} & X & --- & & & & & & & \\
\hline
\textbf{Versionado\newline(29--33)} & X & X & --- & & & & & & \\
\hline
\textbf{Firmas\newline(34--36)} & X & X & & --- & & & & & \\
\hline
\textbf{Compartir\newline(37--40)} & X & X & & & --- & & & & \\
\hline
\textbf{Organización\newline(41--44)} & X & X & & & & --- & & & \\
\hline
\textbf{Auditoría\newline(45--48)} & X & X & X & X & X & & --- & & \\
\hline
\textbf{Administración\newline(49--55)} & X & & & & & & X & --- & \\
\hline
\textbf{Notificaciones\newline(56--57)} & X & X & X & X & X & & & & --- \\
\hline
\end{tabular}
\caption{Matriz de rastreabilidad UC-UC (dependencias entre paquetes de casos de uso)}
\label{tab:matriz-uc-uc}
\end{table}}

"""


# ─────────────────────────────────────────────────────────────────────────────
# NUEVA PUML LISTING (updated in the document for the lstlisting block)
# ─────────────────────────────────────────────────────────────────────────────
NEW_PUML_LISTING = r"""\subsubsection{Diagramas de casos de uso}

\textbf{NOTA}: Los diagramas se incluirán en formato PlantUML. Ejecutar los archivos .puml separados para generar las imágenes.

\begin{lstlisting}[caption={Diagrama general de casos de uso - Ver archivo diagramas/usecase\_general.puml}]
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Usuario" as USER
actor "Administrador" as ADMIN
actor "Smart Contract" as SC
actor "IPFS Cluster" as IPFS
actor "Sistema Email" as EMAIL
actor "Público" as PUB

rectangle "DocumentChain" {
  package "Gestión de Acceso (01-18)" {
    usecase "UC-0001: Registrar Usuario" as UC1
    usecase "UC-0002: Registrar con Wallet" as UC2
    usecase "UC-0003: Iniciar Sesión" as UC3
    usecase "UC-0004: Iniciar Sesión con Wallet" as UC4
    usecase "UC-0005: Cerrar Sesión" as UC5
    usecase "UC-0006: Conectar Wallet" as UC6
    usecase "UC-0007: Eliminar Wallet" as UC7
    usecase "UC-0008: Wallet Principal" as UC8
    usecase "UC-0009: Renombrar Wallet" as UC9
    usecase "UC-0010: Gestionar Perfil" as UC10
    usecase "UC-0011: Desactivar Cuenta" as UC11
    usecase "UC-0012: Reactivar Cuenta" as UC12
    usecase "UC-0013: Cambiar Contraseña" as UC13
    usecase "UC-0014: Recuperar Contraseña" as UC14
    usecase "UC-0015: Verificar Email" as UC15
    usecase "UC-0016: Reenviar Verificación" as UC16
    usecase "UC-0017: Configurar 2FA" as UC17
    usecase "UC-0018: Regenerar Backup 2FA" as UC18
  }
  package "Gestión de Documentos (19-28)" {
    usecase "UC-0019: Subir Documento" as UC19
    usecase "UC-0020: Listar Documentos" as UC20
    usecase "UC-0021: Ver Detalle" as UC21
    usecase "UC-0022: Descargar Documento" as UC22
    usecase "UC-0023: Archivar Documento" as UC23
    usecase "UC-0024: Desarchivar Documento" as UC24
    usecase "UC-0025: Eliminar Documento" as UC25
    usecase "UC-0026: Editar Metadatos" as UC26
    usecase "UC-0027: Transferir Documento" as UC27
    usecase "UC-0028: Buscar Documentos" as UC28
  }
  package "Versionado (29-33)" {
    usecase "UC-0029: Crear Nueva Versión" as UC29
    usecase "UC-0030: Listar Versiones" as UC30
    usecase "UC-0031: Versión Operativa" as UC31
    usecase "UC-0032: Restaurar Versión" as UC32
    usecase "UC-0033: Descargar Versión" as UC33
  }
  package "Firmas (34-36)" {
    usecase "UC-0034: Firmar Documento" as UC34
    usecase "UC-0035: Ver Firmas" as UC35
    usecase "UC-0036: Verificar Firma" as UC36
  }
  package "Compartición (37-40)" {
    usecase "UC-0037: Compartir Documento" as UC37
    usecase "UC-0038: Modificar Permisos" as UC38
    usecase "UC-0039: Revocar Acceso" as UC39
    usecase "UC-0040: Docs. Compartidos" as UC40
  }
  package "Organización (41-44)" {
    usecase "UC-0041: Gestionar Carpetas" as UC41
    usecase "UC-0042: Gestionar Categorías" as UC42
    usecase "UC-0043: Etiquetar Documento" as UC43
    usecase "UC-0044: Ver Timeline" as UC44
  }
  package "Auditoría y Estadísticas (45-48)" {
    usecase "UC-0045: Estadísticas Propias" as UC45
    usecase "UC-0046: Estadísticas Globales" as UC46
    usecase "UC-0047: Verificar Autenticidad" as UC47
    usecase "UC-0048: Auditoría Blockchain" as UC48
  }
  package "Administración (49-55)" {
    usecase "UC-0049: Listar Usuarios" as UC49
    usecase "UC-0050: Gestionar Roles" as UC50
    usecase "UC-0051: Crear Admin" as UC51
    usecase "UC-0052: Suspender Usuario" as UC52
    usecase "UC-0053: Eliminar Cuenta" as UC53
    usecase "UC-0054: Pausar Sistema" as UC54
    usecase "UC-0055: Reanudar Sistema" as UC55
  }
  package "Notificaciones (56-57)" {
    usecase "UC-0056: Ver Notificaciones" as UC56
    usecase "UC-0057: Config. Preferencias" as UC57
  }
}

USER --> UC1 ; USER --> UC2 ; USER --> UC3 ; USER --> UC4 ; USER --> UC5
USER --> UC6 ; USER --> UC7 ; USER --> UC8 ; USER --> UC9 ; USER --> UC10
USER --> UC11 ; USER --> UC12 ; USER --> UC13 ; USER --> UC14 ; USER --> UC15
USER --> UC16 ; USER --> UC17 ; USER --> UC18
USER --> UC19 ; USER --> UC20 ; USER --> UC21 ; USER --> UC22 ; USER --> UC23
USER --> UC24 ; USER --> UC25 ; USER --> UC26 ; USER --> UC27 ; USER --> UC28
USER --> UC29 ; USER --> UC30 ; USER --> UC31 ; USER --> UC32 ; USER --> UC33
USER --> UC34 ; USER --> UC35 ; USER --> UC36
USER --> UC37 ; USER --> UC38 ; USER --> UC39 ; USER --> UC40
USER --> UC41 ; USER --> UC42 ; USER --> UC43 ; USER --> UC44
USER --> UC45 ; USER --> UC56 ; USER --> UC57
PUB --> UC47

ADMIN --> UC46 ; ADMIN --> UC48
ADMIN --> UC49 ; ADMIN --> UC50 ; ADMIN --> UC51 ; ADMIN --> UC52
ADMIN --> UC53 ; ADMIN --> UC54 ; ADMIN --> UC55

UC1 ..> SC : registra ; UC1 ..> EMAIL : envía verificación
UC2 ..> SC : verifica firma ; UC2 ..> EMAIL : envía verificación
UC4 ..> SC : verifica desafío
UC6 ..> SC : verifica firma
UC19 ..> IPFS : almacena ; UC19 ..> SC : registra
UC22 ..> IPFS : descarga
UC27 ..> SC : transferOwnership
UC29 ..> IPFS : almacena ; UC29 ..> SC : registra
UC34 ..> SC : registra firma
UC37 ..> SC : otorga permisos
UC39 ..> SC : revoca permisos
UC47 ..> SC : consulta ; UC47 ..> IPFS : verifica
UC54 ..> SC : pause() ; UC55 ..> SC : unpause()
@enduml
\end{lstlisting}

\textit{Los diagramas detallados de cada paquete se encuentran en los archivos PlantUML separados en la carpeta diagramas/.}

\textbf{NOTA PARA COMPILACIÓN}: Coloque aquí las imágenes generadas desde PlantUML. Ejemplo:

\begin{figure}[H]
    \centering
    \includegraphics[width=\linewidth]{diagramas/usecase-general.png}
    \caption{Diagrama general de casos de uso del sistema}
    \label{fig:usecase-general}
\end{figure}

\subsubsection{Casos de Uso Detallados}

A continuación se detallan los casos de uso más relevantes del sistema. Debido a la extensión, se muestran los casos de uso core. El resto sigue la misma estructura.
"""

# ─────────────────────────────────────────────────────────────────────────────
# EXPANSIÓN DE UC-0056 (Ver Notificaciones) — añadir acciones mark/delete
# ─────────────────────────────────────────────────────────────────────────────
# Se busca la cadena de la secuencia normal de UC-0056 y se expande
UC56_EXTRA_NORMAL = (
    r"\textbf{Paso 1:} El usuario accede a la sección ``Notificaciones''.\newline"
    r"\textbf{Paso 2:} El sistema carga las notificaciones del usuario con paginación "
    r"(\texttt{GET /api/notifications}) mostrando tipo, mensaje, fecha y estado de lectura.\newline"
    r"\textbf{Paso 3:} El usuario puede filtrar por tipo o estado (leídas/no leídas).\newline"
    r"\textbf{Paso 4:} El usuario hace clic en una notificación específica: "
    r"el frontend envía \texttt{POST /api/notifications/:id/read} y la marca como leída.\newline"
    r"\textbf{Paso 5:} El usuario puede marcar todas como leídas: "
    r"\texttt{POST /api/notifications/mark-all-read}.\newline"
    r"\textbf{Paso 6:} El usuario puede eliminar una notificación: "
    r"\texttt{DELETE /api/notifications/:id}.\newline"
    r"\textbf{Paso 7:} El contador de notificaciones no leídas (\texttt{GET /api/notifications/unread-count}) "
    r"se actualiza en tiempo real mediante WebSocket."
)

# ─────────────────────────────────────────────────────────────────────────────
# APPLY ALL CHANGES
# ─────────────────────────────────────────────────────────────────────────────

print("Leyendo AnexoI_Especificaciones.tex...")
with io.open('AnexoI_Especificaciones.tex', 'r', encoding='utf-8') as f:
    content = f.read()

# STEP 1: Renumber UC references
print("Paso 1: Renumerando referencias UC...")
def replace_uc(m):
    n = int(m.group(1))
    if n in RENAME:
        return f'UC-NNNN{RENAME[n]:04d}'
    return m.group(0)

content = re.sub(r'UC-(\d{4})', replace_uc, content)
content = content.replace('UC-NNNN', 'UC-')

# STEP 2: Fix "42 casos de uso" → "57 casos de uso"
print("Paso 2: Actualizando recuento de casos de uso...")
content = re.sub(r'\b42 casos de uso\b', '57 casos de uso', content)
content = re.sub(r'\blos 42 casos\b', 'los 57 casos', content)

# STEP 3: Insert new UC specs at right positions
print("Paso 3: Insertando nuevas fichas de caso de uso...")
for target_num, new_text in sorted(INSERTIONS.items()):
    marker = f'\\subsubsection{{UC-{target_num:04d}:'
    idx = content.find(marker)
    if idx == -1:
        print(f"  AVISO: No se encontró marcador para UC-{target_num:04d}")
        continue
    content = content[:idx] + new_text + content[idx:]
    print(f"  Insertados UCs antes de UC-{target_num:04d}")

# STEP 4: Expand UC-0056 sequence normal (already has mark-as-read/delete,
# but we enhance with explicit API endpoint references)
print("Paso 4: Expandiendo UC-0056 (Ver Notificaciones)...")
old_seq56 = (
    "\\textbf{Secuencia normal} &\n"
    "\\textbf{Paso 1:} El usuario hace clic en el icono de campana en la barra de navegación, que muestra el contador de notificaciones no leídas.\\newline\n"
    "\\textbf{Paso 2:} El frontend envía con parámetros de paginación y filtro de estado (todas, no leídas).\\newline\n"
    "\\textbf{Paso 3:} El backend consulta la base de datos filtrando por userId y devuelve las notificaciones ordenadas por fecha descendente.\\newline\n"
    "\\textbf{Paso 4:} El frontend renderiza el panel de notificaciones con tipo (icono), título, descripción, tiempo relativo y estado de lectura.\\newline\n"
    "\\textbf{Paso 5:} El usuario hace clic en una notificación concreta.\\newline\n"
    "\\textbf{Paso 6:} El frontend envía para marcarla como leída.\\newline\n"
    "\\textbf{Paso 7:} El frontend navega al elemento relacionado (documento, versión o firma).\\newline\n"
    "\\textbf{Paso 8:} El usuario puede marcar todas las notificaciones como leídas con el botón ``Marcar todas como leídas''.\\newline\n"
    "\\textbf{Paso 9:} El usuario puede eliminar notificaciones individuales o limpiar todas las leídas.\\\\"
)
new_seq56 = (
    "\\textbf{Secuencia normal} & "
    + UC56_EXTRA_NORMAL + "\\\\"
)
if old_seq56 in content:
    content = content.replace(old_seq56, new_seq56, 1)
    print("  UC-0056 expandido correctamente.")
else:
    print("  AVISO: Texto original de UC-0056 no encontrado; se omite expansión.")

# STEP 5: Replace UC diagram listing (replace from section header to first UC spec)
print("Paso 5: Actualizando listado PUML en el documento...")
listing_start = content.find(r'\subsubsection{Diagramas de casos de uso}')
# Cut just before the first UC spec (UC-0001) so intro text is taken from NEW_PUML_LISTING
listing_end = content.find(r'\subsubsection{UC-0001:')
if listing_start != -1 and listing_end != -1:
    content = content[:listing_start] + NEW_PUML_LISTING + '\n' + content[listing_end:]
    print("  Listado PUML actualizado.")
else:
    print(f"  AVISO: No se encontraron marcadores del listado PUML (start={listing_start}, end={listing_end})")

# STEP 6: Rebuild UC-NFR matrix
print("Paso 6: Reconstruyendo Matriz UC-NFR...")
nfr_start = content.find(r'\subsubsection{Matriz UC-NFR}')
nfr_end_marker = r'\subsubsection{Matriz UC-IRQ}'
nfr_end = content.find(nfr_end_marker)
if nfr_start != -1 and nfr_end != -1:
    content = content[:nfr_start] + matrix_uc_nfr(NFR) + content[nfr_end:]
    print("  Matriz UC-NFR reconstruida.")
else:
    print("  AVISO: No se encontró la Matriz UC-NFR")

# STEP 7: Rebuild UC-IRQ matrix
print("Paso 7: Reconstruyendo Matriz UC-IRQ...")
irq_start = content.find(r'\subsubsection{Matriz UC-IRQ}')
irq_end_marker = r'\subsubsection{Matriz UC-UC}'
irq_end = content.find(irq_end_marker)
if irq_start != -1 and irq_end != -1:
    content = content[:irq_start] + matrix_uc_irq(IRQ) + content[irq_end:]
    print("  Matriz UC-IRQ reconstruida.")
else:
    print("  AVISO: No se encontró la Matriz UC-IRQ")

# STEP 8: Rebuild UC-UC matrix
print("Paso 8: Reconstruyendo Matriz UC-UC...")
ucuc_start = content.find(r'\subsubsection{Matriz UC-UC}')
ucuc_end_marker = r'\subsubsection{Matriz UC-OBJ}'
ucuc_end = content.find(ucuc_end_marker)
if ucuc_start != -1 and ucuc_end != -1:
    content = content[:ucuc_start] + UC_UC_TABLE + content[ucuc_end:]
    print("  Matriz UC-UC reconstruida.")
else:
    print("  AVISO: No se encontró la Matriz UC-UC")

# STEP 9: Rebuild UC-OBJ matrix
print("Paso 9: Reconstruyendo Matriz UC-OBJ...")
obj_start = content.find(r'\subsubsection{Matriz UC-OBJ}')
obj_end_marker = r'\section{Propuesta arquitectónica}'
obj_end = content.find(obj_end_marker)
if obj_start != -1 and obj_end != -1:
    content = content[:obj_start] + matrix_uc_obj(OBJ) + content[obj_end:]
    print("  Matriz UC-OBJ reconstruida.")
else:
    print("  AVISO: No se encontró la Matriz UC-OBJ")

# STEP 10: Write result
print("Paso 10: Escribiendo archivo resultante...")
with io.open('AnexoI_Especificaciones.tex', 'w', encoding='utf-8') as f:
    f.write(content)

# Verify
with io.open('AnexoI_Especificaciones.tex', 'r', encoding='utf-8') as f:
    result = f.read()

import collections
uc_counts = collections.Counter(re.findall(r'\\subsubsection\{UC-\d{4}:', result))
print(f"\nVerificación:")
print(f"  Total subsubsections UC: {len(uc_counts)}")
print(f"  UC numbers present: {sorted([int(k[16:20]) for k in uc_counts.keys()])}")
print(f"  Total lines: {result.count(chr(10))}")
print("DONE.")
