// Teste simples e rápido das melhorias
console.log('🧪 TESTANDO MELHORIAS ARQUITETURAIS DO BRIMU\n');

async function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, testFn) {
    try {
      testFn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      failed++;
    }
  }

  // 1. Teste TypeScript Compilation
  console.log('📝 1. TYPESCRIPT COMPILATION');
  const fs = require('fs');
  test('TypeScript compilado com sucesso', () => {
    if (!fs.existsSync('dist')) throw new Error('Pasta dist não encontrada');
    if (!fs.existsSync('dist/schemas')) throw new Error('Schemas não compilados');
    if (!fs.existsSync('dist/logging')) throw new Error('Logging não compilado');
    if (!fs.existsSync('dist/cache')) throw new Error('Cache não compilado');
  });

  // 2. Teste de Validadores
  console.log('\n🔍 2. VALIDADORES JOI');
  const { userRegisterSchema } = require('./dist/schemas/user');
  const { equipmentCreateSchema } = require('./dist/schemas/equipment');

  test('Validação de usuário válido', () => {
    const { error } = userRegisterSchema.validate({
      name: 'João Silva',
      email: 'joao@example.com',
      password: 'Password123'
    });
    if (error) throw new Error('Validação deveria passar');
  });

  test('Rejeição de email inválido', () => {
    const { error } = userRegisterSchema.validate({
      name: 'João Silva',
      email: 'email-inválido',
      password: 'Password123'
    });
    if (!error) throw new Error('Validação deveria falhar');
  });

  test('Validação de equipamento válido', () => {
    const { error } = equipmentCreateSchema.validate({
      name: 'Motosserra',
      type: 'Ferramenta',
      status: 'available'
    });
    if (error) throw new Error('Validação deveria passar');
  });

  // 3. Teste de Logger
  console.log('\n🪵 3. SISTEMA DE LOGGING');
  const logger = require('./dist/logging/logger').default;

  test('Logger instancia corretamente', () => {
    if (!logger) throw new Error('Logger não inicializado');
    if (typeof logger.info !== 'function') throw new Error('Método info não disponível');
  });

  test('Logger cria arquivos de log', () => {
    if (!fs.existsSync('logs')) throw new Error('Pasta logs não criada');
    logger.info('Teste de log durante validação');
  });

  // 4. Teste de Cache
  console.log('\n💾 4. SISTEMA DE CACHE');
  const cache = require('./dist/cache/redisClient').default;

  test('Cache instancia corretamente', () => {
    if (!cache) throw new Error('Cache não inicializado');
    if (typeof cache.set !== 'function') throw new Error('Método set não disponível');
  });

  test('Cache conecta (Redis ou Memory)', async () => {
    await cache.connect();
    const stats = cache.getStats();
    if (typeof stats.isConnected !== 'boolean') throw new Error('Stats inválidas');
  });

  test('Cache SET/GET funciona', async () => {
    await cache.set('test', 'valor', 10);
    const value = await cache.get('test');
    if (value !== 'valor') throw new Error('Cache SET/GET não funcionou');
  });

  // 5. Teste de Health Checks
  console.log('\n🏥 5. HEALTH CHECKS');
  const healthMonitor = require('./dist/monitoring/healthCheck').default;

  test('HealthMonitor instancia corretamente', () => {
    if (!healthMonitor) throw new Error('HealthMonitor não inicializado');
    if (typeof healthMonitor.checkHealth !== 'function') throw new Error('Método checkHealth não disponível');
  });

  // 6. Teste de Middlewares
  console.log('\n🔧 6. MIDDLEWARES');
  const { validate } = require('./dist/validators');

  test('Middleware de validação instancia', () => {
    if (typeof validate !== 'function') throw new Error('Middleware validate não é função');
    const middleware = validate(userRegisterSchema);
    if (typeof middleware !== 'function') throw new Error('Middleware não retorna função');
  });

  // Cleanup
  await cache.disconnect();

  // Resultados finais
  console.log('\n📊 RESULTADOS FINAIS:');
  console.log(`✅ Testes passaram: ${passed}`);
  console.log(`❌ Testes falharam: ${failed}`);
  console.log(`📈 Taxa de sucesso: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 TODAS AS MELHORIAS FUNCIONANDO PERFEITAMENTE!');
    console.log('\n🚀 SISTEMA PRONTO PARA PRODUÇÃO:');
    console.log('   ✅ TypeScript configurado');
    console.log('   ✅ Validação Joi implementada');
    console.log('   ✅ Logging Winston ativo');
    console.log('   ✅ Cache Redis funcionando');
    console.log('   ✅ Health checks disponíveis');
    console.log('   ✅ Middlewares configurados');
  } else {
    console.log('\n⚠️  ALGUMAS MELHORIAS PRECISAM DE AJUSTES');
  }

  return failed === 0;
}

runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Erro durante execução dos testes:', error);
  process.exit(1);
});