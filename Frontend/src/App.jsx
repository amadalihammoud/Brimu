import React, { useState, useEffect, Suspense, lazy, memo } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuthSimple as useAuth } from './hooks/useAuthSimple'
import { NotificationProvider } from './components/NotificationSystem'
import { EquipmentProvider } from './contexts/EquipmentContext'
import config from './config'

// Componentes da Landing Page (carregamento imediato)
import Header from './components/Header'
import Hero from './components/Hero'
import Services from './components/Services'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Auth from './components/Auth'

// Componentes simplificados
import DashboardCompleto from './pages/DashboardCompleto'
// Componentes lazy-loaded para melhor performance
const MainLayout = lazy(() => import('./layouts/MainLayout'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

// Páginas Admin (lazy-loaded)
const Clientes = lazy(() => import('./pages/Clientes'))
const OrdersPage = lazy(() => import('./pages/admin/OrdersPage'))
const QuotesPage = lazy(() => import('./pages/admin/QuotesPage'))
const PaymentsPage = lazy(() => import('./pages/admin/PaymentsPage'))
const EquipmentPage = lazy(() => import('./pages/admin/EquipmentPage'))
const CalendarPage = lazy(() => import('./pages/admin/CalendarPage'))

// Páginas Cliente (lazy-loaded)
const MyOrdersPage = lazy(() => import('./pages/client/MyOrdersPage'))
const MyQuotesPage = lazy(() => import('./pages/client/MyQuotesPage'))
const MyPaymentsPage = lazy(() => import('./pages/client/MyPaymentsPage'))
const ProfilePage = lazy(() => import('./pages/client/ProfilePage'))

// Componente de loading otimizado
const LoadingSpinner = memo(() => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-forest-600"></div>
  </div>
))

// Componente para rotas protegidas otimizado
const ProtectedRoute = memo(({ children, allowedRoles, user, fallback = "/dashboard" }) => {
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={fallback} replace />;
  }
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
});

// Componente da Landing Page otimizado
const LandingPage = memo(({ user, onLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Se o usuário estiver logado, redirecionar para o dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleShowStorage = () => {
    navigate('/storage-demo');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header user={user} onLogout={onLogout} onShowStorage={handleShowStorage} />
      <Hero />
      <Services />
      <About />
      <Contact />
      <Footer />
    </div>
  );
});

// Componente principal da aplicação
const App = () => {
  const { user, loading, login, logout, isAdmin, isClient } = useAuth()
  const [theme, setTheme] = useState('light')
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')

  // Função para lidar com login
  const handleLogin = async (email, password) => {
    try {
      await login(email, password)
    } catch (error) {
      throw error
    }
  }

  // Função para lidar com logout
  const handleLogout = async () => {
    await logout()
  }


  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <NotificationProvider>
      <EquipmentProvider>
        <Router>
          <div className="min-h-screen bg-white dark:bg-gray-900">
        <Routes>
          {/* Rota de autenticação */}
          <Route 
            path="/auth" 
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Auth onLogin={handleLogin} />
              )
            } 
          />

          {/* Landing Page */}
          <Route 
            path="/" 
            element={<LandingPage user={user} onLogout={handleLogout} />} 
          />

          {/* Rotas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <DashboardCompleto user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          {/* Rotas Admin */}
          <Route
            path="/admin/clientes"
            element={
              <ProtectedRoute user={user} allowedRoles={['admin']}>
                <MainLayout user={user} onLogout={handleLogout} theme={theme} isAdmin={isAdmin} isClient={isClient}>
                  <Clientes />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute user={user} allowedRoles={['admin', 'employee']}>
                <MainLayout user={user} onLogout={handleLogout} theme={theme} isAdmin={isAdmin} isClient={isClient}>
                  <OrdersPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/quotes"
            element={
              <ProtectedRoute user={user} allowedRoles={['admin', 'employee']}>
                <MainLayout user={user} onLogout={handleLogout} theme={theme} isAdmin={isAdmin} isClient={isClient}>
                  <QuotesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute user={user} allowedRoles={['admin', 'employee']}>
                <MainLayout user={user} onLogout={handleLogout} theme={theme} isAdmin={isAdmin} isClient={isClient}>
                  <PaymentsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/equipment"
            element={
              <ProtectedRoute user={user} allowedRoles={['admin', 'employee']}>
                <MainLayout user={user} onLogout={handleLogout} theme={theme} isAdmin={isAdmin} isClient={isClient}>
                  <EquipmentPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/calendar"
            element={
              <ProtectedRoute user={user} allowedRoles={['admin', 'employee']}>
                <MainLayout user={user} onLogout={handleLogout} theme={theme} isAdmin={isAdmin} isClient={isClient}>
                  <CalendarPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Rotas Cliente */}
          <Route
            path="/client/orders"
            element={
              <ProtectedRoute user={user} allowedRoles={['client', 'user']}>
                <MainLayout user={user} onLogout={handleLogout} theme={theme} isAdmin={isAdmin} isClient={isClient}>
                  <MyOrdersPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/quotes"
            element={
              <ProtectedRoute user={user} allowedRoles={['client', 'user']}>
                <MainLayout user={user} onLogout={handleLogout} theme={theme} isAdmin={isAdmin} isClient={isClient}>
                  <MyQuotesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/payments"
            element={
              <ProtectedRoute user={user} allowedRoles={['client', 'user']}>
                <MainLayout user={user} onLogout={handleLogout} theme={theme} isAdmin={isAdmin} isClient={isClient}>
                  <MyPaymentsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/profile"
            element={
              <ProtectedRoute user={user} allowedRoles={['client', 'user']}>
                <MainLayout user={user} onLogout={handleLogout} theme={theme} isAdmin={isAdmin} isClient={isClient}>
                  <ProfilePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Rota de fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </Router>
      </EquipmentProvider>
    </NotificationProvider>
  )
}

export default App