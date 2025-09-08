import winston from 'winston';
import path from 'path';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each log level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(logColors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports
const transports = [
  // Console transport for development
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: logFormat,
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 10,
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
    winston.format.json()
  ),
  transports,
  exitOnError: false,
});

// Enhanced logging methods
export interface LogContext {
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

class Logger {
  private winston: winston.Logger;

  constructor() {
    this.winston = logger;
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.winston.error(message, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    });
  }

  warn(message: string, context?: LogContext): void {
    this.winston.warn(message, context);
  }

  info(message: string, context?: LogContext): void {
    this.winston.info(message, context);
  }

  http(message: string, context?: LogContext): void {
    this.winston.http(message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.winston.debug(message, context);
  }

  // Specific logging methods
  logUserAction(action: string, userId: string, details?: any): void {
    this.info(`User action: ${action}`, {
      userId,
      action,
      details,
      category: 'user_action',
    });
  }

  logApiRequest(method: string, url: string, statusCode: number, duration: number, context?: LogContext): void {
    this.http(`${method} ${url} - ${statusCode}`, {
      method,
      url,
      statusCode,
      duration,
      category: 'api_request',
      ...context,
    });
  }

  logDatabaseOperation(operation: string, collection: string, duration?: number, details?: any): void {
    this.debug(`Database ${operation} on ${collection}`, {
      operation,
      collection,
      duration,
      details,
      category: 'database',
    });
  }

  logSecurityEvent(event: string, context?: LogContext): void {
    this.warn(`Security event: ${event}`, {
      event,
      category: 'security',
      ...context,
    });
  }

  logSystemEvent(event: string, context?: LogContext): void {
    this.info(`System event: ${event}`, {
      event,
      category: 'system',
      ...context,
    });
  }
}

export default new Logger();