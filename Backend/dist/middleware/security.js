"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorLoginAttempts = exports.default = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = __importDefault(require("../config"));
const logger_1 = require("../utils/logger");
// Configurações de segurança personalizadas
const securityConfig = {
    // Rate limiting para diferentes endpoints
    rateLimits: {
        // Rate limiting geral
        general: (0, express_rate_limit_1.default)({
            windowMs: config_1.default.rateLimit.windowMs,
            max: config_1.default.rateLimit.maxRequests,
            message: {
                error: 'Muitas requisições deste IP, tente novamente mais tarde.',
                retryAfter: Math.ceil(config_1.default.rateLimit.windowMs / 1000)
            },
            standardHeaders: true,
            legacyHeaders: false,
            handler: (req, res) => {
                logger_1.logger.warn('Rate limit exceeded', {
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    url: req.url,
                    method: req.method
                });
                res.status(429).json({
                    error: 'Muitas requisições deste IP, tente novamente mais tarde.',
                    retryAfter: Math.ceil(config_1.default.rateLimit.windowMs / 1000)
                });
            }
        }),
        // Rate limiting para login (mais restritivo)
        login: (0, express_rate_limit_1.default)({
            windowMs: config_1.default.rateLimit.loginWindowMs,
            max: config_1.default.rateLimit.loginMaxAttempts,
            message: {
                error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
                retryAfter: Math.ceil(config_1.default.rateLimit.loginWindowMs / 1000)
            },
            standardHeaders: true,
            legacyHeaders: false,
            handler: (req, res) => {
                logger_1.logger.warn('Login rate limit exceeded', {
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    email: req.body?.email
                });
                res.status(429).json({
                    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
                    retryAfter: Math.ceil(config_1.default.rateLimit.loginWindowMs / 1000)
                });
            }
        }),
        // Rate limiting para upload
        upload: (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 10, // máximo 10 uploads por IP
            message: {
                error: 'Muitos uploads. Tente novamente mais tarde.',
                retryAfter: 900
            },
            standardHeaders: true,
            legacyHeaders: false,
            handler: (req, res) => {
                logger_1.logger.warn('Upload rate limit exceeded', {
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                });
                res.status(429).json({
                    error: 'Muitos uploads. Tente novamente mais tarde.',
                    retryAfter: 900
                });
            }
        }),
        // Rate limiting para API
        api: (0, express_rate_limit_1.default)({
            windowMs: 60 * 1000, // 1 minuto
            max: 100, // máximo 100 requisições por minuto
            message: {
                error: 'Limite de requisições da API excedido.',
                retryAfter: 60
            },
            standardHeaders: true,
            legacyHeaders: false,
            handler: (req, res) => {
                logger_1.logger.warn('API rate limit exceeded', {
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    url: req.url,
                    method: req.method
                });
                res.status(429).json({
                    error: 'Limite de requisições da API excedido.',
                    retryAfter: 60
                });
            }
        })
    },
    // Configurações do Helmet
    helmet: (0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", ...config_1.default.server.corsOrigins],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
                baseUri: ["'self'"],
                formAction: ["'self'"],
                frameAncestors: ["'self'"],
                scriptSrcAttr: ["'none'"],
                upgradeInsecureRequests: []
            }
        },
        crossOriginEmbedderPolicy: false,
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        },
        noSniff: true,
        xssFilter: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    }),
    // Middleware para detectar ataques
    detectAttacks: (req, res, next) => {
        const suspiciousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /union\s+select/i,
            /drop\s+table/i,
            /delete\s+from/i,
            /insert\s+into/i,
            /update\s+set/i,
            /exec\s*\(/i,
            /eval\s*\(/i,
            /\.\.\//,
            /\.\.\\/,
            /etc\/passwd/i,
            /proc\/self\/environ/i
        ];
        const checkString = (str) => {
            if (typeof str !== 'string')
                return false;
            return suspiciousPatterns.some(pattern => pattern.test(str));
        };
        // Verificar URL
        if (checkString(req.url)) {
            logger_1.logger.warn('Suspicious URL detected', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.url,
                method: req.method
            });
            return res.status(400).json({
                error: 'Requisição suspeita detectada'
            });
        }
        // Verificar query parameters
        for (const [key, value] of Object.entries(req.query)) {
            if (checkString(value)) {
                logger_1.logger.warn('Suspicious query parameter detected', {
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    parameter: key,
                    value: value,
                    url: req.url
                });
                return res.status(400).json({
                    error: 'Parâmetro suspeito detectado'
                });
            }
        }
        // Verificar body
        if (req.body) {
            for (const [key, value] of Object.entries(req.body)) {
                if (checkString(value)) {
                    logger_1.logger.warn('Suspicious body parameter detected', {
                        ip: req.ip,
                        userAgent: req.get('User-Agent'),
                        parameter: key,
                        value: value,
                        url: req.url
                    });
                    return res.status(400).json({
                        error: 'Dados suspeitos detectados'
                    });
                }
            }
        }
        next();
    },
    // Middleware para validar origem
    validateOrigin: (req, res, next) => {
        const origin = req.get('Origin');
        const referer = req.get('Referer');
        // Permitir requisições sem origem (ex: Postman, curl)
        if (!origin && !referer) {
            return next();
        }
        const allowedOrigins = config_1.default.server.corsOrigins;
        const isValidOrigin = allowedOrigins.some(allowedOrigin => {
            if (origin) {
                return origin.startsWith(allowedOrigin);
            }
            if (referer) {
                return referer.startsWith(allowedOrigin);
            }
            return false;
        });
        if (!isValidOrigin) {
            logger_1.logger.warn('Invalid origin detected', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                origin: origin,
                referer: referer,
                url: req.url
            });
            return res.status(403).json({
                error: 'Origem não autorizada'
            });
        }
        next();
    },
    // Middleware para validar User-Agent
    validateUserAgent: (req, res, next) => {
        const userAgent = req.get('User-Agent');
        // Lista de User-Agents suspeitos ou conhecidos por ataques
        const suspiciousUserAgents = [
            /sqlmap/i,
            /nikto/i,
            /nmap/i,
            /masscan/i,
            /zap/i,
            /burp/i,
            /w3af/i,
            /havij/i,
            /acunetix/i,
            /nessus/i,
            /openvas/i,
            /^$/ // User-Agent vazio
        ];
        if (suspiciousUserAgents.some(pattern => pattern.test(userAgent))) {
            logger_1.logger.warn('Suspicious User-Agent detected', {
                ip: req.ip,
                userAgent: userAgent,
                url: req.url,
                method: req.method
            });
            return res.status(403).json({
                error: 'User-Agent não autorizado'
            });
        }
        next();
    },
    // Middleware para limitar tamanho da requisição
    limitRequestSize: (maxSize = 10 * 1024 * 1024) => {
        return (req, res, next) => {
            const contentLength = parseInt(req.get('Content-Length') || '0');
            if (contentLength > maxSize) {
                logger_1.logger.warn('Request size limit exceeded', {
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    contentLength: contentLength,
                    maxSize: maxSize,
                    url: req.url
                });
                return res.status(413).json({
                    error: 'Requisição muito grande',
                    maxSize: maxSize
                });
            }
            next();
        };
    },
    // Middleware para detectar bots
    detectBots: (req, res, next) => {
        const userAgent = req.get('User-Agent') || '';
        const botPatterns = [
            /bot/i,
            /crawler/i,
            /spider/i,
            /scraper/i,
            /curl/i,
            /wget/i,
            /python/i,
            /java/i,
            /php/i
        ];
        const isBot = botPatterns.some(pattern => pattern.test(userAgent));
        if (isBot) {
            logger_1.logger.info('Bot detected', {
                ip: req.ip,
                userAgent: userAgent,
                url: req.url,
                method: req.method
            });
            // Adicionar header para identificar bots
            res.set('X-Bot-Detected', 'true');
        }
        next();
    },
    // Middleware para validar IP
    validateIP: (allowedIPs = []) => {
        return (req, res, next) => {
            if (allowedIPs.length === 0) {
                return next();
            }
            const clientIP = req.ip || req.connection.remoteAddress;
            const isAllowed = allowedIPs.some(ip => {
                if (ip.includes('/')) {
                    // CIDR notation
                    return isIPInCIDR(clientIP, ip);
                }
                return clientIP === ip;
            });
            if (!isAllowed) {
                logger_1.logger.warn('IP not allowed', {
                    ip: clientIP,
                    userAgent: req.get('User-Agent'),
                    url: req.url
                });
                return res.status(403).json({
                    error: 'IP não autorizado'
                });
            }
            next();
        };
    }
};
exports.default = securityConfig;
// Função auxiliar para verificar IP em CIDR
function isIPInCIDR(ip, cidr) {
    // Implementação simplificada - em produção usar uma biblioteca como ip-cidr
    const [network, prefixLength] = cidr.split('/');
    const ipNum = ipToNumber(ip);
    const networkNum = ipToNumber(network);
    const mask = (0xffffffff << (32 - parseInt(prefixLength))) >>> 0;
    return (ipNum & mask) === (networkNum & mask);
}
function ipToNumber(ip) {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}
// Middleware para monitorar tentativas de login
const monitorLoginAttempts = (req, res, next) => {
    const ip = req.ip;
    const email = req.body?.email;
    // Log da tentativa de login
    logger_1.logger.info('Login attempt', {
        ip: ip,
        email: email,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    // Interceptar resposta para logar resultado
    const originalSend = res.send;
    res.send = function (data) {
        const isSuccess = res.statusCode === 200;
        logger_1.logger.auth('login', isSuccess, {
            ip: ip,
            email: email,
            statusCode: res.statusCode
        });
        return originalSend.call(this, data);
    };
    next();
};
exports.monitorLoginAttempts = monitorLoginAttempts;
