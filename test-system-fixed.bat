@echo off
echo ========================================
echo    TESTANDO SISTEMA BRIMU CORRIGIDO
echo ========================================
echo.

echo [1/3] Verificando se o backend está rodando...
curl -s http://localhost:5000/api/health > nul
if %errorlevel% equ 0 (
    echo ✓ Backend está rodando na porta 5000
) else (
    echo ✗ Backend não está rodando na porta 5000
    echo Iniciando backend...
    start "Backend Brimu" cmd /k "cd /d %~dp0Backend && npm start"
    echo Aguardando 5 segundos...
    timeout /t 5 /nobreak > nul
)

echo.
echo [2/3] Verificando se o frontend está rodando...
curl -s http://localhost:3000 > nul
if %errorlevel% equ 0 (
    echo ✓ Frontend está rodando na porta 3000
) else (
    echo ✗ Frontend não está rodando na porta 3000
    echo Iniciando frontend...
    start "Frontend Brimu" cmd /k "cd /d %~dp0Frontend && npm run dev"
    echo Aguardando 5 segundos...
    timeout /t 5 /nobreak > nul
)

echo.
echo [3/3] Testando login...
curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@brimu.com\",\"password\":\"admin123\"}" > nul
if %errorlevel% equ 0 (
    echo ✓ Login funcionando
) else (
    echo ✗ Login não está funcionando
)

echo.
echo ========================================
echo    TESTE CONCLUÍDO
echo ========================================
echo.
echo URLs do sistema:
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Credenciais de teste:
echo Admin: admin@brimu.com / admin123
echo Usuário: teste@brimu.com / teste123
echo.
echo Pressione qualquer tecla para fechar...
pause > nul
