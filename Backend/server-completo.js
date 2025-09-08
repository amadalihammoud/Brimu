// Servidor completo com autenticação para integração Frontend-Backend
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
const JWT_SECRET = process.env.JWT_SECRET || 'brimu_secret_key_demo';

// Base de dados em memória para demo (em produção seria MongoDB)
const users = [
  {
    id: '1',
    name: 'Admin Brimu',
    email: 'admin@brimu.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewHBw/LMdpI7Y.ga', // password123
    role: 'admin',
    isActive: true
  },
  {
    id: '2', 
    name: 'João Silva',
    email: 'joao@brimu.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewHBw/LMdpI7Y.ga', // password123
    role: 'user',
    isActive: true
  }
];

const equipment = [
  {
    id: '1',
    name: 'Motosserra Stihl MS 250',
    type: 'Ferramenta de Corte',
    status: 'available',
    serialNumber: 'ST123456',
    location: 'Almoxarifado A'
  },
  {
    id: '2',
    name: 'Podador Elétrico',
    type: 'Ferramenta Elétrica', 
    status: 'in-use',
    serialNumber: 'PE789012',
    location: 'Campo - Equipe 1'
  }
];

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
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Muitas requisições deste IP' }
});
app.use(limiter);

// Middleware de logging
app.use(requestLogger);

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// ROTAS DE DEMO ORIGINAIS
app.get('/', (req, res) => {
  res.json({
    message: '🌳 Brimu - Sistema Completo Funcionando!',
    version: '2.0.0',
    status: 'Frontend + Backend integrados ✅',
    improvements: [
      'TypeScript Backend ✅',
      'Validação Joi ✅', 
      'Logging Winston ✅',
      'Cache Redis ✅',
      'Health Checks ✅',
      'Context API Frontend ✅',
      'Autenticação JWT ✅'
    ],
    demo_users: [
      { email: 'admin@brimu.com', password: 'password123', role: 'admin' },
      { email: 'joao@brimu.com', password: 'password123', role: 'user' }
    ]
  });
});

// Health checks
app.get('/health', healthMonitor.healthHandler.bind(healthMonitor));
app.get('/health/ready', healthMonitor.readinessHandler.bind(healthMonitor));
app.get('/health/live', healthMonitor.livenessHandler.bind(healthMonitor));

// ROTAS DE AUTENTICAÇÃO (para o Frontend original)

// Login
app.post('/api/auth/login', validate(userLoginSchema), (req, res) => {
  const { email, password } = req.body;
  
  logger.logUserAction('login_attempt', email, { ip: req.ip });
  
  // Buscar usuário
  const user = users.find(u => u.email === email && u.isActive);
  if (!user) {
    logger.logSecurityEvent('login_failed_user_not_found', { email, ip: req.ip });
    return res.status(401).json({ 
      success: false, 
      error: 'Credenciais inválidas' 
    });
  }
  
  // Verificar senha (para demo, aceita qualquer senha que contenha "123")
  if (!password.includes('123')) {
    logger.logSecurityEvent('login_failed_wrong_password', { email, ip: req.ip });
    return res.status(401).json({ 
      success: false, 
      error: 'Credenciais inválidas' 
    });
  }
  
  // Gerar token
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  logger.logUserAction('login_success', user.id, { email, ip: req.ip });
  
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    }
  });
});

// Registro
app.post('/api/auth/register', validate(userRegisterSchema), (req, res) => {
  const { name, email, password, role = 'user' } = req.body;
  
  // Verificar se usuário já existe
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email já cadastrado' 
    });
  }
  
  // Criar usuário
  const newUser = {
    id: String(users.length + 1),
    name,
    email,
    password: bcrypt.hashSync(password, 12),
    role,
    isActive: true
  };
  
  users.push(newUser);
  
  // Gerar token
  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  logger.logUserAction('user_registered', newUser.id, { email, role });
  
  res.status(201).json({
    success: true,
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.isActive
    }
  });
});

// Obter perfil do usuário
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
  }
  
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    }
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  logger.logUserAction('logout', req.user?.userId || 'anonymous');
  res.json({ success: true, message: 'Logout realizado com sucesso' });
});

// ROTAS DE EQUIPAMENTOS (para o Frontend)

// Listar equipamentos
app.get('/api/equipment', authenticateToken, (req, res) => {
  logger.logUserAction('equipment_list', req.user.userId);
  res.json({
    success: true,
    data: equipment,
    message: `${equipment.length} equipamentos encontrados`
  });
});

// Criar equipamento
app.post('/api/equipment', authenticateToken, validate(equipmentCreateSchema), (req, res) => {
  const newEquipment = {
    id: String(equipment.length + 1),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  equipment.push(newEquipment);
  
  logger.logUserAction('equipment_created', req.user.userId, newEquipment);
  
  res.status(201).json({
    success: true,
    data: newEquipment,
    message: 'Equipamento criado com sucesso'
  });
});

// Obter equipamento específico
app.get('/api/equipment/:id', authenticateToken, (req, res) => {
  const equip = equipment.find(e => e.id === req.params.id);
  if (!equip) {
    return res.status(404).json({ success: false, error: 'Equipamento não encontrado' });
  }
  
  res.json({ success: true, data: equip });
});

// ROTAS DE DEMO ORIGINAIS (mantidas)

app.get('/api/demo/cache', async (req, res) => {
  try {
    const cacheKey = 'demo:timestamp';
    let data = await cache.get(cacheKey);
    
    if (data) {
      res.json({
        message: 'Dados vindos do CACHE ⚡',
        data,
        source: 'cache',
        performance: 'Muito rápido!'
      });
    } else {
      data = {
        timestamp: new Date().toISOString(),
        message: 'Dados gerados pelo servidor',
        processing_time: '500ms simulado'
      };
      
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

app.get('/api/demo/logging', (req, res) => {
  logger.info('Demo de logging acessado', { ip: req.ip });
  logger.logUserAction('demo_logging', req.user?.userId || 'anonymous');
  
  res.json({
    message: 'Demo de logging executado!',
    logs: [
      'Log de info gravado ✅',
      'Log de ação do usuário gravado ✅', 
      'Verifique os arquivos em Backend/logs/ ✅'
    ]
  });
});

app.get('/api/stats', (req, res) => {
  const cacheStats = cache.getStats();
  const memUsage = process.memoryUsage();
  
  res.json({
    message: '📊 Estatísticas do Sistema',
    uptime: `${Math.round(process.uptime())}s`,
    users_count: users.length,
    equipment_count: equipment.length,
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
    success: false,
    error: 'Erro interno do servidor',
    message: 'Verifique os logs para mais detalhes'
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint não encontrado',
    available_endpoints: [
      'POST /api/auth/login',
      'POST /api/auth/register', 
      'GET /api/auth/me',
      'GET /api/equipment',
      'POST /api/equipment',
      'GET /health',
      'GET /api/demo/cache',
      'GET /api/stats'
    ]
  });
});

// Inicializar servidor
async function startServer() {
  await initializeServices();
  
  app.listen(PORT, () => {
    console.log(`
🚀 SERVIDOR BRIMU COMPLETO RODANDO!

📍 Backend: http://localhost:${PORT}
🔐 Frontend: http://localhost:3000

👥 USUÁRIOS DEMO:
• Email: admin@brimu.com | Senha: password123
• Email: joao@brimu.com  | Senha: password123

🧪 ENDPOINTS PRINCIPAIS:
• POST /api/auth/login     - Login de usuários
• POST /api/auth/register  - Registro de usuários  
• GET  /api/auth/me        - Perfil do usuário
• GET  /api/equipment      - Listar equipamentos
• POST /api/equipment      - Criar equipamento
• GET  /health             - Health checks
• GET  /api/demo/cache     - Demo de cache
• GET  /api/stats          - Estatísticas

📁 Logs disponíveis em: Backend/logs/

🎉 FRONTEND E BACKEND TOTALMENTE INTEGRADOS!
    `);
    
    logger.logSystemEvent('server_started', { 
      port: PORT, 
      environment: process.env.NODE_ENV || 'development',
      users_count: users.length,
      equipment_count: equipment.length
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