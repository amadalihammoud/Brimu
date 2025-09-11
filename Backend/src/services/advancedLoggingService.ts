import winston from 'winston';
import path from 'path';
import { EventEmitter } from 'events';
import { logger as baseLogger } from '../utils/logger';
import notificationService from './notificationService';
import { defaultLogPatterns, logRetentionConfig } from '../config/logsPatterns';
import { LogContext } from '../types';

/**
 * Serviço de Logs Estruturados Avançado
 * Sistema completo de logging com níveis, contextos, análise e alertas
 */

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';
  message: string;
  context?: LogContext;
  metadata?: Record<string, any>;
  stack?: string;
  fingerprint?: string; // Para agrupamento de logs similares
  tags?: string[];
  environment: string;
  service: string;
  version: string;
}


export interface LogPattern {
  id: string;
  name: string;
  pattern: RegExp | string;
  level: string;
  description: string;
  action: 'alert' | 'count' | 'ignore';
  threshold?: number;
  timeWindow?: number; // em minutos
  lastTriggered?: number;
}

export interface LogAnalytics {
  totalLogs: number;
  logsByLevel: Record<string, number>;
  logsByHour: Array<{ hour: string; count: number }>;
  topErrors: Array<{ fingerprint: string; count: number; message: string; lastSeen: number }>;
  topUsers: Array<{ userId: string; count: number }>;
  topEndpoints: Array<{ endpoint: string; count: number; avgDuration: number }>;
  errorRate: number;
  trends: {
    hourlyGrowth: number;
    errorTrend: 'increasing' | 'decreasing' | 'stable';
  };
}

class AdvancedLoggingService extends EventEmitter {
  private logBuffer: LogEntry[] = [];
  private logPatterns: Map<string, LogPattern> = new Map();
  private logCounts: Map<string, { count: number; firstSeen: number; lastSeen: number }> = new Map();
  private winston: winston.Logger;
  private maxBufferSize = 10000;
  private flushInterval = 5000; // 5 segundos

  constructor() {
    super();
    this.setupWinston();
    this.initializePatterns();
    this.startPeriodicFlush();
    this.setupErrorHandling();
  }

  // Log principal com contexto rico
  log(level: LogEntry['level'], message: string, context?: LogContext, metadata?: Record<string, any>): LogEntry {
    const logEntry: LogEntry = {
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
      version: '1.0.0'
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
  error(message: string, context?: LogContext, error?: Error): LogEntry {
    return this.log('error', message, context, { error });
  }

  warn(message: string, context?: LogContext, metadata?: Record<string, any>): LogEntry {
    return this.log('warn', message, context, metadata);
  }

  info(message: string, context?: LogContext, metadata?: Record<string, any>): LogEntry {
    return this.log('info', message, context, metadata);
  }

  http(message: string, context?: LogContext, metadata?: Record<string, any>): LogEntry {
    return this.log('http', message, context, metadata);
  }

  debug(message: string, context?: LogContext, metadata?: Record<string, any>): LogEntry {
    return this.log('debug', message, context, metadata);
  }

  // Log de ações específicas do sistema
  logUserAction(userId: string, action: string, details?: any, context?: Partial<LogContext>): LogEntry {
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

  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext, details?: any): LogEntry {
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

  logPerformanceEvent(operation: string, duration: number, context?: LogContext, metadata?: any): LogEntry {
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

  logSystemEvent(event: string, status: 'started' | 'completed' | 'failed', context?: LogContext, details?: any): LogEntry {
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
  searchLogs(filters: {
    level?: string[];
    timeRange?: { start: number; end: number };
    userId?: string;
    correlationId?: string;
    text?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): LogEntry[] {
    let logs = [...this.logBuffer];

    // Filtrar por nível
    if (filters.level && filters.level.length > 0) {
      logs = logs.filter(log => filters.level!.includes(log.level));
    }

    // Filtrar por range de tempo
    if (filters.timeRange) {
      logs = logs.filter(log => 
        log.timestamp >= filters.timeRange!.start && 
        log.timestamp <= filters.timeRange!.end
      );
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
      logs = logs.filter(log => 
        log.message.toLowerCase().includes(searchText) ||
        JSON.stringify(log.metadata || {}).toLowerCase().includes(searchText)
      );
    }

    // Filtrar por tags
    if (filters.tags && filters.tags.length > 0) {
      logs = logs.filter(log => 
        log.tags && filters.tags!.some(tag => log.tags!.includes(tag))
      );
    }

    // Ordenar por timestamp (mais recente primeiro)
    logs.sort((a, b) => b.timestamp - a.timestamp);

    // Aplicar paginação
    const offset = filters.offset || 0;
    const limit = filters.limit || 100;
    
    return logs.slice(offset, offset + limit);
  }

  // Análise de logs
  getAnalytics(timeRange?: { start: number; end: number }): LogAnalytics {
    let logs = this.logBuffer;

    if (timeRange) {
      logs = logs.filter(log => 
        log.timestamp >= timeRange.start && log.timestamp <= timeRange.end
      );
    }

    // Contagem por nível
    const logsByLevel = logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
      }, {} as Record<string, { count: number; message: string; lastSeen: number }>);

    const topErrors = Object.entries(errorCounts)
      .map(([fingerprint, data]) => ({ fingerprint, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top usuários
    const userCounts = logs
      .filter(log => log.context?.userId)
      .reduce((acc, log) => {
        const userId = log.context!.userId!;
        acc[userId] = (acc[userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topUsers = Object.entries(userCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top endpoints
    const endpointStats = logs
      .filter(log => log.context?.url && log.context?.duration)
      .reduce((acc, log) => {
        const url = log.context!.url!;
        if (!acc[url]) {
          acc[url] = { count: 0, totalDuration: 0 };
        }
        acc[url].count++;
        acc[url].totalDuration += log.context!.duration!;
        return acc;
      }, {} as Record<string, { count: number; totalDuration: number }>);

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
  addPattern(pattern: LogPattern): void {
    this.logPatterns.set(pattern.id, pattern);
    this.emit('patternAdded', pattern);
  }

  // Remover padrão
  removePattern(patternId: string): boolean {
    const removed = this.logPatterns.delete(patternId);
    if (removed) {
      this.emit('patternRemoved', patternId);
    }
    return removed;
  }

  // Obter todos os padrões
  getPatterns(): LogPattern[] {
    return Array.from(this.logPatterns.values());
  }

  // Exportar logs para análise externa
  exportLogs(format: 'json' | 'csv' | 'elasticsearch', filters?: any): string {
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
  cleanup(olderThan: number): number {
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
  private setupWinston(): void {
    // Usar logger base já configurado
    this.winston = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({
          filename: path.join('logs', 'advanced.log'),
          maxsize: 10485760, // 10MB
          maxFiles: 5,
          tailable: true
        }),
        new winston.transports.File({
          filename: path.join('logs', 'errors-advanced.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 3
        })
      ]
    });
  }

  private initializePatterns(): void {
    // Carregar padrões predefinidos de monitoramento
    defaultLogPatterns.forEach(pattern => this.addPattern(pattern));
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFingerprint(message: string, context?: LogContext): string {
    // Criar fingerprint para agrupar logs similares
    const key = message
      .replace(/\d+/g, 'N') // Substituir números
      .replace(/[0-9a-f-]{36}/g, 'UUID') // Substituir UUIDs
      .replace(/\w+@\w+\.\w+/g, 'EMAIL') // Substituir emails
      .toLowerCase();
    
    const contextKey = context?.module || context?.component || 'general';
    return `${contextKey}:${key}`.substring(0, 100);
  }

  private extractTags(message: string, context?: LogContext): string[] {
    const tags: string[] = [];

    // Tags do contexto
    if (context?.module) tags.push(`module:${context.module}`);
    if (context?.component) tags.push(`component:${context.component}`);
    if (context?.userId) tags.push('user-action');
    if (context?.requestId) tags.push('request');

    // Tags da mensagem
    if (message.toLowerCase().includes('error')) tags.push('error');
    if (message.toLowerCase().includes('slow')) tags.push('performance');
    if (message.toLowerCase().includes('security')) tags.push('security');
    if (message.toLowerCase().includes('backup')) tags.push('backup');
    if (message.toLowerCase().includes('cache')) tags.push('cache');

    return [...new Set(tags)]; // Remover duplicatas
  }

  private addToBuffer(logEntry: LogEntry): void {
    this.logBuffer.push(logEntry);

    // Manter tamanho do buffer
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }
  }

  private checkPatterns(logEntry: LogEntry): void {
    for (const [patternId, pattern] of this.logPatterns) {
      if (this.matchesPattern(logEntry, pattern)) {
        this.handlePatternMatch(logEntry, pattern);
      }
    }
  }

  private matchesPattern(logEntry: LogEntry, pattern: LogPattern): boolean {
    // Verificar nível
    if (logEntry.level !== pattern.level && pattern.level !== 'all') {
      return false;
    }

    // Verificar padrão
    if (pattern.pattern instanceof RegExp) {
      return pattern.pattern.test(logEntry.message);
    } else {
      return logEntry.message.toLowerCase().includes(pattern.pattern.toLowerCase());
    }
  }

  private async handlePatternMatch(logEntry: LogEntry, pattern: LogPattern): Promise<void> {
    const now = Date.now();
    const countKey = `pattern:${pattern.id}`;
    
    // Atualizar contador
    if (!this.logCounts.has(countKey)) {
      this.logCounts.set(countKey, { count: 0, firstSeen: now, lastSeen: now });
    }
    
    const count = this.logCounts.get(countKey)!;
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

  private async triggerPatternAlert(logEntry: LogEntry, pattern: LogPattern, count: number): Promise<void> {
    if (pattern.action !== 'alert') return;

    // Evitar spam de alertas
    if (pattern.lastTriggered && (Date.now() - pattern.lastTriggered) < 60000) {
      return;
    }

    pattern.lastTriggered = Date.now();

    try {
      await notificationService.sendNotification({
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
    } catch (error) {
      console.error('Failed to send log pattern alert:', error);
    }
  }

  private groupLogsByHour(logs: LogEntry[]): Array<{ hour: string; count: number }> {
    const hourCounts = logs.reduce((acc, log) => {
      const hour = new Date(log.timestamp).toISOString().substring(0, 13) + ':00:00.000Z';
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  }

  private calculateTrends(logs: LogEntry[], timeRange?: { start: number; end: number }): LogAnalytics['trends'] {
    // Placeholder para cálculos de tendência mais complexos
    const errorLogs = logs.filter(log => log.level === 'error');
    const recentErrors = errorLogs.filter(log => log.timestamp > Date.now() - 3600000); // Última hora
    const previousErrors = errorLogs.filter(log => 
      log.timestamp > Date.now() - 7200000 && log.timestamp <= Date.now() - 3600000
    ); // Hora anterior

    let errorTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentErrors.length > previousErrors.length * 1.2) {
      errorTrend = 'increasing';
    } else if (recentErrors.length < previousErrors.length * 0.8) {
      errorTrend = 'decreasing';
    }

    return {
      hourlyGrowth: logs.length / Math.max(1, (timeRange?.end || Date.now() - timeRange?.start || 3600000) / 3600000),
      errorTrend
    };
  }

  private convertToCsv(logs: LogEntry[]): string {
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

  private startPeriodicFlush(): void {
    setInterval(() => {
      this.emit('flush', {
        bufferSize: this.logBuffer.length,
        patternCounts: this.logCounts.size
      });
    }, this.flushInterval);
  }

  private setupErrorHandling(): void {
    this.on('error', (error) => {
      console.error('Advanced logging service error:', error);
    });
  }
}

export default new AdvancedLoggingService();