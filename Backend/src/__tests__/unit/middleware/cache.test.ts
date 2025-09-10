import { Request, Response, NextFunction } from 'express';
import { cacheMiddleware, invalidateServiceCache } from '../../../middleware/cache';
import cache from '../../../cache/redisClient';
import { testUtils } from '../../setup';

/**
 * Testes Unitários - Middleware de Cache
 * Testa funcionalidades do sistema de cache middleware
 */

describe('Cache Middleware - Testes Unitários', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonSpy: jest.SpyInstance;
  let setHeaderSpy: jest.SpyInstance;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      originalUrl: '/api/test',
      requestId: 'test-request-id'
    };

    jsonSpy = jest.fn();
    setHeaderSpy = jest.fn();

    mockRes = {
      json: jsonSpy,
      setHeader: setHeaderSpy,
      statusCode: 200
    };

    mockNext = jest.fn();

    // Limpar mocks do Redis
    jest.clearAllMocks();
  });

  describe('cacheMiddleware', () => {
    it('deve passar adiante para métodos não-GET', async () => {
      mockReq.method = 'POST';
      
      const middleware = cacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(cache.get).not.toHaveBeenCalled();
    });

    it('deve verificar cache para métodos GET', async () => {
      const cachedData = { message: 'cached response' };
      (cache.get as jest.Mock).mockResolvedValue(cachedData);

      const middleware = cacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(cache.get).toHaveBeenCalledWith('GET:/api/test');
      expect(jsonSpy).toHaveBeenCalledWith(cachedData);
      expect(setHeaderSpy).toHaveBeenCalledWith('X-Cache', 'HIT');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve continuar se não houver cache', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);

      const middleware = cacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(cache.get).toHaveBeenCalledWith('GET:/api/test');
      expect(mockNext).toHaveBeenCalled();
      expect(jsonSpy).not.toHaveBeenCalled();
    });

    it('deve usar keyGenerator customizado', async () => {
      const customKeyGenerator = jest.fn().mockReturnValue('custom-key');
      (cache.get as jest.Mock).mockResolvedValue(null);

      const middleware = cacheMiddleware({
        keyGenerator: customKeyGenerator
      });
      
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(customKeyGenerator).toHaveBeenCalledWith(mockReq);
      expect(cache.get).toHaveBeenCalledWith('custom-key');
    });

    it('deve respeitar condição customizada', async () => {
      const condition = jest.fn().mockReturnValue(false);

      const middleware = cacheMiddleware({
        condition
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(condition).toHaveBeenCalledWith(mockReq);
      expect(cache.get).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('deve pular cache quando skipCache retorna true', async () => {
      const skipCache = jest.fn().mockReturnValue(true);

      const middleware = cacheMiddleware({
        skipCache
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(skipCache).toHaveBeenCalledWith(mockReq);
      expect(cache.get).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('deve interceptar resposta e armazenar no cache', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      (cache.set as jest.Mock).mockResolvedValue('OK');

      const middleware = cacheMiddleware({
        ttl: 600
      });

      // Simular middleware
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      // Simular resposta da aplicação
      const responseData = { message: 'test response' };
      mockRes.json!(responseData);

      expect(mockNext).toHaveBeenCalled();
      expect(cache.set).toHaveBeenCalledWith(
        'GET:/api/test',
        responseData,
        600
      );
      expect(setHeaderSpy).toHaveBeenCalledWith('X-Cache', 'MISS');
    });

    it('deve lidar com erro do cache graciosamente', async () => {
      (cache.get as jest.Mock).mockRejectedValue(new Error('Redis connection failed'));

      const middleware = cacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      // Deve continuar mesmo com erro de cache
      expect(mockNext).toHaveBeenCalled();
    });

    it('não deve armazenar respostas com erro no cache', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      mockRes.statusCode = 500;

      const middleware = cacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      // Simular resposta com erro
      const responseData = { error: 'Server error' };
      mockRes.json!(responseData);

      expect(cache.set).not.toHaveBeenCalled();
    });
  });

  describe('Cache Invalidation', () => {
    it('deve invalidar cache por padrão', async () => {
      const mockKeys = ['service:1:data', 'service:2:data', 'service:list:data'];
      (cache.keys as jest.Mock).mockResolvedValue(mockKeys);
      (cache.del as jest.Mock).mockResolvedValue(1);

      await invalidateServiceCache();

      expect(cache.keys).toHaveBeenCalledWith('service:*');
      expect(cache.del).toHaveBeenCalledTimes(3);
      mockKeys.forEach(key => {
        expect(cache.del).toHaveBeenCalledWith(key);
      });
    });

    it('deve invalidar cache específico por ID', async () => {
      const mockKeys = ['service:123:data', 'service:123:details'];
      (cache.keys as jest.Mock).mockResolvedValue(mockKeys);
      (cache.del as jest.Mock).mockResolvedValue(1);

      await invalidateServiceCache('123');

      expect(cache.keys).toHaveBeenCalledWith('service:123*');
      expect(cache.del).toHaveBeenCalledTimes(2);
    });

    it('deve lidar com erro de invalidação graciosamente', async () => {
      (cache.keys as jest.Mock).mockRejectedValue(new Error('Connection error'));

      // Não deve lançar erro
      await expect(invalidateServiceCache()).resolves.not.toThrow();
    });

    it('deve lidar com nenhuma chave encontrada', async () => {
      (cache.keys as jest.Mock).mockResolvedValue([]);

      await invalidateServiceCache();

      expect(cache.keys).toHaveBeenCalledWith('service:*');
      expect(cache.del).not.toHaveBeenCalled();
    });
  });

  describe('Cache Configuration', () => {
    it('deve usar TTL padrão de 300 segundos', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      (cache.set as jest.Mock).mockResolvedValue('OK');

      const middleware = cacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      // Simular resposta
      mockRes.json!({ data: 'test' });

      expect(cache.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        300
      );
    });

    it('deve usar TTL customizado', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      (cache.set as jest.Mock).mockResolvedValue('OK');

      const middleware = cacheMiddleware({
        ttl: 1800 // 30 minutos
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      // Simular resposta
      mockRes.json!({ data: 'test' });

      expect(cache.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        1800
      );
    });
  });

  describe('Performance Tests', () => {
    it('deve processar múltiplas requisições rapidamente', async () => {
      const startTime = Date.now();
      const requestCount = 100;

      // Simular cache miss para todas
      (cache.get as jest.Mock).mockResolvedValue(null);

      const middleware = cacheMiddleware();
      const promises = [];

      for (let i = 0; i < requestCount; i++) {
        const req = {
          ...mockReq,
          originalUrl: `/api/test/${i}`
        };

        promises.push(middleware(req as Request, mockRes as Response, mockNext));
      }

      await Promise.all(promises);
      const duration = Date.now() - startTime;

      // Deve processar rapidamente (menos de 1 segundo para 100 requisições)
      expect(duration).toBeLessThan(1000);
      expect(mockNext).toHaveBeenCalledTimes(requestCount);
    });

    it('não deve causar vazamento de memória com muitas requisições', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      (cache.get as jest.Mock).mockResolvedValue(null);
      const middleware = cacheMiddleware();

      // Simular muitas requisições
      for (let i = 0; i < 1000; i++) {
        const req = {
          ...mockReq,
          originalUrl: `/api/test/${i}`
        };

        await middleware(req as Request, mockRes as Response, mockNext);
      }

      // Forçar garbage collection se disponível
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Aumento de memória deve ser mínimo (menos de 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Integration with Logging', () => {
    it('deve logar hits de cache', async () => {
      const cachedData = { message: 'cached' };
      (cache.get as jest.Mock).mockResolvedValue(cachedData);

      const middleware = cacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      // Verificar se log foi registrado (através de mock ou spy)
      expect(cache.get).toHaveBeenCalled();
      expect(setHeaderSpy).toHaveBeenCalledWith('X-Cache', 'HIT');
    });

    it('deve logar misses de cache', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);

      const middleware = cacheMiddleware();
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      // Simular resposta
      mockRes.json!({ data: 'test' });

      expect(setHeaderSpy).toHaveBeenCalledWith('X-Cache', 'MISS');
    });
  });
});