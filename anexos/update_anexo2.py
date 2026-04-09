"""
Script de actualización de AnexoII_AnalisisDiseno.tex
- Renumera UC-0001..UC-0042 → nueva numeración (mismo mapa que AnexoI)
- Corrige inconsistencias de UC en la sección "Diagramas de caso de uso-diseño"
- Corrige UC-0026 Transferir → UC-0027 (mismatch histórico AnexoI/AnexoII)
- Inserta 15 nuevos diagramas de secuencia con código PlantUML
- Actualiza "Matriz UC -- Clases de análisis" con nuevos grupos
"""

import re, io

# ─────────────────────────────────────────────────────────────────────────────
# MAPA DE RENUMERACIÓN (idéntico al de AnexoI)
# ─────────────────────────────────────────────────────────────────────────────
RENAME = {
    1:1,  2:3,  3:5,  4:6,  5:10,  6:13,  7:14,  8:15,  9:17,
    10:19, 11:20, 12:21, 13:22, 14:23, 15:25, 16:26, 17:28,
    18:29, 19:30, 20:31, 21:32, 22:33, 23:34, 24:35, 25:36,
    26:37, 27:38, 28:39, 29:40, 30:41, 31:42, 32:43, 33:44,
    34:45, 35:46, 36:48, 37:49, 38:50, 39:52, 40:54, 41:56, 42:57,
}


# ─────────────────────────────────────────────────────────────────────────────
# HELPER
# ─────────────────────────────────────────────────────────────────────────────
def seq_block(num, name, slug, puml_body):
    """Genera un bloque de diagrama de secuencia (lstlisting + figure)."""
    return (
        f'\\subsubsection{{Secuencia: {name}}}\n\n'
        f'\\begin{{lstlisting}}[caption={{Código PlantUML: seq-{slug}.puml}}]\n'
        f'{puml_body}\n'
        f'\\end{{lstlisting}}\n\n'
        f'\\begin{{figure}}[H]\n'
        f'    \\centering\n'
        f'    \\includegraphics[width=0.9\\textwidth]{{diagramas/seq-{slug}.png}}\n'
        f'    \\caption{{Diagrama de secuencia UC-{num:04d}: {name}}}\n'
        f'    \\label{{fig:seq-{slug}}}\n'
        f'\\end{{figure}}\n\n'
    )


# ─────────────────────────────────────────────────────────────────────────────
# DIAGRAMAS PLANTÚML DE LOS 15 NUEVOS UCs
# ─────────────────────────────────────────────────────────────────────────────

PUML_HEADER = (
    "@startuml\n"
    "skinparam sequenceArrowThickness 2\n"
    "skinparam roundcorner 5\n"
    "skinparam sequenceParticipant underline\n"
    "skinparam monochrome true\n"
)

UC0002_PUML = PUML_HEADER + """
actor "Usuario" as U
boundary "Frontend\\n(React/MetaMask)" as FE
control "AuthController" as AC
entity "WalletService" as WS
entity "UserRepository" as UR
entity "EmailService" as ES

U -> FE: Clic "Registrar con Wallet"
FE -> FE: MetaMask.requestAccount()
FE -> AC: POST /auth/prepare-register {walletAddress}
AC -> WS: generateChallenge(walletAddress)
WS --> AC: {challenge, nonce}
AC --> FE: {challenge, nonce}
FE -> FE: MetaMask.eth_signTypedData_v4(challenge)
U -> FE: Introduce username, email, nombre
FE -> AC: POST /auth/register-wallet {walletAddress, signature, userData}
AC -> WS: verifySignature(challenge, signature)
WS --> AC: firma válida
AC -> AC: generateECDHKeyPair()
AC -> AC: deriveKeyFromWallet(walletAddress)
AC -> AC: encryptPrivateKey(privKey, derivedKey)
AC -> AC: generateRecoveryKey()
AC -> UR: create(user, wallet, encryptedPrivKey, recoveryKeyHash)
UR --> AC: user creado
AC -> ES: sendVerificationEmail(email)
AC --> FE: {jwt, refreshToken, recoveryKey}
FE --> U: Muestra recovery key (una única vez)
@enduml"""

UC0004_PUML = PUML_HEADER + """
actor "Usuario" as U
boundary "Frontend\\n(React/MetaMask)" as FE
control "AuthController" as AC
entity "WalletService" as WS
entity "UserRepository" as UR

U -> FE: Clic "Iniciar sesión con Wallet"
FE -> FE: MetaMask.requestAccount() → walletAddress
FE -> AC: GET /auth/challenge/:walletAddress
AC -> WS: generateNonce(walletAddress)
WS --> AC: {nonce, expiresAt}
AC --> FE: {challenge}
FE -> FE: MetaMask.eth_signTypedData_v4(challenge)
FE -> AC: POST /auth/wallet-login {walletAddress, signature}
AC -> WS: verifySignature(challenge, signature, walletAddress)
WS --> AC: firma válida
AC -> UR: findByWalletAddress(walletAddress)
UR --> AC: user {id, status, has2FA}
alt Usuario suspendido
    AC --> FE: 403 Cuenta suspendida
else 2FA activo
    AC --> FE: {tempToken, requires2FA: true}
    FE --> U: Solicita código TOTP
else Login directo
    AC -> AC: generateJWT + refreshToken
    AC --> FE: {jwt, refreshToken}
    FE --> U: Dashboard
end
@enduml"""

UC0007_PUML = PUML_HEADER + """
actor "Usuario" as U
boundary "Frontend" as FE
control "WalletController" as WC
entity "WalletService" as WS
entity "UserRepository" as UR

U -> FE: Clic "Eliminar wallet"
FE -> WC: DELETE /api/wallets/:walletId
WC -> WS: checkDeletableWallet(userId, walletId)
WS -> UR: countAuthMethods(userId)
UR --> WS: count > 1
WS --> WC: pueden eliminarse
WC -> FE: Solicita confirmación
U -> FE: Confirma eliminación
FE -> WC: DELETE /api/wallets/:walletId (confirmado)
WC -> WS: deleteWallet(walletId)
WS -> UR: deleteWallet(walletId)
UR --> WS: OK
WS --> WC: wallet eliminada
WC --> FE: 200 {message: "Wallet eliminada"}
FE --> U: Lista de wallets actualizada
@enduml"""

UC0008_PUML = PUML_HEADER + """
actor "Usuario" as U
boundary "Frontend" as FE
control "WalletController" as WC
entity "WalletService" as WS
entity "UserRepository" as UR

U -> FE: Clic "Establecer como principal"
FE -> WC: PUT /api/wallets/:walletId/primary
WC -> WS: setPrimaryWallet(userId, walletId)
WS -> UR: clearPrimaryFlag(userId)
UR --> WS: OK
WS -> UR: setPrimary(walletId, true)
UR --> WS: OK
WS --> WC: {walletId, isPrimary: true}
WC --> FE: 200 {walletId, isPrimary: true}
FE --> U: Indicador visual de wallet principal actualizado
@enduml"""

UC0009_PUML = PUML_HEADER + """
actor "Usuario" as U
boundary "Frontend" as FE
control "WalletController" as WC
entity "WalletService" as WS
entity "UserRepository" as UR

U -> FE: Edita etiqueta de wallet
FE -> WC: PUT /api/wallets/:walletId/label {label}
WC -> WS: setWalletLabel(walletId, label, userId)
WS -> WS: validateLabel(label)
WS -> UR: updateLabel(walletId, label)
UR --> WS: OK
WS --> WC: {walletId, label}
WC --> FE: 200 {walletId, label}
FE --> U: Etiqueta actualizada junto a la dirección de wallet
@enduml"""

UC0011_PUML = PUML_HEADER + """
actor "Usuario" as U
boundary "Frontend" as FE
control "UserController" as UC
entity "UserService" as US
entity "BlockchainAdminService" as BAS
entity "Smart Contract" as SC
entity "SessionService" as SS

U -> FE: Clic "Desactivar mi cuenta"
FE -> FE: Muestra diálogo de confirmación
U -> FE: Confirma (opcionalmente motivo)
FE -> UC: PUT /api/users/me/suspend {reason}
UC -> US: suspendOwnAccount(userId, reason)
US -> US: validateNotAlreadySuspended(userId)
US -> US: markSuspended(userId, isSuspended=true)
US -> BAS: suspendUserOnChain(walletAddresses)
BAS -> SC: suspendUser(walletAddress) x wallets
SC --> BAS: TX confirmada
BAS --> US: OK
US -> SS: invalidateAllSessions(userId)
SS --> US: N sesiones invalidadas
US --> UC: cuenta suspendida
UC --> FE: 200 {suspended: true}
FE --> U: Desconexión y pantalla de cuenta suspendida
@enduml"""

UC0012_PUML = PUML_HEADER + """
actor "Usuario" as U
boundary "Frontend" as FE
control "AuthController" as AC
entity "UserService" as US
entity "BlockchainAdminService" as BAS
entity "Smart Contract" as SC

U -> FE: Introduce credenciales en login
FE -> AC: POST /auth/login {credentials}
AC -> US: checkSuspension(userId)
US --> AC: {isSuspended: true, selfSuspended: true}
AC --> FE: {isSuspended, selfSuspended, tempToken}
FE --> U: Muestra opción "Reactivar mi cuenta"
U -> FE: Clic "Reactivar"
FE -> AC: PUT /api/users/me/unsuspend (bearer: tempToken)
AC -> US: reactivateOwnAccount(userId)
US -> US: markSuspended(userId, isSuspended=false)
US -> BAS: unsuspendUserOnChain(walletAddresses)
BAS -> SC: unsuspendUser(walletAddress) x wallets
SC --> BAS: TX confirmada
BAS --> US: OK
US --> AC: cuenta reactivada
AC -> AC: generateJWT + refreshToken (completos)
AC --> FE: {jwt, refreshToken}
FE --> U: Dashboard
@enduml"""

UC0016_PUML = PUML_HEADER + """
actor "Usuario" as U
boundary "Frontend" as FE
control "EmailController" as EC
entity "EmailService" as ES
entity "UserRepository" as UR

U -> FE: Clic "Reenviar email de verificación"
FE -> EC: POST /email/resend-verification
EC -> UR: getVerificationStatus(userId)
UR --> EC: {emailVerified: false}
EC -> EC: checkRateLimit(userId)
EC -> ES: invalidatePreviousToken(userId)
ES -> UR: deleteVerificationTokens(userId)
ES -> ES: generateVerificationToken()
ES -> UR: saveVerificationToken(userId, token, expiresAt)
ES -> ES: sendEmail(email, verificationLink)
ES --> EC: email enviado
EC --> FE: 200 {message: "Email enviado"}
FE --> U: Aviso "Se ha reenviado el email"
@enduml"""

UC0018_PUML = PUML_HEADER + """
actor "Usuario" as U
boundary "Frontend" as FE
control "AuthController" as AC
entity "TwoFactorService" as TFS
entity "UserRepository" as UR

U -> FE: Clic "Regenerar códigos de respaldo"
FE -> FE: Muestra advertencia de invalidación
U -> FE: Confirma
FE -> AC: POST /auth/2fa/regenerate-backup-codes
AC -> TFS: regenerateBackupCodes(userId)
TFS -> TFS: checkTwoFactorEnabled(userId)
TFS -> TFS: generateBackupCodes() → 10 códigos
TFS -> TFS: hashCodes(codes, argon2id)
TFS -> UR: replaceBackupCodes(userId, hashedCodes)
UR --> TFS: OK (anteriores invalidados)
TFS --> AC: plaintextCodes[10]
AC --> FE: {backupCodes: [...]}
FE --> U: Muestra 10 códigos en texto plano (única vez)
U -> FE: Confirma haberlos guardado
@enduml"""

UC0024_PUML = PUML_HEADER + """
actor "Usuario" as U
boundary "Frontend\\n(MetaMask)" as FE
control "DocumentController" as DC
entity "DocumentService" as DS
entity "BlockchainService" as BS
entity "Smart Contract" as SC
entity "PostgreSQL" as DB

U -> FE: Selecciona documento archivado → "Desarchivar"
FE -> DC: POST /api/documents/:id/archive/prepare
DC -> DS: prepareArchiveToggle(docId, userId, archived=false)
DS -> DB: findDocument(docId)
DB --> DS: {docId, blockchainId, archived: true}
DS -> BS: buildSetArchiveStatusTx(blockchainId, false)
BS --> DS: {txData, gasEstimate}
DS --> DC: {txData}
DC --> FE: {txData}
FE -> FE: MetaMask.sendTransaction(txData)
FE -> DC: POST /api/documents/:id/archive/confirm {txHash}
DC -> DS: updateStatus(docId, TX_SUBMITTED, txHash)
DS -> DB: update(docId, {status: TX_SUBMITTED, txHash})
SC --> BS: evento ArchiveStatusChanged(blockchainId, false)
BS -> DS: onArchiveStatusChanged(blockchainId, false)
DS -> DB: update(docId, {archived: false, status: SYNCED})
DB --> DS: OK
FE --> U: Documento visible en lista activa
@enduml"""

UC0026_PUML = PUML_HEADER + """
actor "Usuario" as U
boundary "Frontend" as FE
control "DocumentController" as DC
entity "DocumentService" as DS
entity "DocumentRepository" as DR

U -> FE: Edita metadatos (nombre, descripción, tags)
FE -> DC: PUT /api/documents/:id/metadata {name, description, tags}
DC -> DS: updateMetadata(docId, userId, {name, description, tags})
DS -> DR: findOwner(docId)
DR --> DS: {ownerId}
DS -> DS: validateOwnership(userId, ownerId)
DS -> DR: update(docId, {name, description, tags, updatedAt})
DR --> DS: updatedDocument
DS -> DS: addTimelineEntry(docId, METADATA_UPDATED)
DS --> DC: updatedDocument
DC --> FE: 200 {document}
FE --> U: Metadatos actualizados en la vista de detalle
@enduml"""

UC0047_PUML = PUML_HEADER + """
actor "Público" as PUB
boundary "Frontend\\n(Público)" as FE
control "VerificationController" as VC
entity "BlockchainService" as BS
entity "IpfsService" as IPFS
entity "Smart Contract" as SC

PUB -> FE: Accede a /verify
FE --> PUB: Formulario (archivo / CID IPFS / ID blockchain)

alt Verificar por archivo
    PUB -> FE: Sube el archivo
    FE -> VC: POST /api/verification/file {file}
    VC -> VC: calculateSHA256(file) → hash
    VC -> BS: queryByHash(hash)
else Verificar por CID IPFS
    PUB -> FE: Introduce CID
    FE -> VC: POST /api/verification/ipfs {cid}
    VC -> IPFS: getFileMeta(cid)
    IPFS --> VC: {hash}
    VC -> BS: queryByHash(hash)
else Verificar por ID blockchain
    PUB -> FE: Introduce blockchainId
    FE -> VC: POST /api/verification/blockchain {blockchainId}
    VC -> BS: queryById(blockchainId)
end

BS -> SC: getDocument(id / hash)
SC --> BS: {owner, timestamp, versions, archived}
BS --> VC: {found, hashMatch, owner, registeredAt}
VC --> FE: {status, owner, registeredAt, versions, archived}
FE --> PUB: Resultado con semáforo visual
@enduml"""

UC0051_PUML = PUML_HEADER + """
actor "Administrador" as ADMIN
boundary "Frontend\\n(Admin)" as FE
control "AdminController" as AC
entity "AdminUserService" as AUS
entity "UserRepository" as UR
entity "EmailService" as ES

ADMIN -> FE: Formulario "Crear Administrador"
ADMIN -> FE: Introduce username, email, contraseña, nombre
FE -> AC: POST /api/admin/users {username, email, password, name, role: ADMIN}
AC -> AUS: createAdminUser({username, email, password, name})
AUS -> AUS: validateUniqueConstraints(username, email)
AUS -> AUS: hashPassword(password, argon2id)
AUS -> AUS: generateECDHKeyPair()
AUS -> AUS: generateRecoveryKey()
AUS -> UR: create({username, email, passwordHash, role: ADMIN, publicKey, encryptedPrivKey, recoveryKeyHash})
UR --> AUS: newUser
AUS -> ES: sendWelcomeEmail(email, username)
AUS --> AC: {newUser, recoveryKeyPlaintext}
AC --> FE: 201 {userId, recoveryKey}
FE --> ADMIN: Muestra recovery key del nuevo admin (única vez)
@enduml"""

UC0053_PUML = PUML_HEADER + """
actor "Administrador" as ADMIN
boundary "Frontend\\n(Admin)" as FE
control "AdminController" as AC
entity "AdminUserService" as AUS
entity "UserRepository" as UR
entity "BlockchainAdminService" as BAS

ADMIN -> FE: Selecciona usuario → "Eliminar cuenta"
FE -> FE: Muestra advertencia de irreversibilidad
ADMIN -> FE: Confirma eliminación
FE -> AC: DELETE /api/admin/users/:userId
AC -> AUS: checkNotSelfDelete(adminId, userId)
AUS --> AC: OK (no es auto-eliminación)
AC -> AUS: deleteUser(userId)
AUS -> UR: deleteUserCascade(userId)
note right of UR: Elimina en cascada:\nsessions, tokens, wallets,\nfirmas, comparticiones,\ndocumentos propios
UR --> AUS: eliminado
AUS -> BAS: revokeAllWallets(userId)
BAS --> AUS: OK
AUS --> AC: usuario eliminado
AC --> FE: 200 {message: "Usuario eliminado"}
FE --> ADMIN: Listado de usuarios actualizado
@enduml"""

UC0055_PUML = PUML_HEADER + """
actor "Administrador" as ADMIN
boundary "Frontend\\n(Admin)" as FE
control "AdminController" as AC
entity "SystemService" as SS
entity "Smart Contract" as SC
entity "NotificationService" as NS

ADMIN -> FE: Panel Admin → "Estado del Sistema: PAUSADO"
ADMIN -> FE: Clic "Reanudar Sistema"
FE -> FE: Muestra diálogo de confirmación
ADMIN -> FE: Confirma (± mensaje de reanudación)
FE -> AC: POST /api/admin/system/unpause {message?}
AC -> SS: unpauseSystem(adminId, message)
SS -> SC: unpause()
SC --> SS: TX confirmada (estado: ACTIVO)
SS -> SS: updateSystemConfig(paused=false)
SS -> NS: broadcastSystemResumed(message)
NS --> SS: N usuarios notificados
SS --> AC: {paused: false, resumedAt, resumedBy}
AC --> FE: 200 {paused: false}
FE --> ADMIN: Indicador "Sistema ACTIVO"
@enduml"""


# ─────────────────────────────────────────────────────────────────────────────
# BLOQUES COMPLETOS DE SECUENCIA
# ─────────────────────────────────────────────────────────────────────────────

SEQ_UC0002 = seq_block(2, "Registrar Usuario con Wallet", "register-wallet", UC0002_PUML)
SEQ_UC0004 = seq_block(4, "Iniciar Sesión con Wallet", "login-wallet", UC0004_PUML)
SEQ_UC0007 = seq_block(7, "Eliminar Wallet", "delete-wallet", UC0007_PUML)
SEQ_UC0008 = seq_block(8, "Establecer Wallet Principal", "primary-wallet", UC0008_PUML)
SEQ_UC0009 = seq_block(9, "Renombrar/Etiquetar Wallet", "label-wallet", UC0009_PUML)
SEQ_UC0011 = seq_block(11, "Desactivar Propia Cuenta", "self-suspend", UC0011_PUML)
SEQ_UC0012 = seq_block(12, "Reactivar Propia Cuenta", "self-unsuspend", UC0012_PUML)
SEQ_UC0016 = seq_block(16, "Reenviar Email de Verificación", "resend-verification", UC0016_PUML)
SEQ_UC0018 = seq_block(18, "Regenerar Códigos de Backup 2FA", "regen-backup-2fa", UC0018_PUML)
SEQ_UC0024 = seq_block(24, "Desarchivar Documento", "unarchive", UC0024_PUML)
SEQ_UC0026 = seq_block(26, "Editar Metadatos de Documento", "edit-metadata", UC0026_PUML)
SEQ_UC0047 = seq_block(47, "Verificar Autenticidad de Documento", "verify-authenticity", UC0047_PUML)
SEQ_UC0051 = seq_block(51, "Crear Usuario Administrador", "create-admin", UC0051_PUML)
SEQ_UC0053 = seq_block(53, "Eliminar Cuenta de Usuario (Admin)", "delete-user-admin", UC0053_PUML)
SEQ_UC0055 = seq_block(55, "Reanudar Sistema", "resume-system", UC0055_PUML)


# ─────────────────────────────────────────────────────────────────────────────
# NUEVA MATRIZ UC -- Clases de análisis (con grupos actualizados)
# ─────────────────────────────────────────────────────────────────────────────
NEW_UC_CLASS_MATRIX = r"""\subsection{Matriz UC -- Clases de análisis}

{\setlength{\tabcolsep}{3pt}
\begin{table}[H]
\centering
\footnotesize
\begin{tabular}{|p{2.7cm}|p{1.4cm}|p{1.4cm}|p{1.4cm}|p{1.6cm}|p{1.4cm}|p{1.4cm}|p{1.4cm}|}
\hline
\textbf{Caso de uso} & \textbf{Usuario} & \textbf{Wallet} & \textbf{Documento} & \textbf{Versión} & \textbf{Carpeta} & \textbf{Firma} & \textbf{Notif.} \\
\hline
\hline
UC-0001 a UC-0018 (Acceso) & X & X & & & & & X \\
\hline
UC-0019 a UC-0028 (Documentos) & X & & X & X & X & & X \\
\hline
UC-0029 a UC-0033 (Versionado) & X & & X & X & & & \\
\hline
UC-0034 a UC-0036 (Firmas) & X & X & X & X & & X & X \\
\hline
UC-0037 a UC-0040 (Compartición) & X & & X & X & X & & X \\
\hline
UC-0041 a UC-0044 (Organización) & X & & X & & X & & \\
\hline
UC-0045 a UC-0048 (Auditoría) & X & & X & X & & & \\
\hline
UC-0049 a UC-0055 (Admin) & X & X & X & & & & X \\
\hline
UC-0056 a UC-0057 (Notificaciones) & X & & & & & & X \\
\hline
\end{tabular}
\caption{Matriz de trazabilidad UC -- clases de análisis}
\label{tab:cross-uc-classes}
\end{table}}

"""


# ─────────────────────────────────────────────────────────────────────────────
# APPLY ALL CHANGES
# ─────────────────────────────────────────────────────────────────────────────

print("Leyendo AnexoII_AnalisisDiseno.tex...")
with io.open('AnexoII_AnalisisDiseno.tex', 'r', encoding='utf-8') as f:
    content = f.read()

print(f"Tamaño original: {len(content)} chars, {content.count(chr(10))} líneas")

# ── PASO 1: Renumerar UC-NNNN ────────────────────────────────────────────────
print("Paso 1: Renumerando referencias UC (dos pasos)...")
def replace_uc(m):
    n = int(m.group(1))
    if n in RENAME:
        return f'UC-NNNN{RENAME[n]:04d}'
    return m.group(0)

content = re.sub(r'UC-(\d{4})', replace_uc, content)
content = content.replace('UC-NNNN', 'UC-')

# Verificar resultado intermedio
post_rename = sorted(set(re.findall(r'UC-\d{4}', content)))
print(f"  UC refs tras rename: {post_rename[:10]}...{post_rename[-5:]}")

# ── PASO 2: Corregir Transferir Documento → UC-0027 (era UC-0016/0026) ───────
print("Paso 2: Corrigiendo 'Transferir Documento' a UC-0027...")
# After rename, what was old UC-0016 became UC-0026 in the captions
old_transfer_caption = 'Diagrama de secuencia UC-0026: Transferir Documento'
new_transfer_caption = 'Diagrama de secuencia UC-0027: Transferir Documento'
if old_transfer_caption in content:
    content = content.replace(old_transfer_caption, new_transfer_caption)
    print("  Caption de Transferir corregida: UC-0026 → UC-0027")
else:
    print("  AVISO: caption 'Transferir Documento' no encontrada como UC-0026")

# ── PASO 3: Corregir "Diagramas de caso de uso-diseño" (refs erróneas) ───────
print("Paso 3: Corrigiendo 'Diagramas de caso de uso-diseño'...")
# After rename, old UC-0012 becomes UC-0021 but it refers to "Subir documento"
# which should be UC-0019. Fix it:
content = content.replace(
    r'\subsubsection{UC-0021: Subir documento}',
    r'\subsubsection{UC-0019: Subir documento}'
)
# After rename, old UC-0029 becomes UC-0040 but refers to "Firmar documento"
# which should be UC-0034. Fix it:
content = content.replace(
    r'\subsubsection{UC-0040: Firmar documento}',
    r'\subsubsection{UC-0034: Firmar documento}'
)
print("  Refs corregidas: UC-0021→UC-0019 (Subir), UC-0040→UC-0034 (Firmar)")

# ── PASO 4: Insertar nuevos diagramas de secuencia ───────────────────────────
print("Paso 4: Insertando nuevos diagramas de secuencia...")

insertions = [
    # (marker_subsubsection_title, new_content_to_insert_before)
    ('\\subsubsection{Secuencia: Iniciar Sesión}',          SEQ_UC0002),
    ('\\subsubsection{Secuencia: Cerrar Sesión}',           SEQ_UC0004),
    ('\\subsubsection{Secuencia: Gestionar Perfil}',        SEQ_UC0007 + SEQ_UC0008 + SEQ_UC0009),
    ('\\subsubsection{Secuencia: Cambiar Contraseña}',      SEQ_UC0011 + SEQ_UC0012),
    ('\\subsubsection{Secuencia: Configurar Autenticación de Dos Factores}', SEQ_UC0016),
    ('\\subsubsection{Secuencia: Subir documento}',         SEQ_UC0018),
    ('\\subsubsection{Secuencia: Eliminar Documento}',      SEQ_UC0024),
    ('\\subsubsection{Secuencia: Transferir Documento}',    SEQ_UC0026),
    ('\\subsubsection{Secuencia: Auditoría Blockchain}',    SEQ_UC0047),
    ('\\subsubsection{Secuencia: Suspender Usuario (Admin)}', SEQ_UC0051),
    ('\\subsubsection{Secuencia: Pausar Sistema (Admin)}',  SEQ_UC0053),
    ('\\subsubsection{Secuencia: Ver Notificaciones}',      SEQ_UC0055),
]

for marker, new_text in insertions:
    idx = content.find(marker)
    if idx == -1:
        print(f"  AVISO: no encontrado marker '{marker[:60]}'")
        continue
    content = content[:idx] + new_text + content[idx:]
    uc_nums = re.findall(r'UC-(\d{4})', new_text[:100])
    print(f"  Insertados UC(s) {uc_nums} antes de '{marker[15:50]}'")

# ── PASO 5: Actualizar Matriz UC -- Clases de análisis ───────────────────────
print("Paso 5: Actualizando Matriz UC -- Clases de análisis...")
old_matrix_start = r'\subsection{Matriz UC -- Clases de análisis}'
old_matrix_end = r'\subsection{Cobertura de requisitos no funcionales}'
start_idx = content.find(old_matrix_start)
end_idx = content.find(old_matrix_end)
if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + NEW_UC_CLASS_MATRIX + content[end_idx:]
    print("  Matriz UC--Clases reconstruida.")
else:
    print(f"  AVISO: marcadores de matriz no encontrados (start={start_idx}, end={end_idx})")

# ── PASO 6: Actualizar conteo de casos de uso (42 → 57) ─────────────────────
print("Paso 6: Actualizando recuento de casos de uso...")
content = re.sub(r'\b42 casos de uso\b', '57 casos de uso', content)
content = re.sub(r'\blos 42 casos\b', 'los 57 casos', content)

# ── PASO 7: Escribir resultado ───────────────────────────────────────────────
print("Paso 7: Escribiendo archivo...")
with io.open('AnexoII_AnalisisDiseno.tex', 'w', encoding='utf-8') as f:
    f.write(content)

# ── VERIFICACIÓN ─────────────────────────────────────────────────────────────
with io.open('AnexoII_AnalisisDiseno.tex', 'r', encoding='utf-8') as f:
    result = f.read()

seqs = re.findall(r'subsubsection\{Secuencia: ([^}]+)\}', result)
captions = re.findall(r'Diagrama de secuencia UC-(\d{4}): ([^\}]+?)(?=\\)', result)
uc_in_seqs = sorted(set([int(c[0]) for c in captions]))
missing_new = [n for n in [2,4,7,8,9,11,12,16,18,24,26,27,47,51,53,55] if n not in uc_in_seqs]
print()
print(f"VERIFICACIÓN:")
print(f"  Total diagramas de secuencia: {len(seqs)}")
print(f"  UCs con caption en secuencias: {uc_in_seqs}")
print(f"  Nuevos UCs faltantes en captions: {missing_new}")
print(f"  Total líneas: {result.count(chr(10))}")
print(f"  Tamaño: {len(result)} chars")
# Check Transferir is UC-0027
if 'UC-0027: Transferir Documento' in result:
    print("  UC-0027 Transferir: OK")
else:
    print("  AVISO: UC-0027 Transferir no encontrado")
# Check design section
if 'UC-0019: Subir documento' in result and 'UC-0034: Firmar documento' in result:
    print("  Diagramas de diseno UC refs: OK")
else:
    print(f"  AVISO: refs diseno UC-0019={('UC-0019: Subir documento' in result)}, UC-0034={('UC-0034: Firmar documento' in result)}")
print("DONE.")
