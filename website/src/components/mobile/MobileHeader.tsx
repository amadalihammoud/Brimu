'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  actions?: React.ReactNode;
  onBack?: () => void;
}

const MobileHeader = ({ 
  title, 
  showBack = false, 
  showNotifications = true,
  actions,
  onBack 
}: MobileHeaderProps) => {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [notificationCount] = useState(3); // Mock notification count

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <header className="header-mobile safe-area-top">
      <div className="flex items-center justify-between w-full">
        {/* Left Side */}
        <div className="flex items-center space-x-3">
          {showBack ? (
            <motion.button
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              onClick={handleBack}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
          ) : (
            <div className="flex items-center space-x-3">
              {/* User Avatar */}
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md"
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push('/profile')}
              >
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </motion.div>
              
              {/* Greeting */}
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">
                  {getGreeting()}
                </span>
                <span className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                  {user?.name || 'Usuário'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Center - Title */}
        {title && (
          <div className="flex-1 flex justify-center">
            <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[200px]">
              {title}
            </h1>
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center space-x-2">
          {/* Custom Actions */}
          {actions}

          {/* Notifications */}
          {showNotifications && (
            <motion.button
              className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => router.push('/notifications')}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 21h1a3 3 0 003-3v-5a8 8 0 1116 0v5a3 3 0 003 3h1" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21v-1a3 3 0 013-3h0a3 3 0 013 3v1" />
              </svg>
              
              {/* Notification Badge */}
              {notificationCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </motion.span>
              )}
            </motion.button>
          )}

          {/* Search Button (for some pages) */}
          {!showBack && (
            <motion.button
              className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => router.push('/search')}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </motion.button>
          )}
        </div>
      </div>

      {/* Optional Status Bar */}
      {isAdmin && (
        <motion.div
          className="mt-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-700">
              Modo Administrador Ativo
            </span>
          </div>
        </motion.div>
      )}
    </header>
  );
};

// Variantes específicas do Header para diferentes páginas
export const DashboardHeader = () => (
  <MobileHeader 
    showBack={false}
    showNotifications={true}
  />
);

export const PageHeader = ({ title }: { title: string }) => (
  <MobileHeader 
    title={title}
    showBack={true}
    showNotifications={false}
  />
);

export const FormHeader = ({ 
  title, 
  onSave, 
  saveDisabled = false 
}: { 
  title: string; 
  onSave?: () => void;
  saveDisabled?: boolean;
}) => (
  <MobileHeader 
    title={title}
    showBack={true}
    showNotifications={false}
    actions={
      onSave && (
        <motion.button
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            saveDisabled 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
          }`}
          onClick={onSave}
          disabled={saveDisabled}
          whileTap={{ scale: saveDisabled ? 1 : 0.95 }}
        >
          Salvar
        </motion.button>
      )
    }
  />
);

export default MobileHeader;