@echo off
echo ========================================
echo    TESTANDO SISTEMA BRIMU
echo ========================================

echo.
echo 1. Verificando se MongoDB esta rodando...
netstat -an | find "27017" >nul
if %errorlevel% == 0 (
    echo MongoDB esta rodando na porta 27017
) else (
    echo MongoDB nao esta rodando. Iniciando...
    start "MongoDB" cmd /k "mongod --dbpath C:\data\db"
    timeout /t 3 /nobreak
)

echo.
echo 2. Testando conexao com MongoDB...
cd Backend
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/brimu').then(() => { console.log('✅ MongoDB conectado com sucesso!'); process.exit(0); }).catch(err => { console.error('❌ Erro ao conectar MongoDB:', err.message); process.exit(1); });"
if %errorlevel% == 0 (
    echo ✅ MongoDB funcionando!
) else (
    echo ❌ Problema com MongoDB
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo 3. Testando Backend...
cd Backend
start "Backend Test" cmd /k "npm run dev"
timeout /t 5 /nobreak

echo.
echo 4. Testando se Backend responde...
curl -s http://localhost:5000/api/health >nul
if %errorlevel% == 0 (
    echo ✅ Backend respondendo!
) else (
    echo ❌ Backend nao esta respondendo
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo 5. Testando Frontend...
cd Frontend
start "Frontend Test" cmd /k "npm run dev"
timeout /t 5 /nobreak

echo.
echo 6. Testando se Frontend responde...
curl -s http://localhost:3002 >nul
if %errorlevel% == 0 (
    echo ✅ Frontend respondendo!
) else (
    echo ❌ Frontend nao esta respondendo
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo    SISTEMA FUNCIONANDO!
echo ========================================
echo.
echo ✅ MongoDB: http://localhost:27017
echo ✅ Backend: http://localhost:5000
echo ✅ Frontend: http://localhost:3002
echo.
echo Abrindo navegador...
start http://localhost:3002
echo.
echo Sistema testado com sucesso!
pause
