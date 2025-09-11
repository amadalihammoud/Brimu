"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const logger_1 = require("./logger");
class MetricsAlertsManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.alertRules = new Map();
        this.activeAlerts = new Map();
        this.alertHistory = [];
        this.initializeDefaultRules();
    }
    // Adicionar regra de alerta
    addAlertRule(rule) {
        this.alertRules.set(rule.id, rule);
        logger_1.logger.info('Alert rule added', {
            ruleId: rule.id,
            name: rule.name,
            metric: rule.metric,
            threshold: rule.threshold,
            severity: rule.severity
        });
        this.emit('ruleAdded', rule);
    }
    // Remover regra de alerta
    removeAlertRule(ruleId) {
        const removed = this.alertRules.delete(ruleId);
        if (removed) {
            logger_1.logger.info('Alert rule removed', { ruleId });
            this.emit('ruleRemoved', ruleId);
        }
        return removed;
    }
    // Atualizar regra de alerta
    updateAlertRule(ruleId, updates) {
        const rule = this.alertRules.get(ruleId);
        if (!rule) {
            return false;
        }
        const updatedRule = { ...rule, ...updates };
        this.alertRules.set(ruleId, updatedRule);
        logger_1.logger.info('Alert rule updated', { ruleId, updates });
        this.emit('ruleUpdated', updatedRule);
        return true;
    }
    // Verificar métricas contra todas as regras
    checkMetrics(metrics) {
        const newAlerts = [];
        for (const [ruleId, rule] of this.alertRules) {
            if (!rule.enabled) {
                continue;
            }
            const metricValue = this.getMetricValue(metrics, rule.metric);
            if (metricValue !== null && this.shouldTriggerAlert(rule, metricValue)) {
                const alert = this.createAlert(rule, metricValue);
                newAlerts.push(alert);
                this.activeAlerts.set(alert.id, alert);
                this.alertHistory.push(alert);
                // Manter apenas últimos 1000 alertas no histórico
                if (this.alertHistory.length > 1000) {
                    this.alertHistory = this.alertHistory.slice(-1000);
                }
                // Atualizar timestamp da última ativação
                rule.lastTriggered = Date.now();
                this.handleAlertNotification(alert);
            }
        }
        return newAlerts;
    }
    // Reconhecer alerta
    acknowledgeAlert(alertId, acknowledgedBy) {
        const alert = this.activeAlerts.get(alertId);
        if (!alert) {
            return false;
        }
        alert.acknowledgedBy = acknowledgedBy;
        alert.acknowledgedAt = Date.now();
        logger_1.logger.info('Alert acknowledged', {
            alertId,
            acknowledgedBy,
            metric: alert.metric,
            severity: alert.severity
        });
        this.emit('alertAcknowledged', alert);
        return true;
    }
    // Resolver alerta
    resolveAlert(alertId, resolvedBy) {
        const alert = this.activeAlerts.get(alertId);
        if (!alert) {
            return false;
        }
        alert.resolved = true;
        this.activeAlerts.delete(alertId);
        logger_1.logger.info('Alert resolved', {
            alertId,
            resolvedBy,
            metric: alert.metric,
            duration: Date.now() - alert.timestamp
        });
        this.emit('alertResolved', alert);
        return true;
    }
    // Obter alertas ativos
    getActiveAlerts() {
        return Array.from(this.activeAlerts.values());
    }
    // Obter histórico de alertas
    getAlertHistory(limit) {
        const history = [...this.alertHistory].reverse();
        return limit ? history.slice(0, limit) : history;
    }
    // Obter regras de alerta
    getAlertRules() {
        return Array.from(this.alertRules.values());
    }
    // Obter estatísticas de alertas
    getAlertStatistics() {
        const active = this.getActiveAlerts();
        const history = this.getAlertHistory();
        const bySeverity = active.reduce((acc, alert) => {
            acc[alert.severity] = (acc[alert.severity] || 0) + 1;
            return acc;
        }, {});
        const byMetric = active.reduce((acc, alert) => {
            acc[alert.metric] = (acc[alert.metric] || 0) + 1;
            return acc;
        }, {});
        // Calcular tempo médio de resolução
        const resolvedAlerts = history.filter(a => a.resolved);
        const avgResolutionTime = resolvedAlerts.length > 0
            ? resolvedAlerts.reduce((sum, alert) => {
                const duration = (alert.acknowledgedAt || Date.now()) - alert.timestamp;
                return sum + duration;
            }, 0) / resolvedAlerts.length
            : 0;
        return {
            totalActive: active.length,
            totalHistory: history.length,
            bySeverity,
            byMetric,
            avgResolutionTime
        };
    }
    // Métodos privados
    initializeDefaultRules() {
        const defaultRules = [
            {
                id: 'memory-usage-high',
                name: 'Uso de Memória Alto',
                description: 'Alerta quando uso de memória heap excede 80%',
                metric: 'memory.heapUsedPercent',
                operator: '>',
                threshold: 80,
                severity: 'high',
                cooldown: 5 * 60 * 1000, // 5 minutos
                enabled: true,
                notifications: { email: true, log: true }
            },
            {
                id: 'response-time-slow',
                name: 'Tempo de Resposta Lento',
                description: 'Alerta quando tempo médio de resposta excede 2 segundos',
                metric: 'avgResponseTime',
                operator: '>',
                threshold: 2000,
                severity: 'medium',
                cooldown: 2 * 60 * 1000, // 2 minutos
                enabled: true,
                notifications: { email: true, log: true }
            },
            {
                id: 'error-rate-high',
                name: 'Taxa de Erro Alta',
                description: 'Alerta quando taxa de erro excede 10%',
                metric: 'errorRate',
                operator: '>',
                threshold: 10,
                severity: 'critical',
                cooldown: 1 * 60 * 1000, // 1 minuto
                enabled: true,
                notifications: { email: true, webhook: true, log: true }
            },
            {
                id: 'cache-hit-rate-low',
                name: 'Taxa de Acerto do Cache Baixa',
                description: 'Alerta quando taxa de acerto do cache fica abaixo de 50%',
                metric: 'cacheHitRate',
                operator: '<',
                threshold: 50,
                severity: 'low',
                cooldown: 10 * 60 * 1000, // 10 minutos
                enabled: true,
                notifications: { log: true }
            }
        ];
        defaultRules.forEach(rule => this.addAlertRule(rule));
    }
    shouldTriggerAlert(rule, value) {
        // Verificar cooldown
        if (rule.lastTriggered && (Date.now() - rule.lastTriggered) < rule.cooldown) {
            return false;
        }
        // Verificar condição
        switch (rule.operator) {
            case '>':
                return value > rule.threshold;
            case '<':
                return value < rule.threshold;
            case '>=':
                return value >= rule.threshold;
            case '<=':
                return value <= rule.threshold;
            case '==':
                return value === rule.threshold;
            default:
                return false;
        }
    }
    createAlert(rule, currentValue) {
        const alertId = `${rule.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return {
            id: alertId,
            title: rule.name,
            message: `${rule.description}. Valor atual: ${currentValue}, Limite: ${rule.threshold}`,
            severity: rule.severity,
            metric: rule.metric,
            currentValue,
            threshold: rule.threshold,
            timestamp: Date.now()
        };
    }
    handleAlertNotification(alert) {
        // Log do alerta
        const logLevel = alert.severity === 'critical' ? 'error' :
            alert.severity === 'high' ? 'warn' : 'info';
        logger_1.logger[logLevel]('Metric alert triggered', {
            alertId: alert.id,
            title: alert.title,
            metric: alert.metric,
            currentValue: alert.currentValue,
            threshold: alert.threshold,
            severity: alert.severity
        });
        // Emitir evento para outros sistemas
        this.emit('alert', alert);
        // Aqui você pode adicionar outras notificações:
        // - Envio de email
        // - Webhook para Slack/Discord
        // - Push notification
        // - SMS, etc.
    }
    getMetricValue(metrics, path) {
        const keys = path.split('.');
        let value = metrics;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            }
            else {
                return null;
            }
        }
        return typeof value === 'number' ? value : null;
    }
}
exports.default = new MetricsAlertsManager();
