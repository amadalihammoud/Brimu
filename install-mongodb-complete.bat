@echo off
echo ========================================
echo    🗄️ INSTALANDO MONGODB COMPLETO
echo ========================================
echo.

echo 📋 Verificando se MongoDB já está instalado...
where mongod >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB já está instalado!
    mongod --version
    echo.
    echo 🚀 Iniciando MongoDB...
    net start MongoDB >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ MongoDB iniciado com sucesso!
    ) else (
        echo ⚠️ Tentando iniciar MongoDB manualmente...
        start "MongoDB" mongod --dbpath "C:\data\db"
        timeout /t 3 /nobreak >nul
    )
    goto :test
)

echo ❌ MongoDB não encontrado!
echo.
echo 📥 Baixando MongoDB Community Server...
echo.

REM Criar diretório para dados
if not exist "C:\data\db" (
    echo 📁 Criando diretório de dados...
    mkdir "C:\data\db" 2>nul
)

echo 🌐 Abrindo página de download do MongoDB...
echo.
echo ⚠️  INSTRUÇÕES PARA INSTALAÇÃO:
echo.
echo 1. A página do MongoDB será aberta automaticamente
echo 2. Clique em "Download" para baixar o instalador
echo 3. Execute o arquivo .msi baixado
echo 4. Durante a instalação:
echo    ✅ Marque "Install MongoDB as a Service"
echo    ✅ Marque "Install MongoDB Compass" (opcional)
echo    ✅ Use a porta padrão 27017
echo    ✅ Use o diretório padrão C:\Program Files\MongoDB
echo.
echo 5. Após a instalação, execute este script novamente
echo.

start https://www.mongodb.com/try/download/community

echo.
echo ⏳ Aguardando instalação...
echo Pressione qualquer tecla quando terminar a instalação...
pause >nul

echo.
echo 🔍 Verificando instalação...
where mongod >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB instalado com sucesso!
    mongod --version
    echo.
    echo 🚀 Iniciando MongoDB...
    net start MongoDB >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ MongoDB iniciado como serviço!
    ) else (
        echo ⚠️ Iniciando MongoDB manualmente...
        start "MongoDB" mongod --dbpath "C:\data\db"
        timeout /t 3 /nobreak >nul
    )
) else (
    echo ❌ MongoDB ainda não foi instalado corretamente
    echo 📋 Verifique se:
    echo    1. O instalador foi executado
    echo    2. A instalação foi concluída
    echo    3. O MongoDB foi adicionado ao PATH
    echo.
    pause
    exit /b 1
)

:test
echo.
echo 🧪 Testando conexão com MongoDB...
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/brimu').then(() => { console.log('✅ MongoDB conectado com sucesso!'); process.exit(0); }).catch(err => { console.log('❌ Erro ao conectar MongoDB:', err.message); process.exit(1); });"

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo    ✅ MONGODB INSTALADO E FUNCIONANDO!
    echo ========================================
    echo.
    echo 🌐 MongoDB rodando em: mongodb://localhost:27017
    echo 📁 Diretório de dados: C:\data\db
    echo 🔧 Comando para iniciar: net start MongoDB
    echo 🔧 Comando para parar: net stop MongoDB
    echo.
) else (
    echo.
    echo ========================================
    echo    ⚠️ MONGODB INSTALADO MAS COM PROBLEMAS
    echo ========================================
    echo.
    echo 🔧 Tente executar manualmente:
    echo    net start MongoDB
    echo.
    echo 🔧 Ou inicie manualmente:
    echo    mongod --dbpath "C:\data\db"
    echo.
)

echo.
pause
