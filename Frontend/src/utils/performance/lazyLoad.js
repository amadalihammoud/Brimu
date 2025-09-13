/**
 * Lazy Loading Utilities - Otimizações de carregamento para melhor performance
 */

/**
 * Lazy loading para imagens com Intersection Observer
 * @param {string} selector - Seletor CSS para as imagens
 * @param {Object} options - Opções do observer
 */
export const lazyLoadImages = (selector = '[data-lazy]', options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.lazy || img.dataset.src;
          
          if (src) {
            // Preload da imagem
            const imageLoader = new Image();
            imageLoader.onload = () => {
              img.src = src;
              img.classList.add('loaded');
              img.classList.remove('loading');
              img.removeAttribute('data-lazy');
            };
            imageLoader.onerror = () => {
              img.classList.add('error');
              img.classList.remove('loading');
            };
            imageLoader.src = src;
          }
          
          observer.unobserve(img);
        }
      });
    }, defaultOptions);

    document.querySelectorAll(selector).forEach(img => {
      img.classList.add('loading');
      imageObserver.observe(img);
    });
  } else {
    // Fallback para navegadores sem suporte
    document.querySelectorAll(selector).forEach(img => {
      const src = img.dataset.lazy || img.dataset.src;
      if (src) {
        img.src = src;
        img.classList.add('loaded');
        img.removeAttribute('data-lazy');
      }
    });
  }
};

/**
 * Lazy loading para seções do site
 * @param {string} selector - Seletor CSS para as seções
 * @param {Function} callback - Função para executar quando seção entrar na viewport
 */
export const lazyLoadSections = (selector = '[data-lazy-section]', callback = null) => {
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = entry.target;
          section.classList.add('section-loaded');
          
          if (callback) {
            callback(section);
          }
          
          // Trigger animations
          const animatedElements = section.querySelectorAll('[data-animate]');
          animatedElements.forEach((el, index) => {
            setTimeout(() => {
              el.classList.add('animate-in');
            }, index * 100);
          });
          
          sectionObserver.unobserve(section);
        }
      });
    }, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    });

    document.querySelectorAll(selector).forEach(section => {
      sectionObserver.observe(section);
    });
  }
};

/**
 * Preload de recursos críticos
 * @param {Array} resources - Array de recursos para preload
 */
export const preloadCriticalResources = (resources = []) => {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as || 'image';
    
    if (resource.type) {
      link.type = resource.type;
    }
    
    if (resource.crossorigin) {
      link.crossOrigin = resource.crossorigin;
    }
    
    document.head.appendChild(link);
  });
};

/**
 * Otimização de fontes com font-display
 */
export const optimizeFonts = () => {
  const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
  fontLinks.forEach(link => {
    // Adiciona font-display=swap à URL se não estiver presente
    if (!link.href.includes('display=')) {
      const separator = link.href.includes('?') ? '&' : '?';
      link.href += `${separator}display=swap`;
    }
  });
};

/**
 * Lazy loading de componentes React com timeout
 * @param {Function} importFunc - Função de import dinâmico
 * @param {number} delay - Delay em ms para evitar flash
 * @returns {Promise} Promise do componente
 */
export const lazyLoadComponent = (importFunc, delay = 0) => {
  if (delay > 0) {
    return new Promise(resolve => {
      setTimeout(() => {
        importFunc().then(resolve);
      }, delay);
    });
  }
  return importFunc();
};

/**
 * Detecta conexão lenta e ajusta comportamento
 */
export const detectSlowConnection = () => {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    return (
      connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g' ||
      (connection.effectiveType === '3g' && connection.downlink < 1.5)
    );
  }
  return false;
};

/**
 * Resource hints para melhor performance
 * @param {Array} hints - Array de hints {rel, href, as?}
 */
export const addResourceHints = (hints = []) => {
  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    
    if (hint.as) {
      link.as = hint.as;
    }
    
    if (hint.crossorigin) {
      link.crossOrigin = hint.crossorigin;
    }
    
    document.head.appendChild(link);
  });
};

/**
 * Debounce para otimizar eventos de scroll/resize
 * @param {Function} func - Função para debounce
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} Função com debounce aplicado
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle para controlar frequência de execução
 * @param {Function} func - Função para throttle
 * @param {number} limit - Limite em ms
 * @returns {Function} Função com throttle aplicado
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Configuração inicial de performance
 */
export const initPerformanceOptimizations = () => {
  // Lazy load de imagens
  lazyLoadImages();
  
  // Lazy load de seções
  lazyLoadSections();
  
  // Otimização de fontes
  optimizeFonts();
  
  // Resource hints essenciais
  addResourceHints([
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' }
  ]);
  
  // Preload recursos críticos se não estiver em conexão lenta
  if (!detectSlowConnection()) {
    preloadCriticalResources([
      { href: '/images/hero-bg.jpg', as: 'image' },
      { href: '/images/brimu-logo.png', as: 'image' }
    ]);
  }
  
  console.log('🚀 Otimizações de performance inicializadas');
};

export default {
  lazyLoadImages,
  lazyLoadSections,
  preloadCriticalResources,
  optimizeFonts,
  lazyLoadComponent,
  detectSlowConnection,
  addResourceHints,
  debounce,
  throttle,
  initPerformanceOptimizations
};