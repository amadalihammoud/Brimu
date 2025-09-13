import { useState, useEffect, useCallback } from 'react';
import { ContrastDetector } from '../utils/accessibility/ContrastDetector';
import { getAccessibilityPreferences, debounce } from '../utils/accessibility/wcagHelpers';

/**
 * Hook personalizado para gerenciamento de contraste
 * @param {Object} options - Configurações do hook
 * @returns {Object} Estado e métodos de contraste
 */
const useContrast = (options = {}) => {
  const {
    autoFix = true,
    debounceMs = 300,
    onIssuesChange = null
  } = options;

  const [issues, setIssues] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [accessibilityPrefs, setAccessibilityPrefs] = useState(null);

  /**
   * Analisa contraste de um elemento específico
   */
  const analyzeElement = useCallback((element) => {
    if (!element) return null;
    return ContrastDetector.analyzeElement(element);
  }, []);

  /**
   * Analisa toda a página
   */
  const analyzePage = useCallback(
    debounce(async () => {
      setIsAnalyzing(true);
      
      try {
        const pageIssues = ContrastDetector.scanPage();
        
        if (autoFix) {
          pageIssues.forEach(issue => {
            if (!issue.valid) {
              ContrastDetector.applyFix(issue);
            }
          });
        }

        setIssues(pageIssues);
        
        if (onIssuesChange) {
          onIssuesChange(pageIssues);
        }

      } catch (error) {
        console.error('Erro ao analisar contraste:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, debounceMs),
    [autoFix, debounceMs, onIssuesChange]
  );

  /**
   * Remove todas as correções aplicadas
   */
  const removeFixes = useCallback(() => {
    ContrastDetector.removeFixes();
    setIssues([]);
  }, []);

  /**
   * Aplica correção em elemento específico
   */
  const fixElement = useCallback((element) => {
    const analysis = analyzeElement(element);
    if (analysis && !analysis.valid) {
      ContrastDetector.applyFix(analysis);
      return true;
    }
    return false;
  }, [analyzeElement]);

  /**
   * Verifica se cor atende aos critérios de contraste
   */
  const checkColorContrast = useCallback((textColor, backgroundColor, isLarge = false) => {
    const textRGB = ContrastDetector.parseColor(textColor);
    const bgRGB = ContrastDetector.parseColor(backgroundColor);
    
    if (!textRGB || !bgRGB) return null;

    const textLuminance = ContrastDetector.getRelativeLuminance(textRGB.r, textRGB.g, textRGB.b);
    const bgLuminance = ContrastDetector.getRelativeLuminance(bgRGB.r, bgRGB.g, bgRGB.b);
    const ratio = ContrastDetector.getContrastRatio(textLuminance, bgLuminance);
    
    const minRatio = isLarge ? ContrastDetector.WCAG_AA_LARGE : ContrastDetector.WCAG_AA_NORMAL;
    
    return {
      ratio: Math.round(ratio * 100) / 100,
      minRequired: minRatio,
      passes: ratio >= minRatio,
      level: ratio >= (isLarge ? ContrastDetector.WCAG_AAA_LARGE : ContrastDetector.WCAG_AAA_NORMAL) 
        ? 'AAA' 
        : ratio >= minRatio 
          ? 'AA' 
          : 'FAIL'
    };
  }, []);

  /**
   * Sugere cor adequada para contraste
   */
  const suggestColor = useCallback((backgroundColor, isLarge = false) => {
    const bgRGB = ContrastDetector.parseColor(backgroundColor);
    if (!bgRGB) return null;

    return ContrastDetector.suggestTextColor(bgRGB, isLarge);
  }, []);

  /**
   * Atualiza preferências de acessibilidade
   */
  const updatePreferences = useCallback(() => {
    const prefs = getAccessibilityPreferences();
    setAccessibilityPrefs(prefs);
  }, []);

  // Efeito para monitorar mudanças nas preferências do sistema
  useEffect(() => {
    updatePreferences();

    const mediaQueries = [
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
      window.matchMedia('(forced-colors: active)')
    ];

    const handleChange = () => {
      updatePreferences();
      analyzePage();
    };

    mediaQueries.forEach(mq => {
      if (mq.addListener) {
        mq.addListener(handleChange);
      } else {
        mq.addEventListener('change', handleChange);
      }
    });

    return () => {
      mediaQueries.forEach(mq => {
        if (mq.removeListener) {
          mq.removeListener(handleChange);
        } else {
          mq.removeEventListener('change', handleChange);
        }
      });
    };
  }, [updatePreferences, analyzePage]);

  // Análise inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      analyzePage();
    }, 100);

    return () => clearTimeout(timer);
  }, [analyzePage]);

  return {
    // Estado
    issues,
    isAnalyzing,
    accessibilityPrefs,
    
    // Métodos de análise
    analyzeElement,
    analyzePage,
    checkColorContrast,
    
    // Métodos de correção
    fixElement,
    removeFixes,
    suggestColor,
    
    // Utilitários
    updatePreferences,
    
    // Estatísticas
    stats: {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.contrastRatio < 3).length,
      fixableIssues: issues.filter(i => !i.valid).length
    }
  };
};

export default useContrast;