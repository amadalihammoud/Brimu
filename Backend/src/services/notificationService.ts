import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import cache from '../cache/redisClient';

/**
 * Serviço de Notificações em Tempo Real
 * Sistema centralizado para envio de notificações push, email, SMS, etc.
 */

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  category: 'order' | 'payment' | 'system' | 'security' | 'metric' | 'general';
  title: string;
  message: string;
  userId?: string;
  userRole?: string;
  data?: Record<string, any>;
  timestamp: number;
  channels: NotificationChannel[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  persistent: boolean;
  expiresAt?: number;
  readAt?: number;
  readBy?: string;
}

export interface NotificationChannel {
  type: 'websocket' | 'email' | 'sms' | 'push' | 'webhook';
  config?: Record<string, any>;
  enabled: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  category: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  titleTemplate: string;
  messageTemplate: string;
  channels: NotificationChannel[];
  variables: string[];
}

export interface WebSocketConnection {
  id: string;
  userId?: string;
  userRole?: string;
  socket: any;
  connectedAt: number;
  lastActivity: number;
  subscriptions: string[];
}

class NotificationService extends EventEmitter {
  private notifications: Map<string, Notification> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private connections: Map<string, WebSocketConnection> = new Map();
  private userNotifications: Map<string, Set<string>> = new Map();

  constructor() {
    super();
    this.initializeDefaultTemplates();
    this.startCleanupTimer();
  }

  // Enviar notificação
  async sendNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<string> {
    const notificationId = this.generateId();
    const fullNotification: Notification = {
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
      this.userNotifications.get(notification.userId)!.add(notificationId);
    }

    // Processar canais de notificação
    await this.processNotificationChannels(fullNotification);

    // Armazenar no cache para persistência
    await this.storeInCache(fullNotification);

    logger.info('Notification sent', {
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
  async sendTemplateNotification(
    templateId: string, 
    variables: Record<string, any>,
    overrides?: Partial<Notification>
  ): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template não encontrado: ${templateId}`);
    }

    const title = this.replaceVariables(template.titleTemplate, variables);
    const message = this.replaceVariables(template.messageTemplate, variables);

    return this.sendNotification({
      type: template.type,
      category: template.category as any,
      title,
      message,
      channels: template.channels,
      priority: 'medium',
      persistent: true,
      ...overrides
    });
  }

  // Marcar notificação como lida
  markAsRead(notificationId: string, userId: string): boolean {
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
  getUserNotifications(
    userId: string, 
    options: {
      unreadOnly?: boolean;
      category?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Notification[] {
    const userNotificationIds = this.userNotifications.get(userId);
    if (!userNotificationIds) {
      return [];
    }

    let notifications = Array.from(userNotificationIds)
      .map(id => this.notifications.get(id))
      .filter((n): n is Notification => n !== undefined);

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
  registerWebSocketConnection(connection: Omit<WebSocketConnection, 'connectedAt' | 'lastActivity'>): void {
    const fullConnection: WebSocketConnection = {
      ...connection,
      connectedAt: Date.now(),
      lastActivity: Date.now()
    };

    this.connections.set(connection.id, fullConnection);

    logger.info('WebSocket connection registered', {
      connectionId: connection.id,
      userId: connection.userId,
      userRole: connection.userRole
    });

    this.emit('connectionRegistered', fullConnection);
  }

  // Remover conexão WebSocket
  unregisterWebSocketConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      this.connections.delete(connectionId);
      
      logger.info('WebSocket connection unregistered', {
        connectionId,
        userId: connection.userId,
        duration: Date.now() - connection.connectedAt
      });

      this.emit('connectionUnregistered', connection);
    }
  }

  // Atualizar atividade da conexão
  updateConnectionActivity(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastActivity = Date.now();
    }
  }

  // Subscrever a categoria de notificações
  subscribeToCategory(connectionId: string, category: string): boolean {
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
  unsubscribeFromCategory(connectionId: string, category: string): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    connection.subscriptions = connection.subscriptions.filter(s => s !== category);
    return true;
  }

  // Obter estatísticas de notificações
  getStatistics(): {
    totalNotifications: number;
    unreadNotifications: number;
    activeConnections: number;
    notificationsByType: Record<string, number>;
    notificationsByCategory: Record<string, number>;
  } {
    const notifications = Array.from(this.notifications.values());
    
    const notificationsByType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const notificationsByCategory = notifications.reduce((acc, n) => {
      acc[n.category] = (acc[n.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalNotifications: notifications.length,
      unreadNotifications: notifications.filter(n => !n.readAt).length,
      activeConnections: this.connections.size,
      notificationsByType,
      notificationsByCategory
    };
  }

  // Criar template de notificação
  createTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
    
    logger.info('Notification template created', {
      id: template.id,
      name: template.name,
      category: template.category
    });
  }

  // Obter templates
  getTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  // Métodos privados
  private async processNotificationChannels(notification: Notification): Promise<void> {
    const promises = notification.channels
      .filter(channel => channel.enabled)
      .map(channel => this.sendToChannel(notification, channel));

    await Promise.allSettled(promises);
  }

  private async sendToChannel(notification: Notification, channel: NotificationChannel): Promise<void> {
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
    } catch (error) {
      logger.error('Failed to send notification to channel', {
        notificationId: notification.id,
        channel: channel.type,
        error: error.message
      });
    }
  }

  private async sendWebSocketNotification(notification: Notification): Promise<void> {
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
      } catch (error) {
        logger.error('Failed to send WebSocket notification', {
          connectionId: conn.id,
          error: error.message
        });
        
        // Remover conexão inválida
        this.unregisterWebSocketConnection(conn.id);
      }
    });

    logger.debug('WebSocket notification sent', {
      notificationId: notification.id,
      targetConnections: targetConnections.length
    });
  }

  private async sendEmailNotification(notification: Notification, config?: Record<string, any>): Promise<void> {
    // Placeholder - implementar integração com serviço de email
    logger.info('Email notification would be sent', {
      notificationId: notification.id,
      title: notification.title,
      config
    });
  }

  private async sendPushNotification(notification: Notification, config?: Record<string, any>): Promise<void> {
    // Placeholder - implementar integração com serviço push (FCM, APNs)
    logger.info('Push notification would be sent', {
      notificationId: notification.id,
      title: notification.title,
      config
    });
  }

  private async sendWebhookNotification(notification: Notification, config?: Record<string, any>): Promise<void> {
    // Placeholder - implementar webhook HTTP
    logger.info('Webhook notification would be sent', {
      notificationId: notification.id,
      webhookUrl: config?.url,
      title: notification.title
    });
  }

  private async sendSMSNotification(notification: Notification, config?: Record<string, any>): Promise<void> {
    // Placeholder - implementar integração SMS
    logger.info('SMS notification would be sent', {
      notificationId: notification.id,
      title: notification.title,
      config
    });
  }

  private async storeInCache(notification: Notification): Promise<void> {
    try {
      const key = `notification:${notification.id}`;
      const ttl = notification.expiresAt ? 
        Math.max(0, Math.floor((notification.expiresAt - Date.now()) / 1000)) : 
        86400; // 24 horas padrão
        
      await cache.set(key, notification, ttl);
    } catch (error) {
      logger.error('Failed to store notification in cache', {
        notificationId: notification.id,
        error: error.message
      });
    }
  }

  private replaceVariables(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeDefaultTemplates(): void {
    const defaultTemplates: NotificationTemplate[] = [
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

  private startCleanupTimer(): void {
    // Limpar notificações e conexões inativas a cada hora
    setInterval(() => {
      this.cleanupExpiredNotifications();
      this.cleanupInactiveConnections();
    }, 60 * 60 * 1000); // 1 hora
  }

  private cleanupExpiredNotifications(): void {
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
      logger.info('Cleaned up expired notifications', { count: cleanedCount });
    }
  }

  private cleanupInactiveConnections(): void {
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
      logger.info('Cleaned up inactive connections', { count: cleanedCount });
    }
  }
}

export default new NotificationService();