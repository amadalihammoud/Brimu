import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, trackPageView, BrimuEvents, GAUtils } from '../utils/analytics/gtag';

/**
 * Hook personalizado para analytics
 * @param {Object} options - Configurações do hook
 * @returns {Object} Funções e estado de analytics
 */
const useAnalytics = (options = {}) => {
  const location = useLocation();
  const {
    enableAutoPageTracking = true,
    enableScrollTracking = true,
    enableTimeTracking = true,
    measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID
  } = options;

  const pageStartTime = useRef(Date.now());
  const scrollThresholds = useRef(new Set());
  const timeThresholds = useRef(new Set());
  const isInitialized = useRef(false);

  /**
   * Inicializa o Google Analytics
   */
  const initialize = useCallback(async () => {
    if (isInitialized.current) return;
    
    const success = initGA(measurementId);
    if (success) {
      isInitialized.current = true;
      console.log('📊 Analytics inicializado via hook');
    }
  }, [measurementId]);

  /**
   * Rastreia eventos do Brimu
   */
  const track = {
    // Visualização de página
    pageView: useCallback((path, title, params = {}) => {
      trackPageView(path || location.pathname, title || document.title, params);
    }, [location.pathname]),

    // Solicitação de orçamento
    quoteRequest: useCallback((serviceType, contactMethod = 'form') => {
      BrimuEvents.quoteRequest(serviceType, contactMethod);
    }, []),

    // Visualização de serviços
    serviceView: useCallback((serviceName) => {
      BrimuEvents.serviceView(serviceName);
    }, []),

    // Clique em contato
    contactClick: useCallback((contactType, section = 'unknown') => {
      BrimuEvents.contactClick(contactType, section);
    }, []),

    // Envio de formulário
    formSubmit: useCallback((formType, formData = {}) => {
      BrimuEvents.formSubmit(formType, formData);
    }, []),

    // Scroll depth
    scrollDepth: useCallback((percentage) => {
      if (!scrollThresholds.current.has(percentage)) {
        scrollThresholds.current.add(percentage);
        BrimuEvents.scrollDepth(percentage, location.pathname);
      }
    }, [location.pathname]),

    // Tempo na página
    timeOnPage: useCallback((seconds) => {
      if (!timeThresholds.current.has(seconds)) {
        timeThresholds.current.add(seconds);
        BrimuEvents.timeOnPage(seconds, location.pathname);
      }
    }, [location.pathname]),

    // Link externo
    externalLink: useCallback((url, linkText) => {
      BrimuEvents.externalLinkClick(url, linkText);
    }, []),

    // Download de arquivo
    fileDownload: useCallback((fileName, fileType) => {
      BrimuEvents.fileDownload(fileName, fileType);
    }, []),

    // Erro
    error: useCallback((errorType, errorMessage) => {
      BrimuEvents.errorOccurred(errorType, errorMessage, location.pathname);
    }, [location.pathname]),

    // Busca no site
    search: useCallback((searchTerm, resultsCount = 0) => {
      BrimuEvents.siteSearch(searchTerm, resultsCount);
    }, []),

    // Instalação PWA
    pwaInstall: useCallback((method = 'prompt') => {
      BrimuEvents.pwaInstall(method);
    }, []),

    // Conversão
    conversion: useCallback((serviceType, value, currency = 'BRL') => {
      BrimuEvents.conversion(serviceType, value, currency);
    }, [])
  };

  /**
   * Configura rastreamento de scroll
   */
  const setupScrollTracking = useCallback(() => {
    if (!enableScrollTracking) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollPercent = Math.round((scrollTop / docHeight) * 100);

          // Rastrear marcos de scroll
          [25, 50, 75, 90].forEach(threshold => {
            if (scrollPercent >= threshold) {
              track.scrollDepth(threshold);
            }
          });

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enableScrollTracking, track.scrollDepth]);

  /**
   * Configura rastreamento de tempo na página
   */
  const setupTimeTracking = useCallback(() => {
    if (!enableTimeTracking) return;

    const interval = setInterval(() => {
      const timeOnPage = Math.floor((Date.now() - pageStartTime.current) / 1000);
      track.timeOnPage(timeOnPage);
    }, 30000); // A cada 30 segundos

    return () => {
      clearInterval(interval);
    };
  }, [enableTimeTracking, track.timeOnPage]);

  /**
   * Configura rastreamento de links externos
   */
  const setupExternalLinkTracking = useCallback(() => {
    const handleLinkClick = (event) => {
      const link = event.target.closest('a');
      if (!link) return;

      const href = link.href;
      if (href && (href.startsWith('http') && !href.includes(window.location.hostname))) {
        track.externalLink(href, link.textContent || href);
      }
    };

    document.addEventListener('click', handleLinkClick);
    
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, [track.externalLink]);

  /**
   * Limpa thresholds ao mudar de página
   */
  const resetPageTracking = useCallback(() => {
    scrollThresholds.current.clear();
    timeThresholds.current.clear();
    pageStartTime.current = Date.now();
  }, []);

  /**
   * Obtém estatísticas de analytics
   */
  const getStats = useCallback(async () => {
    if (!GAUtils.isLoaded()) return null;

    try {
      const clientId = await GAUtils.getClientId();
      return {
        isLoaded: GAUtils.isLoaded(),
        clientId,
        currentPage: location.pathname,
        timeOnCurrentPage: Math.floor((Date.now() - pageStartTime.current) / 1000),
        scrollThresholdsHit: Array.from(scrollThresholds.current).sort(),
        timeThresholdsHit: Array.from(timeThresholds.current).sort()
      };
    } catch (error) {
      console.error('Erro ao obter stats de analytics:', error);
      return null;
    }
  }, [location.pathname]);

  // Effect para inicialização
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Effect para tracking automático de página
  useEffect(() => {
    if (enableAutoPageTracking && isInitialized.current) {
      // Pequeno delay para garantir que o título da página foi atualizado
      const timer = setTimeout(() => {
        track.pageView();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, enableAutoPageTracking, track.pageView]);

  // Effect para configurar tracking quando a rota muda
  useEffect(() => {
    resetPageTracking();

    const cleanupFunctions = [];

    if (isInitialized.current) {
      cleanupFunctions.push(
        setupScrollTracking(),
        setupTimeTracking(), 
        setupExternalLinkTracking()
      );
    }

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup && cleanup());
    };
  }, [location.pathname, setupScrollTracking, setupTimeTracking, setupExternalLinkTracking, resetPageTracking]);

  return {
    // Estado
    isInitialized: isInitialized.current,
    currentPage: location.pathname,
    
    // Métodos de tracking
    track,
    
    // Utilitários
    getStats,
    
    // Controles
    pause: GAUtils.pauseTracking,
    resume: GAUtils.resumeTracking,
    isLoaded: GAUtils.isLoaded
  };
};

export default useAnalytics;