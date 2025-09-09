'use client'

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { securityLogger } from '@/lib/security';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'client';
  fallbackPath?: string;
  loadingComponent?: ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = '/login',
  loadingComponent
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, isAdmin, isClient } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;

    // Verificar autenticação
    if (!isAuthenticated) {
      securityLogger.logUnauthorizedAccess(
        window.location.pathname, 
        navigator.userAgent
      );
      
      const loginUrl = new URL(fallbackPath, window.location.origin);
      loginUrl.searchParams.set('redirect', window.location.pathname);
      
      router.replace(loginUrl.toString());
      setIsAuthorized(false);
      return;
    }

    // Verificar autorização por role
    if (requiredRole) {
      const hasPermission = requiredRole === 'admin' ? isAdmin : isClient;
      
      if (!hasPermission) {
        securityLogger.logUnauthorizedAccess(
          window.location.pathname,
          navigator.userAgent
        );
        
        // Redirecionar para página apropriada baseada no role do usuário
        const redirectPath = isAdmin ? '/dashboard' : '/client/dashboard';
        router.replace(redirectPath);
        setIsAuthorized(false);
        return;
      }
    }

    setIsAuthorized(true);
  }, [loading, isAuthenticated, isAdmin, isClient, requiredRole, router, fallbackPath]);

  // Mostrar loading durante verificação
  if (loading || isAuthorized === null) {
    return loadingComponent || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Não mostrar conteúdo se não autorizado
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta página.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Ir para Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Mostrar conteúdo protegido
  return <>{children}</>;
}

// HOC para proteger páginas facilmente
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'admin' | 'client'
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}