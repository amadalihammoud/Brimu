import { useState, useEffect, useCallback } from 'react';
import { 
  registerSW,
  applyUpdate,
  getCacheInfo,
  clearAllCaches,
  prefetchResources,
  isPWA,
  isOnline as checkOnline,
  setupConnectivityListeners
} from '../utils/pwa/serviceWorkerRegistration';

/**
 * Hook personalizado para gerenciamento de PWA
 * @param {Object} options - Configurações do hook
 * @returns {Object} Estado e métodos PWA
 */
const usePWA = (options = {}) => {
  const {
    enableAutoUpdate = true,
    enableNotifications = true,
    enableOfflineDetection = true
  } = options;

  // Estado PWA
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isOnline, setIsOnline] = useState(checkOnline());
  const [installPrompt, setInstallPrompt] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [swRegistration, setSwRegistration] = useState(null);

  /**
   * Inicializa o Service Worker
   */
  const initializeServiceWorker = useCallback(async () => {
    try {
      const registration = await registerSW({
        enableAutoUpdate,
        enableNotifications
      });
      
      if (registration) {
        setSwRegistration(registration);
        console.log('✅ Service Worker inicializado');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar Service Worker:', error);
    }
  }, [enableAutoUpdate, enableNotifications]);

  /**
   * Atualiza informações do cache
   */
  const updateCacheInfo = useCallback(async () => {
    try {
      const info = await getCacheInfo();
      setCacheInfo(info);
    } catch (error) {
      console.error('Erro ao obter informações do cache:', error);
    }
  }, []);

  /**
   * Instala ou atualiza o PWA
   */
  const installOrUpdate = useCallback(() => {
    if (isUpdateAvailable) {
      applyUpdate();
    } else if (installPrompt) {
      installPrompt.prompt();
      
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('🎉 PWA instalado pelo usuário');
        } else {
          console.log('❌ Usuário rejeitou a instalação do PWA');
        }
        setInstallPrompt(null);
      });
    }
  }, [isUpdateAvailable, installPrompt]);

  /**
   * Limpa todos os caches
   */
  const clearCache = useCallback(async () => {
    try {
      const result = await clearAllCaches();
      if (result) {
        console.log('🗑️ Cache limpo com sucesso');
        await updateCacheInfo();
        return true;
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
    return false;
  }, [updateCacheInfo]);

  /**
   * Prefetch de recursos importantes
   */
  const prefetchCriticalResources = useCallback(async () => {
    const criticalUrls = [
      '/',
      '/#services',
      '/#about',
      '/#contact',
      '/images/hero-bg.jpg',
      '/images/brimu-logo.png'
    ];

    try {
      const result = await prefetchResources(criticalUrls);
      if (result) {
        console.log('📦 Recursos críticos carregados no cache');
        await updateCacheInfo();
      }
    } catch (error) {
      console.error('Erro no prefetch:', error);
    }
  }, [updateCacheInfo]);

  /**
   * Verifica se pode solicitar permissões de notificação
   */
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        console.log('📱 Permissão de notificação:', permission);
        return permission === 'granted';
      } catch (error) {
        console.error('Erro ao solicitar permissão de notificação:', error);
      }
    }
    return false;
  }, []);

  /**
   * Obtém estatísticas de uso do PWA
   */
  const getPwaStats = useCallback(() => {
    return {
      isPwaInstalled,
      isOnline,
      isUpdateAvailable,
      canInstall: !!installPrompt,
      notificationPermission: 'Notification' in window ? Notification.permission : 'unsupported',
      cacheStats: cacheInfo,
      swRegistered: !!swRegistration
    };
  }, [isPwaInstalled, isOnline, isUpdateAvailable, installPrompt, cacheInfo, swRegistration]);

  // Effect para detectar PWA instalado
  useEffect(() => {
    setIsPwaInstalled(isPWA());
  }, []);

  // Effect para configurar listeners
  useEffect(() => {
    // Listener para prompt de instalação
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      console.log('💾 PWA pode ser instalado');
    };

    // Listener para quando PWA é instalado
    const handleAppInstalled = () => {
      console.log('🎉 PWA foi instalado');
      setIsPwaInstalled(true);
      setInstallPrompt(null);
    };

    // Listener para atualizações disponíveis
    const handleUpdateAvailable = () => {
      setIsUpdateAvailable(true);
    };

    // Listeners de conectividade
    if (enableOfflineDetection) {
      setupConnectivityListeners();
      
      const handleNetworkChange = (event) => {
        setIsOnline(event.detail.online);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
      window.addEventListener('swUpdateAvailable', handleUpdateAvailable);
      window.addEventListener('networkStatusChange', handleNetworkChange);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
        window.removeEventListener('swUpdateAvailable', handleUpdateAvailable);
        window.removeEventListener('networkStatusChange', handleNetworkChange);
      };
    }
  }, [enableOfflineDetection]);

  // Effect para inicializar Service Worker
  useEffect(() => {
    initializeServiceWorker();
  }, [initializeServiceWorker]);

  // Effect para atualizar cache info periodicamente
  useEffect(() => {
    if (swRegistration) {
      updateCacheInfo();
      
      const interval = setInterval(updateCacheInfo, 300000); // 5 minutos
      
      return () => clearInterval(interval);
    }
  }, [swRegistration, updateCacheInfo]);

  return {
    // Estado
    isPwaInstalled,
    isUpdateAvailable,
    isOnline,
    canInstall: !!installPrompt,
    cacheInfo,
    swRegistration: !!swRegistration,
    
    // Métodos
    installOrUpdate,
    clearCache,
    prefetchCriticalResources,
    requestNotificationPermission,
    getPwaStats,
    
    // Utilitários
    refreshCacheInfo: updateCacheInfo
  };
};

export default usePWA;