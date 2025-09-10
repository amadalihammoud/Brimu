import { EventEmitter } from 'events';
import mongoose from 'mongoose';
import cache from '../cache/redisClient';
import advancedLoggingService from './advancedLoggingService';
import performanceAnalysisService from './performanceAnalysisService';
import notificationService from './notificationService';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Serviço de HealthCheck e Status Avançado
 * Sistema completo de monitoramento de saúde da aplicação
 */

export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  message: string;
  details?: Record<string, any>;
  critical: boolean;
  lastCheck: number;
  error?: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  score: number; // 0-100
  status: string;
  timestamp: number;
  uptime: number;
  version: string;
  environment: string;
  checks: HealthCheckResult[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    critical: number;
  };
  resources: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
      loadAverage: number[];
    };
    disk: {
      used: number;
      total: number;
      percentage: number;
    };
    network: {
      connections: number;
      throughput: number;
    };
  };
  services: {
    database: HealthCheckResult;
    cache: HealthCheckResult;
    fileSystem: HealthCheckResult;
    externalAPIs: HealthCheckResult[];
  };
  alerts: Array<{
    level: 'warning' | 'critical';
    message: string;
    timestamp: number;
    service: string;
  }>;
}

export interface HealthCheckConfig {
  name: string;
  check: () => Promise<Omit<HealthCheckResult, 'name' | 'lastCheck'>>;
  interval: number; // em milissegundos
  timeout: number; // em milissegundos
  critical: boolean;
  enabled: boolean;
}

class HealthCheckService extends EventEmitter {
  private checks: Map<string, HealthCheckConfig> = new Map();
  private results: Map<string, HealthCheckResult> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;
  private mainInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.setupDefaultChecks();
    this.startHealthMonitoring();
    
    advancedLoggingService.info('HealthCheck Service Initialized', {
      component: 'HealthCheckService',
      checksCount: this.checks.size
    });
  }

  // Configurar verificações padrão
  private setupDefaultChecks(): void {
    // Database Health Check
    this.registerCheck({
      name: 'database',
      check: this.checkDatabase.bind(this),
      interval: 30000, // 30 segundos
      timeout: 10000, // 10 segundos
      critical: true,
      enabled: true
    });

    // Redis Cache Health Check
    this.registerCheck({
      name: 'cache',
      check: this.checkCache.bind(this),
      interval: 30000,
      timeout: 5000,
      critical: false,
      enabled: true
    });

    // File System Health Check
    this.registerCheck({
      name: 'filesystem',
      check: this.checkFileSystem.bind(this),
      interval: 60000, // 1 minuto
      timeout: 5000,
      critical: true,
      enabled: true
    });

    // Memory Health Check
    this.registerCheck({
      name: 'memory',
      check: this.checkMemory.bind(this),
      interval: 15000, // 15 segundos
      timeout: 1000,
      critical: false,
      enabled: true
    });

    // CPU Health Check
    this.registerCheck({
      name: 'cpu',
      check: this.checkCPU.bind(this),
      interval: 15000,
      timeout: 1000,
      critical: false,
      enabled: true
    });

    // Disk Space Health Check
    this.registerCheck({
      name: 'disk',
      check: this.checkDiskSpace.bind(this),
      interval: 60000,
      timeout: 5000,
      critical: true,
      enabled: true
    });

    // Application Performance Check
    this.registerCheck({
      name: 'performance',
      check: this.checkPerformance.bind(this),
      interval: 30000,
      timeout: 5000,
      critical: false,
      enabled: true
    });

    // Security Status Check
    this.registerCheck({
      name: 'security',
      check: this.checkSecurity.bind(this),
      interval: 300000, // 5 minutos
      timeout: 10000,
      critical: true,
      enabled: true
    });
  }

  // Registrar nova verificação de saúde
  registerCheck(config: HealthCheckConfig): void {
    this.checks.set(config.name, config);
    
    if (config.enabled && this.isRunning) {
      this.startCheck(config.name);
    }

    advancedLoggingService.info('Health Check Registered', {
      checkName: config.name,
      interval: config.interval,
      critical: config.critical,
      component: 'HealthCheckService'
    });
  }

  // Desregistrar verificação
  unregisterCheck(name: string): void {
    this.stopCheck(name);
    this.checks.delete(name);
    this.results.delete(name);

    advancedLoggingService.info('Health Check Unregistered', {
      checkName: name,
      component: 'HealthCheckService'
    });
  }

  // Obter status completo de saúde do sistema
  async getSystemHealth(): Promise<SystemHealth> {
    const checks = Array.from(this.results.values());
    const timestamp = Date.now();

    // Executar verificações síncronas se necessário
    await this.runSyncChecks();

    // Calcular estatísticas
    const summary = {
      total: checks.length,
      healthy: checks.filter(c => c.status === 'healthy').length,
      degraded: checks.filter(c => c.status === 'degraded').length,
      unhealthy: checks.filter(c => c.status === 'unhealthy').length,
      critical: checks.filter(c => c.critical && c.status !== 'healthy').length
    };

    // Calcular score geral (0-100)
    const score = this.calculateHealthScore(checks);
    
    // Determinar status geral
    const overall = this.determineOverallHealth(checks, score);

    // Coletar informações de recursos
    const resources = await this.collectResourceInfo();

    // Coletar status dos serviços principais
    const services = {
      database: this.results.get('database') || this.createUnknownResult('database'),
      cache: this.results.get('cache') || this.createUnknownResult('cache'),
      fileSystem: this.results.get('filesystem') || this.createUnknownResult('filesystem'),
      externalAPIs: [] // TODO: implementar verificações de APIs externas
    };

    // Coletar alertas recentes
    const alerts = this.collectRecentAlerts(checks);

    return {
      overall,
      score,
      status: this.getStatusMessage(overall, summary),
      timestamp,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
      summary,
      resources,
      services,
      alerts
    };
  }

  // Executar verificação específica manualmente
  async runCheck(name: string): Promise<HealthCheckResult> {
    const config = this.checks.get(name);
    if (!config) {
      throw new Error(`Health check '${name}' not found`);
    }

    return await this.executeCheck(name, config);
  }

  // Executar todas as verificações
  async runAllChecks(): Promise<Map<string, HealthCheckResult>> {
    const results = new Map<string, HealthCheckResult>();
    const promises = Array.from(this.checks.entries()).map(async ([name, config]) => {
      try {
        const result = await this.executeCheck(name, config);
        results.set(name, result);
        return result;
      } catch (error) {
        const errorResult: HealthCheckResult = {
          name,
          status: 'unhealthy',
          responseTime: 0,
          message: 'Check execution failed',
          error: error.message,
          critical: config.critical,
          lastCheck: Date.now()
        };
        results.set(name, errorResult);
        return errorResult;
      }
    });

    await Promise.all(promises);
    return results;
  }

  // Implementações das verificações específicas

  private async checkDatabase(): Promise<Omit<HealthCheckResult, 'name' | 'lastCheck'>> {
    const startTime = Date.now();
    
    try {
      if (mongoose.connection.readyState === 1) {
        // Testar com uma operação simples
        await mongoose.connection.db.admin().ping();
        
        const responseTime = Date.now() - startTime;
        
        return {
          status: responseTime > 1000 ? 'degraded' : 'healthy',
          responseTime,
          message: responseTime > 1000 ? 'Database responding slowly' : 'Database connection healthy',
          critical: true,
          details: {
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name,
            readyState: mongoose.connection.readyState
          }
        };
      } else {
        return {
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          message: 'Database connection not ready',
          critical: true,
          details: {
            readyState: mongoose.connection.readyState
          }
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'Database connection failed',
        error: error.message,
        critical: true
      };
    }
  }

  private async checkCache(): Promise<Omit<HealthCheckResult, 'name' | 'lastCheck'>> {
    const startTime = Date.now();
    
    try {
      // Testar conexão com Redis
      const testKey = 'healthcheck:' + Date.now();
      const testValue = 'test';
      
      await cache.set(testKey, testValue, 10); // 10 segundos TTL
      const retrievedValue = await cache.get(testKey);
      await cache.del(testKey);
      
      const responseTime = Date.now() - startTime;
      
      if (retrievedValue === testValue) {
        return {
          status: responseTime > 500 ? 'degraded' : 'healthy',
          responseTime,
          message: responseTime > 500 ? 'Cache responding slowly' : 'Cache connection healthy',
          critical: false,
          details: {
            connected: true,
            testPassed: true
          }
        };
      } else {
        return {
          status: 'degraded',
          responseTime,
          message: 'Cache test failed - data inconsistency',
          critical: false
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'Cache connection failed',
        error: error.message,
        critical: false,
        details: {
          fallbackToMemory: true
        }
      };
    }
  }

  private async checkFileSystem(): Promise<Omit<HealthCheckResult, 'name' | 'lastCheck'>> {
    const startTime = Date.now();
    
    try {
      const testDir = path.join(process.cwd(), 'temp');
      const testFile = path.join(testDir, 'healthcheck.txt');
      const testContent = 'healthcheck test';
      
      // Criar diretório se não existir
      try {
        await fs.mkdir(testDir, { recursive: true });
      } catch (error) {
        // Ignorar se já existir
      }
      
      // Testar escrita
      await fs.writeFile(testFile, testContent);
      
      // Testar leitura
      const readContent = await fs.readFile(testFile, 'utf8');
      
      // Limpar arquivo de teste
      await fs.unlink(testFile);
      
      const responseTime = Date.now() - startTime;
      
      if (readContent === testContent) {
        return {
          status: 'healthy',
          responseTime,
          message: 'File system read/write operations successful',
          critical: true,
          details: {
            testDir,
            canWrite: true,
            canRead: true
          }
        };
      } else {
        return {
          status: 'degraded',
          responseTime,
          message: 'File system data inconsistency detected',
          critical: true
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'File system operations failed',
        error: error.message,
        critical: true
      };
    }
  }

  private async checkMemory(): Promise<Omit<HealthCheckResult, 'name' | 'lastCheck'>> {
    const startTime = Date.now();
    
    try {
      const memUsage = process.memoryUsage();
      const totalMem = require('os').totalmem();
      const freeMem = require('os').freemem();
      const usedMem = totalMem - freeMem;
      const memPercentage = (usedMem / totalMem) * 100;
      
      const heapPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      let message = 'Memory usage within normal limits';
      
      if (memPercentage > 90 || heapPercentage > 90) {
        status = 'unhealthy';
        message = 'Critical memory usage detected';
      } else if (memPercentage > 80 || heapPercentage > 80) {
        status = 'degraded';
        message = 'High memory usage detected';
      }
      
      return {
        status,
        responseTime: Date.now() - startTime,
        message,
        critical: false,
        details: {
          heap: {
            used: Math.round(memUsage.heapUsed / 1024 / 1024),
            total: Math.round(memUsage.heapTotal / 1024 / 1024),
            percentage: Math.round(heapPercentage)
          },
          system: {
            used: Math.round(usedMem / 1024 / 1024),
            total: Math.round(totalMem / 1024 / 1024),
            free: Math.round(freeMem / 1024 / 1024),
            percentage: Math.round(memPercentage)
          }
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'Memory check failed',
        error: error.message,
        critical: false
      };
    }
  }

  private async checkCPU(): Promise<Omit<HealthCheckResult, 'name' | 'lastCheck'>> {
    const startTime = Date.now();
    
    try {
      const loadAvg = require('os').loadavg();
      const cpuCount = require('os').cpus().length;
      
      // Normalizar load average pelo número de CPUs
      const normalizedLoad = loadAvg[0] / cpuCount * 100;
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      let message = 'CPU usage within normal limits';
      
      if (normalizedLoad > 90) {
        status = 'unhealthy';
        message = 'Critical CPU usage detected';
      } else if (normalizedLoad > 70) {
        status = 'degraded';
        message = 'High CPU usage detected';
      }
      
      return {
        status,
        responseTime: Date.now() - startTime,
        message,
        critical: false,
        details: {
          loadAverage: loadAvg,
          cpuCount,
          normalizedLoad: Math.round(normalizedLoad),
          usage1min: Math.round(loadAvg[0] * 100) / 100,
          usage5min: Math.round(loadAvg[1] * 100) / 100,
          usage15min: Math.round(loadAvg[2] * 100) / 100
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'CPU check failed',
        error: error.message,
        critical: false
      };
    }
  }

  private async checkDiskSpace(): Promise<Omit<HealthCheckResult, 'name' | 'lastCheck'>> {
    const startTime = Date.now();
    
    try {
      const { stdout } = await execAsync('df -h /', { timeout: 5000 });
      const lines = stdout.trim().split('\n');
      const dataLine = lines[1]; // Segunda linha contém os dados
      const columns = dataLine.split(/\s+/);
      
      const total = columns[1];
      const used = columns[2];
      const available = columns[3];
      const percentage = parseInt(columns[4].replace('%', ''));
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      let message = 'Disk space within normal limits';
      
      if (percentage > 95) {
        status = 'unhealthy';
        message = 'Critical disk space - immediate action required';
      } else if (percentage > 85) {
        status = 'degraded';
        message = 'High disk usage detected';
      }
      
      return {
        status,
        responseTime: Date.now() - startTime,
        message,
        critical: true,
        details: {
          total,
          used,
          available,
          percentage,
          filesystem: columns[0]
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'Disk space check failed',
        error: error.message,
        critical: true
      };
    }
  }

  private async checkPerformance(): Promise<Omit<HealthCheckResult, 'name' | 'lastCheck'>> {
    const startTime = Date.now();
    
    try {
      const analytics = performanceAnalysisService.getPerformanceAnalytics({
        start: Date.now() - 300000, // Últimos 5 minutos
        end: Date.now()
      });
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      let message = 'Application performance within normal limits';
      
      if (analytics.summary.overallHealth === 'critical') {
        status = 'unhealthy';
        message = 'Critical performance issues detected';
      } else if (analytics.summary.overallHealth === 'degraded') {
        status = 'degraded';
        message = 'Performance degradation detected';
      }
      
      return {
        status,
        responseTime: Date.now() - startTime,
        message,
        critical: false,
        details: {
          overallHealth: analytics.summary.overallHealth,
          averageResponseTime: analytics.summary.averageResponseTime,
          errorRate: analytics.summary.errorRate,
          throughput: analytics.summary.throughput,
          recentAnomalies: analytics.recentAnomalies.length
        }
      };
    } catch (error) {
      return {
        status: 'degraded',
        responseTime: Date.now() - startTime,
        message: 'Performance check failed',
        error: error.message,
        critical: false
      };
    }
  }

  private async checkSecurity(): Promise<Omit<HealthCheckResult, 'name' | 'lastCheck'>> {
    const startTime = Date.now();
    
    try {
      // Verificações de segurança básicas
      const checks = {
        environment: process.env.NODE_ENV === 'production',
        httpsRedirect: true, // TODO: implementar verificação real
        securityHeaders: true, // TODO: implementar verificação real
        rateLimiting: true, // TODO: implementar verificação real
        authentication: true // TODO: implementar verificação real
      };
      
      const passedChecks = Object.values(checks).filter(Boolean).length;
      const totalChecks = Object.keys(checks).length;
      const percentage = (passedChecks / totalChecks) * 100;
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      let message = 'Security configuration optimal';
      
      if (percentage < 60) {
        status = 'unhealthy';
        message = 'Critical security issues detected';
      } else if (percentage < 80) {
        status = 'degraded';
        message = 'Security improvements needed';
      }
      
      return {
        status,
        responseTime: Date.now() - startTime,
        message,
        critical: true,
        details: {
          score: Math.round(percentage),
          checks,
          passedChecks,
          totalChecks
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'Security check failed',
        error: error.message,
        critical: true
      };
    }
  }

  // Métodos auxiliares

  private async executeCheck(name: string, config: HealthCheckConfig): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        config.check(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Check timeout')), config.timeout)
        )
      ]) as Omit<HealthCheckResult, 'name' | 'lastCheck'>;
      
      const finalResult: HealthCheckResult = {
        ...result,
        name,
        lastCheck: Date.now()
      };
      
      this.results.set(name, finalResult);
      this.emit('checkResult', finalResult);
      
      if (finalResult.status === 'unhealthy' && config.critical) {
        this.handleCriticalFailure(finalResult);
      }
      
      return finalResult;
    } catch (error) {
      const errorResult: HealthCheckResult = {
        name,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'Check execution failed',
        error: error.message,
        critical: config.critical,
        lastCheck: Date.now()
      };
      
      this.results.set(name, errorResult);
      this.emit('checkResult', errorResult);
      
      if (config.critical) {
        this.handleCriticalFailure(errorResult);
      }
      
      return errorResult;
    }
  }

  private handleCriticalFailure(result: HealthCheckResult): void {
    advancedLoggingService.error('Critical Health Check Failure', {
      checkName: result.name,
      status: result.status,
      message: result.message,
      error: result.error,
      responseTime: result.responseTime,
      component: 'HealthCheckService'
    });

    // Enviar notificação para falhas críticas
    notificationService.sendNotification({
      type: 'alert',
      priority: 'high',
      title: `Critical System Health Issue: ${result.name}`,
      message: result.message,
      channels: ['email'],
      metadata: { healthCheck: result }
    });

    this.emit('criticalFailure', result);
  }

  private startHealthMonitoring(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Iniciar verificações individuais
    for (const [name, config] of this.checks.entries()) {
      if (config.enabled) {
        this.startCheck(name);
      }
    }
    
    // Monitoramento geral a cada 5 minutos
    this.mainInterval = setInterval(() => {
      this.performPeriodicAnalysis();
    }, 300000);
    
    advancedLoggingService.info('Health Monitoring Started', {
      checksCount: this.checks.size,
      component: 'HealthCheckService'
    });
  }

  private startCheck(name: string): void {
    const config = this.checks.get(name);
    if (!config || !config.enabled) return;
    
    // Executar imediatamente
    this.executeCheck(name, config);
    
    // Agendar execuções periódicas
    const interval = setInterval(() => {
      this.executeCheck(name, config);
    }, config.interval);
    
    this.intervals.set(name, interval);
  }

  private stopCheck(name: string): void {
    const interval = this.intervals.get(name);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(name);
    }
  }

  private async runSyncChecks(): Promise<void> {
    // Executar algumas verificações síncronas se necessário
    const syncChecks = ['memory', 'cpu'];
    
    for (const checkName of syncChecks) {
      const config = this.checks.get(checkName);
      if (config && config.enabled) {
        await this.executeCheck(checkName, config);
      }
    }
  }

  private calculateHealthScore(checks: HealthCheckResult[]): number {
    if (checks.length === 0) return 0;
    
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const check of checks) {
      const weight = check.critical ? 2 : 1;
      let score = 0;
      
      switch (check.status) {
        case 'healthy':
          score = 100;
          break;
        case 'degraded':
          score = 60;
          break;
        case 'unhealthy':
          score = 0;
          break;
      }
      
      totalScore += score * weight;
      totalWeight += weight;
    }
    
    return Math.round(totalScore / totalWeight);
  }

  private determineOverallHealth(checks: HealthCheckResult[], score: number): 'healthy' | 'degraded' | 'unhealthy' {
    const criticalFailures = checks.filter(c => c.critical && c.status === 'unhealthy');
    
    if (criticalFailures.length > 0) {
      return 'unhealthy';
    }
    
    if (score < 70) {
      return 'unhealthy';
    } else if (score < 85) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  private getStatusMessage(overall: string, summary: any): string {
    switch (overall) {
      case 'healthy':
        return `All systems operational (${summary.healthy}/${summary.total} checks passing)`;
      case 'degraded':
        return `System degraded (${summary.unhealthy + summary.degraded}/${summary.total} issues detected)`;
      case 'unhealthy':
        return `System unhealthy (${summary.critical} critical issues require immediate attention)`;
      default:
        return 'Status unknown';
    }
  }

  private async collectResourceInfo(): Promise<SystemHealth['resources']> {
    const memUsage = process.memoryUsage();
    const os = require('os');
    
    try {
      // Disk info (simplified)
      const { stdout } = await execAsync('df -h / | tail -1', { timeout: 3000 });
      const diskData = stdout.trim().split(/\s+/);
      const diskUsed = parseInt(diskData[4]?.replace('%', '')) || 0;
      
      return {
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024),
          total: Math.round(memUsage.heapTotal / 1024 / 1024),
          percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
        },
        cpu: {
          usage: Math.round((os.loadavg()[0] / os.cpus().length) * 100),
          loadAverage: os.loadavg()
        },
        disk: {
          used: diskUsed,
          total: 100,
          percentage: diskUsed
        },
        network: {
          connections: 0, // TODO: implementar contagem de conexões
          throughput: 0   // TODO: implementar medição de throughput
        }
      };
    } catch (error) {
      return {
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024),
          total: Math.round(memUsage.heapTotal / 1024 / 1024),
          percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
        },
        cpu: {
          usage: Math.round((os.loadavg()[0] / os.cpus().length) * 100),
          loadAverage: os.loadavg()
        },
        disk: {
          used: 0,
          total: 0,
          percentage: 0
        },
        network: {
          connections: 0,
          throughput: 0
        }
      };
    }
  }

  private createUnknownResult(name: string): HealthCheckResult {
    return {
      name,
      status: 'degraded',
      responseTime: 0,
      message: 'Check not available',
      critical: false,
      lastCheck: 0
    };
  }

  private collectRecentAlerts(checks: HealthCheckResult[]): SystemHealth['alerts'] {
    const alerts: SystemHealth['alerts'] = [];
    
    for (const check of checks) {
      if (check.status === 'unhealthy') {
        alerts.push({
          level: check.critical ? 'critical' : 'warning',
          message: check.message,
          timestamp: check.lastCheck,
          service: check.name
        });
      }
    }
    
    return alerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  private async performPeriodicAnalysis(): Promise<void> {
    try {
      const health = await this.getSystemHealth();
      
      if (health.overall === 'unhealthy') {
        advancedLoggingService.error('System Health Critical', {
          score: health.score,
          criticalIssues: health.summary.critical,
          component: 'HealthCheckService'
        });
      }
      
      this.emit('healthAnalysis', health);
    } catch (error) {
      advancedLoggingService.error('Health analysis failed', {
        error: error.message,
        component: 'HealthCheckService'
      });
    }
  }

  // Cleanup
  destroy(): void {
    this.isRunning = false;
    
    // Parar todas as verificações
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
    
    if (this.mainInterval) {
      clearInterval(this.mainInterval);
    }
    
    advancedLoggingService.info('HealthCheck Service Destroyed', {
      component: 'HealthCheckService'
    });
  }
}

const healthCheckService = new HealthCheckService();
export default healthCheckService;