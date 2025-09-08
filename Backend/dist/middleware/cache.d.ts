import { Request, Response, NextFunction } from 'express';
interface CacheOptions {
    ttl?: number;
    keyGenerator?: (req: Request) => string;
    condition?: (req: Request) => boolean;
    skipCache?: (req: Request) => boolean;
}
export declare const cacheMiddleware: (options?: CacheOptions) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const userCache: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const equipmentCache: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const serviceCache: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const orderCache: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const invalidateCache: (pattern: string) => Promise<void>;
export declare const invalidateUserCache: (userId?: string) => Promise<void>;
export declare const invalidateEquipmentCache: (equipmentId?: string) => Promise<void>;
export declare const invalidateServiceCache: (serviceId?: string) => Promise<void>;
export declare const invalidateOrderCache: (orderId?: string) => Promise<void>;
export {};
//# sourceMappingURL=cache.d.ts.map