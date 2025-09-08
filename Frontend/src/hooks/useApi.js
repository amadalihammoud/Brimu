import { useState, useEffect, useCallback, useRef } from 'react';
import config from '../config';

export const useApi = (apiFunction, options = {}) => {
  const {
    immediate = false,
    dependencies = [],
    onSuccess = null,
    onError = null,
    retryOnError = false,
    retryAttempts = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  // Função para executar a API
  const execute = useCallback(async (...args) => {
    if (!isMountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Criar novo AbortController
      abortControllerRef.current = new AbortController();

      const result = await apiFunction(...args);
      
      if (isMountedRef.current) {
        setData(result);
        setRetryCount(0);
        
        if (onSuccess) {
          onSuccess(result);
        }
      }

      return result;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
        
        if (onError) {
          onError(err);
        }

        // Tentar novamente se habilitado
        if (retryOnError && retryCount < retryAttempts) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            if (isMountedRef.current) {
              execute(...args);
            }
          }, retryDelay * (retryCount + 1));
        }
      }
      
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunction, onSuccess, onError, retryOnError, retryAttempts, retryDelay, retryCount]);

  // Função para recarregar dados
  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  // Função para cancelar requisição
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Função para limpar dados
  const clear = useCallback(() => {
    setData(null);
    setError(null);
    setRetryCount(0);
  }, []);

  // Executar automaticamente se habilitado
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute, ...dependencies]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    retryCount,
    execute,
    refetch,
    cancel,
    clear
  };
};

// Hook para operações CRUD
export const useCrud = (api, options = {}) => {
  const {
    immediate = true,
    onSuccess = null,
    onError = null
  } = options;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Carregar itens
  const loadItems = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getAll(params);
      
      if (response.data) {
        setItems(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setItems(response);
      }
      
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err) {
      setError(err);
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [api, onSuccess, onError]);

  // Criar item
  const createItem = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.create(data);
      
      // Adicionar novo item à lista
      setItems(prev => [response, ...prev]);
      
      if (onSuccess) {
        onSuccess(response);
      }
      
      return response;
    } catch (err) {
      setError(err);
      if (onError) {
        onError(err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, onSuccess, onError]);

  // Atualizar item
  const updateItem = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.update(id, data);
      
      // Atualizar item na lista
      setItems(prev => prev.map(item => 
        item.id === id || item._id === id ? response : item
      ));
      
      if (onSuccess) {
        onSuccess(response);
      }
      
      return response;
    } catch (err) {
      setError(err);
      if (onError) {
        onError(err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, onSuccess, onError]);

  // Deletar item
  const deleteItem = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(id);
      
      // Remover item da lista
      setItems(prev => prev.filter(item => 
        item.id !== id && item._id !== id
      ));
      
      if (onSuccess) {
        onSuccess(id);
      }
    } catch (err) {
      setError(err);
      if (onError) {
        onError(err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, onSuccess, onError]);

  // Buscar item por ID
  const getItem = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getById(id);
      
      if (onSuccess) {
        onSuccess(response);
      }
      
      return response;
    } catch (err) {
      setError(err);
      if (onError) {
        onError(err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, onSuccess, onError]);

  // Executar automaticamente se habilitado
  useEffect(() => {
    if (immediate) {
      loadItems();
    }
  }, [immediate, loadItems]);

  return {
    items,
    loading,
    error,
    pagination,
    loadItems,
    createItem,
    updateItem,
    deleteItem,
    getItem,
    setItems,
    clearError: () => setError(null)
  };
};

// Hook para paginação
export const usePagination = (totalItems, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(itemsPerPage);

  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    resetPagination
  };
};

// Hook para debounce
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook para local storage
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Erro ao salvar localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Erro ao remover localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};
