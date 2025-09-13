/**
 * WCAG Helpers - Funções utilitárias para conformidade WCAG 2.1
 */

/**
 * Debounce function para otimizar performance
 * @param {Function} func - Função para executar
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} Função debounced
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
 * Throttle function para controlar frequência de execução
 * @param {Function} func - Função para executar
 * @param {number} limit - Limite em ms
 * @returns {Function} Função throttled
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
 * Verifica se usuário prefere movimento reduzido
 * @returns {boolean} True se prefere movimento reduzido
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Verifica se usuário prefere contraste alto
 * @returns {boolean} True se prefere contraste alto
 */
export const prefersHighContrast = () => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * Obtém informações de acessibilidade do sistema
 * @returns {Object} Configurações de acessibilidade
 */
export const getAccessibilityPreferences = () => {
  return {
    reducedMotion: prefersReducedMotion(),
    highContrast: prefersHighContrast(),
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    forcedColors: window.matchMedia('(forced-colors: active)').matches
  };
};

/**
 * Cria observer para mudanças de DOM otimizado
 * @param {Function} callback - Callback para executar
 * @param {Object} options - Opções do observer
 * @returns {MutationObserver} Observer configurado
 */
export const createOptimizedObserver = (callback, options = {}) => {
  const defaultOptions = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style'],
    ...options
  };

  const debouncedCallback = debounce(callback, 250);
  
  const observer = new MutationObserver((mutations) => {
    const hasRelevantChanges = mutations.some(mutation => {
      return (
        mutation.type === 'childList' && mutation.addedNodes.length > 0
      ) || (
        mutation.type === 'attributes' && 
        ['class', 'style'].includes(mutation.attributeName)
      );
    });

    if (hasRelevantChanges) {
      debouncedCallback(mutations);
    }
  });

  observer.observe(document.body, defaultOptions);
  return observer;
};

/**
 * Aplica skip links para navegação por teclado
 */
export const createSkipLinks = () => {
  const existingSkipLinks = document.querySelector('.skip-links');
  if (existingSkipLinks) return;

  const skipLinks = document.createElement('nav');
  skipLinks.className = 'skip-links';
  skipLinks.setAttribute('aria-label', 'Links de navegação rápida');
  
  skipLinks.innerHTML = `
    <a href="#main-content" class="skip-link">Pular para conteúdo principal</a>
    <a href="#services" class="skip-link">Pular para serviços</a>
    <a href="#contact" class="skip-link">Pular para contato</a>
  `;

  document.body.insertBefore(skipLinks, document.body.firstChild);
};

/**
 * Força foco visível em elementos interativos
 */
export const enhanceFocusVisibility = () => {
  const style = document.createElement('style');
  style.textContent = `
    .focus-visible-enhanced:focus-visible {
      outline: 2px solid #22C55E !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2) !important;
    }

    .focus-visible-enhanced:focus:not(:focus-visible) {
      outline: none !important;
      box-shadow: none !important;
    }
  `;
  
  document.head.appendChild(style);

  // Adiciona classe aos elementos interativos
  const interactiveElements = document.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  
  interactiveElements.forEach(element => {
    element.classList.add('focus-visible-enhanced');
  });
};

/**
 * Valida se elemento atende critérios de acessibilidade
 * @param {Element} element - Elemento para validar
 * @returns {Object} Resultado da validação
 */
export const validateAccessibility = (element) => {
  const issues = [];

  // Verifica alt text em imagens
  if (element.tagName === 'IMG' && !element.alt) {
    issues.push({
      type: 'missing-alt',
      message: 'Imagem sem texto alternativo',
      severity: 'error'
    });
  }

  // Verifica labels em inputs
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)) {
    const hasLabel = element.labels?.length > 0 || 
                    element.getAttribute('aria-label') ||
                    element.getAttribute('aria-labelledby');
    
    if (!hasLabel) {
      issues.push({
        type: 'missing-label',
        message: 'Campo de formulário sem rótulo',
        severity: 'error'
      });
    }
  }

  // Verifica headings hierárquicos
  if (/^H[1-6]$/.test(element.tagName)) {
    const level = parseInt(element.tagName.charAt(1));
    const prevHeading = element.closest('body').querySelector(`h1, h2, h3, h4, h5, h6`);
    
    if (prevHeading && level > parseInt(prevHeading.tagName.charAt(1)) + 1) {
      issues.push({
        type: 'heading-hierarchy',
        message: 'Hierarquia de headings incorreta',
        severity: 'warning'
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
};

/**
 * Gera relatório de acessibilidade da página
 * @returns {Object} Relatório completo
 */
export const generateAccessibilityReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    issues: [],
    summary: {
      total: 0,
      errors: 0,
      warnings: 0,
      passed: 0
    }
  };

  // Analisa todos os elementos
  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    const validation = validateAccessibility(element);
    if (!validation.valid) {
      report.issues.push({
        element: element.tagName.toLowerCase(),
        selector: getElementSelector(element),
        issues: validation.issues
      });
    }
  });

  // Calcula summary
  report.issues.forEach(item => {
    item.issues.forEach(issue => {
      report.summary.total++;
      if (issue.severity === 'error') {
        report.summary.errors++;
      } else {
        report.summary.warnings++;
      }
    });
  });

  report.summary.passed = allElements.length - report.issues.length;

  return report;
};

/**
 * Gera seletor CSS único para elemento
 * @param {Element} element - Elemento DOM
 * @returns {string} Seletor CSS
 */
const getElementSelector = (element) => {
  if (element.id) {
    return `#${element.id}`;
  }
  
  if (element.className) {
    const classes = element.className.split(' ').filter(c => c).slice(0, 2);
    return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
  }
  
  return element.tagName.toLowerCase();
};

export default {
  debounce,
  throttle,
  prefersReducedMotion,
  prefersHighContrast,
  getAccessibilityPreferences,
  createOptimizedObserver,
  createSkipLinks,
  enhanceFocusVisibility,
  validateAccessibility,
  generateAccessibilityReport
};