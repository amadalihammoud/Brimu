"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const redisClient_1 = __importDefault(require("../cache/redisClient"));
const logger_1 = __importDefault(require("../logging/logger"));
class HealthMonitor {
    constructor() {
        this.startTime = Date.now();
    }
    async checkHealth() {
        const timestamp = new Date().toISOString();
        const uptime = (Date.now() - this.startTime) / 1000;
        // Check all services
        const [database, cacheService, disk, memory] = await Promise.all([
            this.checkDatabase(),
            this.checkCache(),
            this.checkDisk(),
            this.checkMemory(),
        ]);
        // Determine overall status
        const services = { database, cache: cacheService, disk, memory };
        const status = this.determineOverallStatus(services);
        const healthStatus = {
            status,
            timestamp,
            uptime,
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            services,
        };
        // Log health check
        logger_1.default.debug('Health check completed', { status, services: Object.keys(services) });
        return healthStatus;
    }
    async checkDatabase() {
        const startTime = Date.now();
        try {
            const state = mongoose_1.default.connection.readyState;
            const responseTime = Date.now() - startTime;
            if (state === 1) { // Connected
                // Test database with a simple query
                await mongoose_1.default.connection.db.admin().ping();
                return {
                    status: 'up',
                    responseTime,
                    details: {
                        readyState: state,
                        host: mongoose_1.default.connection.host,
                        port: mongoose_1.default.connection.port,
                        name: mongoose_1.default.connection.name,
                    },
                };
            }
            else {
                return {
                    status: 'down',
                    responseTime,
                    details: { readyState: state },
                    error: 'Database not connected',
                };
            }
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                status: 'down',
                responseTime,
                error: error instanceof Error ? error.message : 'Database check failed',
            };
        }
    }
    async checkCache() {
        const startTime = Date.now();
        try {
            const stats = redisClient_1.default.getStats();
            const responseTime = Date.now() - startTime;
            // Test cache with a simple operation
            const testKey = `health:check:${Date.now()}`;
            await redisClient_1.default.set(testKey, 'test', 10);
            const result = await redisClient_1.default.get(testKey);
            await redisClient_1.default.del(testKey);
            const status = result === 'test' ? 'up' : 'degraded';
            return {
                status,
                responseTime,
                details: stats,
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                status: 'down',
                responseTime,
                error: error instanceof Error ? error.message : 'Cache check failed',
            };
        }
    }
    async checkDisk() {
        const startTime = Date.now();
        try {
            const fs = require('fs').promises;
            const path = require('path');
            // Check if logs directory is writable
            const testFile = path.join('logs', '.health-check');
            await fs.writeFile(testFile, 'test');
            await fs.unlink(testFile);
            const responseTime = Date.now() - startTime;
            return {
                status: 'up',
                responseTime,
                details: {
                    writable: true,
                },
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                status: 'down',
                responseTime,
                error: error instanceof Error ? error.message : 'Disk check failed',
            };
        }
    }
    async checkMemory() {
        const startTime = Date.now();
        try {
            const memoryUsage = process.memoryUsage();
            const responseTime = Date.now() - startTime;
            // Convert bytes to MB
            const rss = Math.round(memoryUsage.rss / 1024 / 1024);
            const heapUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024);
            const heapTotal = Math.round(memoryUsage.heapTotal / 1024 / 1024);
            // Consider memory usage above 512MB as degraded
            const status = rss > 512 ? 'degraded' : 'up';
            return {
                status,
                responseTime,
                details: {
                    rss: `${rss}MB`,
                    heapUsed: `${heapUsed}MB`,
                    heapTotal: `${heapTotal}MB`,
                    external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
                },
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                status: 'down',
                responseTime,
                error: error instanceof Error ? error.message : 'Memory check failed',
            };
        }
    }
    determineOverallStatus(services) {
        const serviceStatuses = Object.values(services).map(service => service.status);
        if (serviceStatuses.every(status => status === 'up')) {
            return 'healthy';
        }
        if (serviceStatuses.some(status => status === 'down')) {
            return 'unhealthy';
        }
        return 'degraded';
    }
    // Health check endpoint handlers
    async healthHandler(req, res) {
        try {
            const health = await this.checkHealth();
            const statusCode = health.status === 'healthy' ? 200 :
                health.status === 'degraded' ? 200 : 503;
            res.status(statusCode).json(health);
        }
        catch (error) {
            logger_1.default.error('Health check failed', { error });
            res.status(503).json({
                status: 'unhealthy',
                error: 'Health check failed',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async readinessHandler(req, res) {
        try {
            const health = await this.checkHealth();
            const isReady = health.status === 'healthy' || health.status === 'degraded';
            if (isReady) {
                res.status(200).json({ status: 'ready', timestamp: health.timestamp });
            }
            else {
                res.status(503).json({ status: 'not ready', timestamp: health.timestamp });
            }
        }
        catch (error) {
            res.status(503).json({ status: 'not ready', error: 'Readiness check failed' });
        }
    }
    async livenessHandler(req, res) {
        // Simple liveness check - if the process is running, it's alive
        res.status(200).json({
            status: 'alive',
            timestamp: new Date().toISOString(),
            uptime: (Date.now() - this.startTime) / 1000
        });
    }
}
exports.default = new HealthMonitor();
//# sourceMappingURL=healthCheck.js.map