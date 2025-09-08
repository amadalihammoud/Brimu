import { Request, Response } from 'express';
import mongoose from 'mongoose';
import cache from '../cache/redisClient';
import logger from '../logging/logger';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceHealth;
    cache: ServiceHealth;
    disk: ServiceHealth;
    memory: ServiceHealth;
  };
}

interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  details?: any;
  error?: string;
}

class HealthMonitor {
  private startTime: number = Date.now();

  async checkHealth(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    const uptime = (Date.now() - this.startTime) / 1000;

    // Check all services
    const [database, cacheService, disk, memory] = await Promise.all([
      this.checkDatabase(),
      this.checkCache(),
      this.checkDisk(),
      this.checkMemory(),
    ]);

    // Determine overall status
    const services = { database, cache: cacheService, disk, memory };
    const status = this.determineOverallStatus(services);

    const healthStatus: HealthStatus = {
      status,
      timestamp,
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services,
    };

    // Log health check
    logger.debug('Health check completed', { status, services: Object.keys(services) });

    return healthStatus;
  }

  private async checkDatabase(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      const state = mongoose.connection.readyState;
      const responseTime = Date.now() - startTime;

      if (state === 1) { // Connected
        // Test database with a simple query
        await mongoose.connection.db.admin().ping();
        
        return {
          status: 'up',
          responseTime,
          details: {
            readyState: state,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name,
          },
        };
      } else {
        return {
          status: 'down',
          responseTime,
          details: { readyState: state },
          error: 'Database not connected',
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'down',
        responseTime,
        error: error instanceof Error ? error.message : 'Database check failed',
      };
    }
  }

  private async checkCache(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      const stats = cache.getStats();
      const responseTime = Date.now() - startTime;

      // Test cache with a simple operation
      const testKey = `health:check:${Date.now()}`;
      await cache.set(testKey, 'test', 10);
      const result = await cache.get(testKey);
      await cache.del(testKey);

      const status = result === 'test' ? 'up' : 'degraded';

      return {
        status,
        responseTime,
        details: stats,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'down',
        responseTime,
        error: error instanceof Error ? error.message : 'Cache check failed',
      };
    }
  }

  private async checkDisk(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      // Check if logs directory is writable
      const testFile = path.join('logs', '.health-check');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'up',
        responseTime,
        details: {
          writable: true,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'down',
        responseTime,
        error: error instanceof Error ? error.message : 'Disk check failed',
      };
    }
  }

  private async checkMemory(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      const memoryUsage = process.memoryUsage();
      const responseTime = Date.now() - startTime;
      
      // Convert bytes to MB
      const rss = Math.round(memoryUsage.rss / 1024 / 1024);
      const heapUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const heapTotal = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      
      // Consider memory usage above 512MB as degraded
      const status = rss > 512 ? 'degraded' : 'up';
      
      return {
        status,
        responseTime,
        details: {
          rss: `${rss}MB`,
          heapUsed: `${heapUsed}MB`,
          heapTotal: `${heapTotal}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'down',
        responseTime,
        error: error instanceof Error ? error.message : 'Memory check failed',
      };
    }
  }

  private determineOverallStatus(services: HealthStatus['services']): HealthStatus['status'] {
    const serviceStatuses = Object.values(services).map(service => service.status);
    
    if (serviceStatuses.every(status => status === 'up')) {
      return 'healthy';
    }
    
    if (serviceStatuses.some(status => status === 'down')) {
      return 'unhealthy';
    }
    
    return 'degraded';
  }

  // Health check endpoint handlers
  async healthHandler(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.checkHealth();
      const statusCode = health.status === 'healthy' ? 200 : 
                        health.status === 'degraded' ? 200 : 503;
      
      res.status(statusCode).json(health);
    } catch (error) {
      logger.error('Health check failed', { error });
      res.status(503).json({
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      });
    }
  }

  async readinessHandler(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.checkHealth();
      const isReady = health.status === 'healthy' || health.status === 'degraded';
      
      if (isReady) {
        res.status(200).json({ status: 'ready', timestamp: health.timestamp });
      } else {
        res.status(503).json({ status: 'not ready', timestamp: health.timestamp });
      }
    } catch (error) {
      res.status(503).json({ status: 'not ready', error: 'Readiness check failed' });
    }
  }

  async livenessHandler(req: Request, res: Response): Promise<void> {
    // Simple liveness check - if the process is running, it's alive
    res.status(200).json({ 
      status: 'alive', 
      timestamp: new Date().toISOString(),
      uptime: (Date.now() - this.startTime) / 1000
    });
  }
}

export default new HealthMonitor();