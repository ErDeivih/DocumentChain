# Script de verificación del sistema
# Comprueba el entorno Docker y la compilación del backend con la configuración actual.

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "VERIFICACIÓN DEL SISTEMA TFG" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$errorCount = 0

# 1. Verificar Docker
Write-Host "1. Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerInfo = docker ps --filter "name=documentchain-postgres" --format "{{.Names}}: {{.Status}}" 2>&1
    if ($dockerInfo -match "documentchain-postgres.*Up") {
        Write-Host "   ✓ PostgreSQL corriendo" -ForegroundColor Green
    } else {
        Write-Host "   ✗ PostgreSQL no está corriendo" -ForegroundColor Red
        $errorCount++
    }
} catch {
    Write-Host "   ✗ Docker no disponible: $_" -ForegroundColor Red
    $errorCount++
}

# 2. Verificar Base de Datos
Write-Host "`n2. Verificando Base de Datos..." -ForegroundColor Yellow
try {
    $dbCheck = docker exec documentchain-postgres psql -U documentchain -d documentchain -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>&1
    if ($dbCheck -match "\d+") {
        Write-Host "   ✓ Base de datos accesible" -ForegroundColor Green

        $documentSignatureColumns = docker exec documentchain-postgres psql -U documentchain -d documentchain -t -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'DocumentSignature' AND column_name IN ('signerUsernameSnapshot', 'signerFullNameSnapshot', 'signerWalletAddressSnapshot');" 2>&1
        if ($documentSignatureColumns -match "signerUsernameSnapshot" -and $documentSignatureColumns -match "signerFullNameSnapshot") {
            Write-Host "   ✓ Snapshot de firmantes presente en DocumentSignature" -ForegroundColor Green
        } else {
            Write-Host "   ✗ Faltan columnas snapshot en DocumentSignature" -ForegroundColor Red
            $errorCount++
        }
    } else {
        Write-Host "   ✗ No se puede conectar a la base de datos" -ForegroundColor Red
        $errorCount++
    }
} catch {
    Write-Host "   ✗ Error al verificar base de datos: $_" -ForegroundColor Red
    $errorCount++
}

# 3. Verificar Prisma Client
Write-Host "`n3. Verificando Prisma Client..." -ForegroundColor Yellow
if (Test-Path "node_modules/@prisma/client") {
    Write-Host "   ✓ Prisma Client instalado" -ForegroundColor Green
} else {
    Write-Host "   ✗ Prisma Client no encontrado" -ForegroundColor Red
    $errorCount++
}

# 4. Verificar Compilación TypeScript
Write-Host "`n4. Verificando Compilación TypeScript..." -ForegroundColor Yellow
npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ TypeScript compila sin errores" -ForegroundColor Green
} else {
    Write-Host "   ✗ Errores de compilación TypeScript" -ForegroundColor Red
    $errorCount++
}

# 5. Verificar Archivos Clave
Write-Host "`n5. Verificando Archivos Clave..." -ForegroundColor Yellow

$keyFiles = @(
    "src/lib/blockchain/queries.ts",
    "src/utils/errors.ts",
    "src/schemas/verification.schema.ts",
    "src/middleware/errorHandler.ts",
    "src/services/documentService.ts",
    "src/services/versionService.ts",
    "src/services/signatureService.ts",
    "prisma/schema.prisma",
    ".env"
)

foreach ($file in $keyFiles) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file no encontrado" -ForegroundColor Red
        $errorCount++
    }
}

# 6. Verificar Variables de Entorno
Write-Host "`n6. Verificando Variables de Entorno..." -ForegroundColor Yellow
$env = Get-Content .env -Raw
$requiredVars = @(
    "DATABASE_URL",
    "JWT_SECRET",
    "BLOCKCHAIN_RPC_URL",
    "CONTRACT_DOCUMENT_REGISTRY",
    "IPFS_API_URL",
    "ALLOWED_ORIGINS"
)

foreach ($var in $requiredVars) {
    if ($env -match $var) {
        Write-Host "   ✓ $var configurada" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $var no encontrada" -ForegroundColor Red
        $errorCount++
    }
}

# Resumen Final
Write-Host "`n========================================" -ForegroundColor Cyan
if ($errorCount -eq 0) {
    Write-Host "✅ VERIFICACIÓN EXITOSA" -ForegroundColor Green
    Write-Host "Todos los componentes están correctamente configurados" -ForegroundColor Green
    Write-Host "`nEl sistema está listo para:" -ForegroundColor Cyan
    Write-Host "  • Desarrollo local (npm run dev)" -ForegroundColor White
    Write-Host "  • Testing de endpoints" -ForegroundColor White
    Write-Host "  • Integración con blockchain" -ForegroundColor White
} else {
    Write-Host "❌ VERIFICACIÓN FALLIDA" -ForegroundColor Red
    Write-Host "Se encontraron $errorCount error(es)" -ForegroundColor Red
    Write-Host "Revisa los mensajes anteriores para más detalles" -ForegroundColor Yellow
}
Write-Host "========================================`n" -ForegroundColor Cyan

exit $errorCount
