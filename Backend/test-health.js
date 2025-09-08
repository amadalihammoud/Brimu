// Teste rápido dos health checks
const mongoose = require('mongoose');
const healthMonitor = require('./dist/monitoring/healthCheck').default;

console.log('🏥 Testando Health Checks...\n');

async function testHealthChecks() {
  try {
    // Primeiro vamos conectar ao MongoDB (simulado)
    console.log('1. Conectando ao MongoDB local...');
    
    // Para teste, vamos usar MongoDB in-memory ou local
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/brimu-test';
    
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log('✅ MongoDB conectado com sucesso');
    } catch (error) {
      console.log('⚠️ MongoDB não disponível, continuando teste...');
    }

    // Teste 2: Health check completo
    console.log('\n2. Executando health check completo...');
    const health = await healthMonitor.checkHealth();
    
    console.log('📊 Resultado do Health Check:');
    console.log(`Status geral: ${health.status === 'healthy' ? '✅' : '⚠️'} ${health.status}`);
    console.log(`Uptime: ${Math.round(health.uptime)}s`);
    console.log(`Versão: ${health.version}`);
    console.log(`Ambiente: ${health.environment}`);
    
    console.log('\n📋 Status dos Serviços:');
    for (const [service, status] of Object.entries(health.services)) {
      const icon = status.status === 'up' ? '✅' : status.status === 'degraded' ? '⚠️' : '❌';
      console.log(`${icon} ${service}: ${status.status} (${status.responseTime || 0}ms)`);
      
      if (status.error) {
        console.log(`   Erro: ${status.error}`);
      }
      
      if (status.details) {
        console.log(`   Detalhes:`, JSON.stringify(status.details, null, 2));
      }
    }

    // Teste 3: Simular requests HTTP aos endpoints de health
    console.log('\n3. Simulando requests aos endpoints de health...');
    
    // Criar um mock de req/res para testar os handlers
    const mockReq = {};
    const mockRes = {
      status: (code) => {
        console.log(`Status: ${code}`);
        return mockRes;
      },
      json: (data) => {
        console.log('Response:', JSON.stringify(data, null, 2));
        return mockRes;
      }
    };

    console.log('\n🏥 Health endpoint:');
    await healthMonitor.healthHandler(mockReq, mockRes);
    
    console.log('\n🎯 Readiness endpoint:');
    await healthMonitor.readinessHandler(mockReq, mockRes);
    
    console.log('\n💓 Liveness endpoint:');
    await healthMonitor.livenessHandler(mockReq, mockRes);

  } catch (error) {
    console.error('❌ Erro durante teste de health checks:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    console.log('\n🎉 Teste de health checks concluído!');
    process.exit(0);
  }
}

testHealthChecks();