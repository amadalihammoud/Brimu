import { Request, Response } from 'express';
interface HealthStatus {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    uptime: number;
    version: string;
    environment: string;
    services: {
        database: ServiceHealth;
        cache: ServiceHealth;
        disk: ServiceHealth;
        memory: ServiceHealth;
    };
}
interface ServiceHealth {
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    details?: any;
    error?: string;
}
declare class HealthMonitor {
    private startTime;
    checkHealth(): Promise<HealthStatus>;
    private checkDatabase;
    private checkCache;
    private checkDisk;
    private checkMemory;
    private determineOverallStatus;
    healthHandler(req: Request, res: Response): Promise<void>;
    readinessHandler(req: Request, res: Response): Promise<void>;
    livenessHandler(req: Request, res: Response): Promise<void>;
}
declare const _default: HealthMonitor;
export default _default;
//# sourceMappingURL=healthCheck.d.ts.map