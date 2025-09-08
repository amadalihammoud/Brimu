@echo off
echo ========================================
echo    TESTANDO FRONTEND BRIMU
echo ========================================

echo.
echo 1. Verificando se Frontend esta rodando...
curl -s http://localhost:3002 >nul
if %errorlevel% == 0 (
    echo ✅ Frontend respondendo!
) else (
    echo ❌ Frontend nao esta respondendo
    echo Iniciando Frontend...
    cd Frontend
    start "Frontend Test" cmd /k "npm run dev"
    timeout /t 5 /nobreak
    cd ..
)

echo.
echo 2. Verificando se Backend esta rodando...
curl -s http://localhost:5000/api/health >nul
if %errorlevel% == 0 (
    echo ✅ Backend respondendo!
) else (
    echo ❌ Backend nao esta respondendo
    echo Iniciando Backend...
    cd Backend
    start "Backend Test" cmd /k "npm run dev"
    timeout /t 5 /nobreak
    cd ..
)

echo.
echo 3. Abrindo navegador...
start http://localhost:3002

echo.
echo ========================================
echo    TESTE CONCLUIDO!
echo ========================================
echo.
echo Se a pagina estiver em branco, verifique o console do navegador (F12)
echo para ver se ha erros de JavaScript.
echo.
pause
