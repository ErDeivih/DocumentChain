# DocumentChain

Sistema de gestión documental con blockchain (Ethereum) + IPFS.

## Requisitos

- Docker Desktop
- Git

## Arranque rápido

```bash
git clone https://github.com/ErDeivih/DocumentChain.git
cd DocumentChain
docker compose up -d --build
```

La primera vez tarda ~5 min (descarga de imágenes + compilación).  
Arranques posteriores: `docker compose up -d` (~30s).

## Puertos

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api/health |
| Hardhat RPC | http://localhost:8545 |

## Usuarios por defecto

El backend genera automáticamente dos usuarios de prueba al iniciar:

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | Admin1234 | ADMIN |
| david | David1234 | USER |

## Tests Solidity

```bash
cd smart-contracts
npm install
npx hardhat test
```
