# ==================================================
# DocumentChain - Script de Inicio en Desarrollo
# ==================================================

# Configuración de ejecución
$ErrorActionPreference = "Stop"
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

# Variables globales
$global:ipfsReady = $false
$global:hardhatReady = $false
$global:postgresReady = $false
$global:backendReady = $false
$global:frontendReady = $false
$global:runningProcesses = @()
$global:seedApplied = $false
$global:communicationsReady = $false

# Función para mostrar banner
function Show-Banner {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "  DocumentChain - Sistema de Inicio" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
}

# Función para verificar puertos
function Test-Port {
    param([int]$Port)
    $conn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return ($null -ne $conn)
}

# Función para liberar puerto
function Free-Port {
    param([int]$Port)
    $conn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host "  --> Puerto $Port ocupado, liberando..." -ForegroundColor Yellow
        $processId = $conn.OwningProcess
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($process -and $process.ProcessName -match 'docker|com\.docker') {
            Write-Host "  [OK] Puerto $Port pertenece a Docker, se deja intacto" -ForegroundColor Gray
            return
        }
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
        Write-Host "  [OK] Puerto $Port liberado" -ForegroundColor Green
    }
}

# Función para verificar Docker
function Test-Docker {
    Write-Host "[1/11] Verificando Docker..." -ForegroundColor Yellow
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "  [ERROR] Docker no esta instalado" -ForegroundColor Red
        Write-Host "  Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        return $false
    }
    
    $dockerCheck = docker ps 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Docker no esta corriendo" -ForegroundColor Red
        Write-Host "  Inicia Docker Desktop y vuelve a intentar" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "  [OK] Docker corriendo" -ForegroundColor Green
    return $true
}

# Función para verificar Node.js
function Test-NodeJS {
    Write-Host "[2/11] Verificando Node.js..." -ForegroundColor Yellow
    
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "  [ERROR] Node.js no esta instalado" -ForegroundColor Red
        Write-Host "  Instala Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
        return $false
    }
    
    $nodeVersion = node --version
    Write-Host "  [OK] Node.js $nodeVersion" -ForegroundColor Green
    return $true
}

# Función para verificar npm
function Test-Npm {
    Write-Host "[3/11] Verificando npm..." -ForegroundColor Yellow
    
    $npmVersion = npm --version
    Write-Host "  [OK] npm v$npmVersion" -ForegroundColor Green
    return $true
}

# Función para configurar archivos .env
function Setup-Environment {
    Write-Host "[4/11] Configurando archivos .env..." -ForegroundColor Yellow
    
    # Backend .env
    if (-not (Test-Path "backend\.env")) {
        if (Test-Path "backend\.env.example") {
            Copy-Item "backend\.env.example" "backend\.env"
            Write-Host "  [CREADO] backend/.env desde .env.example" -ForegroundColor Green
        } else {
            Write-Host "  [ERROR] backend/.env.example no existe" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "  [OK] backend/.env existe" -ForegroundColor Gray
    }
    
    # Frontend .env
    if (-not (Test-Path "frontend\.env")) {
        if (Test-Path "frontend\.env.example") {
            Copy-Item "frontend\.env.example" "frontend\.env"
            Write-Host "  [CREADO] frontend/.env desde .env.example" -ForegroundColor Green
        } else {
            Write-Host "  [OK] frontend/.env no requerido" -ForegroundColor Gray
        }
    } else {
        Write-Host "  [OK] frontend/.env existe" -ForegroundColor Gray
    }
    
    return $true
}

# Función para instalar dependencias
function Install-Dependencies {
    Write-Host "[5/11] Verificando dependencias..." -ForegroundColor Yellow
    
    # Backend
    if (-not (Test-Path "backend\node_modules")) {
        Write-Host "  --> Instalando dependencias del backend..." -ForegroundColor Cyan
        Push-Location backend
        npm install > $null 2>&1
        Pop-Location
        Write-Host "  [OK] Backend dependencias instaladas" -ForegroundColor Green
    } else {
        Write-Host "  [OK] Backend dependencias instaladas" -ForegroundColor Gray
    }
    
    # Frontend
    if (-not (Test-Path "frontend\node_modules")) {
        Write-Host "  --> Instalando dependencias del frontend..." -ForegroundColor Cyan
        Push-Location frontend
        npm install > $null 2>&1
        Pop-Location
        Write-Host "  [OK] Frontend dependencias instaladas" -ForegroundColor Green
    } else {
        Write-Host "  [OK] Frontend dependencias instaladas" -ForegroundColor Gray
    }
    
    # Smart Contracts
    if (-not (Test-Path "smart-contracts\node_modules")) {
        Write-Host "  --> Instalando dependencias de smart contracts..." -ForegroundColor Cyan
        Push-Location smart-contracts
        npm install > $null 2>&1
        Pop-Location
        Write-Host "  [OK] Smart contracts dependencias instaladas" -ForegroundColor Green
    } else {
        Write-Host "  [OK] Smart contracts dependencias instaladas" -ForegroundColor Gray
    }
    
    return $true
}

# Función para limpiar puertos
function Clear-Ports {
    Write-Host "[6/11] Liberando puertos..." -ForegroundColor Yellow
    
    Free-Port -Port 8545  # Hardhat
    Free-Port -Port 3000  # Backend
    Free-Port -Port 5173  # Frontend
    
    Write-Host "  [OK] Puertos listos" -ForegroundColor Green
    return $true
}

# Función para iniciar PostgreSQL
function Start-PostgreSQL {
    Write-Host "[7/11] Iniciando PostgreSQL..." -ForegroundColor Yellow
    
    $postgresRunning = docker ps --filter "name=documentchain-postgres" --filter "status=running" -q
    
    if ($postgresRunning) {
        Write-Host "  [OK] PostgreSQL ya esta corriendo" -ForegroundColor Gray
        $global:postgresReady = $true
        return $true
    }
    
    Write-Host "  --> Iniciando contenedor PostgreSQL y Postfix..." -ForegroundColor Cyan
    $process = Start-Process -FilePath "docker-compose" -ArgumentList "up","-d","postgres","postfix" -NoNewWindow -Wait -PassThru -RedirectStandardOutput "$env:TEMP\docker-out.txt" -RedirectStandardError "$env:TEMP\docker-err.txt"
    $exitCode = $process.ExitCode
    Remove-Item "$env:TEMP\docker-out.txt","$env:TEMP\docker-err.txt" -ErrorAction SilentlyContinue
    
    if ($exitCode -eq 0) {
        Write-Host "  --> Esperando que PostgreSQL este listo..." -ForegroundColor Cyan
        Start-Sleep -Seconds 5
        Write-Host "  [OK] PostgreSQL corriendo en localhost:5433" -ForegroundColor Green
        Write-Host "  [OK] Postfix SMTP corriendo en puerto 1587" -ForegroundColor Green
        $global:postgresReady = $true
        return $true
    } else {
        Write-Host "  [ERROR] No se pudo iniciar PostgreSQL / Postfix" -ForegroundColor Red
        return $false
    }
}

# Función para preparar la base de datos.
# En el flujo normal, la seed blockchain hace un reset completo con Prisma.
function Prepare-Database {
    Write-Host "[8/13] Preparando base de datos..." -ForegroundColor Yellow

    $skipBlockchainSeed = ($env:SKIP_BLOCKCHAIN_SEED -eq '1' -or $env:SKIP_BLOCKCHAIN_SEED -eq 'true')

    if (-not $skipBlockchainSeed) {
        Write-Host "  [OK] La base de datos se reiniciará automáticamente durante la seed blockchain" -ForegroundColor Green
        return $true
    }

    Push-Location backend
    try {
        npx prisma migrate deploy --schema=./prisma/schema.prisma
        if ($LASTEXITCODE -ne 0) { throw "prisma migrate deploy falló" }

        npx prisma generate --schema=./prisma/schema.prisma
        if ($LASTEXITCODE -ne 0) { throw "prisma generate falló" }

        npx prisma db seed --schema=./prisma/schema.prisma
        if ($LASTEXITCODE -ne 0) { throw "prisma db seed falló" }

        Write-Host "  [OK] Base de datos preparada sin seed blockchain" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  [ERROR] $_" -ForegroundColor Red
        return $false
    } finally {
        Pop-Location
    }
}

function Load-DeploymentEnvironment {
    $deploymentEnvPath = "smart-contracts\deployments\localhost.env"

    if (-not (Test-Path $deploymentEnvPath)) {
        Write-Host "  [ERROR] No se encontro $deploymentEnvPath" -ForegroundColor Red
        return $false
    }

    Get-Content $deploymentEnvPath | ForEach-Object {
        if ($_ -match '^\s*#' -or $_ -match '^\s*$') {
            return
        }

        $parts = $_ -split '=', 2
        if ($parts.Length -eq 2) {
            [Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim())
        }
    }

    Write-Host "  [OK] Variables de despliegue cargadas desde localhost.env" -ForegroundColor Green
    return $true
}

# Función para configurar IPFS
function Setup-IPFS {
    Write-Host "[9/13] Configurando IPFS..." -ForegroundColor Yellow
    
    # Leer IPFS_PROVIDER del .env
    $ipfsProvider = "pinata"  # Default
    if (Test-Path "backend\.env") {
        $envContent = Get-Content "backend\.env" -Raw
        if ($envContent -match 'IPFS_PROVIDER=\"?(\w+)\"?') {
            $ipfsProvider = $Matches[1].Trim().ToLower()
        }
    }
    
    if ($ipfsProvider -eq "pinata") {
        Write-Host "  --> Usando Pinata Cloud IPFS" -ForegroundColor Cyan
        Write-Host "  [INFO] No se requieren nodos IPFS locales" -ForegroundColor Gray
        Write-Host "  [OK] IPFS configurado (cloud gateway)" -ForegroundColor Green
        $global:ipfsReady = $true
        return $true
    } 
    elseif ($ipfsProvider -eq "cluster") {
        Write-Host "  --> Usando IPFS Cluster (nodos propios)" -ForegroundColor Cyan
        
        $ipfsRunning = docker ps --filter "name=ipfs-cluster" --filter "status=running" -q
        
        if ($ipfsRunning) {
            Write-Host "  [OK] IPFS Cluster ya esta corriendo" -ForegroundColor Gray
            $global:ipfsReady = $true
            return $true
        }
        
        Write-Host "  --> Iniciando IPFS Cluster..." -ForegroundColor Cyan
        Push-Location ipfs-cluster
        $process = Start-Process -FilePath "docker-compose" -ArgumentList "up","-d" -NoNewWindow -Wait -PassThru -RedirectStandardOutput "$env:TEMP\docker-out.txt" -RedirectStandardError "$env:TEMP\docker-err.txt"
        $exitCode = $process.ExitCode
        Remove-Item "$env:TEMP\docker-out.txt","$env:TEMP\docker-err.txt" -ErrorAction SilentlyContinue
        Pop-Location
        
        if ($exitCode -eq 0) {
            Write-Host "  --> Esperando que IPFS Cluster este listo..." -ForegroundColor Cyan
            Start-Sleep -Seconds 8
            Write-Host "  [OK] IPFS Cluster corriendo" -ForegroundColor Green
            $global:ipfsReady = $true
            return $true
        } else {
            Write-Host "  [ERROR] No se pudo iniciar IPFS Cluster" -ForegroundColor Red
            return $false
        }
    }
    else {
        Write-Host "  [ERROR] IPFS_PROVIDER desconocido: $ipfsProvider" -ForegroundColor Red
        Write-Host "  [INFO] Valores validos: pinata, cluster" -ForegroundColor Yellow
        return $false
    }
}

# Función para iniciar Hardhat
function Start-Hardhat {
    Write-Host "[10/13] Iniciando Hardhat..." -ForegroundColor Yellow

    Write-Host "  --> Reconstruyendo imagen Hardhat..." -ForegroundColor Cyan
    docker-compose build hardhat | Out-Null

    Write-Host "  --> Reiniciando contenedor Hardhat para tener blockchain limpia..." -ForegroundColor Cyan
    docker rm -f documentchain-hardhat 2>$null | Out-Null
    docker-compose up -d hardhat | Out-Null

    Write-Host "  --> Esperando que Hardhat este healthy..." -ForegroundColor Cyan
    $maxAttempts = 20
    for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
        Start-Sleep -Seconds 3
        $status = docker inspect documentchain-hardhat --format "{{.State.Health.Status}}" 2>$null
        if ($status -eq "healthy") {
            Write-Host "  [OK] Hardhat corriendo en puerto 8545" -ForegroundColor Green
            $global:hardhatReady = $true
            return $true
        }
    }

    Write-Host "  [ERROR] Hardhat no llego a estado healthy" -ForegroundColor Red
    return $false
}

# Función para desplegar Smart Contracts
function Deploy-SmartContracts {
    Write-Host "[11/13] Desplegando Smart Contracts..." -ForegroundColor Yellow
    
    if (-not $global:hardhatReady) {
        Write-Host "  [ERROR] Hardhat no esta corriendo" -ForegroundColor Red
        return $false
    }
    
    Write-Host "  --> Desplegando contratos en blockchain..." -ForegroundColor Cyan
    
    Push-Location smart-contracts
    $output = npx hardhat run scripts/deploy.js --network localhost 2>&1
    $exitCode = $LASTEXITCODE
    Pop-Location
    
    if ($exitCode -eq 0) {
        Write-Host "  [OK] Contratos desplegados exitosamente" -ForegroundColor Green
        return (Load-DeploymentEnvironment)
    } else {
        Write-Host "  [ERROR] Fallo al desplegar contratos" -ForegroundColor Red
        Write-Host "  $output" -ForegroundColor Gray
        return $false
    }
}

# Función para generar datos de prueba con transacciones reales en blockchain
function Run-BlockchainSeed {
    Write-Host "[12/13] Aplicando seed con transacciones reales..." -ForegroundColor Yellow

    $skipBlockchainSeed = ($env:SKIP_BLOCKCHAIN_SEED -eq '1' -or $env:SKIP_BLOCKCHAIN_SEED -eq 'true')
    if ($skipBlockchainSeed) {
        Write-Host "  [OK] Seed blockchain omitida por SKIP_BLOCKCHAIN_SEED" -ForegroundColor Green
        return $true
    }

    if (-not $global:hardhatReady) {
        Write-Host "  [ERROR] Hardhat no esta corriendo" -ForegroundColor Red
        return $false
    }

    Push-Location backend
    try {
        if (-not $env:SEED_PROFILE) {
            $env:SEED_PROFILE = 'qa-fast'
        }
        Write-Host "  --> Perfil de seed: $($env:SEED_PROFILE)" -ForegroundColor Gray
        Write-Host "  --> La seed hará reset completo de base de datos antes de regenerar datos" -ForegroundColor Gray
        $output = npm run data:generate 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [ERROR] Fallo al ejecutar seed" -ForegroundColor Red
            Write-Host "  $output" -ForegroundColor Gray
            return $false
        }

        Write-Host "  [OK] Seed aplicado correctamente" -ForegroundColor Green
        $global:seedApplied = $true
        return $true
    } catch {
        Write-Host "  [ERROR] $_" -ForegroundColor Red
        return $false
    } finally {
        Pop-Location
    }
}

# Función para iniciar Backend
function Start-Backend {
    Write-Host "[13/13] Iniciando Backend..." -ForegroundColor Yellow

    if (Test-Port -Port 3000) {
        Free-Port -Port 3000
    }

    Write-Host "  --> Reconstruyendo imagen backend..." -ForegroundColor Cyan
    docker-compose build backend | Out-Null

    Write-Host "  --> Recreando contenedor backend con el contrato desplegado actual..." -ForegroundColor Cyan
    docker rm -f documentchain-backend 2>$null | Out-Null
    docker-compose up -d backend | Out-Null

    Write-Host "  --> Esperando que Backend este healthy..." -ForegroundColor Cyan
    $maxAttempts = 20
    for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
        Start-Sleep -Seconds 4
        $status = docker inspect documentchain-backend --format "{{.State.Health.Status}}" 2>$null
        if ($status -eq "healthy") {
            Write-Host "  [OK] Backend corriendo en puerto 3000" -ForegroundColor Green
            $global:backendReady = $true
            return $true
        }
    }

    Write-Host "  [ERROR] Backend no llego a estado healthy" -ForegroundColor Red
    return $false
}

# Verifica conectividad entre componentes criticos
function Verify-Communications {
    Write-Host "[Verificación final] Comunicaciones entre servicios..." -ForegroundColor Yellow

    if (-not $global:backendReady) {
        Write-Host "  [ERROR] Backend no esta listo" -ForegroundColor Red
        return $false
    }

    $rpcBody = '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

    for ($attempt = 1; $attempt -le 12; $attempt++) {
        try {
            $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET -TimeoutSec 10
            $detailed = Invoke-RestMethod -Uri "http://localhost:3000/api/health/detailed" -Method GET -TimeoutSec 10
            $rpc = Invoke-RestMethod -Uri "http://localhost:8545" -Method POST -ContentType "application/json" -Body $rpcBody -TimeoutSec 10

            if ($health -and $detailed.status -eq 'healthy' -and $rpc.result) {
                Write-Host "  [OK] Backend responde /health" -ForegroundColor Green
                Write-Host "  [OK] Backend reporta blockchain healthy" -ForegroundColor Green
                Write-Host "  [OK] Hardhat RPC responde eth_blockNumber=$($rpc.result)" -ForegroundColor Green
                $global:communicationsReady = $true
                return $true
            }
        } catch {
            if ($attempt -eq 12) {
                Write-Host "  [ERROR] Verificacion de comunicaciones fallo: $_" -ForegroundColor Red
                return $false
            }
        }

        Start-Sleep -Seconds 3
    }

    return $false
}

# Función para iniciar Frontend
function Start-Frontend {
    Write-Host ""
    Write-Host "Iniciando Frontend..." -ForegroundColor Yellow
    
    if (Test-Port -Port 5173) {
        Write-Host "  [OK] Frontend ya esta corriendo en puerto 5173" -ForegroundColor Gray
        $global:frontendReady = $true
        return $true
    }
    
    Write-Host "  --> Iniciando servidor frontend..." -ForegroundColor Cyan
    $process = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -PassThru -WindowStyle Normal
    $global:runningProcesses += @{Name="Frontend"; PID=$process.Id; Port=5173}
    
    Write-Host "  --> Esperando que Frontend este listo..." -ForegroundColor Cyan
    $maxAttempts = 10
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 1
        if (Test-Port -Port 5173) {
            Write-Host "  [OK] Frontend corriendo en puerto 5173" -ForegroundColor Green
            $global:frontendReady = $true
            return $true
        }
        $attempt++
    }
    
    Write-Host "  [ERROR] Timeout esperando Frontend" -ForegroundColor Red
    return $false
}

# Función para guardar PIDs
function Save-ProcessIDs {
    $data = @{
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        processes = $global:runningProcesses
    }
    
    $json = $data | ConvertTo-Json -Depth 3
    Set-Content -Path ".running-pids.json" -Value $json -Encoding UTF8
    Write-Host ""
    Write-Host "IDs de procesos guardados en .running-pids.json" -ForegroundColor Gray
}

# Función para mostrar resumen
function Show-Summary {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "  Sistema DocumentChain Listo!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "ACCESO A SERVICIOS:" -ForegroundColor White
    Write-Host "  ----------------------------------------" -ForegroundColor Gray
    if ($global:frontendReady) {
        Write-Host "  Frontend:     http://localhost:5173" -ForegroundColor Cyan
    }
    if ($global:backendReady) {
        Write-Host "  Backend API:  http://localhost:3000" -ForegroundColor Cyan
    }
    if ($global:hardhatReady) {
        Write-Host "  Hardhat RPC:  http://localhost:8545" -ForegroundColor Cyan
    }
    Write-Host ""
    
    Write-Host "BASE DE DATOS:" -ForegroundColor White
    Write-Host "  ----------------------------------------" -ForegroundColor Gray
    if ($global:postgresReady) {
        Write-Host "  PostgreSQL:   localhost:5433" -ForegroundColor Cyan
        Write-Host "  Database:     documentchain" -ForegroundColor Gray
        Write-Host "  User:         documentchain" -ForegroundColor Gray
    }
    Write-Host ""
    
    Write-Host "CORREO (SMTP):" -ForegroundColor White
    Write-Host "  ----------------------------------------" -ForegroundColor Gray
    Write-Host "  Postfix SMTP: localhost:1587" -ForegroundColor Cyan
    Write-Host "  From:         noreply@documentchain.local" -ForegroundColor Gray
    Write-Host "  (emails pueden ir a spam sin DNS/SPF publicos)" -ForegroundColor DarkGray
    Write-Host ""

    Write-Host "ALMACENAMIENTO:" -ForegroundColor White
    Write-Host "  ----------------------------------------" -ForegroundColor Gray
    if ($global:ipfsReady) {
        # Leer provider actual
        $ipfsProvider = "pinata"
        if (Test-Path "backend\.env") {
            $envContent = Get-Content "backend\.env" -Raw
            if ($envContent -match 'IPFS_PROVIDER=\"?(\w+)\"?') {
                $ipfsProvider = $Matches[1].Trim().ToLower()
            }
        }
        
        if ($ipfsProvider -eq "pinata") {
            Write-Host "  IPFS:         Pinata Cloud" -ForegroundColor Cyan
            Write-Host "  Gateway:      gateway.pinata.cloud" -ForegroundColor Gray
        } else {
            Write-Host "  IPFS:         Cluster Local" -ForegroundColor Cyan
            Write-Host "  API:          localhost:9094" -ForegroundColor Gray
        }
    }
    Write-Host ""

    Write-Host "VERIFICACION:" -ForegroundColor White
    Write-Host "  ----------------------------------------" -ForegroundColor Gray
    Write-Host "  Seed blockchain: " -NoNewline -ForegroundColor Gray
    if ($global:seedApplied) {
        Write-Host "APLICADO" -ForegroundColor Green
    } else {
        Write-Host "NO APLICADO" -ForegroundColor Yellow
    }
    Write-Host "  Comunicaciones: " -NoNewline -ForegroundColor Gray
    if ($global:communicationsReady) {
        Write-Host "OK" -ForegroundColor Green
    } else {
        Write-Host "PENDIENTE" -ForegroundColor Yellow
    }
    Write-Host ""
    
    Write-Host "SERVICIOS PERSISTENTES:" -ForegroundColor White
    Write-Host "  ----------------------------------------" -ForegroundColor Gray
    Write-Host "  Docker: postgres, postfix, hardhat, backend" -ForegroundColor Gray
    foreach ($proc in $global:runningProcesses) {
        Write-Host "  $($proc.Name): PID $($proc.PID) - Puerto $($proc.Port)" -ForegroundColor Gray
    }
    Write-Host ""
    
    Write-Host "PARA DETENER:" -ForegroundColor Yellow
    Write-Host "  .\stop-dev.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "PARA VER LOGS:" -ForegroundColor Yellow
    Write-Host "  Backend:  docker logs -f documentchain-backend" -ForegroundColor Gray
    Write-Host "  Hardhat:  docker logs -f documentchain-hardhat" -ForegroundColor Gray
    Write-Host "  Frontend: cd frontend && npm run dev" -ForegroundColor Gray
    Write-Host ""
}

# ==================================================
# EJECUCIÓN PRINCIPAL
# ==================================================

Show-Banner

# Verificaciones
if (-not (Test-Docker)) { exit 1 }
if (-not (Test-NodeJS)) { exit 1 }
if (-not (Test-Npm)) { exit 1 }
if (-not (Setup-Environment)) { exit 1 }
if (-not (Install-Dependencies)) { exit 1 }
if (-not (Clear-Ports)) { exit 1 }

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Iniciando Servicios..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar servicios
if (-not (Start-PostgreSQL)) { exit 1 }
if (-not (Prepare-Database)) { exit 1 }
if (-not (Setup-IPFS)) { exit 1 }
if (-not (Start-Hardhat)) { exit 1 }
if (-not (Deploy-SmartContracts)) { exit 1 }
if (-not (Run-BlockchainSeed)) { exit 1 }
if (-not (Start-Backend)) { exit 1 }
if (-not (Verify-Communications)) { exit 1 }
if (-not (Start-Frontend)) { exit 1 }

# Guardar PIDs
Save-ProcessIDs

# Mostrar resumen
Show-Summary
