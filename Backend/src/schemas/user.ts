import Joi from 'joi';

// User Registration Schema
export const userRegisterSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Nome é obrigatório',
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email deve ser válido',
      'string.empty': 'Email é obrigatório'
    }),
  
  password: Joi.string()
    .min(6)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'string.pattern.base': 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'
    }),
  
  role: Joi.string()
    .valid('admin', 'user', 'employee')
    .default('user')
    .messages({
      'any.only': 'Role deve ser admin, user ou employee'
    })
});

// User Login Schema
export const userLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email deve ser válido',
      'string.empty': 'Email é obrigatório'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Senha é obrigatória'
    })
});

// User Update Schema
export const userUpdateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres'
    }),
  
  email: Joi.string()
    .email()
    .messages({
      'string.email': 'Email deve ser válido'
    }),
  
  role: Joi.string()
    .valid('admin', 'user', 'employee')
    .messages({
      'any.only': 'Role deve ser admin, user ou employee'
    }),
  
  isActive: Joi.boolean()
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

// Password Change Schema
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Senha atual é obrigatória'
    }),
  
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Nova senha deve ter pelo menos 6 caracteres',
      'string.pattern.base': 'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'
    })
});