import { createClient, RedisClientType } from 'redis';
import logger from '../logging/logger';

class RedisCache {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private memoryCache: Map<string, { data: any; expiry: number }> = new Map();
  private useMemoryFallback: boolean = false;

  async connect(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.client = createClient({
        url: redisUrl,
      });

      this.client.on('error', (error) => {
        logger.error('Redis connection error', { error: error.message });
        this.useMemoryFallback = true;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
        this.useMemoryFallback = false;
      });

      this.client.on('disconnect', () => {
        logger.warn('Redis client disconnected');
        this.isConnected = false;
        this.useMemoryFallback = true;
      });

      await this.client.connect();
      
    } catch (error) {
      logger.error('Failed to connect to Redis, using memory cache fallback', { error });
      this.useMemoryFallback = true;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      if (this.useMemoryFallback) {
        return this.getFromMemory<T>(key);
      }

      if (!this.client || !this.isConnected) {
        return this.getFromMemory<T>(key);
      }

      const value = await this.client.get(key);
      if (value) {
        logger.debug('Cache hit', { key, source: 'redis' });
        return JSON.parse(value);
      }
      
      logger.debug('Cache miss', { key });
      return null;
    } catch (error) {
      logger.error('Redis get error', { key, error });
      return this.getFromMemory<T>(key);
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      
      // Always set in memory cache as fallback
      this.setInMemory(key, value, ttlSeconds);
      
      if (this.useMemoryFallback || !this.client || !this.isConnected) {
        logger.debug('Cache set in memory', { key, ttlSeconds });
        return true;
      }

      await this.client.setEx(key, ttlSeconds, serialized);
      logger.debug('Cache set in Redis', { key, ttlSeconds });
      return true;
      
    } catch (error) {
      logger.error('Redis set error', { key, error });
      this.setInMemory(key, value, ttlSeconds);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      // Delete from memory cache
      this.memoryCache.delete(key);
      
      if (this.useMemoryFallback || !this.client || !this.isConnected) {
        return true;
      }

      const result = await this.client.del(key);
      logger.debug('Cache key deleted', { key, result });
      return result > 0;
      
    } catch (error) {
      logger.error('Redis delete error', { key, error });
      return false;
    }
  }

  async flush(): Promise<boolean> {
    try {
      // Clear memory cache
      this.memoryCache.clear();
      
      if (this.useMemoryFallback || !this.client || !this.isConnected) {
        return true;
      }

      await this.client.flushAll();
      logger.info('Cache flushed');
      return true;
      
    } catch (error) {
      logger.error('Redis flush error', { error });
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      if (this.useMemoryFallback || !this.client || !this.isConnected) {
        const keys = Array.from(this.memoryCache.keys());
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return keys.filter(key => regex.test(key));
      }

      return await this.client.keys(pattern);
      
    } catch (error) {
      logger.error('Redis keys error', { pattern, error });
      return [];
    }
  }

  // Memory cache fallback methods
  private getFromMemory<T>(key: string): T | null {
    const cached = this.memoryCache.get(key);
    if (!cached) {
      return null;
    }

    if (Date.now() > cached.expiry) {
      this.memoryCache.delete(key);
      return null;
    }

    logger.debug('Cache hit', { key, source: 'memory' });
    return cached.data;
  }

  private setInMemory(key: string, value: any, ttlSeconds: number): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.memoryCache.set(key, { data: value, expiry });

    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance
      this.cleanupMemoryCache();
    }
  }

  private cleanupMemoryCache(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of this.memoryCache.entries()) {
      if (now > value.expiry) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.debug('Memory cache cleanup', { cleaned, remaining: this.memoryCache.size });
    }
  }

  getStats(): { isConnected: boolean; useMemoryFallback: boolean; memoryCacheSize: number } {
    return {
      isConnected: this.isConnected,
      useMemoryFallback: this.useMemoryFallback,
      memoryCacheSize: this.memoryCache.size,
    };
  }
}

export default new RedisCache();