declare class RedisCache {
    private client;
    private isConnected;
    private memoryCache;
    private useMemoryFallback;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    get<T = any>(key: string): Promise<T | null>;
    set(key: string, value: any, ttlSeconds?: number): Promise<boolean>;
    del(key: string): Promise<boolean>;
    flush(): Promise<boolean>;
    keys(pattern: string): Promise<string[]>;
    private getFromMemory;
    private setInMemory;
    private cleanupMemoryCache;
    getStats(): {
        isConnected: boolean;
        useMemoryFallback: boolean;
        memoryCacheSize: number;
    };
}
declare const _default: RedisCache;
export default _default;
//# sourceMappingURL=redisClient.d.ts.map