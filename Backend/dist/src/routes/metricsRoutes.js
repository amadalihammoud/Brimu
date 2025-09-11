"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const metricsService_1 = __importDefault(require("../services/metricsService"));
const security_1 = require("../middleware/security");
const security_2 = __importDefault(require("../middleware/security"));
const cache_1 = require("../middleware/cache");
const router = express_1.default.Router();
/**
 * Rotas de Métricas e Monitoramento
 * Endpoints para visualização e análise de métricas do sistema
 */
// Aplicar autenticação admin em todas as rotas de métricas
router.use(security_1.authenticateWithCookie);
// Aplicar rate limiting específico para métricas
const metricsRateLimit = security_2.default.rateLimits.api;
router.use(metricsRateLimit);
// Cache middleware para métricas (cache curto devido à natureza tempo-real)
const metricsCache = (0, cache_1.cacheMiddleware)({
    ttl: 30, // 30 segundos
    keyGenerator: (req) => `metrics:${req.path}:${JSON.stringify(req.query)}`,
    condition: (req) => req.method === 'GET' && !req.path.includes('/realtime')
});
// GET /api/metrics/system - Métricas de sistema em tempo real
router.get('/system', (req, res) => {
    try {
        const systemMetrics = metricsService_1.default.getSystemMetrics();
        res.json({
            success: true,
            data: systemMetrics,
            timestamp: Date.now()
        });
    }
    catch (error) {
        console.error('Erro ao obter métricas de sistema:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/metrics/performance - Métricas de performance agregadas
router.get('/performance', metricsCache, (req, res) => {
    try {
        const period = req.query.period || '1h';
        const aggregatedMetrics = metricsService_1.default.getAggregatedMetrics(period);
        res.json({
            success: true,
            data: aggregatedMetrics,
            timestamp: Date.now()
        });
    }
    catch (error) {
        console.error('Erro ao obter métricas de performance:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/metrics/alerts - Alertas ativos do sistema
router.get('/alerts', (req, res) => {
    try {
        const alerts = metricsService_1.default.getActiveAlerts();
        res.json({
            success: true,
            data: alerts,
            count: alerts.length,
            timestamp: Date.now()
        });
    }
    catch (error) {
        console.error('Erro ao obter alertas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/metrics/alerts/threshold - Adicionar threshold de alerta
router.post('/alerts/threshold', (req, res) => {
    try {
        const { metric, operator, value, severity, message } = req.body;
        // Validações básicas
        if (!metric || !operator || value === undefined || !severity || !message) {
            return res.status(400).json({
                success: false,
                message: 'Campos obrigatórios: metric, operator, value, severity, message'
            });
        }
        const validOperators = ['>', '<', '==', '>=', '<='];
        if (!validOperators.includes(operator)) {
            return res.status(400).json({
                success: false,
                message: 'Operador inválido. Use: >, <, ==, >=, <='
            });
        }
        const validSeverities = ['low', 'medium', 'high', 'critical'];
        if (!validSeverities.includes(severity)) {
            return res.status(400).json({
                success: false,
                message: 'Severidade inválida. Use: low, medium, high, critical'
            });
        }
        metricsService_1.default.addAlertThreshold({
            metric,
            operator,
            value: Number(value),
            severity,
            message
        });
        res.json({
            success: true,
            message: 'Threshold de alerta adicionado com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao adicionar threshold:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// DELETE /api/metrics/alerts/threshold/:metric - Remover threshold de alerta
router.delete('/alerts/threshold/:metric', (req, res) => {
    try {
        const { metric } = req.params;
        metricsService_1.default.removeAlertThreshold(metric);
        res.json({
            success: true,
            message: 'Threshold removido com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao remover threshold:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/metrics/dashboard - Dashboard consolidado de métricas
router.get('/dashboard', metricsCache, (req, res) => {
    try {
        const systemMetrics = metricsService_1.default.getSystemMetrics();
        const performanceMetrics = metricsService_1.default.getAggregatedMetrics('1h');
        const alerts = metricsService_1.default.getActiveAlerts();
        // Calcular indicadores chave
        const kpis = {
            systemHealth: {
                status: alerts.filter(a => a.severity === 'critical').length === 0 ? 'healthy' : 'critical',
                uptime: Math.floor(systemMetrics.uptime / 1000 / 60), // em minutos
                memoryUsage: Math.round((systemMetrics.memory.heapUsed / systemMetrics.memory.heapTotal) * 100),
                avgResponseTime: Math.round(systemMetrics.avgResponseTime)
            },
            performance: {
                requestsPerMinute: systemMetrics.requestsPerMinute,
                errorRate: Math.round(systemMetrics.errorRate * 100) / 100,
                cacheHitRate: Math.round(systemMetrics.cacheHitRate * 100) / 100,
                totalRequests: performanceMetrics.totalRequests
            },
            alerts: {
                total: alerts.length,
                critical: alerts.filter(a => a.severity === 'critical').length,
                high: alerts.filter(a => a.severity === 'high').length,
                medium: alerts.filter(a => a.severity === 'medium').length,
                low: alerts.filter(a => a.severity === 'low').length
            }
        };
        res.json({
            success: true,
            data: {
                kpis,
                systemMetrics,
                performanceMetrics,
                recentAlerts: alerts.slice(0, 5) // Últimos 5 alertas
            },
            timestamp: Date.now()
        });
    }
    catch (error) {
        console.error('Erro ao gerar dashboard de métricas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/metrics/export - Exportar métricas para análise
router.get('/export', (req, res) => {
    try {
        const exportData = metricsService_1.default.exportMetrics();
        // Configurar headers para download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=metrics-export-${new Date().toISOString().split('T')[0]}.json`);
        res.json({
            success: true,
            data: exportData,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        });
    }
    catch (error) {
        console.error('Erro ao exportar métricas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// WebSocket endpoint para métricas em tempo real (simulado via polling)
router.get('/realtime', (req, res) => {
    try {
        // Configurar response para Server-Sent Events
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });
        // Enviar métricas a cada 5 segundos
        const interval = setInterval(() => {
            const systemMetrics = metricsService_1.default.getSystemMetrics();
            const alerts = metricsService_1.default.getActiveAlerts();
            const data = {
                timestamp: Date.now(),
                systemMetrics,
                alerts: alerts.length,
                criticalAlerts: alerts.filter(a => a.severity === 'critical').length
            };
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        }, 5000);
        // Limpar intervalo quando conexão fechar
        req.on('close', () => {
            clearInterval(interval);
            res.end();
        });
    }
    catch (error) {
        console.error('Erro no stream de métricas em tempo real:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
exports.default = router;
