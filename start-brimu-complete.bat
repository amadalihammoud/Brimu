@echo off
echo ========================================
echo    INICIANDO SISTEMA BRIMU COMPLETO
echo ========================================
echo.

echo [1/4] Verificando estrutura de pastas...
if not exist "Frontend" (
    echo ERRO: Pasta Frontend nao encontrada!
    pause
    exit /b 1
)
if not exist "Backend" (
    echo ERRO: Pasta Backend nao encontrada!
    pause
    exit /b 1
)
echo ✓ Estrutura de pastas OK
echo.

echo [2/4] Instalando dependencias do Backend...
cd Backend
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias do Backend
    pause
    exit /b 1
)
echo ✓ Backend dependencias instaladas
echo.

echo [3/4] Instalando dependencias do Frontend...
cd ..\Frontend
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias do Frontend
    pause
    exit /b 1
)
echo ✓ Frontend dependencias instaladas
echo.

echo [4/4] Iniciando servidores...
echo.
echo Iniciando Backend na porta 5000...
start "Backend Brimu" cmd /k "cd /d %~dp0Backend && npm start"

echo Aguardando 3 segundos...
timeout /t 3 /nobreak > nul

echo Iniciando Frontend na porta 3000...
start "Frontend Brimu" cmd /k "cd /d %~dp0Frontend && npm run dev"

echo.
echo ========================================
echo    SISTEMA BRIMU INICIADO COM SUCESSO!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Aguarde alguns segundos para os servidores carregarem...
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause > nul