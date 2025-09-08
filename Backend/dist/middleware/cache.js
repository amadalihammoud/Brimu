"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateOrderCache = exports.invalidateServiceCache = exports.invalidateEquipmentCache = exports.invalidateUserCache = exports.invalidateCache = exports.orderCache = exports.serviceCache = exports.equipmentCache = exports.userCache = exports.cacheMiddleware = void 0;
const redisClient_1 = __importDefault(require("../cache/redisClient"));
const logger_1 = __importDefault(require("../logging/logger"));
const cacheMiddleware = (options = {}) => {
    const { ttl = 300, // 5 minutes default
    keyGenerator = (req) => `${req.method}:${req.originalUrl}`, condition = () => true, skipCache = () => false, } = options;
    return async (req, res, next) => {
        // Skip cache for non-GET requests or when condition is false
        if (req.method !== 'GET' || !condition(req) || skipCache(req)) {
            return next();
        }
        const cacheKey = keyGenerator(req);
        try {
            const cached = await redisClient_1.default.get(cacheKey);
            if (cached) {
                logger_1.default.debug('Serving from cache', {
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
            res.json = function (data) {
                // Only cache successful responses
                if (res.statusCode === 200 && data) {
                    redisClient_1.default.set(cacheKey, data, ttl).catch(error => {
                        logger_1.default.error('Failed to cache response', { cacheKey, error });
                    });
                    logger_1.default.debug('Response cached', {
                        cacheKey,
                        ttl,
                        requestId: req.requestId
                    });
                }
                res.setHeader('X-Cache', 'MISS');
                return originalJson.call(this, data);
            };
            next();
        }
        catch (error) {
            logger_1.default.error('Cache middleware error', { cacheKey, error });
            next();
        }
    };
};
exports.cacheMiddleware = cacheMiddleware;
// Specific cache middlewares
exports.userCache = (0, exports.cacheMiddleware)({
    ttl: 600, // 10 minutes
    keyGenerator: (req) => `user:${req.params.id || 'list'}:${JSON.stringify(req.query)}`,
    condition: (req) => !req.headers.authorization?.includes('admin'), // Don't cache admin requests
});
exports.equipmentCache = (0, exports.cacheMiddleware)({
    ttl: 300, // 5 minutes
    keyGenerator: (req) => `equipment:${req.params.id || 'list'}:${JSON.stringify(req.query)}`,
});
exports.serviceCache = (0, exports.cacheMiddleware)({
    ttl: 1800, // 30 minutes
    keyGenerator: (req) => `service:${req.params.id || 'list'}:${JSON.stringify(req.query)}`,
});
exports.orderCache = (0, exports.cacheMiddleware)({
    ttl: 60, // 1 minute (orders change frequently)
    keyGenerator: (req) => `order:${req.params.id || 'list'}:${JSON.stringify(req.query)}`,
    skipCache: (req) => req.query.status === 'pending', // Don't cache pending orders
});
// Cache invalidation helpers
const invalidateCache = async (pattern) => {
    try {
        const keys = await redisClient_1.default.keys(pattern);
        if (keys.length > 0) {
            await Promise.all(keys.map(key => redisClient_1.default.del(key)));
            logger_1.default.info('Cache invalidated', { pattern, keysCount: keys.length });
        }
    }
    catch (error) {
        logger_1.default.error('Cache invalidation failed', { pattern, error });
    }
};
exports.invalidateCache = invalidateCache;
// Specific invalidation functions
const invalidateUserCache = (userId) => {
    const pattern = userId ? `user:${userId}*` : 'user:*';
    return (0, exports.invalidateCache)(pattern);
};
exports.invalidateUserCache = invalidateUserCache;
const invalidateEquipmentCache = (equipmentId) => {
    const pattern = equipmentId ? `equipment:${equipmentId}*` : 'equipment:*';
    return (0, exports.invalidateCache)(pattern);
};
exports.invalidateEquipmentCache = invalidateEquipmentCache;
const invalidateServiceCache = (serviceId) => {
    const pattern = serviceId ? `service:${serviceId}*` : 'service:*';
    return (0, exports.invalidateCache)(pattern);
};
exports.invalidateServiceCache = invalidateServiceCache;
const invalidateOrderCache = (orderId) => {
    const pattern = orderId ? `order:${orderId}*` : 'order:*';
    return (0, exports.invalidateCache)(pattern);
};
exports.invalidateOrderCache = invalidateOrderCache;
//# sourceMappingURL=cache.js.map