"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationService_1 = __importDefault(require("../services/notificationService"));
const security_1 = require("../middleware/security");
const security_2 = __importDefault(require("../middleware/security"));
const router = express_1.default.Router();
/**
 * Rotas de Notificações
 * Endpoints para gerenciar notificações em tempo real
 */
// Aplicar autenticação em todas as rotas
router.use(security_1.authenticateWithCookie);
// Aplicar rate limiting específico para notificações
const notificationRateLimit = security_2.default.rateLimits.api;
router.use(notificationRateLimit);
// GET /api/notifications - Listar notificações do usuário
router.get('/', (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }
        const { unreadOnly = 'false', category, limit = '50', offset = '0' } = req.query;
        const notifications = notificationService_1.default.getUserNotifications(userId, {
            unreadOnly: unreadOnly === 'true',
            category: category,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        res.json({
            success: true,
            data: notifications,
            count: notifications.length,
            timestamp: Date.now()
        });
    }
    catch (error) {
        console.error('Erro ao listar notificações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/notifications - Enviar notificação (admin only)
router.post('/', (req, res) => {
    try {
        // Verificar se usuário é admin
        if (req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Apenas administradores podem enviar notificações.'
            });
        }
        const { type = 'info', category = 'general', title, message, userId, userRole, data, channels = [{ type: 'websocket', enabled: true }], priority = 'medium', persistent = true, expiresAt } = req.body;
        // Validações básicas
        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Título e mensagem são obrigatórios'
            });
        }
        const notificationPromise = notificationService_1.default.sendNotification({
            type,
            category,
            title,
            message,
            userId,
            userRole,
            data,
            channels,
            priority,
            persistent,
            expiresAt
        });
        notificationPromise.then(notificationId => {
            res.json({
                success: true,
                message: 'Notificação enviada com sucesso',
                notificationId
            });
        }).catch(error => {
            console.error('Erro ao enviar notificação:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao enviar notificação',
                error: error.message
            });
        });
    }
    catch (error) {
        console.error('Erro ao processar envio de notificação:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/notifications/template - Enviar notificação usando template
router.post('/template', (req, res) => {
    try {
        // Verificar se usuário é admin
        if (req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Apenas administradores podem enviar notificações.'
            });
        }
        const { templateId, variables, overrides } = req.body;
        if (!templateId || !variables) {
            return res.status(400).json({
                success: false,
                message: 'Template ID e variáveis são obrigatórios'
            });
        }
        const notificationPromise = notificationService_1.default.sendTemplateNotification(templateId, variables, overrides);
        notificationPromise.then(notificationId => {
            res.json({
                success: true,
                message: 'Notificação enviada com sucesso',
                notificationId
            });
        }).catch(error => {
            console.error('Erro ao enviar notificação por template:', error);
            res.status(500).json({
                success: false,
                message: error.message.includes('Template não encontrado') ?
                    'Template não encontrado' : 'Erro ao enviar notificação',
                error: error.message
            });
        });
    }
    catch (error) {
        console.error('Erro ao processar notificação por template:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// PUT /api/notifications/:id/read - Marcar notificação como lida
router.put('/:id/read', (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }
        const success = notificationService_1.default.markAsRead(notificationId, userId);
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Notificação não encontrada'
            });
        }
        res.json({
            success: true,
            message: 'Notificação marcada como lida'
        });
    }
    catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/notifications/templates - Listar templates (admin only)
router.get('/templates', (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Apenas administradores podem visualizar templates.'
            });
        }
        const templates = notificationService_1.default.getTemplates();
        res.json({
            success: true,
            data: templates,
            count: templates.length
        });
    }
    catch (error) {
        console.error('Erro ao listar templates:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/notifications/templates - Criar template (admin only)
router.post('/templates', (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Apenas administradores podem criar templates.'
            });
        }
        const { id, name, category, type = 'info', titleTemplate, messageTemplate, channels = [{ type: 'websocket', enabled: true }], variables = [] } = req.body;
        // Validações básicas
        if (!id || !name || !category || !titleTemplate || !messageTemplate) {
            return res.status(400).json({
                success: false,
                message: 'Campos obrigatórios: id, name, category, titleTemplate, messageTemplate'
            });
        }
        notificationService_1.default.createTemplate({
            id,
            name,
            category,
            type,
            titleTemplate,
            messageTemplate,
            channels,
            variables
        });
        res.json({
            success: true,
            message: 'Template criado com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao criar template:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/notifications/stats - Estatísticas de notificações (admin only)
router.get('/stats', (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Apenas administradores podem visualizar estatísticas.'
            });
        }
        const statistics = notificationService_1.default.getStatistics();
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
exports.default = router;
