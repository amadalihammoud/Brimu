import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiBell, FiX } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
// import ThemeToggle from '../components/ThemeToggle';
import { useNotifications } from '../components/NotificationSystem';

const MainLayout = ({ user, onLogout, isAdmin, isClient, children, theme }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { notifications } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const notificationsRef = useRef(null);

  // Notificações removidas conforme solicitado
  const mockNotifications = [];

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleNavigate = (pageId) => {
    // Mapear IDs para rotas baseado no role do usuário
    const adminRouteMap = {
      'dashboard': '/dashboard',
      'clients': '/admin/clientes',
      'orders': '/admin/orders',
      'quotes': '/admin/quotes',
      'payments': '/admin/payments',
      'equipment': '/admin/equipment',
      'calendar': '/admin/calendar'
    };

    const clientRouteMap = {
      'dashboard': '/dashboard',
      'my-orders': '/client/orders',
      'my-quotes': '/client/quotes',
      'my-payments': '/client/payments',
      'profile': '/client/profile'
    };

    const routeMap = isAdmin() ? adminRouteMap : clientRouteMap;
    const route = routeMap[pageId];
    if (route) {
      navigate(route);
    }
  };

  // Determinar página ativa baseada na rota atual
  const getActivePage = () => {
    const path = location.pathname;
    
    // Rotas do admin
    if (path === '/admin/clientes') return 'clients';
    if (path === '/admin/orders') return 'orders';
    if (path === '/admin/quotes') return 'quotes';
    if (path === '/admin/payments') return 'payments';
    if (path === '/admin/equipment') return 'equipment';
    if (path === '/admin/calendar') return 'calendar';
    
    // Rotas do cliente
    if (path === '/client/orders') return 'my-orders';
    if (path === '/client/quotes') return 'my-quotes';
    if (path === '/client/payments') return 'my-payments';
    if (path === '/client/profile') return 'profile';
    
    // Dashboard (comum)
    if (path === '/dashboard') return 'dashboard';
    
    return 'dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={toggleSidebar}
        activeItem={getActivePage()}
        onNavigate={handleNavigate}
        user={user}
        isAdmin={isAdmin}
        isClient={isClient}
        onLogout={onLogout}
        theme={theme}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 shadow-sm px-6 py-4 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="btn-icon-secondary hover:scale-105 transition-transform duration-200"
              >
                <span className="sr-only">Abrir sidebar</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {getActivePage() === 'dashboard' && 'Dashboard'}
                  {getActivePage() === 'clients' && 'Clientes'}
                  {getActivePage() === 'orders' && 'Ordens de Serviço'}
                  {getActivePage() === 'quotes' && 'Orçamentos'}
                  {getActivePage() === 'payments' && 'Pagamentos'}
                  {getActivePage() === 'equipment' && 'Equipamentos'}
                  {getActivePage() === 'calendar' && 'Calendário'}
                  {getActivePage() === 'my-orders' && 'Minhas Ordens'}
                  {getActivePage() === 'my-quotes' && 'Meus Orçamentos'}
                  {getActivePage() === 'my-payments' && 'Meus Pagamentos'}
                  {getActivePage() === 'profile' && 'Meu Perfil'}
                </h1>
              </div>
            </div>
            
            {/* Botões de notificações e tema */}
            <div className="flex items-center space-x-4">
              {/* Botão de notificações */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={toggleNotifications}
                  className="btn-icon-secondary relative hover:scale-105 transition-transform duration-200"
                  title="Notificações"
                >
                  <FiBell className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  {mockNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {mockNotifications.length}
                    </span>
                  )}
                </button>

                {/* Dropdown de notificações */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 backdrop-blur-sm">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Notificações
                        </h3>
                        <button
                          onClick={toggleNotifications}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {mockNotifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          Nenhuma notificação
                        </div>
                      ) : (
                        mockNotifications.map((notification) => (
                          <div key={notification.id} className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 last:border-b-0">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {notification.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 rounded text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
                                title="Deletar notificação"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Toggle de tema */}
              {/* <ThemeToggle size="md" /> */}
            </div>
            
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
