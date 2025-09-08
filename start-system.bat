@echo off
echo ========================================
echo    INICIANDO SISTEMA BRIMU
echo ========================================

echo.
echo 1. Parando processos anteriores...
taskkill /F /IM node.exe 2>nul

echo.
echo 2. Iniciando Backend (porta 5000)...
start "Backend - Brimu" cmd /k "cd Backend && echo Backend iniciando... && npm run dev"

echo.
echo 3. Aguardando 5 segundos...
timeout /t 5 /nobreak

echo.
echo 4. Iniciando Frontend (porta 3002)...
start "Frontend - Brimu" cmd /k "cd Frontend && echo Frontend iniciando... && npm run dev"

echo.
echo ========================================
echo    SISTEMA INICIADO!
echo ========================================
echo.
echo Frontend: http://localhost:3002
echo Backend:  http://localhost:5000
echo.
echo Aguarde alguns segundos para os servidores iniciarem...
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

echo.
echo Abrindo navegador...
start http://localhost:3002

echo.
echo Sistema iniciado com sucesso!
echo.
pause
