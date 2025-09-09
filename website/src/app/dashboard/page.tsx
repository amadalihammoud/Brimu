'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  FileText, 
  Clock, 
  DollarSign, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

interface DashboardStats {
  totalClients?: number;
  activeOrders: number;
  pendingQuotes: number;
  monthRevenue?: number;
  pendingPayments?: number;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'quote' | 'payment';
  title: string;
  description: string;
  time: string;
  status: 'completed' | 'pending' | 'in_progress';
}

export default function Dashboard() {
  const { user, loading, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeOrders: 0,
    pendingQuotes: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Carregar dados do dashboard
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setDashboardLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isAdmin) {
        setStats({
          totalClients: 25,
          activeOrders: 8,
          pendingQuotes: 3,
          monthRevenue: 15750.00
        });
        
        setRecentActivity([
          {
            id: '1',
            type: 'order',
            title: 'Nova ordem criada',
            description: 'Poda de árvores - Condomínio Jardins',
            time: 'Há 2 horas',
            status: 'in_progress'
          },
          {
            id: '2',
            type: 'payment',
            title: 'Pagamento recebido',
            description: 'R$ 2.500,00 - Residência Silva',
            time: 'Há 5 horas',
            status: 'completed'
          },
          {
            id: '3',
            type: 'quote',
            title: 'Orçamento enviado',
            description: 'Remoção de árvore - Shopping Plaza',
            time: 'Há 1 dia',
            status: 'pending'
          }
        ]);
      } else {
        setStats({
          activeOrders: 2,
          pendingQuotes: 1,
          pendingPayments: 1
        });
        
        setRecentActivity([
          {
            id: '1',
            type: 'order',
            title: 'Serviço agendado',
            description: 'Poda de árvores agendada para amanhã',
            time: 'Há 1 dia',
            status: 'in_progress'
          },
          {
            id: '2',
            type: 'quote',
            title: 'Orçamento aprovado',
            description: 'Plantio de mudas - R$ 1.200,00',
            time: 'Há 3 dias',
            status: 'completed'
          }
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Calendar className="w-4 h-4" />;
      case 'quote':
        return <FileText className="w-4 h-4" />;
      case 'payment':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AuthenticatedLayout user={user} onLogout={logout}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isAdmin ? 'Dashboard Administrativo' : 'Meu Painel'}
          </h1>
          <p className="text-gray-600">
            Olá {user.name}, bem-vindo ao seu painel!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isAdmin ? (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalClients}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ordens Ativas</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.activeOrders}</p>
                  </div>
                  <Clock className="w-12 h-12 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Orçamentos Pendentes</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pendingQuotes}</p>
                  </div>
                  <FileText className="w-12 h-12 text-orange-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Receita do Mês</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(stats.monthRevenue || 0)}
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-green-500" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ordens Ativas</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.activeOrders}</p>
                  </div>
                  <FileText className="w-12 h-12 text-blue-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Orçamentos Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingQuotes}</p>
                  </div>
                  <Clock className="w-12 h-12 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pagamentos Pendentes</p>
                    <p className="text-2xl font-bold text-red-600">{stats.pendingPayments || 0}</p>
                  </div>
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Próximo Serviço</p>
                    <p className="text-lg font-bold text-green-600">Amanhã</p>
                    <p className="text-sm text-gray-500">Poda de árvores</p>
                  </div>
                  <Calendar className="w-12 h-12 text-green-500" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
          </div>
          <div className="p-6">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma atividade recente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}