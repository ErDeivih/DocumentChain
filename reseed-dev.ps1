# ==================================================
# DocumentChain - Reseed de desarrollo
# ==================================================

$ErrorActionPreference = "Stop"
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

function Load-DeploymentEnvironment {
    $deploymentEnvPath = "smart-contracts\deployments\localhost.env"

    if (-not (Test-Path $deploymentEnvPath)) {
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

    return $true
}

function Wait-ForContainerHealth {
    param(
        [string]$ContainerName,
        [int]$MaxAttempts = 20,
        [int]$SleepSeconds = 3
    )

    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        Start-Sleep -Seconds $SleepSeconds
        $status = docker inspect $ContainerName --format "{{.State.Health.Status}}" 2>$null
        if ($status -eq "healthy") {
            return $true
        }
    }

    return $false
}

Write-Host "" 
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  DocumentChain - Reseed limpio de desarrollo" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "" 

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker no está instalado o no está en PATH"
}

docker ps | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw "Docker Desktop no está corriendo"
}

if (-not $env:SEED_PROFILE) {
    $env:SEED_PROFILE = 'qa-fast'
}

Write-Host "[1/7] Levantando dependencias base..." -ForegroundColor Yellow
docker-compose up -d postgres postfix | Out-Null

Write-Host "[2/7] Reconstruyendo imágenes Docker críticas..." -ForegroundColor Yellow
docker-compose build hardhat backend | Out-Null

Write-Host "[3/7] Regenerando blockchain local..." -ForegroundColor Yellow
docker rm -f documentchain-hardhat 2>$null | Out-Null
docker-compose up -d hardhat | Out-Null
if (-not (Wait-ForContainerHealth -ContainerName "documentchain-hardhat" -MaxAttempts 20 -SleepSeconds 3)) {
    throw "Hardhat no llegó a healthy"
}

Write-Host "[4/7] Desplegando contrato en Hardhat..." -ForegroundColor Yellow
Push-Location smart-contracts
try {
    npx hardhat run scripts/deploy.js --network localhost
    if ($LASTEXITCODE -ne 0) {
        throw "Falló el despliegue del contrato"
    }
} finally {
    Pop-Location
}

if (-not (Load-DeploymentEnvironment)) {
    throw "No se pudieron cargar las variables de despliegue"
}

Write-Host "[5/7] Ejecutando seed con reset completo de base de datos..." -ForegroundColor Yellow
Push-Location backend
try {
    npm run data:generate
    if ($LASTEXITCODE -ne 0) {
        throw "Falló la seed de desarrollo"
    }
} finally {
    Pop-Location
}

Write-Host "[6/7] Recreando backend con el contrato desplegado actual..." -ForegroundColor Yellow
docker rm -f documentchain-backend 2>$null | Out-Null
docker-compose up -d backend | Out-Null
if (-not (Wait-ForContainerHealth -ContainerName "documentchain-backend" -MaxAttempts 25 -SleepSeconds 4)) {
    throw "Backend no llegó a healthy"
}

Write-Host "[7/7] Verificando comunicaciones..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:3000/api/health/detailed" -Method GET -TimeoutSec 10
if ($health.status -ne 'healthy') {
    throw "El backend no reporta estado healthy"
}

Write-Host "" 
Write-Host "[OK] Reseed completado" -ForegroundColor Green
Write-Host "  Perfil seed: $($env:SEED_PROFILE)" -ForegroundColor Gray
Write-Host "  Backend:      http://localhost:3000" -ForegroundColor Gray
Write-Host "  Hardhat RPC:  http://localhost:8545" -ForegroundColor Gray
Write-Host "" 