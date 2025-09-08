import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FiCheck, FiX, FiAlertTriangle, FiInfo, FiAlertCircle } from 'react-icons/fi';
import config from '../config';

// Contexto para notificações
const NotificationContext = createContext();

// Hook para usar notificações
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de NotificationProvider');
  }
  return context;
};

// Componente de notificação individual
const Notification = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Animar entrada
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-remover após duração
    if (notification.duration > 0) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, notification.duration - elapsed);
        setProgress((remaining / notification.duration) * 100);
        
        if (remaining <= 0) {
          clearInterval(interval);
          handleRemove();
        }
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [notification.duration]);

  const handleRemove = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  }, [notification.id, onRemove]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <FiCheck className="w-5 h-5 text-green-600" />;
      case 'error':
        return <FiX className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <FiAlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <FiInfo className="w-5 h-5 text-blue-600" />;
      default:
        return <FiAlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-white dark:bg-gray-800 border-green-200 dark:border-green-700 shadow-green-100 dark:shadow-green-900/20';
      case 'error':
        return 'bg-white dark:bg-gray-800 border-red-200 dark:border-red-700 shadow-red-100 dark:shadow-red-900/20';
      case 'warning':
        return 'bg-white dark:bg-gray-800 border-yellow-200 dark:border-yellow-700 shadow-yellow-100 dark:shadow-yellow-900/20';
      case 'info':
        return 'bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 shadow-blue-100 dark:shadow-blue-900/20';
      default:
        return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-gray-100 dark:shadow-gray-900/20';
    }
  };

  const getProgressColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-500 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${getBackgroundColor()}
        border rounded-xl shadow-xl backdrop-blur-sm p-4 mb-3 max-w-sm w-full
        flex items-start space-x-3 relative overflow-hidden
        hover:shadow-2xl transition-shadow duration-300
      `}
    >
      {/* Barra de progresso */}
      {notification.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
          <div 
            className={`h-full ${getProgressColor()} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {/* Ícone com fundo circular */}
      <div className={`flex-shrink-0 p-2 rounded-full ${
        notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
        notification.type === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
        notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
        notification.type === 'info' ? 'bg-blue-100 dark:bg-blue-900/30' :
        'bg-gray-100 dark:bg-gray-700'
      }`}>
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        {notification.title && (
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {notification.title}
          </h4>
        )}
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {notification.message}
        </p>
        {notification.actions && (
          <div className="mt-3 flex space-x-2">
            {notification.actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`
                  text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200
                  ${action.primary 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <button
        onClick={handleRemove}
        className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
};

// Container de notificações
const NotificationContainer = ({ notifications, onRemove }) => {
  const position = config.notifications?.position || 'top-right';
  
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div
      className={`
        fixed z-50 pointer-events-none
        ${getPositionClasses()}
        max-w-sm w-full
      `}
    >
      <div className="pointer-events-auto space-y-3">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className="animate-slide-in-right"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            <Notification
              notification={notification}
              onRemove={onRemove}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Provider de notificações
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const maxNotifications = config.notifications?.maxNotifications || 5;

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: config.notifications?.duration || 5000,
      ...notification
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Manter apenas o número máximo de notificações
      return updated.slice(0, maxNotifications);
    });

    return id;
  }, [maxNotifications]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Métodos de conveniência
  const success = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    });
  }, [addNotification]);

  const error = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      duration: 0, // Erros não desaparecem automaticamente
      ...options
    });
  }, [addNotification]);

  const warning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    });
  }, [addNotification]);

  const info = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

// Hook para notificações de API
export const useApiNotifications = () => {
  const { success, error, warning, info } = useNotifications();

  const handleApiSuccess = useCallback((message, data = null) => {
    success(message);
    return data;
  }, [success]);

  const handleApiError = useCallback((err, defaultMessage = 'Erro inesperado') => {
    const message = err?.response?.data?.message || err?.message || defaultMessage;
    error(message);
    throw err;
  }, [error]);

  const handleApiWarning = useCallback((message) => {
    warning(message);
  }, [warning]);

  const handleApiInfo = useCallback((message) => {
    info(message);
  }, [info]);

  return {
    handleApiSuccess,
    handleApiError,
    handleApiWarning,
    handleApiInfo
  };
};

// Componente para mostrar notificações de loading
export const LoadingNotification = ({ message = 'Carregando...', id }) => {
  const { removeNotification } = useNotifications();

  useEffect(() => {
    return () => {
      if (id) {
        removeNotification(id);
      }
    };
  }, [id, removeNotification]);

  return (
    <div className="flex items-center space-x-2 text-blue-600">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      <span className="text-sm">{message}</span>
    </div>
  );
};

export default NotificationProvider;
