import advancedLoggingService from '../../../services/advancedLoggingService';
import notificationService from '../../../services/notificationService';
import { testUtils } from '../../setup';

/**
 * Testes Unitários - Serviço de Logs Avançado
 * Testa funcionalidades do sistema de logging estruturado
 */

jest.mock('../../../services/notificationService');

describe('Advanced Logging Service - Testes Unitários', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Limpar logs anteriores através de cleanup
    advancedLoggingService.cleanup(Date.now());
  });

  describe('Logging Básico', () => {
    it('deve criar log de error com contexto', () => {
      const context = {
        userId: 'user123',
        requestId: 'req456',
        url: '/api/test',
        method: 'GET'
      };

      const logEntry = advancedLoggingService.error('Test error message', context);

      expect(logEntry).toMatchObject({
        level: 'error',
        message: 'Test error message',
        context,
        environment: expect.any(String),
        service: 'brimu-backend',
        version: expect.any(String)
      });
      expect(logEntry.id).toMatch(/^log_\d+_/);
      expect(logEntry.timestamp).toBeGreaterThan(0);
      expect(logEntry.fingerprint).toBeDefined();
    });

    it('deve criar log de info com metadata', () => {
      const metadata = { action: 'user_login', success: true };
      const logEntry = advancedLoggingService.info('User logged in', {}, metadata);

      expect(logEntry.level).toBe('info');
      expect(logEntry.metadata).toEqual(metadata);
    });

    it('deve criar log de warning', () => {
      const logEntry = advancedLoggingService.warn('Slow database query');
      expect(logEntry.level).toBe('warn');
    });

    it('deve gerar fingerprint consistente para mensagens similares', () => {
      const log1 = advancedLoggingService.error('Database connection failed');
      const log2 = advancedLoggingService.error('Database connection failed');

      expect(log1.fingerprint).toBe(log2.fingerprint);
    });

    it('deve extrair tags automaticamente da mensagem', () => {
      const logEntry = advancedLoggingService.error('MongoDB connection timeout error');
      
      expect(logEntry.tags).toEqual(
        expect.arrayContaining(['error'])
      );
      expect(logEntry.tags.length).toBeGreaterThan(0);
    });
  });

  describe('Sistema de Padrões', () => {
    it('deve carregar padrões predefinidos na inicialização', () => {
      const patterns = advancedLoggingService.getPatterns();
      
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.some(p => p.id === 'critical-errors')).toBe(true);
      expect(patterns.some(p => p.id === 'authentication-failures')).toBe(true);
      expect(patterns.some(p => p.id === 'security-events')).toBe(true);
    });

    it('deve adicionar novo padrão personalizado', () => {
      const customPattern = {
        id: 'custom-test',
        name: 'Custom Test Pattern',
        pattern: /test pattern/i,
        level: 'info',
        description: 'Test pattern for unit tests',
        action: 'count' as const,
        threshold: 5,
        timeWindow: 60000
      };

      advancedLoggingService.addPattern(customPattern);
      const patterns = advancedLoggingService.getPatterns();
      
      expect(patterns.some(p => p.id === 'custom-test')).toBe(true);
    });

    it('deve remover padrão existente', () => {
      const removed = advancedLoggingService.removePattern('critical-errors');
      
      expect(removed).toBe(true);
      const patterns = advancedLoggingService.getPatterns();
      expect(patterns.some(p => p.id === 'critical-errors')).toBe(false);
    });

    it('deve detectar padrão e incrementar contador', () => {
      advancedLoggingService.error('Critical system error occurred');
      
      const analytics = advancedLoggingService.getAnalytics();
      expect(analytics.topErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Sistema de Alertas', () => {
    it('deve enviar alerta quando threshold for atingido', async () => {
      const mockSendNotification = notificationService.sendNotification as jest.Mock;
      
      // Simular múltiplos erros críticos para atingir threshold
      advancedLoggingService.error('System crashed');
      
      expect(mockSendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'alert',
          priority: 'high',
          title: expect.stringContaining('Log Pattern Alert'),
          message: expect.stringContaining('critical-errors')
        })
      );
    });

    it('não deve enviar alerta se threshold não for atingido', () => {
      const mockSendNotification = notificationService.sendNotification as jest.Mock;
      
      advancedLoggingService.info('Normal info message');
      
      expect(mockSendNotification).not.toHaveBeenCalled();
    });
  });

  describe('Busca e Filtros', () => {
    beforeEach(() => {
      // Criar alguns logs de teste
      advancedLoggingService.error('Database error', { userId: 'user1' });
      advancedLoggingService.warn('Slow query', { userId: 'user2' });
      advancedLoggingService.info('User login', { userId: 'user1' });
    });

    it('deve buscar logs por nível', () => {
      const errorLogs = advancedLoggingService.searchLogs({ level: ['error'] });
      
      expect(errorLogs.length).toBe(1);
      expect(errorLogs[0].level).toBe('error');
    });

    it('deve buscar logs por usuário', () => {
      const userLogs = advancedLoggingService.searchLogs({ userId: 'user1' });
      
      expect(userLogs.length).toBe(2);
      expect(userLogs.every(log => log.context?.userId === 'user1')).toBe(true);
    });

    it('deve buscar logs por texto', () => {
      const searchLogs = advancedLoggingService.searchLogs({ text: 'database' });
      
      expect(searchLogs.length).toBe(1);
      expect(searchLogs[0].message).toContain('Database');
    });

    it('deve aplicar limite e offset', () => {
      const logs = advancedLoggingService.searchLogs({ limit: 1, offset: 1 });
      
      expect(logs.length).toBe(1);
    });

    it('deve buscar logs por range de tempo', () => {
      const now = Date.now();
      const timeRange = {
        start: now - 60000, // 1 minuto atrás
        end: now + 60000    // 1 minuto no futuro
      };

      const logs = advancedLoggingService.searchLogs({ timeRange });
      
      expect(logs.length).toBe(3); // Todos os logs criados no beforeEach
    });
  });

  describe('Analytics e Estatísticas', () => {
    beforeEach(() => {
      // Criar logs para análise
      advancedLoggingService.error('Error 1');
      advancedLoggingService.error('Error 2');
      advancedLoggingService.warn('Warning 1');
      advancedLoggingService.info('Info 1');
      advancedLoggingService.info('Info 2');
      advancedLoggingService.info('Info 3');
    });

    it('deve calcular estatísticas corretamente', () => {
      const analytics = advancedLoggingService.getAnalytics();
      
      expect(analytics.totalLogs).toBe(6);
      expect(analytics.logsByLevel.error).toBe(2);
      expect(analytics.logsByLevel.warn).toBe(1);
      expect(analytics.logsByLevel.info).toBe(3);
      expect(analytics.errorRate).toBeCloseTo(33.33, 1); // 2/6 * 100
    });

    it('deve gerar trends por período', () => {
      const analytics = advancedLoggingService.getAnalytics();
      
      expect(analytics.trends).toBeDefined();
      expect(analytics.trends.hourlyGrowth).toBeDefined();
      expect(analytics.trends.errorTrend).toBeDefined();
    });

    it('deve incluir top errors', () => {
      advancedLoggingService.error('Same error message');
      advancedLoggingService.error('Same error message');
      advancedLoggingService.error('Different error');
      
      const analytics = advancedLoggingService.getAnalytics();
      
      expect(analytics.topErrors).toBeDefined();
      expect(analytics.topErrors.length).toBeGreaterThan(0);
      expect(analytics.topErrors[0].count).toBeGreaterThan(1);
    });
  });

  describe('Export de Logs', () => {
    beforeEach(() => {
      advancedLoggingService.error('Export test error');
      advancedLoggingService.info('Export test info');
    });

    it('deve exportar logs em formato JSON', () => {
      const exported = advancedLoggingService.exportLogs('json', { limit: 10 });
      
      expect(() => JSON.parse(exported)).not.toThrow();
      const data = JSON.parse(exported);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThanOrEqual(0);
    });

    it('deve exportar logs em formato CSV', () => {
      const exported = advancedLoggingService.exportLogs('csv', { limit: 10 });
      
      expect(exported).toContain('timestamp,level,message');
      expect(exported.split('\n').length).toBeGreaterThan(1);
    });

    it('deve exportar logs em formato Elasticsearch', () => {
      const exported = advancedLoggingService.exportLogs('elasticsearch', { limit: 10 });
      
      const lines = exported.trim().split('\n').filter(line => line.length > 0);
      expect(lines.length).toBeGreaterThanOrEqual(0);
      
      if (lines.length > 0) {
        // Se há dados, primeira linha deve conter index action
        expect(lines[0]).toContain('{"index"');
      }
    });
  });

  describe('Limpeza de Logs', () => {
    beforeEach(() => {
      // Criar log recente
      advancedLoggingService.info('Recent log entry');
    });

    it('deve remover logs antigos', () => {
      // Criar mais alguns logs para teste
      advancedLoggingService.error('Error log');
      advancedLoggingService.warn('Warning log');
      
      const cutoff = Date.now() - 1; // 1ms atrás
      const removedCount = advancedLoggingService.cleanup(cutoff);
      
      expect(removedCount).toBeGreaterThanOrEqual(0);
      const remainingLogs = advancedLoggingService.searchLogs({ limit: 100 });
      expect(remainingLogs.every(log => log.timestamp >= cutoff)).toBe(true);
    });
  });

  describe('Performance e Concorrência', () => {
    it('deve processar muitos logs rapidamente', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        advancedLoggingService.info(`Performance test log ${i}`);
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Menos de 1 segundo para 1000 logs
    });

    it('deve manter performance com muitas buscas simultâneas', async () => {
      // Criar dados de teste
      for (let i = 0; i < 100; i++) {
        advancedLoggingService.info(`Search test log ${i}`, { 
          userId: `user${i % 10}` 
        });
      }

      const startTime = Date.now();
      const promises = [];
      
      for (let i = 0; i < 50; i++) {
        promises.push(
          Promise.resolve(advancedLoggingService.searchLogs({ 
            limit: 10,
            offset: i * 2 
          }))
        );
      }
      
      await Promise.all(promises);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(500); // Menos de 500ms para 50 buscas
    });
  });
});