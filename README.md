# DocumentChain

DocumentChain es un sistema de gestion documental segura con trazabilidad blockchain, versionado, comparticion, firma digital con wallet y soporte para documentos privados y publicos.

## Stack

- Frontend: React + Vite + TypeScript.
- Backend: Node.js + Express 4.21 + TypeScript + Prisma.
- Base de datos: PostgreSQL.
- Blockchain de demostracion: Hardhat local.
- Persistencia documental: IPFS mediante Pinata o nodo Kubo autoalojado.
- Correo saliente: Postfix en Docker o relay SMTP externo.
- Documentacion academica: memoria y anexos LaTeX en `anexos/`.

## Estado de entrega

- La entrega Git contiene el codigo fuente necesario, contratos, configuracion de despliegue local, anexos activos y diagramas.
- Las suites de prueba, reportes, coberturas, documentacion API generada y artefactos temporales se conservan solo localmente en `_local_no_entrega/`, carpeta ignorada por Git.
- La documentacion API de backend/frontend/smart-contracts es regenerable con los scripts `docs`, pero no forma parte del arbol final de entrega.
- El backend importa el ABI desde `smart-contracts/artifacts/contracts/DocumentRegistry.sol/DocumentRegistry.json`; por eso, tras una instalacion limpia, debe ejecutarse `npm run compile` en `smart-contracts` antes de compilar el backend.

## Demo local para defensa

La demo recomendada usa Hardhat local, PostgreSQL, backend, frontend, Postfix e IPFS configurado en `backend/.env`.

Versiones verificadas en el cierre local de entrega:

- Docker Desktop con Docker Compose v2.
- Imagen Docker `node:20-alpine` para builds y despliegue Hardhat reproducible.
- Node local usado para herramientas auxiliares: `v22.12.0`; npm local: `11.2.0`.
- PowerShell en Windows.
- MiKTeX/LuaLaTeX para compilar los anexos.

Para regenerar un entorno demostrativo reproducible:

```powershell
.\scripts\reseed-dev.ps1
```

El script realiza estas acciones:

- levanta PostgreSQL y Postfix;
- levanta `ipfs-node` si `IPFS_PROVIDER=self-hosted`;
- recompila backend y Hardhat;
- recrea el nodo Hardhat local;
- despliega `DocumentRegistry`;
- sincroniza `CONTRACT_DOCUMENT_REGISTRY` en `backend/.env` y `VITE_CONTRACT_REGISTRY` en `frontend/.env`;
- limpia los pins existentes del proveedor IPFS configurado;
- genera usuarios, wallets, documentos, versiones, comparticiones, firmas y eventos;
- sube payloads demo a IPFS y usa CIDs reales cuando el proveedor IPFS esta disponible;
- arranca el backend con la direccion actual del contrato.

Perfil rapido por defecto:

```powershell
.\scripts\reseed-dev.ps1 -SeedProfile qa-fast
```

Perfil amplio:

```powershell
.\scripts\reseed-dev.ps1 -SeedProfile qa-max
```

Credenciales habituales tras la seed:

- `admin` / `Admin123!`
- usuarios demo impresos por consola con clave `Demo123!`

Cada ejecucion de `reseed-dev.ps1` resetea la base de datos de demostracion y redespliega el contrato local, por lo que las direcciones y CIDs pueden cambiar.

El perfil `qa-fast` queda validado como dataset limpio de defensa: el resumen debe terminar con `Documentos en FAILED: 0`. Los ficheros `smart-contracts/deployments/localhost.json` y `smart-contracts/deployments/localhost.env` son artefactos locales efimeros del despliegue Hardhat y no forman parte de la entrega versionada.

Comprobacion rapida de integridad tras el reseed:

```powershell
docker exec documentchain-postgres psql -U documentchain -d documentchain -c "SELECT \"blockchainStatus\", count(*) FROM \"Document\" GROUP BY \"blockchainStatus\";"
```

## Arranque basico

La forma directa de levantar el proyecto con Docker Compose es:

```powershell
docker compose up -d --build
```

Servicios expuestos:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5433
- Hardhat RPC: http://localhost:8545
- SMTP Postfix: localhost:1587
- Nodo IPFS propio: opcional con perfil `ipfs` y servicio `ipfs-node`

Comprobaciones rapidas:

```powershell
docker compose ps
Invoke-WebRequest -UseBasicParsing http://localhost:3000/health
```

## Variables de entorno

Si no existen, crea los ficheros `.env` desde sus ejemplos:

```powershell
Copy-Item backend\.env.example backend\.env
if (Test-Path frontend\.env.example) { Copy-Item frontend\.env.example frontend\.env }
if (Test-Path smart-contracts\.env.example) { Copy-Item smart-contracts\.env.example smart-contracts\.env }
```

Para trabajo local fuera de Docker, `backend/.env` debe apuntar a PostgreSQL en el puerto `5433`:

```dotenv
DATABASE_URL="postgresql://documentchain:documentchain@localhost:5433/documentchain?schema=public"
```

Variables blockchain locales principales:

```dotenv
BLOCKCHAIN_RPC_URL="http://localhost:8545"
CONTRACT_DOCUMENT_REGISTRY="0x..."
BLOCKCHAIN_PRIVATE_KEY="0x..."
```

Variables frontend relacionadas:

```dotenv
VITE_CHAIN_ID="31337"
VITE_CHAIN_NAME="Hardhat Localhost"
VITE_BLOCKCHAIN_RPC_URL="http://localhost:8545"
VITE_CONTRACT_REGISTRY="0x..."
```

## IPFS

DocumentChain soporta dos proveedores:

- `IPFS_PROVIDER=pinata`: usa Pinata mediante `PINATA_JWT`.
- `IPFS_PROVIDER=self-hosted`: usa un nodo Kubo local con el servicio `ipfs-node`.

Configuracion Pinata en `backend/.env`:

```dotenv
IPFS_PROVIDER="pinata"
PINATA_JWT="..."
PINATA_GATEWAY_URL="https://gateway.pinata.cloud"
```

Configuracion self-hosted:

```powershell
$env:IPFS_PROVIDER = "self-hosted"
$env:IPFS_API_URL = "http://ipfs-node:5001"
$env:IPFS_GATEWAY_URL = "http://ipfs-node:8080"
$env:IPFS_DATA_ROOT = "E:\Universidad\tfg\ipfs\runtime\node"

docker compose --profile ipfs up -d postgres hardhat postfix ipfs-node backend frontend
```

La seed de demostracion limpia los pins existentes antes de cargar datos nuevos. Esto evita agotar almacenamiento en Pinata o en el nodo local durante iteraciones repetidas de defensa.

## Correo con Postfix

El backend puede entregar correo al Postfix del propio stack. Configuracion local minima en `backend/.env`:

```dotenv
SMTP_HOST="localhost"
SMTP_PORT="1587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM="noreply@documentchain.local"
EMAIL_FROM_NAME="DocumentChain"
FRONTEND_URL="http://localhost:5173"
```

La salida directa con Postfix sirve como demostracion tecnica, pero la aceptacion por Gmail/Outlook no esta garantizada sin dominio, PTR, SPF, DKIM y reputacion. Para un envio mas estable puede configurarse un relay SMTP externo.

## Desarrollo hibrido

Para ejecutar frontend y backend en caliente, manteniendo PostgreSQL, Hardhat y Postfix en Docker:

```powershell
docker compose up -d postgres hardhat postfix

Set-Location backend
npx prisma migrate deploy
npx prisma generate
npm run dev

Set-Location ..\frontend
npm run dev
```

## Validacion de entrega

Backend:

```powershell
Set-Location backend
npm run build
npm run lint
```

Frontend:

```powershell
Set-Location frontend
npm run build
npm run lint
```

Smart contracts:

```powershell
Set-Location smart-contracts
npm run compile
```

Anexos activos:

```powershell
Set-Location anexos
.\build_nuevo.ps1 -OnlyLatex
```

## Contenedores

- `documentchain-frontend`: sirve la SPA y proxifica `/api` al backend.
- `documentchain-backend`: API REST, servicios y sincronizacion blockchain.
- `documentchain-postgres`: persistencia relacional.
- `documentchain-hardhat`: nodo EVM local para demostracion.
- `documentchain-postfix`: SMTP de salida.
- `documentchain-ipfs`: nodo Kubo opcional cuando se activa el perfil `ipfs`.

## Notas importantes

- El sistema de permisos documental real usa `OWNER`, `EDITOR`, `VIEWER` y `NONE` en blockchain.
- La firma usa patron prepare/confirm; la wallet firma siempre en cliente.
- La autenticacion principal es email/contraseña + JWT; la wallet se usa para challenge de vinculacion y firma de operaciones/documentos.
- Las migraciones Prisma deben versionarse en Git.
- Las capturas del manual de usuario viven en `anexos/capturas-ui/`.

## Estructura

```text
backend/           API y logica de negocio
frontend/          SPA React
smart-contracts/   contratos Solidity y scripts Hardhat
anexos/            memoria y anexos LaTeX
docs/              documentacion tecnica auxiliar
nginx/             configuracion del frontend Docker
```
