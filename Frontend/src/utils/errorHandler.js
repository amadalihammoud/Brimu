// Sistema de tratamento de erros centralizado
class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  // Log de erro
  log(error, context = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: error.message || 'Erro desconhecido',
      stack: error.stack,
      context,
      type: error.name || 'Error',
      severity: this.getSeverity(error)
    };

    this.errorLog.push(errorEntry);
    
    // Manter apenas os últimos erros
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Log no console em desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.error('ErrorHandler:', errorEntry);
    }

    return errorEntry;
  }

  // Determinar severidade do erro
  getSeverity(error) {
    if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
      return 'high';
    }
    if (error.name === 'ValidationError') {
      return 'medium';
    }
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'high';
    }
    return 'low';
  }

  // Tratar erros de API
  handleApiError(error, endpoint) {
    const context = { endpoint, type: 'api' };
    
    if (error.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('brimu_token');
      localStorage.removeItem('brimu_user');
      window.location.href = '/auth';
      return this.log(error, { ...context, action: 'redirect_to_auth' });
    }
    
    if (error.status === 403) {
      return this.log(error, { ...context, action: 'access_denied' });
    }
    
    if (error.status >= 500) {
      return this.log(error, { ...context, action: 'server_error' });
    }
    
    return this.log(error, context);
  }

  // Tratar erros de validação
  handleValidationError(error, formData) {
    return this.log(error, {
      type: 'validation',
      formData: this.sanitizeFormData(formData)
    });
  }

  // Sanitizar dados do formulário (remover senhas)
  sanitizeFormData(formData) {
    const sanitized = { ...formData };
    if (sanitized.password) {
      sanitized.password = '[REDACTED]';
    }
    if (sanitized.currentPassword) {
      sanitized.currentPassword = '[REDACTED]';
    }
    if (sanitized.newPassword) {
      sanitized.newPassword = '[REDACTED]';
    }
    return sanitized;
  }

  // Obter mensagem amigável do erro
  getFriendlyMessage(error) {
    if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    if (error.status === 401) {
      return 'Sessão expirada. Faça login novamente.';
    }
    
    if (error.status === 403) {
      return 'Você não tem permissão para realizar esta ação.';
    }
    
    if (error.status === 404) {
      return 'Recurso não encontrado.';
    }
    
    if (error.status >= 500) {
      return 'Erro interno do servidor. Tente novamente mais tarde.';
    }
    
    if (error.message?.includes('validation')) {
      return 'Dados inválidos. Verifique os campos e tente novamente.';
    }
    
    return error.message || 'Ocorreu um erro inesperado. Tente novamente.';
  }

  // Obter logs de erro
  getErrorLog() {
    return [...this.errorLog];
  }

  // Limpar logs
  clearLogs() {
    this.errorLog = [];
  }

  // Obter estatísticas de erro
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      bySeverity: {},
      recent: this.errorLog.slice(-10)
    };

    this.errorLog.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }
}

// Instância singleton
const errorHandler = new ErrorHandler();

// Hook para usar o error handler
export const useErrorHandler = () => {
  return {
    log: (error, context) => errorHandler.log(error, context),
    logError: (error, context) => errorHandler.log(error, context), // Alias para logError
    handleApiError: (error, endpoint) => errorHandler.handleApiError(error, endpoint),
    handleValidationError: (error, formData) => errorHandler.handleValidationError(error, formData),
    getFriendlyMessage: (error) => errorHandler.getFriendlyMessage(error),
    getErrorLog: () => errorHandler.getErrorLog(),
    clearLogs: () => errorHandler.clearLogs(),
    getErrorStats: () => errorHandler.getErrorStats()
  };
};

// Função utilitária para capturar erros não tratados
export const setupGlobalErrorHandling = () => {
  // Capturar erros não tratados
  window.addEventListener('error', (event) => {
    errorHandler.log(event.error, {
      type: 'unhandled',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Capturar promises rejeitadas
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.log(event.reason, {
      type: 'unhandled_promise_rejection'
    });
  });
};

export default errorHandler;
