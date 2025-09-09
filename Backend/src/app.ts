import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import multer from 'multer';
import compression from 'compression';

import config from './config';
import { connectDB, isConnected, getConnectionStats } from './config/database';
import authRoutes from './routes/auth';
import uploadRoutes from './routes/upload';
import backupRoutes from './routes/backup';
import serviceRoutes from './routes/serviceRoutes';
import orderRoutes from './routes/orderRoutes';
import quoteRoutes from './routes/quoteRoutes';
import paymentRoutes from './routes/paymentRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import calendarRoutes from './routes/calendarRoutes';
import backupManager from './utils/backupManager';

const app = express();
const PORT = Number(config.server.port);

// Middleware de compressão - TypeScript fix
app.use(compression() as any);

// Middlewares de segurança
app.use(helmet(config.security.helmet));

// Configuração do CORS
app.use(cors({
  origin: config.server.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting geral
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Muitas requisições deste IP, tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting específico para login (mais restritivo)
const loginLimiter = rateLimit({
  windowMs: config.rateLimit.loginWindowMs,
  max: config.rateLimit.loginMaxAttempts,
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/api/auth/login', loginLimiter);

// Middleware para parsing de JSON
app.use(express.json({ limit: config.upload.maxFileSize }));
app.use(express.urlencoded({ extended: true, limit: config.upload.maxFileSize }));

// Servir arquivos estáticos com cache
app.use('/uploads', express.static(config.upload.uploadPath, {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));
app.use('/public', express.static(path.join(__dirname, '../public'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/backup', backupRoutes);

// Rotas dos modelos de negócio
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/calendar', calendarRoutes);

// Rota de health check
app.get('/api/health', (req: Request, res: Response) => {
  const dbStats = getConnectionStats();
  
  res.json({ 
    status: 'OK',
    message: 'Brimu Backend funcionando!', 
    timestamp: new Date().toISOString(),
    environment: config.server.environment,
    version: require('../package.json').version,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: dbStats,
    availableRoutes: [
      '/api/auth - Autenticação',
      '/api/upload - Upload de arquivos',
      '/api/backup - Backup do sistema',
      '/api/services - CRUD de serviços',
      '/api/orders - CRUD de ordens',
      '/api/quotes - CRUD de orçamentos',
      '/api/payments - CRUD de pagamentos',
      '/api/equipment - CRUD de equipamentos',
      '/api/calendar - Calendário inteligente'
    ]
  });
});

// Rota de status do sistema
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    server: {
      status: 'running',
      port: PORT,
      environment: config.server.environment,
      uptime: process.uptime()
    },
    database: getConnectionStats(),
    features: {
      upload: true,
      backup: config.backup.enabled,
      email: !!config.email.host,
      compression: true
    }
  });
});

// Middleware de tratamento de erros
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'Arquivo muito grande. Tamanho máximo permitido: 10MB' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Muitos arquivos. Máximo permitido: 10 arquivos' 
      });
    }
  }
  
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
  return;
});

// Rota para arquivos não encontrados
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Conectar ao MongoDB e iniciar servidor
const startServer = async (): Promise<void> => {
  try {
    console.log('🚀 Iniciando servidor Brimu...');
    console.log(`📁 Ambiente: ${config.server.environment}`);
    
    // Conectar ao banco de dados
    const dbConnected = await connectDB();
    
    // Iniciar servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('='.repeat(50));
      console.log(`🚀 Servidor Brimu rodando!`);
      console.log(`🔗 URL: http://0.0.0.0:${PORT}`);
      console.log(`📊 Health: http://0.0.0.0:${PORT}/api/health`);
      console.log(`📈 Status: http://0.0.0.0:${PORT}/api/status`);
      console.log(`📤 Uploads: http://0.0.0.0:${PORT}/uploads`);
      console.log(`🌐 Público: http://0.0.0.0:${PORT}/public`);
      console.log(`🗄️ Database: ${dbConnected ? 'Conectado' : 'Modo Teste'}`);
      console.log('='.repeat(50));
    });

    // Configurar timeout do servidor
    server.timeout = 30000; // 30 segundos
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM recebido. Fechando servidor...');
      server.close(() => {
        console.log('✅ Servidor fechado');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT recebido. Fechando servidor...');
      server.close(() => {
        console.log('✅ Servidor fechado');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar aplicação
startServer();

export default app;
