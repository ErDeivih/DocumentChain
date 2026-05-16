# Plan de despliegue en Sepolia — DocumentChain

## Objetivo

Desplegar el contrato inteligente `DocumentRegistry` en la testnet Sepolia de Ethereum, manteniendo Hardhat local como red de fallback. La arquitectura dual permite priorizar Sepolia para las demos y defensa del TFG, con conmutacion automatica a Hardhat si Sepolia no responde.

---

## Estado actual del codigo

El proyecto YA esta preparado para Sepolia:

- `smart-contracts/hardhat.config.js` (lineas 22-25): red Sepolia configurada, solo requiere `SEPOLIA_RPC_URL` y `PRIVATE_KEY`
- `smart-contracts/scripts/deploy.js`: script generico, funciona con cualquier red
- `backend/src/config/blockchain.ts`: se conecta via `BLOCKCHAIN_RPC_URL`, agnostico a la red
- `backend/src/services/eventListenerService.ts`: escucha eventos del contrato, funciona igual en cualquier red EVM

---

## Servicio RPC recomendado: Alchemy

| Servicio | Limite gratuito | Ventajas |
|----------|----------------|----------|
| **Alchemy** | 300M compute units/mes (~10M req) | Dashboard, WebSocket, faucet ETH integrado |
| Infura | 100K req/dia | Fiable, clasico |
| QuickNode | 3M req/mes | Buen rendimiento |
| Google Cloud RPC | Vista previa | Infraestructura Google, requiere facturacion |

**Recomendacion: Alchemy.** No requiere tarjeta de credito, tiene faucet de Sepolia ETH integrado (0.5 ETH cada 24h), y soporta WebSocket para el `EventListenerService`.

---

## Faucets de Sepolia ETH (gratuitos)

| Faucet | Cantidad | Frecuencia | Requisitos |
|--------|----------|------------|------------|
| Alchemy Faucet | 0.5 ETH | Cada 24h | Cuenta Alchemy + wallet |
| sepoliafaucet.com | 0.05 ETH | Cada 24h | Direccion Ethereum |
| faucet.quicknode.com | 0.1 ETH | Cada 24h | Cuenta QuickNode |

Con 0.5 ETH de Alchemy hay gas para cientos de transacciones (~0.0001 ETH por tx en Sepolia).

---

## Costes

| Concepto | Coste |
|----------|-------|
| Sepolia ETH | 0 EUR (faucets gratuitos) |
| Alchemy RPC | 0 EUR (capa gratuita) |
| Gas de despliegue | 0 EUR (testnet) |
| **Total** | **0 EUR** |

---

## Arquitectura dual propuesta

```
                    ┌─────────────────────────┐
                    │        Backend           │
                    │  BLOCKCHAIN_RPC_URL      │──▶ Sepolia (Alchemy)
                    │  (intento principal)     │
                    │                          │
                    │  BLOCKCHAIN_RPC_FALLBACK  │──▶ Hardhat local (:8545)
                    │  (si Sepolia falla)      │
                    └─────────────────────────┘
```

---

## Cambios necesarios en el codigo

### 1. Smart contracts — Desplegar en Sepolia

```bash
# Añadir al .env de smart-contracts:
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY"
PRIVATE_KEY="0x..."

# Desplegar:
npx hardhat run scripts/deploy.js --network sepolia
```

Esto genera `deployments/sepolia.json` y `deployments/sepolia.env` con la direccion del contrato.

### 2. Backend `.env` — Variables de entorno

```env
# Sepolia (prioritario)
BLOCKCHAIN_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY"
BLOCKCHAIN_PRIVATE_KEY="0x..."

# Hardhat local (fallback)
BLOCKCHAIN_RPC_FALLBACK="http://127.0.0.1:8545"
CONTRACT_DOCUMENT_REGISTRY_FALLBACK="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

# Direccion del contrato en Sepolia (se obtiene del deploy)
CONTRACT_DOCUMENT_REGISTRY="0x..."
```

### 3. `backend/src/config/blockchain.ts` — Provider con fallback

Modificar `getProviderInstance()` para:
- Intentar conectar a `BLOCKCHAIN_RPC_URL` (Sepolia)
- Si falla, conmutar a `BLOCKCHAIN_RPC_FALLBACK` (Hardhat)
- Exponer la red activa en `GET /api/health`
- Resolver `CONTRACT_DOCUMENT_REGISTRY` segun la red activa

### 4. `backend/.env.example` — Documentar nuevas variables

Añadir `BLOCKCHAIN_RPC_FALLBACK` y `CONTRACT_DOCUMENT_REGISTRY_FALLBACK` al ejemplo.

### 5. Frontend `.env` — Direccion del contrato

```env
VITE_CONTRACT_REGISTRY="0x..."  # Direccion en Sepolia
```

### 6. Docker — Sin cambios

`docker-compose.yml` no necesita modificaciones. Solo cambian las variables de entorno.

---

## Lo que NO cambia

- **Sincronizacion BD-Blockchain**: `EventListenerService` funciona igual en Sepolia
- **Patron prepare/confirm**: El frontend firma, el backend confirma. Igual.
- **IPFS**: Sin cambios
- **Cifrado**: Sin cambios
- **Tests**: Sin cambios

---

## Riesgos y mitigacion

| Riesgo | Mitigacion |
|--------|-----------|
| Faucet se queda sin ETH | Tener 2-3 faucets de respaldo (Alchemy + sepoliafaucet.com + QuickNode) |
| RPC de Alchemy caido | El backend conmuta automaticamente a Hardhat local |
| Contrato inmutable en Sepolia | Probar TODO en Hardhat local antes de desplegar en Sepolia |
| Pierdo la clave privada de la cuenta desplegadora | Usar una cuenta especifica solo para despliegue, guardar la clave encriptada |
| Dia de la defensa sin internet | Hardhat local como fallback inmediato |

---

## Flujo de trabajo

1. **Desarrollo**: Hardhat local (sin cambios)
2. **Demo/Defensa**: Arrancar con Sepolia. Si falla el RPC, el backend detecta el fallo y cambia a Hardhat local automaticamente
3. **Health**: `GET /api/health` muestra `blockchain: "sepolia"` o `blockchain: "hardhat"` segun la red activa

---

## Pendiente

- [ ] Crear cuenta en Alchemy y obtener API key
- [ ] Conseguir Sepolia ETH del faucet
- [ ] Desplegar contrato en Sepolia (`npx hardhat run scripts/deploy.js --network sepolia`)
- [ ] Implementar provider con fallback en `backend/src/config/blockchain.ts`
- [ ] Actualizar `.env` del backend con las nuevas variables
- [ ] Actualizar `.env` del frontend con la direccion de Sepolia
- [ ] Probar flujo completo (subir documento, firmar, compartir, verificar) en Sepolia
- [ ] Verificar que el fallback a Hardhat funciona si Sepolia no responde
