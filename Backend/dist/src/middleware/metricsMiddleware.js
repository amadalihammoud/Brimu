"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceAnalysisMiddleware = exports.errorMetricsMiddleware = exports.cacheMetricsMiddleware = exports.healthCheckMetrics = exports.metricsCollectionMiddleware = void 0;
const metricsService_1 = __importDefault(require("../services/metricsService"));
const logger_1 = require("../utils/logger");
const metricsCollectionMiddleware = (req, res, next) => {
    // Registrar início da requisição
    req.startTime = Date.now();
    req.requestId = req.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Hook no método res.end para capturar métricas quando a resposta for enviada
    const originalEnd = res.end;
    res.end = function (...args) {
        const endTime = Date.now();
        const duration = req.startTime ? endTime - req.startTime : 0;
        // Registrar métrica de performance
        metricsService_1.default.recordMetric({
            endpoint: req.route?.path || req.path,
            method: req.method,
            duration,
            statusCode: res.statusCode
        });
        // Log detalhado para requisições lentas (> 1 segundo)
        if (duration > 1000) {
            logger_1.logger.warn('Slow request detected', {
                requestId: req.requestId,
                method: req.method,
                path: req.path,
                duration,
                statusCode: res.statusCode,
                userAgent: req.get('User-Agent'),
                ip: req.ip
            });
        }
        // Chamar método original
        return originalEnd.apply(this, args);
    };
    next();
};
exports.metricsCollectionMiddleware = metricsCollectionMiddleware;
const healthCheckMetrics = (req, res, next) => {
    // Para endpoints de health check, coletar métricas adicionais
    if (req.path.includes('/health') || req.path.includes('/status')) {
        const systemMetrics = metricsService_1.default.getSystemMetrics();
        // Adicionar métricas ao response
        res.locals.systemMetrics = systemMetrics;
        logger_1.logger.debug('Health check metrics collected', {
            requestId: req.requestId,
            uptime: systemMetrics.uptime,
            memoryUsage: systemMetrics.memory.heapUsed,
            avgResponseTime: systemMetrics.avgResponseTime
        });
    }
    next();
};
exports.healthCheckMetrics = healthCheckMetrics;
const cacheMetricsMiddleware = (req, res, next) => {
    // Hook no cabeçalho X-Cache para registrar hits/misses
    const originalSetHeader = res.setHeader;
    res.setHeader = function (name, value) {
        if (name === 'X-Cache') {
            if (value === 'HIT') {
                metricsService_1.default.recordCacheHit();
            }
            else if (value === 'MISS') {
                metricsService_1.default.recordCacheMiss();
            }
        }
        return originalSetHeader.call(this, name, value);
    };
    next();
};
exports.cacheMetricsMiddleware = cacheMetricsMiddleware;
const errorMetricsMiddleware = (error, req, res, next) => {
    // Registrar métricas de erro
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    metricsService_1.default.recordMetric({
        endpoint: req.route?.path || req.path,
        method: req.method,
        duration,
        statusCode: error.statusCode || 500
    });
    logger_1.logger.error('Error metrics recorded', {
        requestId: req.requestId,
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        duration
    });
    next(error);
};
exports.errorMetricsMiddleware = errorMetricsMiddleware;
const performanceAnalysisMiddleware = (req, res, next) => {
    // Middleware para análise detalhada de performance em endpoints críticos
    const criticalEndpoints = ['/api/orders', '/api/reports', '/api/payments'];
    if (criticalEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
        const startCpuUsage = process.cpuUsage();
        const startMemory = process.memoryUsage();
        // Hook para capturar métricas detalhadas
        const originalJson = res.json;
        res.json = function (data) {
            const endCpuUsage = process.cpuUsage(startCpuUsage);
            const endMemory = process.memoryUsage();
            logger_1.logger.info('Critical endpoint performance analysis', {
                requestId: req.requestId,
                path: req.path,
                method: req.method,
                cpuUsage: {
                    user: endCpuUsage.user,
                    system: endCpuUsage.system
                },
                memoryDelta: {
                    heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                    heapTotal: endMemory.heapTotal - startMemory.heapTotal
                },
                responseSize: JSON.stringify(data).length
            });
            return originalJson.call(this, data);
        };
    }
    next();
};
exports.performanceAnalysisMiddleware = performanceAnalysisMiddleware;
