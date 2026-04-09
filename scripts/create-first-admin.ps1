#!/usr/bin/env pwsh
# Script para crear el primer usuario administrador
# Uso: .\create-first-admin.ps1

Write-Host "=== Crear Primer Usuario Administrador ===" -ForegroundColor Cyan
Write-Host ""

# Verificar que el backend esté corriendo
$backendUrl = "https://localhost:3001"
try {
    $null = Invoke-RestMethod -Uri "$backendUrl/api/health" -SkipCertificateCheck -ErrorAction Stop
} catch {
    Write-Host "❌ Error: El backend no está corriendo en $backendUrl" -ForegroundColor Red
    Write-Host "Inicia el servidor primero: npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Backend detectado en $backendUrl" -ForegroundColor Green
Write-Host ""

# Leer .env para obtener el ADMIN_REGISTRATION_SECRET
$envPath = "$PSScriptRoot/../backend/.env"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ Error: No se encontró el archivo .env en backend/" -ForegroundColor Red
    Write-Host "Copia .env.example a .env y configura ADMIN_REGISTRATION_SECRET" -ForegroundColor Yellow
    exit 1
}

$adminSecret = $null
Get-Content $envPath | ForEach-Object {
    if ($_ -match '^ADMIN_REGISTRATION_SECRET="?([^"]+)"?$') {
        $adminSecret = $matches[1]
    }
}

if (-not $adminSecret -or $adminSecret -eq "change-this-to-a-secure-random-string-min-32-chars") {
    Write-Host "❌ Error: ADMIN_REGISTRATION_SECRET no configurado en .env" -ForegroundColor Red
    Write-Host ""
    Write-Host "Genera un secret seguro con:" -ForegroundColor Yellow
    Write-Host "  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Luego añádelo a backend/.env:" -ForegroundColor Yellow
    Write-Host '  ADMIN_REGISTRATION_SECRET="tu-secret-generado"' -ForegroundColor Cyan
    exit 1
}

Write-Host "✓ ADMIN_REGISTRATION_SECRET encontrado en .env" -ForegroundColor Green
Write-Host ""

# Solicitar datos del admin
Write-Host "Ingresa los datos del primer administrador:" -ForegroundColor Cyan
Write-Host ""

$username = Read-Host "Username (ej: admin)"
if (-not $username) {
    Write-Host "❌ Username es obligatorio" -ForegroundColor Red
    exit 1
}

$email = Read-Host "Email (ej: admin@example.com)"
if (-not $email) {
    Write-Host "❌ Email es obligatorio" -ForegroundColor Red
    exit 1
}

$password = Read-Host "Password (mínimo 6 caracteres)" -AsSecureString
$passwordBSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$passwordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($passwordBSTR)

if ($passwordPlain.Length -lt 6) {
    Write-Host "❌ La contraseña debe tener al menos 6 caracteres" -ForegroundColor Red
    exit 1
}

$fullName = Read-Host "Nombre completo (opcional, presiona Enter para omitir)"

# Crear el body del request
$body = @{
    username = $username
    email = $email
    password = $passwordPlain
    adminSecret = $adminSecret
}

if ($fullName) {
    $body.fullName = $fullName
}

$bodyJson = $body | ConvertTo-Json

Write-Host ""
Write-Host "Creando usuario administrador..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod `
        -Uri "$backendUrl/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $bodyJson `
        -SkipCertificateCheck

    Write-Host ""
    Write-Host "✅ ¡Administrador creado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Detalles del usuario:" -ForegroundColor Cyan
    Write-Host "  Username: $($response.user.username)" -ForegroundColor White
    Write-Host "  Email: $($response.user.email)" -ForegroundColor White
    Write-Host "  Role: $($response.user.role)" -ForegroundColor White
    Write-Host ""
    Write-Host "🔑 Recovery Key (GUÁRDALO EN LUGAR SEGURO):" -ForegroundColor Yellow
    Write-Host "  $($response.recoveryKey)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Ya puedes iniciar sesión en: https://localhost:5173/login" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Error al crear administrador:" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        
        Write-Host "  Status: $statusCode" -ForegroundColor Red
        Write-Host "  Error: $errorBody" -ForegroundColor Red
    } else {
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    exit 1
}
