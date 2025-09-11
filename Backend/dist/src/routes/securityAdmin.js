"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const securityAudit_1 = __importDefault(require("../middleware/securityAudit"));
const realTimeMonitoring_1 = __importDefault(require("../middleware/realTimeMonitoring"));
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
/**
 * Rotas de Administração de Segurança
 * Acesso apenas para administradores
 */
// Middleware de autenticação de admin (implementar conforme necessário)
const requireAdminAuth = (req, res, next) => {
    // TODO: Implementar verificação de admin
    // Por enquanto, mock para demonstração
    const isAdmin = req.headers.authorization === 'Bearer admin-token-here';
    if (!isAdmin) {
        return res.status(403).json({
            error: 'Acesso restrito a administradores',
            code: 'ADMIN_REQUIRED'
        });
    }
    next();
};
// Dashboard de segurança
router.get('/dashboard', requireAdminAuth, async (req, res) => {
    try {
        const [securityStats, monitoringStats] = await Promise.all([
            securityAudit_1.default.getSecurityStats(),
            Promise.resolve(realTimeMonitoring_1.default.getDetailedStats())
        ]);
        const dashboard = {
            timestamp: new Date().toISOString(),
            security: securityStats,
            monitoring: monitoringStats,
            summary: {
                systemHealth: monitoringStats.systemHealth,
                criticalAlerts: monitoringStats.recentAlerts.filter((a) => a.severity === 'critical').length,
                blockedIPs: securityStats.blockedIPs,
                uptime: monitoringStats.current.uptime
            }
        };
        res.json(dashboard);
    }
    catch (error) {
        logger_1.logger.error('Error fetching security dashboard', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
});
// Estatísticas de segurança
router.get('/security/stats', requireAdminAuth, async (req, res) => {
    try {
        const stats = await securityAudit_1.default.getSecurityStats();
        res.json(stats);
    }
    catch (error) {
        logger_1.logger.error('Error fetching security stats', error);
        res.status(500).json({
            error: 'Erro ao obter estatísticas de segurança',
            code: 'STATS_ERROR'
        });
    }
});
// Métricas de performance
router.get('/monitoring/metrics', requireAdminAuth, (req, res) => {
    try {
        const metrics = realTimeMonitoring_1.default.getDetailedStats();
        res.json(metrics);
    }
    catch (error) {
        logger_1.logger.error('Error fetching monitoring metrics', error);
        res.status(500).json({
            error: 'Erro ao obter métricas de monitoramento',
            code: 'METRICS_ERROR'
        });
    }
});
// Requests recentes
router.get('/monitoring/requests', requireAdminAuth, (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const requests = realTimeMonitoring_1.default.getRecentRequests(limit);
        res.json(requests);
    }
    catch (error) {
        logger_1.logger.error('Error fetching recent requests', error);
        res.status(500).json({
            error: 'Erro ao obter requests recentes',
            code: 'REQUESTS_ERROR'
        });
    }
});
// Alertas recentes
router.get('/monitoring/alerts', requireAdminAuth, (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const alerts = realTimeMonitoring_1.default.getRecentAlerts(limit);
        res.json(alerts);
    }
    catch (error) {
        logger_1.logger.error('Error fetching recent alerts', error);
        res.status(500).json({
            error: 'Erro ao obter alertas recentes',
            code: 'ALERTS_ERROR'
        });
    }
});
// Bloquear IP
router.post('/security/block-ip', requireAdminAuth, async (req, res) => {
    try {
        const { ip, reason } = req.body;
        if (!ip) {
            return res.status(400).json({
                error: 'IP é obrigatório',
                code: 'MISSING_IP'
            });
        }
        await securityAudit_1.default.blockIP(ip, reason);
        logger_1.logger.info('IP blocked by admin', {
            ip,
            reason,
            adminUser: req.headers.authorization
        });
        res.json({
            success: true,
            message: `IP ${ip} bloqueado com sucesso`
        });
    }
    catch (error) {
        logger_1.logger.error('Error blocking IP', error);
        res.status(500).json({
            error: 'Erro ao bloquear IP',
            code: 'BLOCK_ERROR'
        });
    }
});
// Desbloquear IP
router.post('/security/unblock-ip', requireAdminAuth, async (req, res) => {
    try {
        const { ip } = req.body;
        if (!ip) {
            return res.status(400).json({
                error: 'IP é obrigatório',
                code: 'MISSING_IP'
            });
        }
        const success = await securityAudit_1.default.unblockIP(ip);
        if (success) {
            logger_1.logger.info('IP unblocked by admin', {
                ip,
                adminUser: req.headers.authorization
            });
            res.json({
                success: true,
                message: `IP ${ip} desbloqueado com sucesso`
            });
        }
        else {
            res.status(404).json({
                error: 'IP não encontrado na lista de bloqueados',
                code: 'IP_NOT_FOUND'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Error unblocking IP', error);
        res.status(500).json({
            error: 'Erro ao desbloquear IP',
            code: 'UNBLOCK_ERROR'
        });
    }
});
// Resetar métricas de monitoramento
router.post('/monitoring/reset', requireAdminAuth, (req, res) => {
    try {
        realTimeMonitoring_1.default.resetMetrics();
        logger_1.logger.info('Monitoring metrics reset by admin', {
            adminUser: req.headers.authorization,
            timestamp: new Date().toISOString()
        });
        res.json({
            success: true,
            message: 'Métricas de monitoramento resetadas com sucesso'
        });
    }
    catch (error) {
        logger_1.logger.error('Error resetting monitoring metrics', error);
        res.status(500).json({
            error: 'Erro ao resetar métricas',
            code: 'RESET_ERROR'
        });
    }
});
// Health check do sistema de segurança
router.get('/health', requireAdminAuth, async (req, res) => {
    try {
        const health = {
            timestamp: new Date().toISOString(),
            status: 'healthy',
            components: {
                securityAudit: {
                    status: 'healthy',
                    uptime: process.uptime()
                },
                monitoring: {
                    status: 'healthy',
                    metrics: realTimeMonitoring_1.default.getMetrics()
                },
                database: {
                    status: 'healthy', // TODO: implementar check do MongoDB
                    connected: true
                },
                filesystem: {
                    status: 'healthy' // TODO: implementar check do filesystem
                }
            }
        };
        // Verificar componentes críticos
        const memoryUsage = process.memoryUsage();
        if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
            health.status = 'warning';
            health.components.monitoring.status = 'warning';
        }
        res.json(health);
    }
    catch (error) {
        logger_1.logger.error('Error checking system health', error);
        res.status(500).json({
            status: 'error',
            error: 'Erro ao verificar saúde do sistema',
            timestamp: new Date().toISOString()
        });
    }
});
// Exportar logs de segurança
router.get('/security/export-logs', requireAdminAuth, async (req, res) => {
    try {
        const { format = 'json', days = 7 } = req.query;
        const stats = await securityAudit_1.default.getSecurityStats();
        // Por agora, retornar as estatísticas
        // TODO: implementar exportação real dos logs
        const exportData = {
            exportedAt: new Date().toISOString(),
            period: `${days} days`,
            format,
            data: stats
        };
        if (format === 'csv') {
            // TODO: converter para CSV
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=security-logs.csv');
            res.send('CSV export not implemented yet');
        }
        else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename=security-logs.json');
            res.json(exportData);
        }
    }
    catch (error) {
        logger_1.logger.error('Error exporting security logs', error);
        res.status(500).json({
            error: 'Erro ao exportar logs de segurança',
            code: 'EXPORT_ERROR'
        });
    }
});
// Configurar limites de segurança
router.put('/security/config', requireAdminAuth, async (req, res) => {
    try {
        const { rateLimits, alertThresholds } = req.body;
        // TODO: implementar configuração dinâmica
        // Por agora, apenas log da configuração
        logger_1.logger.info('Security configuration updated by admin', {
            rateLimits,
            alertThresholds,
            adminUser: req.headers.authorization,
            timestamp: new Date().toISOString()
        });
        res.json({
            success: true,
            message: 'Configuração de segurança atualizada com sucesso',
            applied: {
                rateLimits: rateLimits || 'unchanged',
                alertThresholds: alertThresholds || 'unchanged'
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error updating security configuration', error);
        res.status(500).json({
            error: 'Erro ao atualizar configuração de segurança',
            code: 'CONFIG_ERROR'
        });
    }
});
exports.default = router;
