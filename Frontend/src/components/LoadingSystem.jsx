import React, { createContext, useContext, useState, useCallback } from 'react';
import { FiLoader } from 'react-icons/fi';

// Contexto para loading
const LoadingContext = createContext();

// Hook para usar loading
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading deve ser usado dentro de LoadingProvider');
  }
  return context;
};

// Componente de loading overlay
const LoadingOverlay = ({ isVisible, message, progress }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner */}
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
            <FiLoader className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-600 animate-pulse" />
          </div>

          {/* Mensagem */}
          {message && (
            <p className="text-gray-700 text-center font-medium">
              {message}
            </p>
          )}

          {/* Barra de progresso */}
          {progress !== undefined && (
            <div className="w-full">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">
                {Math.round(progress)}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de loading inline
export const InlineLoader = ({ size = 'md', message, className = '' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      case 'xl':
        return 'w-12 h-12';
      default:
        return 'w-6 h-6';
    }
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <div className={`${getSizeClasses()} border-2 border-gray-200 rounded-full animate-spin border-t-blue-600`}></div>
      {message && (
        <span className="text-gray-600 text-sm">{message}</span>
      )}
    </div>
  );
};

// Componente de loading para botões
export const ButtonLoader = ({ loading, children, className = '' }) => {
  return (
    <button
      className={`relative ${className}`}
      disabled={loading}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
};

// Componente de loading para cards
export const CardLoader = ({ loading, children, className = '' }) => {
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};

// Componente de loading para tabelas
export const TableLoader = ({ loading, columns = 3, rows = 5, className = '' }) => {
  if (!loading) return null;

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex space-x-4 mb-4">
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-200 rounded flex-1"></div>
          ))}
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4 mb-3">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-3 bg-gray-200 rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de loading para listas
export const ListLoader = ({ loading, items = 3, className = '' }) => {
  if (!loading) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Provider de loading
export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalMessage, setGlobalMessage] = useState('');
  const [globalProgress, setGlobalProgress] = useState(undefined);

  const setLoading = useCallback((key, loading, message = '') => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: { loading, message }
    }));
  }, []);

  const getLoading = useCallback((key) => {
    return loadingStates[key]?.loading || false;
  }, [loadingStates]);

  const getLoadingMessage = useCallback((key) => {
    return loadingStates[key]?.message || '';
  }, [loadingStates]);

  const setGlobalLoadingState = useCallback((loading, message = '', progress = undefined) => {
    setGlobalLoading(loading);
    setGlobalMessage(message);
    setGlobalProgress(progress);
  }, []);

  const clearLoading = useCallback((key) => {
    setLoadingStates(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  }, []);

  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
    setGlobalLoading(false);
    setGlobalMessage('');
    setGlobalProgress(undefined);
  }, []);

  const isLoading = useCallback((key) => {
    if (key) {
      return getLoading(key);
    }
    return globalLoading || Object.values(loadingStates).some(state => state.loading);
  }, [globalLoading, loadingStates, getLoading]);

  const value = {
    setLoading,
    getLoading,
    getLoadingMessage,
    setGlobalLoadingState,
    clearLoading,
    clearAllLoading,
    isLoading,
    globalLoading,
    globalMessage,
    globalProgress
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingOverlay
        isVisible={globalLoading}
        message={globalMessage}
        progress={globalProgress}
      />
    </LoadingContext.Provider>
  );
};

// Hook para loading com API
export const useApiLoading = (key) => {
  const { setLoading, getLoading, getLoadingMessage } = useLoading();

  const withLoading = useCallback(async (apiCall, message = 'Carregando...') => {
    try {
      setLoading(key, true, message);
      const result = await apiCall();
      return result;
    } finally {
      setLoading(key, false);
    }
  }, [key, setLoading]);

  return {
    loading: getLoading(key),
    message: getLoadingMessage(key),
    withLoading
  };
};

// Hook para loading global
export const useGlobalLoading = () => {
  const { setGlobalLoadingState, globalLoading, globalMessage, globalProgress } = useLoading();

  const startLoading = useCallback((message = 'Carregando...', progress = undefined) => {
    setGlobalLoadingState(true, message, progress);
  }, [setGlobalLoadingState]);

  const updateProgress = useCallback((progress, message = '') => {
    setGlobalLoadingState(true, message, progress);
  }, [setGlobalLoadingState]);

  const stopLoading = useCallback(() => {
    setGlobalLoadingState(false);
  }, [setGlobalLoadingState]);

  return {
    loading: globalLoading,
    message: globalMessage,
    progress: globalProgress,
    startLoading,
    updateProgress,
    stopLoading
  };
};

export default LoadingProvider;
