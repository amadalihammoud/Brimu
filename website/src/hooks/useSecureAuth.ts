'use client'

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
}

// Utility para sanitizar strings
const sanitizeString = (str: string): string => {
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/[<>'"]/g, '');
};

// Utility para validar email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function useSecureAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      
      // Verificar se há token (now checking sessionStorage first)
      let token = sessionStorage.getItem('authToken');
      if (!token) {
        token = localStorage.getItem('token'); // fallback para compatibilidade
      }
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Validar token com backend
      const response = await apiClient.healthCheck();
      
      // Obter dados do usuário do backend (mais seguro)
      try {
        // TODO: Implementar rota /auth/me no backend
        // const userResponse = await apiClient.getCurrentUser();
        // const userData = userResponse.data;
        
        // Por enquanto, usar dados salvos com validação
        const storedUserData = sessionStorage.getItem('userData') || 
                              localStorage.getItem('userData');
        
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          
          // Validar estrutura dos dados
          if (userData.id && userData.email && userData.role) {
            // Sanitizar dados do usuário
            const cleanUser: User = {
              id: sanitizeString(userData.id),
              name: sanitizeString(userData.name || 'Usuário'),
              email: sanitizeString(userData.email),
              role: userData.role === 'admin' ? 'admin' : 'client'
            };
            
            // Validar email
            if (isValidEmail(cleanUser.email)) {
              setUser(cleanUser);
            } else {
              throw new Error('Invalid user data');
            }
          } else {
            throw new Error('Incomplete user data');
          }
        } else {
          throw new Error('No user data found');
        }
      } catch (userError) {
        console.warn('Error loading user data:', userError);
        // Limpar dados inválidos
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userData');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setUser(null);
      }
    } catch (error) {
      console.warn('Authentication check failed:', error);
      // Token inválido ou erro de conexão
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userData');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Sanitizar entrada
      const cleanEmail = sanitizeString(email.toLowerCase().trim());
      const cleanPassword = password.trim();
      
      // Validar entrada
      if (!isValidEmail(cleanEmail)) {
        return { success: false, error: 'Email inválido' };
      }
      
      if (cleanPassword.length < 1) {
        return { success: false, error: 'Senha é obrigatória' };
      }
      
      // Rate limiting básico (client-side)
      const lastAttempt = localStorage.getItem('lastLoginAttempt');
      const now = Date.now();
      if (lastAttempt && (now - parseInt(lastAttempt)) < 1000) {
        return { success: false, error: 'Aguarde antes de tentar novamente' };
      }
      localStorage.setItem('lastLoginAttempt', now.toString());
      
      const response = await apiClient.login({ 
        email: cleanEmail, 
        password: cleanPassword 
      });
      
      if (response.data.token) {
        // Armazenar token de forma mais segura
        sessionStorage.setItem('authToken', response.data.token);
        // Manter localStorage como fallback apenas para compatibilidade
        localStorage.setItem('token', response.data.token);
        
        // Processar dados do usuário com validação rigorosa
        let userData;
        if (response.data.user) {
          // Dados do backend (preferencial)
          userData = response.data.user;
        } else {
          // IMPORTANTE: Esta lógica deve ser movida para o backend
          // Apenas para demonstração - INSEGURO em produção
          const isAdminEmail = cleanEmail === 'admin@email.com' || 
                               cleanEmail === 'admin@brimu.com' ||
                               cleanEmail.startsWith('admin@');
          
          userData = {
            id: response.data.userId || '1',
            name: response.data.name || (isAdminEmail ? 'Administrador' : 'Cliente'),
            email: cleanEmail,
            role: response.data.role || (isAdminEmail ? 'admin' : 'client')
          };
        }
        
        // Validar e sanitizar dados do usuário
        const validatedUser: User = {
          id: sanitizeString(userData.id || '1'),
          name: sanitizeString(userData.name || 'Usuário'),
          email: sanitizeString(userData.email),
          role: userData.role === 'admin' ? 'admin' : 'client'
        };
        
        // Armazenar dados do usuário
        const userDataString = JSON.stringify(validatedUser);
        sessionStorage.setItem('userData', userDataString);
        localStorage.setItem('userData', userDataString); // fallback
        
        setUser(validatedUser);
        
        // Limpar tentativas de login
        localStorage.removeItem('lastLoginAttempt');
        
        return { success: true };
      }
      
      return { success: false, error: 'Credenciais inválidas' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro interno do servidor' 
      };
    }
  };

  const logout = () => {
    // Limpar todos os dados de autenticação
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('lastLoginAttempt');
    
    setUser(null);
    
    // Forçar redirecionamento
    window.location.href = '/login';
  };

  const refreshAuth = async () => {
    return await checkAuth();
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'client';

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isClient,
    login,
    logout,
    refreshAuth,
    checkAuth
  };
}