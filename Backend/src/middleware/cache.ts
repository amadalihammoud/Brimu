import { Request, Response, NextFunction } from 'express';
import cache from '../cache/redisClient';
import logger from '../logging/logger';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
  skipCache?: (req: Request) => boolean;
}

export const cacheMiddleware = (options: CacheOptions = {}) => {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator = (req) => `${req.method}:${req.originalUrl}`,
    condition = () => true,
    skipCache = () => false,
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip cache for non-GET requests or when condition is false
    if (req.method !== 'GET' || !condition(req) || skipCache(req)) {
      return next();
    }

    const cacheKey = keyGenerator(req);
    
    try {
      const cached = await cache.get(cacheKey);
      
      if (cached) {
        logger.debug('Serving from cache', { 
          cacheKey, 
          requestId: req.requestId 
        });
        
        res.setHeader('X-Cache', 'HIT');
        res.json(cached);
        return;
      }

      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache response
      res.json = function(data: any) {
        // Only cache successful responses
        if (res.statusCode === 200 && data) {
          cache.set(cacheKey, data, ttl).catch(error => {
            logger.error('Failed to cache response', { cacheKey, error });
          });
          
          logger.debug('Response cached', { 
            cacheKey, 
            ttl,
            requestId: req.requestId 
          });
        }
        
        res.setHeader('X-Cache', 'MISS');
        return originalJson.call(this, data);
      };

      next();
      
    } catch (error) {
      logger.error('Cache middleware error', { cacheKey, error });
      next();
    }
  };
};

// Specific cache middlewares
export const userCache = cacheMiddleware({
  ttl: 600, // 10 minutes
  keyGenerator: (req) => `user:${req.params.id || 'list'}:${JSON.stringify(req.query)}`,
  condition: (req) => !req.headers.authorization?.includes('admin'), // Don't cache admin requests
});

export const equipmentCache = cacheMiddleware({
  ttl: 300, // 5 minutes
  keyGenerator: (req) => `equipment:${req.params.id || 'list'}:${JSON.stringify(req.query)}`,
});

export const serviceCache = cacheMiddleware({
  ttl: 1800, // 30 minutes
  keyGenerator: (req) => `service:${req.params.id || 'list'}:${JSON.stringify(req.query)}`,
});

export const orderCache = cacheMiddleware({
  ttl: 60, // 1 minute (orders change frequently)
  keyGenerator: (req) => `order:${req.params.id || 'list'}:${JSON.stringify(req.query)}`,
  skipCache: (req) => req.query.status === 'pending', // Don't cache pending orders
});

// Cache invalidation helpers
export const invalidateCache = async (pattern: string): Promise<void> => {
  try {
    const keys = await cache.keys(pattern);
    
    if (keys.length > 0) {
      await Promise.all(keys.map(key => cache.del(key)));
      logger.info('Cache invalidated', { pattern, keysCount: keys.length });
    }
  } catch (error) {
    logger.error('Cache invalidation failed', { pattern, error });
  }
};

// Specific invalidation functions
export const invalidateUserCache = (userId?: string): Promise<void> => {
  const pattern = userId ? `user:${userId}*` : 'user:*';
  return invalidateCache(pattern);
};

export const invalidateEquipmentCache = (equipmentId?: string): Promise<void> => {
  const pattern = equipmentId ? `equipment:${equipmentId}*` : 'equipment:*';
  return invalidateCache(pattern);
};

export const invalidateServiceCache = (serviceId?: string): Promise<void> => {
  const pattern = serviceId ? `service:${serviceId}*` : 'service:*';
  return invalidateCache(pattern);
};

export const invalidateOrderCache = (orderId?: string): Promise<void> => {
  const pattern = orderId ? `order:${orderId}*` : 'order:*';
  return invalidateCache(pattern);
};