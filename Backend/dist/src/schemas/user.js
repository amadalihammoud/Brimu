"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.userUpdateSchema = exports.userLoginSchema = exports.userRegisterSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// User Registration Schema
exports.userRegisterSchema = joi_1.default.object({
    name: joi_1.default.string()
        .min(2)
        .max(100)
        .required()
        .messages({
        'string.empty': 'Nome é obrigatório',
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 100 caracteres'
    }),
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Email deve ser válido',
        'string.empty': 'Email é obrigatório'
    }),
    password: joi_1.default.string()
        .min(6)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
        'string.min': 'Senha deve ter pelo menos 6 caracteres',
        'string.pattern.base': 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'
    }),
    role: joi_1.default.string()
        .valid('admin', 'user', 'employee')
        .default('user')
        .messages({
        'any.only': 'Role deve ser admin, user ou employee'
    })
});
// User Login Schema
exports.userLoginSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Email deve ser válido',
        'string.empty': 'Email é obrigatório'
    }),
    password: joi_1.default.string()
        .required()
        .messages({
        'string.empty': 'Senha é obrigatória'
    })
});
// User Update Schema
exports.userUpdateSchema = joi_1.default.object({
    name: joi_1.default.string()
        .min(2)
        .max(100)
        .messages({
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 100 caracteres'
    }),
    email: joi_1.default.string()
        .email()
        .messages({
        'string.email': 'Email deve ser válido'
    }),
    role: joi_1.default.string()
        .valid('admin', 'user', 'employee')
        .messages({
        'any.only': 'Role deve ser admin, user ou employee'
    }),
    isActive: joi_1.default.boolean()
}).min(1).messages({
    'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});
// Password Change Schema
exports.changePasswordSchema = joi_1.default.object({
    currentPassword: joi_1.default.string()
        .required()
        .messages({
        'string.empty': 'Senha atual é obrigatória'
    }),
    newPassword: joi_1.default.string()
        .min(6)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
        'string.min': 'Nova senha deve ter pelo menos 6 caracteres',
        'string.pattern.base': 'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'
    })
});
