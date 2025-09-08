@echo off
echo ========================================
echo    CORRIGINDO SISTEMA BRIMU
echo ========================================

echo.
echo 1. Verificando MongoDB...
if exist "C:\Program Files\MongoDB\Server\*\bin\mongod.exe" (
    echo MongoDB encontrado!
) else (
    echo MongoDB nao encontrado. Instalando...
    echo Execute o arquivo install-mongodb-complete.bat primeiro
    pause
    exit /b 1
)

echo.
echo 2. Criando arquivos de configuracao...

REM Criar .env para Backend
echo # Configuracoes do Servidor > Backend\.env
echo PORT=5000 >> Backend\.env
echo NODE_ENV=development >> Backend\.env
echo. >> Backend\.env
echo # Banco de Dados MongoDB >> Backend\.env
echo MONGODB_URI=mongodb://localhost:27017/brimu >> Backend\.env
echo. >> Backend\.env
echo # JWT (JSON Web Token) >> Backend\.env
echo JWT_SECRET=brimu_secret_key_2024_very_secure_12345 >> Backend\.env
echo JWT_EXPIRES_IN=7d >> Backend\.env
echo. >> Backend\.env
echo # Email (Nodemailer) >> Backend\.env
echo EMAIL_HOST=smtp.gmail.com >> Backend\.env
echo EMAIL_PORT=587 >> Backend\.env
echo EMAIL_USER=seu_email@gmail.com >> Backend\.env
echo EMAIL_PASS=sua_senha_de_app_do_gmail >> Backend\.env
echo. >> Backend\.env
echo # Upload de Arquivos >> Backend\.env
echo MAX_FILE_SIZE=10485760 >> Backend\.env
echo UPLOAD_PATH=uploads >> Backend\.env
echo PUBLIC_PATH=public >> Backend\.env
echo. >> Backend\.env
echo # CORS >> Backend\.env
echo CORS_ORIGIN=http://localhost:3002 >> Backend\.env
echo. >> Backend\.env
echo # Rate Limiting >> Backend\.env
echo RATE_LIMIT_WINDOW_MS=900000 >> Backend\.env
echo RATE_LIMIT_MAX_REQUESTS=100 >> Backend\.env
echo. >> Backend\.env
echo # Logs >> Backend\.env
echo LOG_LEVEL=info >> Backend\.env
echo LOG_FILE=logs/app.log >> Backend\.env

REM Criar .env para Frontend
echo # Configuracoes do Frontend > Frontend\.env
echo REACT_APP_API_URL=http://localhost:5000/api >> Frontend\.env
echo REACT_APP_APP_NAME=Brimu >> Frontend\.env
echo REACT_APP_VERSION=1.0.0 >> Frontend\.env
echo. >> Frontend\.env
echo # Configuracoes de Upload >> Frontend\.env
echo REACT_APP_MAX_FILE_SIZE=10485760 >> Frontend\.env
echo REACT_APP_MAX_FILES_PER_UPLOAD=10 >> Frontend\.env
echo. >> Frontend\.env
echo # Configuracoes de Desenvolvimento >> Frontend\.env
echo REACT_APP_DEBUG=true >> Frontend\.env
echo REACT_APP_LOG_LEVEL=info >> Frontend\.env

echo.
echo 3. Instalando dependencias do Backend...
cd Backend
call npm install
cd ..

echo.
echo 4. Instalando dependencias do Frontend...
cd Frontend
call npm install
cd ..

echo.
echo 5. Criando diretorios necessarios...
if not exist "Backend\uploads" mkdir Backend\uploads
if not exist "Backend\public" mkdir Backend\public
if not exist "Backend\logs" mkdir Backend\logs

echo.
echo 6. Iniciando MongoDB...
start "MongoDB" cmd /k "mongod --dbpath C:\data\db"

echo.
echo 7. Aguardando 5 segundos para MongoDB inicializar...
timeout /t 5 /nobreak

echo.
echo 8. Testando conexao com MongoDB...
cd Backend
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/brimu').then(() => { console.log('MongoDB conectado com sucesso!'); process.exit(0); }).catch(err => { console.error('Erro ao conectar MongoDB:', err.message); process.exit(1); });"
cd ..

echo.
echo ========================================
echo    SISTEMA CORRIGIDO!
echo ========================================
echo.
echo Agora execute o arquivo start-system.bat para iniciar o sistema
echo.
pause
