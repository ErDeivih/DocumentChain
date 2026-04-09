# Configuración de WalletConnect para DocumentChain

WalletConnect permite a los usuarios conectar wallets móviles (como Trust Wallet, Rainbow, Argent, etc.) mediante código QR desde el navegador web.

## ¿Qué necesitas?

Un **Project ID** gratuito de WalletConnect Cloud.

## Pasos para Obtener el Project ID

### 1. Crear Cuenta en WalletConnect Cloud

1. Ve a [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)
2. Haz clic en **"Get Started"** o **"Sign Up"**
3. Puedes registrarte con:
   - Email
   - GitHub
   - Google

### 2. Crear un Nuevo Proyecto

Una vez dentro del dashboard:

1. Haz clic en **"Create Project"** o **"New Project"**
2. Rellena la información:
   - **Project Name:** `DocumentChain` (o el nombre que prefieras)
   - **Project Description:** `Sistema descentralizado de gestión de documentos`
   - **Homepage URL:** `http://localhost:5173` (para desarrollo)
   
3. Haz clic en **"Create"**

### 3. Obtener el Project ID

Una vez creado el proyecto:

1. Verás tu dashboard del proyecto
2. En la sección **"Project ID"** encontrarás una cadena como esta:
   ```
   4c4e4a0e8c5c6e8e2a4c8e4a0e8c5c6e
   ```
3. Cópialo (es un hash de 32 caracteres)

### 4. Configurar en el Frontend

Edita el archivo `frontend/.env`:

```env
# WalletConnect Project ID (REQUERIDO para WalletConnect v2)
VITE_WALLETCONNECT_PROJECT_ID="TU_PROJECT_ID_AQUI"
```

**Ejemplo:**
```env
VITE_WALLETCONNECT_PROJECT_ID="4c4e4a0e8c5c6e8e2a4c8e4a0e8c5c6e"
```

### 5. Verificar Configuración

El código ya está preparado en `frontend/src/lib/walletconnect.ts`:

```typescript
// Project ID se carga automáticamente desde .env
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
```

### 6. Reiniciar el Frontend

```powershell
cd E:\Universidad\tfg\frontend
npm run dev
```

## Cómo Funciona WalletConnect

### Flujo de Usuario

1. Usuario hace clic en **"WalletConnect"** en el modal de wallets
2. Se abre un modal con un **código QR**
3. Usuario abre su wallet móvil (Trust Wallet, MetaMask Mobile, etc.)
4. Escanea el código QR con la wallet
5. Aprueba la conexión en el móvil
6. ¡Listo! La wallet móvil está conectada al navegador

### Wallets Compatibles

WalletConnect es compatible con **+300 wallets móviles**, incluyendo:

- **Trust Wallet**
- **MetaMask Mobile**
- **Rainbow**
- **Argent**
- **Ledger Live**
- **Coinbase Wallet Mobile**
- **SafePal**
- **TokenPocket**
- **1inch Wallet**
- Y muchas más...

Ver lista completa en: [https://walletconnect.com/explorer](https://walletconnect.com/explorer)

## Testing

### Desde el Navegador (Desktop)

1. Abre DocumentChain en tu navegador: `http://localhost:5173`
2. Intenta conectar una wallet
3. Selecciona **"WalletConnect"**
4. Se abrirá un modal con QR code

### Desde tu Móvil

1. Abre Trust Wallet o MetaMask Mobile
2. Ve a la sección "WalletConnect" o escanear
3. Escanea el QR que apareció en tu navegador
4. Aprueba la conexión
5. ¡Listo! Tu wallet móvil está conectada

## Redes Soportadas

En `walletconnect.ts` están configuradas:

```typescript
chains: [1], // Ethereum Mainnet (principal)
optionalChains: [
  5,      // Goerli Testnet
  11155111, // Sepolia Testnet
  31337   // Hardhat Local (tu red de desarrollo)
],
```

Si quieres agregar más redes (Polygon, BSC, etc.), edita el archivo:

```typescript
// Ejemplo: Agregar Polygon
chains: [1, 137], // Ethereum + Polygon
optionalChains: [5, 11155111, 31337, 80001], // + Mumbai Testnet
```

**Chain IDs comunes:**
- Ethereum Mainnet: `1`
- Polygon: `137`
- BSC: `56`
- Arbitrum: `42161`
- Optimism: `10`
- Avalanche: `43114`
- Goerli: `5`
- Sepolia: `11155111`
- Hardhat Local: `31337`

## Límites del Plan Gratuito

WalletConnect Cloud tiene un **plan gratuito muy generoso**:

- ✅ **Ilimitadas** conexiones mensuales
- ✅ **Ilimitados** proyectos
- ✅ Soporte para todas las wallets
- ✅ Analytics básicos

**No necesitas tarjeta de crédito** para el plan gratuito.

## Solución de Problemas

### Error: "Invalid Project ID"

**Causa:** Project ID no configurado o incorrecto.

**Solución:**
1. Verifica que `VITE_WALLETCONNECT_PROJECT_ID` esté en `frontend/.env`
2. Asegúrate de que el Project ID sea correcto (32 caracteres)
3. Reinicia el servidor frontend

### Error: "QR Code not showing"

**Causa:** Librería `@walletconnect/ethereum-provider` no instalada.

**Solución:**
```powershell
cd E:\Universidad\tfg\frontend
npm install @walletconnect/ethereum-provider
```

### No puedo escanear el QR desde mi móvil

**Causa:** Red local no accesible desde el móvil.

**Solución:** Ambos dispositivos deben estar en la **misma red WiFi**. Si sigues teniendo problemas:

1. Verifica tu firewall
2. Usa ngrok o similar para exponer localhost públicamente (solo para testing)

### Connection timeout

**Causa:** Usuario tardó demasiado en aprobar desde el móvil.

**Solución:** El QR expira después de ~5 minutos. Genera uno nuevo haciendo clic nuevamente en "WalletConnect".

## Seguridad

⚠️ **IMPORTANTE:**

- **Project ID es público:** No es una API secret, puede estar en el código frontend
- **NO expongas private keys:** WalletConnect NUNCA tiene acceso a claves privadas
- **Sesiones encriptadas:** Toda comunicación es end-to-end encrypted
- **Usuario controla todo:** La wallet móvil siempre pide confirmación para cada transacción

## Referencias

- [WalletConnect Cloud Dashboard](https://cloud.walletconnect.com/)
- [Documentación Oficial](https://docs.walletconnect.com/)
- [Explorer de Wallets](https://walletconnect.com/explorer)
- [Ethereum Provider SDK](https://docs.walletconnect.com/2.0/web/providers/ethereum)

## Resumen

1. Ve a https://cloud.walletconnect.com/
2. Crea cuenta (gratuita)
3. Crea proyecto "DocumentChain"
4. Copia el Project ID
5. Pégalo en `frontend/.env` como `VITE_WALLETCONNECT_PROJECT_ID`
6. Reinicia frontend
7. ¡Prueba conectando desde Trust Wallet móvil!
