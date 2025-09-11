"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const config = {
    // Configurações do servidor
    server: {
        port: process.env.PORT || 5000,
        host: process.env.HOST || '0.0.0.0',
        environment: process.env.NODE_ENV || 'development',
        corsOrigins: [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:5173'
        ]
    },
    // Configurações do banco de dados
    database: {
        uri: process.env.MONGODB_URI,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferMaxEntries: 0,
            bufferCommands: false
        }
    },
    // Configurações de autenticação
    auth: {
        jwtSecret: process.env.JWT_SECRET || 'brimu_secret_key_2024_secure',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12')
    },
    // Configurações de rate limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10000'), // Aumentado para desenvolvimento
        loginWindowMs: 15 * 60 * 1000, // 15 minutos
        loginMaxAttempts: 20 // Aumentado para desenvolvimento
    },
    // Configurações de upload
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
        maxFiles: parseInt(process.env.MAX_FILES || '10'),
        allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        uploadPath: path_1.default.join(__dirname, '../../uploads')
    },
    // Configurações de email
    email: {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM || 'noreply@brimu.com'
    },
    // Configurações de backup
    backup: {
        enabled: process.env.BACKUP_ENABLED === 'true',
        schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Diário às 2h
        retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
        backupPath: path_1.default.join(__dirname, '../../storage/backups')
    },
    // Configurações de segurança
    security: {
        helmet: {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173"],
                    fontSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"],
                },
            },
            crossOriginEmbedderPolicy: false,
        }
    },
    // Configurações de logs
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/app.log',
        maxSize: process.env.LOG_MAX_SIZE || '10m',
        maxFiles: process.env.LOG_MAX_FILES || '5'
    },
    // Configurações de cache
    cache: {
        ttl: parseInt(process.env.CACHE_TTL || '300'), // 5 minutos
        maxSize: parseInt(process.env.CACHE_MAX_SIZE || '100'),
        defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '300') // 5 minutos
    },
    // Configurações do Redis
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0')
    },
    // Configurações de validação
    validation: {
        passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '6'),
        nameMinLength: parseInt(process.env.NAME_MIN_LENGTH || '2'),
        phoneMinLength: parseInt(process.env.PHONE_MIN_LENGTH || '10'),
        descriptionMaxLength: parseInt(process.env.DESCRIPTION_MAX_LENGTH || '5000'),
        phoneRegex: /^[\+]?[1-9][\d]{0,15}$/
    }
};
exports.default = config;
