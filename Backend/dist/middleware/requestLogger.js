"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = exports.requestLogger = void 0;
const uuid_1 = require("uuid");
const logger_1 = __importDefault(require("../logging/logger"));
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const requestId = (0, uuid_1.v4)();
    // Add request ID and start time to request object
    req.requestId = requestId;
    req.startTime = startTime;
    // Log incoming request
    logger_1.default.http('Incoming request', {
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        category: 'request_start'
    });
    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const duration = Date.now() - startTime;
        // Log API request completion
        logger_1.default.logApiRequest(req.method, req.url, res.statusCode, duration, {
            requestId,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id,
        });
        // Log slow requests
        if (duration > 1000) {
            logger_1.default.warn('Slow request detected', {
                requestId,
                method: req.method,
                url: req.url,
                duration,
                category: 'performance'
            });
        }
        // Call original end method
        return originalEnd.call(this, chunk, encoding);
    };
    next();
};
exports.requestLogger = requestLogger;
const errorLogger = (err, req, res, next) => {
    const context = {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        body: req.body,
        params: req.params,
        query: req.query,
    };
    logger_1.default.error('Request error occurred', context, err);
    next(err);
};
exports.errorLogger = errorLogger;
