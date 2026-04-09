# Script para generar certificados SSL auto-firmados en Windows
# USO: powershell -ExecutionPolicy Bypass -File backend\scripts\generate-ssl.ps1

Write-Host "🔒 Generando certificados SSL para desarrollo..." -ForegroundColor Cyan

# Crear directorio ssl si no existe
New-Item -ItemType Directory -Force -Path "backend\ssl" | Out-Null

# Verificar si OpenSSL está instalado
$openssl = Get-Command openssl -ErrorAction SilentlyContinue

if ($openssl) {
    Write-Host "✅ Usando OpenSSL..." -ForegroundColor Green
    
    & openssl req -x509 -newkey rsa:4096 `
        -keyout backend\ssl\private-key.pem `
        -out backend\ssl\certificate.pem `
        -days 365 -nodes `
        -subj "/C=ES/ST=Madrid/L=Madrid/O=DocumentChain/OU=Development/CN=localhost"
    
} else {
    Write-Host "⚠️  OpenSSL no encontrado, usando PowerShell nativo..." -ForegroundColor Yellow
    
    # Crear certificado auto-firmado con PowerShell
    $cert = New-SelfSignedCertificate `
        -Subject "CN=localhost" `
        -DnsName "localhost", "127.0.0.1" `
        -NotAfter (Get-Date).AddYears(1) `
        -CertStoreLocation "Cert:\CurrentUser\My" `
        -FriendlyName "DocumentChain Development" `
        -KeyUsage DigitalSignature,KeyEncipherment `
        -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.1")
    
    # Exportar a PFX temporal
    $password = ConvertTo-SecureString -String "temp123" -Force -AsPlainText
    $pfxPath = "backend\ssl\temp.pfx"
    Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $password | Out-Null
    
    # Convertir PFX a PEM (requiere OpenSSL)
    if (Get-Command openssl -ErrorAction SilentlyContinue) {
        & openssl pkcs12 -in $pfxPath -nocerts -out "backend\ssl\private-key.pem" -nodes -passin pass:temp123
        & openssl pkcs12 -in $pfxPath -nokeys -out "backend\ssl\certificate.pem" -passin pass:temp123
        Remove-Item $pfxPath
    } else {
        Write-Host ""
        Write-Host "❌ ERROR: Se necesita OpenSSL para el paso final." -ForegroundColor Red
        Write-Host "   Instala OpenSSL desde: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Yellow
        Write-Host "   O usa WSL/Git Bash para ejecutar: bash backend/scripts/generate-ssl.sh" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Certificados SSL generados correctamente:" -ForegroundColor Green
Write-Host "   📄 backend\ssl\private-key.pem" -ForegroundColor White
Write-Host "   📄 backend\ssl\certificate.pem" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  NOTA: Estos certificados son AUTO-FIRMADOS y solo para DESARROLLO." -ForegroundColor Yellow
Write-Host "   Los navegadores mostrarán advertencia de seguridad (normal)." -ForegroundColor Yellow
Write-Host ""
Write-Host "Para usar:" -ForegroundColor Cyan
Write-Host "   1. Asegúrate de que .env tenga:" -ForegroundColor White
Write-Host "      SSL_KEY_PATH=`"./ssl/private-key.pem`"" -ForegroundColor Gray
Write-Host "      SSL_CERT_PATH=`"./ssl/certificate.pem`"" -ForegroundColor Gray
Write-Host "   2. Ejecuta: npm run dev" -ForegroundColor White
Write-Host "   3. Visita: https://localhost:3000" -ForegroundColor White
Write-Host "   4. Acepta la advertencia del navegador" -ForegroundColor White
Write-Host ""
