# DocumentChain - Script de inicio simple
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DocumentChain - Inicio Desarrollo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Set-Location $PSScriptRoot

# Verificar Node.js
Write-Host "[1/3] Verificando Node.js..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "  Error: Node.js no instalado" -ForegroundColor Red
    exit 1
}
Write-Host "  OK: Node.js $(node --version)" -ForegroundColor Green
Write-Host ""

# Verificar Docker
Write-Host "[2/3] Verificando Docker..." -ForegroundColor Yellow
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "  Error: Docker no instalado" -ForegroundColor Red
    exit 1
}
$dockerCheck = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Error: Docker no esta corriendo" -ForegroundColor Red
    exit 1
}
Write-Host "  OK: Docker corriendo" -ForegroundColor Green
Write-Host ""

# Configurar archivos .env
Write-Host "[3/3] Configurando archivos .env..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env")) {
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Host "  OK: backend/.env creado" -ForegroundColor Green
    }
}
if (-not (Test-Path "frontend\.env")) {
    if (Test-Path "frontend\.env.example") {
        Copy-Item "frontend\.env.example" "frontend\.env"
        Write-Host "  OK: frontend/.env creado" -ForegroundColor Green
    }
}
Write-Host ""

# Iniciar servicios Docker
Write-Host "Iniciando servicios Docker..." -ForegroundColor Yellow
docker-compose up -d postgres postfix 2>&1 | Out-Null
Start-Sleep -Seconds 3
Write-Host "  OK: PostgreSQL y Postfix iniciados" -ForegroundColor Green
Write-Host ""

# Liberar puertos
Write-Host "Liberando puertos..." -ForegroundColor Yellow
$ports = @(8545, 3000, 5173)
foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        $pid = $conn.OwningProcess
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "  OK: Puertos liberados" -ForegroundColor Green
Write-Host ""

# Iniciar servicios
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Iniciando servicios..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Iniciando Hardhat..." -ForegroundColor Yellow
$hardhatProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd smart-contracts; npx hardhat node" -PassThru -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "  OK: Hardhat corriendo" -ForegroundColor Green
Write-Host ""

Write-Host "Iniciando Backend..." -ForegroundColor Yellow
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -PassThru -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "  OK: Backend corriendo" -ForegroundColor Green
Write-Host ""

Write-Host "Iniciando Frontend..." -ForegroundColor Yellow
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -PassThru -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "  OK: Frontend corriendo" -ForegroundColor Green
Write-Host ""

# Resumen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sistema listo!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "ACCESO:" -ForegroundColor White
Write-Host "  Frontend:  https://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend:   https://localhost:3000" -ForegroundColor Cyan
Write-Host "  Hardhat:   http://localhost:8545" -ForegroundColor Cyan
Write-Host ""
Write-Host "SERVICIOS:" -ForegroundColor White
Write-Host "  PostgreSQL: localhost:5432" -ForegroundColor Cyan
Write-Host "  Postfix:    localhost:587" -ForegroundColor Cyan
Write-Host ""
Write-Host "IPFS Provider: " -NoNewline
$ipfsProvider = "self-hosted"
if (Test-Path "backend\.env") {
    $envContent = Get-Content "backend\.env" -Raw
    if ($envContent -match 'IPFS_PROVIDER=\"?([\w-]+)\"?') {
        $ipfsProvider = $Matches[1]
    }
}
if ($ipfsProvider -eq "self-hosted") {
    Write-Host "Nodo propio" -ForegroundColor Green
} else {
    Write-Host $ipfsProvider -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Para detener:" -ForegroundColor Yellow
Write-Host "  Stop-Process -Id $($hardhatProcess.Id), $($backendProcess.Id), $($frontendProcess.Id)" -ForegroundColor Gray
Write-Host ""
