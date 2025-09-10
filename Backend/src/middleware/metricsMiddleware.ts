import { Request, Response, NextFunction } from 'express';
import metricsService from '../services/metricsService';
import { logger } from '../utils/logger';

/**
 * Middleware de Métricas
 * Coleta automaticamente métricas de performance de todas as requisições
 */

// Extensão da interface Request para incluir dados de timing
declare global {
  namespace Express {
    interface Request {
      startTime?: number;
      requestId?: string;
    }
  }
}

export const metricsCollectionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Registrar início da requisição
  req.startTime = Date.now();
  req.requestId = req.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Hook no método res.end para capturar métricas quando a resposta for enviada
  const originalEnd = res.end;
  
  res.end = function(...args: any[]) {
    const endTime = Date.now();
    const duration = req.startTime ? endTime - req.startTime : 0;

    // Registrar métrica de performance
    metricsService.recordMetric({
      endpoint: req.route?.path || req.path,
      method: req.method,
      duration,
      statusCode: res.statusCode
    });

    // Log detalhado para requisições lentas (> 1 segundo)
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        duration,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
    }

    // Chamar método original
    return originalEnd.apply(this, args);
  };

  next();
};

export const healthCheckMetrics = (req: Request, res: Response, next: NextFunction): void => {
  // Para endpoints de health check, coletar métricas adicionais
  if (req.path.includes('/health') || req.path.includes('/status')) {
    const systemMetrics = metricsService.getSystemMetrics();
    
    // Adicionar métricas ao response
    res.locals.systemMetrics = systemMetrics;
    
    logger.debug('Health check metrics collected', {
      requestId: req.requestId,
      uptime: systemMetrics.uptime,
      memoryUsage: systemMetrics.memory.heapUsed,
      avgResponseTime: systemMetrics.avgResponseTime
    });
  }
  
  next();
};

export const cacheMetricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Hook no cabeçalho X-Cache para registrar hits/misses
  const originalSetHeader = res.setHeader;
  
  res.setHeader = function(name: string, value: string | number | readonly string[]) {
    if (name === 'X-Cache') {
      if (value === 'HIT') {
        metricsService.recordCacheHit();
      } else if (value === 'MISS') {
        metricsService.recordCacheMiss();
      }
    }
    
    return originalSetHeader.call(this, name, value);
  };

  next();
};

export const errorMetricsMiddleware = (error: any, req: Request, res: Response, next: NextFunction): void => {
  // Registrar métricas de erro
  const duration = req.startTime ? Date.now() - req.startTime : 0;
  
  metricsService.recordMetric({
    endpoint: req.route?.path || req.path,
    method: req.method,
    duration,
    statusCode: error.statusCode || 500
  });

  logger.error('Error metrics recorded', {
    requestId: req.requestId,
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    duration
  });

  next(error);
};

export const performanceAnalysisMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Middleware para análise detalhada de performance em endpoints críticos
  const criticalEndpoints = ['/api/orders', '/api/reports', '/api/payments'];
  
  if (criticalEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    const startCpuUsage = process.cpuUsage();
    const startMemory = process.memoryUsage();
    
    // Hook para capturar métricas detalhadas
    const originalJson = res.json;
    res.json = function(data: any) {
      const endCpuUsage = process.cpuUsage(startCpuUsage);
      const endMemory = process.memoryUsage();
      
      logger.info('Critical endpoint performance analysis', {
        requestId: req.requestId,
        path: req.path,
        method: req.method,
        cpuUsage: {
          user: endCpuUsage.user,
          system: endCpuUsage.system
        },
        memoryDelta: {
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal
        },
        responseSize: JSON.stringify(data).length
      });
      
      return originalJson.call(this, data);
    };
  }
  
  next();
};