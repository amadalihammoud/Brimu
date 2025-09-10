import { Request, Response, NextFunction } from 'express';
import performanceAnalysisService from '../services/performanceAnalysisService';
import advancedLoggingService from '../services/advancedLoggingService';

/**
 * Middleware de Performance Analysis
 * Coleta automática de métricas de performance de todas as requisições
 */

// Extend Request interface to include performance timing
declare module 'express-serve-static-core' {
  interface Request {
    performanceStart?: number;
    performanceContext?: {
      endpoint: string;
      method: string;
      userAgent?: string;
      ip?: string;
      userId?: string;
      requestId?: string;
    };
  }
}

/**
 * Middleware para iniciar medição de performance
 */
export const performanceStartMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    req.performanceStart = Date.now();
    req.performanceContext = {
      endpoint: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id,
      requestId: req.requestId
    };

    // Override original end to capture metrics when response completes
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      try {
        capturePerformanceMetrics(req, res);
      } catch (error) {
        advancedLoggingService.error('Error capturing performance metrics', {
          error: error.message,
          endpoint: req.path,
          method: req.method
        });
      }

      // Call original end
      return originalEnd.call(this, chunk, encoding);
    };

    next();
  } catch (error) {
    advancedLoggingService.error('Error in performance start middleware', {
      error: error.message,
      endpoint: req.path,
      method: req.method
    });
    next();
  }
};

/**
 * Capturar métricas de performance da requisição
 */
function capturePerformanceMetrics(req: Request, res: Response): void {
  if (!req.performanceStart || !req.performanceContext) return;

  const duration = Date.now() - req.performanceStart;
  const statusCode = res.statusCode;
  const isError = statusCode >= 400;

  // Registrar tempo de resposta
  performanceAnalysisService.recordResponseTime(
    req.performanceContext.endpoint,
    req.performanceContext.method,
    duration,
    {
      statusCode,
      userId: req.performanceContext.userId,
      requestId: req.performanceContext.requestId,
      userAgent: req.performanceContext.userAgent,
      ip: req.performanceContext.ip
    }
  );

  // Registrar erro se aplicável
  if (isError) {
    const endpoint = `${req.performanceContext.method} ${req.performanceContext.endpoint}`;
    performanceAnalysisService.recordErrorRate(endpoint, 1, {
      statusCode,
      duration,
      userId: req.performanceContext.userId,
      requestId: req.performanceContext.requestId
    });
  }

  // Log detalhado para requisições lentas
  if (duration > 2000) {
    advancedLoggingService.warn('Slow Request Detected', {
      endpoint: req.performanceContext.endpoint,
      method: req.performanceContext.method,
      duration,
      statusCode,
      userId: req.performanceContext.userId,
      requestId: req.performanceContext.requestId,
      component: 'PerformanceMiddleware'
    });
  }

  // Log para erros
  if (isError) {
    advancedLoggingService.warn('HTTP Error Response', {
      endpoint: req.performanceContext.endpoint,
      method: req.performanceContext.method,
      statusCode,
      duration,
      userId: req.performanceContext.userId,
      requestId: req.performanceContext.requestId,
      component: 'PerformanceMiddleware'
    });
  }
}

/**
 * Middleware para monitorar queries de banco de dados
 * Para ser usado com mongoose ou outros ORMs
 */
export const databasePerformanceMiddleware = {
  // Hook para mongoose queries
  setupMongooseHooks: () => {
    const mongoose = require('mongoose');
    
    if (mongoose.connection) {
      // Monitor query execution time
      mongoose.connection.on('query', (queryData: any) => {
        const start = Date.now();
        
        queryData.on('end', () => {
          const duration = Date.now() - start;
          
          performanceAnalysisService.recordDatabaseQuery(
            queryData.op || 'unknown',
            duration,
            {
              collection: queryData.collection,
              database: 'mongodb'
            }
          );

          if (duration > 1000) {
            advancedLoggingService.warn('Slow Database Query', {
              query: queryData.op,
              collection: queryData.collection,
              duration,
              component: 'DatabasePerformanceMiddleware'
            });
          }
        });
      });
    }
  }
};

/**
 * Middleware para monitorar uso de memória e CPU em endpoints específicos
 */
export const resourceUsageMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const initialMemory = process.memoryUsage();
    const initialCpu = process.cpuUsage();

    // Override response end to capture resource usage
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      try {
        const finalMemory = process.memoryUsage();
        const finalCpu = process.cpuUsage(initialCpu);

        // Calculate memory increase (in MB)
        const memoryDiff = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024;
        
        // Calculate CPU usage (in microseconds)
        const cpuTime = (finalCpu.user + finalCpu.system) / 1000; // Convert to milliseconds

        // Record metrics if significant
        if (memoryDiff > 10) { // More than 10MB memory increase
          performanceAnalysisService.recordMetric({
            metric: 'memory_increase',
            value: memoryDiff,
            unit: 'MB',
            context: {
              endpoint: req.path,
              method: req.method,
              userId: req.user?.id,
              requestId: req.requestId
            }
          });

          advancedLoggingService.info('High Memory Usage Request', {
            endpoint: req.path,
            method: req.method,
            memoryIncrease: memoryDiff,
            component: 'ResourceUsageMiddleware'
          });
        }

        if (cpuTime > 100) { // More than 100ms CPU time
          performanceAnalysisService.recordMetric({
            metric: 'cpu_time',
            value: cpuTime,
            unit: 'ms',
            context: {
              endpoint: req.path,
              method: req.method,
              userId: req.user?.id,
              requestId: req.requestId
            }
          });
        }
      } catch (error) {
        advancedLoggingService.error('Error in resource usage middleware', {
          error: error.message,
          endpoint: req.path,
          method: req.method
        });
      }

      return originalEnd.call(this, chunk, encoding);
    };

    next();
  } catch (error) {
    advancedLoggingService.error('Error in resource usage middleware setup', {
      error: error.message,
      endpoint: req.path,
      method: req.method
    });
    next();
  }
};

/**
 * Middleware para coleta de métricas de cache
 */
export const cachePerformanceMiddleware = (cacheHit: boolean, cacheKey?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      performanceAnalysisService.recordMetric({
        metric: 'cache_hit',
        value: cacheHit ? 1 : 0,
        unit: 'boolean',
        context: {
          endpoint: req.path,
          method: req.method,
          cacheKey,
          userId: req.user?.id,
          requestId: req.requestId
        }
      });

      if (!cacheHit) {
        advancedLoggingService.debug('Cache Miss', {
          endpoint: req.path,
          method: req.method,
          cacheKey,
          component: 'CachePerformanceMiddleware'
        });
      }

      next();
    } catch (error) {
      advancedLoggingService.error('Error in cache performance middleware', {
        error: error.message,
        endpoint: req.path,
        method: req.method
      });
      next();
    }
  };
};

/**
 * Middleware para análise de throughput
 */
export const throughputAnalysisMiddleware = (() => {
  const requestCounts = new Map<string, number>();
  const requestTimestamps = new Map<string, number[]>();

  // Reset counters every minute
  setInterval(() => {
    const now = Date.now();
    for (const [endpoint, timestamps] of requestTimestamps.entries()) {
      // Keep only timestamps from last minute
      const recent = timestamps.filter(ts => now - ts < 60000);
      requestTimestamps.set(endpoint, recent);
      requestCounts.set(endpoint, recent.length);

      // Record throughput metric
      if (recent.length > 0) {
        performanceAnalysisService.recordMetric({
          metric: 'throughput',
          value: recent.length,
          unit: 'requests/min',
          context: {
            endpoint: endpoint.split(':')[1],
            method: endpoint.split(':')[0]
          }
        });
      }
    }
  }, 60000);

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const endpointKey = `${req.method}:${req.path}`;
      const now = Date.now();

      // Update request count
      const currentCount = requestCounts.get(endpointKey) || 0;
      requestCounts.set(endpointKey, currentCount + 1);

      // Update timestamps
      const timestamps = requestTimestamps.get(endpointKey) || [];
      timestamps.push(now);
      requestTimestamps.set(endpointKey, timestamps);

      next();
    } catch (error) {
      advancedLoggingService.error('Error in throughput analysis middleware', {
        error: error.message,
        endpoint: req.path,
        method: req.method
      });
      next();
    }
  };
})();

/**
 * Middleware combinado para análise completa de performance
 */
export const comprehensivePerformanceMiddleware = [
  performanceStartMiddleware,
  resourceUsageMiddleware,
  throughputAnalysisMiddleware
];

/**
 * Utilitário para criar middleware personalizado de performance
 */
export const createCustomPerformanceMiddleware = (
  metricName: string,
  valueExtractor: (req: Request, res: Response) => number,
  unit: string = 'count',
  threshold?: { warning: number; critical: number }
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const originalEnd = res.end;
      res.end = function(chunk?: any, encoding?: any) {
        try {
          const value = valueExtractor(req, res);
          
          performanceAnalysisService.recordMetric({
            metric: metricName,
            value,
            unit,
            context: {
              endpoint: req.path,
              method: req.method,
              userId: req.user?.id,
              requestId: req.requestId
            },
            threshold
          });
        } catch (error) {
          advancedLoggingService.error(`Error in custom performance middleware (${metricName})`, {
            error: error.message,
            endpoint: req.path,
            method: req.method
          });
        }

        return originalEnd.call(this, chunk, encoding);
      };

      next();
    } catch (error) {
      advancedLoggingService.error(`Error setting up custom performance middleware (${metricName})`, {
        error: error.message,
        endpoint: req.path,
        method: req.method
      });
      next();
    }
  };
};