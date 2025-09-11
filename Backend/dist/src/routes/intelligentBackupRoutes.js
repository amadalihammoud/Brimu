"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const intelligentBackupService_1 = __importDefault(require("../services/intelligentBackupService"));
const security_1 = require("../middleware/security");
const security_2 = __importDefault(require("../middleware/security"));
const router = express_1.default.Router();
/**
 * Rotas do Sistema de Backup Inteligente
 * Endpoints para gerenciar backups automatizados com recursos avançados
 */
// Aplicar autenticação admin em todas as rotas
router.use(security_1.authenticateWithCookie);
// Verificar se usuário é admin
router.use((req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Acesso negado. Apenas administradores podem gerenciar backups.'
        });
    }
    next();
});
// Aplicar rate limiting específico para backups
const backupRateLimit = security_2.default.rateLimits.api;
router.use(backupRateLimit);
// POST /api/backups/intelligent/create - Criar backup inteligente
router.post('/create', async (req, res) => {
    try {
        const { type = 'manual' } = req.body;
        if (!['daily', 'weekly', 'monthly', 'manual'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de backup inválido. Use: daily, weekly, monthly, manual'
            });
        }
        // Verificar se já existe um backup ativo
        const activeBackups = intelligentBackupService_1.default.getActiveBackups();
        if (activeBackups.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Já existe um backup em andamento',
                activeBackups
            });
        }
        const backupMetadata = await intelligentBackupService_1.default.createIntelligentBackup(type);
        res.json({
            success: true,
            message: 'Backup inteligente iniciado com sucesso',
            data: backupMetadata
        });
    }
    catch (error) {
        console.error('Erro ao criar backup inteligente:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar backup',
            error: error.message
        });
    }
});
// GET /api/backups/intelligent/progress/:id - Obter progresso do backup
router.get('/progress/:id', (req, res) => {
    try {
        const { id } = req.params;
        const progress = intelligentBackupService_1.default.getBackupProgress(id);
        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'Backup não encontrado ou já finalizado'
            });
        }
        res.json({
            success: true,
            data: progress
        });
    }
    catch (error) {
        console.error('Erro ao obter progresso do backup:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/backups/intelligent/active - Listar backups ativos
router.get('/active', (req, res) => {
    try {
        const activeBackups = intelligentBackupService_1.default.getActiveBackups();
        res.json({
            success: true,
            data: activeBackups,
            count: activeBackups.length
        });
    }
    catch (error) {
        console.error('Erro ao listar backups ativos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/backups/intelligent/history - Histórico de backups
router.get('/history', (req, res) => {
    try {
        const { limit } = req.query;
        const history = intelligentBackupService_1.default.getBackupHistory(limit ? parseInt(limit) : undefined);
        res.json({
            success: true,
            data: history,
            count: history.length
        });
    }
    catch (error) {
        console.error('Erro ao obter histórico de backups:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/backups/intelligent/stats - Estatísticas de backup
router.get('/stats', (req, res) => {
    try {
        const statistics = intelligentBackupService_1.default.getBackupStatistics();
        res.json({
            success: true,
            data: statistics,
            timestamp: Date.now()
        });
    }
    catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/backups/intelligent/restore - Restaurar backup
router.post('/restore', async (req, res) => {
    try {
        const { backupId, targetPath } = req.body;
        if (!backupId) {
            return res.status(400).json({
                success: false,
                message: 'ID do backup é obrigatório'
            });
        }
        const restored = await intelligentBackupService_1.default.restoreBackup(backupId, targetPath);
        res.json({
            success: true,
            message: 'Backup restaurado com sucesso',
            restored
        });
    }
    catch (error) {
        console.error('Erro ao restaurar backup:', error);
        res.status(500).json({
            success: false,
            message: error.message.includes('não encontrado') ?
                'Backup não encontrado' : 'Erro ao restaurar backup',
            error: error.message
        });
    }
});
// GET /api/backups/intelligent/dashboard - Dashboard consolidado
router.get('/dashboard', (req, res) => {
    try {
        const statistics = intelligentBackupService_1.default.getBackupStatistics();
        const activeBackups = intelligentBackupService_1.default.getActiveBackups();
        const recentHistory = intelligentBackupService_1.default.getBackupHistory(10);
        // Calcular indicadores de saúde
        const healthStatus = {
            overall: 'healthy',
            issues: []
        };
        // Verificar se há falhas recentes
        const recentFailures = recentHistory.filter(b => b.status === 'failed' &&
            Date.now() - b.createdAt < 24 * 60 * 60 * 1000).length;
        if (recentFailures > 0) {
            healthStatus.overall = 'warning';
            healthStatus.issues.push(`${recentFailures} backup(s) falharam nas últimas 24h`);
        }
        // Verificar se último backup é muito antigo
        if (statistics.lastBackup) {
            const daysSinceLastBackup = (Date.now() - statistics.lastBackup.createdAt) / (24 * 60 * 60 * 1000);
            if (daysSinceLastBackup > 2) {
                healthStatus.overall = daysSinceLastBackup > 7 ? 'critical' : 'warning';
                healthStatus.issues.push(`Último backup há ${Math.floor(daysSinceLastBackup)} dias`);
            }
        }
        else {
            healthStatus.overall = 'critical';
            healthStatus.issues.push('Nenhum backup encontrado');
        }
        // Calcular tendências
        const last7Days = recentHistory.filter(b => Date.now() - b.createdAt < 7 * 24 * 60 * 60 * 1000);
        const trends = {
            backupFrequency: last7Days.length,
            avgSize: last7Days.length > 0 ?
                last7Days.reduce((sum, b) => sum + b.size, 0) / last7Days.length : 0,
            successRate: last7Days.length > 0 ?
                (last7Days.filter(b => b.status === 'completed').length / last7Days.length) * 100 : 0
        };
        res.json({
            success: true,
            data: {
                statistics,
                activeBackups,
                recentHistory: recentHistory.slice(0, 5),
                healthStatus,
                trends
            },
            timestamp: Date.now()
        });
    }
    catch (error) {
        console.error('Erro ao gerar dashboard de backup:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// Server-Sent Events para progresso em tempo real
router.get('/progress/:id/stream', (req, res) => {
    try {
        const { id } = req.params;
        // Configurar SSE
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });
        // Enviar progresso inicial
        const initialProgress = intelligentBackupService_1.default.getBackupProgress(id);
        if (initialProgress) {
            res.write(`data: ${JSON.stringify(initialProgress)}\n\n`);
        }
        // Listener para atualizações de progresso
        const progressListener = (progress) => {
            if (progress.id === id) {
                res.write(`data: ${JSON.stringify(progress)}\n\n`);
                // Fechar stream quando completar
                if (progress.stage === 'completed' || progress.stage === 'failed') {
                    res.end();
                }
            }
        };
        intelligentBackupService_1.default.on('backupProgress', progressListener);
        // Limpar listener quando conexão fechar
        req.on('close', () => {
            intelligentBackupService_1.default.removeListener('backupProgress', progressListener);
            res.end();
        });
        // Timeout de segurança (30 minutos)
        setTimeout(() => {
            intelligentBackupService_1.default.removeListener('backupProgress', progressListener);
            res.end();
        }, 30 * 60 * 1000);
    }
    catch (error) {
        console.error('Erro no stream de progresso:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
exports.default = router;
