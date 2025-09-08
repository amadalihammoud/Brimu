import logger from '../../src/logging/logger';
import winston from 'winston';

// Mock winston
jest.mock('winston', () => {
  const mockLogger = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    http: jest.fn(),
    debug: jest.fn(),
  };

  return {
    createLogger: jest.fn(() => mockLogger),
    format: {
      combine: jest.fn(),
      timestamp: jest.fn(),
      errors: jest.fn(),
      metadata: jest.fn(),
      json: jest.fn(),
      colorize: jest.fn(),
      printf: jest.fn(),
    },
    transports: {
      Console: jest.fn(),
      File: jest.fn(),
    },
    addColors: jest.fn(),
  };
});

describe('Logger', () => {
  let mockWinstonLogger: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWinstonLogger = winston.createLogger();
  });

  describe('Basic logging methods', () => {
    it('should log error messages', () => {
      const message = 'Test error message';
      const context = { userId: 'user123' };
      const error = new Error('Test error');

      logger.error(message, context, error);

      expect(mockWinstonLogger.error).toHaveBeenCalledWith(
        message,
        expect.objectContaining({
          userId: 'user123',
          error: expect.objectContaining({
            name: 'Error',
            message: 'Test error',
            stack: expect.any(String),
          }),
        })
      );
    });

    it('should log info messages', () => {
      const message = 'Test info message';
      const context = { requestId: 'req123' };

      logger.info(message, context);

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(message, context);
    });

    it('should log warning messages', () => {
      const message = 'Test warning message';
      const context = { ip: '192.168.1.1' };

      logger.warn(message, context);

      expect(mockWinstonLogger.warn).toHaveBeenCalledWith(message, context);
    });

    it('should log debug messages', () => {
      const message = 'Test debug message';
      const context = { method: 'GET' };

      logger.debug(message, context);

      expect(mockWinstonLogger.debug).toHaveBeenCalledWith(message, context);
    });

    it('should log HTTP messages', () => {
      const message = 'Test HTTP message';
      const context = { url: '/api/test' };

      logger.http(message, context);

      expect(mockWinstonLogger.http).toHaveBeenCalledWith(message, context);
    });
  });

  describe('Specific logging methods', () => {
    it('should log user actions', () => {
      const action = 'user_login';
      const userId = 'user123';
      const details = { ip: '192.168.1.1' };

      logger.logUserAction(action, userId, details);

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        `User action: ${action}`,
        expect.objectContaining({
          userId,
          action,
          details,
          category: 'user_action',
        })
      );
    });

    it('should log API requests', () => {
      const method = 'POST';
      const url = '/api/users';
      const statusCode = 201;
      const duration = 150;
      const context = { userId: 'user123' };

      logger.logApiRequest(method, url, statusCode, duration, context);

      expect(mockWinstonLogger.http).toHaveBeenCalledWith(
        `${method} ${url} - ${statusCode}`,
        expect.objectContaining({
          method,
          url,
          statusCode,
          duration,
          category: 'api_request',
          userId: 'user123',
        })
      );
    });

    it('should log database operations', () => {
      const operation = 'find';
      const collection = 'users';
      const duration = 25;
      const details = { query: { active: true } };

      logger.logDatabaseOperation(operation, collection, duration, details);

      expect(mockWinstonLogger.debug).toHaveBeenCalledWith(
        `Database ${operation} on ${collection}`,
        expect.objectContaining({
          operation,
          collection,
          duration,
          details,
          category: 'database',
        })
      );
    });

    it('should log security events', () => {
      const event = 'failed_login_attempt';
      const context = { ip: '192.168.1.1', attempts: 3 };

      logger.logSecurityEvent(event, context);

      expect(mockWinstonLogger.warn).toHaveBeenCalledWith(
        `Security event: ${event}`,
        expect.objectContaining({
          event,
          category: 'security',
          ip: '192.168.1.1',
          attempts: 3,
        })
      );
    });

    it('should log system events', () => {
      const event = 'server_start';
      const context = { port: 5000, env: 'production' };

      logger.logSystemEvent(event, context);

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        `System event: ${event}`,
        expect.objectContaining({
          event,
          category: 'system',
          port: 5000,
          env: 'production',
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should handle logging without context', () => {
      const message = 'Test message without context';

      logger.info(message);

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(message, undefined);
    });

    it('should handle logging without error object', () => {
      const message = 'Test error without error object';
      const context = { userId: 'user123' };

      logger.error(message, context);

      expect(mockWinstonLogger.error).toHaveBeenCalledWith(
        message,
        expect.objectContaining({
          userId: 'user123',
          error: undefined,
        })
      );
    });
  });
});