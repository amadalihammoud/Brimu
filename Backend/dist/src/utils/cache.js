"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheMiddleware = exports.typedCache = exports.cache = exports.TypedCache = exports.Cache = void 0;
const config_1 = __importDefault(require("../config"));
class Cache {
    constructor() {
        this.hits = 0;
        this.misses = 0;
        this.cache = new Map();
        this.ttl = new Map();
        this.maxSize = config_1.default.cache?.maxSize || 100;
        this.defaultTTL = config_1.default.cache?.defaultTTL || 5 * 60 * 1000; // 5 minutos
    }
    // Gerar chave de cache
    generateKey(key, prefix = '') {
        return prefix ? `${prefix}:${key}` : key;
    }
    // Verificar se item está expirado
    isExpired(key) {
        const expiry = this.ttl.get(key);
        if (!expiry)
            return false;
        return Date.now() > expiry;
    }
    // Limpar item expirado
    removeExpired(key) {
        if (this.isExpired(key)) {
            this.cache.delete(key);
            this.ttl.delete(key);
            return true;
        }
        return false;
    }
    // Limpar todos os itens expirados
    cleanup() {
        const now = Date.now();
        for (const [key, expiry] of this.ttl.entries()) {
            if (now > expiry) {
                this.cache.delete(key);
                this.ttl.delete(key);
            }
        }
    }
    // Verificar se cache está cheio
    isFull() {
        return this.cache.size >= this.maxSize;
    }
    // Remover item mais antigo (LRU)
    evictOldest() {
        if (this.cache.size === 0)
            return;
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
        this.ttl.delete(firstKey);
    }
    // Definir item no cache
    set(key, value, ttl = this.defaultTTL) {
        const fullKey = this.generateKey(key);
        // Limpar item expirado se existir
        this.removeExpired(fullKey);
        // Se cache está cheio, remover item mais antigo
        if (this.isFull()) {
            this.evictOldest();
        }
        // Definir valor e TTL
        this.cache.set(fullKey, {
            value,
            timestamp: Date.now()
        });
        this.ttl.set(fullKey, Date.now() + ttl);
        return true;
    }
    // Obter item do cache
    get(key) {
        const fullKey = this.generateKey(key);
        // Verificar se item existe e não está expirado
        if (!this.cache.has(fullKey) || this.isExpired(fullKey)) {
            this.removeExpired(fullKey);
            return null;
        }
        const item = this.cache.get(fullKey);
        return item.value;
    }
    // Verificar se item existe
    has(key) {
        const fullKey = this.generateKey(key);
        return this.cache.has(fullKey) && !this.isExpired(fullKey);
    }
    // Remover item do cache
    delete(key) {
        const fullKey = this.generateKey(key);
        const deleted = this.cache.delete(fullKey);
        this.ttl.delete(fullKey);
        return deleted;
    }
    // Limpar todo o cache
    clear() {
        this.cache.clear();
        this.ttl.clear();
    }
    // Obter estatísticas do cache
    getStats() {
        this.cleanup(); // Limpar itens expirados primeiro
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: this.hits / (this.hits + this.misses) || 0,
            hits: this.hits || 0,
            misses: this.misses || 0,
            memoryUsage: process.memoryUsage().heapUsed
        };
    }
    // Incrementar contador de hits
    incrementHits() {
        this.hits = (this.hits || 0) + 1;
    }
    // Incrementar contador de misses
    incrementMisses() {
        this.misses = (this.misses || 0) + 1;
    }
    // Obter item com estatísticas
    getWithStats(key) {
        const value = this.get(key);
        if (value !== null) {
            this.incrementHits();
        }
        else {
            this.incrementMisses();
        }
        return value;
    }
    // Cache com função assíncrona
    async getOrSet(key, fetchFunction, ttl = this.defaultTTL) {
        const cached = this.get(key);
        if (cached !== null) {
            this.incrementHits();
            return cached;
        }
        this.incrementMisses();
        try {
            const value = await fetchFunction();
            this.set(key, value, ttl);
            return value;
        }
        catch (error) {
            throw error;
        }
    }
    // Cache com função síncrona
    getOrSetSync(key, fetchFunction, ttl = this.defaultTTL) {
        const cached = this.get(key);
        if (cached !== null) {
            this.incrementHits();
            return cached;
        }
        this.incrementMisses();
        try {
            const value = fetchFunction();
            this.set(key, value, ttl);
            return value;
        }
        catch (error) {
            throw error;
        }
    }
    // Invalidar cache por padrão
    invalidatePattern(pattern) {
        const regex = new RegExp(pattern);
        let count = 0;
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
                this.ttl.delete(key);
                count++;
            }
        }
        return count;
    }
    // Obter todas as chaves
    keys() {
        this.cleanup();
        return Array.from(this.cache.keys());
    }
    // Obter todos os valores
    values() {
        this.cleanup();
        return Array.from(this.cache.values()).map((item) => item.value);
    }
    // Obter todas as entradas
    entries() {
        this.cleanup();
        const entries = [];
        for (const [key, item] of this.cache.entries()) {
            entries.push([key, item.value]);
        }
        return entries;
    }
}
exports.Cache = Cache;
// Cache para diferentes tipos de dados
class TypedCache {
    constructor() {
        this.caches = {
            user: new Cache(),
            service: new Cache(),
            order: new Cache(),
            quote: new Cache(),
            payment: new Cache(),
            general: new Cache()
        };
    }
    // Obter cache por tipo
    getCache(type = 'general') {
        return this.caches[type] || this.caches.general;
    }
    // Métodos genéricos
    set(type, key, value, ttl) {
        return this.getCache(type).set(key, value, ttl);
    }
    get(type, key) {
        return this.getCache(type).get(key);
    }
    has(type, key) {
        return this.getCache(type).has(key);
    }
    delete(type, key) {
        return this.getCache(type).delete(key);
    }
    clear(type) {
        if (type) {
            this.getCache(type).clear();
        }
        else {
            Object.values(this.caches).forEach((cache) => cache.clear());
        }
    }
    // Invalidar por tipo
    invalidateType(type) {
        this.getCache(type).clear();
    }
    // Obter estatísticas de todos os caches
    getAllStats() {
        const stats = {};
        for (const [type, cache] of Object.entries(this.caches)) {
            stats[type] = cache.getStats();
        }
        return stats;
    }
}
exports.TypedCache = TypedCache;
// Criar instâncias singleton
const cache = new Cache();
exports.cache = cache;
const typedCache = new TypedCache();
exports.typedCache = typedCache;
// Middleware para cache de requisições
const cacheMiddleware = (ttl = 5 * 60 * 1000) => {
    return (req, res, next) => {
        // Só cachear requisições GET
        if (req.method !== 'GET') {
            return next();
        }
        const cacheKey = `${req.method}:${req.originalUrl}`;
        const cached = cache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }
        // Interceptar resposta
        const originalSend = res.json;
        res.json = function (data) {
            // Só cachear respostas bem-sucedidas
            if (res.statusCode === 200) {
                cache.set(cacheKey, data, ttl);
            }
            return originalSend.call(this, data);
        };
        next();
    };
};
exports.cacheMiddleware = cacheMiddleware;
