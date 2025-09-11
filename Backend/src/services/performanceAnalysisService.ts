import { EventEmitter } from 'events';
import advancedLoggingService from './advancedLoggingService';
import notificationService from './notificationService';
import metricsService from './metricsService';

/**
 * Serviço de Análise de Performance em Tempo Real
 * Sistema avançado para monitoramento, análise e otimização de performance
 */

export interface PerformanceMetric {
  id: string;
  timestamp: number;
  metric: string;
  value: number;
  unit: string;
  context?: {
    endpoint?: string;
    method?: string;
    userId?: string;
    requestId?: string;
    component?: string;
    database?: string;
    query?: string;
  };
  severity: 'normal' | 'warning' | 'critical';
  threshold?: {
    warning: number;
    critical: number;
  };
}

export interface PerformanceProfile {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  averageResponseTime: number;
  medianResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughputPerSecond: number;
  errorRate: number;
  memoryUsageAvg: number;
  cpuUsageAvg: number;
  databaseQueryCount: number;
  cacheHitRate: number;
  samples: number;
  firstSeen: number;
  lastUpdated: number;
}

export interface PerformanceAnomaly {
  id: string;
  timestamp: number;
  type: 'response_time' | 'memory_usage' | 'cpu_usage' | 'error_rate' | 'throughput' | 'database_slow_query';
  severity: 'warning' | 'critical';
  endpoint?: string;
  metric: string;
  currentValue: number;
  expectedValue: number;
  deviation: number;
  impact: 'low' | 'medium' | 'high';
  suggestion: string;
  affectedUsers?: number;
  context?: Record<string, any>;
}

export interface PerformanceAnalytics {
  summary: {
    overallHealth: 'excellent' | 'good' | 'degraded' | 'critical';
    averageResponseTime: number;
    totalRequests: number;
    errorRate: number;
    throughput: number;
    activeConnections: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  trends: {
    responseTimeTrend: 'improving' | 'stable' | 'degrading';
    errorRateTrend: 'improving' | 'stable' | 'degrading';
    throughputTrend: 'increasing' | 'stable' | 'decreasing';
    memoryTrend: 'stable' | 'increasing' | 'decreasing';
  };
  topEndpoints: Array<{
    endpoint: string;
    method: string;
    avgResponseTime: number;
    requests: number;
    errorRate: number;
  }>;
  slowestEndpoints: Array<{
    endpoint: string;
    method: string;
    avgResponseTime: number;
    p95: number;
    samples: number;
  }>;
  recentAnomalies: PerformanceAnomaly[];
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: 'caching' | 'database' | 'code' | 'infrastructure';
    title: string;
    description: string;
    estimatedImpact: string;
  }>;
}

class PerformanceAnalysisService extends EventEmitter {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private profiles: Map<string, PerformanceProfile> = new Map();
  private anomalies: PerformanceAnomaly[] = [];
  private maxMetricsPerKey = 1000;
  private maxAnomalies = 500;
  private analysisInterval: NodeJS.Timeout | null = null;
  private thresholds = {
    responseTime: { warning: 1000, critical: 3000 },
    errorRate: { warning: 5, critical: 10 },
    memoryUsage: { warning: 80, critical: 90 },
    cpuUsage: { warning: 70, critical: 90 },
    dbQueryTime: { warning: 500, critical: 2000 }
  };

  constructor() {
    super();
    this.startRealTimeAnalysis();
    this.setupMetricsCollection();
    
    advancedLoggingService.info('Performance Analysis Service Initialized', {
      component: 'PerformanceAnalysisService'
    });
  }

  // Coletar métrica de performance
  recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp' | 'severity'>): void {
    const performanceMetric: PerformanceMetric = {
      id: this.generateMetricId(),
      timestamp: Date.now(),
      severity: this.calculateSeverity(metric.metric, metric.value),
      ...metric
    };

    // Armazenar métrica
    const key = `${metric.metric}:${metric.context?.endpoint || 'global'}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const metricArray = this.metrics.get(key)!;
    metricArray.push(performanceMetric);

    // Manter limite de métricas
    if (metricArray.length > this.maxMetricsPerKey) {
      metricArray.shift();
    }

    // Atualizar perfil de performance se for endpoint
    if (metric.context?.endpoint) {
      this.updatePerformanceProfile(performanceMetric);
    }

    // Detectar anomalias
    this.detectAnomalies(performanceMetric);

    // Emitir evento para outros sistemas
    this.emit('metric', performanceMetric);

    // Log crítico
    if (performanceMetric.severity === 'critical') {
      advancedLoggingService.error('Critical Performance Issue Detected', {
        metric: metric.metric,
        value: metric.value,
        endpoint: metric.context?.endpoint,
        component: 'PerformanceAnalysisService'
      });
    }
  }

  // Métodos de conveniência para métricas comuns
  recordResponseTime(endpoint: string, method: string, duration: number, context?: Record<string, any>): void {
    this.recordMetric({
      metric: 'response_time',
      value: duration,
      unit: 'ms',
      context: { endpoint, method, ...context },
      threshold: this.thresholds.responseTime
    });
  }

  recordMemoryUsage(usage: number, context?: Record<string, any>): void {
    this.recordMetric({
      metric: 'memory_usage',
      value: usage,
      unit: '%',
      context,
      threshold: this.thresholds.memoryUsage
    });
  }

  recordCpuUsage(usage: number, context?: Record<string, any>): void {
    this.recordMetric({
      metric: 'cpu_usage',
      value: usage,
      unit: '%',
      context,
      threshold: this.thresholds.cpuUsage
    });
  }

  recordDatabaseQuery(query: string, duration: number, context?: Record<string, any>): void {
    this.recordMetric({
      metric: 'db_query_time',
      value: duration,
      unit: 'ms',
      context: { query, ...context },
      threshold: this.thresholds.dbQueryTime
    });
  }

  recordErrorRate(endpoint: string, rate: number, context?: Record<string, any>): void {
    this.recordMetric({
      metric: 'error_rate',
      value: rate,
      unit: '%',
      context: { endpoint, ...context },
      threshold: this.thresholds.errorRate
    });
  }

  // Obter análise completa de performance
  getPerformanceAnalytics(timeRange?: { start: number; end: number }): PerformanceAnalytics {
    const now = Date.now();
    const range = timeRange || {
      start: now - 3600000, // Última hora
      end: now
    };

    const metricsInRange = this.getMetricsInTimeRange(range);
    const profilesArray = Array.from(this.profiles.values());

    return {
      summary: this.calculateSummary(metricsInRange),
      trends: this.analyzeTrends(metricsInRange),
      topEndpoints: this.getTopEndpoints(profilesArray),
      slowestEndpoints: this.getSlowestEndpoints(profilesArray),
      recentAnomalies: this.getRecentAnomalies(range),
      recommendations: this.generateRecommendations(metricsInRange, profilesArray)
    };
  }

  // Obter perfis de performance dos endpoints
  getPerformanceProfiles(): PerformanceProfile[] {
    return Array.from(this.profiles.values()).sort((a, b) => b.lastUpdated - a.lastUpdated);
  }

  // Obter anomalias recentes
  getAnomalies(limit: number = 50): PerformanceAnomaly[] {
    return this.anomalies.slice(0, limit).sort((a, b) => b.timestamp - a.timestamp);
  }

  // Buscar métricas com filtros
  searchMetrics(filters: {
    metric?: string;
    endpoint?: string;
    severity?: 'normal' | 'warning' | 'critical';
    timeRange?: { start: number; end: number };
    limit?: number;
  }): PerformanceMetric[] {
    let allMetrics: PerformanceMetric[] = [];

    for (const metricArray of this.metrics.values()) {
      allMetrics = allMetrics.concat(metricArray);
    }

    let filtered = allMetrics;

    if (filters.metric) {
      filtered = filtered.filter(m => m.metric === filters.metric);
    }

    if (filters.endpoint) {
      filtered = filtered.filter(m => m.context?.endpoint === filters.endpoint);
    }

    if (filters.severity) {
      filtered = filtered.filter(m => m.severity === filters.severity);
    }

    if (filters.timeRange) {
      filtered = filtered.filter(m => 
        m.timestamp >= filters.timeRange!.start && m.timestamp <= filters.timeRange!.end
      );
    }

    // Ordenar por timestamp (mais recentes primeiro)
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    return filtered.slice(0, filters.limit || 100);
  }

  // Análise de performance de endpoints específicos
  analyzeEndpoint(endpoint: string, method: string): {
    profile: PerformanceProfile | null;
    recentMetrics: PerformanceMetric[];
    anomalies: PerformanceAnomaly[];
    recommendations: string[];
  } {
    const profileKey = `${method}:${endpoint}`;
    const profile = this.profiles.get(profileKey) || null;
    
    const recentMetrics = this.searchMetrics({
      endpoint,
      timeRange: { start: Date.now() - 3600000, end: Date.now() },
      limit: 100
    });

    const endpointAnomalies = this.anomalies.filter(a => a.endpoint === endpoint);

    const recommendations = this.generateEndpointRecommendations(profile, recentMetrics);

    return {
      profile,
      recentMetrics,
      anomalies: endpointAnomalies,
      recommendations
    };
  }

  // Métodos privados

  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateSeverity(metric: string, value: number): 'normal' | 'warning' | 'critical' {
    const thresholds = this.thresholds[metric as keyof typeof this.thresholds];
    if (!thresholds) return 'normal';

    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'normal';
  }

  private updatePerformanceProfile(metric: PerformanceMetric): void {
    if (!metric.context?.endpoint || !metric.context?.method) return;

    const key = `${metric.context.method}:${metric.context.endpoint}`;
    let profile = this.profiles.get(key);

    if (!profile) {
      profile = {
        id: key,
        name: `${metric.context.method} ${metric.context.endpoint}`,
        endpoint: metric.context.endpoint,
        method: metric.context.method,
        averageResponseTime: 0,
        medianResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        throughputPerSecond: 0,
        errorRate: 0,
        memoryUsageAvg: 0,
        cpuUsageAvg: 0,
        databaseQueryCount: 0,
        cacheHitRate: 0,
        samples: 0,
        firstSeen: metric.timestamp,
        lastUpdated: metric.timestamp
      };
    }

    // Atualizar estatísticas baseado no tipo de métrica
    this.updateProfileStats(profile, metric);
    profile.lastUpdated = metric.timestamp;
    
    this.profiles.set(key, profile);
  }

  private updateProfileStats(profile: PerformanceProfile, metric: PerformanceMetric): void {
    const endpointMetrics = this.searchMetrics({
      endpoint: profile.endpoint,
      timeRange: { start: Date.now() - 3600000, end: Date.now() }
    });

    const responseTimes = endpointMetrics
      .filter(m => m.metric === 'response_time')
      .map(m => m.value)
      .sort((a, b) => a - b);

    if (responseTimes.length > 0) {
      profile.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      profile.medianResponseTime = this.calculatePercentile(responseTimes, 50);
      profile.p95ResponseTime = this.calculatePercentile(responseTimes, 95);
      profile.p99ResponseTime = this.calculatePercentile(responseTimes, 99);
    }

    const errorRates = endpointMetrics.filter(m => m.metric === 'error_rate');
    if (errorRates.length > 0) {
      profile.errorRate = errorRates[errorRates.length - 1].value;
    }

    profile.samples = endpointMetrics.length;
  }

  private calculatePercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
  }

  private detectAnomalies(metric: PerformanceMetric): void {
    // Detectar anomalias usando análise estatística simples
    const historicalData = this.getHistoricalData(metric.metric, metric.context?.endpoint);
    
    if (historicalData.length < 10) return; // Dados insuficientes

    const mean = historicalData.reduce((a, b) => a + b, 0) / historicalData.length;
    const variance = historicalData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / historicalData.length;
    const stdDev = Math.sqrt(variance);

    const deviation = Math.abs(metric.value - mean);
    const zScore = deviation / stdDev;

    // Detectar anomalia se z-score > 2 (aprox. 95% de confiança)
    if (zScore > 2) {
      const anomaly: PerformanceAnomaly = {
        id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: metric.timestamp,
        type: metric.metric as any,
        severity: zScore > 3 ? 'critical' : 'warning',
        endpoint: metric.context?.endpoint,
        metric: metric.metric,
        currentValue: metric.value,
        expectedValue: mean,
        deviation: zScore,
        impact: this.calculateImpact(metric.metric, zScore),
        suggestion: this.generateSuggestion(metric.metric, metric.value, mean),
        context: metric.context
      };

      this.addAnomaly(anomaly);
    }
  }

  private getHistoricalData(metricType: string, endpoint?: string): number[] {
    const key = `${metricType}:${endpoint || 'global'}`;
    const metrics = this.metrics.get(key) || [];
    return metrics.map(m => m.value);
  }

  private calculateImpact(metricType: string, zScore: number): 'low' | 'medium' | 'high' {
    if (zScore > 4) return 'high';
    if (zScore > 3) return 'medium';
    return 'low';
  }

  private generateSuggestion(metricType: string, currentValue: number, expectedValue: number): string {
    const suggestions = {
      response_time: currentValue > expectedValue ? 
        'Considere implementar cache, otimizar queries do banco ou revisar lógica do endpoint' :
        'Performance melhorou significativamente',
      memory_usage: currentValue > expectedValue ?
        'Verificar vazamentos de memória e otimizar uso de objetos grandes' :
        'Uso de memória otimizado',
      cpu_usage: currentValue > expectedValue ?
        'Analisar processos intensivos de CPU e considerar otimizações de algoritmo' :
        'Uso de CPU otimizado',
      error_rate: currentValue > expectedValue ?
        'Investigar causas dos erros e implementar tratamento adequado' :
        'Taxa de erro normalizada'
    };

    return suggestions[metricType as keyof typeof suggestions] || 'Monitorar comportamento';
  }

  private addAnomaly(anomaly: PerformanceAnomaly): void {
    this.anomalies.unshift(anomaly);

    // Manter limite de anomalias
    if (this.anomalies.length > this.maxAnomalies) {
      this.anomalies = this.anomalies.slice(0, this.maxAnomalies);
    }

    // Enviar notificação para anomalias críticas
    if (anomaly.severity === 'critical') {
      notificationService.sendNotification({
        type: 'error',
        category: 'system',
        priority: 'high',
        title: 'Performance Anomaly Detected',
        message: `Critical performance issue detected: ${anomaly.metric} = ${anomaly.currentValue} (expected: ${anomaly.expectedValue})`,
        channels: [{ type: 'email', enabled: true }],
        persistent: true,
        data: { anomaly }
      });
    }

    this.emit('anomaly', anomaly);

    advancedLoggingService.warn('Performance Anomaly Detected', {
      anomalyId: anomaly.id,
      type: anomaly.type,
      severity: anomaly.severity,
      endpoint: anomaly.endpoint,
      metric: anomaly.metric,
      deviation: anomaly.deviation,
      component: 'PerformanceAnalysisService'
    });
  }

  private startRealTimeAnalysis(): void {
    // Análise a cada 30 segundos
    this.analysisInterval = setInterval(() => {
      this.performPeriodicAnalysis();
    }, 30000);
  }

  private performPeriodicAnalysis(): void {
    // Análise periódica de tendências e saúde geral
    const analytics = this.getPerformanceAnalytics();
    
    if (analytics.summary.overallHealth === 'critical') {
      advancedLoggingService.error('System Performance Critical', {
        responseTime: analytics.summary.averageResponseTime,
        errorRate: analytics.summary.errorRate,
        memoryUsage: analytics.summary.memoryUsage,
        component: 'PerformanceAnalysisService'
      });
    }

    this.emit('analysis', analytics);
  }

  private setupMetricsCollection(): void {
    // Coletar métricas do sistema a cada 10 segundos
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      this.recordMemoryUsage(
        (memUsage.heapUsed / memUsage.heapTotal) * 100,
        { component: 'system' }
      );

      // CPU usage como porcentagem (aproximação)
      const cpuPercent = ((cpuUsage.user + cpuUsage.system) / 1000000) / 10 * 100;
      this.recordCpuUsage(Math.min(cpuPercent, 100), { component: 'system' });
    }, 10000);
  }

  // Implementações dos métodos de análise (continuação...)
  private getMetricsInTimeRange(range: { start: number; end: number }): PerformanceMetric[] {
    return this.searchMetrics({ timeRange: range, limit: 10000 });
  }

  private calculateSummary(metrics: PerformanceMetric[]): PerformanceAnalytics['summary'] {
    const responseTimes = metrics.filter(m => m.metric === 'response_time');
    const errorRates = metrics.filter(m => m.metric === 'error_rate');
    const memoryUsage = metrics.filter(m => m.metric === 'memory_usage');
    const cpuUsage = metrics.filter(m => m.metric === 'cpu_usage');

    const avgResponseTime = responseTimes.length > 0 ?
      responseTimes.reduce((a, b) => a + b.value, 0) / responseTimes.length : 0;

    const avgErrorRate = errorRates.length > 0 ?
      errorRates.reduce((a, b) => a + b.value, 0) / errorRates.length : 0;

    const avgMemory = memoryUsage.length > 0 ?
      memoryUsage.reduce((a, b) => a + b.value, 0) / memoryUsage.length : 0;

    const avgCpu = cpuUsage.length > 0 ?
      cpuUsage.reduce((a, b) => a + b.value, 0) / cpuUsage.length : 0;

    const overallHealth = this.calculateOverallHealth(avgResponseTime, avgErrorRate, avgMemory, avgCpu);

    return {
      overallHealth,
      averageResponseTime: avgResponseTime,
      totalRequests: responseTimes.length,
      errorRate: avgErrorRate,
      throughput: responseTimes.length > 0 ? responseTimes.length / 3600 : 0, // requests por hora
      activeConnections: 0, // TODO: implementar coleta de conexões ativas
      memoryUsage: avgMemory,
      cpuUsage: avgCpu
    };
  }

  private calculateOverallHealth(responseTime: number, errorRate: number, memory: number, cpu: number): 'excellent' | 'good' | 'degraded' | 'critical' {
    if (responseTime > 3000 || errorRate > 10 || memory > 90 || cpu > 90) return 'critical';
    if (responseTime > 1500 || errorRate > 5 || memory > 80 || cpu > 70) return 'degraded';
    if (responseTime > 800 || errorRate > 2 || memory > 60 || cpu > 50) return 'good';
    return 'excellent';
  }

  private analyzeTrends(metrics: PerformanceMetric[]): PerformanceAnalytics['trends'] {
    // Análise simplificada de tendências
    return {
      responseTimeTrend: 'stable',
      errorRateTrend: 'stable',
      throughputTrend: 'stable',
      memoryTrend: 'stable'
    };
  }

  private getTopEndpoints(profiles: PerformanceProfile[]): PerformanceAnalytics['topEndpoints'] {
    return profiles
      .sort((a, b) => b.samples - a.samples)
      .slice(0, 10)
      .map(p => ({
        endpoint: p.endpoint,
        method: p.method,
        avgResponseTime: p.averageResponseTime,
        requests: p.samples,
        errorRate: p.errorRate
      }));
  }

  private getSlowestEndpoints(profiles: PerformanceProfile[]): PerformanceAnalytics['slowestEndpoints'] {
    return profiles
      .sort((a, b) => b.averageResponseTime - a.averageResponseTime)
      .slice(0, 10)
      .map(p => ({
        endpoint: p.endpoint,
        method: p.method,
        avgResponseTime: p.averageResponseTime,
        p95: p.p95ResponseTime,
        samples: p.samples
      }));
  }

  private getRecentAnomalies(range: { start: number; end: number }): PerformanceAnomaly[] {
    return this.anomalies.filter(a => a.timestamp >= range.start && a.timestamp <= range.end);
  }

  private generateRecommendations(metrics: PerformanceMetric[], profiles: PerformanceProfile[]): PerformanceAnalytics['recommendations'] {
    const recommendations = [];

    // Verificar endpoints lentos
    const slowEndpoints = profiles.filter(p => p.averageResponseTime > 1000);
    if (slowEndpoints.length > 0) {
      recommendations.push({
        priority: 'high' as const,
        category: 'code' as const,
        title: 'Optimize Slow Endpoints',
        description: `${slowEndpoints.length} endpoints have average response time > 1s`,
        estimatedImpact: 'Significant improvement in user experience'
      });
    }

    // Verificar alta taxa de erro
    const errorEndpoints = profiles.filter(p => p.errorRate > 5);
    if (errorEndpoints.length > 0) {
      recommendations.push({
        priority: 'high' as const,
        category: 'code' as const,
        title: 'Fix High Error Rate Endpoints',
        description: `${errorEndpoints.length} endpoints have error rate > 5%`,
        estimatedImpact: 'Improved system reliability'
      });
    }

    // Verificar uso de memória
    const highMemoryMetrics = metrics.filter(m => m.metric === 'memory_usage' && m.value > 80);
    if (highMemoryMetrics.length > metrics.filter(m => m.metric === 'memory_usage').length * 0.5) {
      recommendations.push({
        priority: 'medium' as const,
        category: 'infrastructure' as const,
        title: 'Monitor Memory Usage',
        description: 'Memory usage frequently exceeds 80%',
        estimatedImpact: 'Better system stability'
      });
    }

    return recommendations;
  }

  private generateEndpointRecommendations(profile: PerformanceProfile | null, metrics: PerformanceMetric[]): string[] {
    const recommendations = [];

    if (profile && profile.averageResponseTime > 1000) {
      recommendations.push('Consider implementing caching for this endpoint');
      recommendations.push('Review database queries for optimization opportunities');
      recommendations.push('Analyze business logic complexity');
    }

    if (profile && profile.errorRate > 5) {
      recommendations.push('Implement better error handling');
      recommendations.push('Add input validation and sanitization');
      recommendations.push('Review external service dependencies');
    }

    const recentErrors = metrics.filter(m => m.metric === 'error_rate' && m.value > 0);
    if (recentErrors.length > 0) {
      recommendations.push('Monitor error logs for patterns');
    }

    return recommendations;
  }

  // Cleanup
  destroy(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }
    
    advancedLoggingService.info('Performance Analysis Service Destroyed', {
      component: 'PerformanceAnalysisService'
    });
  }
}

const performanceAnalysisService = new PerformanceAnalysisService();
export default performanceAnalysisService;