// Teste rápido do sistema de logging
const logger = require('./dist/logging/logger').default;

console.log('🪵 Testando Sistema de Logging...\n');

// Teste 1: Log básico de info
console.log('1. Teste de log info:');
logger.info('Sistema de logging inicializado com sucesso', {
  userId: 'user123',
  requestId: 'req456'
});

// Teste 2: Log de erro com contexto
console.log('\n2. Teste de log de erro:');
const testError = new Error('Erro de teste para demonstração');
logger.error('Erro capturado durante teste', {
  userId: 'user123',
  method: 'POST',
  url: '/api/test'
}, testError);

// Teste 3: Log de ação do usuário
console.log('\n3. Teste de ação do usuário:');
logger.logUserAction('login', 'user123', {
  ip: '192.168.1.100',
  userAgent: 'Mozilla/5.0...'
});

// Teste 4: Log de requisição API
console.log('\n4. Teste de requisição API:');
logger.logApiRequest('GET', '/api/users', 200, 150, {
  requestId: 'req789',
  userId: 'user123'
});

// Teste 5: Log de operação de banco de dados
console.log('\n5. Teste de operação de banco:');
logger.logDatabaseOperation('find', 'users', 25, {
  query: { active: true },
  count: 10
});

// Teste 6: Log de evento de segurança
console.log('\n6. Teste de evento de segurança:');
logger.logSecurityEvent('failed_login_attempt', {
  ip: '192.168.1.100',
  email: 'test@example.com',
  attempts: 3
});

// Teste 7: Log de evento do sistema
console.log('\n7. Teste de evento do sistema:');
logger.logSystemEvent('server_start', {
  port: 5000,
  env: 'development',
  nodeVersion: process.version
});

console.log('\n🎉 Teste do sistema de logging concluído!');
console.log('📁 Verifique os arquivos de log em Backend/logs/');

setTimeout(() => {
  process.exit(0);
}, 1000);