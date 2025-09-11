"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const performanceAnalysisService_1 = __importDefault(require("../services/performanceAnalysisService"));
const security_1 = require("../middleware/security");
const advancedLoggingService_1 = __importDefault(require("../services/advancedLoggingService"));
const router = express_1.default.Router();
/**
 * Rotas do Sistema de Análise de Performance
 * Endpoints para monitoramento e análise de performance em tempo real
 */
// Aplicar autenticação admin em todas as rotas
router.use(security_1.authenticateWithCookie);
// Verificar se usuário é admin
router.use((req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Acesso negado. Apenas administradores podem acessar análise de performance.'
        });
    }
    next();
});
// GET /api/performance/analytics - Análise completa de performance
router.get('/analytics', (req, res) => {
    try {
        const { timeRange } = req.query;
        let parsedTimeRange;
        if (timeRange) {
            try {
                parsedTimeRange = JSON.parse(timeRange);
            }
            catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato inválido para timeRange. Use: {"start": timestamp, "end": timestamp}'
                });
            }
        }
        const analytics = performanceAnalysisService_1.default.getPerformanceAnalytics(parsedTimeRange);
        res.json({
            success: true,
            data: analytics,
            timestamp: Date.now()
        });
    }
    catch (error) {
        advancedLoggingService_1.default.error('Error generating performance analytics', {
            error: error.message,
            endpoint: '/api/performance/analytics',
            method: 'GET'
        });
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/performance/profiles - Perfis de performance dos endpoints
router.get('/profiles', (req, res) => {
    try {
        const profiles = performanceAnalysisService_1.default.getPerformanceProfiles();
        res.json({
            success: true,
            data: profiles,
            count: profiles.length,
            timestamp: Date.now()
        });
    }
    catch (error) {
        advancedLoggingService_1.default.error('Error fetching performance profiles', {
            error: error.message,
            endpoint: '/api/performance/profiles',
            method: 'GET'
        });
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/performance/anomalies - Anomalias de performance
router.get('/anomalies', (req, res) => {
    try {
        const { limit = '50' } = req.query;
        const anomalies = performanceAnalysisService_1.default.getAnomalies(parseInt(limit));
        res.json({
            success: true,
            data: anomalies,
            count: anomalies.length,
            timestamp: Date.now()
        });
    }
    catch (error) {
        advancedLoggingService_1.default.error('Error fetching performance anomalies', {
            error: error.message,
            endpoint: '/api/performance/anomalies',
            method: 'GET'
        });
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/performance/metrics - Buscar métricas com filtros
router.get('/metrics', (req, res) => {
    try {
        const { metric, endpoint, severity, timeRange, limit = '100' } = req.query;
        const filters = {};
        if (metric)
            filters.metric = metric;
        if (endpoint)
            filters.endpoint = endpoint;
        if (severity)
            filters.severity = severity;
        if (limit)
            filters.limit = parseInt(limit);
        if (timeRange) {
            try {
                filters.timeRange = JSON.parse(timeRange);
            }
            catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato inválido para timeRange'
                });
            }
        }
        const metrics = performanceAnalysisService_1.default.searchMetrics(filters);
        res.json({
            success: true,
            data: metrics,
            count: metrics.length,
            filters,
            timestamp: Date.now()
        });
    }
    catch (error) {
        advancedLoggingService_1.default.error('Error searching performance metrics', {
            error: error.message,
            endpoint: '/api/performance/metrics',
            method: 'GET'
        });
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/performance/endpoint/:endpoint - Análise específica de endpoint
router.get('/endpoint/*', (req, res) => {
    try {
        const endpoint = '/' + req.params[0]; // Reconstituir o endpoint completo
        const { method = 'GET' } = req.query;
        const analysis = performanceAnalysisService_1.default.analyzeEndpoint(endpoint, method);
        res.json({
            success: true,
            data: analysis,
            endpoint,
            method,
            timestamp: Date.now()
        });
    }
    catch (error) {
        advancedLoggingService_1.default.error('Error analyzing endpoint performance', {
            error: error.message,
            endpoint: '/api/performance/endpoint',
            method: 'GET'
        });
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/performance/metric - Registrar métrica de performance manual
router.post('/metric', (req, res) => {
    try {
        const { metric, value, unit, context, threshold } = req.body;
        // Validações básicas
        if (!metric || value === undefined || !unit) {
            return res.status(400).json({
                success: false,
                message: 'Campos obrigatórios: metric, value, unit'
            });
        }
        if (typeof value !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'Value deve ser um número'
            });
        }
        performanceAnalysisService_1.default.recordMetric({
            metric,
            value,
            unit,
            context,
            threshold
        });
        res.json({
            success: true,
            message: 'Métrica registrada com sucesso',
            timestamp: Date.now()
        });
    }
    catch (error) {
        advancedLoggingService_1.default.error('Error recording performance metric', {
            error: error.message,
            endpoint: '/api/performance/metric',
            method: 'POST'
        });
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/performance/dashboard - Dashboard consolidado de performance
router.get('/dashboard', (req, res) => {
    try {
        const { period = '1h' } = req.query;
        let timeRange;
        const now = Date.now();
        switch (period) {
            case '5m':
                timeRange = { start: now - 300000, end: now };
                break;
            case '15m':
                timeRange = { start: now - 900000, end: now };
                break;
            case '1h':
                timeRange = { start: now - 3600000, end: now };
                break;
            case '6h':
                timeRange = { start: now - 21600000, end: now };
                break;
            case '24h':
                timeRange = { start: now - 86400000, end: now };
                break;
            case '7d':
                timeRange = { start: now - 604800000, end: now };
                break;
            default:
                timeRange = { start: now - 3600000, end: now };
        }
        const analytics = performanceAnalysisService_1.default.getPerformanceAnalytics(timeRange);
        const profiles = performanceAnalysisService_1.default.getPerformanceProfiles();
        const anomalies = performanceAnalysisService_1.default.getAnomalies(10);
        // Métricas críticas recentes
        const criticalMetrics = performanceAnalysisService_1.default.searchMetrics({
            severity: 'critical',
            timeRange,
            limit: 20
        });
        // Status geral do sistema
        const systemStatus = {
            status: analytics.summary.overallHealth,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            activeEndpoints: profiles.length,
            criticalIssues: criticalMetrics.length,
            recentAnomalies: anomalies.length
        };
        res.json({
            success: true,
            data: {
                systemStatus,
                analytics,
                topEndpoints: profiles.slice(0, 10),
                recentAnomalies: anomalies,
                criticalMetrics,
                timeRange: {
                    period,
                    start: timeRange.start,
                    end: timeRange.end
                }
            },
            timestamp: now
        });
    }
    catch (error) {
        advancedLoggingService_1.default.error('Error generating performance dashboard', {
            error: error.message,
            endpoint: '/api/performance/dashboard',
            method: 'GET'
        });
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/performance/realtime - Métricas em tempo real (Server-Sent Events)
router.get('/realtime', (req, res) => {
    try {
        const { metrics = 'response_time,error_rate,memory_usage' } = req.query;
        // Configurar Server-Sent Events
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });
        // Filtro de métricas
        const metricsFilter = metrics.split(',');
        // Listener para novas métricas
        const metricListener = (metric) => {
            // Aplicar filtro se especificado
            if (!metricsFilter.includes(metric.metric)) {
                return;
            }
            const data = {
                id: metric.id,
                timestamp: metric.timestamp,
                metric: metric.metric,
                value: metric.value,
                unit: metric.unit,
                severity: metric.severity,
                endpoint: metric.context?.endpoint,
                component: metric.context?.component
            };
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };
        // Listener para anomalias
        const anomalyListener = (anomaly) => {
            const data = {
                type: 'anomaly',
                id: anomaly.id,
                timestamp: anomaly.timestamp,
                anomalyType: anomaly.type,
                severity: anomaly.severity,
                endpoint: anomaly.endpoint,
                metric: anomaly.metric,
                currentValue: anomaly.currentValue,
                expectedValue: anomaly.expectedValue
            };
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };
        // Registrar listeners
        performanceAnalysisService_1.default.on('metric', metricListener);
        performanceAnalysisService_1.default.on('anomaly', anomalyListener);
        // Enviar heartbeat a cada 30 segundos
        const heartbeat = setInterval(() => {
            res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
        }, 30000);
        // Cleanup quando conexão fechar
        req.on('close', () => {
            performanceAnalysisService_1.default.removeListener('metric', metricListener);
            performanceAnalysisService_1.default.removeListener('anomaly', anomalyListener);
            clearInterval(heartbeat);
            res.end();
        });
        // Timeout de segurança (30 minutos)
        setTimeout(() => {
            performanceAnalysisService_1.default.removeListener('metric', metricListener);
            performanceAnalysisService_1.default.removeListener('anomaly', anomalyListener);
            clearInterval(heartbeat);
            res.end();
        }, 30 * 60 * 1000);
    }
    catch (error) {
        advancedLoggingService_1.default.error('Error in performance realtime stream', {
            error: error.message,
            endpoint: '/api/performance/realtime',
            method: 'GET'
        });
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/performance/health - Status de saúde do sistema de performance
router.get('/health', (req, res) => {
    try {
        const analytics = performanceAnalysisService_1.default.getPerformanceAnalytics();
        const anomalies = performanceAnalysisService_1.default.getAnomalies(5);
        const health = {
            status: analytics.summary.overallHealth,
            score: calculateHealthScore(analytics.summary),
            issues: anomalies.filter(a => a.severity === 'critical'),
            warnings: anomalies.filter(a => a.severity === 'warning'),
            uptime: process.uptime(),
            lastAnalysis: Date.now(),
            metrics: {
                responseTime: analytics.summary.averageResponseTime,
                errorRate: analytics.summary.errorRate,
                memoryUsage: analytics.summary.memoryUsage,
                cpuUsage: analytics.summary.cpuUsage
            }
        };
        res.json({
            success: true,
            data: health,
            timestamp: Date.now()
        });
    }
    catch (error) {
        advancedLoggingService_1.default.error('Error checking performance health', {
            error: error.message,
            endpoint: '/api/performance/health',
            method: 'GET'
        });
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// Função helper para calcular score de saúde
function calculateHealthScore(summary) {
    let score = 100;
    // Penalizar tempo de resposta alto
    if (summary.averageResponseTime > 3000)
        score -= 30;
    else if (summary.averageResponseTime > 1500)
        score -= 15;
    else if (summary.averageResponseTime > 800)
        score -= 5;
    // Penalizar alta taxa de erro
    if (summary.errorRate > 10)
        score -= 40;
    else if (summary.errorRate > 5)
        score -= 20;
    else if (summary.errorRate > 2)
        score -= 10;
    // Penalizar alto uso de memória
    if (summary.memoryUsage > 90)
        score -= 20;
    else if (summary.memoryUsage > 80)
        score -= 10;
    else if (summary.memoryUsage > 60)
        score -= 5;
    // Penalizar alto uso de CPU
    if (summary.cpuUsage > 90)
        score -= 15;
    else if (summary.cpuUsage > 70)
        score -= 8;
    else if (summary.cpuUsage > 50)
        score -= 3;
    return Math.max(0, score);
}
exports.default = router;
