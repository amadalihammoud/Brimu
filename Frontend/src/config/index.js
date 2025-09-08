// Configuração centralizada do frontend
const config = {
  // Configurações da API
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 30000, // 30 segundos
    retryAttempts: 3,
    retryDelay: 1000 // 1 segundo
  },

  // Configurações da aplicação
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Brimu',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.MODE || 'development',
    debug: import.meta.env.VITE_DEBUG === 'true' || import.meta.env.MODE === 'development'
  },

  // Configurações de autenticação
  auth: {
    tokenKey: 'brimu_token',
    userKey: 'brimu_user',
    refreshTokenKey: 'brimu_refresh_token',
    tokenExpiryBuffer: 5 * 60 * 1000, // 5 minutos antes do vencimento
    autoRefresh: true
  },

  // Configurações de upload
  upload: {
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    maxFiles: parseInt(import.meta.env.VITE_MAX_FILES_PER_UPLOAD) || 10,
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    previewMaxSize: 2 * 1024 * 1024 // 2MB para preview
  },

  // Configurações de cache
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutos
    maxSize: 50, // máximo 50 itens no cache
    enableLocalStorage: true,
    enableSessionStorage: true
  },

  // Configurações de notificações
  notifications: {
    position: 'top-right',
    duration: 5000, // 5 segundos
    maxNotifications: 5,
    enableSound: false
  },

  // Configurações de paginação
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
    maxVisiblePages: 5
  },

  // Configurações de tema
  theme: {
    defaultTheme: 'light',
    enableSystemTheme: true,
    enableAnimations: true,
    animationDuration: 300
  },

  // Configurações de validação
  validation: {
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phoneRegex: /^[\+]?[1-9][\d]{0,15}$/,
    passwordMinLength: 6,
    nameMinLength: 2
  },

  // Configurações de performance
  performance: {
    enableLazyLoading: import.meta.env.VITE_ENABLE_LAZY_LOADING === 'true' || true,
    enableImageOptimization: import.meta.env.VITE_ENABLE_IMAGE_OPTIMIZATION === 'true' || true,
    enableCodeSplitting: import.meta.env.VITE_ENABLE_CODE_SPLITTING === 'true' || true,
    enableServiceWorker: false, // Desabilitado para desenvolvimento
    enablePreloading: true
  },

  // Configurações de desenvolvimento
  development: {
    enableLogging: import.meta.env.MODE === 'development',
    enableReduxDevTools: import.meta.env.MODE === 'development',
    enableErrorBoundary: true,
    enablePerformanceMonitoring: import.meta.env.MODE === 'development'
  }
};

// Função para obter configuração por chave
export const getConfig = (key) => {
  const keys = key.split('.');
  let value = config;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }
  
  return value;
};

// Função para verificar se uma feature está habilitada
export const isFeatureEnabled = (feature) => {
  return getConfig(`features.${feature}`) === true;
};

// Função para obter URL completa da API
export const getApiUrl = (endpoint = '') => {
  const baseURL = config.api.baseURL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseURL}/${cleanEndpoint}`;
};

// Função para obter configuração de ambiente
export const isDevelopment = () => config.app.environment === 'development';
export const isProduction = () => config.app.environment === 'production';

export default config;
