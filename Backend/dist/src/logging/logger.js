"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
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
winston_1.default.addColors(logColors);
// Define log format
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
// Define transports
const transports = [
    // Console transport for development
    new winston_1.default.transports.Console({
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
        format: logFormat,
    }),
    // File transport for errors
    new winston_1.default.transports.File({
        filename: path_1.default.join('logs', 'error.log'),
        level: 'error',
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
    // File transport for all logs
    new winston_1.default.transports.File({
        filename: path_1.default.join('logs', 'combined.log'),
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
        maxsize: 5242880, // 5MB
        maxFiles: 10,
    }),
];
// Create the logger
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels: logLevels,
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }), winston_1.default.format.json()),
    transports,
    exitOnError: false,
});
class Logger {
    constructor() {
        this.winston = logger;
    }
    error(message, context, error) {
        this.winston.error(message, {
            ...context,
            error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
            } : undefined,
        });
    }
    warn(message, context) {
        this.winston.warn(message, context);
    }
    info(message, context) {
        this.winston.info(message, context);
    }
    http(message, context) {
        this.winston.http(message, context);
    }
    debug(message, context) {
        this.winston.debug(message, context);
    }
    // Specific logging methods
    logUserAction(action, userId, details) {
        this.info(`User action: ${action}`, {
            userId,
            action,
            details,
            category: 'user_action',
        });
    }
    logApiRequest(method, url, statusCode, duration, context) {
        this.http(`${method} ${url} - ${statusCode}`, {
            method,
            url,
            statusCode,
            duration,
            category: 'api_request',
            ...context,
        });
    }
    logDatabaseOperation(operation, collection, duration, details) {
        this.debug(`Database ${operation} on ${collection}`, {
            operation,
            collection,
            duration,
            details,
            category: 'database',
        });
    }
    logSecurityEvent(event, context) {
        this.warn(`Security event: ${event}`, {
            event,
            category: 'security',
            ...context,
        });
    }
    logSystemEvent(event, context) {
        this.info(`System event: ${event}`, {
            event,
            category: 'system',
            ...context,
        });
    }
}
exports.default = new Logger();
