import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '../types';

// Generic validation middleware
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

      const response: ApiResponse = {
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

// Query validation middleware
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

      const response: ApiResponse = {
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

// Params validation middleware
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

      const response: ApiResponse = {
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

// Common validation schemas
export const commonSchemas = {
  mongoId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'ID deve ser um ObjectId válido',
      'string.empty': 'ID é obrigatório'
    }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().max(100),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  search: Joi.object({
    q: Joi.string().max(200).allow(''),
    status: Joi.string().max(50),
    category: Joi.string().max(100),
    dateFrom: Joi.date(),
    dateTo: Joi.date().greater(Joi.ref('dateFrom'))
  })
};