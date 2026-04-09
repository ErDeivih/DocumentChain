# Script para resetear la base de datos (eliminar todos los usuarios)
# Útil para demos y testing

Write-Host "`n🗑️  RESETEAR BASE DE DATOS`n" -ForegroundColor Yellow
Write-Host "⚠️  ADVERTENCIA: Esto eliminará TODOS los usuarios (excepto el admin por defecto)" -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "¿Estás seguro? Escribe 'SI' para confirmar"

if ($confirm -ne "SI") {
    Write-Host "`n❌ Cancelado" -ForegroundColor Yellow
    exit
}

Write-Host "`n🔄 Reseteando base de datos..." -ForegroundColor Cyan

# Resetear migraciones y datos
npx prisma migrate reset --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Base de datos reseteada" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Próximos pasos:" -ForegroundColor Yellow
    Write-Host "   1. Crear admin por defecto:" -ForegroundColor White
    Write-Host "      npm run prisma:seed" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Reiniciar backend:" -ForegroundColor White
    Write-Host "      npm run dev" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "`n❌ Error reseteando base de datos" -ForegroundColor Red
    Write-Host "Verifica que PostgreSQL esté corriendo" -ForegroundColor Yellow
    exit 1
}
