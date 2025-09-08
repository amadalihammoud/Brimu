import config, { getApiUrl, isDevelopment } from '../config';
import errorHandler from '../utils/errorHandler';

// Cache simples para requisições
const requestCache = new Map();
const CACHE_TTL = config.cache.defaultTTL;

// Função para limpar cache expirado
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      requestCache.delete(key);
    }
  }
};

// Função para fazer requisições com retry e cache
const apiRequest = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body,
    headers = {},
    useCache = false,
    retryAttempts = config.api.retryAttempts,
    timeout = config.api.timeout
  } = options;

  const token = localStorage.getItem(config.auth.tokenKey);
  const cacheKey = `${method}:${endpoint}:${JSON.stringify(body)}`;
  
  // Verificar cache se habilitado
  if (useCache && method === 'GET' && requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  const requestConfig = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    ...(body && { body: JSON.stringify(body) }),
  };

  // Implementar timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  requestConfig.signal = controller.signal;

  let lastError;
  
  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      const response = await fetch(getApiUrl(endpoint), requestConfig);
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.code = errorData.code;
        
        // Log do erro usando o error handler
        errorHandler.handleApiError(error, endpoint);
        
        throw error;
      }
      
      const data = await response.json();
      
      // Armazenar no cache se habilitado
      if (useCache && method === 'GET') {
        requestCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        cleanExpiredCache();
      }
      
      return data;
      
    } catch (error) {
      lastError = error;
      
      // Log do erro usando o error handler
      errorHandler.log(error, {
        endpoint,
        method,
        attempt,
        maxAttempts: retryAttempts
      });
      
      if (isDevelopment()) {
        console.warn(`Tentativa ${attempt}/${retryAttempts} falhou:`, error.message);
      }
      
      if (attempt < retryAttempts && !error.status) {
        await new Promise(resolve => setTimeout(resolve, config.api.retryDelay * attempt));
      }
    }
  }
  
  throw lastError;
};

// Função para upload de arquivos
const uploadFile = async (file, endpoint = '/upload', onProgress = null) => {
  const token = localStorage.getItem(config.auth.tokenKey);
  const formData = new FormData();
  formData.append('file', file);
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Configurar progresso
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });
    }
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Resposta inválida do servidor'));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.message || 'Upload falhou'));
        } catch (error) {
          reject(new Error('Upload falhou'));
        }
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Erro de rede durante upload'));
    });
    
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelado'));
    });
    
    xhr.open('POST', getApiUrl(endpoint));
    
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    
    xhr.send(formData);
  });
};

// API de autenticação
export const authAPI = {
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
    });
  },

  getProfile: async () => {
    return apiRequest('/auth/me', { useCache: true });
  },

  updateProfile: async (userData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: userData,
    });
  },

  changePassword: async (currentPassword, newPassword) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: { currentPassword, newPassword },
    });
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      // Sempre limpar dados locais, mesmo se a requisição falhar
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem(config.auth.userKey);
      localStorage.removeItem(config.auth.refreshTokenKey);
    }
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem(config.auth.refreshTokenKey);
    if (!refreshToken) {
      throw new Error('Refresh token não encontrado');
    }
    
    return apiRequest('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    });
  },
};

// API de upload
export const uploadAPI = {
  uploadFile: async (file, onProgress = null) => {
    // Validar arquivo
    if (file.size > config.upload.maxFileSize) {
      throw new Error(`Arquivo muito grande. Máximo permitido: ${config.upload.maxFileSize / 1024 / 1024}MB`);
    }
    
    if (!config.upload.allowedTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não permitido');
    }
    
    return uploadFile(file, '/upload', onProgress);
  },

  uploadMultiple: async (files, onProgress = null) => {
    if (files.length > config.upload.maxFiles) {
      throw new Error(`Muitos arquivos. Máximo permitido: ${config.upload.maxFiles}`);
    }
    
    const uploads = files.map(file => uploadAPI.uploadFile(file, onProgress));
    return Promise.all(uploads);
  },

  deleteFile: async (fileId) => {
    return apiRequest(`/upload/${fileId}`, {
      method: 'DELETE',
    });
  },

  getFiles: async () => {
    return apiRequest('/upload/files', { useCache: true });
  },
};

// API de backup
export const backupAPI = {
  createBackup: async () => {
    return apiRequest('/backup/create', {
      method: 'POST',
    });
  },

  getBackups: async () => {
    return apiRequest('/backup/list', { useCache: true });
  },

  restoreBackup: async (backupId) => {
    return apiRequest(`/backup/restore/${backupId}`, {
      method: 'POST',
    });
  },

  deleteBackup: async (backupId) => {
    return apiRequest(`/backup/delete/${backupId}`, {
      method: 'DELETE',
    });
  },

  downloadBackup: async (backupId) => {
    const token = localStorage.getItem(config.auth.tokenKey);
    const response = await fetch(getApiUrl(`/backup/download/${backupId}`), {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error('Falha ao baixar backup');
    }
    
    return response.blob();
  },
};

// API de serviços
export const serviceAPI = {
  getAll: async () => {
    return apiRequest('/services', { useCache: true });
  },

  getById: async (id) => {
    return apiRequest(`/services/${id}`, { useCache: true });
  },

  create: async (data) => {
    return apiRequest('/services', {
      method: 'POST',
      body: data,
    });
  },

  update: async (id, data) => {
    return apiRequest(`/services/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  delete: async (id) => {
    return apiRequest(`/services/${id}`, {
      method: 'DELETE',
    });
  },
};

// API de ordens
export const orderAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/orders${queryString ? `?${queryString}` : ''}`, { useCache: true });
  },

  getByClient: async (clientId) => {
    return apiRequest(`/orders/client/${clientId}`, { useCache: true });
  },

  getById: async (id) => {
    return apiRequest(`/orders/${id}`, { useCache: true });
  },

  create: async (data) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: data,
    });
  },

  update: async (id, data) => {
    return apiRequest(`/orders/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  updateStatus: async (id, status) => {
    return apiRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
  },

  delete: async (id) => {
    return apiRequest(`/orders/${id}`, {
      method: 'DELETE',
    });
  },

  // Métodos para gerenciamento de equipamentos
  assignEquipment: async (orderId, data) => {
    return apiRequest(`/orders/${orderId}/equipment`, {
      method: 'POST',
      body: data,
    });
  },

  removeEquipment: async (orderId, equipmentId) => {
    return apiRequest(`/orders/${orderId}/equipment/${equipmentId}`, {
      method: 'DELETE',
    });
  },

  getAvailableEquipment: async (scheduledDate, excludeOrderId = null) => {
    const params = new URLSearchParams({
      scheduledDate: scheduledDate.toISOString()
    });
    if (excludeOrderId) {
      params.append('excludeOrderId', excludeOrderId);
    }
    return apiRequest(`/orders/available-equipment?${params.toString()}`, { useCache: true });
  },

  checkEquipmentConflicts: async (equipmentId, scheduledDate, excludeOrderId = null) => {
    const params = new URLSearchParams({
      scheduledDate: scheduledDate.toISOString()
    });
    if (excludeOrderId) {
      params.append('excludeOrderId', excludeOrderId);
    }
    return apiRequest(`/orders/equipment-conflicts/${equipmentId}?${params.toString()}`, { useCache: true });
  },

  updateScheduledDate: async (orderId, scheduledDate) => {
    return apiRequest(`/orders/${orderId}/scheduled-date`, {
      method: 'PUT',
      body: { scheduledDate: scheduledDate.toISOString() },
    });
  },
};

// API de orçamentos
export const quoteAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/quotes${queryString ? `?${queryString}` : ''}`, { useCache: true });
  },

  getByClient: async (clientId) => {
    return apiRequest(`/quotes/client/${clientId}`, { useCache: true });
  },

  getById: async (id) => {
    return apiRequest(`/quotes/${id}`, { useCache: true });
  },

  create: async (data) => {
    return apiRequest('/quotes', {
      method: 'POST',
      body: data,
    });
  },

  update: async (id, data) => {
    return apiRequest(`/quotes/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  approve: async (id) => {
    return apiRequest(`/quotes/${id}/approve`, {
      method: 'PUT',
    });
  },

  reject: async (id, reason) => {
    return apiRequest(`/quotes/${id}/reject`, {
      method: 'PUT',
      body: { reason },
    });
  },

  delete: async (id) => {
    return apiRequest(`/quotes/${id}`, {
      method: 'DELETE',
    });
  },

  // Conversão de orçamento para ordem
  convertToOrder: async (id) => {
    return apiRequest(`/quotes/${id}/convert-to-order`, {
      method: 'POST',
    });
  },

  // Pagamentos do orçamento
  addPayment: async (id, paymentData) => {
    return apiRequest(`/quotes/${id}/payments`, {
      method: 'POST',
      body: paymentData,
    });
  },

  getPayments: async (id) => {
    return apiRequest(`/quotes/${id}/payments`, { useCache: true });
  },
};

// API de pagamentos
export const paymentAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/payments${queryString ? `?${queryString}` : ''}`, { useCache: true });
  },

  getByClient: async (clientId) => {
    return apiRequest(`/payments/client/${clientId}`, { useCache: true });
  },

  getById: async (id) => {
    return apiRequest(`/payments/${id}`, { useCache: true });
  },

  create: async (data) => {
    return apiRequest('/payments', {
      method: 'POST',
      body: data,
    });
  },

  update: async (id, data) => {
    return apiRequest(`/payments/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  markPaid: async (id) => {
    return apiRequest(`/payments/${id}/mark-paid`, {
      method: 'PUT',
    });
  },

  delete: async (id) => {
    return apiRequest(`/payments/${id}`, {
      method: 'DELETE',
    });
  },
};

// API de clientes
export const clientAPI = {
  getAll: async () => {
    return apiRequest('/users?role=client', { useCache: true });
  },

  getById: async (id) => {
    return apiRequest(`/users/${id}`, { useCache: true });
  },

  create: async (data) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: { ...data, role: 'client' },
    });
  },

  update: async (id, data) => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  delete: async (id) => {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// API de calendário
export const calendarAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/calendar${queryString ? `?${queryString}` : ''}`, { useCache: true });
  },

  getById: async (id) => {
    return apiRequest(`/calendar/${id}`, { useCache: true });
  },

  create: async (data) => {
    return apiRequest('/calendar', {
      method: 'POST',
      body: data,
    });
  },

  update: async (id, data) => {
    return apiRequest(`/calendar/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  delete: async (id) => {
    return apiRequest(`/calendar/${id}`, {
      method: 'DELETE',
    });
  },

  updateStatus: async (id, status, notes) => {
    return apiRequest(`/calendar/${id}/status`, {
      method: 'POST',
      body: { status, notes },
    });
  },

  getUpcoming: async (days = 7) => {
    return apiRequest(`/calendar/upcoming/${days}`, { useCache: true });
  },

  getStats: async () => {
    return apiRequest('/calendar/stats/overview', { useCache: true });
  },

  getByDateRange: async (startDate, endDate, filters = {}) => {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      ...filters
    };
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/calendar?${queryString}`);
  },

  checkConflicts: async (eventData) => {
    // Simulação de verificação de conflitos
    return apiRequest('/calendar/check-conflicts', {
      method: 'POST',
      body: eventData,
    });
  }
};

// API de equipamentos
export const equipmentAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/equipment${queryString ? `?${queryString}` : ''}`, { useCache: true });
  },

  getById: async (id) => {
    return apiRequest(`/equipment/${id}`, { useCache: true });
  },

  create: async (data) => {
    return apiRequest('/equipment', {
      method: 'POST',
      body: data,
    });
  },

  update: async (id, data) => {
    return apiRequest(`/equipment/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  delete: async (id) => {
    return apiRequest(`/equipment/${id}`, {
      method: 'DELETE',
    });
  },

  assign: async (id, assignmentData) => {
    return apiRequest(`/equipment/${id}/assign`, {
      method: 'POST',
      body: assignmentData,
    });
  },

  release: async (id) => {
    return apiRequest(`/equipment/${id}/release`, {
      method: 'POST',
    });
  },

  updateStatus: async (id, status) => {
    return apiRequest(`/equipment/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
  },
};

// API de dashboard
export const dashboardAPI = {
  getAdminStats: async () => {
    return apiRequest('/dashboard/admin', { useCache: true });
  },

  getClientStats: async (clientId) => {
    return apiRequest(`/dashboard/client/${clientId}`, { useCache: true });
  },

  getRecentActivity: async () => {
    return apiRequest('/dashboard/activity', { useCache: true });
  },

  getMonthlyRevenue: async () => {
    return apiRequest('/dashboard/revenue', { useCache: true });
  },
};

// Utilitários de formatação
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

// Função para limpar cache
export const clearCache = () => {
  requestCache.clear();
};

// Função para obter estatísticas do cache
export const getCacheStats = () => {
  return {
    size: requestCache.size,
    maxSize: config.cache.maxSize,
    ttl: CACHE_TTL
  };
};

// Exportação nomeada para apiRequest
export { apiRequest };

export default {
  apiRequest,
  authAPI,
  uploadAPI,
  backupAPI,
  serviceAPI,
  orderAPI,
  quoteAPI,
  paymentAPI,
  clientAPI,
  calendarAPI,
  equipmentAPI,
  dashboardAPI,
  clearCache,
  getCacheStats,
  formatCurrency,
  formatDate,
  formatDateTime,
};