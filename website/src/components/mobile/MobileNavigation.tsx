'use client'

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  adminOnly?: boolean;
}

const MobileNavigation = () => {
  const { user, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  // Icons como componentes SVG para otimização mobile
  const HomeIcon = ({ active }: { active: boolean }) => (
    <svg 
      className={`w-6 h-6 ${active ? 'text-green-600' : 'text-gray-400'}`} 
      fill={active ? 'currentColor' : 'none'} 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={active ? 0 : 2} 
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
      />
    </svg>
  );

  const OrdersIcon = ({ active }: { active: boolean }) => (
    <svg 
      className={`w-6 h-6 ${active ? 'text-green-600' : 'text-gray-400'}`} 
      fill={active ? 'currentColor' : 'none'} 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={active ? 0 : 2} 
        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" 
      />
    </svg>
  );

  const QuotesIcon = ({ active }: { active: boolean }) => (
    <svg 
      className={`w-6 h-6 ${active ? 'text-green-600' : 'text-gray-400'}`} 
      fill={active ? 'currentColor' : 'none'} 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={active ? 0 : 2} 
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" 
      />
    </svg>
  );

  const ClientsIcon = ({ active }: { active: boolean }) => (
    <svg 
      className={`w-6 h-6 ${active ? 'text-green-600' : 'text-gray-400'}`} 
      fill={active ? 'currentColor' : 'none'} 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={active ? 0 : 2} 
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" 
      />
    </svg>
  );

  const MenuIcon = ({ active }: { active: boolean }) => (
    <svg 
      className={`w-6 h-6 ${active ? 'text-green-600' : 'text-gray-400'}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M4 6h16M4 12h16M4 18h16" 
      />
    </svg>
  );

  // Navigation items baseados no tipo de usuário
  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        id: 'home',
        label: 'Início',
        icon: <HomeIcon active={pathname === '/dashboard'} />,
        path: '/dashboard'
      },
      {
        id: 'orders',
        label: 'Ordens',
        icon: <OrdersIcon active={pathname.includes('/orders')} />,
        path: isAdmin ? '/admin/orders' : '/client/orders'
      },
      {
        id: 'quotes',
        label: 'Orçamentos',
        icon: <QuotesIcon active={pathname.includes('/quotes')} />,
        path: isAdmin ? '/admin/quotes' : '/client/quotes'
      }
    ];

    if (isAdmin) {
      baseItems.push({
        id: 'clients',
        label: 'Clientes',
        icon: <ClientsIcon active={pathname.includes('/users')} />,
        path: '/admin/users',
        adminOnly: true
      });
    }

    baseItems.push({
      id: 'menu',
      label: 'Menu',
      icon: <MenuIcon active={showMenu} />,
      path: '#',
    });

    return baseItems;
  };

  const navItems = getNavItems();

  const handleNavClick = (item: NavItem) => {
    if (item.id === 'menu') {
      setShowMenu(!showMenu);
    } else {
      router.push(item.path);
      setShowMenu(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Fechar menu quando mudar de rota
  useEffect(() => {
    setShowMenu(false);
  }, [pathname]);

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="nav-mobile">
        {navItems.map((item) => {
          const isActive = item.path === pathname || 
            (item.path !== '#' && pathname.startsWith(item.path));

          return (
            <motion.button
              key={item.id}
              className={`nav-item-mobile ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(item)}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </motion.span>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Slide-up Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
            />
            
            {/* Menu Content */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
              </div>

              <div className="px-4 pb-8">
                {/* User Info */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                    <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      {isAdmin ? 'Administrador' : 'Cliente'}
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  {/* Profile */}
                  <motion.button
                    className="w-full flex items-center space-x-3 p-4 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    onClick={() => {
                      router.push('/profile');
                      setShowMenu(false);
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Meu Perfil</span>
                  </motion.button>

                  {/* Settings */}
                  <motion.button
                    className="w-full flex items-center space-x-3 p-4 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    onClick={() => {
                      router.push('/settings');
                      setShowMenu(false);
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Configurações</span>
                  </motion.button>

                  {/* Admin Panel (Only for admins) */}
                  {isAdmin && (
                    <motion.button
                      className="w-full flex items-center space-x-3 p-4 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                      onClick={() => {
                        router.push('/admin/security');
                        setShowMenu(false);
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Dashboard de Segurança</span>
                    </motion.button>
                  )}

                  {/* Help */}
                  <motion.button
                    className="w-full flex items-center space-x-3 p-4 text-left text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    onClick={() => {
                      router.push('/help');
                      setShowMenu(false);
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Ajuda & Suporte</span>
                  </motion.button>

                  {/* Divider */}
                  <hr className="my-4" />

                  {/* Logout */}
                  <motion.button
                    className="w-full flex items-center space-x-3 p-4 text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    onClick={handleLogout}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sair</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavigation;