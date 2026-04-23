# Arranque recomendado

## Opcion recomendada

Para levantar DocumentChain completo en un equipo nuevo sin depender de instalaciones locales de Node o PostgreSQL:

```powershell
docker compose up -d --build
```

Comprobaciones:

```powershell
docker compose ps
Invoke-WebRequest -UseBasicParsing http://localhost:3000/health
```

URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Hardhat: http://localhost:8545
- PostgreSQL: localhost:5433
- SMTP: localhost:1587

## Entorno QA limpio

Para regenerar blockchain local, redeployar contratos y recrear el dataset QA que usan las suites automatizadas:

```powershell
.\reseed-dev.ps1
```

Este script queda anclado a la raiz del repositorio y evita problemas por ejecutar comandos desde un directorio incorrecto.

## Opcion secundaria

`start-dev.ps1` sigue siendo util para desarrollo hibrido, pero el flujo preferente para entrega y GitHub es Docker Compose completo.

## Parada

```powershell
docker compose down
```

Para eliminar tambien los volumenes:

```powershell
docker compose down -v
```
