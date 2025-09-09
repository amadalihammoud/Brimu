import axios from 'axios';

// Configuração da API para conectar com o backend existente
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Funções utilitárias para as principais operações
export const apiClient = {
  // Autenticação
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: any) =>
    api.post('/auth/register', userData),
  
  // Orçamentos
  getQuotes: () => api.get('/quotes'),
  
  createQuote: (quoteData: any) =>
    api.post('/quotes', quoteData),
  
  // Ordens de Serviço
  getOrders: () => api.get('/orders'),
  
  // Usuários/Clientes
  getUsers: () => api.get('/users'),
  
  // Health check
  healthCheck: () => api.get('/health'),
};