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
        $status = docker inspect $ContainerName --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" 2>$null
        if ($status -eq 'healthy') {
            return
        }

        if ($status -eq 'unhealthy' -or $status -eq 'exited' -or $status -eq 'dead') {
            $recentLogs = docker logs $ContainerName --tail 120 2>&1
            throw "El contenedor $ContainerName entro en estado '$status'. Logs recientes:`n$recentLogs"
        }

        Start-Sleep -Seconds $DelaySeconds
    }

    $finalStatus = docker inspect $ContainerName --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" 2>$null
    $recentLogs = docker logs $ContainerName --tail 120 2>&1
    throw "El contenedor $ContainerName no alcanzo estado healthy (estado final: '$finalStatus'). Logs recientes:`n$recentLogs"
}

function Wait-ForHttpRpc {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [int]$Attempts = 20,
        [int]$DelaySeconds = 3,
        [int]$RequiredConsecutiveSuccesses = 3
    )

    $body = '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
    $consecutiveSuccesses = 0

    for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
        try {
            $response = Invoke-RestMethod -Uri $Url -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 10
            if ($response.result) {
                $consecutiveSuccesses++
                if ($consecutiveSuccesses -ge $RequiredConsecutiveSuccesses) {
                    return
                }
            } else {
                $consecutiveSuccesses = 0
            }
        } catch {
            $consecutiveSuccesses = 0
        }

        Start-Sleep -Seconds $DelaySeconds
    }

    throw "El RPC $Url no respondio con $RequiredConsecutiveSuccesses respuestas consecutivas a eth_blockNumber"
}

function Get-CurlBinary {
    foreach ($candidate in @('curl.exe', 'curl')) {
        $command = Get-Command $candidate -ErrorAction SilentlyContinue
        if ($command -and $command.CommandType -eq 'Application') {
            return $command.Source
        }
    }

    throw 'No se encontro una instalacion de curl para verificar la API IPFS'
}

function Wait-ForIpfsApi {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [string]$ContainerName = 'documentchain-ipfs',
        [int]$Attempts = 30,
        [int]$DelaySeconds = 3
    )

    $curlBinary = Get-CurlBinary

    for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
        try {
            $rawResponse = & $curlBinary --silent --show-error --fail --request POST --max-time 10 $Url
            if ($LASTEXITCODE -eq 0 -and $rawResponse) {
                $response = ($rawResponse -join "`n") | ConvertFrom-Json
                if ($response.Version -or $response.Commit) {
                    return
                }
            }
        } catch {
        }

        Start-Sleep -Seconds $DelaySeconds
    }

    $containerStatus = docker inspect $ContainerName --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" 2>$null
    $recentLogs = docker logs $ContainerName --tail 120 2>&1
    throw "La API IPFS $Url no respondio correctamente (estado contenedor: '$containerStatus'). Logs recientes:`n$recentLogs"
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
docker compose --profile ipfs up -d --remove-orphans postgres postfix ipfs-node | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw 'No se pudieron levantar postgres, postfix e IPFS'
}
Wait-ForContainerHealth -ContainerName 'documentchain-postfix' -Attempts 30 -DelaySeconds 2
Wait-ForContainerHealth -ContainerName 'documentchain-ipfs' -Attempts 30 -DelaySeconds 3
Wait-ForIpfsApi -Url 'http://127.0.0.1:5001/api/v0/version' -ContainerName 'documentchain-ipfs'

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
Wait-ForContainerHealth -ContainerName 'documentchain-backend' -Attempts 50 -DelaySeconds 4

Write-Host '[8/8] Verificando API y blockchain...' -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri 'http://localhost:3000/api/health/detailed' -Method Get -TimeoutSec 15
if ($health.status -ne 'healthy') {
    throw 'La API no devolvio estado healthy en /api/health/detailed'
}

Write-Host ''
Write-Host 'Entorno QA regenerado correctamente.' -ForegroundColor Green
Write-Host "Contrato activo: $($env:CONTRACT_DOCUMENT_REGISTRY)" -ForegroundColor Gray
Write-Host "Perfil de seed: $SeedProfile" -ForegroundColor Gray
