@echo off
REM ============================================
REM DocumentChain - Script de inicio desarrollo
REM ============================================

echo.
echo ========================================
echo    DocumentChain - Desarrollo
echo ========================================
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado
    pause
    exit /b 1
)

echo [OK] Node.js instalado
echo.

REM Iniciar Hardhat Network en ventana separada
echo [1/3] Iniciando Hardhat Network (Blockchain local)...
start "Hardhat Network" cmd /k "cd /d %~dp0smart-contracts && npx hardhat node"
echo       Esperando 8 segundos a que inicie...
timeout /t 8 /nobreak >nul
echo       [OK] Hardhat Network corriendo en http://localhost:8545
echo.

REM Iniciar Backend en ventana separada
echo [2/3] Iniciando Backend API...
start "Backend API" cmd /k "cd /d %~dp0backend && npm run dev"
echo       Esperando 5 segundos a que inicie...
timeout /t 5 /nobreak >nul
echo       [OK] Backend corriendo en http://localhost:3000
echo.

REM Iniciar Frontend en ventana separada
echo [3/3] Iniciando Frontend...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
echo       Esperando 3 segundos a que inicie...
timeout /t 3 /nobreak >nul
echo       [OK] Frontend corriendo en https://localhost:5173
echo.

echo ========================================
echo    TODOS LOS SERVICIOS INICIADOS
echo ========================================
echo.
echo  Frontend:   https://localhost:5173
echo  Backend:    http://localhost:3000
echo  Blockchain: http://localhost:8545
echo.
echo Para detener, cierra las ventanas abiertas
echo.
pause
