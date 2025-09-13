import React, { useEffect, useCallback, useState } from 'react';
import { ContrastDetector } from '../../utils/accessibility/ContrastDetector';
import { 
  createOptimizedObserver, 
  createSkipLinks, 
  enhanceFocusVisibility,
  getAccessibilityPreferences 
} from '../../utils/accessibility/wcagHelpers';

const ContrastManager = ({ 
  enabled = true, 
  autoFix = true, 
  showIndicators = false,
  onIssuesDetected = null 
}) => {
  const [contrastIssues, setContrastIssues] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [accessibilityPrefs, setAccessibilityPrefs] = useState(null);
  const [observer, setObserver] = useState(null);

  /**
   * Analisa toda a página em busca de problemas de contraste
   */
  const analyzeContrast = useCallback(async () => {
    if (!enabled) return;

    setIsAnalyzing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const issues = ContrastDetector.scanPage();
      
      setContrastIssues(issues);
      
      if (autoFix) {
        issues.forEach(issue => {
          if (!issue.valid) {
            ContrastDetector.applyFix(issue);
          }
        });
      }

      if (onIssuesDetected) {
        onIssuesDetected(issues);
      }

      if (process.env.NODE_ENV === 'development') {
        console.group('🔍 Análise de Contraste Concluída');
        console.log(`📊 Total de elementos analisados: ${document.querySelectorAll('*').length}`);
        console.log(`⚠️  Problemas encontrados: ${issues.length}`);
        if (issues.length > 0) {
          console.table(issues.map(issue => ({
            elemento: issue.element?.tagName,
            contraste: issue.contrastRatio,
            mínimo: issue.minRequired,
            texto: issue.textContent,
            corFundo: issue.backgroundColor,
            corTexto: issue.textColor
          })));
        }
        console.groupEnd();
      }
      
    } catch (error) {
      console.error('Erro ao analisar contraste:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [enabled, autoFix, onIssuesDetected]);

  /**
   * Configura observer para mudanças no DOM
   */
  const setupDOMObserver = useCallback(() => {
    if (!enabled || observer) return;

    const newObserver = createOptimizedObserver(() => {
      analyzeContrast();
    });

    setObserver(newObserver);
  }, [enabled, observer, analyzeContrast]);

  /**
   * Obtém preferências de acessibilidade do sistema
   */
  const updateAccessibilityPreferences = useCallback(() => {
    const prefs = getAccessibilityPreferences();
    setAccessibilityPrefs(prefs);

    if (prefs.highContrast || prefs.forcedColors) {
      document.documentElement.classList.add('high-contrast-mode');
    }

    if (prefs.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    }

    if (prefs.darkMode) {
      document.documentElement.classList.add('auto-contrast-dark');
    }
  }, []);

  /**
   * Remove todas as correções aplicadas
   */
  const removeAllFixes = useCallback(() => {
    ContrastDetector.removeFixes();
    setContrastIssues([]);
  }, []);

  /**
   * Força nova análise completa
   */
  const forceReanalysis = useCallback(() => {
    removeAllFixes();
    setTimeout(() => {
      analyzeContrast();
    }, 100);
  }, [removeAllFixes, analyzeContrast]);

  // Configuração inicial
  useEffect(() => {
    if (!enabled) return;

    // Cria skip links para navegação por teclado
    createSkipLinks();
    
    // Melhora visibilidade do foco
    enhanceFocusVisibility();
    
    // Atualiza preferências do sistema
    updateAccessibilityPreferences();
    
    // Análise inicial com pequeno delay para garantir que DOM esteja pronto
    const initialAnalysis = setTimeout(() => {
      analyzeContrast();
    }, 500);

    return () => clearTimeout(initialAnalysis);
  }, [enabled, analyzeContrast, updateAccessibilityPreferences]);

  // Configura observer de mudanças no DOM
  useEffect(() => {
    if (enabled) {
      setupDOMObserver();
    }

    return () => {
      if (observer) {
        observer.disconnect();
        setObserver(null);
      }
    };
  }, [enabled, setupDOMObserver, observer]);

  // Listeners para mudanças de preferências do sistema
  useEffect(() => {
    const mediaQueries = [
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
      window.matchMedia('(forced-colors: active)')
    ];

    const handleChange = () => {
      updateAccessibilityPreferences();
      setTimeout(() => analyzeContrast(), 100);
    };

    mediaQueries.forEach(mq => mq.addListener(handleChange));

    return () => {
      mediaQueries.forEach(mq => mq.removeListener(handleChange));
    };
  }, [updateAccessibilityPreferences, analyzeContrast]);

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      if (observer) {
        observer.disconnect();
      }
      removeAllFixes();
    };
  }, [observer, removeAllFixes]);

  // Componente de debug (apenas em desenvolvimento)
  const DebugPanel = () => {
    if (process.env.NODE_ENV !== 'development' || !showIndicators) return null;

    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#1a2f22',
        color: '#f0f9f4',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 10000,
        minWidth: '200px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}>
        <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
          🎯 Contraste Manager
        </div>
        <div>Status: {enabled ? '✅ Ativo' : '❌ Inativo'}</div>
        <div>Problemas: {contrastIssues.length}</div>
        <div>Analisando: {isAnalyzing ? '🔄' : '✅'}</div>
        {accessibilityPrefs && (
          <div style={{ marginTop: '8px', fontSize: '10px' }}>
            <div>Alto Contraste: {accessibilityPrefs.highContrast ? '✅' : '❌'}</div>
            <div>Movimento Reduzido: {accessibilityPrefs.reducedMotion ? '✅' : '❌'}</div>
            <div>Modo Escuro: {accessibilityPrefs.darkMode ? '✅' : '❌'}</div>
          </div>
        )}
        <div style={{ marginTop: '8px' }}>
          <button
            onClick={forceReanalysis}
            style={{
              background: '#22c55e',
              color: '#0f1a13',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer'
            }}
          >
            🔄 Reanalizar
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {enabled && <DebugPanel />}
    </>
  );
};

export default ContrastManager;