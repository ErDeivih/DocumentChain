<#
.SYNOPSIS
    Script para desplegar DocumentChain en producción (Polygon Mumbai o Mainnet)

.DESCRIPTION
    Este script automatiza el despliegue de los contratos en Polygon y la configuración
    del backend para apuntar a ellos. Incluye validaciones de seguridad y balance.

.PARAMETER Network
    Red donde desplegar: "mumbai" (testnet) o "polygon" (mainnet)

.EXAMPLE
    .\deploy-production.ps1 -Network mumbai
    .\deploy-production.ps1 -Network polygon

.NOTES
    Requisitos previos:
    - Wallet fondeada con MATIC
    - Archivo smart-contracts/.env configurado
    - Variables de entorno de producción listas
#>

param (
    [Parameter(Mandatory = $true)]
    [ValidateSet("mumbai", "polygon")]
    [string]$Network
)

$ErrorActionPreference = "Stop"

# Colores para output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green $args }
function Write-Warning { Write-ColorOutput Yellow $args }
function Write-Error { Write-ColorOutput Red $args }
function Write-Info { Write-ColorOutput Cyan $args }

# Banner
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                                                            ║" -ForegroundColor Magenta
Write-Host "║        DocumentChain - Despliegue en Producción           ║" -ForegroundColor Magenta
Write-Host "║                                                            ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

$networkName = if ($Network -eq "mumbai") { "Polygon Mumbai (Testnet)" } else { "Polygon Mainnet (PRODUCCIÓN)" }
Write-Info "🌐 Red seleccionada: $networkName"
Write-Host ""

# Confirmación para mainnet
if ($Network -eq "polygon") {
    Write-Warning "⚠️  ADVERTENCIA: Vas a desplegar en POLYGON MAINNET"
    Write-Warning "    Esto consumirá MATIC REAL de tu wallet"
    Write-Warning "    Costo estimado: ~0.5-1 MATIC para 4 contratos"
    Write-Host ""
    $confirm = Read-Host "¿Estás seguro de continuar? (escribe 'SI' en mayúsculas)"
    if ($confirm -ne "SI") {
        Write-Error "❌ Despliegue cancelado por el usuario"
        exit 1
    }
    Write-Host ""
}

# ========================================
# PASO 1: Verificar entorno
# ========================================
Write-Info "📋 PASO 1/6: Verificando entorno..."

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Success "  ✓ Node.js $nodeVersion"
} catch {
    Write-Error "  ✗ Node.js no encontrado"
    exit 1
}

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "smart-contracts") -or -not (Test-Path "backend")) {
    Write-Error "  ✗ Debes ejecutar este script desde la raíz del proyecto"
    exit 1
}
Write-Success "  ✓ Directorio del proyecto encontrado"

# Verificar archivo .env en smart-contracts
if (-not (Test-Path "smart-contracts/.env")) {
    Write-Error "  ✗ Archivo smart-contracts/.env no encontrado"
    Write-Warning "    Copia .env.example a .env y configura las variables"
    exit 1
}
Write-Success "  ✓ Configuración de smart contracts encontrada"

Write-Host ""

# ========================================
# PASO 2: Verificar balance de la wallet
# ========================================
Write-Info "💰 PASO 2/6: Verificando balance de wallet..."

cd smart-contracts

# Cargar variables de entorno
$envContent = Get-Content .env
$privateKey = ($envContent | Select-String "PRIVATE_KEY=").ToString().Split("=")[1].Trim('"')

if (-not $privateKey -or $privateKey -eq "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80") {
    Write-Error "  ✗ PRIVATE_KEY no configurada o usando clave de desarrollo"
    Write-Warning "    Genera una wallet de producción (ver CONFIGURACION_PRODUCCION.md)"
    cd ..
    exit 1
}
Write-Success "  ✓ Private key configurada"

# Verificar balance usando hardhat
Write-Info "  Consultando balance..."

$checkBalanceScript = @"
const hre = require('hardhat');
const network = '$Network';

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const balance = await deployer.provider.getBalance(deployer.address);
    const balanceInMatic = hre.ethers.formatEther(balance);
    
    console.log(JSON.stringify({
        address: deployer.address,
        balance: balanceInMatic
    }));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
"@

$checkBalanceScript | Out-File -FilePath "scripts/temp-check-balance.js" -Encoding UTF8

try {
    $balanceOutput = npx hardhat run scripts/temp-check-balance.js --network $Network 2>&1 | Select-String "^\{.*\}" | ForEach-Object { $_.ToString() }
    $balanceData = $balanceOutput | ConvertFrom-Json
    
    $address = $balanceData.address
    $balance = [double]$balanceData.balance
    
    Write-Success "  ✓ Dirección: $address"
    Write-Success "  ✓ Balance: $balance MATIC"
    
    # Validar balance mínimo
    $minBalance = if ($Network -eq "mumbai") { 0.5 } else { 2.0 }
    if ($balance -lt $minBalance) {
        Write-Error "  ✗ Balance insuficiente (mínimo: $minBalance MATIC)"
        if ($Network -eq "mumbai") {
            Write-Warning "    Obtén MATIC de prueba: https://faucet.polygon.technology/"
        } else {
            Write-Warning "    Compra MATIC y transfiérelo a: $address"
        }
        cd ..
        exit 1
    }
    
} catch {
    Write-Error "  ✗ Error al verificar balance: $_"
    cd ..
    exit 1
} finally {
    Remove-Item "scripts/temp-check-balance.js" -ErrorAction SilentlyContinue
}

Write-Host ""

# ========================================
# PASO 3: Instalar dependencias
# ========================================
Write-Info "📦 PASO 3/6: Instalando dependencias..."

try {
    npm install --silent 2>&1 | Out-Null
    Write-Success "  ✓ Dependencias instaladas"
} catch {
    Write-Error "  ✗ Error al instalar dependencias"
    cd ..
    exit 1
}

Write-Host ""

# ========================================
# PASO 4: Compilar contratos
# ========================================
Write-Info "🔨 PASO 4/6: Compilando contratos..."

try {
    npx hardhat compile --quiet
    Write-Success "  ✓ Contratos compilados"
} catch {
    Write-Error "  ✗ Error al compilar contratos"
    cd ..
    exit 1
}

Write-Host ""

# ========================================
# PASO 5: Desplegar contratos
# ========================================
Write-Info "🚀 PASO 5/6: Desplegando contratos en $networkName..."
Write-Warning "  (Esto puede tomar 2-5 minutos...)"
Write-Host ""

try {
    $deployOutput = npx hardhat run scripts/deploy.js --network $Network 2>&1
    
    # Extraer direcciones de contratos
    $documentAccessControl = ($deployOutput | Select-String "DocumentAccessControl deployed to: (.+)").Matches.Groups[1].Value
    $documentRegistry = ($deployOutput | Select-String "DocumentRegistry deployed to: (.+)").Matches.Groups[1].Value
    $documentVersioning = ($deployOutput | Select-String "DocumentVersioning deployed to: (.+)").Matches.Groups[1].Value
    $documentSigning = ($deployOutput | Select-String "DocumentSigning deployed to: (.+)").Matches.Groups[1].Value
    
    if (-not $documentRegistry -or -not $documentVersioning -or -not $documentSigning -or -not $documentAccessControl) {
        Write-Error "  ✗ Error al extraer direcciones de contratos"
        Write-Host $deployOutput
        cd ..
        exit 1
    }
    
    Write-Success "  ✓ Contratos desplegados exitosamente!"
    Write-Host ""
    Write-Host "  📝 Direcciones de contratos:"
    Write-Host "     DocumentAccessControl:  $documentAccessControl" -ForegroundColor Green
    Write-Host "     DocumentRegistry:       $documentRegistry" -ForegroundColor Green
    Write-Host "     DocumentVersioning:     $documentVersioning" -ForegroundColor Green
    Write-Host "     DocumentSigning:        $documentSigning" -ForegroundColor Green
    
} catch {
    Write-Error "  ✗ Error al desplegar contratos: $_"
    cd ..
    exit 1
}

Write-Host ""

# ========================================
# PASO 6: Configurar backend
# ========================================
Write-Info "⚙️  PASO 6/6: Actualizando configuración del backend..."

cd ..
cd backend

$rpcUrl = if ($Network -eq "mumbai") { "https://rpc-mumbai.maticvigil.com" } else { "https://polygon-rpc.com" }

# Crear/actualizar .env.production
$envProductionContent = @"
# ========================================
# GENERADO AUTOMÁTICAMENTE - $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# Red: $networkName
# ========================================

# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# JWT
JWT_SECRET="CONFIGURAR_SECRETO_SEGURO"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="CONFIGURAR_OTRO_SECRETO_SEGURO"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="production"

# IPFS
IPFS_API_URL="https://api.pinata.cloud"
IPFS_GATEWAY_URL="https://gateway.pinata.cloud/ipfs"

# Blockchain - $networkName
BLOCKCHAIN_RPC_URL="$rpcUrl"
BLOCKCHAIN_PRIVATE_KEY="$privateKey"

# Smart Contracts (Desplegados: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
CONTRACT_DOCUMENT_REGISTRY="$documentRegistry"
CONTRACT_DOCUMENT_VERSIONING="$documentVersioning"
CONTRACT_DOCUMENT_SIGNING="$documentSigning"
CONTRACT_DOCUMENT_ACCESS_CONTROL="$documentAccessControl"

# SSL
SSL_KEY_PATH="/path/to/ssl/privkey.pem"
SSL_CERT_PATH="/path/to/ssl/fullchain.pem"
"@

$envProductionContent | Out-File -FilePath ".env.production" -Encoding UTF8

Write-Success "  ✓ Archivo .env.production creado/actualizado"

cd ..

Write-Host ""
Write-Host ""

# ========================================
# RESUMEN FINAL
# ========================================
Write-Success "╔════════════════════════════════════════════════════════════╗"
Write-Success "║                                                            ║"
Write-Success "║            ✅ DESPLIEGUE COMPLETADO CON ÉXITO              ║"
Write-Success "║                                                            ║"
Write-Success "╚════════════════════════════════════════════════════════════╝"
Write-Host ""

Write-Info "📋 RESUMEN:"
Write-Host "   Red:                $networkName"
Write-Host "   Wallet:             $address"
Write-Host "   Balance restante:   ~$balance MATIC"
Write-Host ""

Write-Info "📝 CONTRATOS DESPLEGADOS:"
Write-Host "   DocumentAccessControl:   $documentAccessControl" -ForegroundColor Green
Write-Host "   DocumentRegistry:        $documentRegistry" -ForegroundColor Green
Write-Host "   DocumentVersioning:      $documentVersioning" -ForegroundColor Green
Write-Host "   DocumentSigning:         $documentSigning" -ForegroundColor Green
Write-Host ""

$explorerUrl = if ($Network -eq "mumbai") { "https://mumbai.polygonscan.com" } else { "https://polygonscan.com" }
Write-Info "🔍 VERIFICAR CONTRATOS EN:"
Write-Host "   $explorerUrl/address/$documentRegistry"
Write-Host ""

Write-Info "📂 CONFIGURACIÓN GENERADA:"
Write-Host "   backend/.env.production"
Write-Host ""

Write-Warning "⚠️  PRÓXIMOS PASOS:"
Write-Host "   1. Revisa backend/.env.production y completa las variables faltantes"
Write-Host "   2. Configura DATABASE_URL, JWT_SECRET, IPFS, etc."
Write-Host "   3. Verifica los contratos en PolygonScan (opcional pero recomendado)"
Write-Host "   4. Prueba el backend: cd backend && npm run start"
Write-Host ""

if ($Network -eq "mumbai") {
    Write-Info "💡 TESTNET - Puedes hacer cambios y redesplegar sin costo"
} else {
    Write-Warning "🔒 MAINNET - Guarda las direcciones de los contratos de forma segura"
    Write-Warning "    No podrás cambiarlas sin redesplegar (costo adicional)"
}

Write-Host ""
Write-Success "¡Listo para producción! 🎉"
Write-Host ""
