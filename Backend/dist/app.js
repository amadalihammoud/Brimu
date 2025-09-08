"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
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
const app = (0, express_1.default)();
const PORT = Number(config_1.default.server.port);
// Middleware de compressão
app.use((0, compression_1.default)());
// Middlewares de segurança
app.use((0, helmet_1.default)(config_1.default.security.helmet));
// Configuração do CORS
app.use((0, cors_1.default)({
    origin: config_1.default.server.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// Rate limiting geral
const limiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.default.rateLimit.windowMs,
    max: config_1.default.rateLimit.maxRequests,
    message: {
        error: 'Muitas requisições deste IP, tente novamente mais tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Rate limiting específico para login (mais restritivo)
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.default.rateLimit.loginWindowMs,
    max: config_1.default.rateLimit.loginMaxAttempts,
    message: {
        error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
app.use('/api/auth/login', loginLimiter);
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
// Rotas dos modelos de negócio
app.use('/api/services', serviceRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/api/quotes', quoteRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
app.use('/api/equipment', equipmentRoutes_1.default);
app.use('/api/calendar', calendarRoutes_1.default);
// Rota de health check
app.get('/api/health', (req, res) => {
    const dbStats = (0, database_1.getConnectionStats)();
    res.json({
        status: 'OK',
        message: 'Brimu Backend funcionando!',
        timestamp: new Date().toISOString(),
        environment: config_1.default.server.environment,
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
// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
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
        console.log('🚀 Iniciando servidor Brimu...');
        console.log(`📁 Ambiente: ${config_1.default.server.environment}`);
        // Conectar ao banco de dados
        const dbConnected = await (0, database_1.connectDB)();
        // Iniciar servidor
        const server = app.listen(PORT, config_1.default.server.host, () => {
            console.log('='.repeat(50));
            console.log(`🚀 Servidor Brimu rodando!`);
            console.log(`🔗 URL: http://${config_1.default.server.host}:${PORT}`);
            console.log(`📊 Health: http://${config_1.default.server.host}:${PORT}/api/health`);
            console.log(`📈 Status: http://${config_1.default.server.host}:${PORT}/api/status`);
            console.log(`📤 Uploads: http://${config_1.default.server.host}:${PORT}/uploads`);
            console.log(`🌐 Público: http://${config_1.default.server.host}:${PORT}/public`);
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
    }
    catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
};
// Iniciar aplicação
startServer();
exports.default = app;
