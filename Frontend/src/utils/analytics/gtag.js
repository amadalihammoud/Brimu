/**
 * Google Analytics 4 - Sistema completo de tracking para Brimu
 */

// Configurações do GA4
const GA_CONFIG = {
  measurementId: 'G-L3K0S1CNRW', // ID real do GA4
  trackingOptions: {
    send_page_view: true,
    cookie_flags: 'SameSite=Strict;Secure',
    allow_google_signals: true,
    allow_ad_personalization_signals: false
  },
  customDimensions: {
    user_type: 'custom_parameter_1',
    service_interest: 'custom_parameter_2',
    form_source: 'custom_parameter_3'
  }
};

/**
 * Inicializa o Google Analytics 4
 */
export const initGA = (measurementId = GA_CONFIG.measurementId) => {
  // Verificar se está em produção
  if (process.env.NODE_ENV !== 'production' || !measurementId) {
    console.log('📊 GA4 não inicializado - Desenvolvimento ou ID não configurado');
    return false;
  }

  try {
    // Carregar script do gtag
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Configurar gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };

    // Inicializar com timestamp
    window.gtag('js', new Date());

    // Configurar GA4
    window.gtag('config', measurementId, {
      ...GA_CONFIG.trackingOptions,
      custom_map: GA_CONFIG.customDimensions
    });

    // Configurar consentimento (GDPR compliance)
    window.gtag('consent', 'default', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'functionality_storage': 'denied',
      'personalization_storage': 'denied',
      'security_storage': 'granted',
      'wait_for_update': 500
    });

    console.log('✅ Google Analytics 4 inicializado');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar GA4:', error);
    return false;
  }
};

/**
 * Atualiza consentimento do usuário
 */
export const updateConsent = (consentSettings) => {
  if (typeof gtag !== 'undefined') {
    window.gtag('consent', 'update', {
      'analytics_storage': consentSettings.analytics ? 'granted' : 'denied',
      'ad_storage': consentSettings.marketing ? 'granted' : 'denied',
      'functionality_storage': consentSettings.functional ? 'granted' : 'denied',
      'personalization_storage': consentSettings.personalization ? 'granted' : 'denied'
    });

    console.log('🔒 Consentimento atualizado:', consentSettings);
  }
};

/**
 * Rastreia visualização de página
 */
export const trackPageView = (path, title, additionalParams = {}) => {
  if (typeof gtag !== 'undefined') {
    window.gtag('config', GA_CONFIG.measurementId, {
      page_path: path,
      page_title: title,
      ...additionalParams
    });

    console.log('📄 Página rastreada:', { path, title });
  }
};

/**
 * Rastreia evento personalizado
 */
export const trackEvent = (eventName, parameters = {}) => {
  if (typeof gtag !== 'undefined') {
    const eventParams = {
      event_category: parameters.category || 'engagement',
      event_label: parameters.label,
      value: parameters.value,
      custom_parameter_1: parameters.userType,
      custom_parameter_2: parameters.serviceInterest,
      custom_parameter_3: parameters.formSource,
      ...parameters
    };

    window.gtag('event', eventName, eventParams);

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Evento rastreado:', { eventName, eventParams });
    }
  }
};

/**
 * Eventos específicos do Brimu
 */
export const BrimuEvents = {
  // Solicitação de orçamento
  quoteRequest: (serviceType, contactMethod = 'form') => {
    trackEvent('generate_lead', {
      category: 'lead_generation',
      label: `quote_request_${serviceType}`,
      value: 1,
      service_type: serviceType,
      contact_method: contactMethod,
      currency: 'BRL'
    });
  },

  // Visualização de serviços
  serviceView: (serviceName) => {
    trackEvent('view_item', {
      category: 'services',
      label: `service_${serviceName.toLowerCase().replace(/\s+/g, '_')}`,
      item_category: 'service',
      item_name: serviceName
    });
  },

  // Clique em contato (telefone/WhatsApp)
  contactClick: (contactType, section = 'unknown') => {
    trackEvent('contact_click', {
      category: 'contact',
      label: `${contactType}_click_${section}`,
      contact_type: contactType,
      section: section
    });
  },

  // Envio de formulário
  formSubmit: (formType, formData = {}) => {
    trackEvent('form_submit', {
      category: 'form_interaction',
      label: `${formType}_submit`,
      form_type: formType,
      form_location: formData.location,
      fields_completed: formData.fieldsCompleted || 0
    });
  },

  // Scroll na página
  scrollDepth: (percentage, page) => {
    if ([25, 50, 75, 90].includes(percentage)) {
      trackEvent('scroll', {
        category: 'engagement',
        label: `scroll_${percentage}_percent`,
        value: percentage,
        page: page,
        non_interaction: true
      });
    }
  },

  // Tempo na página (para páginas importantes)
  timeOnPage: (seconds, page) => {
    if (seconds >= 30 && seconds % 30 === 0) {
      trackEvent('timing_complete', {
        category: 'engagement',
        label: `time_on_page_${page}`,
        value: seconds,
        name: 'page_engagement',
        non_interaction: true
      });
    }
  },

  // Clique em link externo
  externalLinkClick: (url, linkText) => {
    trackEvent('click', {
      category: 'outbound',
      label: url,
      link_url: url,
      link_text: linkText
    });
  },

  // Download de arquivo (se aplicável)
  fileDownload: (fileName, fileType) => {
    trackEvent('file_download', {
      category: 'engagement',
      label: fileName,
      file_name: fileName,
      file_extension: fileType
    });
  },

  // Erro 404 ou outros erros
  errorOccurred: (errorType, errorMessage, page) => {
    trackEvent('exception', {
      category: 'error',
      label: `${errorType}_${page}`,
      description: errorMessage,
      fatal: false,
      page: page
    });
  },

  // Busca no site (se implementada)
  siteSearch: (searchTerm, resultsCount = 0) => {
    trackEvent('search', {
      category: 'site_search',
      label: searchTerm,
      search_term: searchTerm,
      results_count: resultsCount
    });
  },

  // PWA Install
  pwaInstall: (method = 'prompt') => {
    trackEvent('app_install', {
      category: 'pwa',
      label: `pwa_install_${method}`,
      method: method
    });
  },

  // Conversão (quando implementar sistema de pedidos)
  conversion: (serviceType, value, currency = 'BRL') => {
    trackEvent('purchase', {
      category: 'conversion',
      transaction_id: `brimu_${Date.now()}`,
      value: value,
      currency: currency,
      items: [{
        item_id: serviceType,
        item_name: serviceType,
        category: 'service',
        quantity: 1,
        price: value
      }]
    });
  }
};

/**
 * Rastreamento automático de performance (Web Vitals)
 */
export const setupPerformanceTracking = () => {
  // Este será integrado com o sistema de Web Vitals já implementado
  if (typeof gtag !== 'undefined') {
    console.log('⚡ Performance tracking configurado para GA4');
  }
};

/**
 * Configurar Enhanced Ecommerce (para futuras implementações)
 */
export const setupEcommerce = () => {
  if (typeof gtag !== 'undefined') {
    window.gtag('config', GA_CONFIG.measurementId, {
      custom_map: {
        'custom_parameter_service_value': 'service_revenue'
      }
    });
  }
};

/**
 * Debug mode para desenvolvimento
 */
export const enableDebugMode = () => {
  if (typeof gtag !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.gtag('config', GA_CONFIG.measurementId, {
      debug_mode: true
    });
    console.log('🐛 GA4 Debug mode habilitado');
  }
};

/**
 * Utilitários de tracking
 */
export const GAUtils = {
  // Obter Client ID
  getClientId: () => {
    return new Promise((resolve) => {
      if (typeof gtag !== 'undefined') {
        window.gtag('get', GA_CONFIG.measurementId, 'client_id', (clientId) => {
          resolve(clientId);
        });
      } else {
        resolve(null);
      }
    });
  },

  // Verificar se GA está carregado
  isLoaded: () => {
    return typeof window.gtag !== 'undefined' && typeof window.dataLayer !== 'undefined';
  },

  // Pausar tracking
  pauseTracking: () => {
    if (typeof gtag !== 'undefined') {
      window[`ga-disable-${GA_CONFIG.measurementId}`] = true;
      console.log('⏸️ GA4 tracking pausado');
    }
  },

  // Retomar tracking
  resumeTracking: () => {
    if (typeof gtag !== 'undefined') {
      window[`ga-disable-${GA_CONFIG.measurementId}`] = false;
      console.log('▶️ GA4 tracking retomado');
    }
  }
};

export default {
  initGA,
  updateConsent,
  trackPageView,
  trackEvent,
  BrimuEvents,
  setupPerformanceTracking,
  setupEcommerce,
  enableDebugMode,
  GAUtils
};