import React, { useState } from 'react';
import {
  FiHome,
  FiFileText,
  FiUsers,
  FiUser,
  FiDollarSign,
  FiArrowLeft,
  FiArrowRight,
  FiLogIn,
  FiTool,
  FiCalendar
} from 'react-icons/fi';

const Sidebar = ({ isCollapsed, onToggle, activeItem, onNavigate, user, isAdmin, isClient, onLogout, theme }) => {
  // Menu para Administradores
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'calendar', label: 'Calendário', icon: FiCalendar },
    { id: 'clients', label: 'Clientes', icon: FiUsers },
    { id: 'quotes', label: 'Orçamentos', icon: FiFileText },
    { id: 'orders', label: 'Ordens de Serviço', icon: FiFileText },
    { id: 'payments', label: 'Pagamentos', icon: FiDollarSign },
    { id: 'equipment', label: 'Equipamentos', icon: FiTool },
    { id: 'logout', label: 'Sair', icon: FiLogIn, isLogout: true }
  ];

  // Menu para Clientes
  const clientMenuItems = [
    { id: 'dashboard', label: 'Meu Painel', icon: FiHome },
    { id: 'my-orders', label: 'Minhas Ordens', icon: FiFileText },
    { id: 'my-quotes', label: 'Meus Orçamentos', icon: FiFileText },
    { id: 'my-payments', label: 'Meus Pagamentos', icon: FiDollarSign },
    { id: 'profile', label: 'Meu Perfil', icon: FiUser },
    { id: 'logout', label: 'Sair', icon: FiLogIn, isLogout: true }
  ];

  // Selecionar menu baseado no role
  const menuItems = isAdmin() ? adminMenuItems : clientMenuItems;

  const handleItemClick = (itemId, item) => {
    if (item.isLogout) {
      onLogout();
    } else if (onNavigate) {
      onNavigate(itemId);
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 border-r border-gray-200'} transition-all duration-300 shadow-lg ${
      isCollapsed ? 'w-16' : 'w-64'
    } animate-slide-in-right`}>
      {/* Header */}
      <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3 animate-fade-in">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-lg font-bold">🌳</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">Brimu</span>
                <p className="text-xs text-gray-500 font-medium">Arborização & Paisagismo</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
          >
            {isCollapsed ? (
              <FiArrowRight className="w-5 h-5" />
            ) : (
              <FiArrowLeft className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Informações do Usuário */}
        {user && !isCollapsed && (
          <div className={`mt-4 p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gradient-to-r from-gray-50 to-gray-100'} rounded-xl border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} animate-slide-up`}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
                  <FiUser className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} truncate`}>
                  {user.name || 'Usuário'}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} capitalize font-medium`}>
                  {isAdmin() ? 'Administrador' : isClient() ? 'Cliente' : user.role || 'Usuário'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Menu Principal */}
      <div className="p-4">
        {!isCollapsed && (
          <div className="animate-fade-in">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">
              Menu Principal
            </h3>
            <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-transparent rounded-full mb-4"></div>
          </div>
        )}
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id, item)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  item.isLogout
                    ? 'text-red-500 hover:bg-red-50 hover:text-red-600 border border-red-200 hover:border-red-300 hover:shadow-sm'
                    : isActive
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md transform scale-105'
                    : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'animate-bounce-in' : 'group-hover:scale-110 transition-transform duration-200'}`} />
                {!isCollapsed && (
                  <span className="flex-1 text-left">{item.label}</span>
                )}
                {isActive && !isCollapsed && (
                  <div className="w-2 h-2 bg-white rounded-full shadow-sm animate-pulse"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {!isCollapsed && (
          <div className="pt-4">
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} pt-2`}>
              <div className={`w-16 h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} mb-2`}></div>
              <p>Brimu v1.0.0</p>
              <p>Sistema de Gestão</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
