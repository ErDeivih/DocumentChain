param(
    [ValidateSet('qa-fast', 'qa-max')]
    [string]$SeedProfile = 'qa-fast'
)

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
Set-Location $PSScriptRoot

function Start-DockerDesktopIfAvailable {
    $dockerDesktopCandidates = @(
        'C:\Program Files\Docker\Docker\Docker Desktop.exe',
        'C:\Program Files (x86)\Docker\Docker\Docker Desktop.exe'
    )

    foreach ($candidate in $dockerDesktopCandidates) {
        if (Test-Path $candidate) {
            Start-Process -FilePath $candidate | Out-Null
            return $true
        }
    }

    return $false
}

function Wait-ForDockerEngine {
    param(
        [int]$Attempts = 30,
        [int]$DelaySeconds = 3
    )

    $dockerDesktopLaunchAttempted = $false

    for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
        docker version 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            return
        }

        if (-not $dockerDesktopLaunchAttempted) {
            $dockerDesktopLaunchAttempted = Start-DockerDesktopIfAvailable
        }

        Start-Sleep -Seconds $DelaySeconds
    }

    throw 'Docker Desktop no responde tras varios intentos'
}

function Invoke-DockerComposeWithRetry {
    param(
        [Parameter(Mandatory = $true)][string]$OperationName,
        [Parameter(Mandatory = $true)][scriptblock]$Command,
        [int]$Attempts = 3,
        [int]$DelaySeconds = 8
    )

    for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
        Wait-ForDockerEngine
        $previousErrorActionPreference = $ErrorActionPreference
        $ErrorActionPreference = 'Continue'
        try {
            & $Command
        } finally {
            $ErrorActionPreference = $previousErrorActionPreference
        }
        if ($LASTEXITCODE -eq 0) {
            return
        }

        if ($attempt -eq $Attempts) {
            throw "La operacion Docker '$OperationName' fallo tras $Attempts intentos"
        }

        Write-Host "Reintentando $OperationName ($attempt/$Attempts)..." -ForegroundColor DarkYellow
        Start-Sleep -Seconds $DelaySeconds
    }
}

function Get-DockerContainerStatus {
    param([Parameter(Mandatory = $true)][string]$ContainerName)

    $status = docker inspect $ContainerName --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" 2>$null
    if ($LASTEXITCODE -ne 0) {
        return $null
    }

    return ($status | Out-String).Trim()
}

function Get-ContainerLogsSafe {
    param(
        [Parameter(Mandatory = $true)][string]$ContainerName,
        [int]$Tail = 120
    )

    try {
        return (& docker logs $ContainerName --tail $Tail 2>&1 | Out-String)
    } catch {
        return "No se pudieron leer logs de ${ContainerName}: $($_.Exception.Message)"
    }
}

function Wait-ForContainerHealth {
    param(
        [Parameter(Mandatory = $true)][string]$ContainerName,
        [int]$Attempts = 25,
        [int]$DelaySeconds = 3
    )

    for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
        $status = Get-DockerContainerStatus -ContainerName $ContainerName

        if (-not $status) {
            Start-Sleep -Seconds $DelaySeconds
            continue
        }

        if ($status -eq 'healthy') {
            return
        }

        if ($status -eq 'unhealthy' -or $status -eq 'exited' -or $status -eq 'dead') {
            $recentLogs = Get-ContainerLogsSafe -ContainerName $ContainerName -Tail 120
            throw "El contenedor $ContainerName entro en estado '$status'. Logs recientes:`n$recentLogs"
        }

        Start-Sleep -Seconds $DelaySeconds
    }

    $finalStatus = Get-DockerContainerStatus -ContainerName $ContainerName
    $recentLogs = Get-ContainerLogsSafe -ContainerName $ContainerName -Tail 120
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
    $recentLogs = Get-ContainerLogsSafe -ContainerName $ContainerName -Tail 120
    throw "La API IPFS $Url no respondio correctamente (estado contenedor: '$containerStatus'). Logs recientes:`n$recentLogs"
}

function Invoke-ComposeBuildWithRetry {
    param(
        [Parameter(Mandatory = $true)][string]$ServiceName,
        [int]$Attempts = 3,
        [int]$DelaySeconds = 8
    )

    Invoke-DockerComposeWithRetry -OperationName "build $ServiceName" -Attempts $Attempts -DelaySeconds $DelaySeconds -Command {
        docker compose build $ServiceName 2>&1 | Out-Null
    }
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

        # Normalizar comillas envolventes típicas en ficheros .env
        # para evitar que Docker Compose reciba valores con comillas literales.
        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

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

function Initialize-LocalEnvFile {
    param(
        [Parameter(Mandatory = $true)][string]$TargetPath,
        [Parameter(Mandatory = $true)][string]$ExamplePath
    )

    if (Test-Path $TargetPath) {
        return
    }

    if (-not (Test-Path $ExamplePath)) {
        throw "No se encontro el ejemplo de entorno requerido: $ExamplePath"
    }

    Copy-Item -Path $ExamplePath -Destination $TargetPath
}

function Clear-ComposePostfixEnvOverrides {
    $keys = @(
        'HOSTNAME',
        'POSTFIX_HOSTNAME',
        'POSTFIX_SMTP_TLS_SECURITY_LEVEL',
        'ALLOWED_SENDER_DOMAINS',
        'MASQUERADED_DOMAINS',
        'SMTP_RELAYHOST',
        'SMTP_RELAYHOST_USERNAME',
        'SMTP_RELAYHOST_PASSWORD'
    )

    foreach ($key in $keys) {
        Remove-Item -Path "Env:$key" -ErrorAction SilentlyContinue
    }
}

Initialize-LocalEnvFile -TargetPath (Join-Path $PSScriptRoot 'backend\.env') -ExamplePath (Join-Path $PSScriptRoot 'backend\.env.example')
Initialize-LocalEnvFile -TargetPath (Join-Path $PSScriptRoot 'frontend\.env') -ExamplePath (Join-Path $PSScriptRoot 'frontend\.env.example')
Import-DeploymentEnvironment -FilePath (Join-Path $PSScriptRoot 'backend\.env')
Clear-ComposePostfixEnvOverrides

Write-Host '[1/8] Iniciando infraestructura base...' -ForegroundColor Yellow
if ($env:IPFS_PROVIDER -eq 'self-hosted') {
    Invoke-DockerComposeWithRetry -OperationName 'compose up base infrastructure' -Command {
        docker compose --profile ipfs up -d --remove-orphans postgres postfix ipfs-node 2>&1 | Out-Null
    }
} else {
    Invoke-DockerComposeWithRetry -OperationName 'compose up base infrastructure' -Command {
        docker compose up -d --remove-orphans postgres postfix 2>&1 | Out-Null
    }
}
try {
    Wait-ForContainerHealth -ContainerName 'documentchain-postfix' -Attempts 30 -DelaySeconds 2
} catch {
    $postfixStatus = Get-DockerContainerStatus -ContainerName 'documentchain-postfix'
    if ($postfixStatus -eq 'unhealthy' -or $postfixStatus -eq 'running') {
        Write-Host "Aviso: postfix no reporta healthy ($postfixStatus). Se continua porque no bloquea la validacion E2E principal." -ForegroundColor DarkYellow
    } else {
        throw
    }
}
if ($env:IPFS_PROVIDER -eq 'self-hosted') {
    Wait-ForContainerHealth -ContainerName 'documentchain-ipfs' -Attempts 30 -DelaySeconds 3
    Wait-ForIpfsApi -Url 'http://127.0.0.1:5001/api/v0/version' -ContainerName 'documentchain-ipfs'
}

Write-Host '[2/8] Reconstruyendo backend y hardhat...' -ForegroundColor Yellow
Invoke-ComposeBuildWithRetry -ServiceName 'hardhat'
Invoke-ComposeBuildWithRetry -ServiceName 'backend'

Write-Host '[3/8] Reiniciando Hardhat limpio...' -ForegroundColor Yellow
Invoke-DockerComposeWithRetry -OperationName 'compose up hardhat' -Command {
    docker compose up -d --force-recreate --no-deps hardhat 2>&1 | Out-Null
}
Wait-ForContainerHealth -ContainerName 'documentchain-hardhat'
Wait-ForHttpRpc -Url 'http://127.0.0.1:8545'

Write-Host '[4/8] Desplegando contrato consolidado...' -ForegroundColor Yellow
$contractsPath = Join-Path $PSScriptRoot 'smart-contracts'
& docker run --rm `
    --network container:documentchain-hardhat `
    -v "${contractsPath}:/work" `
    -v 'documentchain-smart-contracts-node-modules:/work/node_modules' `
    -w /work `
    node:20-alpine `
    sh -c 'npm ci --no-audit --prefer-offline && npx hardhat run scripts/deploy.js --network localhost'
if ($LASTEXITCODE -ne 0) {
    throw 'El despliegue Hardhat fallo'
}

$deploymentEnvPath = Join-Path $PSScriptRoot 'smart-contracts\deployments\localhost.env'
Import-DeploymentEnvironment -FilePath $deploymentEnvPath

if (-not $env:CONTRACT_DOCUMENT_REGISTRY) {
    throw 'CONTRACT_DOCUMENT_REGISTRY no quedo cargada tras el despliegue'
}

Write-Host '[5/8] Sincronizando ficheros .env locales con el contrato desplegado...' -ForegroundColor Yellow
Set-Or-ReplaceEnvValue -FilePath (Join-Path $PSScriptRoot 'backend\.env') -Key 'CONTRACT_DOCUMENT_REGISTRY' -Value $env:CONTRACT_DOCUMENT_REGISTRY
Set-Or-ReplaceEnvValue -FilePath (Join-Path $PSScriptRoot 'frontend\.env') -Key 'VITE_CONTRACT_REGISTRY' -Value $env:CONTRACT_DOCUMENT_REGISTRY

Invoke-DockerComposeWithRetry -OperationName 'compose stop backend before QA seed' -Command {
    docker compose stop backend 2>&1 | Out-Null
}

Write-Host '[6/8] Regenerando dataset QA...' -ForegroundColor Yellow
$env:SEED_PROFILE = $SeedProfile
if (-not $env:DATABASE_URL) {
    $env:DATABASE_URL = 'postgresql://documentchain:documentchain@127.0.0.1:5433/documentchain?schema=public'
}
Push-Location backend
try {
    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        & npm run data:seed:qa
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
    if ($LASTEXITCODE -ne 0) {
        throw 'La seed QA fallo'
    }
} finally {
    Pop-Location
}

Write-Host '[7/8] Recreando backend con la direccion actual...' -ForegroundColor Yellow
Invoke-DockerComposeWithRetry -OperationName 'compose up backend' -Command {
    docker compose up -d --force-recreate --no-deps backend 2>&1 | Out-Null
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
