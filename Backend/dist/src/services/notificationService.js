"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const logger_1 = require("../utils/logger");
const redisClient_1 = __importDefault(require("../cache/redisClient"));
class NotificationService extends events_1.EventEmitter {
    constructor() {
        super();
        this.notifications = new Map();
        this.templates = new Map();
        this.connections = new Map();
        this.userNotifications = new Map();
        this.initializeDefaultTemplates();
        this.startCleanupTimer();
    }
    // Enviar notificação
    async sendNotification(notification) {
        const notificationId = this.generateId();
        const fullNotification = {
            id: notificationId,
            timestamp: Date.now(),
            ...notification
        };
        // Armazenar notificação
        this.notifications.set(notificationId, fullNotification);
        // Indexar por usuário se especificado
        if (notification.userId) {
            if (!this.userNotifications.has(notification.userId)) {
                this.userNotifications.set(notification.userId, new Set());
            }
            this.userNotifications.get(notification.userId).add(notificationId);
        }
        // Processar canais de notificação
        await this.processNotificationChannels(fullNotification);
        // Armazenar no cache para persistência
        await this.storeInCache(fullNotification);
        logger_1.logger.info('Notification sent', {
            id: notificationId,
            type: notification.type,
            category: notification.category,
            title: notification.title,
            userId: notification.userId,
            channels: notification.channels.map(c => c.type)
        });
        this.emit('notificationSent', fullNotification);
        return notificationId;
    }
    // Enviar notificação usando template
    async sendTemplateNotification(templateId, variables, overrides) {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template não encontrado: ${templateId}`);
        }
        const title = this.replaceVariables(template.titleTemplate, variables);
        const message = this.replaceVariables(template.messageTemplate, variables);
        return this.sendNotification({
            type: template.type,
            category: template.category,
            title,
            message,
            channels: template.channels,
            priority: 'medium',
            persistent: true,
            ...overrides
        });
    }
    // Marcar notificação como lida
    markAsRead(notificationId, userId) {
        const notification = this.notifications.get(notificationId);
        if (!notification) {
            return false;
        }
        notification.readAt = Date.now();
        notification.readBy = userId;
        this.emit('notificationRead', notification);
        return true;
    }
    // Obter notificações de um usuário
    getUserNotifications(userId, options = {}) {
        const userNotificationIds = this.userNotifications.get(userId);
        if (!userNotificationIds) {
            return [];
        }
        let notifications = Array.from(userNotificationIds)
            .map(id => this.notifications.get(id))
            .filter((n) => n !== undefined);
        // Filtrar por não lidas
        if (options.unreadOnly) {
            notifications = notifications.filter(n => !n.readAt);
        }
        // Filtrar por categoria
        if (options.category) {
            notifications = notifications.filter(n => n.category === options.category);
        }
        // Ordenar por timestamp (mais recente primeiro)
        notifications.sort((a, b) => b.timestamp - a.timestamp);
        // Aplicar paginação
        const start = options.offset || 0;
        const end = options.limit ? start + options.limit : undefined;
        return notifications.slice(start, end);
    }
    // Registrar conexão WebSocket
    registerWebSocketConnection(connection) {
        const fullConnection = {
            ...connection,
            connectedAt: Date.now(),
            lastActivity: Date.now()
        };
        this.connections.set(connection.id, fullConnection);
        logger_1.logger.info('WebSocket connection registered', {
            connectionId: connection.id,
            userId: connection.userId,
            userRole: connection.userRole
        });
        this.emit('connectionRegistered', fullConnection);
    }
    // Remover conexão WebSocket
    unregisterWebSocketConnection(connectionId) {
        const connection = this.connections.get(connectionId);
        if (connection) {
            this.connections.delete(connectionId);
            logger_1.logger.info('WebSocket connection unregistered', {
                connectionId,
                userId: connection.userId,
                duration: Date.now() - connection.connectedAt
            });
            this.emit('connectionUnregistered', connection);
        }
    }
    // Atualizar atividade da conexão
    updateConnectionActivity(connectionId) {
        const connection = this.connections.get(connectionId);
        if (connection) {
            connection.lastActivity = Date.now();
        }
    }
    // Subscrever a categoria de notificações
    subscribeToCategory(connectionId, category) {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            return false;
        }
        if (!connection.subscriptions.includes(category)) {
            connection.subscriptions.push(category);
        }
        return true;
    }
    // Desinscrever de categoria
    unsubscribeFromCategory(connectionId, category) {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            return false;
        }
        connection.subscriptions = connection.subscriptions.filter(s => s !== category);
        return true;
    }
    // Obter estatísticas de notificações
    getStatistics() {
        const notifications = Array.from(this.notifications.values());
        const notificationsByType = notifications.reduce((acc, n) => {
            acc[n.type] = (acc[n.type] || 0) + 1;
            return acc;
        }, {});
        const notificationsByCategory = notifications.reduce((acc, n) => {
            acc[n.category] = (acc[n.category] || 0) + 1;
            return acc;
        }, {});
        return {
            totalNotifications: notifications.length,
            unreadNotifications: notifications.filter(n => !n.readAt).length,
            activeConnections: this.connections.size,
            notificationsByType,
            notificationsByCategory
        };
    }
    // Criar template de notificação
    createTemplate(template) {
        this.templates.set(template.id, template);
        logger_1.logger.info('Notification template created', {
            id: template.id,
            name: template.name,
            category: template.category
        });
    }
    // Obter templates
    getTemplates() {
        return Array.from(this.templates.values());
    }
    // Métodos privados
    async processNotificationChannels(notification) {
        const promises = notification.channels
            .filter(channel => channel.enabled)
            .map(channel => this.sendToChannel(notification, channel));
        await Promise.allSettled(promises);
    }
    async sendToChannel(notification, channel) {
        try {
            switch (channel.type) {
                case 'websocket':
                    await this.sendWebSocketNotification(notification);
                    break;
                case 'email':
                    await this.sendEmailNotification(notification, channel.config);
                    break;
                case 'push':
                    await this.sendPushNotification(notification, channel.config);
                    break;
                case 'webhook':
                    await this.sendWebhookNotification(notification, channel.config);
                    break;
                case 'sms':
                    await this.sendSMSNotification(notification, channel.config);
                    break;
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to send notification to channel', {
                notificationId: notification.id,
                channel: channel.type,
                error: error.message
            });
        }
    }
    async sendWebSocketNotification(notification) {
        const targetConnections = Array.from(this.connections.values()).filter(conn => {
            // Filtrar por usuário se especificado
            if (notification.userId && conn.userId !== notification.userId) {
                return false;
            }
            // Filtrar por role se especificado
            if (notification.userRole && conn.userRole !== notification.userRole) {
                return false;
            }
            // Verificar subscrições
            if (!conn.subscriptions.includes(notification.category) &&
                !conn.subscriptions.includes('all')) {
                return false;
            }
            return true;
        });
        const message = {
            type: 'notification',
            data: notification
        };
        targetConnections.forEach(conn => {
            try {
                conn.socket.send(JSON.stringify(message));
                this.updateConnectionActivity(conn.id);
            }
            catch (error) {
                logger_1.logger.error('Failed to send WebSocket notification', {
                    connectionId: conn.id,
                    error: error.message
                });
                // Remover conexão inválida
                this.unregisterWebSocketConnection(conn.id);
            }
        });
        logger_1.logger.debug('WebSocket notification sent', {
            notificationId: notification.id,
            targetConnections: targetConnections.length
        });
    }
    async sendEmailNotification(notification, config) {
        // Placeholder - implementar integração com serviço de email
        logger_1.logger.info('Email notification would be sent', {
            notificationId: notification.id,
            title: notification.title,
            config
        });
    }
    async sendPushNotification(notification, config) {
        // Placeholder - implementar integração com serviço push (FCM, APNs)
        logger_1.logger.info('Push notification would be sent', {
            notificationId: notification.id,
            title: notification.title,
            config
        });
    }
    async sendWebhookNotification(notification, config) {
        // Placeholder - implementar webhook HTTP
        logger_1.logger.info('Webhook notification would be sent', {
            notificationId: notification.id,
            webhookUrl: config?.url,
            title: notification.title
        });
    }
    async sendSMSNotification(notification, config) {
        // Placeholder - implementar integração SMS
        logger_1.logger.info('SMS notification would be sent', {
            notificationId: notification.id,
            title: notification.title,
            config
        });
    }
    async storeInCache(notification) {
        try {
            const key = `notification:${notification.id}`;
            const ttl = notification.expiresAt ?
                Math.max(0, Math.floor((notification.expiresAt - Date.now()) / 1000)) :
                86400; // 24 horas padrão
            await redisClient_1.default.set(key, notification, ttl);
        }
        catch (error) {
            logger_1.logger.error('Failed to store notification in cache', {
                notificationId: notification.id,
                error: error.message
            });
        }
    }
    replaceVariables(template, variables) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return variables[key] !== undefined ? String(variables[key]) : match;
        });
    }
    generateId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    initializeDefaultTemplates() {
        const defaultTemplates = [
            {
                id: 'order-created',
                name: 'Nova Ordem Criada',
                category: 'order',
                type: 'info',
                titleTemplate: 'Nova Ordem #{{orderNumber}}',
                messageTemplate: 'Uma nova ordem foi criada para {{customerName}}. Valor: R$ {{amount}}',
                variables: ['orderNumber', 'customerName', 'amount'],
                channels: [
                    { type: 'websocket', enabled: true },
                    { type: 'email', enabled: false }
                ]
            },
            {
                id: 'payment-received',
                name: 'Pagamento Recebido',
                category: 'payment',
                type: 'success',
                titleTemplate: 'Pagamento Confirmado',
                messageTemplate: 'Pagamento de R$ {{amount}} foi confirmado para a ordem #{{orderNumber}}',
                variables: ['amount', 'orderNumber'],
                channels: [
                    { type: 'websocket', enabled: true },
                    { type: 'email', enabled: true }
                ]
            },
            {
                id: 'system-alert',
                name: 'Alerta do Sistema',
                category: 'system',
                type: 'warning',
                titleTemplate: 'Alerta: {{alertType}}',
                messageTemplate: '{{message}}',
                variables: ['alertType', 'message'],
                channels: [
                    { type: 'websocket', enabled: true },
                    { type: 'email', enabled: true }
                ]
            }
        ];
        defaultTemplates.forEach(template => this.createTemplate(template));
    }
    startCleanupTimer() {
        // Limpar notificações e conexões inativas a cada hora
        setInterval(() => {
            this.cleanupExpiredNotifications();
            this.cleanupInactiveConnections();
        }, 60 * 60 * 1000); // 1 hora
    }
    cleanupExpiredNotifications() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [id, notification] of this.notifications) {
            if (notification.expiresAt && notification.expiresAt < now) {
                this.notifications.delete(id);
                // Remover da indexação por usuário
                if (notification.userId) {
                    this.userNotifications.get(notification.userId)?.delete(id);
                }
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            logger_1.logger.info('Cleaned up expired notifications', { count: cleanedCount });
        }
    }
    cleanupInactiveConnections() {
        const now = Date.now();
        const timeout = 30 * 60 * 1000; // 30 minutos
        let cleanedCount = 0;
        for (const [id, connection] of this.connections) {
            if (now - connection.lastActivity > timeout) {
                this.unregisterWebSocketConnection(id);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            logger_1.logger.info('Cleaned up inactive connections', { count: cleanedCount });
        }
    }
}
exports.default = new NotificationService();
