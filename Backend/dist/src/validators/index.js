"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonSchemas = exports.validateParams = exports.validateQuery = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
// Generic validation middleware
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });
        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            const response = {
                success: false,
                error: 'Dados de entrada inválidos',
                message: 'Por favor, corrija os erros abaixo',
                data: { errors: errorDetails }
            };
            res.status(400).json(response);
            return;
        }
        next();
    };
};
exports.validate = validate;
// Query validation middleware
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });
        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            const response = {
                success: false,
                error: 'Parâmetros de consulta inválidos',
                data: { errors: errorDetails }
            };
            res.status(400).json(response);
            return;
        }
        req.query = value;
        next();
    };
};
exports.validateQuery = validateQuery;
// Params validation middleware
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });
        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            const response = {
                success: false,
                error: 'Parâmetros da URL inválidos',
                data: { errors: errorDetails }
            };
            res.status(400).json(response);
            return;
        }
        req.params = value;
        next();
    };
};
exports.validateParams = validateParams;
// Common validation schemas
exports.commonSchemas = {
    mongoId: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
        'string.pattern.base': 'ID deve ser um ObjectId válido',
        'string.empty': 'ID é obrigatório'
    }),
    pagination: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(20),
        sort: joi_1.default.string().max(100),
        order: joi_1.default.string().valid('asc', 'desc').default('desc')
    }),
    search: joi_1.default.object({
        q: joi_1.default.string().max(200).allow(''),
        status: joi_1.default.string().max(50),
        category: joi_1.default.string().max(100),
        dateFrom: joi_1.default.date(),
        dateTo: joi_1.default.date().greater(joi_1.default.ref('dateFrom'))
    })
};
