"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../utils/logger");
class SecurityAuditSystem {
    constructor() {
        this.threatDatabase = new Map();
        this.suspiciousIPs = new Set();
        this.blockedIPs = new Set();
        // Middleware para verificar IPs bloqueados
        this.checkBlockedIPs = (req, res, next) => {
            const ip = req.ip || req.connection.remoteAddress;
            if (this.blockedIPs.has(ip)) {
                this.logSecurityEvent({
                    ip,
                    userAgent: req.get('User-Agent'),
                    eventType: 'BLOCKED_IP_ACCESS_ATTEMPT',
                    severity: 'high',
                    details: {
                        url: req.url,
                        method: req.method,
                        headers: req.headers
                    },
                    action: 'blocked'
                });
                res.status(403).json({
                    error: 'Acesso negado',
                    code: 'IP_BLOCKED'
                });
                return;
            }
            next();
        };
        // Middleware para detectar scanning
        this.detectScanning = (req, res, next) => {
            const ip = req.ip || req.connection.remoteAddress;
            const url = req.url;
            const userAgent = req.get('User-Agent') || '';
            // Padrões de scanning
            const scanningPatterns = [
                /\.\.\//, // Path traversal
                /\/admin/i,
                /\/wp-admin/i,
                /\/phpmyadmin/i,
                /\/backup/i,
                /\/config/i,
                /\/database/i,
                /\/sql/i,
                /\/api\/v\d+/,
                /\.(env|config|backup|sql|db)$/i,
                /\.(php|asp|jsp|cgi)$/i
            ];
            const isScanningAttempt = scanningPatterns.some(pattern => pattern.test(url));
            if (isScanningAttempt) {
                this.logSecurityEvent({
                    ip,
                    userAgent,
                    eventType: 'SCANNING_ATTEMPT',
                    severity: 'medium',
                    details: {
                        url,
                        method: req.method,
                        pattern: scanningPatterns.find(p => p.test(url))?.source
                    },
                    action: 'detected'
                });
            }
            next();
        };
        // Middleware para detectar ataques de força bruta
        this.detectBruteForce = (threshold = 5, windowMs = 15 * 60 * 1000) => {
            const attempts = new Map();
            return (req, res, next) => {
                const ip = req.ip || req.connection.remoteAddress;
                const now = Date.now();
                // Limpar tentativas antigas
                for (const [key, value] of attempts.entries()) {
                    if (now - value.firstAttempt > windowMs) {
                        attempts.delete(key);
                    }
                }
                const currentAttempts = attempts.get(ip) || { count: 0, firstAttempt: now };
                currentAttempts.count++;
                if (currentAttempts.count === 1) {
                    currentAttempts.firstAttempt = now;
                }
                attempts.set(ip, currentAttempts);
                if (currentAttempts.count > threshold) {
                    this.logSecurityEvent({
                        ip,
                        userAgent: req.get('User-Agent'),
                        eventType: 'BRUTE_FORCE_ATTEMPT',
                        severity: 'high',
                        details: {
                            attempts: currentAttempts.count,
                            threshold,
                            windowMs,
                            url: req.url
                        },
                        action: 'rate_limited'
                    });
                    res.status(429).json({
                        error: 'Muitas tentativas. Tente novamente mais tarde.',
                        code: 'BRUTE_FORCE_DETECTED'
                    });
                    return;
                }
                next();
            };
        };
        // Middleware para detectar payloads maliciosos
        this.detectMaliciousPayloads = (req, res, next) => {
            const ip = req.ip || req.connection.remoteAddress;
            const userAgent = req.get('User-Agent') || '';
            // Padrões de payloads maliciosos
            const maliciousPatterns = [
                // SQL Injection
                /union\s+select/i,
                /or\s+1\s*=\s*1/i,
                /drop\s+table/i,
                /delete\s+from/i,
                /insert\s+into/i,
                /'(\s*or\s*'?1'?\s*=\s*'?1|admin'?\s*--)/i,
                // XSS
                /<script[\s\S]*?>[\s\S]*?<\/script>/i,
                /javascript\s*:/i,
                /on\w+\s*=/i,
                /<iframe/i,
                // Command Injection
                /;.*rm\s+-rf/i,
                /\|\s*nc\s/i,
                /bash\s+-i/i,
                /\/bin\/sh/i,
                // LDAP Injection
                /\(\|\(/i,
                /\)\)\(/i,
                // NoSQL Injection
                /\$where/i,
                /\$ne/i,
                /\$gt/i,
                /\$regex/i
            ];
            const checkPayload = (obj, path = '') => {
                if (typeof obj === 'string') {
                    return maliciousPatterns.some(pattern => pattern.test(obj));
                }
                if (typeof obj === 'object' && obj !== null) {
                    for (const [key, value] of Object.entries(obj)) {
                        if (checkPayload(value, `${path}.${key}`)) {
                            return true;
                        }
                    }
                }
                return false;
            };
            // Verificar query parameters
            if (checkPayload(req.query)) {
                this.logSecurityEvent({
                    ip,
                    userAgent,
                    eventType: 'MALICIOUS_QUERY_PAYLOAD',
                    severity: 'critical',
                    details: {
                        query: req.query,
                        url: req.url
                    },
                    action: 'blocked'
                });
                res.status(400).json({
                    error: 'Payload malicioso detectado',
                    code: 'MALICIOUS_PAYLOAD'
                });
                return;
            }
            // Verificar body
            if (req.body && checkPayload(req.body)) {
                this.logSecurityEvent({
                    ip,
                    userAgent,
                    eventType: 'MALICIOUS_BODY_PAYLOAD',
                    severity: 'critical',
                    details: {
                        body: req.body,
                        url: req.url
                    },
                    action: 'blocked'
                });
                res.status(400).json({
                    error: 'Payload malicioso detectado',
                    code: 'MALICIOUS_PAYLOAD'
                });
                return;
            }
            next();
        };
        this.auditLogPath = path_1.default.join(process.cwd(), 'storage', 'security-audit.jsonl');
        this.loadThreatDatabase();
    }
    // Carregar base de dados de ameaças
    async loadThreatDatabase() {
        try {
            const threatDbPath = path_1.default.join(process.cwd(), 'storage', 'threat-database.json');
            const data = await fs_1.promises.readFile(threatDbPath, 'utf-8');
            const threats = JSON.parse(data);
            for (const threat of threats) {
                this.threatDatabase.set(threat.ip, threat);
                if (threat.isBlocked) {
                    this.blockedIPs.add(threat.ip);
                }
            }
            logger_1.logger.info('Threat database loaded', {
                threatCount: this.threatDatabase.size,
                blockedIPs: this.blockedIPs.size
            });
        }
        catch (error) {
            logger_1.logger.info('No existing threat database found, starting fresh');
        }
    }
    // Salvar base de dados de ameaças
    async saveThreatDatabase() {
        try {
            const threatDbPath = path_1.default.join(process.cwd(), 'storage', 'threat-database.json');
            const threats = Array.from(this.threatDatabase.values());
            await fs_1.promises.writeFile(threatDbPath, JSON.stringify(threats, null, 2));
        }
        catch (error) {
            logger_1.logger.error('Failed to save threat database', error);
        }
    }
    // Registrar evento de segurança
    async logSecurityEvent(eventData) {
        const event = {
            id: crypto_1.default.randomUUID(),
            timestamp: new Date().toISOString(),
            ...eventData
        };
        // Log estruturado
        logger_1.logger.warn('Security event', event);
        // Salvar em arquivo de auditoria
        try {
            await fs_1.promises.appendFile(this.auditLogPath, JSON.stringify(event) + '\n');
        }
        catch (error) {
            logger_1.logger.error('Failed to write security audit log', error);
        }
        // Atualizar perfil de ameaça
        await this.updateThreatProfile(event);
    }
    // Atualizar perfil de ameaça do IP
    async updateThreatProfile(event) {
        const ip = event.ip;
        let profile = this.threatDatabase.get(ip);
        if (!profile) {
            profile = {
                ip,
                firstSeen: event.timestamp,
                lastSeen: event.timestamp,
                eventCount: 0,
                severity: 'low',
                events: [],
                isBlocked: false
            };
        }
        profile.lastSeen = event.timestamp;
        profile.eventCount++;
        profile.events.push(event);
        // Manter apenas os últimos 50 eventos
        if (profile.events.length > 50) {
            profile.events = profile.events.slice(-50);
        }
        // Calcular nova severidade
        profile.severity = this.calculateThreatSeverity(profile);
        // Auto-bloqueio para ameaças críticas
        if (profile.severity === 'critical' && !profile.isBlocked) {
            profile.isBlocked = true;
            this.blockedIPs.add(ip);
            logger_1.logger.error('IP automatically blocked due to critical threat level', {
                ip,
                eventCount: profile.eventCount,
                severity: profile.severity
            });
            // Notificar administradores (implementar conforme necessário)
            await this.notifyAdministrators('IP_AUTO_BLOCKED', { ip, profile });
        }
        this.threatDatabase.set(ip, profile);
        // Salvar periodicamente
        if (profile.eventCount % 10 === 0) {
            await this.saveThreatDatabase();
        }
    }
    // Calcular severidade da ameaça
    calculateThreatSeverity(profile) {
        const recentEvents = profile.events.filter(event => {
            const eventTime = new Date(event.timestamp).getTime();
            const now = Date.now();
            return now - eventTime < 24 * 60 * 60 * 1000; // Últimas 24 horas
        });
        const criticalEvents = recentEvents.filter(e => e.severity === 'critical').length;
        const highEvents = recentEvents.filter(e => e.severity === 'high').length;
        const totalRecent = recentEvents.length;
        // Critérios de severidade
        if (criticalEvents >= 3 || totalRecent >= 50)
            return 'critical';
        if (criticalEvents >= 1 || highEvents >= 5 || totalRecent >= 20)
            return 'high';
        if (highEvents >= 2 || totalRecent >= 10)
            return 'medium';
        return 'low';
    }
    // Notificar administradores
    async notifyAdministrators(type, data) {
        // Implementar notificação por email, webhook, etc.
        logger_1.logger.error('Admin notification', { type, data });
    }
    // Obter estatísticas de segurança
    async getSecurityStats() {
        const stats = {
            totalThreats: this.threatDatabase.size,
            blockedIPs: this.blockedIPs.size,
            suspiciousIPs: this.suspiciousIPs.size,
            severityBreakdown: {
                low: 0,
                medium: 0,
                high: 0,
                critical: 0
            },
            topThreats: [],
            recentEvents: []
        };
        // Contar por severidade
        for (const profile of this.threatDatabase.values()) {
            stats.severityBreakdown[profile.severity]++;
        }
        // Top 10 ameaças
        stats.topThreats = Array.from(this.threatDatabase.values())
            .sort((a, b) => b.eventCount - a.eventCount)
            .slice(0, 10)
            .map(profile => ({
            ip: profile.ip,
            eventCount: profile.eventCount,
            severity: profile.severity,
            lastSeen: profile.lastSeen,
            isBlocked: profile.isBlocked
        }));
        return stats;
    }
    // Desbloquear IP manualmente
    async unblockIP(ip) {
        const profile = this.threatDatabase.get(ip);
        if (profile) {
            profile.isBlocked = false;
            this.blockedIPs.delete(ip);
            await this.saveThreatDatabase();
            logger_1.logger.info('IP manually unblocked', { ip });
            return true;
        }
        return false;
    }
    // Bloquear IP manualmente
    async blockIP(ip, reason) {
        let profile = this.threatDatabase.get(ip);
        if (!profile) {
            profile = {
                ip,
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                eventCount: 0,
                severity: 'high',
                events: [],
                isBlocked: true
            };
        }
        profile.isBlocked = true;
        this.blockedIPs.add(ip);
        this.threatDatabase.set(ip, profile);
        await this.logSecurityEvent({
            ip,
            eventType: 'MANUAL_IP_BLOCK',
            severity: 'high',
            details: { reason: reason || 'Manual block' },
            action: 'blocked'
        });
        await this.saveThreatDatabase();
        logger_1.logger.info('IP manually blocked', { ip, reason });
    }
}
// Instância singleton
const securityAudit = new SecurityAuditSystem();
exports.default = securityAudit;
