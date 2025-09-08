// Servidor de demonstração das melhorias implementadas
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Importar as melhorias implementadas
const logger = require('./dist/logging/logger').default;
const cache = require('./dist/cache/redisClient').default;
const healthMonitor = require('./dist/monitoring/healthCheck').default;
const { requestLogger, errorLogger } = require('./dist/middleware/requestLogger');
const { validate } = require('./dist/validators');
const { userRegisterSchema, userLoginSchema } = require('./dist/schemas/user');
const { equipmentCreateSchema } = require('./dist/schemas/equipment');

const app = express();
const PORT = process.env.PORT || 5000;

// Inicializar serviços
async function initializeServices() {
  try {
    await cache.connect();
    logger.logSystemEvent('server_initializing', { port: PORT });
    console.log('✅ Serviços inicializados com sucesso');
  } catch (error) {
    logger.error('Erro ao inicializar serviços', {}, error);
    console.error('❌ Erro ao inicializar serviços:', error.message);
  }
}

// Middlewares de segurança
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: { error: 'Muitas requisições deste IP' }
});
app.use(limiter);

// Middleware de logging de requests
app.use(requestLogger);

// ROTAS DE DEMONSTRAÇÃO

// 1. Página inicial
app.get('/', (req, res) => {
  res.json({
    message: '🌳 Brimu - Sistema Melhorado!',
    version: '2.0.0',
    improvements: [
      'TypeScript Backend ✅',
      'Validação Joi ✅', 
      'Logging Winston ✅',
      'Cache Redis ✅',
      'Health Checks ✅',
      'Context API Frontend ✅'
    ],
    endpoints: {
      health: '/health',
      demo: '/api/demo',
      validation: '/api/validation-demo',
      cache: '/api/cache-demo',
      users: '/api/users',
      equipment: '/api/equipment'
    }
  });
});

// 2. Health Checks
app.get('/health', healthMonitor.healthHandler.bind(healthMonitor));
app.get('/health/ready', healthMonitor.readinessHandler.bind(healthMonitor));
app.get('/health/live', healthMonitor.livenessHandler.bind(healthMonitor));

// 3. Demo de Logging
app.get('/api/demo/logging', (req, res) => {
  logger.info('Demo de logging acessado', { ip: req.ip });
  logger.logUserAction('demo_logging', 'demo-user', { endpoint: '/api/demo/logging' });
  
  res.json({
    message: 'Demo de logging executado!',
    logs: [
      'Log de info gravado ✅',
      'Log de ação do usuário gravado ✅',
      'Verifique os arquivos em Backend/logs/ ✅'
    ]
  });
});

// 4. Demo de Cache
app.get('/api/demo/cache', async (req, res) => {
  try {
    const cacheKey = 'demo:timestamp';
    
    // Tentar buscar do cache primeiro
    let data = await cache.get(cacheKey);
    
    if (data) {
      res.json({
        message: 'Dados vindos do CACHE ⚡',
        data,
        source: 'cache',
        performance: 'Muito rápido!'
      });
    } else {
      // Simular processamento pesado
      data = {
        timestamp: new Date().toISOString(),
        message: 'Dados gerados pelo servidor',
        processing_time: '500ms simulado'
      };
      
      // Salvar no cache por 30 segundos
      await cache.set(cacheKey, data, 30);
      
      res.json({
        message: 'Dados gerados e SALVOS NO CACHE 💾',
        data,
        source: 'server',
        performance: 'Primeira vez - dados cacheados para próximas requisições'
      });
    }
  } catch (error) {
    logger.error('Erro no demo de cache', { error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 5. Demo de Validação - Usuários
app.post('/api/demo/users', validate(userRegisterSchema), (req, res) => {
  logger.logUserAction('user_demo_created', 'demo', req.body);
  
  res.status(201).json({
    message: '✅ Usuário validado com sucesso!',
    data: {
      ...req.body,
      id: 'demo-' + Date.now(),
      createdAt: new Date().toISOString()
    },
    validation: 'Passou por todas as validações Joi ✅'
  });
});

// 6. Demo de Validação - Equipamentos  
app.post('/api/demo/equipment', validate(equipmentCreateSchema), (req, res) => {
  logger.logUserAction('equipment_demo_created', 'demo', req.body);
  
  res.status(201).json({
    message: '✅ Equipamento validado com sucesso!',
    data: {
      ...req.body,
      id: 'equip-' + Date.now(),
      createdAt: new Date().toISOString()
    },
    validation: 'Passou por todas as validações Joi ✅'
  });
});

// 7. Demo de Error Handling
app.get('/api/demo/error', (req, res) => {
  const error = new Error('Erro simulado para demonstração');
  logger.error('Erro simulado', { endpoint: '/api/demo/error' }, error);
  res.status(500).json({ 
    error: 'Erro simulado - verifique os logs!',
    tip: 'Verifique Backend/logs/error.log'
  });
});

// 8. Estatísticas do sistema
app.get('/api/stats', async (req, res) => {
  const cacheStats = cache.getStats();
  const memUsage = process.memoryUsage();
  
  res.json({
    message: '📊 Estatísticas do Sistema',
    uptime: `${Math.round(process.uptime())}s`,
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
    },
    cache: cacheStats,
    node_version: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de tratamento de erros
app.use(errorLogger);
app.use((err, req, res, next) => {
  logger.error('Erro não tratado', { 
    url: req.url, 
    method: req.method 
  }, err);
  
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: 'Verifique os logs para mais detalhes'
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint não encontrado',
    available_endpoints: [
      'GET /',
      'GET /health',
      'GET /api/demo/logging',
      'GET /api/demo/cache',
      'POST /api/demo/users',
      'POST /api/demo/equipment',
      'GET /api/demo/error',
      'GET /api/stats'
    ]
  });
});

// Inicializar servidor
async function startServer() {
  await initializeServices();
  
  app.listen(PORT, () => {
    console.log(`
🚀 SERVIDOR BRIMU DEMO RODANDO!

📍 URL: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health
💾 Cache Demo: http://localhost:${PORT}/api/demo/cache
🪵 Logs Demo: http://localhost:${PORT}/api/demo/logging
📊 Stats: http://localhost:${PORT}/api/stats

🧪 ENDPOINTS PARA TESTAR:
• GET  /                     - Página inicial
• GET  /health              - Health checks
• GET  /api/demo/logging    - Demo de logging
• GET  /api/demo/cache      - Demo de cache
• GET  /api/stats           - Estatísticas do sistema
• POST /api/demo/users      - Demo validação usuários
• POST /api/demo/equipment  - Demo validação equipamentos

📁 Logs disponíveis em: Backend/logs/
    `);
    
    logger.logSystemEvent('server_started', { 
      port: PORT, 
      environment: process.env.NODE_ENV || 'development'
    });
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Desligando servidor...');
  await cache.disconnect();
  process.exit(0);
});

startServer().catch(error => {
  console.error('❌ Erro ao iniciar servidor:', error);
  process.exit(1);
});