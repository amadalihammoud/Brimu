"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const advancedLoggingService_1 = __importDefault(require("../services/advancedLoggingService"));
const security_1 = require("../middleware/security");
const security_2 = __importDefault(require("../middleware/security"));
const router = express_1.default.Router();
/**
 * Rotas do Sistema de Logs Avançado
 * Endpoints para análise, busca e gerenciamento de logs
 */
// Aplicar autenticação admin em todas as rotas
router.use(security_1.authenticateWithCookie);
// Verificar se usuário é admin
router.use((req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Acesso negado. Apenas administradores podem acessar logs.'
        });
    }
    next();
});
// Aplicar rate limiting específico para logs
const logsRateLimit = security_2.default.rateLimits.api;
router.use(logsRateLimit);
// GET /api/logs/search - Buscar logs com filtros
router.get('/search', (req, res) => {
    try {
        const { level, timeRange, userId, correlationId, text, tags, limit = '100', offset = '0' } = req.query;
        // Processar filtros
        const filters = {};
        if (level) {
            filters.level = Array.isArray(level) ? level : [level];
        }
        if (timeRange) {
            try {
                filters.timeRange = JSON.parse(timeRange);
            }
            catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato inválido para timeRange. Use: {"start": timestamp, "end": timestamp}'
                });
            }
        }
        if (userId)
            filters.userId = userId;
        if (correlationId)
            filters.correlationId = correlationId;
        if (text)
            filters.text = text;
        if (tags) {
            filters.tags = Array.isArray(tags) ? tags : [tags];
        }
        filters.limit = parseInt(limit);
        filters.offset = parseInt(offset);
        const logs = advancedLoggingService_1.default.searchLogs(filters);
        res.json({
            success: true,
            data: logs,
            count: logs.length,
            filters: filters
        });
    }
    catch (error) {
        console.error('Erro ao buscar logs:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/logs/analytics - Análise estatística de logs
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
                    message: 'Formato inválido para timeRange'
                });
            }
        }
        const analytics = advancedLoggingService_1.default.getAnalytics(parsedTimeRange);
        res.json({
            success: true,
            data: analytics,
            timestamp: Date.now()
        });
    }
    catch (error) {
        console.error('Erro ao gerar análise de logs:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/logs/patterns - Listar padrões de monitoramento
router.get('/patterns', (req, res) => {
    try {
        const patterns = advancedLoggingService_1.default.getPatterns();
        res.json({
            success: true,
            data: patterns,
            count: patterns.length
        });
    }
    catch (error) {
        console.error('Erro ao listar padrões:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/logs/patterns - Criar novo padrão de monitoramento
router.post('/patterns', (req, res) => {
    try {
        const { id, name, pattern, level, description, action = 'count', threshold, timeWindow } = req.body;
        // Validações básicas
        if (!id || !name || !pattern || !level || !description) {
            return res.status(400).json({
                success: false,
                message: 'Campos obrigatórios: id, name, pattern, level, description'
            });
        }
        const validLevels = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly', 'all'];
        if (!validLevels.includes(level)) {
            return res.status(400).json({
                success: false,
                message: `Nível inválido. Use: ${validLevels.join(', ')}`
            });
        }
        const validActions = ['alert', 'count', 'ignore'];
        if (!validActions.includes(action)) {
            return res.status(400).json({
                success: false,
                message: `Ação inválida. Use: ${validActions.join(', ')}`
            });
        }
        // Converter string para RegExp se necessário
        let processedPattern = pattern;
        if (typeof pattern === 'string' && pattern.startsWith('/') && pattern.endsWith('/')) {
            try {
                processedPattern = new RegExp(pattern.slice(1, -1), 'i');
            }
            catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Padrão regex inválido'
                });
            }
        }
        advancedLoggingService_1.default.addPattern({
            id,
            name,
            pattern: processedPattern,
            level,
            description,
            action,
            threshold,
            timeWindow
        });
        res.json({
            success: true,
            message: 'Padrão criado com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao criar padrão:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// DELETE /api/logs/patterns/:id - Remover padrão
router.delete('/patterns/:id', (req, res) => {
    try {
        const { id } = req.params;
        const removed = advancedLoggingService_1.default.removePattern(id);
        if (!removed) {
            return res.status(404).json({
                success: false,
                message: 'Padrão não encontrado'
            });
        }
        res.json({
            success: true,
            message: 'Padrão removido com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao remover padrão:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/logs/export - Exportar logs
router.get('/export', (req, res) => {
    try {
        const { format = 'json', level, timeRange, userId, text, limit = '1000' } = req.query;
        const validFormats = ['json', 'csv', 'elasticsearch'];
        if (!validFormats.includes(format)) {
            return res.status(400).json({
                success: false,
                message: `Formato inválido. Use: ${validFormats.join(', ')}`
            });
        }
        // Preparar filtros para exportação
        const filters = {};
        if (level)
            filters.level = Array.isArray(level) ? level : [level];
        if (userId)
            filters.userId = userId;
        if (text)
            filters.text = text;
        filters.limit = parseInt(limit);
        if (timeRange) {
            try {
                filters.timeRange = JSON.parse(timeRange);
            }
            catch (error) {
                // Ignorar timeRange inválido
            }
        }
        const exportData = advancedLoggingService_1.default.exportLogs(format, filters);
        // Configurar headers para download
        const timestamp = new Date().toISOString().split('T')[0];
        const extension = format === 'csv' ? 'csv' : format === 'elasticsearch' ? 'jsonl' : 'json';
        res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=logs-export-${timestamp}.${extension}`);
        res.send(exportData);
    }
    catch (error) {
        console.error('Erro ao exportar logs:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/logs/cleanup - Limpar logs antigos
router.post('/cleanup', (req, res) => {
    try {
        const { olderThan } = req.body;
        if (!olderThan || typeof olderThan !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'Campo olderThan (timestamp) é obrigatório'
            });
        }
        const removedCount = advancedLoggingService_1.default.cleanup(olderThan);
        res.json({
            success: true,
            message: 'Limpeza de logs concluída',
            removedCount
        });
    }
    catch (error) {
        console.error('Erro ao limpar logs:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/logs/dashboard - Dashboard consolidado de logs
router.get('/dashboard', (req, res) => {
    try {
        const { period = '24h' } = req.query;
        let timeRange;
        const now = Date.now();
        switch (period) {
            case '1h':
                timeRange = { start: now - 3600000, end: now };
                break;
            case '24h':
                timeRange = { start: now - 86400000, end: now };
                break;
            case '7d':
                timeRange = { start: now - 604800000, end: now };
                break;
            default:
                timeRange = { start: now - 86400000, end: now };
        }
        const analytics = advancedLoggingService_1.default.getAnalytics(timeRange);
        const patterns = advancedLoggingService_1.default.getPatterns();
        // Logs recentes críticos
        const recentCriticalLogs = advancedLoggingService_1.default.searchLogs({
            level: ['error', 'warn'],
            timeRange,
            limit: 20
        });
        // Resumo do sistema
        const summary = {
            status: analytics.errorRate > 5 ? 'critical' : analytics.errorRate > 2 ? 'warning' : 'healthy',
            totalLogs: analytics.totalLogs,
            errorRate: analytics.errorRate,
            activePatterns: patterns.length,
            trends: analytics.trends
        };
        res.json({
            success: true,
            data: {
                summary,
                analytics,
                patterns,
                recentCriticalLogs,
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
        console.error('Erro ao gerar dashboard de logs:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/logs/realtime - Stream de logs em tempo real
router.get('/realtime', (req, res) => {
    try {
        const { level } = req.query;
        // Configurar Server-Sent Events
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });
        // Filtro de nível
        const levelFilter = level ? (Array.isArray(level) ? level : [level]) : null;
        // Listener para novos logs
        const logListener = (logEntry) => {
            // Aplicar filtro se especificado
            if (levelFilter && !levelFilter.includes(logEntry.level)) {
                return;
            }
            const data = {
                id: logEntry.id,
                timestamp: logEntry.timestamp,
                level: logEntry.level,
                message: logEntry.message,
                context: logEntry.context,
                fingerprint: logEntry.fingerprint,
                tags: logEntry.tags
            };
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };
        // Registrar listener
        advancedLoggingService_1.default.on('log', logListener);
        // Enviar heartbeat a cada 30 segundos
        const heartbeat = setInterval(() => {
            res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
        }, 30000);
        // Cleanup quando conexão fechar
        req.on('close', () => {
            advancedLoggingService_1.default.removeListener('log', logListener);
            clearInterval(heartbeat);
            res.end();
        });
        // Timeout de segurança (30 minutos)
        setTimeout(() => {
            advancedLoggingService_1.default.removeListener('log', logListener);
            clearInterval(heartbeat);
            res.end();
        }, 30 * 60 * 1000);
    }
    catch (error) {
        console.error('Erro no stream de logs:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
exports.default = router;
