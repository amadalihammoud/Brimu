"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const mongoose_1 = __importDefault(require("mongoose"));
const redisClient_1 = __importDefault(require("../cache/redisClient"));
const advancedLoggingService_1 = __importDefault(require("./advancedLoggingService"));
const performanceAnalysisService_1 = __importDefault(require("./performanceAnalysisService"));
const notificationService_1 = __importDefault(require("./notificationService"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class HealthCheckService extends events_1.EventEmitter {
    constructor() {
        super();
        this.checks = new Map();
        this.results = new Map();
        this.intervals = new Map();
        this.isRunning = false;
        this.mainInterval = null;
        this.setupDefaultChecks();
        this.startHealthMonitoring();
        advancedLoggingService_1.default.info('HealthCheck Service Initialized', {
            component: 'HealthCheckService',
            checksCount: this.checks.size
        });
    }
    // Configurar verificações padrão
    setupDefaultChecks() {
        // Database Health Check
        this.registerCheck({
            name: 'database',
            check: this.checkDatabase.bind(this),
            interval: 30000, // 30 segundos
            timeout: 10000, // 10 segundos
            critical: true,
            enabled: true
        });
        // Redis Cache Health Check
        this.registerCheck({
            name: 'cache',
            check: this.checkCache.bind(this),
            interval: 30000,
            timeout: 5000,
            critical: false,
            enabled: true
        });
        // File System Health Check
        this.registerCheck({
            name: 'filesystem',
            check: this.checkFileSystem.bind(this),
            interval: 60000, // 1 minuto
            timeout: 5000,
            critical: true,
            enabled: true
        });
        // Memory Health Check
        this.registerCheck({
            name: 'memory',
            check: this.checkMemory.bind(this),
            interval: 15000, // 15 segundos
            timeout: 1000,
            critical: false,
            enabled: true
        });
        // CPU Health Check
        this.registerCheck({
            name: 'cpu',
            check: this.checkCPU.bind(this),
            interval: 15000,
            timeout: 1000,
            critical: false,
            enabled: true
        });
        // Disk Space Health Check
        this.registerCheck({
            name: 'disk',
            check: this.checkDiskSpace.bind(this),
            interval: 60000,
            timeout: 5000,
            critical: true,
            enabled: true
        });
        // Application Performance Check
        this.registerCheck({
            name: 'performance',
            check: this.checkPerformance.bind(this),
            interval: 30000,
            timeout: 5000,
            critical: false,
            enabled: true
        });
        // Security Status Check
        this.registerCheck({
            name: 'security',
            check: this.checkSecurity.bind(this),
            interval: 300000, // 5 minutos
            timeout: 10000,
            critical: true,
            enabled: true
        });
    }
    // Registrar nova verificação de saúde
    registerCheck(config) {
        this.checks.set(config.name, config);
        if (config.enabled && this.isRunning) {
            this.startCheck(config.name);
        }
        advancedLoggingService_1.default.info('Health Check Registered', {
            checkName: config.name,
            interval: config.interval,
            critical: config.critical,
            component: 'HealthCheckService'
        });
    }
    // Desregistrar verificação
    unregisterCheck(name) {
        this.stopCheck(name);
        this.checks.delete(name);
        this.results.delete(name);
        advancedLoggingService_1.default.info('Health Check Unregistered', {
            checkName: name,
            component: 'HealthCheckService'
        });
    }
    // Obter status completo de saúde do sistema
    async getSystemHealth() {
        const checks = Array.from(this.results.values());
        const timestamp = Date.now();
        // Executar verificações síncronas se necessário
        await this.runSyncChecks();
        // Calcular estatísticas
        const summary = {
            total: checks.length,
            healthy: checks.filter(c => c.status === 'healthy').length,
            degraded: checks.filter(c => c.status === 'degraded').length,
            unhealthy: checks.filter(c => c.status === 'unhealthy').length,
            critical: checks.filter(c => c.critical && c.status !== 'healthy').length
        };
        // Calcular score geral (0-100)
        const score = this.calculateHealthScore(checks);
        // Determinar status geral
        const overall = this.determineOverallHealth(checks, score);
        // Coletar informações de recursos
        const resources = await this.collectResourceInfo();
        // Coletar status dos serviços principais
        const services = {
            database: this.results.get('database') || this.createUnknownResult('database'),
            cache: this.results.get('cache') || this.createUnknownResult('cache'),
            fileSystem: this.results.get('filesystem') || this.createUnknownResult('filesystem'),
            externalAPIs: [] // TODO: implementar verificações de APIs externas
        };
        // Coletar alertas recentes
        const alerts = this.collectRecentAlerts(checks);
        return {
            overall,
            score,
            status: this.getStatusMessage(overall, summary),
            timestamp,
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            checks,
            summary,
            resources,
            services,
            alerts
        };
    }
    // Executar verificação específica manualmente
    async runCheck(name) {
        const config = this.checks.get(name);
        if (!config) {
            throw new Error(`Health check '${name}' not found`);
        }
        return await this.executeCheck(name, config);
    }
    // Executar todas as verificações
    async runAllChecks() {
        const results = new Map();
        const promises = Array.from(this.checks.entries()).map(async ([name, config]) => {
            try {
                const result = await this.executeCheck(name, config);
                results.set(name, result);
                return result;
            }
            catch (error) {
                const errorResult = {
                    name,
                    status: 'unhealthy',
                    responseTime: 0,
                    message: 'Check execution failed',
                    error: error.message,
                    critical: config.critical,
                    lastCheck: Date.now()
                };
                results.set(name, errorResult);
                return errorResult;
            }
        });
        await Promise.all(promises);
        return results;
    }
    // Implementações das verificações específicas
    async checkDatabase() {
        const startTime = Date.now();
        try {
            if (mongoose_1.default.connection.readyState === 1) {
                // Testar com uma operação simples
                await mongoose_1.default.connection.db.admin().ping();
                const responseTime = Date.now() - startTime;
                return {
                    status: responseTime > 1000 ? 'degraded' : 'healthy',
                    responseTime,
                    message: responseTime > 1000 ? 'Database responding slowly' : 'Database connection healthy',
                    critical: true,
                    details: {
                        host: mongoose_1.default.connection.host,
                        port: mongoose_1.default.connection.port,
                        name: mongoose_1.default.connection.name,
                        readyState: mongoose_1.default.connection.readyState
                    }
                };
            }
            else {
                return {
                    status: 'unhealthy',
                    responseTime: Date.now() - startTime,
                    message: 'Database connection not ready',
                    critical: true,
                    details: {
                        readyState: mongoose_1.default.connection.readyState
                    }
                };
            }
        }
        catch (error) {
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                message: 'Database connection failed',
                error: error.message,
                critical: true
            };
        }
    }
    async checkCache() {
        const startTime = Date.now();
        try {
            // Testar conexão com Redis
            const testKey = 'healthcheck:' + Date.now();
            const testValue = 'test';
            await redisClient_1.default.set(testKey, testValue, 10); // 10 segundos TTL
            const retrievedValue = await redisClient_1.default.get(testKey);
            await redisClient_1.default.del(testKey);
            const responseTime = Date.now() - startTime;
            if (retrievedValue === testValue) {
                return {
                    status: responseTime > 500 ? 'degraded' : 'healthy',
                    responseTime,
                    message: responseTime > 500 ? 'Cache responding slowly' : 'Cache connection healthy',
                    critical: false,
                    details: {
                        connected: true,
                        testPassed: true
                    }
                };
            }
            else {
                return {
                    status: 'degraded',
                    responseTime,
                    message: 'Cache test failed - data inconsistency',
                    critical: false
                };
            }
        }
        catch (error) {
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                message: 'Cache connection failed',
                error: error.message,
                critical: false,
                details: {
                    fallbackToMemory: true
                }
            };
        }
    }
    async checkFileSystem() {
        const startTime = Date.now();
        try {
            const testDir = path_1.default.join(process.cwd(), 'temp');
            const testFile = path_1.default.join(testDir, 'healthcheck.txt');
            const testContent = 'healthcheck test';
            // Criar diretório se não existir
            try {
                await promises_1.default.mkdir(testDir, { recursive: true });
            }
            catch (error) {
                // Ignorar se já existir
            }
            // Testar escrita
            await promises_1.default.writeFile(testFile, testContent);
            // Testar leitura
            const readContent = await promises_1.default.readFile(testFile, 'utf8');
            // Limpar arquivo de teste
            await promises_1.default.unlink(testFile);
            const responseTime = Date.now() - startTime;
            if (readContent === testContent) {
                return {
                    status: 'healthy',
                    responseTime,
                    message: 'File system read/write operations successful',
                    critical: true,
                    details: {
                        testDir,
                        canWrite: true,
                        canRead: true
                    }
                };
            }
            else {
                return {
                    status: 'degraded',
                    responseTime,
                    message: 'File system data inconsistency detected',
                    critical: true
                };
            }
        }
        catch (error) {
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                message: 'File system operations failed',
                error: error.message,
                critical: true
            };
        }
    }
    async checkMemory() {
        const startTime = Date.now();
        try {
            const memUsage = process.memoryUsage();
            const totalMem = require('os').totalmem();
            const freeMem = require('os').freemem();
            const usedMem = totalMem - freeMem;
            const memPercentage = (usedMem / totalMem) * 100;
            const heapPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
            let status = 'healthy';
            let message = 'Memory usage within normal limits';
            if (memPercentage > 90 || heapPercentage > 90) {
                status = 'unhealthy';
                message = 'Critical memory usage detected';
            }
            else if (memPercentage > 80 || heapPercentage > 80) {
                status = 'degraded';
                message = 'High memory usage detected';
            }
            return {
                status,
                responseTime: Date.now() - startTime,
                message,
                critical: false,
                details: {
                    heap: {
                        used: Math.round(memUsage.heapUsed / 1024 / 1024),
                        total: Math.round(memUsage.heapTotal / 1024 / 1024),
                        percentage: Math.round(heapPercentage)
                    },
                    system: {
                        used: Math.round(usedMem / 1024 / 1024),
                        total: Math.round(totalMem / 1024 / 1024),
                        free: Math.round(freeMem / 1024 / 1024),
                        percentage: Math.round(memPercentage)
                    }
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                message: 'Memory check failed',
                error: error.message,
                critical: false
            };
        }
    }
    async checkCPU() {
        const startTime = Date.now();
        try {
            const loadAvg = require('os').loadavg();
            const cpuCount = require('os').cpus().length;
            // Normalizar load average pelo número de CPUs
            const normalizedLoad = loadAvg[0] / cpuCount * 100;
            let status = 'healthy';
            let message = 'CPU usage within normal limits';
            if (normalizedLoad > 90) {
                status = 'unhealthy';
                message = 'Critical CPU usage detected';
            }
            else if (normalizedLoad > 70) {
                status = 'degraded';
                message = 'High CPU usage detected';
            }
            return {
                status,
                responseTime: Date.now() - startTime,
                message,
                critical: false,
                details: {
                    loadAverage: loadAvg,
                    cpuCount,
                    normalizedLoad: Math.round(normalizedLoad),
                    usage1min: Math.round(loadAvg[0] * 100) / 100,
                    usage5min: Math.round(loadAvg[1] * 100) / 100,
                    usage15min: Math.round(loadAvg[2] * 100) / 100
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                message: 'CPU check failed',
                error: error.message,
                critical: false
            };
        }
    }
    async checkDiskSpace() {
        const startTime = Date.now();
        try {
            const { stdout } = await execAsync('df -h /', { timeout: 5000 });
            const lines = stdout.trim().split('\n');
            const dataLine = lines[1]; // Segunda linha contém os dados
            const columns = dataLine.split(/\s+/);
            const total = columns[1];
            const used = columns[2];
            const available = columns[3];
            const percentage = parseInt(columns[4].replace('%', ''));
            let status = 'healthy';
            let message = 'Disk space within normal limits';
            if (percentage > 95) {
                status = 'unhealthy';
                message = 'Critical disk space - immediate action required';
            }
            else if (percentage > 85) {
                status = 'degraded';
                message = 'High disk usage detected';
            }
            return {
                status,
                responseTime: Date.now() - startTime,
                message,
                critical: true,
                details: {
                    total,
                    used,
                    available,
                    percentage,
                    filesystem: columns[0]
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                message: 'Disk space check failed',
                error: error.message,
                critical: true
            };
        }
    }
    async checkPerformance() {
        const startTime = Date.now();
        try {
            const analytics = performanceAnalysisService_1.default.getPerformanceAnalytics({
                start: Date.now() - 300000, // Últimos 5 minutos
                end: Date.now()
            });
            let status = 'healthy';
            let message = 'Application performance within normal limits';
            if (analytics.summary.overallHealth === 'critical') {
                status = 'unhealthy';
                message = 'Critical performance issues detected';
            }
            else if (analytics.summary.overallHealth === 'degraded') {
                status = 'degraded';
                message = 'Performance degradation detected';
            }
            return {
                status,
                responseTime: Date.now() - startTime,
                message,
                critical: false,
                details: {
                    overallHealth: analytics.summary.overallHealth,
                    averageResponseTime: analytics.summary.averageResponseTime,
                    errorRate: analytics.summary.errorRate,
                    throughput: analytics.summary.throughput,
                    recentAnomalies: analytics.recentAnomalies.length
                }
            };
        }
        catch (error) {
            return {
                status: 'degraded',
                responseTime: Date.now() - startTime,
                message: 'Performance check failed',
                error: error.message,
                critical: false
            };
        }
    }
    async checkSecurity() {
        const startTime = Date.now();
        try {
            // Verificações de segurança básicas
            const checks = {
                environment: process.env.NODE_ENV === 'production',
                httpsRedirect: true, // TODO: implementar verificação real
                securityHeaders: true, // TODO: implementar verificação real
                rateLimiting: true, // TODO: implementar verificação real
                authentication: true // TODO: implementar verificação real
            };
            const passedChecks = Object.values(checks).filter(Boolean).length;
            const totalChecks = Object.keys(checks).length;
            const percentage = (passedChecks / totalChecks) * 100;
            let status = 'healthy';
            let message = 'Security configuration optimal';
            if (percentage < 60) {
                status = 'unhealthy';
                message = 'Critical security issues detected';
            }
            else if (percentage < 80) {
                status = 'degraded';
                message = 'Security improvements needed';
            }
            return {
                status,
                responseTime: Date.now() - startTime,
                message,
                critical: true,
                details: {
                    score: Math.round(percentage),
                    checks,
                    passedChecks,
                    totalChecks
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                message: 'Security check failed',
                error: error.message,
                critical: true
            };
        }
    }
    // Métodos auxiliares
    async executeCheck(name, config) {
        const startTime = Date.now();
        try {
            const result = await Promise.race([
                config.check(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Check timeout')), config.timeout))
            ]);
            const finalResult = {
                ...result,
                name,
                lastCheck: Date.now()
            };
            this.results.set(name, finalResult);
            this.emit('checkResult', finalResult);
            if (finalResult.status === 'unhealthy' && config.critical) {
                this.handleCriticalFailure(finalResult);
            }
            return finalResult;
        }
        catch (error) {
            const errorResult = {
                name,
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                message: 'Check execution failed',
                error: error.message,
                critical: config.critical,
                lastCheck: Date.now()
            };
            this.results.set(name, errorResult);
            this.emit('checkResult', errorResult);
            if (config.critical) {
                this.handleCriticalFailure(errorResult);
            }
            return errorResult;
        }
    }
    handleCriticalFailure(result) {
        advancedLoggingService_1.default.error('Critical Health Check Failure', {
            checkName: result.name,
            status: result.status,
            message: result.message,
            error: result.error,
            responseTime: result.responseTime,
            component: 'HealthCheckService'
        });
        // Enviar notificação para falhas críticas
        notificationService_1.default.sendNotification({
            type: 'error',
            category: 'system',
            priority: 'high',
            title: `Critical System Health Issue: ${result.name}`,
            message: result.message,
            channels: [{ type: 'email', enabled: true }],
            persistent: true,
            data: { healthCheck: result }
        });
        this.emit('criticalFailure', result);
    }
    startHealthMonitoring() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        // Iniciar verificações individuais
        for (const [name, config] of this.checks.entries()) {
            if (config.enabled) {
                this.startCheck(name);
            }
        }
        // Monitoramento geral a cada 5 minutos
        this.mainInterval = setInterval(() => {
            this.performPeriodicAnalysis();
        }, 300000);
        advancedLoggingService_1.default.info('Health Monitoring Started', {
            checksCount: this.checks.size,
            component: 'HealthCheckService'
        });
    }
    startCheck(name) {
        const config = this.checks.get(name);
        if (!config || !config.enabled)
            return;
        // Executar imediatamente
        this.executeCheck(name, config);
        // Agendar execuções periódicas
        const interval = setInterval(() => {
            this.executeCheck(name, config);
        }, config.interval);
        this.intervals.set(name, interval);
    }
    stopCheck(name) {
        const interval = this.intervals.get(name);
        if (interval) {
            clearInterval(interval);
            this.intervals.delete(name);
        }
    }
    async runSyncChecks() {
        // Executar algumas verificações síncronas se necessário
        const syncChecks = ['memory', 'cpu'];
        for (const checkName of syncChecks) {
            const config = this.checks.get(checkName);
            if (config && config.enabled) {
                await this.executeCheck(checkName, config);
            }
        }
    }
    calculateHealthScore(checks) {
        if (checks.length === 0)
            return 0;
        let totalScore = 0;
        let totalWeight = 0;
        for (const check of checks) {
            const weight = check.critical ? 2 : 1;
            let score = 0;
            switch (check.status) {
                case 'healthy':
                    score = 100;
                    break;
                case 'degraded':
                    score = 60;
                    break;
                case 'unhealthy':
                    score = 0;
                    break;
            }
            totalScore += score * weight;
            totalWeight += weight;
        }
        return Math.round(totalScore / totalWeight);
    }
    determineOverallHealth(checks, score) {
        const criticalFailures = checks.filter(c => c.critical && c.status === 'unhealthy');
        if (criticalFailures.length > 0) {
            return 'unhealthy';
        }
        if (score < 70) {
            return 'unhealthy';
        }
        else if (score < 85) {
            return 'degraded';
        }
        return 'healthy';
    }
    getStatusMessage(overall, summary) {
        switch (overall) {
            case 'healthy':
                return `All systems operational (${summary.healthy}/${summary.total} checks passing)`;
            case 'degraded':
                return `System degraded (${summary.unhealthy + summary.degraded}/${summary.total} issues detected)`;
            case 'unhealthy':
                return `System unhealthy (${summary.critical} critical issues require immediate attention)`;
            default:
                return 'Status unknown';
        }
    }
    async collectResourceInfo() {
        const memUsage = process.memoryUsage();
        const os = require('os');
        try {
            // Disk info (simplified)
            const { stdout } = await execAsync('df -h / | tail -1', { timeout: 3000 });
            const diskData = stdout.trim().split(/\s+/);
            const diskUsed = parseInt(diskData[4]?.replace('%', '')) || 0;
            return {
                memory: {
                    used: Math.round(memUsage.heapUsed / 1024 / 1024),
                    total: Math.round(memUsage.heapTotal / 1024 / 1024),
                    percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
                },
                cpu: {
                    usage: Math.round((os.loadavg()[0] / os.cpus().length) * 100),
                    loadAverage: os.loadavg()
                },
                disk: {
                    used: diskUsed,
                    total: 100,
                    percentage: diskUsed
                },
                network: {
                    connections: 0, // TODO: implementar contagem de conexões
                    throughput: 0 // TODO: implementar medição de throughput
                }
            };
        }
        catch (error) {
            return {
                memory: {
                    used: Math.round(memUsage.heapUsed / 1024 / 1024),
                    total: Math.round(memUsage.heapTotal / 1024 / 1024),
                    percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
                },
                cpu: {
                    usage: Math.round((os.loadavg()[0] / os.cpus().length) * 100),
                    loadAverage: os.loadavg()
                },
                disk: {
                    used: 0,
                    total: 0,
                    percentage: 0
                },
                network: {
                    connections: 0,
                    throughput: 0
                }
            };
        }
    }
    createUnknownResult(name) {
        return {
            name,
            status: 'degraded',
            responseTime: 0,
            message: 'Check not available',
            critical: false,
            lastCheck: 0
        };
    }
    collectRecentAlerts(checks) {
        const alerts = [];
        for (const check of checks) {
            if (check.status === 'unhealthy') {
                alerts.push({
                    level: check.critical ? 'critical' : 'warning',
                    message: check.message,
                    timestamp: check.lastCheck,
                    service: check.name
                });
            }
        }
        return alerts.sort((a, b) => b.timestamp - a.timestamp);
    }
    async performPeriodicAnalysis() {
        try {
            const health = await this.getSystemHealth();
            if (health.overall === 'unhealthy') {
                advancedLoggingService_1.default.error('System Health Critical', {
                    score: health.score,
                    criticalIssues: health.summary.critical,
                    component: 'HealthCheckService'
                });
            }
            this.emit('healthAnalysis', health);
        }
        catch (error) {
            advancedLoggingService_1.default.error('Health analysis failed', {
                error: error.message,
                component: 'HealthCheckService'
            });
        }
    }
    // Cleanup
    destroy() {
        this.isRunning = false;
        // Parar todas as verificações
        for (const interval of this.intervals.values()) {
            clearInterval(interval);
        }
        this.intervals.clear();
        if (this.mainInterval) {
            clearInterval(this.mainInterval);
        }
        advancedLoggingService_1.default.info('HealthCheck Service Destroyed', {
            component: 'HealthCheckService'
        });
    }
}
const healthCheckService = new HealthCheckService();
exports.default = healthCheckService;
