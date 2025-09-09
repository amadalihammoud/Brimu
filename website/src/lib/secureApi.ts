import axios, { AxiosRequestConfig } from 'axios';
import { securityLogger, sanitizeForLog, RateLimiter } from './security';
import { csrfTokenManager } from './csrf';

// Rate limiter para requisições API
const apiRateLimiter = new RateLimiter(100, 60 * 1000); // 100 req/min

// Configuração da API com práticas de segurança aprimoradas
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    // Adicionar headers de segurança
    'X-Requested-With': 'XMLHttpRequest',
  },
  // Habilitar cookies para HttpOnly tokens
  withCredentials: true,
});

// Interceptor para adicionar token de autenticação com segurança aprimorada
api.interceptors.request.use(
  (config) => {
    // Rate limiting
    if (!apiRateLimiter.isAllowed('general')) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Para requisições que modificam dados, adicionar CSRF token
    const methodsRequiringCSRF = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (methodsRequiringCSRF.includes(config.method?.toUpperCase() || '')) {
      const csrfToken = csrfTokenManager.getToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    // Token de fallback (se HttpOnly cookies falharem)
    let token = null;
    if (typeof window !== 'undefined') {
      token = sessionStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Log da requisição (sem dados sensíveis)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, 
                  sanitizeForLog(config.data));
    }

    return config;
  },
  (error) => {
    securityLogger.logSuspiciousActivity('API Request Error', sanitizeForLog(error));
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas com segurança aprimorada
api.interceptors.response.use(
  (response) => {
    // Log de sucesso (sem dados sensíveis)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    // Log do erro
    securityLogger.logSuspiciousActivity('API Response Error', {
      status,
      url,
      message: error.message
    });
    
    // Tratamento de erros de autenticação
    if (status === 401) {
      // Limpar dados de autenticação (incluindo cookies via API call)
      if (typeof window !== 'undefined') {
        // Tentar logout seguro primeiro para limpar cookies HttpOnly
        try {
          await api.post('/auth/logout');
        } catch (logoutError) {
          console.warn('Error during secure logout:', logoutError);
        }
        
        // Limpar storage local
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userData');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        
        // Redirecionar apenas se não estivermos já na página de login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    // Tratamento de erros de autorização
    if (status === 403) {
      securityLogger.logUnauthorizedAccess(url || 'unknown', navigator.userAgent);
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?error=unauthorized';
      }
    }
    
    // Rate limiting do servidor
    if (status === 429) {
      console.warn('Rate limited by server');
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Cliente API com métodos seguros
export const secureApiClient = {
  // Autenticação
  login: async (credentials: { email: string; password: string }) => {
    if (!apiRateLimiter.isAllowed('login')) {
      throw new Error('Too many login attempts. Please wait before trying again.');
    }
    
    securityLogger.logAuthAttempt(credentials.email, false); // Log da tentativa
    
    try {
      const response = await api.post('/auth/login', credentials);
      securityLogger.logAuthAttempt(credentials.email, true); // Log do sucesso
      return response;
    } catch (error) {
      securityLogger.logAuthAttempt(credentials.email, false); // Log do erro
      throw error;
    }
  },
  
  register: (userData: any) => api.post('/auth/register', userData),
  
  // Verificação de token
  verifyToken: () => api.get('/auth/verify'),
  
  // Dados do usuário atual (com validação server-side)
  getCurrentUser: () => api.get('/auth/me'),
  
  // Obter token CSRF
  getCSRFToken: () => api.get('/auth/csrf-token'),
  
  // Orçamentos
  getQuotes: () => api.get('/quotes'),
  createQuote: (quoteData: any) => api.post('/quotes', quoteData),
  updateQuote: (id: string, quoteData: any) => api.put(`/quotes/${id}`, quoteData),
  deleteQuote: (id: string) => api.delete(`/quotes/${id}`),
  
  // Ordens de Serviço
  getOrders: () => api.get('/orders'),
  createOrder: (orderData: any) => api.post('/orders', orderData),
  updateOrder: (id: string, orderData: any) => api.put(`/orders/${id}`, orderData),
  deleteOrder: (id: string) => api.delete(`/orders/${id}`),
  
  // Usuários/Clientes
  getUsers: () => api.get('/users'),
  createUser: (userData: any) => api.post('/users', userData),
  updateUser: (id: string, userData: any) => api.put(`/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  
  // Pagamentos
  getPayments: () => api.get('/payments'),
  createPayment: (paymentData: any) => api.post('/payments', paymentData),
  updatePayment: (id: string, paymentData: any) => api.put(`/payments/${id}`, paymentData),
  
  // Health check
  healthCheck: () => api.get('/health'),
};

// Wrapper para requisições com retry automático
export const withRetry = async <T>(
  apiCall: () => Promise<T>, 
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Não fazer retry em erros de autenticação/autorização
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw error;
      }
      
      // Delay progressivo
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw new Error('Max retries exceeded');
};

// Utilitário para fazer upload seguro de arquivos
export const secureFileUpload = async (
  file: File, 
  endpoint: string,
  onProgress?: (progress: number) => void
) => {
  // Validações de segurança do arquivo
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'application/pdf',
    'text/plain'
  ];
  
  if (file.size > maxSize) {
    throw new Error('File size exceeds 10MB limit');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not allowed');
  }
  
  // Sanitizar nome do arquivo
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  const formData = new FormData();
  formData.append('file', file, safeName);
  
  return api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = (progressEvent.loaded * 100) / progressEvent.total;
        onProgress(progress);
      }
    },
  });
};