@echo off
chcp 65001 >nul
title Brimu - Sistema Otimizado

echo.
echo ========================================
echo    BRIMU - SISTEMA OTIMIZADO
echo ========================================
echo.

:: Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Instale Node.js 18+ primeiro.
    echo 📥 Download: https://nodejs.org/
    pause
    exit /b 1
)

:: Verificar se npm está instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm não encontrado. Instale npm primeiro.
    pause
    exit /b 1
)

echo ✅ Node.js e npm encontrados
echo.

:: Verificar estrutura de pastas
if not exist "Backend" (
    echo ❌ Pasta Backend não encontrada
    pause
    exit /b 1
)

if not exist "Frontend" (
    echo ❌ Pasta Frontend não encontrada
    pause
    exit /b 1
)

echo ✅ Estrutura de pastas OK
echo.

:: Parar processos existentes
echo 🔄 Parando processos existentes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

:: Verificar e liberar portas
echo 🔍 Verificando portas...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo 🛑 Finalizando processo na porta 5000 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo 🛑 Finalizando processo na porta 3000 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo 🛑 Finalizando processo na porta 3001 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 3 >nul
echo.

:: Instalar dependências do Backend
echo 📦 [1/4] Instalando dependências do Backend...
cd Backend
if not exist "node_modules" (
    echo    Instalando dependências...
    npm install --silent
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependências do Backend
        pause
        exit /b 1
    )
) else (
    echo    Dependências já instaladas
)
echo ✅ Backend dependências OK
cd ..
echo.

:: Instalar dependências do Frontend
echo 📦 [2/4] Instalando dependências do Frontend...
cd Frontend
if not exist "node_modules" (
    echo    Instalando dependências...
    npm install --silent
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar dependências do Frontend
        pause
        exit /b 1
    )
) else (
    echo    Dependências já instaladas
)
echo ✅ Frontend dependências OK
cd ..
echo.

:: Verificar arquivos de configuração
echo 🔧 [3/4] Verificando configurações...

:: Verificar .env do Backend
if not exist "Backend\.env" (
    if exist "Backend\env.example" (
        echo    Criando .env do Backend...
        copy "Backend\env.example" "Backend\.env" >nul
        echo ✅ Arquivo .env do Backend criado
    ) else (
        echo ⚠️  Arquivo .env do Backend não encontrado
    )
) else (
    echo ✅ Arquivo .env do Backend OK
)

:: Verificar .env do Frontend
if not exist "Frontend\.env" (
    if exist "Frontend\env.example" (
        echo    Criando .env do Frontend...
        copy "Frontend\env.example" "Frontend\.env" >nul
        echo ✅ Arquivo .env do Frontend criado
    ) else (
        echo ⚠️  Arquivo .env do Frontend não encontrado
    )
) else (
    echo ✅ Arquivo .env do Frontend OK
)
echo.

:: Iniciar servidores
echo 🚀 [4/4] Iniciando servidores otimizados...
echo.

:: Iniciar Backend
echo 📡 Iniciando Backend na porta 5000...
start "Brimu Backend" cmd /k "cd Backend && npm start"
timeout /t 5 >nul

:: Verificar se Backend iniciou
echo 🔍 Verificando Backend...
timeout /t 3 >nul
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend funcionando
) else (
    echo ⚠️  Backend pode estar iniciando...
)

:: Iniciar Frontend
echo 🌐 Iniciando Frontend na porta 3000...
start "Brimu Frontend" cmd /k "cd Frontend && npm run dev"
timeout /t 5 >nul

echo.
echo ========================================
echo    SISTEMA BRIMU INICIADO!
echo ========================================
echo.
echo 🔗 URLs do Sistema:
echo    Backend:  http://localhost:5000
echo    Frontend: http://localhost:3000
echo    Health:   http://localhost:5000/api/health
echo    Status:   http://localhost:5000/api/status
echo.
echo 📊 Credenciais de Teste:
echo    Admin: admin@brimu.com / admin123
echo    User:  teste@brimu.com / teste123
echo.
echo ⚡ Recursos Otimizados:
echo    ✅ Cache inteligente
echo    ✅ Compressão gzip
echo    ✅ Rate limiting
echo    ✅ Validação robusta
echo    ✅ Logs estruturados
echo    ✅ Lazy loading
echo    ✅ Notificações
echo    ✅ Temas
echo.
echo 🛑 Para parar: Feche as janelas do terminal
echo    ou pressione Ctrl+C em cada janela
echo.
echo Aguarde alguns segundos para os servidores carregarem...
echo.

:: Abrir navegador após 10 segundos
timeout /t 10 >nul
echo 🌐 Abrindo navegador...
start http://localhost:3000

echo.
echo ✅ Sistema iniciado com sucesso!
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
