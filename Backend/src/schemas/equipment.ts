import Joi from 'joi';

// Equipment Creation Schema
export const equipmentCreateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Nome do equipamento é obrigatório',
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 200 caracteres'
    }),
  
  category: Joi.string()
    .valid('motosserra', 'poda_alta', 'rocadeira', 'cortador_grama', 'caminhao', 'reboque', 'epi', 'outros')
    .required()
    .messages({
      'string.empty': 'Categoria do equipamento é obrigatória',
      'any.only': 'Categoria deve ser uma das opções válidas'
    }),

  brand: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Marca do equipamento é obrigatória',
      'string.min': 'Marca deve ter pelo menos 1 caractere',
      'string.max': 'Marca deve ter no máximo 100 caracteres'
    }),

  model: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Modelo do equipamento é obrigatório',
      'string.min': 'Modelo deve ter pelo menos 1 caractere',
      'string.max': 'Modelo deve ter no máximo 100 caracteres'
    }),
  
  status: Joi.string()
    .valid('ativo', 'manutencao', 'inativo', 'aposentado')
    .default('ativo')
    .messages({
      'any.only': 'Status deve ser: ativo, manutencao, inativo ou aposentado'
    }),
  
  serialNumber: Joi.string()
    .max(100)
    .allow('')
    .messages({
      'string.max': 'Número de série deve ter no máximo 100 caracteres'
    }),
  
  purchaseDate: Joi.date()
    .max('now')
    .messages({
      'date.max': 'Data de compra não pode ser no futuro'
    }),
  
  location: Joi.string()
    .max(200)
    .allow('')
    .messages({
      'string.max': 'Localização deve ter no máximo 200 caracteres'
    }),
  
  notes: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Observações devem ter no máximo 1000 caracteres'
    }),

  maintenance: Joi.object({
    preventiveInterval: Joi.number()
      .min(1)
      .max(365)
      .default(30)
      .messages({
        'number.min': 'Intervalo de manutenção deve ser pelo menos 1 dia',
        'number.max': 'Intervalo de manutenção deve ser no máximo 365 dias'
      })
  }).optional()
});

// Equipment Update Schema
export const equipmentUpdateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(200)
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 200 caracteres'
    }),
  
  category: Joi.string()
    .valid('motosserra', 'poda_alta', 'rocadeira', 'cortador_grama', 'caminhao', 'reboque', 'epi', 'outros')
    .messages({
      'any.only': 'Categoria deve ser uma das opções válidas'
    }),

  brand: Joi.string()
    .min(1)
    .max(100)
    .messages({
      'string.min': 'Marca deve ter pelo menos 1 caractere',
      'string.max': 'Marca deve ter no máximo 100 caracteres'
    }),

  model: Joi.string()
    .min(1)
    .max(100)
    .messages({
      'string.min': 'Modelo deve ter pelo menos 1 caractere',
      'string.max': 'Modelo deve ter no máximo 100 caracteres'
    }),
  
  status: Joi.string()
    .valid('ativo', 'manutencao', 'inativo', 'aposentado')
    .messages({
      'any.only': 'Status deve ser: ativo, manutencao, inativo ou aposentado'
    }),
  
  serialNumber: Joi.string()
    .max(100)
    .allow('')
    .messages({
      'string.max': 'Número de série deve ter no máximo 100 caracteres'
    }),
  
  purchaseDate: Joi.date()
    .max('now')
    .messages({
      'date.max': 'Data de compra não pode ser no futuro'
    }),
  
  location: Joi.string()
    .max(200)
    .allow('')
    .messages({
      'string.max': 'Localização deve ter no máximo 200 caracteres'
    }),
  
  notes: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Observações devem ter no máximo 1000 caracteres'
    }),

  maintenance: Joi.object({
    preventiveInterval: Joi.number()
      .min(1)
      .max(365)
      .messages({
        'number.min': 'Intervalo de manutenção deve ser pelo menos 1 dia',
        'number.max': 'Intervalo de manutenção deve ser no máximo 365 dias'
      })
  }).optional()
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

// Equipment Assignment Schema
export const equipmentAssignmentSchema = Joi.object({
  assignedTo: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null)
    .messages({
      'string.pattern.base': 'ID do usuário deve ser um ObjectId válido'
    })
});