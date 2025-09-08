@echo off
echo ========================================
echo    🚀 INICIANDO SISTEMA BRIMU 🚀
echo ========================================
echo.

echo 📋 Verificando dependências...
cd /d "%~dp0"

echo.
echo 🔧 Instalando dependências do Frontend...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências do Frontend
    pause
    exit /b 1
)

echo.
echo 🔧 Instalando dependências do Backend...
cd ..\Backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências do Backend
    pause
    exit /b 1
)

echo.
echo 🗄️ Verificando arquivo .env do Backend...
if not exist .env (
    echo ⚠️ Arquivo .env não encontrado no Backend
    echo 📝 Copiando env.example para .env...
    copy env.example .env
    echo ✅ Arquivo .env criado. Configure as variáveis necessárias.
)

echo.
echo 🗄️ Verificando arquivo .env do Frontend...
cd ..\Frontend
if not exist .env (
    echo ⚠️ Arquivo .env não encontrado no Frontend
    echo 📝 Copiando env.example para .env...
    copy env.example .env
    echo ✅ Arquivo .env criado.
)

echo.
echo 🚀 Iniciando Backend...
cd ..\Backend
start "Brimu Backend" cmd /k "npm start"

echo.
echo ⏳ Aguardando Backend inicializar...
timeout /t 5 /nobreak >nul

echo.
echo 🚀 Iniciando Frontend...
cd ..\Frontend
start "Brimu Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo    ✅ SISTEMA BRIMU INICIADO! ✅
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:3002
echo 🔧 Backend: http://localhost:5000
echo.
echo 📋 Para acessar o sistema:
echo    1. Abra seu navegador
echo    2. Acesse http://localhost:3002
echo    3. Use o Portal de Acesso para entrar no sistema
echo.
echo ⚠️ Mantenha esta janela aberta para monitorar o sistema
echo.
pause
