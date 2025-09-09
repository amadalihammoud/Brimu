/**
 * Utilitários de Segurança para o Sistema Next.js
 */

// Sanitização básica de strings para prevenir XSS
export const sanitizeHtml = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    // Remove tags script
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove eventos JavaScript
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: URLs
    .replace(/javascript:/gi, '')
    // Escapar caracteres perigosos
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Sanitização para inputs de formulário
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/[<>'"]/g, ''); // Remove caracteres perigosos
};

// Validação de email segura
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.trim().toLowerCase());
};

// Validação de URL segura
export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Rate limiting básico no client-side
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) { // 5 tentativas em 15 min
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove tentativas antigas
    const validAttempts = attempts.filter(timestamp => now - timestamp < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Adiciona tentativa atual
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Instância global do rate limiter para login
export const loginRateLimiter = new RateLimiter(3, 5 * 60 * 1000); // 3 tentativas em 5 min

// Validação de dados do usuário
export interface UserValidation {
  isValid: boolean;
  errors: string[];
}

export const validateUserData = (userData: any): UserValidation => {
  const errors: string[] = [];
  
  if (!userData) {
    errors.push('Dados do usuário são obrigatórios');
    return { isValid: false, errors };
  }
  
  if (!userData.id || typeof userData.id !== 'string') {
    errors.push('ID do usuário inválido');
  }
  
  if (!userData.email || !isValidEmail(userData.email)) {
    errors.push('Email inválido');
  }
  
  if (!userData.name || typeof userData.name !== 'string' || userData.name.trim().length < 1) {
    errors.push('Nome inválido');
  }
  
  if (!userData.role || !['admin', 'client'].includes(userData.role)) {
    errors.push('Role inválida');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Headers de segurança recomendados
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), location=()',
};

// Configuração CSP segura
export const contentSecurityPolicy = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-eval'"], // Next.js requer unsafe-eval
  'style-src': ["'self'", "'unsafe-inline'"], // Tailwind requer unsafe-inline
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", 'http://localhost:3001'], // API backend
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

// Log de eventos de segurança
export const securityLogger = {
  logAuthAttempt: (email: string, success: boolean, ip?: string) => {
    console.log(`[SECURITY] Auth attempt: ${email}, success: ${success}, ip: ${ip || 'unknown'}`);
  },
  
  logUnauthorizedAccess: (path: string, userAgent?: string) => {
    console.warn(`[SECURITY] Unauthorized access attempt: ${path}, user-agent: ${userAgent || 'unknown'}`);
  },
  
  logSuspiciousActivity: (activity: string, details: any) => {
    console.warn(`[SECURITY] Suspicious activity: ${activity}`, details);
  }
};

// Utilitário para gerar tokens CSRF (para futuro uso)
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Verificar se o ambiente é desenvolvimento
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

// Remover dados sensíveis para logs (sanitização de dados)
export const sanitizeForLog = (data: any): any => {
  if (!data) return data;
  
  const sensitiveFields = ['password', 'token', 'authorization', 'cookie'];
  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
  });
  
  return sanitized;
};