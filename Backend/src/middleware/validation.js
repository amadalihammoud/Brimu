const { body, param, query, validationResult } = require('express-validator');
const config = require('../config');

// Middleware para processar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dados de entrada inválidos',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validações para autenticação
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser um endereço válido'),
  body('password')
    .isLength({ min: config.validation?.passwordMinLength || 6 })
    .withMessage(`Senha deve ter pelo menos ${config.validation?.passwordMinLength || 6} caracteres`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  handleValidationErrors
];

const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: config.validation?.nameMinLength || 2 })
    .withMessage(`Nome deve ter pelo menos ${config.validation?.nameMinLength || 2} caracteres`)
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser um endereço válido'),
  body('password')
    .isLength({ min: config.validation?.passwordMinLength || 6 })
    .withMessage(`Senha deve ter pelo menos ${config.validation?.passwordMinLength || 6} caracteres`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  body('phone')
    .optional()
    .matches(config.validation?.phoneRegex || /^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Telefone deve ter um formato válido'),
  handleValidationErrors
];

// Validações para serviços
const validateService = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome do serviço deve ter entre 2 e 100 caracteres'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Preço deve ser um número positivo'),
  body('category')
    .isIn(['poda', 'remocao', 'plantio', 'manutencao'])
    .withMessage('Categoria deve ser uma das opções válidas'),
  body('duration')
    .isInt({ min: 1, max: 24 })
    .withMessage('Duração deve ser entre 1 e 24 horas'),
  handleValidationErrors
];

// Validações para ordens
const validateOrder = [
  body('clientId')
    .isMongoId()
    .withMessage('ID do cliente deve ser válido'),
  body('serviceId')
    .isMongoId()
    .withMessage('ID do serviço deve ser válido'),
  body('address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Endereço deve ter entre 10 e 200 caracteres'),
  body('scheduledDate')
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
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Observações devem ter no máximo 500 caracteres'),
  handleValidationErrors
];

// Validações para orçamentos
const validateQuote = [
  body('clientId')
    .isMongoId()
    .withMessage('ID do cliente deve ser válido'),
  body('services')
    .isArray({ min: 1 })
    .withMessage('Deve ter pelo menos um serviço'),
  body('services.*.serviceId')
    .isMongoId()
    .withMessage('ID do serviço deve ser válido'),
  body('services.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantidade deve ser um número inteiro positivo'),
  body('validUntil')
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
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Observações devem ter no máximo 500 caracteres'),
  handleValidationErrors
];

// Validações para pagamentos
const validatePayment = [
  body('orderId')
    .isMongoId()
    .withMessage('ID da ordem deve ser válido'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Valor deve ser um número positivo'),
  body('method')
    .isIn(['pix', 'cartao', 'dinheiro', 'transferencia'])
    .withMessage('Método de pagamento deve ser uma das opções válidas'),
  body('status')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Status deve ser uma das opções válidas'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Data de vencimento deve ser uma data válida'),
  handleValidationErrors
];

// Validações para parâmetros de rota
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('ID deve ser um ObjectId válido'),
  handleValidationErrors
];

// Validações para query parameters
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser entre 1 e 100'),
  query('sort')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'name', 'price', 'status'])
    .withMessage('Campo de ordenação inválido'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordem deve ser asc ou desc'),
  handleValidationErrors
];

// Validações para filtros de data
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data inicial deve ser uma data válida'),
  query('endDate')
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

// Validações para upload de arquivos
const validateFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      message: 'Nenhum arquivo foi enviado'
    });
  }

  const files = req.files || [req.file];
  const maxSize = config.upload?.maxFileSize || 10 * 1024 * 1024; // 10MB
  const allowedTypes = config.upload?.allowedMimeTypes || [
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

// Sanitização de entrada
const sanitizeInput = (req, res, next) => {
  // Sanitizar strings removendo caracteres perigosos
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
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

module.exports = {
  handleValidationErrors,
  validateLogin,
  validateRegister,
  validateService,
  validateOrder,
  validateQuote,
  validatePayment,
  validateObjectId,
  validatePagination,
  validateDateRange,
  validateFileUpload,
  sanitizeInput,
  validateRateLimit
};
