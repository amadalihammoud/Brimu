/**
 * CSRF Protection Infrastructure
 * Implementa proteção contra ataques Cross-Site Request Forgery
 */

// Gerar token CSRF criptograficamente seguro
export const generateCSRFToken = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback para ambientes sem crypto API
    return Math.random().toString(36).substring(2) + 
           Math.random().toString(36).substring(2) + 
           Date.now().toString(36);
  }
};

// Gerenciar tokens CSRF no sessionStorage
export const csrfTokenManager = {
  // Chave para armazenamento do token
  STORAGE_KEY: 'csrf_token',
  
  // Gerar e armazenar novo token
  generateToken(): string {
    const token = generateCSRFToken();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.STORAGE_KEY, token);
    }
    return token;
  },
  
  // Obter token atual ou gerar novo se não existir
  getToken(): string {
    if (typeof window !== 'undefined') {
      let token = sessionStorage.getItem(this.STORAGE_KEY);
      if (!token) {
        token = this.generateToken();
      }
      return token;
    }
    return '';
  },
  
  // Validar token
  validateToken(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    const storedToken = this.getToken();
    return storedToken === token;
  },
  
  // Remover token
  clearToken(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.STORAGE_KEY);
    }
  },
  
  // Rotacionar token (gerar novo após uso)
  rotateToken(): string {
    this.clearToken();
    return this.generateToken();
  }
};

// Hook React para gerenciar CSRF tokens
export const useCSRFToken = () => {
  const getToken = () => csrfTokenManager.getToken();
  const generateToken = () => csrfTokenManager.generateToken();
  const validateToken = (token: string) => csrfTokenManager.validateToken(token);
  const rotateToken = () => csrfTokenManager.rotateToken();
  
  return {
    getToken,
    generateToken,
    validateToken,
    rotateToken
  };
};

// Middleware para adicionar CSRF token aos formulários
export const withCSRFProtection = <T extends Record<string, any>>(formData: T): T & { _csrf: string } => {
  const token = csrfTokenManager.getToken();
  return {
    ...formData,
    _csrf: token
  };
};

// Interceptor para requisições API com CSRF
export const addCSRFToRequest = (config: any) => {
  // Apenas adicionar CSRF para métodos que modificam dados
  const methodsRequiringCSRF = ['POST', 'PUT', 'PATCH', 'DELETE'];
  
  if (methodsRequiringCSRF.includes(config.method?.toUpperCase())) {
    const token = csrfTokenManager.getToken();
    
    // Adicionar como header
    config.headers = {
      ...config.headers,
      'X-CSRF-Token': token
    };
    
    // Para formulários, adicionar também no body se for form data
    if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
      config.data = withCSRFProtection(config.data);
    }
  }
  
  return config;
};

// Componente React para campo hidden com CSRF token
export const CSRFTokenField: React.FC = () => {
  const token = csrfTokenManager.getToken();
  
  return (
    <input
      type="hidden"
      name="_csrf"
      value={token}
    />
  );
};

// Validar origem da requisição (adicional ao CSRF)
export const validateOrigin = (origin: string, allowedOrigins: string[]): boolean => {
  if (!origin) return false;
  
  // Verificar se a origem está na lista de origens permitidas
  return allowedOrigins.some(allowedOrigin => {
    // Permitir correspondência exata
    if (allowedOrigin === origin) return true;
    
    // Permitir wildcard subdomains (ex: *.example.com)
    if (allowedOrigin.startsWith('*.')) {
      const domain = allowedOrigin.substring(2);
      return origin.endsWith(domain);
    }
    
    return false;
  });
};

// Headers de segurança para prevenir CSRF
export const antiCSRFHeaders = {
  'X-Requested-With': 'XMLHttpRequest',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// Configurações de SameSite cookie para CSRF protection
export const sameSiteCookieConfig = {
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  maxAge: 3600 // 1 hora
};

// Utilitário para verificar se a requisição é "same-origin"
export const isSameOrigin = (url: string): boolean => {
  if (typeof window === 'undefined') return true;
  
  try {
    const requestUrl = new URL(url, window.location.origin);
    return requestUrl.origin === window.location.origin;
  } catch {
    return false;
  }
};

// Rate limiting específico para CSRF tokens
class CSRFRateLimit {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts = 10;
  private readonly windowMs = 60 * 1000; // 1 minuto

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Remove tentativas antigas
    const validAttempts = attempts.filter(timestamp => now - timestamp < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    
    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export const csrfRateLimit = new CSRFRateLimit();

// Logger específico para eventos CSRF
export const csrfLogger = {
  logTokenGeneration: (userAgent?: string) => {
    console.log('[CSRF] Token generated', { userAgent, timestamp: new Date().toISOString() });
  },
  
  logTokenValidation: (success: boolean, token?: string) => {
    console.log('[CSRF] Token validation', { 
      success, 
      tokenLength: token?.length || 0,
      timestamp: new Date().toISOString() 
    });
  },
  
  logSuspiciousActivity: (activity: string, details: any) => {
    console.warn('[CSRF] Suspicious activity detected', { activity, details, timestamp: new Date().toISOString() });
  }
};

// Implementar double-submit cookie pattern (para uso futuro com backend)
export const doubleSubmitPattern = {
  // Gerar cookie CSRF
  generateCookieToken(): string {
    const token = generateCSRFToken();
    // Em produção, o backend definiria o cookie
    // document.cookie = `csrf-token=${token}; Secure; SameSite=Strict; Path=/`;
    return token;
  },
  
  // Validar double-submit
  validateDoubleSubmit(headerToken: string, cookieToken: string): boolean {
    return headerToken === cookieToken && headerToken.length > 0;
  }
};

export default {
  generateCSRFToken,
  csrfTokenManager,
  useCSRFToken,
  withCSRFProtection,
  addCSRFToRequest,
  CSRFTokenField,
  validateOrigin,
  antiCSRFHeaders,
  sameSiteCookieConfig,
  isSameOrigin,
  csrfRateLimit,
  csrfLogger,
  doubleSubmitPattern
};