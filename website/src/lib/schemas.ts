/**
 * Schema de Validação com Zod para Máxima Segurança
 */

import { z } from 'zod';

// Schema para validação de login
export const LoginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo')
    .toLowerCase()
    .transform(val => val.trim()),
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(128, 'Senha muito longa')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter ao menos uma letra minúscula, uma maiúscula e um número'),
});

// Schema para criação de usuário
export const CreateUserSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços')
    .transform(val => val.trim()),
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo')
    .toLowerCase()
    .transform(val => val.trim()),
  phone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido - use o formato (99) 99999-9999')
    .optional(),
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(128, 'Senha muito longa')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter ao menos uma letra minúscula, uma maiúscula e um número'),
  role: z.enum(['admin', 'client']).default('client'),
});

// Schema para orçamentos
export const QuoteSchema = z.object({
  title: z.string()
    .min(5, 'Título deve ter no mínimo 5 caracteres')
    .max(200, 'Título muito longo')
    .transform(val => val.trim()),
  description: z.string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .max(2000, 'Descrição muito longa')
    .transform(val => val.trim()),
  services: z.array(z.object({
    name: z.string().min(1, 'Nome do serviço é obrigatório'),
    quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
    price: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
  })).min(1, 'Pelo menos um serviço é obrigatório'),
  clientEmail: z.string()
    .email('Email do cliente inválido')
    .max(255, 'Email muito longo'),
  validUntil: z.string()
    .refine(val => new Date(val) > new Date(), 'Data de validade deve ser futura'),
});

// Schema para ordens de serviço
export const OrderSchema = z.object({
  title: z.string()
    .min(5, 'Título deve ter no mínimo 5 caracteres')
    .max(200, 'Título muito longo')
    .transform(val => val.trim()),
  description: z.string()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .max(2000, 'Descrição muito longa')
    .transform(val => val.trim()),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  assignedTo: z.string().optional(),
  dueDate: z.string()
    .refine(val => new Date(val) >= new Date(), 'Data de vencimento não pode ser no passado'),
  estimatedHours: z.number()
    .min(0.5, 'Horas estimadas deve ser no mínimo 0.5')
    .max(1000, 'Horas estimadas muito alta'),
});

// Schema para pagamentos
export const PaymentSchema = z.object({
  amount: z.number()
    .min(0.01, 'Valor deve ser maior que zero')
    .max(1000000, 'Valor muito alto'),
  method: z.enum(['credit_card', 'debit_card', 'bank_transfer', 'pix', 'cash']),
  description: z.string()
    .min(5, 'Descrição deve ter no mínimo 5 caracteres')
    .max(500, 'Descrição muito longa')
    .transform(val => val.trim()),
  dueDate: z.string().optional(),
  clientEmail: z.string()
    .email('Email do cliente inválido')
    .max(255, 'Email muito longo'),
});

// Schema para busca e filtros
export const SearchSchema = z.object({
  query: z.string()
    .max(200, 'Busca muito longa')
    .transform(val => val.trim())
    .refine(val => !/[<>\"'%;()&+]/.test(val), 'Caracteres especiais não permitidos na busca'),
  page: z.number().min(1).max(1000).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.enum(['created_at', 'updated_at', 'name', 'email']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Schema para configurações do usuário
export const UserSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  notifications: z.object({
    email: z.boolean().default(true),
    browser: z.boolean().default(true),
    mobile: z.boolean().default(false),
  }),
  privacy: z.object({
    profileVisible: z.boolean().default(false),
    shareAnalytics: z.boolean().default(false),
  }),
  language: z.enum(['pt-BR', 'en-US']).default('pt-BR'),
});

// Schema para validação de upload de arquivos
export const FileUploadSchema = z.object({
  name: z.string()
    .min(1, 'Nome do arquivo é obrigatório')
    .max(255, 'Nome do arquivo muito longo')
    .refine(val => !/[<>:"/\\|?*]/.test(val), 'Nome do arquivo contém caracteres inválidos'),
  size: z.number()
    .min(1, 'Arquivo não pode estar vazio')
    .max(10 * 1024 * 1024, 'Arquivo muito grande (máximo 10MB)'),
  type: z.string()
    .refine(val => [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ].includes(val), 'Tipo de arquivo não permitido'),
});

// Tipos TypeScript inferidos dos schemas
export type LoginData = z.infer<typeof LoginSchema>;
export type CreateUserData = z.infer<typeof CreateUserSchema>;
export type QuoteData = z.infer<typeof QuoteSchema>;
export type OrderData = z.infer<typeof OrderSchema>;
export type PaymentData = z.infer<typeof PaymentSchema>;
export type SearchData = z.infer<typeof SearchSchema>;
export type UserSettingsData = z.infer<typeof UserSettingsSchema>;
export type FileUploadData = z.infer<typeof FileUploadSchema>;

// Função utilitária para validação com tratamento de erro
export const validateData = <T>(schema: z.ZodSchema<T>, data: any): { 
  success: true; 
  data: T; 
} | { 
  success: false; 
  errors: string[]; 
} => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return {
      success: false,
      errors: ['Erro de validação desconhecido']
    };
  }
};

// Função para sanitizar dados antes da validação
export const sanitizeData = (data: any): any => {
  if (typeof data === 'string') {
    return data
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    Object.keys(data).forEach(key => {
      sanitized[key] = sanitizeData(data[key]);
    });
    return sanitized;
  }
  
  return data;
};

// Middleware para validação de formulários React Hook Form
export const createZodResolver = <T>(schema: z.ZodSchema<T>) => {
  return (data: any) => {
    const sanitizedData = sanitizeData(data);
    const result = validateData(schema, sanitizedData);
    
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    
    const errors: Record<string, { message: string }> = {};
    result.errors.forEach(error => {
      const [field, message] = error.split(': ');
      errors[field] = { message };
    });
    
    return { values: {}, errors };
  };
};