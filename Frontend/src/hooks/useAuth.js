import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import config from '../config';
import { useErrorHandler } from '../utils/errorHandler';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getFriendlyMessage, handleApiError } = useErrorHandler();

  // Verificar se há token válido
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem(config.auth.tokenKey);
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await authAPI.getProfile();
      setUser(response.user);
      setError(null);
    } catch (err) {
      console.error('Erro ao verificar autenticação:', err);
      // Token inválido, limpar dados
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem(config.auth.userKey);
      setUser(null);
      setError(getFriendlyMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login(email, password);
      
      // Salvar dados no localStorage
      localStorage.setItem(config.auth.tokenKey, response.token);
      localStorage.setItem(config.auth.userKey, JSON.stringify(response.user));
      
      setUser(response.user);
      return response;
    } catch (err) {
      setError(getFriendlyMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Erro no logout:', err);
    } finally {
      // Sempre limpar dados locais
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem(config.auth.userKey);
      localStorage.removeItem(config.auth.refreshTokenKey);
      setUser(null);
      setError(null);
    }
  }, []);

  // Registrar
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(userData);
      
      // Salvar dados no localStorage
      localStorage.setItem(config.auth.tokenKey, response.token);
      localStorage.setItem(config.auth.userKey, JSON.stringify(response.user));
      
      setUser(response.user);
      return response;
    } catch (err) {
      setError(getFriendlyMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar perfil
  const updateProfile = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.updateProfile(userData);
      
      // Atualizar dados no localStorage
      localStorage.setItem(config.auth.userKey, JSON.stringify(response.user));
      setUser(response.user);
      
      return response;
    } catch (err) {
      setError(getFriendlyMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Alterar senha
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.changePassword(currentPassword, newPassword);
      return response;
    } catch (err) {
      setError(getFriendlyMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar se é admin
  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);

  // Verificar se é cliente
  const isClient = useCallback(() => {
    return user?.role === 'client' || user?.role === 'user';
  }, [user]);

  // Verificar se está autenticado
  const isAuthenticated = useCallback(() => {
    return !!user && !!localStorage.getItem(config.auth.tokenKey);
  }, [user]);

  // Verificar permissões
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    
    // Admin tem todas as permissões
    if (user.role === 'admin') return true;
    
    // Verificar permissões específicas por role
    const permissions = {
      client: ['view_own_data', 'create_quotes', 'view_own_orders'],
      user: ['view_own_data', 'create_quotes', 'view_own_orders'],
      employee: ['view_orders', 'update_orders', 'view_quotes'],
      admin: ['*'] // Todas as permissões
    };
    
    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes(permission) || userPermissions.includes('*');
  }, [user]);

  // Verificar se pode acessar recurso
  const canAccess = useCallback((resource, action = 'read') => {
    if (!user) return false;
    
    // Admin pode acessar tudo
    if (user.role === 'admin') return true;
    
    // Clientes só podem acessar seus próprios dados
    if (user.role === 'client' || user.role === 'user') {
      return ['quotes', 'orders', 'payments'].includes(resource) && action === 'read';
    }
    
    // Funcionários podem acessar mais recursos
    if (user.role === 'employee') {
      return ['quotes', 'orders', 'services'].includes(resource);
    }
    
    return false;
  }, [user]);

  // Inicializar autenticação
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    isAdmin,
    isClient,
    isAuthenticated,
    hasPermission,
    canAccess,
    checkAuth,
    clearError: () => setError(null)
  };
};
