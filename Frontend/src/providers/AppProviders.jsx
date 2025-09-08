import React from 'react';
import { AppProvider } from '../contexts/AppContext';
import { AuthProvider } from '../contexts/AuthContext';
import { EquipmentProvider } from '../contexts/EquipmentContext';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Ops! Algo deu errado
            </h1>
            <p className="text-gray-600 mb-4">
              Ocorreu um erro inesperado na aplicação.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-forest-600 text-white px-4 py-2 rounded-lg hover:bg-forest-700 transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Notification Component
const NotificationContainer = () => {
  const { useApp } = require('../contexts/AppContext');
  const { notification, clearNotification } = useApp();

  if (!notification) return null;

  const getNotificationStyles = (type) => {
    const baseStyles = "fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 p-4 transition-all duration-300 transform";
    
    switch (type) {
      case 'success':
        return `${baseStyles} border-green-500`;
      case 'error':
        return `${baseStyles} border-red-500`;
      case 'warning':
        return `${baseStyles} border-yellow-500`;
      default:
        return `${baseStyles} border-blue-500`;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={getNotificationStyles(notification.type)}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-lg">{getIcon(notification.type)}</span>
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-800">
            {notification.message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={clearNotification}
            className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
          >
            <span className="sr-only">Fechar</span>
            <span className="text-xl">×</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Providers Component
const AppProviders = ({ children }) => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AuthProvider>
          <EquipmentProvider>
            {children}
            <NotificationContainer />
          </EquipmentProvider>
        </AuthProvider>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default AppProviders;