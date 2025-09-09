'use client'

import { useState, useEffect } from 'react';
import { secureApiClient } from '@/lib/secureApi';
import { validateData, LoginSchema } from '@/lib/schemas';
import { validateUserData } from '@/lib/security';
import { csrfTokenManager } from '@/lib/csrf';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Verificar token preferencialmente em sessionStorage, fallback para localStorage
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Verificar se o token ainda é válido
      const response = await secureApiClient.healthCheck();
      
      // Se chegou até aqui, o token é válido
      // Por enquanto, vamos usar dados mockados baseados no token
      // Em produção, isso viria de uma rota /auth/me
      const userDataString = sessionStorage.getItem('userData') || localStorage.getItem('userData');
      const userData = JSON.parse(userDataString || '{}');
      
      if (userData.id) {
        // Validar dados do usuário para segurança
        const validation = validateUserData(userData);
        if (validation.isValid) {
          setUser(userData);
        } else {
          console.warn('Invalid user data detected:', validation.errors);
          throw new Error('Invalid user data');
        }
      } else {
        // Detectar se é admin baseado no email para demonstração
        const email = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail') || '';
        const isAdminEmail = email.includes('admin') || email.includes('brimu') || email === 'admin@email.com';
        
        // Dados padrão baseados no tipo de usuário
        const defaultUser = {
          id: '1',
          name: isAdminEmail ? 'Administrador' : 'Cliente',
          email: email || 'usuario@email.com',
          role: isAdminEmail ? 'admin' as const : 'client' as const
        };
        
        // Validar dados antes de definir
        const validation = validateUserData(defaultUser);
        if (validation.isValid) {
          setUser(defaultUser);
        } else {
          throw new Error('Failed to create valid user data');
        }
      }
    } catch (error) {
      // Token inválido ou erro de conexão - limpar tudo
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userData');
      sessionStorage.removeItem('userEmail');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('userEmail');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Validar dados de entrada com Zod
      const validation = validateData(LoginSchema, { email, password });
      if (!validation.success) {
        return { 
          success: false, 
          error: validation.errors.join(', ')
        };
      }

      // Gerar token CSRF
      csrfTokenManager.generateToken();

      // Usar API segura para login
      const response = await secureApiClient.login(validation.data);
      
      if (response.data.token) {
        // Armazenar preferencialmente em sessionStorage (mais seguro)
        sessionStorage.setItem('authToken', response.data.token);
        sessionStorage.setItem('userEmail', validation.data.email);
        
        // Fallback para localStorage para compatibilidade
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userEmail', validation.data.email);
        
        // Detectar tipo de usuário baseado no email para demonstração
        const isAdminEmail = validation.data.email.includes('admin') || 
                            validation.data.email.includes('brimu') || 
                            validation.data.email === 'admin@email.com';
        
        // Salvar dados do usuário (vindos do backend ou mockados)
        const userData = response.data.user || {
          id: response.data.userId || '1',
          name: response.data.name || (isAdminEmail ? 'Administrador' : 'Cliente'),
          email: validation.data.email,
          role: response.data.role || (isAdminEmail ? 'admin' as const : 'client' as const)
        };
        
        // Validar dados do usuário antes de armazenar
        const userValidation = validateUserData(userData);
        if (!userValidation.isValid) {
          return { 
            success: false, 
            error: 'Dados de usuário inválidos: ' + userValidation.errors.join(', ')
          };
        }
        
        // Armazenar em ambos os storages
        sessionStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setUser(userData);
        
        return { success: true };
      }
      
      return { success: false, error: 'Token não recebido' };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  };

  const logout = () => {
    // Limpar todos os dados de autenticação
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('userEmail');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    
    // Limpar token CSRF
    csrfTokenManager.clearToken();
    
    setUser(null);
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
    checkAuth
  };
}