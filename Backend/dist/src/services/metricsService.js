"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const logger_1 = require("../utils/logger");
const redisClient_1 = __importDefault(require("../cache/redisClient"));
const metricsAlerts_1 = __importDefault(require("../utils/metricsAlerts"));
const notificationService_1 = __importDefault(require("./notificationService"));
class MetricsService extends events_1.EventEmitter {
    constructor() {
        super();
        this.metrics = [];
        this.systemMetrics = [];
        this.alertThresholds = [];
        this.startTime = Date.now();
        this.requestCount = 0;
        this.errorCount = 0;
        this.responseTimeSum = 0;
        this.cacheHits = 0;
        this.cacheMisses = 0;
        this.initializeDefaultThresholds();
        this.startSystemMonitoring();
        this.setupAlertNotifications();
    }
    // Registrar métrica de performance
    recordMetric(metric) {
        const performanceMetric = {
            ...metric,
            timestamp: Date.now(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage()
        };
        this.metrics.push(performanceMetric);
        this.updateCounters(performanceMetric);
        // Manter apenas últimos 1000 registros em memória
        if (this.metrics.length > 1000) {
            this.metrics = this.metrics.slice(-1000);
        }
        // Armazenar no cache para persistência
        this.storeMetricInCache(performanceMetric);
        logger_1.logger.debug('Performance metric recorded', {
            endpoint: metric.endpoint,
            method: metric.method,
            duration: metric.duration,
            statusCode: metric.statusCode
        });
    }
    // Atualizar contadores
    updateCounters(metric) {
        this.requestCount++;
        this.responseTimeSum += metric.duration;
        if (metric.statusCode >= 400) {
            this.errorCount++;
        }
    }
    // Registrar hit/miss de cache
    recordCacheHit() {
        this.cacheHits++;
    }
    recordCacheMiss() {
        this.cacheMisses++;
    }
    // Obter métricas de sistema em tempo real
    getSystemMetrics() {
        const now = Date.now();
        const uptime = now - this.startTime;
        const totalCache = this.cacheHits + this.cacheMisses;
        const memory = process.memoryUsage();
        const systemMetrics = {
            timestamp: now,
            uptime,
            memory,
            cpu: process.cpuUsage(),
            activeConnections: this.getActiveConnections(),
            cacheHitRate: totalCache > 0 ? (this.cacheHits / totalCache) * 100 : 0,
            avgResponseTime: this.requestCount > 0 ? this.responseTimeSum / this.requestCount : 0,
            errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
            requestsPerMinute: this.calculateRequestsPerMinute()
        };
        // Verificar alertas baseados nas métricas atuais
        const metricsForAlert = {
            timestamp: systemMetrics.timestamp,
            uptime: systemMetrics.uptime,
            'memory.heapUsed': systemMetrics.memory.heapUsed,
            'memory.heapTotal': systemMetrics.memory.heapTotal,
            'memory.external': systemMetrics.memory.external,
            'memory.heapUsedPercent': (memory.heapUsed / memory.heapTotal) * 100,
            'cpu.user': systemMetrics.cpu.user,
            'cpu.system': systemMetrics.cpu.system,
            activeConnections: systemMetrics.activeConnections,
            cacheHitRate: systemMetrics.cacheHitRate,
            avgResponseTime: systemMetrics.avgResponseTime,
            errorRate: systemMetrics.errorRate,
            requestsPerMinute: systemMetrics.requestsPerMinute
        };
        metricsAlerts_1.default.checkMetrics(metricsForAlert);
        return systemMetrics;
    }
    // Obter métricas agregadas por período
    getAggregatedMetrics(period = '1h') {
        const now = Date.now();
        let startTime;
        switch (period) {
            case '1h':
                startTime = now - (60 * 60 * 1000);
                break;
            case '24h':
                startTime = now - (24 * 60 * 60 * 1000);
                break;
            case '7d':
                startTime = now - (7 * 24 * 60 * 60 * 1000);
                break;
        }
        const periodMetrics = this.metrics.filter(m => m.timestamp >= startTime);
        if (periodMetrics.length === 0) {
            return {
                period,
                totalRequests: 0,
                averageResponseTime: 0,
                errorRate: 0,
                topEndpoints: [],
                statusCodeDistribution: {},
                memoryTrend: []
            };
        }
        // Calcular estatísticas
        const totalRequests = periodMetrics.length;
        const avgResponseTime = periodMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests;
        const errorCount = periodMetrics.filter(m => m.statusCode >= 400).length;
        const errorRate = (errorCount / totalRequests) * 100;
        // Top endpoints
        const endpointCounts = periodMetrics.reduce((acc, m) => {
            const key = `${m.method} ${m.endpoint}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        const topEndpoints = Object.entries(endpointCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([endpoint, count]) => ({ endpoint, count }));
        // Distribuição de status codes
        const statusCodeDistribution = periodMetrics.reduce((acc, m) => {
            acc[m.statusCode] = (acc[m.statusCode] || 0) + 1;
            return acc;
        }, {});
        // Trend de memória
        const memoryTrend = periodMetrics
            .filter((_, index) => index % Math.max(1, Math.floor(periodMetrics.length / 20)) === 0)
            .map(m => ({
            timestamp: m.timestamp,
            heapUsed: m.memoryUsage.heapUsed,
            heapTotal: m.memoryUsage.heapTotal,
            external: m.memoryUsage.external
        }));
        return {
            period,
            totalRequests,
            averageResponseTime: Math.round(avgResponseTime),
            errorRate: Math.round(errorRate * 100) / 100,
            topEndpoints,
            statusCodeDistribution,
            memoryTrend
        };
    }
    // Obter alertas ativos
    getActiveAlerts() {
        const currentMetrics = this.getSystemMetrics();
        const alerts = [];
        for (const threshold of this.alertThresholds) {
            const value = this.getMetricValue(currentMetrics, threshold.metric);
            if (this.evaluateThreshold(value, threshold)) {
                alerts.push({
                    id: `${threshold.metric}_${Date.now()}`,
                    metric: threshold.metric,
                    currentValue: value,
                    threshold: threshold.value,
                    severity: threshold.severity,
                    message: threshold.message,
                    timestamp: Date.now()
                });
            }
        }
        return alerts;
    }
    // Adicionar threshold de alerta
    addAlertThreshold(threshold) {
        this.alertThresholds.push(threshold);
        logger_1.logger.info('Alert threshold added', threshold);
    }
    // Remover threshold de alerta
    removeAlertThreshold(metric) {
        this.alertThresholds = this.alertThresholds.filter(t => t.metric !== metric);
        logger_1.logger.info('Alert threshold removed', { metric });
    }
    // Exportar métricas para análise externa
    exportMetrics() {
        return {
            performance: this.metrics,
            system: this.systemMetrics,
            aggregated: {
                last1h: this.getAggregatedMetrics('1h'),
                last24h: this.getAggregatedMetrics('24h'),
                last7d: this.getAggregatedMetrics('7d')
            }
        };
    }
    // Métodos privados
    initializeDefaultThresholds() {
        this.alertThresholds = [
            {
                metric: 'memory.heapUsed',
                operator: '>',
                value: 512 * 1024 * 1024, // 512MB
                severity: 'medium',
                message: 'Uso de memória heap acima de 512MB'
            },
            {
                metric: 'avgResponseTime',
                operator: '>',
                value: 1000, // 1 segundo
                severity: 'medium',
                message: 'Tempo médio de resposta acima de 1 segundo'
            },
            {
                metric: 'errorRate',
                operator: '>',
                value: 5, // 5%
                severity: 'high',
                message: 'Taxa de erro acima de 5%'
            },
            {
                metric: 'cacheHitRate',
                operator: '<',
                value: 70, // 70%
                severity: 'low',
                message: 'Taxa de acerto do cache abaixo de 70%'
            }
        ];
    }
    startSystemMonitoring() {
        // Coleta métricas de sistema a cada minuto
        setInterval(() => {
            const systemMetric = this.getSystemMetrics();
            this.systemMetrics.push(systemMetric);
            // Manter apenas últimas 24h de métricas
            const cutoff = Date.now() - (24 * 60 * 60 * 1000);
            this.systemMetrics = this.systemMetrics.filter(m => m.timestamp > cutoff);
            // Verificar alertas
            const alerts = this.getActiveAlerts();
            if (alerts.length > 0) {
                this.emit('alerts', alerts);
                for (const alert of alerts) {
                    logger_1.logger.warn('Metric alert triggered', alert);
                }
            }
        }, 60000); // 1 minuto
    }
    async storeMetricInCache(metric) {
        try {
            const key = `metric:${Date.now()}`;
            await redisClient_1.default.set(key, metric, 86400); // 24 horas
        }
        catch (error) {
            logger_1.logger.error('Failed to store metric in cache', { error: error.message });
        }
    }
    getActiveConnections() {
        // Placeholder - em produção seria obtido do servidor HTTP
        return Math.floor(Math.random() * 100);
    }
    calculateRequestsPerMinute() {
        const oneMinuteAgo = Date.now() - 60000;
        const recentRequests = this.metrics.filter(m => m.timestamp > oneMinuteAgo);
        return recentRequests.length;
    }
    getMetricValue(systemMetrics, metricPath) {
        const keys = metricPath.split('.');
        let value = systemMetrics;
        for (const key of keys) {
            value = value?.[key];
        }
        return typeof value === 'number' ? value : 0;
    }
    evaluateThreshold(value, threshold) {
        switch (threshold.operator) {
            case '>':
                return value > threshold.value;
            case '<':
                return value < threshold.value;
            case '>=':
                return value >= threshold.value;
            case '<=':
                return value <= threshold.value;
            case '==':
                return value === threshold.value;
            default:
                return false;
        }
    }
    setupAlertNotifications() {
        // Escutar eventos de alertas do sistema de métricas
        metricsAlerts_1.default.on('alert', async (alert) => {
            try {
                // Determinar o tipo de notificação baseado na severidade
                let notificationType;
                switch (alert.severity) {
                    case 'critical':
                        notificationType = 'error';
                        break;
                    case 'high':
                        notificationType = 'error';
                        break;
                    case 'medium':
                        notificationType = 'warning';
                        break;
                    default:
                        notificationType = 'info';
                }
                // Enviar notificação usando template
                await notificationService_1.default.sendTemplateNotification('system-alert', {
                    alertType: alert.metric,
                    message: alert.message
                }, {
                    type: notificationType,
                    category: 'system',
                    userRole: 'admin', // Apenas admins recebem alertas de sistema
                    priority: alert.severity === 'critical' ? 'urgent' :
                        alert.severity === 'high' ? 'high' : 'medium',
                    channels: [
                        { type: 'websocket', enabled: true },
                        { type: 'email', enabled: alert.severity === 'critical' }
                    ]
                });
                logger_1.logger.info('Metric alert notification sent', {
                    alertId: alert.id,
                    metric: alert.metric,
                    severity: alert.severity,
                    currentValue: alert.currentValue
                });
            }
            catch (error) {
                logger_1.logger.error('Failed to send metric alert notification', {
                    alertId: alert.id,
                    error: error.message
                });
            }
        });
    }
}
exports.default = new MetricsService();
