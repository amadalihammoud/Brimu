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
declare class Logger {
    private winston;
    constructor();
    error(message: string, context?: LogContext, error?: Error): void;
    warn(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    http(message: string, context?: LogContext): void;
    debug(message: string, context?: LogContext): void;
    logUserAction(action: string, userId: string, details?: any): void;
    logApiRequest(method: string, url: string, statusCode: number, duration: number, context?: LogContext): void;
    logDatabaseOperation(operation: string, collection: string, duration?: number, details?: any): void;
    logSecurityEvent(event: string, context?: LogContext): void;
    logSystemEvent(event: string, context?: LogContext): void;
}
declare const _default: Logger;
export default _default;
//# sourceMappingURL=logger.d.ts.map