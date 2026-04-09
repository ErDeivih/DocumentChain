#!/usr/bin/env pwsh
# Script para generar un secret seguro aleatorio
# Uso: .\generate-admin-secret.ps1

Write-Host "=== Generador de Admin Secret ===" -ForegroundColor Cyan
Write-Host ""

# Generar secret de 32 bytes en base64
$randomBytes = 1..32 | ForEach-Object { Get-Random -Maximum 256 }
$secret = [Convert]::ToBase64String($randomBytes)

Write-Host "✨ Secret generado:" -ForegroundColor Green
Write-Host ""
Write-Host $secret -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Copia este secret a tu archivo backend/.env:" -ForegroundColor Cyan
Write-Host ""
Write-Host 'ADMIN_REGISTRATION_SECRET="' -NoNewline -ForegroundColor Gray
Write-Host $secret -NoNewline -ForegroundColor Yellow
Write-Host '"' -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Guarda este secret en un lugar seguro." -ForegroundColor Red
Write-Host "   Solo quienes tengan este secret pueden crear usuarios admin." -ForegroundColor Red
Write-Host ""

# Preguntar si quiere añadirlo automáticamente al .env
$envPath = Join-Path $PSScriptRoot ".." "backend" ".env"

if (Test-Path $envPath) {
    $response = Read-Host "¿Quieres añadir este secret automáticamente a backend/.env? (s/n)"
    
    if ($response -eq 's' -or $response -eq 'S') {
        # Leer contenido actual
        $envContent = Get-Content $envPath -Raw
        
        # Verificar si ya existe ADMIN_REGISTRATION_SECRET
        if ($envContent -match 'ADMIN_REGISTRATION_SECRET=') {
            Write-Host ""
            Write-Host "⚠️  ADMIN_REGISTRATION_SECRET ya existe en .env" -ForegroundColor Yellow
            $overwrite = Read-Host "¿Quieres reemplazarlo? (s/n)"
            
            if ($overwrite -eq 's' -or $overwrite -eq 'S') {
                $envContent = $envContent -replace 'ADMIN_REGISTRATION_SECRET="?[^"]*"?', "ADMIN_REGISTRATION_SECRET=`"$secret`""
                Set-Content -Path $envPath -Value $envContent -NoNewline
                Write-Host "✅ Secret actualizado en backend/.env" -ForegroundColor Green
            } else {
                Write-Host "❌ Operación cancelada" -ForegroundColor Red
            }
        } else {
            # Añadir al final del archivo
            Add-Content -Path $envPath -Value "`nADMIN_REGISTRATION_SECRET=`"$secret`""
            Write-Host "✅ Secret añadido a backend/.env" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "🔄 Recuerda reiniciar el backend para que tome efecto:" -ForegroundColor Yellow
        Write-Host "   cd backend && npm run dev" -ForegroundColor Cyan
    }
} else {
    Write-Host "⚠️  No se encontró backend/.env" -ForegroundColor Yellow
    Write-Host "   Crea el archivo primero: cp backend/.env.example backend/.env" -ForegroundColor Cyan
}

Write-Host ""
