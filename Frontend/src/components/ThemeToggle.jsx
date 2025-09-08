import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = ({ className = '', size = 'md' }) => {
  const { theme, setTheme, effectiveTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-12 h-12';
      default:
        return 'w-10 h-10';
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`${className} ${getSizeClasses()} bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse`} />
    );
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const themes = [
    {
      id: 'light',
      name: 'Claro',
      icon: FiSun,
      description: 'Tema claro'
    },
    {
      id: 'dark',
      name: 'Escuro',
      icon: FiMoon,
      description: 'Tema escuro'
    },
    {
      id: 'system',
      name: 'Sistema',
      icon: FiMonitor,
      description: 'Segue preferência do sistema'
    }
  ];

  const currentTheme = themes.find(t => t.id === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Botão principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${getSizeClasses()}
          bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700
          rounded-lg shadow-sm hover:shadow-md
          flex items-center justify-center
          transition-all duration-200 ease-in-out
          hover:scale-105 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          group
        `}
        title={`Tema atual: ${currentTheme.name}`}
      >
        <CurrentIcon 
          className={`${getIconSize()} text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200`} 
        />
      </button>

      {/* Dropdown de temas */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden">
            <div className="py-1">
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                const isActive = theme === themeOption.id;
                
                return (
                  <button
                    key={themeOption.id}
                    onClick={() => handleThemeChange(themeOption.id)}
                    className={`
                      w-full px-4 py-3 text-left flex items-center space-x-3
                      transition-colors duration-200
                      ${isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <Icon className={`${getIconSize()} ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{themeOption.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{themeOption.description}</div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeToggle;
