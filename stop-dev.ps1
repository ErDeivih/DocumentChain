# ============================================
# DocumentChain - Script para detener desarrollo
# ============================================

Write-Host "Deteniendo DocumentChain..." -ForegroundColor Yellow
Write-Host ""

# Intentar leer los PIDs guardados
if (Test-Path ".running-pids.json") {
    try {
        $pids = Get-Content ".running-pids.json" | ConvertFrom-Json
        
        Write-Host "Deteniendo procesos Node.js..." -ForegroundColor Yellow

        if ($pids.processes) {
            foreach ($proc in $pids.processes) {
                if ($proc.Name -eq "Frontend") {
                    Stop-Process -Id $proc.PID -Force -ErrorAction SilentlyContinue
                    Write-Host "  Frontend detenido" -ForegroundColor Gray
                }
            }
        }
        
        Remove-Item ".running-pids.json" -ErrorAction SilentlyContinue
        Write-Host "  OK" -ForegroundColor Green
    } catch {
        Write-Host "  No se pudieron leer los PIDs guardados" -ForegroundColor Yellow
    }
} else {
    Write-Host "Buscando procesos Node.js en puertos conocidos..." -ForegroundColor Yellow
    
    # Detener procesos por puerto
    $ports = @(5173)
    foreach ($port in $ports) {
        $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connection) {
            $processId = $connection.OwningProcess
            if ($processId) {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Host "  Proceso en puerto $port detenido" -ForegroundColor Gray
            }
        }
    }
    Write-Host "  OK" -ForegroundColor Green
}

Write-Host ""

# Preguntar si detener contenedores Docker
Write-Host "¿Detener contenedores Docker? (PostgreSQL, Postfix, Hardhat, Backend, IPFS)" -ForegroundColor Yellow
$response = Read-Host "  (S/N) [N]"

if ($response -eq "S" -or $response -eq "s") {
    Write-Host ""
    Write-Host "Deteniendo contenedores Docker..." -ForegroundColor Yellow
    
    # Detener PostgreSQL
    $postgres = docker ps --filter "name=documentchain-postgres" --format "{{.Names}}" 2>$null
    if ($postgres) {
        docker stop documentchain-postgres 2>&1 | Out-Null
        Write-Host "  PostgreSQL detenido" -ForegroundColor Gray
    }
    
    # Detener Postfix
    $postfix = docker ps --filter "name=documentchain-postfix" --format "{{.Names}}" 2>$null
    if ($postfix) {
        docker stop documentchain-postfix 2>&1 | Out-Null
        Write-Host "  Postfix detenido" -ForegroundColor Gray
    }

    # Detener Hardhat
    $hardhat = docker ps --filter "name=documentchain-hardhat" --format "{{.Names}}" 2>$null
    if ($hardhat) {
        docker stop documentchain-hardhat 2>&1 | Out-Null
        Write-Host "  Hardhat detenido" -ForegroundColor Gray
    }

    # Detener Backend
    $backend = docker ps --filter "name=documentchain-backend" --format "{{.Names}}" 2>$null
    if ($backend) {
        docker stop documentchain-backend 2>&1 | Out-Null
        Write-Host "  Backend detenido" -ForegroundColor Gray
    }
    
    # Detener IPFS Cluster
    if (Test-Path "ipfs-cluster") {
        Push-Location ipfs-cluster
        $ipfs = docker ps --filter "name=documentchain-ipfs" --format "{{.Names}}" 2>$null
        if ($ipfs) {
            docker-compose down 2>&1 | Out-Null
            Write-Host "  IPFS Cluster detenido" -ForegroundColor Gray
        }
        Pop-Location
    }
    
    Write-Host "  OK" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para volver a iniciar, ejecuta: .\start-dev.ps1" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Contenedores Docker dejados corriendo" -ForegroundColor Gray
    Write-Host "Servicios Node.js detenidos, base de datos intacta" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para iniciar solo los servicios, ejecuta: .\start-dev.ps1" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "DocumentChain detenido" -ForegroundColor Green
Write-Host ""
