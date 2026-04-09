# Plan de Implementación Detallado - DocumentChain

> **Para Copilot**: Este documento contiene TODAS las tareas pendientes con instrucciones específicas, código de ejemplo y verificaciones. Sigue el orden de prioridad indicado.

---

## ÍNDICE

1. [Errores Críticos Detectados](#1-errores-críticos-detectados)
2. [Funcionalidades Faltantes](#2-funcionalidades-faltantes)
3. [Problemas de Arquitectura](#3-problemas-de-arquitectura)
4. [Instrucciones de Implementación](#4-instrucciones-de-implementación)
5. [Verificaciones y Tests](#5-verificaciones-y-tests)

---

## 1. ERRORES CRÍTICOS DETECTADOS

### 1.1 ERROR CRÍTICO: Página Audit sin ruta en App.tsx

**Archivo**: `frontend/src/App.tsx`
**Severidad**: CRÍTICA
**Impacto**: Funcionalidad de auditoría pública completamente inaccesible

**Descripción**:
La página `frontend/src/pages/Audit.tsx` está completamente implementada (649 líneas) con funcionalidad tipo Etherscan, pero NO está incluida en las rutas de `App.tsx`.

**Estado actual de App.tsx** (líneas 1-57):
```tsx
// NO existe import para Audit
// NO existe Route para /audit
```

**Solución**:
```tsx
// Agregar import al inicio del archivo:
import { Audit } from './pages/Audit';

// Agregar ruta pública (fuera de ProtectedRoute, antes del 404):
<Route path="/audit" element={<Audit />} />
```

**Verificación**: Navegar a `http://localhost:5173/audit` debe mostrar la página de auditoría.

---

### 1.2 ERROR CRÍTICO: Problema de Descifrado de Clave Privada

**Archivos involucrados**:
- `backend/src/lib/crypto/KeyManager.ts` (líneas 60-86)
- `backend/src/services/documentService.ts` (líneas 71-74)
- `backend/src/controllers/documentController.ts` (líneas 22-32)

**Severidad**: CRÍTICA
**Impacto**: No se pueden subir/descargar archivos encriptados

**Descripción del problema**:
El usuario reportó error al subir archivo relacionado con descifrado de privateKey.

**Análisis del código**:

En `documentController.ts`:
```typescript
const { name, description, password } = req.body;
// password es la contraseña del usuario para descifrar su clave privada
```

En `documentService.ts` líneas 71-74:
```typescript
const ownerPrivateKey = KeyManager.decryptPrivateKey(
  owner.encryptedPrivateKey,
  ownerPassword  // <-- Este es el password del req.body
);
```

En `KeyManager.ts` líneas 60-86:
```typescript
static decryptPrivateKey(encryptedPrivateKey: string, password: string): string {
  const parts = encryptedPrivateKey.split(':');
  if (parts.length !== 4) {
    throw new Error('Formato de clave privada encriptada inválido');
  }
  // Formato esperado: salt:iv:authTag:encryptedData
```

**Posibles causas**:

1. **Formato incorrecto en BD**: El campo `encryptedPrivateKey` puede no tener el formato correcto (4 partes separadas por `:`)

2. **Contraseña incorrecta**: El usuario puede estar enviando una contraseña que no coincide con la usada durante el registro

3. **Problema en el registro**: Durante el registro, la clave privada puede no haberse encriptado correctamente

**Solución propuesta**:

Agregar validación y logs detallados en `KeyManager.decryptPrivateKey()`:

```typescript
static decryptPrivateKey(encryptedPrivateKey: string, password: string): string {
  // AGREGAR: Log para debugging
  logger.debug('Intentando descifrar clave privada', {
    encryptedLength: encryptedPrivateKey?.length,
    partsCount: encryptedPrivateKey?.split(':')?.length,
    passwordProvided: !!password
  });

  const parts = encryptedPrivateKey.split(':');
  if (parts.length !== 4) {
    // AGREGAR: Log del error con detalles
    logger.error('Formato de clave privada inválido', {
      partsCount: parts.length,
      firstPart: parts[0]?.substring(0, 10),
      encryptedPrivateKeyLength: encryptedPrivateKey.length
    });
    throw new Error(`Formato de clave privada encriptada inválido. Se esperaban 4 partes, se encontraron ${parts.length}`);
  }
  // ... resto del código
```

**Verificación**:
1. Revisar logs del servidor al subir archivo
2. Verificar formato de `encryptedPrivateKey` en base de datos
3. Comprobar que el password se envía correctamente desde el frontend

---

### 1.3 ERROR MEDIO: Duplicación de Rutas de Auditoría

**Archivos**:
- `backend/src/routes/audit.ts` (257 líneas) - Rutas públicas completas
- `backend/src/routes/auditRoutes.ts` (166 líneas) - Rutas duplicadas

**Severidad**: MEDIA
**Impacto**: Confusión, posible mantenimiento problemático

**Análisis comparativo**:

| Endpoint | audit.ts | auditRoutes.ts |
|----------|----------|----------------|
| GET /trail/:blockchainId | `/trail/:blockchainId` | `/file-trail/:blockchainId` |
| GET /integrity/:fileId | `/integrity/:fileId` | `/verify-integrity/:fileId` |
| GET /ownership/:blockchainId/:walletAddress | `/ownership/:blockchainId/:walletAddress` | `/verify-ownership/:blockchainId/:address` |
| GET /metadata/:blockchainId | `/metadata/:blockchainId` | `/metadata/:blockchainId` |
| GET /stats | `/stats` | `/stats` |
| GET /health | `/health` | `/network-status` |

**Solución**:
1. Eliminar `backend/src/routes/auditRoutes.ts`
2. Actualizar `frontend/src/api/audit.ts` si usa endpoints de auditRoutes.ts

**Verificación**: Los tests de API deben pasar solo con `audit.ts`.

---

## 2. FUNCIONALIDADES FALTANTES

### 2.1 FALTA: Página de Timeline de Documentos

**Prioridad**: ALTA
**Backend existente**: `backend/src/services/documentTimelineService.ts`
**Ruta API existente**: `backend/src/routes/timeline.ts`
**Frontend API existente**: `frontend/src/api/timeline.ts`

**Lo que falta**: Página React para mostrar la línea temporal

**Crear archivo**: `frontend/src/pages/DocumentTimeline.tsx`

**Especificaciones**:
- Debe mostrar eventos cronológicos de un documento
- Tipos de eventos: version_created, document_signed, document_shared, permission_revoked, ownership_transferred, operational_changed
- Cada evento muestra: tipo, timestamp, actor, detalles, tx hash

**Código base**:
```tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { timelineApi, TimelineEvent } from '../api/timeline';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatDate } from '../lib/utils';
import {
  GitBranch,
  FileSignature,
  Share2,
  UserX,
  ArrowRightLeft,
  RefreshCw,
} from 'lucide-react';

const eventIcons = {
  version_created: GitBranch,
  document_signed: FileSignature,
  document_shared: Share2,
  permission_revoked: UserX,
  ownership_transferred: ArrowRightLeft,
  operational_changed: RefreshCw,
};

const eventColors = {
  version_created: 'default',
  document_signed: 'success',
  document_shared: 'default',
  permission_revoked: 'warning',
  ownership_transferred: 'warning',
  operational_changed: 'default',
} as const;

export const DocumentTimeline: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['timeline', id],
    queryFn: () => timelineApi.getDocumentTimeline(id!),
    enabled: !!id,
  });

  if (isLoading) return <div>Cargando línea temporal...</div>;
  if (error) return <div>Error al cargar línea temporal</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Línea Temporal del Documento</h1>
      
      {data?.events.map((event) => (
        <Card key={event.id}>
          <CardContent className="flex items-start gap-4">
            {React.createElement(eventIcons[event.type], {
              className: 'w-6 h-6 text-gray-600'
            })}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge variant={eventColors[event.type]}>
                  {event.type.replace('_', ' ')}
                </Badge>
                <span className="text-sm text-gray-500">
                  {formatDate(event.timestamp)}
                </span>
              </div>
              <p className="mt-2">
                Por: {event.actor.fullName || event.actor.username}
              </p>
              {event.blockchainTx && (
                <p className="text-xs font-mono text-gray-400 mt-1">
                  TX: {event.blockchainTx}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
```

**Agregar ruta en App.tsx**:
```tsx
import { DocumentTimeline } from './pages/DocumentTimeline';
// Dentro de ProtectedRoute:
<Route path="documents/:id/timeline" element={<DocumentTimeline />} />
```

---

### 2.2 FALTA: Página de Estadísticas de Usuario

**Prioridad**: MEDIA
**Backend existente**: `backend/src/services/statsService.ts`
**Ruta API existente**: `backend/src/routes/stats.ts` - GET /stats/me
**Frontend API existente**: `frontend/src/api/stats.ts`

**Lo que falta**: Página React para mostrar estadísticas personales

**Crear archivo**: `frontend/src/pages/MyStats.tsx`

**Especificaciones**:
- Mostrar documentos propios
- Mostrar documentos compartidos conmigo
- Mostrar versiones totales
- Mostrar firmas realizadas
- Mostrar almacenamiento usado

**Código base**:
```tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../api/stats';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { formatBytes } from '../lib/utils';
import { FileText, Share2, GitBranch, FileSignature, HardDrive } from 'lucide-react';

export const MyStats: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['my-stats'],
    queryFn: statsApi.getMyStats,
  });

  if (isLoading) return <div>Cargando estadísticas...</div>;

  const stats = data?.stats;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Mis Estadísticas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats?.documentsOwned}</p>
              <p className="text-sm text-gray-500">Documentos propios</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Share2 className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats?.documentsShared}</p>
              <p className="text-sm text-gray-500">Compartidos conmigo</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <GitBranch className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{stats?.totalVersions}</p>
              <p className="text-sm text-gray-500">Versiones totales</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <FileSignature className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">{stats?.totalSignatures}</p>
              <p className="text-sm text-gray-500">Firmas realizadas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <HardDrive className="w-8 h-8 text-indigo-600" />
            <div>
              <p className="text-2xl font-bold">{formatBytes(stats?.storageUsed || 0)}</p>
              <p className="text-sm text-gray-500">Almacenamiento usado</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
```

**Agregar ruta en App.tsx**:
```tsx
import { MyStats } from './pages/MyStats';
// Dentro de ProtectedRoute:
<Route path="stats" element={<MyStats />} />
```

---

### 2.3 FALTA: Soporte para WalletConnect

**Prioridad**: ALTA
**Archivo a modificar**: `frontend/src/components/wallet/WalletManager.tsx`

**Estado actual**: Solo soporta `window.ethereum` (MetaMask y wallets de navegador)

**Problema**: Usuarios móviles no pueden conectar su wallet

**Solución**: Implementar WalletConnect v2

**Dependencias a instalar**:
```bash
cd frontend
npm install @walletconnect/web3-provider @walletconnect/qrcode-modal ethers
```

**Modificaciones necesarias**:

1. Crear archivo `frontend/src/lib/walletconnect.ts`:
```typescript
import WalletConnectProvider from '@walletconnect/web3-provider';
import QRCodeModal from '@walletconnect/qrcode-modal';
import { ethers } from 'ethers';

export class WalletConnectHelper {
  private provider: WalletConnectProvider | null = null;

  async connect(): Promise<{ address: string; provider: ethers.BrowserProvider }> {
    this.provider = new WalletConnectProvider({
      infuraId: import.meta.env.VITE_INFURA_ID, // Agregar a .env
      qrcodeModal: QRCodeModal,
    });

    await this.provider.enable();
    
    const ethersProvider = new ethers.BrowserProvider(this.provider);
    const address = await this.provider.send('eth_accounts', []).then((a: string[]) => a[0]);

    return { address, provider: ethersProvider };
  }

  async disconnect(): Promise<void> {
    if (this.provider) {
      await this.provider.disconnect();
      this.provider = null;
    }
  }
}
```

2. Modificar `WalletManager.tsx`:
```tsx
// Agregar estado para método de conexión
const [connectionMethod, setConnectionMethod] = useState<'browser' | 'walletconnect'>('browser');

// Modificar connectWallet:
const connectWallet = async (method: 'browser' | 'walletconnect' = 'browser') => {
  setIsConnecting(true);
  try {
    let address: string;
    let signature: string;
    let message: string;

    if (method === 'walletconnect') {
      // WalletConnect para móviles
      const { address: wcAddress, provider } = await WalletConnectHelper.connect();
      address = wcAddress;
      
      const { message: challenge } = await walletsApi.getChallenge(address);
      message = challenge;
      
      // WalletConnect usa personal_sign
      const signer = await provider.getSigner();
      signature = await signer.signMessage(message);
    } else {
      // MetaMask / Browser wallet
      if (!window.ethereum) {
        throw new Error('MetaMask no detectado');
      }
      // ... código existente
    }

    await addWalletMutation.mutateAsync({ address, signature, message });
  } catch (error) {
    // ... manejo de error
  } finally {
    setIsConnecting(false);
  }
};
```

3. Agregar UI para seleccionar método:
```tsx
// En el render, antes del botón "Conectar Wallet":
<div className="flex gap-2 mb-4">
  <Button
    variant={connectionMethod === 'browser' ? 'primary' : 'outline'}
    onClick={() => setConnectionMethod('browser')}
  >
    Navegador
  </Button>
  <Button
    variant={connectionMethod === 'walletconnect' ? 'primary' : 'outline'}
    onClick={() => setConnectionMethod('walletconnect')}
  >
    Móvil (QR)
  </Button>
</div>
```

---

## 3. PROBLEMAS DE ARQUITECTURA

### 3.1 Diferencia entre documentManagement.ts y documents.ts

**Análisis detallado**:

| Archivo | Rutas | Propósito |
|---------|-------|-----------|
| `documents.ts` | CRUD completo, versiones, firmas, shares, transfer | Rutas principales |
| `documentManagement.ts` | operational-version, transfer, versions | Rutas adicionales |

**Problema**: Ruta duplicada para transferencia
- `documents.ts` línea 27: `POST /:documentId/transfer`
- `documentManagement.ts` línea 19: `POST /documents/:id/transfer`

**Solución**: Mantener solo en `documents.ts` y eliminar de `documentManagement.ts`, o renombrar `documentManagement.ts` a algo más específico como `documentOperations.ts`.

---

### 3.2 Campo `isConnected` en Wallet no existe

**Archivo**: `backend/src/services/documentTimelineService.ts` línea 54

```typescript
const wallet = await prisma.wallet.findFirst({
  where: { userId, isConnected: true }  // <-- isConnected NO existe en schema
});
```

**Verificar schema**: `backend/prisma/schema.prisma`

**Solución**: Cambiar la query:
```typescript
const wallet = await prisma.wallet.findFirst({
  where: { userId, isPrimary: true }  // Usar isPrimary en lugar de isConnected
});
```

---

## 4. INSTRUCCIONES DE IMPLEMENTACIÓN

### Orden de Prioridad

1. **CRÍTICO** - Agregar ruta /audit en App.tsx
2. **CRÍTICO** - Investigar y corregir error de descifrado
3. **ALTO** - Implementar página Timeline
4. **ALTO** - Implementar WalletConnect
5. **MEDIO** - Implementar página Stats
6. **MEDIO** - Unificar rutas de auditoría
7. **BAJO** - Limpiar duplicación documentManagement

### Paso a Paso

#### Paso 1: Agregar ruta /audit (5 minutos)

```bash
# Archivo: frontend/src/App.tsx
```

1. Agregar import: `import { Audit } from './pages/Audit';`
2. Agregar ruta pública antes del 404: `<Route path="/audit" element={<Audit />} />`

#### Paso 2: Investigar error de descifrado (30 minutos)

1. Agregar logs en `KeyManager.decryptPrivateKey()`
2. Verificar datos en base de datos
3. Comprobar flujo de registro de usuario
4. Verificar que el password se envía correctamente desde frontend

#### Paso 3: Implementar Timeline (1 hora)

1. Crear `frontend/src/pages/DocumentTimeline.tsx`
2. Agregar ruta en App.tsx
3. Agregar link en DocumentDetails.tsx

#### Paso 4: Implementar WalletConnect (2 horas)

1. Instalar dependencias
2. Crear helper WalletConnect
3. Modificar WalletManager.tsx
4. Agregar variable de entorno VITE_INFURA_ID

#### Paso 5: Implementar Stats (30 minutos)

1. Crear `frontend/src/pages/MyStats.tsx`
2. Agregar ruta en App.tsx
3. Agregar link en Sidebar

---

## 5. VERIFICACIONES Y TESTS

### Test 1: Ruta de Auditoría

```bash
# Iniciar frontend
cd frontend && npm run dev

# Navegar a
http://localhost:5173/audit

# Verificar
- Página carga sin errores
- Muestra estadísticas públicas
- Permite buscar por blockchainId
- Muestra resultados de auditoría
```

### Test 2: Subida de Archivo

```bash
# Iniciar backend
cd backend && npm run dev

# Iniciar frontend
cd frontend && npm run dev

# Pasos
1. Registrar usuario nuevo
2. Login
3. Subir archivo (proporcionar password)
4. Verificar logs del servidor
5. Verificar que el archivo aparece en la lista

# Si falla, revisar logs de:
- KeyManager.decryptPrivateKey()
- documentService.createDocument()
```

### Test 3: Timeline

```bash
# Después de implementar
1. Crear documento
2. Crear versión
3. Firmar documento
4. Compartir documento
5. Verificar que todos los eventos aparecen en timeline
```

### Test 4: WalletConnect

```bash
# Después de implementar
1. Abrir app en desktop
2. Seleccionar "Móvil (QR)"
3. Escanear QR con wallet móvil (MetaMask Mobile, Trust Wallet, etc.)
4. Verificar conexión exitosa
5. Firmar mensaje de verificación
```

---

## 6. RESUMEN DE ARCHIVOS A MODIFICAR/CREAR

### Archivos a CREAR:

| Archivo | Descripción |
|---------|-------------|
| `frontend/src/pages/DocumentTimeline.tsx` | Página de línea temporal |
| `frontend/src/pages/MyStats.tsx` | Página de estadísticas |
| `frontend/src/lib/walletconnect.ts` | Helper para WalletConnect |

### Archivos a MODIFICAR:

| Archivo | Cambios |
|---------|---------|
| `frontend/src/App.tsx` | Agregar rutas: /audit, /stats, documents/:id/timeline |
| `frontend/src/components/wallet/WalletManager.tsx` | Agregar soporte WalletConnect |
| `backend/src/lib/crypto/KeyManager.ts` | Agregar logs de debugging |
| `backend/src/services/documentTimelineService.ts` | Corregir query de wallet |

### Archivos a ELIMINAR:

| Archivo | Razón |
|---------|-------|
| `backend/src/routes/auditRoutes.ts` | Duplicado de audit.ts |

---

## 7. NOTAS ADICIONALES

### Sobre la Sincronización Blockchain

**¿Qué se sincroniza?**
- Estado de confirmación (PENDING -> CONFIRMED)
- Número de bloque
- Transaction hash
- Eventos emitidos por smart contracts

**¿Para qué sirve?**
1. Confirmar que las transacciones fueron incluidas en bloques
2. Notificar usuarios cuando blockchain confirma
3. Mantener trazabilidad en base de datos
4. Actualizar estados locales

**¿Los eventos se guardan en BD?**
- NO se guardan completos (son inmutables en blockchain)
- Solo se guardan referencias (blockNumber, txHash)
- Se consultan en tiempo real desde blockchain

### Sobre la Arquitectura Blockchain-First

**En Blockchain (público, inmutable)**:
- fileHash, owner, timestamp
- contentCid (IPFS)
- signatures, permissions
- Eventos de auditoría

**En Base de Datos (privado, mutable)**:
- filename, size, mimeType
- userId, email, preferences
- encryptedSymmetricKey
- Estados operacionales

---

## 8. CHECKLIST FINAL

- [ ] Agregar ruta /audit en App.tsx
- [ ] Investigar error de descifrado de clave privada
- [ ] Crear página DocumentTimeline.tsx
- [ ] Crear página MyStats.tsx
- [ ] Implementar WalletConnect
- [ ] Eliminar auditRoutes.ts duplicado
- [ ] Corregir query isConnected en documentTimelineService
- [ ] Agregar tests de integración
- [ ] Documentar cambios en README.md

---

**Fin del documento de implementación**