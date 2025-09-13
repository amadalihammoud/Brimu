import { useEffect, useRef, useState, useCallback } from 'react';
import { performanceMonitor } from '../utils/performance/webVitals';
import { debounce, throttle } from '../utils/performance/lazyLoad';

/**
 * Hook personalizado para monitoramento e otimização de performance
 * @param {Object} options - Configurações do hook
 * @returns {Object} Estado e métodos de performance
 */
const usePerformance = (options = {}) => {
  const {
    trackComponent = false,
    componentName = 'UnknownComponent',
    enableMemoryTracking = false,
    enableRenderTracking = false
  } = options;

  const [performanceData, setPerformanceData] = useState({
    renderCount: 0,
    avgRenderTime: 0,
    memoryUsage: null,
    isOptimized: true
  });

  const renderCountRef = useRef(0);
  const renderTimesRef = useRef([]);
  const mountTimeRef = useRef(null);
  const lastRenderRef = useRef(null);

  /**
   * Marca início de operação de performance
   */
  const markStart = useCallback((operation) => {
    performanceMonitor.mark(`${componentName}-${operation}`);
  }, [componentName]);

  /**
   * Marca fim de operação e calcula duração
   */
  const markEnd = useCallback((operation) => {
    return performanceMonitor.measure(`${componentName}-${operation}`);
  }, [componentName]);

  /**
   * Tracking de renders do componente
   */
  const trackRender = useCallback(() => {
    if (!enableRenderTracking) return;

    const renderStart = performance.now();
    
    // Usar requestAnimationFrame para medir após o render
    requestAnimationFrame(() => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      
      renderCountRef.current += 1;
      renderTimesRef.current.push(renderTime);
      
      // Manter apenas os últimos 10 renders
      if (renderTimesRef.current.length > 10) {
        renderTimesRef.current.shift();
      }
      
      const avgTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length;
      
      setPerformanceData(prev => ({
        ...prev,
        renderCount: renderCountRef.current,
        avgRenderTime: Math.round(avgTime * 100) / 100,
        isOptimized: avgTime < 16.67 // 60fps threshold
      }));

      // Log renders demorados em desenvolvimento
      if (process.env.NODE_ENV === 'development' && renderTime > 16.67) {
        console.warn(`🐌 Render lento em ${componentName}: ${Math.round(renderTime)}ms`);
      }
    });
  }, [componentName, enableRenderTracking]);

  /**
   * Tracking de uso de memória
   */
  const trackMemory = useCallback(() => {
    if (!enableMemoryTracking || !performance.memory) return;

    const memoryInfo = {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
    };

    setPerformanceData(prev => ({
      ...prev,
      memoryUsage: memoryInfo
    }));
  }, [enableMemoryTracking]);

  /**
   * Debounced memory tracking para evitar overhead
   */
  const debouncedMemoryTracking = useCallback(
    debounce(trackMemory, 1000),
    [trackMemory]
  );

  /**
   * Mede tempo de mount do componente
   */
  const measureMountTime = useCallback(() => {
    if (trackComponent) {
      mountTimeRef.current = performance.now();
      markStart('mount');
    }
  }, [trackComponent, markStart]);

  /**
   * Mede tempo total até componente estar pronto
   */
  const measureReadyTime = useCallback(() => {
    if (trackComponent && mountTimeRef.current) {
      const readyTime = markEnd('mount');
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${componentName} mount time: ${Math.round(readyTime)}ms`);
      }
    }
  }, [trackComponent, componentName, markEnd]);

  /**
   * Observer para mudanças de visibilidade
   */
  const setupVisibilityObserver = useCallback(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Componente não está visível, pausar tracking custoso
        return;
      } else {
        // Componente voltou a ser visível, retomar tracking
        if (enableMemoryTracking) {
          debouncedMemoryTracking();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enableMemoryTracking, debouncedMemoryTracking]);

  /**
   * Otimizações automáticas baseadas em performance
   */
  const autoOptimize = useCallback(() => {
    const { avgRenderTime, renderCount } = performanceData;
    
    // Se renders estão lentos, sugerir otimizações
    if (avgRenderTime > 16.67 && renderCount > 5) {
      if (process.env.NODE_ENV === 'development') {
        console.group(`🔧 Sugestões de otimização para ${componentName}`);
        console.log('• Considere usar React.memo()');
        console.log('• Verifique se existem re-renders desnecessários');
        console.log('• Use useMemo() para cálculos custosos');
        console.log('• Use useCallback() para funções que são dependências');
        console.groupEnd();
      }
    }

    // Monitor de memory leaks
    if (enableMemoryTracking && performanceData.memoryUsage) {
      const { used, limit } = performanceData.memoryUsage;
      const memoryUsagePercent = (used / limit) * 100;
      
      if (memoryUsagePercent > 80) {
        console.warn(`⚠️ Alto uso de memória detectado: ${memoryUsagePercent.toFixed(1)}%`);
      }
    }
  }, [performanceData, componentName, enableMemoryTracking]);

  /**
   * Gera relatório de performance do componente
   */
  const generateReport = useCallback(() => {
    return {
      component: componentName,
      timestamp: Date.now(),
      metrics: performanceData,
      suggestions: performanceData.avgRenderTime > 16.67 ? [
        'Considere usar React.memo()',
        'Verifique re-renders desnecessários',
        'Use useMemo() para cálculos custosos'
      ] : ['Performance otimizada ✅']
    };
  }, [componentName, performanceData]);

  // Effect para tracking de mount
  useEffect(() => {
    measureMountTime();
    
    return () => {
      if (trackComponent) {
        measureReadyTime();
      }
    };
  }, []); // Executar apenas no mount

  // Effect para tracking de renders
  useEffect(() => {
    trackRender();
    lastRenderRef.current = Date.now();
  }); // Executar em todo render

  // Effect para setup de observers
  useEffect(() => {
    const cleanup = setupVisibilityObserver();
    
    // Memory tracking inicial
    if (enableMemoryTracking) {
      debouncedMemoryTracking();
    }
    
    return cleanup;
  }, [setupVisibilityObserver, enableMemoryTracking, debouncedMemoryTracking]);

  // Effect para auto-otimização
  useEffect(() => {
    if (performanceData.renderCount > 0) {
      autoOptimize();
    }
  }, [performanceData.renderCount, autoOptimize]);

  return {
    // Dados de performance
    ...performanceData,
    
    // Métodos de tracking
    markStart,
    markEnd,
    trackRender,
    trackMemory: debouncedMemoryTracking,
    
    // Utilitários
    generateReport,
    
    // Estado
    isTracking: trackComponent,
    lastRender: lastRenderRef.current,
    mountTime: mountTimeRef.current
  };
};

export default usePerformance;