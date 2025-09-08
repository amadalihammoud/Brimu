import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Action types
const APP_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_NOTIFICATION: 'SET_NOTIFICATION',
  CLEAR_NOTIFICATION: 'CLEAR_NOTIFICATION',
  SET_THEME: 'SET_THEME',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SIDEBAR: 'SET_SIDEBAR',
  SET_PAGE_TITLE: 'SET_PAGE_TITLE',
  SET_BREADCRUMBS: 'SET_BREADCRUMBS'
};

// Initial state
const initialState = {
  isLoading: false,
  error: null,
  notification: null,
  theme: localStorage.getItem('theme') || 'light',
  sidebarOpen: localStorage.getItem('sidebarOpen') !== 'false',
  pageTitle: 'Brimu',
  breadcrumbs: []
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case APP_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    case APP_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case APP_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case APP_ACTIONS.SET_NOTIFICATION:
      return {
        ...state,
        notification: action.payload
      };
    
    case APP_ACTIONS.CLEAR_NOTIFICATION:
      return {
        ...state,
        notification: null
      };
    
    case APP_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload
      };
    
    case APP_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };
    
    case APP_ACTIONS.SET_SIDEBAR:
      return {
        ...state,
        sidebarOpen: action.payload
      };
    
    case APP_ACTIONS.SET_PAGE_TITLE:
      return {
        ...state,
        pageTitle: action.payload
      };
    
    case APP_ACTIONS.SET_BREADCRUMBS:
      return {
        ...state,
        breadcrumbs: action.payload
      };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Custom hook to use app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// App Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Set loading state
  const setLoading = (loading) => {
    dispatch({ type: APP_ACTIONS.SET_LOADING, payload: loading });
  };

  // Set error
  const setError = (error) => {
    dispatch({ type: APP_ACTIONS.SET_ERROR, payload: error });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: APP_ACTIONS.CLEAR_ERROR });
  };

  // Show notification
  const showNotification = (message, type = 'info', duration = 5000) => {
    const notification = {
      id: Date.now(),
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration
    };
    
    dispatch({ type: APP_ACTIONS.SET_NOTIFICATION, payload: notification });

    // Auto clear notification
    if (duration > 0) {
      setTimeout(() => {
        clearNotification();
      }, duration);
    }
  };

  // Clear notification
  const clearNotification = () => {
    dispatch({ type: APP_ACTIONS.CLEAR_NOTIFICATION });
  };

  // Set theme
  const setTheme = (theme) => {
    localStorage.setItem('theme', theme);
    dispatch({ type: APP_ACTIONS.SET_THEME, payload: theme });
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    dispatch({ type: APP_ACTIONS.TOGGLE_SIDEBAR });
  };

  // Set sidebar
  const setSidebar = (open) => {
    localStorage.setItem('sidebarOpen', open.toString());
    dispatch({ type: APP_ACTIONS.SET_SIDEBAR, payload: open });
  };

  // Set page title
  const setPageTitle = (title) => {
    document.title = `${title} - Brimu`;
    dispatch({ type: APP_ACTIONS.SET_PAGE_TITLE, payload: title });
  };

  // Set breadcrumbs
  const setBreadcrumbs = (breadcrumbs) => {
    dispatch({ type: APP_ACTIONS.SET_BREADCRUMBS, payload: breadcrumbs });
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpen', state.sidebarOpen.toString());
  }, [state.sidebarOpen]);

  // Utility functions
  const handleApiError = (error, defaultMessage = 'Ocorreu um erro') => {
    console.error('API Error:', error);
    const message = error?.response?.data?.error || error?.message || defaultMessage;
    setError(message);
    showNotification(message, 'error');
  };

  const handleApiSuccess = (message, data = null) => {
    showNotification(message, 'success');
    clearError();
    return data;
  };

  // Context value
  const value = {
    ...state,
    setLoading,
    setError,
    clearError,
    showNotification,
    clearNotification,
    setTheme,
    toggleTheme,
    toggleSidebar,
    setSidebar,
    setPageTitle,
    setBreadcrumbs,
    handleApiError,
    handleApiSuccess
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};