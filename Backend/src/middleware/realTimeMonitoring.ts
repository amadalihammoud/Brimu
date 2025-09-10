import { Request, Response, NextFunction } from 'express';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

/**
 * Sistema de Monitoramento em Tempo Real
 * Monitora performance, saúde do sistema e atividades suspeitas
 */

interface SystemMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  currentConnections: number;
  memoryUsage: NodeJS.MemoryUsage;
  uptime: number;
  lastUpdated: string;
}

interface RequestMetrics {
  path: string;
  method: string;
  statusCode: number;
  responseTime: number;
  ip: string;
  userAgent: string;
  timestamp: string;
}

interface PerformanceAlert {
  type: 'high_response_time' | 'high_error_rate' | 'memory_leak' | 'suspicious_activity';
  severity: 'warning' | 'error' | 'critical';
  message: string;
  details: any;
  timestamp: string;
}

class RealTimeMonitoring extends EventEmitter {
  private metrics: SystemMetrics;
  private recentRequests: RequestMetrics[] = [];
  private responseTimes: number[] = [];
  private errorRates: { timestamp: number; count: number }[] = [];
  private alerts: PerformanceAlert[] = [];
  private startTime: number;
  
  // Thresholds para alertas
  private readonly thresholds = {
    responseTime: 5000, // 5 segundos
    errorRate: 10, // 10% de erro
    memoryUsage: 500 * 1024 * 1024, // 500MB
    maxRecentRequests: 1000
  };

  constructor() {
    super();
    this.startTime = Date.now();
    this.metrics = this.initializeMetrics();
    
    // Atualizar métricas a cada 30 segundos
    setInterval(() => {
      this.updateSystemMetrics();
      this.checkAlerts();
      this.cleanupOldData();
    }, 30000);
  }

  private initializeMetrics(): SystemMetrics {
    return {
      requestCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      currentConnections: 0,
      memoryUsage: process.memoryUsage(),
      uptime: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  // Middleware para rastrear requests
  trackRequest = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    
    // Incrementar contador de conexões
    this.metrics.currentConnections++;
    
    // Interceptar resposta
    const originalSend = res.send;
    res.send = function(data) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Registrar métrica da request
      const requestMetric: RequestMetrics = {
        path: req.path,
        method: req.method,
        statusCode: res.statusCode,
        responseTime,
        ip: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        timestamp: new Date().toISOString()
      };
      
      // Atualizar métricas
      monitoring.updateRequestMetrics(requestMetric);
      
      return originalSend.call(this, data);
    };

    // Decrementar contador quando request terminar
    res.on('finish', () => {
      this.metrics.currentConnections--;
    });

    next();
  };

  // Atualizar métricas de request
  private updateRequestMetrics(request: RequestMetrics): void {
    // Incrementar contadores
    this.metrics.requestCount++;
    if (request.statusCode >= 400) {
      this.metrics.errorCount++;
      this.errorRates.push({
        timestamp: Date.now(),
        count: 1
      });
    }

    // Adicionar tempo de resposta
    this.responseTimes.push(request.responseTime);
    if (this.responseTimes.length > 100) {
      this.responseTimes = this.responseTimes.slice(-100);
    }

    // Calcular tempo médio de resposta
    this.metrics.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;

    // Adicionar à lista de requests recentes
    this.recentRequests.push(request);
    if (this.recentRequests.length > this.thresholds.maxRecentRequests) {
      this.recentRequests = this.recentRequests.slice(-this.thresholds.maxRecentRequests);
    }

    // Emitir evento para tempo de resposta alto
    if (request.responseTime > this.thresholds.responseTime) {
      this.emit('highResponseTime', request);
      this.addAlert({
        type: 'high_response_time',
        severity: 'warning',
        message: `Tempo de resposta alto detectado: ${request.responseTime}ms`,
        details: { request },
        timestamp: new Date().toISOString()
      });
    }

    // Log para requests com erro
    if (request.statusCode >= 500) {
      logger.error('Server error request', request);
    }

    this.metrics.lastUpdated = new Date().toISOString();
  }

  // Atualizar métricas do sistema
  private updateSystemMetrics(): void {
    this.metrics.memoryUsage = process.memoryUsage();
    this.metrics.uptime = Date.now() - this.startTime;
    this.metrics.lastUpdated = new Date().toISOString();

    // Emitir métricas atualizadas
    this.emit('metricsUpdated', this.metrics);
  }

  // Verificar alertas
  private checkAlerts(): void {
    // Verificar taxa de erro
    const recentErrors = this.errorRates.filter(
      error => Date.now() - error.timestamp < 5 * 60 * 1000 // últimos 5 minutos
    );
    
    const errorRate = recentErrors.length / Math.max(this.recentRequests.length, 1) * 100;
    
    if (errorRate > this.thresholds.errorRate) {
      this.addAlert({
        type: 'high_error_rate',
        severity: 'error',
        message: `Taxa de erro alta: ${errorRate.toFixed(2)}%`,
        details: { errorRate, recentErrors: recentErrors.length },
        timestamp: new Date().toISOString()
      });
    }

    // Verificar uso de memória
    const memoryUsage = this.metrics.memoryUsage.heapUsed;
    if (memoryUsage > this.thresholds.memoryUsage) {
      this.addAlert({
        type: 'memory_leak',
        severity: memoryUsage > this.thresholds.memoryUsage * 1.5 ? 'critical' : 'warning',
        message: `Uso de memória alto: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`,
        details: { memoryUsage: this.metrics.memoryUsage },
        timestamp: new Date().toISOString()
      });
    }

    // Verificar atividade suspeita
    this.checkSuspiciousActivity();
  }

  // Verificar atividade suspeita
  private checkSuspiciousActivity(): void {
    const recentRequests = this.recentRequests.filter(
      req => Date.now() - new Date(req.timestamp).getTime() < 5 * 60 * 1000
    );

    // Verificar muitos 404s do mesmo IP
    const notFoundByIP = new Map<string, number>();
    recentRequests.filter(req => req.statusCode === 404).forEach(req => {
      notFoundByIP.set(req.ip, (notFoundByIP.get(req.ip) || 0) + 1);
    });

    for (const [ip, count] of notFoundByIP.entries()) {
      if (count > 20) { // mais de 20 404s em 5 minutos
        this.addAlert({
          type: 'suspicious_activity',
          severity: 'warning',
          message: `Possível scanning detectado do IP ${ip}`,
          details: { ip, notFoundCount: count },
          timestamp: new Date().toISOString()
        });
      }
    }

    // Verificar requests muito rápidos do mesmo IP
    const requestsByIP = new Map<string, RequestMetrics[]>();
    recentRequests.forEach(req => {
      if (!requestsByIP.has(req.ip)) {
        requestsByIP.set(req.ip, []);
      }
      requestsByIP.get(req.ip)!.push(req);
    });

    for (const [ip, requests] of requestsByIP.entries()) {
      if (requests.length > 100) { // mais de 100 requests em 5 minutos
        const avgTimeBetweenRequests = this.calculateAverageTimeBetweenRequests(requests);
        
        if (avgTimeBetweenRequests < 1000) { // menos de 1 segundo entre requests
          this.addAlert({
            type: 'suspicious_activity',
            severity: 'warning',
            message: `Possível bot/script detectado do IP ${ip}`,
            details: { 
              ip, 
              requestCount: requests.length, 
              avgTimeBetweenRequests 
            },
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }

  // Calcular tempo médio entre requests
  private calculateAverageTimeBetweenRequests(requests: RequestMetrics[]): number {
    if (requests.length < 2) return 0;
    
    const sortedRequests = requests.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    let totalTime = 0;
    for (let i = 1; i < sortedRequests.length; i++) {
      const timeDiff = new Date(sortedRequests[i].timestamp).getTime() - 
                      new Date(sortedRequests[i-1].timestamp).getTime();
      totalTime += timeDiff;
    }
    
    return totalTime / (sortedRequests.length - 1);
  }

  // Adicionar alerta
  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);
    
    // Manter apenas os últimos 100 alertas
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
    
    // Log do alerta
    logger.warn('Performance alert', alert);
    
    // Emitir evento
    this.emit('alert', alert);
  }

  // Limpar dados antigos
  private cleanupOldData(): void {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    // Limpar rates de erro antigos
    this.errorRates = this.errorRates.filter(
      error => error.timestamp > fiveMinutesAgo
    );
    
    // Limpar requests antigos (manter apenas últimas 24 horas)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.recentRequests = this.recentRequests.filter(
      req => new Date(req.timestamp).getTime() > oneDayAgo
    );

    // Limpar alertas antigos (manter apenas última semana)
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    this.alerts = this.alerts.filter(
      alert => new Date(alert.timestamp).getTime() > oneWeekAgo
    );
  }

  // Obter métricas atuais
  getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  // Obter requests recentes
  getRecentRequests(limit: number = 50): RequestMetrics[] {
    return this.recentRequests.slice(-limit);
  }

  // Obter alertas recentes
  getRecentAlerts(limit: number = 20): PerformanceAlert[] {
    return this.alerts.slice(-limit);
  }

  // Obter estatísticas detalhadas
  getDetailedStats(): any {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const recentRequests = this.recentRequests.filter(
      req => new Date(req.timestamp).getTime() > oneHourAgo
    );

    const last24hRequests = this.recentRequests.filter(
      req => new Date(req.timestamp).getTime() > oneDayAgo
    );

    // Estatísticas por endpoint
    const endpointStats = new Map<string, { count: number; avgResponseTime: number; errorRate: number }>();
    
    recentRequests.forEach(req => {
      const key = `${req.method} ${req.path}`;
      const current = endpointStats.get(key) || { count: 0, avgResponseTime: 0, errorRate: 0 };
      
      current.count++;
      current.avgResponseTime = (current.avgResponseTime * (current.count - 1) + req.responseTime) / current.count;
      if (req.statusCode >= 400) {
        current.errorRate = ((current.errorRate * (current.count - 1)) + 100) / current.count;
      } else {
        current.errorRate = (current.errorRate * (current.count - 1)) / current.count;
      }
      
      endpointStats.set(key, current);
    });

    // Top endpoints
    const topEndpoints = Array.from(endpointStats.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([endpoint, stats]) => ({ endpoint, ...stats }));

    return {
      current: this.metrics,
      lastHour: {
        requestCount: recentRequests.length,
        errorCount: recentRequests.filter(r => r.statusCode >= 400).length,
        averageResponseTime: recentRequests.length > 0 
          ? recentRequests.reduce((sum, r) => sum + r.responseTime, 0) / recentRequests.length 
          : 0
      },
      last24Hours: {
        requestCount: last24hRequests.length,
        errorCount: last24hRequests.filter(r => r.statusCode >= 400).length,
        averageResponseTime: last24hRequests.length > 0 
          ? last24hRequests.reduce((sum, r) => sum + r.responseTime, 0) / last24hRequests.length 
          : 0
      },
      topEndpoints,
      recentAlerts: this.getRecentAlerts(10),
      systemHealth: this.getSystemHealth()
    };
  }

  // Verificar saúde do sistema
  private getSystemHealth(): string {
    const errorRate = (this.metrics.errorCount / Math.max(this.metrics.requestCount, 1)) * 100;
    const memoryUsage = this.metrics.memoryUsage.heapUsed;
    
    if (errorRate > 20 || memoryUsage > this.thresholds.memoryUsage * 2) {
      return 'critical';
    } else if (errorRate > 10 || memoryUsage > this.thresholds.memoryUsage) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }

  // Resetar métricas
  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
    this.recentRequests = [];
    this.responseTimes = [];
    this.errorRates = [];
    this.alerts = [];
    this.startTime = Date.now();
    
    logger.info('Monitoring metrics reset');
  }
}

// Instância singleton
const monitoring = new RealTimeMonitoring();

export default monitoring;
export { SystemMetrics, RequestMetrics, PerformanceAlert };