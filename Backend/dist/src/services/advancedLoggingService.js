"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const events_1 = require("events");
const notificationService_1 = __importDefault(require("./notificationService"));
const logsPatterns_1 = require("../config/logsPatterns");
class AdvancedLoggingService extends events_1.EventEmitter {
    constructor() {
        super();
        this.logBuffer = [];
        this.logPatterns = new Map();
        this.logCounts = new Map();
        this.maxBufferSize = 10000;
        this.flushInterval = 5000; // 5 segundos
        this.setupWinston();
        this.initializePatterns();
        this.startPeriodicFlush();
        this.setupErrorHandling();
    }
    // Log principal com contexto rico
    log(level, message, context, metadata) {
        const logEntry = {
            id: this.generateLogId(),
            timestamp: Date.now(),
            level,
            message,
            context,
            metadata,
            fingerprint: this.generateFingerprint(message, context),
            tags: this.extractTags(message, context),
            environment: process.env.NODE_ENV || 'development',
            service: 'brimu-backend',
            version: require('../../package.json').version
        };
        // Adicionar stack trace para erros
        if (level === 'error' && metadata?.error) {
            logEntry.stack = metadata.error.stack;
        }
        // Adicionar ao buffer
        this.addToBuffer(logEntry);
        // Log através do winston também
        this.winston.log(level, message, {
            logId: logEntry.id,
            context: logEntry.context,
            metadata: logEntry.metadata,
            fingerprint: logEntry.fingerprint,
            tags: logEntry.tags
        });
        // Verificar padrões e alertas
        this.checkPatterns(logEntry);
        // Emitir evento para outros sistemas
        this.emit('log', logEntry);
        return logEntry;
    }
    // Métodos de conveniência
    error(message, context, error) {
        return this.log('error', message, context, { error });
    }
    warn(message, context, metadata) {
        return this.log('warn', message, context, metadata);
    }
    info(message, context, metadata) {
        return this.log('info', message, context, metadata);
    }
    http(message, context, metadata) {
        return this.log('http', message, context, metadata);
    }
    debug(message, context, metadata) {
        return this.log('debug', message, context, metadata);
    }
    // Log de ações específicas do sistema
    logUserAction(userId, action, details, context) {
        return this.info(`User action: ${action}`, {
            ...context,
            userId,
            module: 'user-actions'
        }, {
            action,
            details,
            category: 'user-activity'
        });
    }
    logSecurityEvent(event, severity, context, details) {
        const level = severity === 'critical' ? 'error' : severity === 'high' ? 'warn' : 'info';
        return this.log(level, `Security event: ${event}`, {
            ...context,
            module: 'security'
        }, {
            event,
            severity,
            details,
            category: 'security'
        });
    }
    logPerformanceEvent(operation, duration, context, metadata) {
        const level = duration > 5000 ? 'warn' : duration > 1000 ? 'info' : 'debug';
        return this.log(level, `Performance: ${operation} took ${duration}ms`, {
            ...context,
            duration,
            module: 'performance'
        }, {
            operation,
            duration,
            metadata,
            category: 'performance'
        });
    }
    logSystemEvent(event, status, context, details) {
        const level = status === 'failed' ? 'error' : 'info';
        return this.log(level, `System event: ${event} ${status}`, {
            ...context,
            module: 'system'
        }, {
            event,
            status,
            details,
            category: 'system'
        });
    }
    // Buscar logs com filtros avançados
    searchLogs(filters) {
        let logs = [...this.logBuffer];
        // Filtrar por nível
        if (filters.level && filters.level.length > 0) {
            logs = logs.filter(log => filters.level.includes(log.level));
        }
        // Filtrar por range de tempo
        if (filters.timeRange) {
            logs = logs.filter(log => log.timestamp >= filters.timeRange.start &&
                log.timestamp <= filters.timeRange.end);
        }
        // Filtrar por usuário
        if (filters.userId) {
            logs = logs.filter(log => log.context?.userId === filters.userId);
        }
        // Filtrar por correlation ID
        if (filters.correlationId) {
            logs = logs.filter(log => log.context?.correlationId === filters.correlationId);
        }
        // Busca por texto
        if (filters.text) {
            const searchText = filters.text.toLowerCase();
            logs = logs.filter(log => log.message.toLowerCase().includes(searchText) ||
                JSON.stringify(log.metadata || {}).toLowerCase().includes(searchText));
        }
        // Filtrar por tags
        if (filters.tags && filters.tags.length > 0) {
            logs = logs.filter(log => log.tags && filters.tags.some(tag => log.tags.includes(tag)));
        }
        // Ordenar por timestamp (mais recente primeiro)
        logs.sort((a, b) => b.timestamp - a.timestamp);
        // Aplicar paginação
        const offset = filters.offset || 0;
        const limit = filters.limit || 100;
        return logs.slice(offset, offset + limit);
    }
    // Análise de logs
    getAnalytics(timeRange) {
        let logs = this.logBuffer;
        if (timeRange) {
            logs = logs.filter(log => log.timestamp >= timeRange.start && log.timestamp <= timeRange.end);
        }
        // Contagem por nível
        const logsByLevel = logs.reduce((acc, log) => {
            acc[log.level] = (acc[log.level] || 0) + 1;
            return acc;
        }, {});
        // Logs por hora
        const logsByHour = this.groupLogsByHour(logs);
        // Top erros por fingerprint
        const errorCounts = logs
            .filter(log => log.level === 'error')
            .reduce((acc, log) => {
            const key = log.fingerprint || 'unknown';
            if (!acc[key]) {
                acc[key] = { count: 0, message: log.message, lastSeen: log.timestamp };
            }
            acc[key].count++;
            acc[key].lastSeen = Math.max(acc[key].lastSeen, log.timestamp);
            return acc;
        }, {});
        const topErrors = Object.entries(errorCounts)
            .map(([fingerprint, data]) => ({ fingerprint, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        // Top usuários
        const userCounts = logs
            .filter(log => log.context?.userId)
            .reduce((acc, log) => {
            const userId = log.context.userId;
            acc[userId] = (acc[userId] || 0) + 1;
            return acc;
        }, {});
        const topUsers = Object.entries(userCounts)
            .map(([userId, count]) => ({ userId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        // Top endpoints
        const endpointStats = logs
            .filter(log => log.context?.url && log.context?.duration)
            .reduce((acc, log) => {
            const url = log.context.url;
            if (!acc[url]) {
                acc[url] = { count: 0, totalDuration: 0 };
            }
            acc[url].count++;
            acc[url].totalDuration += log.context.duration;
            return acc;
        }, {});
        const topEndpoints = Object.entries(endpointStats)
            .map(([endpoint, stats]) => ({
            endpoint,
            count: stats.count,
            avgDuration: Math.round(stats.totalDuration / stats.count)
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        // Taxa de erro
        const totalLogs = logs.length;
        const errorLogs = logs.filter(log => log.level === 'error').length;
        const errorRate = totalLogs > 0 ? (errorLogs / totalLogs) * 100 : 0;
        // Tendências (comparar com período anterior)
        const trends = this.calculateTrends(logs, timeRange);
        return {
            totalLogs,
            logsByLevel,
            logsByHour,
            topErrors,
            topUsers,
            topEndpoints,
            errorRate,
            trends
        };
    }
    // Adicionar padrão de log para monitoramento
    addPattern(pattern) {
        this.logPatterns.set(pattern.id, pattern);
        this.emit('patternAdded', pattern);
    }
    // Remover padrão
    removePattern(patternId) {
        const removed = this.logPatterns.delete(patternId);
        if (removed) {
            this.emit('patternRemoved', patternId);
        }
        return removed;
    }
    // Obter todos os padrões
    getPatterns() {
        return Array.from(this.logPatterns.values());
    }
    // Exportar logs para análise externa
    exportLogs(format, filters) {
        const logs = filters ? this.searchLogs(filters) : this.logBuffer;
        switch (format) {
            case 'json':
                return JSON.stringify(logs, null, 2);
            case 'csv':
                return this.convertToCsv(logs);
            case 'elasticsearch':
                return logs.map(log => JSON.stringify(log)).join('\n');
            default:
                return JSON.stringify(logs, null, 2);
        }
    }
    // Limpar logs antigos
    cleanup(olderThan) {
        const initialCount = this.logBuffer.length;
        this.logBuffer = this.logBuffer.filter(log => log.timestamp > olderThan);
        const removedCount = initialCount - this.logBuffer.length;
        if (removedCount > 0) {
            this.info('Log cleanup completed', undefined, {
                removedCount,
                remainingCount: this.logBuffer.length,
                category: 'maintenance'
            });
        }
        return removedCount;
    }
    // Métodos privados
    setupWinston() {
        // Usar logger base já configurado
        this.winston = winston_1.default.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
            transports: [
                new winston_1.default.transports.Console({
                    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
                }),
                new winston_1.default.transports.File({
                    filename: path_1.default.join('logs', 'advanced.log'),
                    maxsize: 10485760, // 10MB
                    maxFiles: 5,
                    tailable: true
                }),
                new winston_1.default.transports.File({
                    filename: path_1.default.join('logs', 'errors-advanced.log'),
                    level: 'error',
                    maxsize: 5242880, // 5MB
                    maxFiles: 3
                })
            ]
        });
    }
    initializePatterns() {
        // Carregar padrões predefinidos de monitoramento
        logsPatterns_1.defaultLogPatterns.forEach(pattern => this.addPattern(pattern));
    }
    generateLogId() {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateFingerprint(message, context) {
        // Criar fingerprint para agrupar logs similares
        const key = message
            .replace(/\d+/g, 'N') // Substituir números
            .replace(/[0-9a-f-]{36}/g, 'UUID') // Substituir UUIDs
            .replace(/\w+@\w+\.\w+/g, 'EMAIL') // Substituir emails
            .toLowerCase();
        const contextKey = context?.module || context?.component || 'general';
        return `${contextKey}:${key}`.substring(0, 100);
    }
    extractTags(message, context) {
        const tags = [];
        // Tags do contexto
        if (context?.module)
            tags.push(`module:${context.module}`);
        if (context?.component)
            tags.push(`component:${context.component}`);
        if (context?.userId)
            tags.push('user-action');
        if (context?.requestId)
            tags.push('request');
        // Tags da mensagem
        if (message.toLowerCase().includes('error'))
            tags.push('error');
        if (message.toLowerCase().includes('slow'))
            tags.push('performance');
        if (message.toLowerCase().includes('security'))
            tags.push('security');
        if (message.toLowerCase().includes('backup'))
            tags.push('backup');
        if (message.toLowerCase().includes('cache'))
            tags.push('cache');
        return [...new Set(tags)]; // Remover duplicatas
    }
    addToBuffer(logEntry) {
        this.logBuffer.push(logEntry);
        // Manter tamanho do buffer
        if (this.logBuffer.length > this.maxBufferSize) {
            this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
        }
    }
    checkPatterns(logEntry) {
        for (const [patternId, pattern] of this.logPatterns) {
            if (this.matchesPattern(logEntry, pattern)) {
                this.handlePatternMatch(logEntry, pattern);
            }
        }
    }
    matchesPattern(logEntry, pattern) {
        // Verificar nível
        if (logEntry.level !== pattern.level && pattern.level !== 'all') {
            return false;
        }
        // Verificar padrão
        if (pattern.pattern instanceof RegExp) {
            return pattern.pattern.test(logEntry.message);
        }
        else {
            return logEntry.message.toLowerCase().includes(pattern.pattern.toLowerCase());
        }
    }
    async handlePatternMatch(logEntry, pattern) {
        const now = Date.now();
        const countKey = `pattern:${pattern.id}`;
        // Atualizar contador
        if (!this.logCounts.has(countKey)) {
            this.logCounts.set(countKey, { count: 0, firstSeen: now, lastSeen: now });
        }
        const count = this.logCounts.get(countKey);
        count.count++;
        count.lastSeen = now;
        // Verificar threshold
        if (pattern.threshold && pattern.timeWindow) {
            const windowStart = now - (pattern.timeWindow * 60 * 1000);
            if (count.firstSeen >= windowStart && count.count >= pattern.threshold) {
                await this.triggerPatternAlert(logEntry, pattern, count.count);
                // Reset contador
                this.logCounts.set(countKey, { count: 0, firstSeen: now, lastSeen: now });
            }
        }
        this.emit('patternMatch', { logEntry, pattern, count: count.count });
    }
    async triggerPatternAlert(logEntry, pattern, count) {
        if (pattern.action !== 'alert')
            return;
        // Evitar spam de alertas
        if (pattern.lastTriggered && (Date.now() - pattern.lastTriggered) < 60000) {
            return;
        }
        pattern.lastTriggered = Date.now();
        try {
            await notificationService_1.default.sendNotification({
                type: 'warning',
                category: 'system',
                title: `Log Pattern Alert: ${pattern.name}`,
                message: `Pattern "${pattern.name}" triggered ${count} times. Last message: ${logEntry.message}`,
                userRole: 'admin',
                priority: 'high',
                channels: [
                    { type: 'websocket', enabled: true },
                    { type: 'email', enabled: true }
                ],
                persistent: true,
                data: {
                    patternId: pattern.id,
                    logId: logEntry.id,
                    count,
                    threshold: pattern.threshold
                }
            });
        }
        catch (error) {
            console.error('Failed to send log pattern alert:', error);
        }
    }
    groupLogsByHour(logs) {
        const hourCounts = logs.reduce((acc, log) => {
            const hour = new Date(log.timestamp).toISOString().substring(0, 13) + ':00:00.000Z';
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(hourCounts)
            .map(([hour, count]) => ({ hour, count }))
            .sort((a, b) => a.hour.localeCompare(b.hour));
    }
    calculateTrends(logs, timeRange) {
        // Placeholder para cálculos de tendência mais complexos
        const errorLogs = logs.filter(log => log.level === 'error');
        const recentErrors = errorLogs.filter(log => log.timestamp > Date.now() - 3600000); // Última hora
        const previousErrors = errorLogs.filter(log => log.timestamp > Date.now() - 7200000 && log.timestamp <= Date.now() - 3600000); // Hora anterior
        let errorTrend = 'stable';
        if (recentErrors.length > previousErrors.length * 1.2) {
            errorTrend = 'increasing';
        }
        else if (recentErrors.length < previousErrors.length * 0.8) {
            errorTrend = 'decreasing';
        }
        return {
            hourlyGrowth: logs.length / Math.max(1, (timeRange?.end || Date.now() - timeRange?.start || 3600000) / 3600000),
            errorTrend
        };
    }
    convertToCsv(logs) {
        const headers = ['timestamp', 'level', 'message', 'userId', 'requestId', 'module', 'fingerprint'];
        const csvRows = [headers.join(',')];
        logs.forEach(log => {
            const row = [
                new Date(log.timestamp).toISOString(),
                log.level,
                `"${log.message.replace(/"/g, '""')}"`, // Escapar aspas
                log.context?.userId || '',
                log.context?.requestId || '',
                log.context?.module || '',
                log.fingerprint || ''
            ];
            csvRows.push(row.join(','));
        });
        return csvRows.join('\n');
    }
    startPeriodicFlush() {
        setInterval(() => {
            this.emit('flush', {
                bufferSize: this.logBuffer.length,
                patternCounts: this.logCounts.size
            });
        }, this.flushInterval);
    }
    setupErrorHandling() {
        this.on('error', (error) => {
            console.error('Advanced logging service error:', error);
        });
    }
}
exports.default = new AdvancedLoggingService();
