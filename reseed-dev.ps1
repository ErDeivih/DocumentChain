param(
    [ValidateSet('qa-fast', 'qa-max')]
    [string]$SeedProfile = 'qa-fast'
)

$ErrorActionPreference = 'Stop'
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
Set-Location $PSScriptRoot

function Wait-ForContainerHealth {
    param(
        [Parameter(Mandatory = $true)][string]$ContainerName,
        [int]$Attempts = 25,
        [int]$DelaySeconds = 3
    )

    for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
        $status = docker inspect $ContainerName --format "{{.State.Health.Status}}" 2>$null
        if ($status -eq 'healthy') {
            return
        }

        Start-Sleep -Seconds $DelaySeconds
    }

    throw "El contenedor $ContainerName no alcanzo estado healthy"
}

function Wait-ForHttpRpc {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [int]$Attempts = 20,
        [int]$DelaySeconds = 3
    )

    $body = '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

    for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
        try {
            $response = Invoke-RestMethod -Uri $Url -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 10
            if ($response.result) {
                return
            }
        } catch {
        }

        Start-Sleep -Seconds $DelaySeconds
    }

    throw "El RPC $Url no respondio con eth_blockNumber"
}

function Import-DeploymentEnvironment {
    param([Parameter(Mandatory = $true)][string]$FilePath)

    if (-not (Test-Path $FilePath)) {
        throw "No se encontro $FilePath"
    }

    Get-Content $FilePath | ForEach-Object {
        if ($_ -match '^\s*#' -or $_ -match '^\s*$') {
            return
        }

        $parts = $_ -split '=', 2
        if ($parts.Length -ne 2) {
            return
        }

        $name = $parts[0].Trim()
        $value = $parts[1].Trim()

        Set-Item -Path "Env:$name" -Value $value
        [Environment]::SetEnvironmentVariable($name, $value)
    }
}

function Set-Or-ReplaceEnvValue {
    param(
        [Parameter(Mandatory = $true)][string]$FilePath,
        [Parameter(Mandatory = $true)][string]$Key,
        [Parameter(Mandatory = $true)][string]$Value
    )

    if (-not (Test-Path $FilePath)) {
        return
    }

    $content = Get-Content $FilePath -Raw
    $pattern = "(?m)^$([regex]::Escape($Key))=.*$"
    $replacement = "$Key=$Value"

    if ([regex]::IsMatch($content, $pattern)) {
        $updated = [regex]::Replace($content, $pattern, $replacement)
    } else {
        $suffix = if ($content.Length -gt 0 -and -not $content.EndsWith("`n")) { "`r`n" } else { '' }
        $updated = "$content$suffix$replacement`r`n"
    }

    Set-Content -Path $FilePath -Value $updated -Encoding UTF8
}

Write-Host '[1/8] Iniciando infraestructura base...' -ForegroundColor Yellow
docker compose up -d postgres postfix | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw 'No se pudieron levantar postgres y postfix'
}
Wait-ForContainerHealth -ContainerName 'documentchain-postfix' -Attempts 30 -DelaySeconds 2

Write-Host '[2/8] Reconstruyendo backend y hardhat...' -ForegroundColor Yellow
docker compose build hardhat backend | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw 'La reconstruccion de imagenes Docker fallo'
}

Write-Host '[3/8] Reiniciando Hardhat limpio...' -ForegroundColor Yellow
docker compose up -d --force-recreate --no-deps hardhat | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw 'No se pudo recrear el servicio hardhat'
}
Wait-ForContainerHealth -ContainerName 'documentchain-hardhat'
Wait-ForHttpRpc -Url 'http://127.0.0.1:8545'

Write-Host '[4/8] Desplegando contrato consolidado...' -ForegroundColor Yellow
Push-Location smart-contracts
try {
    & npx hardhat run scripts/deploy.js --network localhost
    if ($LASTEXITCODE -ne 0) {
        throw 'El despliegue Hardhat fallo'
    }
} finally {
    Pop-Location
}

$deploymentEnvPath = Join-Path $PSScriptRoot 'smart-contracts\deployments\localhost.env'
Import-DeploymentEnvironment -FilePath $deploymentEnvPath

if (-not $env:CONTRACT_DOCUMENT_REGISTRY) {
    throw 'CONTRACT_DOCUMENT_REGISTRY no quedo cargada tras el despliegue'
}

Write-Host '[5/8] Sincronizando ficheros .env locales con el contrato desplegado...' -ForegroundColor Yellow
Set-Or-ReplaceEnvValue -FilePath (Join-Path $PSScriptRoot 'backend\.env') -Key 'CONTRACT_DOCUMENT_REGISTRY' -Value $env:CONTRACT_DOCUMENT_REGISTRY
Set-Or-ReplaceEnvValue -FilePath (Join-Path $PSScriptRoot 'frontend\.env') -Key 'VITE_CONTRACT_REGISTRY' -Value $env:CONTRACT_DOCUMENT_REGISTRY

Write-Host '[6/8] Regenerando dataset QA...' -ForegroundColor Yellow
$env:SEED_PROFILE = $SeedProfile
if (-not $env:DATABASE_URL) {
    $env:DATABASE_URL = 'postgresql://documentchain:documentchain@127.0.0.1:5433/documentchain?schema=public'
}
Push-Location backend
try {
    & npm run data:seed:qa -- "--profile=$SeedProfile"
    if ($LASTEXITCODE -ne 0) {
        throw 'La seed QA fallo'
    }
} finally {
    Pop-Location
}

Write-Host '[7/8] Recreando backend con la direccion actual...' -ForegroundColor Yellow
docker compose up -d --force-recreate --no-deps backend | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw 'No se pudo recrear el servicio backend'
}
Wait-ForContainerHealth -ContainerName 'documentchain-backend' -Attempts 30 -DelaySeconds 4

Write-Host '[8/8] Verificando API y blockchain...' -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri 'http://localhost:3000/api/health/detailed' -Method Get -TimeoutSec 15
if ($health.status -ne 'healthy') {
    throw 'La API no devolvio estado healthy en /api/health/detailed'
}

Write-Host ''
Write-Host 'Entorno QA regenerado correctamente.' -ForegroundColor Green
Write-Host "Contrato activo: $($env:CONTRACT_DOCUMENT_REGISTRY)" -ForegroundColor Gray
Write-Host "Perfil de seed: $SeedProfile" -ForegroundColor Gray
