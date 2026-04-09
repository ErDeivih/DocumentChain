# Guía de Pruebas - Sistema DocumentChain

## ✅ Servicios Activos

| Servicio | URL/Puerto | Estado |
|----------|-------------|--------|
| **Frontend** | http://localhost:5173 | ✅ Corriendo |
| **Backend API** | https://localhost:3000 | ✅ Corriendo |
| **Hardhat Node** | http://localhost:8545 | ✅ Corriendo |
| **PostgreSQL** | localhost:5433 | ✅ Corriendo |

---

## 🔐 Cuentas Hardhat Disponibles (para MetaMask)

Usa estas claves privadas para importar cuentas en MetaMask (red Hardhat: chainId 31337):

| # | Dirección | Clave Privada |
|---|-----------|---------------|
| 0 | 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| 1 | 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| 2 | 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |
| 3 | 0x90F79bf6EB2c4f870365E785982E1f101E93b906 | `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6` |
| 4 | 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 | `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a` |

---

## 📋 Funcionalidades para Probar

### 1. Autenticación y Gestión de Usuarios

#### 1.1 Registro de usuario normal
1. Ve a `http://localhost:5173/register`
2. Rellena: username, email, password, fullName
3. Haz clic en "Registrarse"
4. Verifica email si el sistema lo requiere (verificar logs del backend)

#### 1.2 Login con credenciales
1. Ve a `http://localhost:5173/login`
2. Introduce username y password
3. Verifica redirección al dashboard

#### 1.3 Registro de administrador
1. Ve a `http://localhost:5173/register`
2. Marca la casilla "Registrar como administrador"
3. Introduce el `ADMIN_REGISTRATION_SECRET` del `.env`
4. Completa el registro
5. Verifica acceso a `/admin`

#### 1.4 Login con wallet (MetaMask)
1. Asegúrate de tener MetaMask instalado
2. Configura la red Hardhat:
   - RPC: `http://localhost:8545`
   - Chain ID: `31337`
   - Currency: ETH
3. Importa una cuenta desde las claves privadas de arriba
4. Ve a `http://localhost:5173/login`
5. Clic en "Conectar con wallet"
6. Firma el mensaje en MetaMask
7. Verifica login exitoso

---

### 2. Gestión de Documentos

#### 2.1 Subir documento
1. Autenticado, ve a `/documents/upload`
2. Selecciona un archivo (PDF, imagen, texto)
3. Introduce nombre y descripción
4. Clic en "Subir"
5. Firmar transacción en MetaMask cuando aparezca
6. Verificar que aparece en la lista de documentos

**Verificaciones:**
- Hash IPFS generado
- Transacción en blockchain confirmada
- Documento visible en `/documents`

#### 2.2 Ver documento y metadatos
1. Ve a `/documents`
2. Clic en un documento
3. Verifica:
   - Nombre, descripción, fecha de creación
   - Hash IPFS
   - Hash del archivo
   - Estado (ACTIVE/ARCHIVED)
   - Transacción hash

#### 2.3 Descargar documento
1. En la vista del documento
2. Clic en "Descargar"
3. Verifica que el archivo se descarga correctamente

#### 2.4 Archivar documento
1. En la vista del documento
2. Clic en "Archivar"
3. Confirmar en MetaMask
4. Verificar cambio de estado a ARCHIVED
5. Verificar que no aparece en lista principal

#### 2.5 Restaurar documento archivado
1. Ve a `/documents?archived=true`
2. Selecciona documento archivado
3. Clic en "Restaurar"
4. Confirma en MetaMask
5. Verificar estado vuelve a ACTIVE

#### 2.6 Eliminar documento
1. En la vista del documento
2. Clic en "Eliminar"
3. Confirmar la acción
4. Verificar eliminación (soft delete)

---

### 3. Sistema de Versiones

#### 3.1 Crear nueva versión
1. Abre un documento existente
2. Ve a pestaña "Versiones"
3. Clic en "Nueva versión"
4. Sube el archivo actualizado
5. Añade comentario de versión (opcional)
6. Firma en MetaMask
7. Verificar nueva versión en la lista

#### 3.2 Ver historial de versiones
1. Documento → pestaña "Versiones"
2. Verificar que muestra:
   - Número de versión
   - Fecha de creación
   - Hash IPFS
   - Hash del archivo
   - Usuario que creó la versión

#### 3.3 Restaurar versión anterior
1. En historial de versiones
2. Selecciona una versión anterior
3. Clic en "Restaurar esta versión"
4. Confirma en MetaMask
5. Verificar que se convierte en versión activa

---

### 4. Firmas Digitales

#### 4.1 Firmar un documento
1. Abre un documento
2. Ve a pestaña "Firmas"
3. Clic en "Firmar documento"
4. Añade comentario (opcional)
5. Firma en MetaMask
6. Verificar firma en la lista

**Verificaciones:**
- Dirección de wallet correcta
- Timestamp de firma
- Hash de la transacción en blockchain

#### 4.2 Ver firmas de un documento
1. Documento → pestaña "Firmas"
2. Verificar lista de todas las firmas
3. Verificar detalles: firmante, fecha, comentario

#### 4.3 Revocar mi firma
1. En la lista de firmas
2. Junto a tu firma, clic en "Revocar"
3. Confirma en MetaMask
4. Verificar eliminación de la firma

#### 4.4 Ver firmas de versión específica
1. Documento → "Versiones"
2. Selecciona una versión
3. Ver sus firmas específicas

---

### 5. Compartir Documentos

#### 5.1 Compartir con otro usuario
1. Documento → "Compartir"
2. Introduce email del destinatario
3. Selecciona nivel de acceso:
   - **READ**: Solo lectura
   - **WRITE**: Lectura + subir versiones
   - **ADMIN**: Gestión completa de permisos
4. Confirma en MetaMask
5. Verificar que el usuario aparece en lista de compartidos

#### 5.2 Ver documentos compartidos conmigo
1. Ve a `/documents/shared`
2. Verificar lista de documentos compartidos
3. Verificar nivel de acceso de cada uno

#### 5.3 Revocar acceso a usuario
1. Documento → "Compartir"
2. Junto al usuario, clic en "Revocar"
3. Confirma en MetaMask
4. Verificar que el usuario ya no tiene acceso

---

### 6. Transferencia de Documentos

#### 6.1 Transferir propiedad
1. Documento → "Transferir"
2. Introduce email o address de wallet del nuevo propietario
3. Confirma en MetaMask
4. Verificar:
   - Documento desaparece de tu lista
   - Aparece en la lista del nuevo propietario
   - Eres añadido como SHARED_READ

---

### 7. Verificación de Integridad

#### 7.1 Verificar documento desde la UI
1. Documento → "Verificar"
2. Verificar resultado:
   - ✅ **VERIFIED**: El hash coincide
   - ❌ **TAMPERED**: El archivo fue modificado

#### 7.2 Verificar por hash (sin cuenta)
```bash
curl -k https://localhost:3000/api/verification/hash/QmXXXXXX...
```

---

### 8. Timeline / Historial de Actividad

#### 8.1 Ver timeline de documento
1. Documento → "Timeline"
2. Verificar lista de eventos:
   - Creación del documento
   - Nuevas versiones
   - Firmas añadidas
   - Compartidos realizados
   - Cambios de estado (archivado/restaurado)

---

### 9. Gestión de Wallets

#### 9.1 Añadir wallet secundaria
1. Ve a tu perfil → "Mis wallets"
2. Clic en "Añadir wallet"
3. Conecta con MetaMask (cuenta diferente)
4. Firma el challenge
5. Verificar wallet en la lista

#### 9.2 Cambiar wallet primaria
1. Perfil → "Mis wallets"
2. Selecciona una wallet secundaria
3. Clic en "Hacer primaria"
4. Verificar cambio en la interfaz

#### 9.3 Eliminar wallet secundaria
1. Perfil → "Mis wallets"
2. Junto a wallet, clic en "Eliminar"
3. Confirmar

---

### 10. Panel de Administración (solo ADMIN)

Accede a `http://localhost:5173/admin`

#### 10.1 Gestión de usuarios
- Listar todos los usuarios
- Crear usuario manualmente
- Bloquear/desbloquear usuario
- Cambiar rol (USER ↔ ADMIN)

#### 10.2 Gestión de documentos
- Ver todos los documentos del sistema
- Archivar cualquier documento

#### 10.3 Logs de actividad
- Ver todos los eventos del sistema
- Filtrar por tipo de evento
- Filtrar por usuario

#### 10.4 Estadísticas
- Total de documentos
- Total de usuarios
- Transacciones blockchain del día
- Uso de storage

---

### 11. Sincronización Blockchain

#### 11.1 Forzar sincronización manual (Admin)
```bash
curl -k -X POST https://localhost:3000/api/admin/sync \
  -H "Authorization: Bearer TU_JWT_TOKEN"
```

---

## 🧪 Comandos de Testing

### Tests del Backend
```bash
cd backend
npm test
```

### Tests de Smart Contracts
```bash
cd smart-contracts
npx hardhat test
```

### Prisma Studio (UI de base de datos)
```bash
cd backend
npx prisma studio
```

---

## 📊 URLs Rápidas

| Página | URL |
|--------|-----|
| Homepage | http://localhost:5173 |
| Login | http://localhost:5173/login |
| Registro | http://localhost:5173/register |
| Dashboard | http://localhost:5173/dashboard |
| Documentos | http://localhost:5173/documents |
| Subir documento | http://localhost:5173/documents/upload |
| Perfil | http://localhost:5173/profile |
| Admin Panel | http://localhost:5173/admin |

---

## ⚠️ Notas Importantes

1. **MetaMask**: Asegúrate de tener la red Hardhat configurada antes de cualquier operación blockchain
2. **Transacciones**: Todas las operaciones de escritura en blockchain requieren firma en MetaMask
3. **Puertos**: Si algún servicio no responde, verifica que el puerto esté libre
4. **Logs**: Revisa la terminal del backend para ver logs de errores
5. **Base de datos**: Puedes inspeccionar los datos con `npx prisma studio`

---

## 🔧 Resolución de Problemas

### Backend no responde
```powershell
netstat -ano | findstr ":3000"
# Si no hay nada, reinicia:
cd backend
npm run dev
```

### Frontend no carga
```powershell
netstat -ano | findstr ":5173"
# Si no hay nada:
cd frontend
npm run dev
```

### Hardhat node caído
```powershell
cd smart-contracts
npx hardhat node
# En otra terminal:
npx hardhat run scripts/deploy.js --network localhost