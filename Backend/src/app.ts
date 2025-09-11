import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
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
import reportRoutes from './routes/reportRoutes';
import backupManager from './utils/backupManager';
import securityConfig, { 
  csrfProtectionMiddleware, 
  secureTokenMiddleware,
  deviceFingerprintMiddleware 
} from './middleware/security';
import securityAudit from './middleware/securityAudit';
import monitoring from './middleware/realTimeMonitoring';
import securityAdminRoutes from './routes/securityAdmin';
import metricsRoutes from './routes/metricsRoutes';
import notificationRoutes from './routes/notificationRoutes';
import intelligentBackupRoutes from './routes/intelligentBackupRoutes';
import logsRoutes from './routes/logsRoutes';
import performanceRoutes from './routes/performanceRoutes';
import cache from './cache/redisClient';
import advancedLoggingService from './services/advancedLoggingService';
import { comprehensivePerformanceMiddleware } from './middleware/performanceMiddleware';
import { 
  metricsCollectionMiddleware, 
  healthCheckMetrics, 
  cacheMetricsMiddleware,
  errorMetricsMiddleware,
  performanceAnalysisMiddleware 
} from './middleware/metricsMiddleware';

const app = express();
const PORT = Number(process.env.PORT) || Number(config.server.port);

// Middleware de compressão - TypeScript fix
app.use(compression() as any);

// Cookie parser para HttpOnly cookies
app.use(cookieParser());

// Middlewares de segurança avançados
app.use(helmet(config.security.helmet));
app.use(securityConfig.helmet);

// Device fingerprinting para detectar atividades suspeitas
app.use(deviceFingerprintMiddleware);

// Sistema de coleta de métricas
app.use(metricsCollectionMiddleware);
app.use(cacheMetricsMiddleware);
app.use(performanceAnalysisMiddleware);

// Sistema de análise de performance em tempo real
app.use(comprehensivePerformanceMiddleware);

// Sistema de monitoramento em tempo real
app.use(monitoring.trackRequest);

// Sistema de auditoria de segurança
app.use(securityAudit.checkBlockedIPs);
app.use(securityAudit.detectScanning);
app.use(securityAudit.detectMaliciousPayloads);
app.use(securityAudit.detectBruteForce());

// Middleware para tokens seguros e CSRF protection
app.use(secureTokenMiddleware);
app.use(csrfProtectionMiddleware);

// Configuração do CORS com headers de segurança
app.use(cors({
  origin: config.server.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token']
}));

// Aplicar rate limiting de segurança
app.use('/api/', securityConfig.rateLimits.general);
app.use('/api/auth/login', securityConfig.rateLimits.login);
app.use('/api/upload', securityConfig.rateLimits.upload);

// Detectar ataques e validar origens
app.use(securityConfig.detectAttacks);
app.use(securityConfig.validateOrigin);
app.use(securityConfig.validateUserAgent);

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

// Rotas de administração de segurança
app.use('/api/admin/security', securityAdminRoutes);

// Rotas de métricas e monitoramento
app.use('/api/metrics', metricsRoutes);

// Rotas de notificações
app.use('/api/notifications', notificationRoutes);

// Rotas de backup inteligente
app.use('/api/backups/intelligent', intelligentBackupRoutes);

// Rotas de logs avançados
app.use('/api/logs', logsRoutes);

// Rotas de análise de performance
app.use('/api/performance', performanceRoutes);

// Rotas dos modelos de negócio
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/reports', reportRoutes);

// Rota de health check
app.get('/api/health', healthCheckMetrics, (req: Request, res: Response) => {
  const dbStats = getConnectionStats();
  const systemMetrics = res.locals.systemMetrics;
  
  res.json({ 
    status: 'OK',
    message: 'Brimu Backend funcionando!', 
    timestamp: new Date().toISOString(),
    environment: config.server.environment,
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: dbStats,
    metrics: systemMetrics ? {
      avgResponseTime: systemMetrics.avgResponseTime,
      requestsPerMinute: systemMetrics.requestsPerMinute,
      cacheHitRate: systemMetrics.cacheHitRate,
      errorRate: systemMetrics.errorRate
    } : undefined,
    availableRoutes: [
      '/api/auth - Autenticação',
      '/api/upload - Upload de arquivos',
      '/api/backup - Backup do sistema',
      '/api/logs - Sistema de logs avançado',
      '/api/performance - Análise de performance',
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

// Middleware de tratamento de erros com métricas
app.use(errorMetricsMiddleware);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  advancedLoggingService.error('Application Error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    requestId: req.requestId
  });
  
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
    advancedLoggingService.info('Server Starting', { 
      environment: config.server.environment,
      port: PORT,
      process: process.pid 
    });
    
    // Conectar ao banco de dados
    const dbConnected = await connectDB();
    
    // Conectar ao cache Redis
    try {
      await cache.connect();
      advancedLoggingService.info('Redis Cache Connected');
    } catch (error) {
      advancedLoggingService.warn('Redis Cache Unavailable - Using Memory Fallback', { error: error.message });
    }
    
    // Iniciar servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      advancedLoggingService.info('Server Started Successfully', {
        port: PORT,
        host: '0.0.0.0',
        environment: config.server.environment,
        database: dbConnected ? 'connected' : 'test-mode',
        endpoints: {
          health: `/api/health`,
          status: `/api/status`,
          logs: `/api/logs`,
          uploads: `/uploads`,
          public: `/public`
        }
      });
      
      console.log('='.repeat(50));
      console.log(`🚀 Servidor Brimu rodando!`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/api/health`);
      console.log(`📈 Status: http://localhost:${PORT}/api/status`);
      console.log(`📝 Logs: http://localhost:${PORT}/api/logs/dashboard`);
      console.log(`📤 Uploads: http://localhost:${PORT}/uploads`);
      console.log(`🌐 Público: http://localhost:${PORT}/public`);
      console.log(`🗄️ Database: ${dbConnected ? 'Conectado' : 'Modo Teste'}`);
      console.log('='.repeat(50));
    });

    // Configurar timeout do servidor
    server.timeout = 30000; // 30 segundos
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      advancedLoggingService.info('SIGTERM Received - Shutting Down Server');
      server.close(async () => {
        await cache.disconnect();
        advancedLoggingService.info('Server Shutdown Complete');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      advancedLoggingService.info('SIGINT Received - Shutting Down Server');
      server.close(async () => {
        await cache.disconnect();
        advancedLoggingService.info('Server Shutdown Complete');
        process.exit(0);
      });
    });

  } catch (error) {
    advancedLoggingService.error('Failed to Start Server', {
      error: error.message,
      stack: error.stack,
      environment: config.server.environment,
      port: PORT
    });
    process.exit(1);
  }
};

// Iniciar aplicação
startServer();

export default app;
