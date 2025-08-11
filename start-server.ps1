# Script para iniciar el servidor del Explorador Planetario
Write-Host "🚀 Iniciando servidor del Explorador Planetario..." -ForegroundColor Green

# Navegar al directorio del servidor
Set-Location ".\server"

# Iniciar el servidor
Write-Host "📡 Iniciando servidor en puerto 3000..." -ForegroundColor Yellow
npx ts-node src/index.ts

# Mantener la ventana abierta
Write-Host "⏸️ Presiona cualquier tecla para cerrar..." -ForegroundColor Red
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
