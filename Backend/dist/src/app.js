"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const compression_1 = __importDefault(require("compression"));
const config_1 = __importDefault(require("./config"));
const database_1 = require("./config/database");
const auth_1 = __importDefault(require("./routes/auth"));
const upload_1 = __importDefault(require("./routes/upload"));
const backup_1 = __importDefault(require("./routes/backup"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const quoteRoutes_1 = __importDefault(require("./routes/quoteRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const equipmentRoutes_1 = __importDefault(require("./routes/equipmentRoutes"));
const calendarRoutes_1 = __importDefault(require("./routes/calendarRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const security_1 = __importStar(require("./middleware/security"));
const securityAudit_1 = __importDefault(require("./middleware/securityAudit"));
const realTimeMonitoring_1 = __importDefault(require("./middleware/realTimeMonitoring"));
const securityAdmin_1 = __importDefault(require("./routes/securityAdmin"));
const metricsRoutes_1 = __importDefault(require("./routes/metricsRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const intelligentBackupRoutes_1 = __importDefault(require("./routes/intelligentBackupRoutes"));
const logsRoutes_1 = __importDefault(require("./routes/logsRoutes"));
const performanceRoutes_1 = __importDefault(require("./routes/performanceRoutes"));
const redisClient_1 = __importDefault(require("./cache/redisClient"));
const advancedLoggingService_1 = __importDefault(require("./services/advancedLoggingService"));
const performanceMiddleware_1 = require("./middleware/performanceMiddleware");
const metricsMiddleware_1 = require("./middleware/metricsMiddleware");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || Number(config_1.default.server.port);
// Middleware de compressão - TypeScript fix
app.use((0, compression_1.default)());
// Cookie parser para HttpOnly cookies
app.use((0, cookie_parser_1.default)());
// Middlewares de segurança avançados
app.use((0, helmet_1.default)(config_1.default.security.helmet));
app.use(security_1.default.helmet);
// Device fingerprinting para detectar atividades suspeitas
app.use(security_1.deviceFingerprintMiddleware);
// Sistema de coleta de métricas
app.use(metricsMiddleware_1.metricsCollectionMiddleware);
app.use(metricsMiddleware_1.cacheMetricsMiddleware);
app.use(metricsMiddleware_1.performanceAnalysisMiddleware);
// Sistema de análise de performance em tempo real
app.use(performanceMiddleware_1.comprehensivePerformanceMiddleware);
// Sistema de monitoramento em tempo real
app.use(realTimeMonitoring_1.default.trackRequest);
// Sistema de auditoria de segurança
app.use(securityAudit_1.default.checkBlockedIPs);
app.use(securityAudit_1.default.detectScanning);
app.use(securityAudit_1.default.detectMaliciousPayloads);
app.use(securityAudit_1.default.detectBruteForce());
// Middleware para tokens seguros e CSRF protection
app.use(security_1.secureTokenMiddleware);
app.use(security_1.csrfProtectionMiddleware);
// Configuração do CORS com headers de segurança
app.use((0, cors_1.default)({
    origin: config_1.default.server.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token']
}));
// Aplicar rate limiting de segurança
app.use('/api/', security_1.default.rateLimits.general);
app.use('/api/auth/login', security_1.default.rateLimits.login);
app.use('/api/upload', security_1.default.rateLimits.upload);
// Detectar ataques e validar origens
app.use(security_1.default.detectAttacks);
app.use(security_1.default.validateOrigin);
app.use(security_1.default.validateUserAgent);
// Middleware para parsing de JSON
app.use(express_1.default.json({ limit: config_1.default.upload.maxFileSize }));
app.use(express_1.default.urlencoded({ extended: true, limit: config_1.default.upload.maxFileSize }));
// Servir arquivos estáticos com cache
app.use('/uploads', express_1.default.static(config_1.default.upload.uploadPath, {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));
app.use('/public', express_1.default.static(path_1.default.join(__dirname, '../public'), {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));
// Rotas da API
app.use('/api/auth', auth_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/backup', backup_1.default);
// Rotas de administração de segurança
app.use('/api/admin/security', securityAdmin_1.default);
// Rotas de métricas e monitoramento
app.use('/api/metrics', metricsRoutes_1.default);
// Rotas de notificações
app.use('/api/notifications', notificationRoutes_1.default);
// Rotas de backup inteligente
app.use('/api/backups/intelligent', intelligentBackupRoutes_1.default);
// Rotas de logs avançados
app.use('/api/logs', logsRoutes_1.default);
// Rotas de análise de performance
app.use('/api/performance', performanceRoutes_1.default);
// Rotas dos modelos de negócio
app.use('/api/services', serviceRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/api/quotes', quoteRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
app.use('/api/equipment', equipmentRoutes_1.default);
app.use('/api/calendar', calendarRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
// Rota de health check
app.get('/api/health', metricsMiddleware_1.healthCheckMetrics, (req, res) => {
    const dbStats = (0, database_1.getConnectionStats)();
    const systemMetrics = res.locals.systemMetrics;
    res.json({
        status: 'OK',
        message: 'Brimu Backend funcionando!',
        timestamp: new Date().toISOString(),
        environment: config_1.default.server.environment,
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
app.get('/api/status', (req, res) => {
    res.json({
        server: {
            status: 'running',
            port: PORT,
            environment: config_1.default.server.environment,
            uptime: process.uptime()
        },
        database: (0, database_1.getConnectionStats)(),
        features: {
            upload: true,
            backup: config_1.default.backup.enabled,
            email: !!config_1.default.email.host,
            compression: true
        }
    });
});
// Middleware de tratamento de erros com métricas
app.use(metricsMiddleware_1.errorMetricsMiddleware);
app.use((err, req, res, next) => {
    advancedLoggingService_1.default.error('Application Error', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        requestId: req.requestId
    });
    if (err instanceof multer_1.default.MulterError) {
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
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});
// Conectar ao MongoDB e iniciar servidor
const startServer = async () => {
    try {
        advancedLoggingService_1.default.info('Server Starting', {
            environment: config_1.default.server.environment,
            port: PORT,
            process: process.pid
        });
        // Conectar ao banco de dados
        const dbConnected = await (0, database_1.connectDB)();
        // Conectar ao cache Redis
        try {
            await redisClient_1.default.connect();
            advancedLoggingService_1.default.info('Redis Cache Connected');
        }
        catch (error) {
            advancedLoggingService_1.default.warn('Redis Cache Unavailable - Using Memory Fallback', { error: error.message });
        }
        // Iniciar servidor
        const server = app.listen(PORT, '0.0.0.0', () => {
            advancedLoggingService_1.default.info('Server Started Successfully', {
                port: PORT,
                host: '0.0.0.0',
                environment: config_1.default.server.environment,
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
            advancedLoggingService_1.default.info('SIGTERM Received - Shutting Down Server');
            server.close(async () => {
                await redisClient_1.default.disconnect();
                advancedLoggingService_1.default.info('Server Shutdown Complete');
                process.exit(0);
            });
        });
        process.on('SIGINT', () => {
            advancedLoggingService_1.default.info('SIGINT Received - Shutting Down Server');
            server.close(async () => {
                await redisClient_1.default.disconnect();
                advancedLoggingService_1.default.info('Server Shutdown Complete');
                process.exit(0);
            });
        });
    }
    catch (error) {
        advancedLoggingService_1.default.error('Failed to Start Server', {
            error: error.message,
            stack: error.stack,
            environment: config_1.default.server.environment,
            port: PORT
        });
        process.exit(1);
    }
};
// Iniciar aplicação
startServer();
exports.default = app;
