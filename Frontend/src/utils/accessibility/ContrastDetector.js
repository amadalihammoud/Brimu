/**
 * ContrastDetector - Sistema completo de detecção e cálculo de contraste WCAG
 * Implementa algoritmos WCAG 2.1 para análise de acessibilidade
 */

export class ContrastDetector {
  static WCAG_AA_NORMAL = 4.5;
  static WCAG_AA_LARGE = 3.0;
  static WCAG_AAA_NORMAL = 7.0;
  static WCAG_AAA_LARGE = 4.5;

  /**
   * Converte cor RGB para luminância relativa WCAG
   * @param {number} r - Valor red (0-255)
   * @param {number} g - Valor green (0-255)  
   * @param {number} b - Valor blue (0-255)
   * @returns {number} Luminância relativa (0-1)
   */
  static getRelativeLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      const sRGB = c / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calcula ratio de contraste entre duas cores
   * @param {number} l1 - Luminância da cor mais clara
   * @param {number} l2 - Luminância da cor mais escura
   * @returns {number} Ratio de contraste
   */
  static getContrastRatio(l1, l2) {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Converte string de cor CSS para RGB
   * @param {string} color - Cor em formato CSS
   * @returns {Object|null} {r, g, b} ou null se inválido
   */
  static parseColor(color) {
    if (!color || color === 'transparent') return null;

    // Criar elemento temporário para computar cor
    const div = document.createElement('div');
    div.style.color = color;
    document.body.appendChild(div);
    
    const computedColor = getComputedStyle(div).color;
    document.body.removeChild(div);

    // Parse RGB/RGBA
    const rgbMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1], 10),
        g: parseInt(rgbMatch[2], 10),
        b: parseInt(rgbMatch[3], 10)
      };
    }

    return null;
  }

  /**
   * Obtém cor de fundo efetiva de um elemento, considerando hierarquia
   * @param {Element} element - Elemento DOM
   * @returns {string} Cor de fundo computada
   */
  static getEffectiveBackgroundColor(element) {
    let currentElement = element;
    
    while (currentElement && currentElement !== document.body) {
      const styles = getComputedStyle(currentElement);
      const bgColor = styles.backgroundColor;
      
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        return bgColor;
      }
      
      currentElement = currentElement.parentElement;
    }
    
    return 'rgb(255, 255, 255)'; // Fallback para branco
  }

  /**
   * Verifica se elemento tem texto visível
   * @param {Element} element - Elemento DOM
   * @returns {boolean} True se tem texto visível
   */
  static hasVisibleText(element) {
    const textContent = element.textContent?.trim();
    if (!textContent) return false;

    const styles = getComputedStyle(element);
    return (
      styles.display !== 'none' &&
      styles.visibility !== 'hidden' &&
      styles.opacity !== '0' &&
      parseFloat(styles.fontSize) > 0
    );
  }

  /**
   * Determina se texto é considerado "grande" pelo WCAG
   * @param {Element} element - Elemento DOM
   * @returns {boolean} True se é texto grande
   */
  static isLargeText(element) {
    const styles = getComputedStyle(element);
    const fontSize = parseFloat(styles.fontSize);
    const fontWeight = styles.fontWeight;
    
    // >= 18pt (24px) ou >= 14pt (18.66px) bold
    return fontSize >= 24 || (fontSize >= 18.66 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
  }

  /**
   * Analisa contraste de um elemento específico
   * @param {Element} element - Elemento para analisar
   * @returns {Object} Resultado da análise
   */
  static analyzeElement(element) {
    if (!this.hasVisibleText(element)) {
      return { valid: true, reason: 'no-text' };
    }

    const styles = getComputedStyle(element);
    const textColor = this.parseColor(styles.color);
    const backgroundColor = this.parseColor(this.getEffectiveBackgroundColor(element));

    if (!textColor || !backgroundColor) {
      return { valid: false, reason: 'color-parse-failed' };
    }

    const textLuminance = this.getRelativeLuminance(textColor.r, textColor.g, textColor.b);
    const bgLuminance = this.getRelativeLuminance(backgroundColor.r, backgroundColor.g, backgroundColor.b);
    const contrastRatio = this.getContrastRatio(textLuminance, bgLuminance);

    const isLarge = this.isLargeText(element);
    const minRatio = isLarge ? this.WCAG_AA_LARGE : this.WCAG_AA_NORMAL;
    const aaaPassed = contrastRatio >= (isLarge ? this.WCAG_AAA_LARGE : this.WCAG_AAA_NORMAL);

    return {
      valid: contrastRatio >= minRatio,
      contrastRatio: Math.round(contrastRatio * 100) / 100,
      minRequired: minRatio,
      textColor: `rgb(${textColor.r}, ${textColor.g}, ${textColor.b})`,
      backgroundColor: `rgb(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b})`,
      isLargeText: isLarge,
      level: aaaPassed ? 'AAA' : (contrastRatio >= minRatio ? 'AA' : 'FAIL'),
      element: element,
      textContent: element.textContent?.trim().substring(0, 50)
    };
  }

  /**
   * Sugere cor de texto com contraste adequado
   * @param {Object} bgColor - {r, g, b} da cor de fundo
   * @param {boolean} isLarge - Se é texto grande
   * @returns {string} Cor sugerida em RGB
   */
  static suggestTextColor(bgColor, isLarge = false) {
    const bgLuminance = this.getRelativeLuminance(bgColor.r, bgColor.g, bgColor.b);
    const minRatio = isLarge ? this.WCAG_AA_LARGE : this.WCAG_AA_NORMAL;

    // Tentar preto primeiro
    const blackLuminance = 0;
    const blackRatio = this.getContrastRatio(bgLuminance, blackLuminance);

    if (blackRatio >= minRatio) {
      return 'rgb(0, 0, 0)';
    }

    // Usar branco se preto não funcionar
    const whiteLuminance = 1;
    const whiteRatio = this.getContrastRatio(whiteLuminance, bgLuminance);

    if (whiteRatio >= minRatio) {
      return 'rgb(255, 255, 255)';
    }

    // Se nem preto nem branco funcionam, usar o que tem melhor ratio
    return blackRatio > whiteRatio ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
  }

  /**
   * Escaneia toda a página em busca de problemas de contraste
   * @param {Element} root - Elemento raiz para escaneamento
   * @returns {Array} Array de elementos com problemas
   */
  static scanPage(root = document.body) {
    const issues = [];
    const textElements = root.querySelectorAll('*');

    textElements.forEach(element => {
      const analysis = this.analyzeElement(element);
      if (!analysis.valid && analysis.reason !== 'no-text') {
        issues.push(analysis);
      }
    });

    return issues;
  }

  /**
   * Aplica correção automática de contraste em elemento
   * @param {Object} analysis - Resultado da análise do elemento
   */
  static applyFix(analysis) {
    if (!analysis.element || analysis.valid) return;

    const bgColor = this.parseColor(analysis.backgroundColor);
    if (!bgColor) return;

    const suggestedColor = this.suggestTextColor(bgColor, analysis.isLargeText);
    analysis.element.style.color = suggestedColor;
    analysis.element.setAttribute('data-contrast-fixed', 'true');
  }

  /**
   * Remove todas as correções aplicadas
   * @param {Element} root - Elemento raiz
   */
  static removeFixes(root = document.body) {
    const fixedElements = root.querySelectorAll('[data-contrast-fixed="true"]');
    fixedElements.forEach(element => {
      element.style.color = '';
      element.removeAttribute('data-contrast-fixed');
    });
  }
}

export default ContrastDetector;