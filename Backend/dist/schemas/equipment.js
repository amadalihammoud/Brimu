"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.equipmentAssignmentSchema = exports.equipmentUpdateSchema = exports.equipmentCreateSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Equipment Creation Schema
exports.equipmentCreateSchema = joi_1.default.object({
    name: joi_1.default.string()
        .min(2)
        .max(200)
        .required()
        .messages({
        'string.empty': 'Nome do equipamento é obrigatório',
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 200 caracteres'
    }),
    category: joi_1.default.string()
        .valid('motosserra', 'poda_alta', 'rocadeira', 'cortador_grama', 'caminhao', 'reboque', 'epi', 'outros')
        .required()
        .messages({
        'string.empty': 'Categoria do equipamento é obrigatória',
        'any.only': 'Categoria deve ser uma das opções válidas'
    }),
    brand: joi_1.default.string()
        .min(1)
        .max(100)
        .required()
        .messages({
        'string.empty': 'Marca do equipamento é obrigatória',
        'string.min': 'Marca deve ter pelo menos 1 caractere',
        'string.max': 'Marca deve ter no máximo 100 caracteres'
    }),
    model: joi_1.default.string()
        .min(1)
        .max(100)
        .required()
        .messages({
        'string.empty': 'Modelo do equipamento é obrigatório',
        'string.min': 'Modelo deve ter pelo menos 1 caractere',
        'string.max': 'Modelo deve ter no máximo 100 caracteres'
    }),
    status: joi_1.default.string()
        .valid('ativo', 'manutencao', 'inativo', 'aposentado')
        .default('ativo')
        .messages({
        'any.only': 'Status deve ser: ativo, manutencao, inativo ou aposentado'
    }),
    serialNumber: joi_1.default.string()
        .max(100)
        .allow('')
        .messages({
        'string.max': 'Número de série deve ter no máximo 100 caracteres'
    }),
    purchaseDate: joi_1.default.date()
        .max('now')
        .messages({
        'date.max': 'Data de compra não pode ser no futuro'
    }),
    location: joi_1.default.string()
        .max(200)
        .allow('')
        .messages({
        'string.max': 'Localização deve ter no máximo 200 caracteres'
    }),
    notes: joi_1.default.string()
        .max(1000)
        .allow('')
        .messages({
        'string.max': 'Observações devem ter no máximo 1000 caracteres'
    }),
    maintenance: joi_1.default.object({
        preventiveInterval: joi_1.default.number()
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
exports.equipmentUpdateSchema = joi_1.default.object({
    name: joi_1.default.string()
        .min(2)
        .max(200)
        .messages({
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 200 caracteres'
    }),
    category: joi_1.default.string()
        .valid('motosserra', 'poda_alta', 'rocadeira', 'cortador_grama', 'caminhao', 'reboque', 'epi', 'outros')
        .messages({
        'any.only': 'Categoria deve ser uma das opções válidas'
    }),
    brand: joi_1.default.string()
        .min(1)
        .max(100)
        .messages({
        'string.min': 'Marca deve ter pelo menos 1 caractere',
        'string.max': 'Marca deve ter no máximo 100 caracteres'
    }),
    model: joi_1.default.string()
        .min(1)
        .max(100)
        .messages({
        'string.min': 'Modelo deve ter pelo menos 1 caractere',
        'string.max': 'Modelo deve ter no máximo 100 caracteres'
    }),
    status: joi_1.default.string()
        .valid('ativo', 'manutencao', 'inativo', 'aposentado')
        .messages({
        'any.only': 'Status deve ser: ativo, manutencao, inativo ou aposentado'
    }),
    serialNumber: joi_1.default.string()
        .max(100)
        .allow('')
        .messages({
        'string.max': 'Número de série deve ter no máximo 100 caracteres'
    }),
    purchaseDate: joi_1.default.date()
        .max('now')
        .messages({
        'date.max': 'Data de compra não pode ser no futuro'
    }),
    location: joi_1.default.string()
        .max(200)
        .allow('')
        .messages({
        'string.max': 'Localização deve ter no máximo 200 caracteres'
    }),
    notes: joi_1.default.string()
        .max(1000)
        .allow('')
        .messages({
        'string.max': 'Observações devem ter no máximo 1000 caracteres'
    }),
    maintenance: joi_1.default.object({
        preventiveInterval: joi_1.default.number()
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
exports.equipmentAssignmentSchema = joi_1.default.object({
    assignedTo: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .allow(null)
        .messages({
        'string.pattern.base': 'ID do usuário deve ser um ObjectId válido'
    })
});
