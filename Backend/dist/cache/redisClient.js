"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const logger_1 = __importDefault(require("../logging/logger"));
class RedisCache {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.memoryCache = new Map();
        this.useMemoryFallback = false;
    }
    async connect() {
        try {
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
            this.client = (0, redis_1.createClient)({
                url: redisUrl,
            });
            this.client.on('error', (error) => {
                logger_1.default.error('Redis connection error', { error: error.message });
                this.useMemoryFallback = true;
            });
            this.client.on('connect', () => {
                logger_1.default.info('Redis client connected');
                this.isConnected = true;
                this.useMemoryFallback = false;
            });
            this.client.on('disconnect', () => {
                logger_1.default.warn('Redis client disconnected');
                this.isConnected = false;
                this.useMemoryFallback = true;
            });
            await this.client.connect();
        }
        catch (error) {
            logger_1.default.error('Failed to connect to Redis, using memory cache fallback', { error });
            this.useMemoryFallback = true;
        }
    }
    async disconnect() {
        if (this.client && this.isConnected) {
            await this.client.disconnect();
            this.isConnected = false;
        }
    }
    async get(key) {
        try {
            if (this.useMemoryFallback) {
                return this.getFromMemory(key);
            }
            if (!this.client || !this.isConnected) {
                return this.getFromMemory(key);
            }
            const value = await this.client.get(key);
            if (value) {
                logger_1.default.debug('Cache hit', { key, source: 'redis' });
                return JSON.parse(value);
            }
            logger_1.default.debug('Cache miss', { key });
            return null;
        }
        catch (error) {
            logger_1.default.error('Redis get error', { key, error });
            return this.getFromMemory(key);
        }
    }
    async set(key, value, ttlSeconds = 3600) {
        try {
            const serialized = JSON.stringify(value);
            // Always set in memory cache as fallback
            this.setInMemory(key, value, ttlSeconds);
            if (this.useMemoryFallback || !this.client || !this.isConnected) {
                logger_1.default.debug('Cache set in memory', { key, ttlSeconds });
                return true;
            }
            await this.client.setEx(key, ttlSeconds, serialized);
            logger_1.default.debug('Cache set in Redis', { key, ttlSeconds });
            return true;
        }
        catch (error) {
            logger_1.default.error('Redis set error', { key, error });
            this.setInMemory(key, value, ttlSeconds);
            return false;
        }
    }
    async del(key) {
        try {
            // Delete from memory cache
            this.memoryCache.delete(key);
            if (this.useMemoryFallback || !this.client || !this.isConnected) {
                return true;
            }
            const result = await this.client.del(key);
            logger_1.default.debug('Cache key deleted', { key, result });
            return result > 0;
        }
        catch (error) {
            logger_1.default.error('Redis delete error', { key, error });
            return false;
        }
    }
    async flush() {
        try {
            // Clear memory cache
            this.memoryCache.clear();
            if (this.useMemoryFallback || !this.client || !this.isConnected) {
                return true;
            }
            await this.client.flushAll();
            logger_1.default.info('Cache flushed');
            return true;
        }
        catch (error) {
            logger_1.default.error('Redis flush error', { error });
            return false;
        }
    }
    async keys(pattern) {
        try {
            if (this.useMemoryFallback || !this.client || !this.isConnected) {
                const keys = Array.from(this.memoryCache.keys());
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                return keys.filter(key => regex.test(key));
            }
            return await this.client.keys(pattern);
        }
        catch (error) {
            logger_1.default.error('Redis keys error', { pattern, error });
            return [];
        }
    }
    // Memory cache fallback methods
    getFromMemory(key) {
        const cached = this.memoryCache.get(key);
        if (!cached) {
            return null;
        }
        if (Date.now() > cached.expiry) {
            this.memoryCache.delete(key);
            return null;
        }
        logger_1.default.debug('Cache hit', { key, source: 'memory' });
        return cached.data;
    }
    setInMemory(key, value, ttlSeconds) {
        const expiry = Date.now() + (ttlSeconds * 1000);
        this.memoryCache.set(key, { data: value, expiry });
        // Clean up expired entries periodically
        if (Math.random() < 0.01) { // 1% chance
            this.cleanupMemoryCache();
        }
    }
    cleanupMemoryCache() {
        const now = Date.now();
        let cleaned = 0;
        for (const [key, value] of this.memoryCache.entries()) {
            if (now > value.expiry) {
                this.memoryCache.delete(key);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            logger_1.default.debug('Memory cache cleanup', { cleaned, remaining: this.memoryCache.size });
        }
    }
    getStats() {
        return {
            isConnected: this.isConnected,
            useMemoryFallback: this.useMemoryFallback,
            memoryCacheSize: this.memoryCache.size,
        };
    }
}
exports.default = new RedisCache();
//# sourceMappingURL=redisClient.js.map