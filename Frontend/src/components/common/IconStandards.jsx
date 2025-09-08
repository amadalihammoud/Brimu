import React from 'react';
import { 
  User, Users, FileText, Calendar, DollarSign, Package, 
  Settings, Wrench, MapPin, Clock, CheckCircle, AlertTriangle,
  Eye, Edit2, Trash2, Plus, Search, Download, Upload, 
  CreditCard, TrendingUp, Activity, Mail, Phone,
  Briefcase, Home, ShoppingCart, Archive, Tag
} from 'lucide-react';

// Standard icon definitions for consistency across the app
export const STANDARD_ICONS = {
  // Entity icons
  CLIENTS: User,
  USERS: Users,
  QUOTES: FileText,
  ORDERS: Briefcase,
  PAYMENTS: DollarSign,
  EQUIPMENT: Package,
  CALENDAR: Calendar,
  SETTINGS: Settings,
  SERVICES: Wrench,
  LOCATION: MapPin,
  
  // Action icons
  VIEW: Eye,
  EDIT: Edit2,
  DELETE: Trash2,
  ADD: Plus,
  SEARCH: Search,
  DOWNLOAD: Download,
  UPLOAD: Upload,
  
  // Status icons
  SUCCESS: CheckCircle,
  WARNING: AlertTriangle,
  PENDING: Clock,
  ACTIVE: CheckCircle,
  INACTIVE: AlertTriangle,
  
  // Other common icons
  EMAIL: Mail,
  PHONE: Phone,
  STATS: TrendingUp,
  ACTIVITY: Activity,
  CREDIT_CARD: CreditCard,
  HOME: Home,
  SHOPPING_CART: ShoppingCart,
  ARCHIVE: Archive,
  TAG: Tag
};

// Standard color schemes
export const STANDARD_COLORS = {
  primary: {
    light: 'text-blue-600',
    dark: 'text-blue-400',
    bg: 'bg-blue-100',
    darkBg: 'bg-blue-900'
  },
  secondary: {
    light: 'text-gray-600',
    dark: 'text-gray-400',
    bg: 'bg-gray-100',
    darkBg: 'bg-gray-700'
  },
  success: {
    light: 'text-green-600',
    dark: 'text-green-400',
    bg: 'bg-green-100',
    darkBg: 'bg-green-900'
  },
  warning: {
    light: 'text-yellow-600',
    dark: 'text-yellow-400',
    bg: 'bg-yellow-100',
    darkBg: 'bg-yellow-900'
  },
  danger: {
    light: 'text-red-600',
    dark: 'text-red-400',
    bg: 'bg-red-100',
    darkBg: 'bg-red-900'
  }
};

// Standard Action Button Component
export const StandardActionButton = ({
  action,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  theme = 'light',
  children,
  ...props
}) => {
  const getSizeClasses = (size) => {
    switch (size) {
      case 'xs':
        return 'p-1 text-xs';
      case 'sm':
        return 'p-2 text-sm';
      case 'lg':
        return 'p-3 text-base';
      default:
        return 'p-2.5 text-sm';
    }
  };

  const getVariantClasses = (variant, theme) => {
    const baseClasses = 'border rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300`;
      case 'secondary':
        return `${baseClasses} ${
          theme === 'dark'
            ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600 focus:ring-gray-500'
            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500'
        } disabled:opacity-50`;
      case 'danger':
        return `${baseClasses} border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300`;
      case 'success':
        return `${baseClasses} border-transparent text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300`;
      case 'ghost':
        return `${baseClasses} border-transparent ${
          theme === 'dark'
            ? 'text-gray-400 hover:text-white hover:bg-gray-700'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        } focus:ring-gray-500`;
      default:
        return `${baseClasses} ${
          theme === 'dark'
            ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
        } focus:ring-gray-500`;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${getSizeClasses(size)} ${getVariantClasses(variant, theme)} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      title={action}
      {...props}
    >
      {children}
    </button>
  );
};

// Standard Entity Icon Component
export const StandardEntityIcon = ({
  entity,
  size = 'md',
  color = 'primary',
  theme = 'light',
  className = ''
}) => {
  const IconComponent = STANDARD_ICONS[entity] || STANDARD_ICONS.SETTINGS;
  
  const getSizeClasses = (size) => {
    switch (size) {
      case 'xs':
        return 'h-3 w-3';
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-6 w-6';
      case 'xl':
        return 'h-8 w-8';
      case '2xl':
        return 'h-10 w-10';
      default:
        return 'h-5 w-5';
    }
  };

  const getColorClass = (color, theme) => {
    const colorScheme = STANDARD_COLORS[color] || STANDARD_COLORS.primary;
    return theme === 'dark' ? colorScheme.dark : colorScheme.light;
  };

  return (
    <IconComponent
      className={`${getSizeClasses(size)} ${getColorClass(color, theme)} ${className}`}
    />
  );
};

// Standard Status Icon Component
export const StandardStatusIcon = ({
  status,
  size = 'md',
  theme = 'light',
  className = ''
}) => {
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'active':
      case 'paid':
      case 'approved':
        return { icon: STANDARD_ICONS.SUCCESS, color: 'success' };
      case 'warning':
      case 'pending':
      case 'waiting':
      case 'review':
        return { icon: STANDARD_ICONS.WARNING, color: 'warning' };
      case 'error':
      case 'failed':
      case 'inactive':
      case 'cancelled':
      case 'rejected':
        return { icon: STANDARD_ICONS.WARNING, color: 'danger' };
      default:
        return { icon: STANDARD_ICONS.PENDING, color: 'secondary' };
    }
  };

  const getSizeClasses = (size) => {
    switch (size) {
      case 'xs':
        return 'h-3 w-3';
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-6 w-6';
      case 'xl':
        return 'h-8 w-8';
      default:
        return 'h-5 w-5';
    }
  };

  const getColorClass = (color, theme) => {
    const colorScheme = STANDARD_COLORS[color] || STANDARD_COLORS.secondary;
    return theme === 'dark' ? colorScheme.dark : colorScheme.light;
  };

  const statusConfig = getStatusIcon(status);
  const IconComponent = statusConfig.icon;

  return (
    <IconComponent
      className={`${getSizeClasses(size)} ${getColorClass(statusConfig.color, theme)} ${className}`}
    />
  );
};

// Standard Icon Button Component (combines icon + action)
export const StandardIconButton = ({
  icon,
  action,
  variant = 'ghost',
  size = 'md',
  onClick,
  disabled = false,
  theme = 'light',
  tooltip,
  ...props
}) => {
  const IconComponent = typeof icon === 'string' ? STANDARD_ICONS[icon] : icon;

  return (
    <StandardActionButton
      action={action}
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      theme={theme}
      title={tooltip || action}
      {...props}
    >
      <IconComponent className={size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} />
    </StandardActionButton>
  );
};

// Helper function to get standard icon by name
export const getStandardIcon = (iconName, props = {}) => {
  const IconComponent = STANDARD_ICONS[iconName];
  return IconComponent ? <IconComponent {...props} /> : null;
};

// Helper function to create consistent action buttons
export const createActionButton = (action, icon, onClick, variant = 'ghost', props = {}) => ({
  action,
  icon: getStandardIcon(icon, { className: 'h-4 w-4' }),
  onClick,
  variant,
  ...props
});