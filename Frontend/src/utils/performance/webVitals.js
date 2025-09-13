/**
 * Web Vitals Monitoring - Monitoramento de Core Web Vitals em produção
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

/**
 * Configuração dos thresholds Web Vitals
 */
const VITALS_THRESHOLDS = {
  CLS: { good: 0.1, needs: 0.25 },
  FCP: { good: 1800, needs: 3000 },
  LCP: { good: 2500, needs: 4000 },
  TTFB: { good: 800, needs: 1800 },
  INP: { good: 200, needs: 500 }
};

/**
 * Determina rating baseado nos thresholds
 * @param {string} name - Nome da métrica
 * @param {number} value - Valor da métrica
 * @returns {string} Rating: 'good', 'needs-improvement', 'poor'
 */
const getRating = (name, value) => {
  const threshold = VITALS_THRESHOLDS[name];
  if (!threshold) return 'unknown';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needs) return 'needs-improvement';
  return 'poor';
};

/**
 * Envia métrica para analytics/monitoramento
 * @param {Object} metric - Objeto da métrica Web Vitals
 */
const sendToAnalytics = (metric) => {
  const { name, delta, value, rating, id } = metric;
  
  // Console logging em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.group(`📊 Web Vital: ${name}`);
    console.log(`Valor: ${Math.round(value)}ms (${rating})`);
    console.log(`Delta: ${Math.round(delta)}ms`);
    console.log(`ID: ${id}`);
    console.groupEnd();
  }

  // Enviar para Google Analytics 4 (se disponível)
  if (typeof gtag !== 'undefined') {
    gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(value),
      custom_parameter_rating: rating,
      non_interaction: true
    });
  }

  // Enviar para Google Tag Manager (se disponível)
  if (typeof dataLayer !== 'undefined') {
    dataLayer.push({
      event: 'web_vital',
      web_vital_name: name,
      web_vital_value: Math.round(value),
      web_vital_rating: rating,
      web_vital_id: id
    });
  }

  // Enviar para endpoint customizado (se em produção)
  if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_ANALYTICS_ENDPOINT) {
    fetch(process.env.REACT_APP_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric: name,
        value: Math.round(value),
        rating,
        id,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink
        } : null
      })
    }).catch(console.error);
  }
};

/**
 * Configuração customizada para cada métrica
 */
const setupWebVitalsMonitoring = () => {
  // Largest Contentful Paint (LCP)
  onLCP((metric) => {
    metric.rating = getRating('LCP', metric.value);
    sendToAnalytics(metric);
  });

  // INP substituiu FID nas métricas mais recentes

  // Cumulative Layout Shift (CLS)
  onCLS((metric) => {
    metric.rating = getRating('CLS', metric.value);
    sendToAnalytics(metric);
  });

  // First Contentful Paint (FCP)
  onFCP((metric) => {
    metric.rating = getRating('FCP', metric.value);
    sendToAnalytics(metric);
  });

  // Time to First Byte (TTFB)
  onTTFB((metric) => {
    metric.rating = getRating('TTFB', metric.value);
    sendToAnalytics(metric);
  });

  // Interaction to Next Paint (INP) - Nova métrica
  onINP((metric) => {
    metric.rating = getRating('INP', metric.value);
    sendToAnalytics(metric);
  });
};

/**
 * Monitor de performance customizado
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
    this.startTime = performance.now();
  }

  /**
   * Marca inicio de uma operação
   * @param {string} name - Nome da operação
   */
  mark(name) {
    performance.mark(`${name}-start`);
  }

  /**
   * Marca fim de uma operação e calcula duração
   * @param {string} name - Nome da operação
   * @returns {number} Duração em ms
   */
  measure(name) {
    const endMark = `${name}-end`;
    performance.mark(endMark);
    
    const measureName = `${name}-duration`;
    performance.measure(measureName, `${name}-start`, endMark);
    
    const measure = performance.getEntriesByName(measureName)[0];
    const duration = measure ? measure.duration : 0;
    
    this.metrics.set(name, duration);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${Math.round(duration)}ms`);
    }
    
    return duration;
  }

  /**
   * Observa Long Tasks (tarefas > 50ms)
   */
  observeLongTasks() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              console.warn(`⚠️ Long Task detectada: ${Math.round(entry.duration)}ms`);
              
              if (typeof gtag !== 'undefined') {
                gtag('event', 'long_task', {
                  event_category: 'Performance',
                  value: Math.round(entry.duration),
                  non_interaction: true
                });
              }
            }
          });
        });
        
        observer.observe({ entryTypes: ['longtask'] });
        this.observers.push(observer);
      } catch (e) {
        console.warn('Long Tasks não suportadas:', e);
      }
    }
  }

  /**
   * Observa mudanças de layout (Layout Shifts)
   */
  observeLayoutShifts() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          let clsValue = 0;
          list.getEntries().forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          
          if (clsValue > 0.1 && process.env.NODE_ENV === 'development') {
            console.warn(`⚠️ Layout Shift detectado: ${clsValue.toFixed(4)}`);
          }
        });
        
        observer.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(observer);
      } catch (e) {
        console.warn('Layout Shifts não suportadas:', e);
      }
    }
  }

  /**
   * Gera relatório de performance
   * @returns {Object} Relatório de métricas
   */
  generateReport() {
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    
    return {
      timestamp: Date.now(),
      url: window.location.href,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null,
      navigation: navigationEntry ? {
        domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart,
        loadComplete: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint()
      } : null,
      customMetrics: Object.fromEntries(this.metrics),
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Obtém First Paint
   * @returns {number} Tempo em ms
   */
  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fpEntry = paintEntries.find(entry => entry.name === 'first-paint');
    return fpEntry ? fpEntry.startTime : 0;
  }

  /**
   * Obtém First Contentful Paint
   * @returns {number} Tempo em ms
   */
  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  /**
   * Obtém informações de uso de memória
   * @returns {Object} Dados de memória
   */
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  /**
   * Cleanup dos observers
   */
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Instância global do monitor
export const performanceMonitor = new PerformanceMonitor();

/**
 * Inicialização do monitoramento de Web Vitals
 */
export const initWebVitals = () => {
  // Configurar Web Vitals
  setupWebVitalsMonitoring();
  
  // Configurar observers customizados
  performanceMonitor.observeLongTasks();
  performanceMonitor.observeLayoutShifts();
  
  // Marcar início do app
  performanceMonitor.mark('app-init');
  
  console.log('📊 Web Vitals monitoring iniciado');
};

export default {
  initWebVitals,
  performanceMonitor,
  PerformanceMonitor
};