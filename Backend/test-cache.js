// Teste rápido do sistema de cache
const cache = require('./dist/cache/redisClient').default;

console.log('💾 Testando Sistema de Cache...\n');

async function testCache() {
  try {
    // Teste 1: Conectar ao cache
    console.log('1. Conectando ao sistema de cache...');
    await cache.connect();
    
    const stats = cache.getStats();
    console.log(`✅ Cache inicializado (Redis: ${stats.isConnected}, Memory fallback: ${stats.useMemoryFallback})`);

    // Teste 2: Set e Get básico
    console.log('\n2. Teste de SET e GET básico:');
    await cache.set('test:user:123', { 
      name: 'João Silva', 
      email: 'joao@example.com',
      role: 'user'
    }, 60); // TTL de 60 segundos
    
    const userData = await cache.get('test:user:123');
    console.log('✅ Dados armazenados e recuperados:', userData);

    // Teste 3: Teste com TTL
    console.log('\n3. Teste de expiração (TTL):');
    await cache.set('test:temp', 'dados temporários', 2); // TTL de 2 segundos
    
    console.log('Dados imediatos:', await cache.get('test:temp'));
    
    console.log('Aguardando 3 segundos para expiração...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const expiredData = await cache.get('test:temp');
    console.log(`Dados após expiração: ${expiredData || 'null (expirado)'}`);

    // Teste 4: Múltiplas chaves
    console.log('\n4. Teste com múltiplas chaves:');
    await Promise.all([
      cache.set('test:equipment:1', { name: 'Motosserra', status: 'available' }),
      cache.set('test:equipment:2', { name: 'Podador', status: 'in-use' }),
      cache.set('test:equipment:3', { name: 'Escada', status: 'maintenance' })
    ]);
    
    const keys = await cache.keys('test:equipment:*');
    console.log(`✅ Chaves encontradas: ${keys.length}`, keys);
    
    // Recuperar todos os equipamentos
    const equipment = await Promise.all(
      keys.map(async key => ({
        key,
        data: await cache.get(key)
      }))
    );
    console.log('📦 Equipamentos em cache:', equipment);

    // Teste 5: Invalidação de cache
    console.log('\n5. Teste de invalidação:');
    console.log('Chaves antes da invalidação:', await cache.keys('test:*'));
    
    // Deletar uma chave específica
    await cache.del('test:user:123');
    console.log('Após deletar test:user:123:', await cache.get('test:user:123') || 'null');

    // Teste 6: Flush completo
    console.log('\n6. Teste de flush completo:');
    console.log('Chaves antes do flush:', (await cache.keys('test:*')).length);
    
    await cache.flush();
    const keysAfterFlush = await cache.keys('test:*');
    console.log(`Chaves após flush: ${keysAfterFlush.length}`);

    // Teste 7: Performance
    console.log('\n7. Teste de performance:');
    const startTime = Date.now();
    
    // Set de 100 chaves
    const setPromises = [];
    for (let i = 0; i < 100; i++) {
      setPromises.push(cache.set(`perf:test:${i}`, { 
        id: i, 
        data: `test data ${i}`,
        timestamp: Date.now()
      }));
    }
    await Promise.all(setPromises);
    
    const setTime = Date.now() - startTime;
    console.log(`✅ SET de 100 chaves: ${setTime}ms`);
    
    // Get de 100 chaves
    const getStartTime = Date.now();
    const getPromises = [];
    for (let i = 0; i < 100; i++) {
      getPromises.push(cache.get(`perf:test:${i}`));
    }
    await Promise.all(getPromises);
    
    const getTime = Date.now() - getStartTime;
    console.log(`✅ GET de 100 chaves: ${getTime}ms`);

    // Estatísticas finais
    console.log('\n📊 Estatísticas finais:');
    const finalStats = cache.getStats();
    console.log('Stats:', finalStats);

  } catch (error) {
    console.error('❌ Erro durante teste de cache:', error.message);
  } finally {
    await cache.disconnect();
    console.log('\n🎉 Teste de cache concluído!');
    process.exit(0);
  }
}

testCache();