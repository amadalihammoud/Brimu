const fs = require('fs');
const path = require('path');
const config = require('../config');

// Criar diretório de logs se não existir
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configurações de log
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const COLORS = {
  ERROR: '\x1b[31m', // Vermelho
  WARN: '\x1b[33m',  // Amarelo
  INFO: '\x1b[36m',  // Ciano
  DEBUG: '\x1b[37m', // Branco
  RESET: '\x1b[0m'   // Reset
};

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logFile = path.join(logDir, 'app.log');
    this.errorFile = path.join(logDir, 'error.log');
  }

  // Formatar timestamp
  getTimestamp() {
    return new Date().toISOString();
  }

  // Formatar mensagem
  formatMessage(level, message, meta = {}) {
    const timestamp = this.getTimestamp();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  // Escrever no console
  writeToConsole(level, message, meta = {}) {
    const color = COLORS[level.toUpperCase()] || COLORS.RESET;
    const formattedMessage = this.formatMessage(level, message, meta);
    console.log(`${color}${formattedMessage}${COLORS.RESET}`);
  }

  // Escrever no arquivo
  writeToFile(filename, message) {
    try {
      fs.appendFileSync(filename, message + '\n');
    } catch (error) {
      console.error('Erro ao escrever no arquivo de log:', error);
    }
  }

  // Verificar se deve logar
  shouldLog(level) {
    const currentLevel = LOG_LEVELS[this.logLevel.toUpperCase()] || LOG_LEVELS.INFO;
    const messageLevel = LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;
    return messageLevel <= currentLevel;
  }

  // Método base de log
  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Sempre escrever no console
    this.writeToConsole(level, message, meta);
    
    // Escrever no arquivo de log geral
    this.writeToFile(this.logFile, formattedMessage);
    
    // Escrever erros em arquivo separado
    if (level === 'error') {
      this.writeToFile(this.errorFile, formattedMessage);
    }
  }

  // Métodos específicos
  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  // Log de requisições HTTP
  http(req, res, responseTime) {
    const meta = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };

    if (res.statusCode >= 400) {
      this.error(`${req.method} ${req.url} - ${res.statusCode}`, meta);
    } else {
      this.info(`${req.method} ${req.url} - ${res.statusCode}`, meta);
    }
  }

  // Log de erros de banco de dados
  database(operation, error = null, meta = {}) {
    if (error) {
      this.error(`Database ${operation} failed`, { ...meta, error: error.message });
    } else {
      this.info(`Database ${operation} successful`, meta);
    }
  }

  // Log de autenticação
  auth(action, success, meta = {}) {
    const level = success ? 'info' : 'warn';
    this.log(level, `Auth ${action} ${success ? 'successful' : 'failed'}`, meta);
  }

  // Log de upload
  upload(filename, success, meta = {}) {
    const level = success ? 'info' : 'error';
    this.log(level, `Upload ${success ? 'successful' : 'failed'}: ${filename}`, meta);
  }

  // Log de backup
  backup(action, success, meta = {}) {
    const level = success ? 'info' : 'error';
    this.log(level, `Backup ${action} ${success ? 'successful' : 'failed'}`, meta);
  }

  // Limpar logs antigos
  cleanup(daysToKeep = 30) {
    try {
      const files = [this.logFile, this.errorFile];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      files.forEach(file => {
        if (fs.existsSync(file)) {
          const stats = fs.statSync(file);
          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(file);
            this.info(`Log file cleaned up: ${path.basename(file)}`);
          }
        }
      });
    } catch (error) {
      this.error('Error cleaning up log files', { error: error.message });
    }
  }

  // Obter estatísticas dos logs
  getStats() {
    try {
      const stats = {
        logFile: {
          exists: fs.existsSync(this.logFile),
          size: fs.existsSync(this.logFile) ? fs.statSync(this.logFile).size : 0
        },
        errorFile: {
          exists: fs.existsSync(this.errorFile),
          size: fs.existsSync(this.errorFile) ? fs.statSync(this.errorFile).size : 0
        }
      };

      return stats;
    } catch (error) {
      this.error('Error getting log stats', { error: error.message });
      return null;
    }
  }
}

// Criar instância singleton
const logger = new Logger();

// Middleware para Express
const httpLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    logger.http(req, res, responseTime);
  });
  
  next();
};

// Middleware para capturar erros não tratados
const errorLogger = (err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  next(err);
};

module.exports = {
  logger,
  httpLogger,
  errorLogger
};
