import { useState, useEffect, useCallback } from 'react';
import config from '../config';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    // Verificar localStorage primeiro
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }

    // Verificar preferência do sistema
    if (config.theme?.enableSystemTheme && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }

    // Usar tema padrão
    return config.theme?.defaultTheme || 'light';
  });

  const [systemTheme, setSystemTheme] = useState(() => {
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Aplicar tema ao documento
  const applyTheme = useCallback((newTheme) => {
    const root = document.documentElement;
    
    // Remover classes de tema anteriores
    root.classList.remove('light', 'dark');
    
    // Adicionar nova classe de tema
    root.classList.add(newTheme);
    
    // Definir atributo data-theme
    root.setAttribute('data-theme', newTheme);
    
    // Aplicar variáveis CSS customizadas
    const themeColors = getThemeColors(newTheme);
    Object.entries(themeColors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, []);

  // Obter cores do tema
  const getThemeColors = useCallback((themeName) => {
    const themes = {
      light: {
        '--color-primary': '#059669',
        '--color-primary-dark': '#047857',
        '--color-primary-light': '#10b981',
        '--color-secondary': '#6b7280',
        '--color-accent': '#3b82f6',
        '--color-background': '#ffffff',
        '--color-surface': '#f9fafb',
        '--color-surface-elevated': '#ffffff',
        '--color-text': '#111827',
        '--color-text-secondary': '#6b7280',
        '--color-text-muted': '#9ca3af',
        '--color-border': '#e5e7eb',
        '--color-border-light': '#f3f4f6',
        '--color-success': '#10b981',
        '--color-warning': '#f59e0b',
        '--color-error': '#ef4444',
        '--color-info': '#3b82f6',
        '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        '--shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
      },
      dark: {
        '--color-primary': '#10b981',
        '--color-primary-dark': '#059669',
        '--color-primary-light': '#34d399',
        '--color-secondary': '#9ca3af',
        '--color-accent': '#60a5fa',
        '--color-background': '#111827',
        '--color-surface': '#1f2937',
        '--color-surface-elevated': '#374151',
        '--color-text': '#f9fafb',
        '--color-text-secondary': '#d1d5db',
        '--color-text-muted': '#9ca3af',
        '--color-border': '#374151',
        '--color-border-light': '#4b5563',
        '--color-success': '#34d399',
        '--color-warning': '#fbbf24',
        '--color-error': '#f87171',
        '--color-info': '#60a5fa',
        '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.3)',
        '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
        '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
        '--shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)'
      }
    };

    return themes[themeName] || themes.light;
  }, []);

  // Alternar tema
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, [theme]);

  // Definir tema específico
  const setThemeMode = useCallback((newTheme) => {
    if (['light', 'dark', 'system'].includes(newTheme)) {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  }, []);

  // Obter tema efetivo (considerando system)
  const getEffectiveTheme = useCallback(() => {
    if (theme === 'system') {
      return systemTheme;
    }
    return theme;
  }, [theme, systemTheme]);

  // Verificar se é tema escuro
  const isDark = useCallback(() => {
    return getEffectiveTheme() === 'dark';
  }, [getEffectiveTheme]);

  // Verificar se é tema claro
  const isLight = useCallback(() => {
    return getEffectiveTheme() === 'light';
  }, [getEffectiveTheme]);

  // Obter classe CSS do tema
  const getThemeClass = useCallback(() => {
    return getEffectiveTheme();
  }, [getEffectiveTheme]);

  // Obter cores do tema atual
  const getCurrentThemeColors = useCallback(() => {
    return getThemeColors(getEffectiveTheme());
  }, [getThemeColors, getEffectiveTheme]);

  // Aplicar tema quando mudar
  useEffect(() => {
    applyTheme(getEffectiveTheme());
  }, [applyTheme, getEffectiveTheme]);

  // Escutar mudanças na preferência do sistema
  useEffect(() => {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Salvar tema no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Aplicar tema inicial
  useEffect(() => {
    applyTheme(getEffectiveTheme());
  }, []);

  return {
    theme,
    systemTheme,
    effectiveTheme: getEffectiveTheme(),
    isDark: isDark(),
    isLight: isLight(),
    themeClass: getThemeClass(),
    themeColors: getCurrentThemeColors(),
    toggleTheme,
    setTheme: setThemeMode,
    getThemeColors,
    applyTheme
  };
};

// Hook para componentes que precisam reagir ao tema
export const useThemeAware = () => {
  const { effectiveTheme, isDark, isLight, themeColors } = useTheme();

  return {
    theme: effectiveTheme,
    isDark,
    isLight,
    colors: themeColors,
    // Classes CSS úteis
    classes: {
      background: isDark ? 'bg-gray-900' : 'bg-white',
      surface: isDark ? 'bg-gray-800' : 'bg-gray-50',
      text: isDark ? 'text-gray-100' : 'text-gray-900',
      textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
      border: isDark ? 'border-gray-700' : 'border-gray-200',
      shadow: isDark ? 'shadow-gray-900/50' : 'shadow-gray-900/10'
    }
  };
};

// Hook para animações baseadas no tema
export const useThemeAnimations = () => {
  const { isDark } = useTheme();

  const getAnimationClasses = useCallback((baseClasses = '') => {
    const themeClasses = isDark ? 'dark-theme' : 'light-theme';
    return `${baseClasses} ${themeClasses}`;
  }, [isDark]);

  const getTransitionClasses = useCallback(() => {
    return 'transition-colors duration-300 ease-in-out';
  }, []);

  return {
    getAnimationClasses,
    getTransitionClasses,
    isDark
  };
};

export default useTheme;
