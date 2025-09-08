"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRateLimit = exports.sanitizeInput = exports.validateFileUpload = exports.validateDateRange = exports.validatePagination = exports.validateObjectId = exports.validatePayment = exports.validateQuote = exports.validateOrder = exports.validateService = exports.validateRegister = exports.validateLogin = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const config_1 = __importDefault(require("../config"));
// Middleware para processar erros de validação
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Dados de entrada inválidos',
            errors: errors.array().map((error) => ({
                field: error.path || error.param,
                message: error.msg,
                value: error.value || error.nestedErrors
            }))
        });
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
// Validações para autenticação
const validateLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email deve ser um endereço válido'),
    (0, express_validator_1.body)('password')
        .isLength({ min: config_1.default.validation.passwordMinLength || 6 })
        .withMessage(`Senha deve ter pelo menos ${config_1.default.validation.passwordMinLength || 6} caracteres`)
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
    handleValidationErrors
];
exports.validateLogin = validateLogin;
const validateRegister = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: config_1.default.validation.nameMinLength || 2 })
        .withMessage(`Nome deve ter pelo menos ${config_1.default.validation.nameMinLength || 2} caracteres`)
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
        .withMessage('Nome deve conter apenas letras e espaços'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email deve ser um endereço válido'),
    (0, express_validator_1.body)('password')
        .isLength({ min: config_1.default.validation.passwordMinLength || 6 })
        .withMessage(`Senha deve ter pelo menos ${config_1.default.validation.passwordMinLength || 6} caracteres`)
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
    (0, express_validator_1.body)('phone')
        .optional()
        .matches(config_1.default.validation.phoneRegex || /^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Telefone deve ter um formato válido'),
    handleValidationErrors
];
exports.validateRegister = validateRegister;
// Validações para serviços
const validateService = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome do serviço deve ter entre 2 e 100 caracteres'),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
    (0, express_validator_1.body)('price')
        .isFloat({ min: 0 })
        .withMessage('Preço deve ser um número positivo'),
    (0, express_validator_1.body)('category')
        .isIn(['poda', 'remocao', 'plantio', 'manutencao'])
        .withMessage('Categoria deve ser uma das opções válidas'),
    (0, express_validator_1.body)('duration')
        .isInt({ min: 1, max: 24 })
        .withMessage('Duração deve ser entre 1 e 24 horas'),
    handleValidationErrors
];
exports.validateService = validateService;
// Validações para ordens
const validateOrder = [
    (0, express_validator_1.body)('clientId')
        .isMongoId()
        .withMessage('ID do cliente deve ser válido'),
    (0, express_validator_1.body)('serviceId')
        .isMongoId()
        .withMessage('ID do serviço deve ser válido'),
    (0, express_validator_1.body)('address')
        .trim()
        .isLength({ min: 10, max: 200 })
        .withMessage('Endereço deve ter entre 10 e 200 caracteres'),
    (0, express_validator_1.body)('scheduledDate')
        .isISO8601()
        .withMessage('Data agendada deve ser uma data válida')
        .custom((value) => {
        const date = new Date(value);
        const now = new Date();
        if (date <= now) {
            throw new Error('Data agendada deve ser no futuro');
        }
        return true;
    }),
    (0, express_validator_1.body)('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Observações devem ter no máximo 500 caracteres'),
    handleValidationErrors
];
exports.validateOrder = validateOrder;
// Validações para orçamentos
const validateQuote = [
    (0, express_validator_1.body)('clientId')
        .isMongoId()
        .withMessage('ID do cliente deve ser válido'),
    (0, express_validator_1.body)('services')
        .isArray({ min: 1 })
        .withMessage('Deve ter pelo menos um serviço'),
    (0, express_validator_1.body)('services.*.serviceId')
        .isMongoId()
        .withMessage('ID do serviço deve ser válido'),
    (0, express_validator_1.body)('services.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Quantidade deve ser um número inteiro positivo'),
    (0, express_validator_1.body)('validUntil')
        .isISO8601()
        .withMessage('Data de validade deve ser uma data válida')
        .custom((value) => {
        const date = new Date(value);
        const now = new Date();
        if (date <= now) {
            throw new Error('Data de validade deve ser no futuro');
        }
        return true;
    }),
    (0, express_validator_1.body)('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Observações devem ter no máximo 500 caracteres'),
    handleValidationErrors
];
exports.validateQuote = validateQuote;
// Validações para pagamentos
const validatePayment = [
    (0, express_validator_1.body)('orderId')
        .isMongoId()
        .withMessage('ID da ordem deve ser válido'),
    (0, express_validator_1.body)('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Valor deve ser um número positivo'),
    (0, express_validator_1.body)('method')
        .isIn(['pix', 'cartao', 'dinheiro', 'transferencia'])
        .withMessage('Método de pagamento deve ser uma das opções válidas'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['pending', 'paid', 'failed', 'refunded'])
        .withMessage('Status deve ser uma das opções válidas'),
    (0, express_validator_1.body)('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Data de vencimento deve ser uma data válida'),
    handleValidationErrors
];
exports.validatePayment = validatePayment;
// Validações para parâmetros de rota
const validateObjectId = [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('ID deve ser um ObjectId válido'),
    handleValidationErrors
];
exports.validateObjectId = validateObjectId;
// Validações para query parameters
const validatePagination = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Página deve ser um número inteiro positivo'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limite deve ser entre 1 e 100'),
    (0, express_validator_1.query)('sort')
        .optional()
        .isIn(['createdAt', 'updatedAt', 'name', 'price', 'status'])
        .withMessage('Campo de ordenação inválido'),
    (0, express_validator_1.query)('order')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Ordem deve ser asc ou desc'),
    handleValidationErrors
];
exports.validatePagination = validatePagination;
// Validações para filtros de data
const validateDateRange = [
    (0, express_validator_1.query)('startDate')
        .optional()
        .isISO8601()
        .withMessage('Data inicial deve ser uma data válida'),
    (0, express_validator_1.query)('endDate')
        .optional()
        .isISO8601()
        .withMessage('Data final deve ser uma data válida')
        .custom((value, { req }) => {
        if (req.query.startDate && value <= req.query.startDate) {
            throw new Error('Data final deve ser posterior à data inicial');
        }
        return true;
    }),
    handleValidationErrors
];
exports.validateDateRange = validateDateRange;
// Validações para upload de arquivos
const validateFileUpload = (req, res, next) => {
    if (!req.file && !req.files) {
        return res.status(400).json({
            message: 'Nenhum arquivo foi enviado'
        });
    }
    const files = req.files || [req.file];
    const maxSize = config_1.default.upload?.maxFileSize || 10 * 1024 * 1024; // 10MB
    const allowedTypes = config_1.default.upload?.allowedMimeTypes || [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf'
    ];
    for (const file of files) {
        if (file.size > maxSize) {
            return res.status(400).json({
                message: `Arquivo ${file.originalname} é muito grande. Máximo permitido: ${maxSize / 1024 / 1024}MB`
            });
        }
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({
                message: `Tipo de arquivo ${file.mimetype} não é permitido`
            });
        }
    }
    next();
};
exports.validateFileUpload = validateFileUpload;
// Sanitização de entrada
const sanitizeInput = (req, res, next) => {
    // Sanitizar strings removendo caracteres perigosos
    const sanitizeString = (str) => {
        if (typeof str !== 'string')
            return str;
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
            .replace(/javascript:/gi, '') // Remove javascript: URLs
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .trim();
    };
    // Sanitizar body
    if (req.body) {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizeString(req.body[key]);
            }
        }
    }
    // Sanitizar query
    if (req.query) {
        for (const key in req.query) {
            if (typeof req.query[key] === 'string') {
                req.query[key] = sanitizeString(req.query[key]);
            }
        }
    }
    next();
};
exports.sanitizeInput = sanitizeInput;
// Validação de rate limiting personalizado
const validateRateLimit = (windowMs, maxRequests) => {
    return (req, res, next) => {
        const key = req.ip;
        const now = Date.now();
        if (!req.rateLimitStore) {
            req.rateLimitStore = new Map();
        }
        const store = req.rateLimitStore;
        if (!store.has(key)) {
            store.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }
        const data = store.get(key);
        if (now > data.resetTime) {
            data.count = 1;
            data.resetTime = now + windowMs;
            return next();
        }
        if (data.count >= maxRequests) {
            return res.status(429).json({
                message: 'Muitas requisições. Tente novamente mais tarde.',
                retryAfter: Math.ceil((data.resetTime - now) / 1000)
            });
        }
        data.count++;
        next();
    };
};
exports.validateRateLimit = validateRateLimit;
