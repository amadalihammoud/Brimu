import metricsService from '../../../services/metricsService';
import { testUtils } from '../../setup';

/**
 * Testes Unitários - Serviço de Métricas
 * Testa funcionalidades do sistema de monitoramento e métricas
 */

describe('MetricsService - Testes Unitários', () => {
  beforeEach(() => {
    // Resetar estado do serviço para cada teste
    metricsService['metrics'] = [];
    metricsService['requestCount'] = 0;
    metricsService['errorCount'] = 0;
    metricsService['responseTimeSum'] = 0;
    metricsService['cacheHits'] = 0;
    metricsService['cacheMisses'] = 0;
  });

  describe('recordMetric', () => {
    it('deve registrar métrica de performance corretamente', () => {
      const metricData = {
        endpoint: '/api/users',
        method: 'GET',
        duration: 250,
        statusCode: 200
      };

      metricsService.recordMetric(metricData);

      const systemMetrics = metricsService.getSystemMetrics();
      
      expect(systemMetrics.requestsPerMinute).toBeGreaterThan(0);
      expect(systemMetrics.avgResponseTime).toBe(250);
      expect(systemMetrics.errorRate).toBe(0);
    });

    it('deve calcular taxa de erro corretamente', () => {
      // Registrar requisições com sucesso
      metricsService.recordMetric({
        endpoint: '/api/users',
        method: 'GET',
        duration: 200,
        statusCode: 200
      });

      metricsService.recordMetric({
        endpoint: '/api/users',
        method: 'GET',
        duration: 180,
        statusCode: 200
      });

      // Registrar requisição com erro
      metricsService.recordMetric({
        endpoint: '/api/users',
        method: 'GET',
        duration: 150,
        statusCode: 500
      });

      const systemMetrics = metricsService.getSystemMetrics();
      
      expect(systemMetrics.errorRate).toBeCloseTo(33.33, 1); // 1 erro em 3 requisições
      expect(systemMetrics.avgResponseTime).toBeCloseTo(176.67, 1);
    });

    it('deve manter apenas 1000 métricas em memória', () => {
      // Registrar mais de 1000 métricas
      for (let i = 0; i < 1200; i++) {
        metricsService.recordMetric({
          endpoint: `/api/test/${i}`,
          method: 'GET',
          duration: 100 + i,
          statusCode: 200
        });
      }

      // Verificar se apenas 1000 foram mantidas
      const metrics = metricsService['metrics'];
      expect(metrics.length).toBe(1000);

      // Verificar se as mais recentes foram mantidas
      const lastMetric = metrics[metrics.length - 1];
      expect(lastMetric.endpoint).toBe('/api/test/1199');
    });
  });

  describe('Cache Metrics', () => {
    it('deve registrar hits de cache corretamente', () => {
      metricsService.recordCacheHit();
      metricsService.recordCacheHit();
      metricsService.recordCacheMiss();

      const systemMetrics = metricsService.getSystemMetrics();
      
      expect(systemMetrics.cacheHitRate).toBeCloseTo(66.67, 1); // 2 hits, 1 miss
    });

    it('deve lidar com caso de nenhum acesso ao cache', () => {
      const systemMetrics = metricsService.getSystemMetrics();
      
      expect(systemMetrics.cacheHitRate).toBe(0);
    });
  });

  describe('getSystemMetrics', () => {
    it('deve retornar métricas de sistema completas', () => {
      const metrics = metricsService.getSystemMetrics();

      testUtils.expectToHaveProperties(metrics, [
        'timestamp',
        'uptime',
        'memory',
        'cpu',
        'activeConnections',
        'cacheHitRate',
        'avgResponseTime',
        'errorRate',
        'requestsPerMinute'
      ]);

      expect(typeof metrics.timestamp).toBe('number');
      expect(typeof metrics.uptime).toBe('number');
      expect(typeof metrics.memory).toBe('object');
      expect(typeof metrics.avgResponseTime).toBe('number');
    });

    it('deve incluir métricas de memória válidas', () => {
      const metrics = metricsService.getSystemMetrics();

      expect(metrics.memory).toHaveProperty('heapUsed');
      expect(metrics.memory).toHaveProperty('heapTotal');
      expect(metrics.memory).toHaveProperty('external');
      expect(metrics.memory.heapUsed).toBeGreaterThan(0);
      expect(metrics.memory.heapTotal).toBeGreaterThan(metrics.memory.heapUsed);
    });
  });

  describe('getAggregatedMetrics', () => {
    beforeEach(() => {
      // Registrar algumas métricas de teste
      const baseTime = Date.now();
      
      // Métricas dentro da última hora
      for (let i = 0; i < 10; i++) {
        metricsService['metrics'].push({
          endpoint: '/api/test',
          method: 'GET',
          duration: 100 + (i * 10),
          statusCode: i < 8 ? 200 : 500, // 2 erros
          timestamp: baseTime - (i * 5 * 60 * 1000), // 5 min intervals
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage()
        });
      }
    });

    it('deve agregar métricas por período de 1 hora', () => {
      const aggregated = metricsService.getAggregatedMetrics('1h');

      expect(aggregated).toHaveProperty('period', '1h');
      expect(aggregated).toHaveProperty('totalRequests');
      expect(aggregated).toHaveProperty('averageResponseTime');
      expect(aggregated).toHaveProperty('errorRate');
      expect(aggregated).toHaveProperty('topEndpoints');
      expect(aggregated).toHaveProperty('statusCodeDistribution');

      expect(aggregated.totalRequests).toBe(10);
      expect(aggregated.errorRate).toBeCloseTo(20, 0); // 2 erros em 10
    });

    it('deve calcular top endpoints corretamente', () => {
      // Adicionar diferentes endpoints
      const endpoints = ['/api/users', '/api/orders', '/api/users', '/api/services'];
      endpoints.forEach((endpoint, index) => {
        metricsService['metrics'].push({
          endpoint,
          method: 'GET',
          duration: 100,
          statusCode: 200,
          timestamp: Date.now() - (index * 1000),
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage()
        });
      });

      const aggregated = metricsService.getAggregatedMetrics('1h');
      
      expect(aggregated.topEndpoints).toBeDefined();
      expect(aggregated.topEndpoints.length).toBeGreaterThan(0);
      
      // /api/users deve estar no topo (aparece 2 vezes)
      const topEndpoint = aggregated.topEndpoints[0];
      expect(topEndpoint.endpoint).toContain('/api/users');
    });

    it('deve lidar com período vazio', () => {
      // Limpar métricas
      metricsService['metrics'] = [];
      
      const aggregated = metricsService.getAggregatedMetrics('1h');
      
      expect(aggregated.totalRequests).toBe(0);
      expect(aggregated.averageResponseTime).toBe(0);
      expect(aggregated.errorRate).toBe(0);
      expect(aggregated.topEndpoints).toHaveLength(0);
    });
  });

  describe('Alert System Integration', () => {
    it('deve disparar alertas quando thresholds forem excedidos', (done) => {
      // Escutar evento de alerta
      metricsService.once('alerts', (alerts) => {
        expect(Array.isArray(alerts)).toBe(true);
        done();
      });

      // Simular alto tempo de resposta
      for (let i = 0; i < 10; i++) {
        metricsService.recordMetric({
          endpoint: '/api/slow',
          method: 'GET',
          duration: 2500, // Acima do threshold de 1000ms
          statusCode: 200
        });
      }

      // Obter métricas para disparar verificação de alertas
      metricsService.getSystemMetrics();
    });
  });

  describe('Performance Tests', () => {
    it('deve processar grande volume de métricas eficientemente', () => {
      const startTime = Date.now();
      const metricsCount = 10000;

      // Registrar muitas métricas
      for (let i = 0; i < metricsCount; i++) {
        metricsService.recordMetric({
          endpoint: `/api/endpoint${i % 100}`, // 100 endpoints diferentes
          method: i % 2 === 0 ? 'GET' : 'POST',
          duration: Math.random() * 1000,
          statusCode: Math.random() > 0.1 ? 200 : 500
        });
      }

      const processingTime = Date.now() - startTime;

      // Deve processar rapidamente (menos de 1 segundo para 10k métricas)
      expect(processingTime).toBeLessThan(1000);

      // Verificar se métricas foram mantidas corretamente (apenas últimas 1000)
      const metrics = metricsService['metrics'];
      expect(metrics.length).toBe(1000);
    });

    it('deve calcular agregações rapidamente mesmo com muitos dados', () => {
      // Registrar métricas espalhadas por diferentes períodos
      const now = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        metricsService['metrics'].push({
          endpoint: `/api/test${i % 10}`,
          method: 'GET',
          duration: Math.random() * 500,
          statusCode: Math.random() > 0.05 ? 200 : 500,
          timestamp: now - (Math.random() * 7 * 24 * 60 * 60 * 1000), // Últimos 7 dias
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage()
        });
      }

      const startTime = Date.now();
      
      // Testar diferentes períodos
      metricsService.getAggregatedMetrics('1h');
      metricsService.getAggregatedMetrics('24h');
      metricsService.getAggregatedMetrics('7d');
      
      const aggregationTime = Date.now() - startTime;

      // Agregações devem ser rápidas (menos de 100ms para 1000 métricas)
      expect(aggregationTime).toBeLessThan(100);
    });
  });

  describe('Memory Management', () => {
    it('não deve causar vazamento de memória', () => {
      const initialHeapUsed = process.memoryUsage().heapUsed;

      // Simular uso intensivo
      for (let cycle = 0; cycle < 100; cycle++) {
        for (let i = 0; i < 100; i++) {
          metricsService.recordMetric({
            endpoint: `/api/test${i}`,
            method: 'GET',
            duration: Math.random() * 1000,
            statusCode: 200
          });
        }

        // Forçar garbage collection se disponível
        if (global.gc) {
          global.gc();
        }
      }

      const finalHeapUsed = process.memoryUsage().heapUsed;
      const memoryIncrease = finalHeapUsed - initialHeapUsed;

      // Aumento de memória deve ser razoável (menos de 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Edge Cases', () => {
    it('deve lidar com valores extremos', () => {
      // Testar com duração muito alta
      metricsService.recordMetric({
        endpoint: '/api/extreme',
        method: 'GET',
        duration: Number.MAX_SAFE_INTEGER,
        statusCode: 200
      });

      // Testar com duração zero
      metricsService.recordMetric({
        endpoint: '/api/instant',
        method: 'GET',
        duration: 0,
        statusCode: 200
      });

      // Testar com status code inválido
      metricsService.recordMetric({
        endpoint: '/api/invalid',
        method: 'GET',
        duration: 100,
        statusCode: 999
      });

      const metrics = metricsService.getSystemMetrics();
      
      // Sistema deve continuar funcionando
      expect(typeof metrics.avgResponseTime).toBe('number');
      expect(metrics.avgResponseTime).toBeGreaterThanOrEqual(0);
    });

    it('deve lidar com strings muito longas', () => {
      const longEndpoint = '/api/' + 'a'.repeat(10000);
      
      metricsService.recordMetric({
        endpoint: longEndpoint,
        method: 'GET',
        duration: 100,
        statusCode: 200
      });

      const aggregated = metricsService.getAggregatedMetrics('1h');
      
      // Sistema deve processar sem erros
      expect(aggregated.totalRequests).toBe(1);
    });
  });
});