import config from '../config';

// Cache em memória
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map();
    this.maxSize = config.cache?.maxSize || 50;
    this.defaultTTL = config.cache?.defaultTTL || 5 * 60 * 1000; // 5 minutos
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  // Gerar chave de cache
  generateKey(key, prefix = '') {
    return prefix ? `${prefix}:${key}` : key;
  }

  // Verificar se item está expirado
  isExpired(key) {
    const expiry = this.ttl.get(key);
    if (!expiry) return false;
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
    let cleaned = 0;
    
    for (const [key, expiry] of this.ttl.entries()) {
      if (now > expiry) {
        this.cache.delete(key);
        this.ttl.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  // Verificar se cache está cheio
  isFull() {
    return this.cache.size >= this.maxSize;
  }

  // Remover item mais antigo (LRU)
  evictOldest() {
    if (this.cache.size === 0) return;
    
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
      timestamp: Date.now(),
      accessCount: 0
    });
    
    this.ttl.set(fullKey, Date.now() + ttl);
    this.stats.sets++;
    
    return true;
  }

  // Obter item do cache
  get(key) {
    const fullKey = this.generateKey(key);
    
    // Verificar se item existe e não está expirado
    if (!this.cache.has(fullKey) || this.isExpired(fullKey)) {
      this.removeExpired(fullKey);
      this.stats.misses++;
      return null;
    }
    
    const item = this.cache.get(fullKey);
    item.accessCount++;
    this.stats.hits++;
    
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
    if (deleted) this.stats.deletes++;
    return deleted;
  }

  // Limpar todo o cache
  clear() {
    this.cache.clear();
    this.ttl.clear();
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  // Obter estatísticas do cache
  getStats() {
    this.cleanup();
    
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: Math.round(hitRate * 100) / 100,
      hits: this.stats.hits,
      misses: this.stats.misses,
      sets: this.stats.sets,
      deletes: this.stats.deletes,
      memoryUsage: this.getMemoryUsage()
    };
  }

  // Estimar uso de memória
  getMemoryUsage() {
    let size = 0;
    for (const [key, item] of this.cache.entries()) {
      size += key.length * 2; // Unicode characters
      size += JSON.stringify(item.value).length * 2;
    }
    return size;
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
    return Array.from(this.cache.values()).map(item => item.value);
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

// Cache com localStorage
class LocalStorageCache {
  constructor() {
    this.prefix = 'brimu_cache_';
    this.maxSize = config.cache?.maxSize || 50;
    this.defaultTTL = config.cache?.defaultTTL || 5 * 60 * 1000;
  }

  // Gerar chave
  generateKey(key) {
    return `${this.prefix}${key}`;
  }

  // Verificar se localStorage está disponível
  isAvailable() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Obter item do localStorage
  get(key) {
    if (!this.isAvailable()) return null;

    try {
      const fullKey = this.generateKey(key);
      const item = localStorage.getItem(fullKey);
      
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      
      // Verificar se expirou
      if (Date.now() > parsed.expiry) {
        localStorage.removeItem(fullKey);
        return null;
      }
      
      return parsed.value;
    } catch (e) {
      console.error('Erro ao ler do localStorage:', e);
      return null;
    }
  }

  // Definir item no localStorage
  set(key, value, ttl = this.defaultTTL) {
    if (!this.isAvailable()) return false;

    try {
      const fullKey = this.generateKey(key);
      const item = {
        value,
        expiry: Date.now() + ttl,
        timestamp: Date.now()
      };
      
      localStorage.setItem(fullKey, JSON.stringify(item));
      return true;
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
      // Se localStorage está cheio, limpar itens expirados
      this.cleanup();
      try {
        localStorage.setItem(fullKey, JSON.stringify(item));
        return true;
      } catch (e2) {
        console.error('Erro ao salvar no localStorage após limpeza:', e2);
        return false;
      }
    }
  }

  // Remover item
  delete(key) {
    if (!this.isAvailable()) return false;

    try {
      const fullKey = this.generateKey(key);
      localStorage.removeItem(fullKey);
      return true;
    } catch (e) {
      console.error('Erro ao remover do localStorage:', e);
      return false;
    }
  }

  // Verificar se item existe
  has(key) {
    return this.get(key) !== null;
  }

  // Limpar itens expirados
  cleanup() {
    if (!this.isAvailable()) return 0;

    let cleaned = 0;
    const now = Date.now();
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            if (now > item.expiry) {
              localStorage.removeItem(key);
              cleaned++;
              i--; // Ajustar índice após remoção
            }
          } catch (e) {
            // Item corrompido, remover
            localStorage.removeItem(key);
            cleaned++;
            i--;
          }
        }
      }
    } catch (e) {
      console.error('Erro durante limpeza do localStorage:', e);
    }
    
    return cleaned;
  }

  // Limpar todo o cache
  clear() {
    if (!this.isAvailable()) return;

    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.error('Erro ao limpar localStorage:', e);
    }
  }

  // Obter estatísticas
  getStats() {
    if (!this.isAvailable()) return { size: 0, maxSize: this.maxSize };

    let size = 0;
    let expired = 0;
    const now = Date.now();
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            if (now > item.expiry) {
              expired++;
            } else {
              size++;
            }
          } catch (e) {
            // Item corrompido
            expired++;
          }
        }
      }
    } catch (e) {
      console.error('Erro ao obter estatísticas do localStorage:', e);
    }
    
    return {
      size,
      expired,
      maxSize: this.maxSize,
      total: size + expired
    };
  }
}

// Cache híbrido (memória + localStorage)
class HybridCache {
  constructor() {
    this.memoryCache = new MemoryCache();
    this.localStorageCache = new LocalStorageCache();
    this.enableLocalStorage = config.cache?.enableLocalStorage !== false;
  }

  set(key, value, ttl) {
    // Sempre salvar na memória
    this.memoryCache.set(key, value, ttl);
    
    // Salvar no localStorage se habilitado
    if (this.enableLocalStorage) {
      this.localStorageCache.set(key, value, ttl);
    }
  }

  get(key) {
    // Tentar obter da memória primeiro
    let value = this.memoryCache.get(key);
    
    if (value !== null) {
      return value;
    }
    
    // Se não encontrou na memória, tentar localStorage
    if (this.enableLocalStorage) {
      value = this.localStorageCache.get(key);
      
      if (value !== null) {
        // Restaurar na memória
        this.memoryCache.set(key, value);
        return value;
      }
    }
    
    return null;
  }

  has(key) {
    return this.memoryCache.has(key) || 
           (this.enableLocalStorage && this.localStorageCache.has(key));
  }

  delete(key) {
    const memoryDeleted = this.memoryCache.delete(key);
    const localStorageDeleted = this.enableLocalStorage ? 
      this.localStorageCache.delete(key) : false;
    
    return memoryDeleted || localStorageDeleted;
  }

  clear() {
    this.memoryCache.clear();
    if (this.enableLocalStorage) {
      this.localStorageCache.clear();
    }
  }

  cleanup() {
    const memoryCleaned = this.memoryCache.cleanup();
    const localStorageCleaned = this.enableLocalStorage ? 
      this.localStorageCache.cleanup() : 0;
    
    return memoryCleaned + localStorageCleaned;
  }

  getStats() {
    const memoryStats = this.memoryCache.getStats();
    const localStorageStats = this.enableLocalStorage ? 
      this.localStorageCache.getStats() : { size: 0 };
    
    return {
      memory: memoryStats,
      localStorage: localStorageStats,
      total: memoryStats.size + localStorageStats.size
    };
  }
}

// Instâncias singleton
const memoryCache = new MemoryCache();
const localStorageCache = new LocalStorageCache();
const hybridCache = new HybridCache();

// Limpeza automática a cada 5 minutos
setInterval(() => {
  memoryCache.cleanup();
  if (config.cache?.enableLocalStorage !== false) {
    localStorageCache.cleanup();
  }
}, 5 * 60 * 1000);

// Limpeza ao fechar a página
window.addEventListener('beforeunload', () => {
  memoryCache.cleanup();
});

export {
  MemoryCache,
  LocalStorageCache,
  HybridCache,
  memoryCache,
  localStorageCache,
  hybridCache
};

export default hybridCache;
