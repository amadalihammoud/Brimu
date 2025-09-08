import React from 'react';
import { Search, Filter, RotateCcw, Download } from 'lucide-react';

// Modern Page Header Component
export const ModernPageHeader = ({ 
  title, 
  subtitle, 
  icon, 
  actions = [], 
  theme = 'light' 
}) => {
  return (
    <div className={`mb-8 p-6 rounded-lg border ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } shadow-sm`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          {icon && (
            <div className={`p-3 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              {icon}
            </div>
          )}
          <div>
            <h1 className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
            </h1>
            {subtitle && (
              <p className={`mt-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions.length > 0 && (
          <div className="flex space-x-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  action.variant === 'secondary'
                    ? 'bg-gray-600 hover:bg-gray-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Modern Stats Cards Component
export const ModernStatsCards = ({ stats = [], theme = 'light' }) => {
  if (!Array.isArray(stats) || stats.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`p-6 rounded-lg border ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } shadow-sm hover:shadow-md transition-shadow duration-200`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {stat.label}
              </p>
              <p className={`text-2xl font-bold mt-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {stat.value}
              </p>
              {stat.change && (
                <p className={`text-sm mt-1 ${
                  stat.change.startsWith('+') 
                    ? 'text-green-600' 
                    : stat.change.startsWith('-') 
                    ? 'text-red-600' 
                    : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {stat.change}
                </p>
              )}
            </div>
            {stat.icon && (
              <div className={`p-3 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                {stat.icon}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Modern Search Filter Bar Component
export const ModernSearchFilterBar = ({ 
  searchValue = '', 
  onSearchChange, 
  filters = [], 
  onFilterChange,
  actions = [],
  theme = 'light' 
}) => {
  return (
    <div className={`mb-6 p-4 rounded-lg border ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } shadow-sm`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search Input */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center space-x-4">
          {filters.map((filter, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filter.value}
                onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                className={`border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          
          {/* Actions */}
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                action.variant === 'primary'
                  ? 'border-transparent text-white bg-blue-600 hover:bg-blue-700'
                  : theme === 'dark'
                  ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {action.icon && <span className="mr-1">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Modern Data Table Component
export const ModernDataTable = ({ 
  columns = [], 
  data = [], 
  loading = false, 
  theme = 'light',
  actions = [],
  onRowClick,
  renderActions
}) => {
  if (loading) {
    return (
      <div className={`rounded-lg border ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } shadow-sm`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } shadow-sm overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {column.icon && <span>{column.icon}</span>}
                    <span>{column.label}</span>
                  </div>
                </th>
              ))}
              {(actions.length > 0 || renderActions) && (
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className={`divide-y ${
            theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'
          }`}>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={`${
                  onRowClick ? 'cursor-pointer hover:bg-opacity-50' : ''
                } ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {(actions.length > 0 || renderActions) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {renderActions ? renderActions(row) : (
                      <div className="flex justify-end space-x-2">
                        {actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            className={`p-2 rounded-md ${
                              theme === 'dark'
                                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                                : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
                            } transition-colors duration-200`}
                            title={action.label}
                          >
                            {action.icon}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Modern Status Badge Component
export const ModernStatusBadge = ({ 
  status, 
  size = 'md', 
  theme = 'light' 
}) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'ativo':
      case 'completed':
      case 'completo':
      case 'pago':
      case 'paid':
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'pendente':
      case 'waiting':
      case 'aguardando':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
      case 'inativo':
      case 'cancelled':
      case 'cancelado':
      case 'error':
      case 'erro':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
      case 'alta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
      case 'baixa':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return theme === 'dark' 
          ? 'bg-gray-700 text-gray-300 border-gray-600' 
          : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSizeClasses = (size) => {
    switch (size) {
      case 'xs':
        return 'px-2 py-1 text-xs';
      case 'sm':
        return 'px-2.5 py-1.5 text-xs';
      case 'lg':
        return 'px-4 py-2 text-sm';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  return (
    <span className={`inline-flex items-center border rounded-full font-medium ${
      getSizeClasses(size)
    } ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

// Modern Empty State Component
export const ModernEmptyState = ({ 
  title = 'Nenhum item encontrado', 
  description = 'Não há dados para exibir no momento.',
  icon,
  actions = [],
  theme = 'light' 
}) => {
  return (
    <div className={`text-center py-12 px-6 rounded-lg border ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } shadow-sm`}>
      {icon && (
        <div className={`mx-auto h-24 w-24 ${
          theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
        } mb-6`}>
          {icon}
        </div>
      )}
      <h3 className={`text-lg font-medium mb-2 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        {title}
      </h3>
      <p className={`text-sm mb-6 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {description}
      </p>
      {actions.length > 0 && (
        <div className="flex justify-center space-x-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                action.variant === 'secondary'
                  ? 'bg-gray-600 hover:bg-gray-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};