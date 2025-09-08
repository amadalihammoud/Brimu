import React, { useState, useEffect } from 'react';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiBriefcase, 
  FiUsers, 
  FiCalendar,
  FiDollarSign,
  FiAlertTriangle,
  FiClock,
  FiCheckCircle,
  FiSettings,
  FiFileText,
  FiEdit,
  FiAlertCircle
} from 'react-icons/fi';
import { 
  orderAPI, 
  quoteAPI, 
  paymentAPI, 
  clientAPI,
  formatCurrency,
  formatDate,
  formatDateTime
} from '../services/api';
import EquipmentDashboard from '../components/EquipmentDashboard';

const Dashboard = ({ user, isAdmin, isClient, theme }) => {
  // Debug removido para produção
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Alertas removidos conforme solicitado

  const [dashboardData, setDashboardData] = useState({
    // Admin stats
    totalClients: 0,
    activeOrders: 0,
    pendingQuotes: 0,
    monthRevenue: 0,
    // Client stats
    pendingPayments: 0,
    nextService: null,
    // Lists
    recentOrders: [],
    recentQuotes: [],
    recentPayments: [],
    // Activity
    recentActivity: []
  });

  // Função para buscar dados do dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular delay de carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isAdmin) {
        // Dados mockados para admin
        setDashboardData({
          totalClients: 25,
          activeOrders: 8,
          pendingQuotes: 3,
          monthRevenue: 15750.00,
          recentOrders: [
            { id: 1, client: 'Condomínio Jardins', service: 'Poda de Árvores', status: 'em_andamento', createdAt: new Date().toISOString() },
            { id: 2, client: 'Empresa ABC', service: 'Plantio de Mudas', status: 'concluido', createdAt: new Date().toISOString() }
          ],
          recentQuotes: [
            { id: 1, client: 'Residência Silva', service: 'Corte de Árvore', status: 'enviado', createdAt: new Date().toISOString() }
          ],
          recentPayments: [
            { id: 1, client: 'Condomínio Jardins', amount: 2500.00, status: 'pago', createdAt: new Date().toISOString() }
          ],
          recentActivity: [
            { type: 'order', data: { id: 1, client: 'Condomínio Jardins' }, time: new Date().toISOString() },
            { type: 'quote', data: { id: 1, client: 'Residência Silva' }, time: new Date().toISOString() }
          ]
        });
      } else {
        // Dados mockados para cliente
        const activeOrders = 2;
        const pendingQuotes = 1;
        const pendingPayments = 1;
        
        // Dados mockados para cliente
        setDashboardData({
          activeOrders,
          pendingQuotes,
          pendingPayments,
          nextService: {
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
            service: 'Poda de Árvores',
            orderNumber: 'ORD-2024-001'
          },
          recentOrders: [
            { id: 1, service: 'Poda de Árvores', status: 'em_andamento', createdAt: new Date().toISOString() },
            { id: 2, service: 'Plantio de Mudas', status: 'concluido', createdAt: new Date().toISOString() }
          ],
          recentQuotes: [
            { id: 1, service: 'Corte de Árvore', status: 'enviado', createdAt: new Date().toISOString() }
          ],
          recentPayments: [
            { id: 1, amount: 1500.00, status: 'pendente', createdAt: new Date().toISOString() }
          ],
          recentActivity: [
            { type: 'order', data: { id: 1, service: 'Poda de Árvores' }, time: new Date().toISOString() },
            { type: 'quote', data: { id: 1, service: 'Corte de Árvore' }, time: new Date().toISOString() }
          ]
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, isAdmin, isClient]);

  // Estado de loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <FiAlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="btn-success"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Alertas removidos conforme solicitado

  // Preparar dados para exibição baseado no role
  const stats = isAdmin ? {
    totalClients: { valor: dashboardData.totalClients, variacao: 0, periodo: 'Total' },
    activeOrders: { valor: dashboardData.activeOrders, variacao: 0, status: 'Em andamento' },
    pendingQuotes: { valor: dashboardData.pendingQuotes, variacao: 0, status: 'Aguardando' },
    monthRevenue: { valor: dashboardData.monthRevenue, variacao: 0, periodo: 'Este mês' }
  } : {
    activeOrders: { valor: dashboardData.activeOrders, variacao: 0, status: 'Em andamento' },
    pendingQuotes: { valor: dashboardData.pendingQuotes, variacao: 0, status: 'Em análise' },
    pendingPayments: { valor: dashboardData.pendingPayments, variacao: 0, status: 'Pendente' },
    nextService: { 
      valor: dashboardData.nextService ? formatDateTime(dashboardData.nextService.date) : 'Nenhum agendado', 
      variacao: 0, 
      status: 'Próximo serviço' 
    }
  };

  // Próximos serviços para admin
  const adminProximosServicos = [
    { id: 1, titulo: 'Poda de Árvores', cliente: 'Condomínio Jardins', data: 'Hoje às 09:00' },
    { id: 2, titulo: 'Remoção de Árvore', cliente: 'Shopping Plaza', data: 'Amanhã às 14:00' },
    { id: 3, titulo: 'Plantio de Mudas', cliente: 'Parque Central', data: 'Quinta às 10:00' }
  ];

  // Atividades recentes para admin
  const adminAtividadeRecente = [
    { id: 1, tipo: 'servico', titulo: 'Novo serviço agendado', detalhes: 'Condomínio Jardins • Há 2 horas', cor: 'green' },
    { id: 2, tipo: 'orcamento', titulo: 'Orçamento aprovado', detalhes: 'Shopping Verde Plaza • Há 5 horas', cor: 'blue' },
    { id: 3, tipo: 'pagamento', titulo: 'Pagamento recebido', detalhes: 'R$ 2.500,00 • Há 1 dia', cor: 'green' },
    { id: 4, tipo: 'cliente', titulo: 'Novo cliente cadastrado', detalhes: 'Maria Santos • Há 2 dias', cor: 'purple' }
  ];

  // Atividades recentes para cliente
  const clientAtividadeRecente = [
    { id: 1, tipo: 'servico', titulo: 'Serviço concluído', detalhes: 'Poda de Árvores • Há 3 dias', cor: 'green' },
    { id: 2, tipo: 'orcamento', titulo: 'Orçamento enviado', detalhes: 'Remoção de Árvore • Há 1 semana', cor: 'blue' },
    { id: 3, tipo: 'pagamento', titulo: 'Pagamento confirmado', detalhes: 'R$ 1.200,00 • Há 2 semanas', cor: 'green' }
  ];

  const proximosServicos = isAdmin ? adminProximosServicos : [];
  const atividadeRecente = dashboardData.recentActivity;

  const formatDate = () => {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return now.toLocaleDateString('pt-BR', options);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container-fixed section-padding">
        <div className="animate-fade-in">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
            {isAdmin ? 'Dashboard Administrativo' : 'Meu Painel'}
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {isClient && user ? 
              `Olá ${user.name}, bem-vindo ao seu painel! • ${formatDate()}` :
              `Bem-vindo ao Brimu • ${formatDate()}`
            }
          </p>
        </div>

        {/* Alertas removidos conforme solicitado */}

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isAdmin ? (
            <>
              {/* Total de Clientes - Admin */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total de Clientes</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalClients.valor}</p>
                    <div className="flex items-center mt-1">
                      <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">{stats.totalClients.variacao}%</span>
                    </div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{stats.totalClients.periodo}</p>
                  </div>
                  <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                    <FiUsers className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Ordens em Andamento - Admin */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Ordens em Andamento</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.activeOrders.valor}</p>
                    <div className="flex items-center mt-1">
                      <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">{stats.activeOrders.variacao}%</span>
                    </div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{stats.activeOrders.status}</p>
                  </div>
                  <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-yellow-900' : 'bg-yellow-100'} rounded-lg flex items-center justify-center`}>
                    <FiClock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Orçamentos Pendentes - Admin */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Orçamentos Pendentes</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pendingQuotes.valor}</p>
                    <div className="flex items-center mt-1">
                      <FiTrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-sm text-red-600">{Math.abs(stats.pendingQuotes.variacao)}%</span>
                    </div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{stats.pendingQuotes.status}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FiFileText className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Receita do Mês - Admin */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Receita do Mês</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(stats.monthRevenue.valor)}
                    </p>
                    <div className="flex items-center mt-1">
                      <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">{stats.monthRevenue.variacao}%</span>
                    </div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{stats.monthRevenue.periodo}</p>
                  </div>
                  <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-green-900' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                    <FiDollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Minhas Ordens Ativas - Cliente */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Minhas Ordens Ativas</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.activeOrders.valor}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{stats.activeOrders.status}</p>
                  </div>
                  <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                    <FiFileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Orçamentos em Análise - Cliente */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Orçamentos em Análise</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingQuotes.valor}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{stats.pendingQuotes.status}</p>
                  </div>
                  <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-yellow-900' : 'bg-yellow-100'} rounded-lg flex items-center justify-center`}>
                    <FiEdit className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Pagamentos Pendentes - Cliente */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Pagamentos Pendentes</p>
                    <p className="text-2xl font-bold text-red-600">{stats.pendingPayments.valor}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{stats.pendingPayments.status}</p>
                  </div>
                  <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-red-900' : 'bg-red-100'} rounded-lg flex items-center justify-center`}>
                    <FiAlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Próximo Serviço - Cliente */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Próximo Serviço</p>
                    <p className="text-lg font-bold text-green-600">{stats.nextService.valor}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{stats.nextService.status}</p>
                  </div>
                  <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-green-900' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                    <FiCalendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Seções Inferiores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isAdmin ? (
            <>
              {/* Próximos Serviços - Admin */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
                <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Ordens Agendadas para Hoje</h3>
                    <button 
                      onClick={() => window.location.href = '#orders'}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Ver todas →
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {proximosServicos.length === 0 ? (
                    <div className="text-center py-8">
                      <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma ordem agendada para hoje</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {proximosServicos.map((servico) => (
                        <div key={servico.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{servico.titulo}</p>
                            <p className="text-sm text-gray-500">{servico.cliente} • {servico.data}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Atividade Recente - Admin */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Últimas Atividades do Sistema</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {atividadeRecente.map((atividade, index) => (
                      <div key={atividade.id || index} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          atividade.cor === 'green' ? 'bg-green-500' :
                          atividade.cor === 'blue' ? 'bg-blue-500' :
                          atividade.cor === 'yellow' ? 'bg-yellow-500' : 
                          atividade.cor === 'purple' ? 'bg-purple-500' : 'bg-gray-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{atividade.titulo}</p>
                          <p className="text-sm text-gray-500">{atividade.detalhes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Histórico de Serviços - Cliente */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Histórico de Serviços</h3>
                    <button 
                      onClick={() => window.location.href = '#my-orders'}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Ver todos →
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {atividadeRecente.map((atividade, index) => (
                      <div key={atividade.id || index} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          atividade.cor === 'green' ? 'bg-green-500' :
                          atividade.cor === 'blue' ? 'bg-blue-500' :
                          atividade.cor === 'yellow' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{atividade.titulo}</p>
                          <p className="text-sm text-gray-500">{atividade.detalhes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status dos Pagamentos - Cliente */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Status dos Pagamentos</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FiCheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">Pago</p>
                          <p className="text-sm text-gray-500">R$ 1.200,00 • Há 2 semanas</p>
                        </div>
                      </div>
                      <span className="text-green-600 text-sm font-medium">Concluído</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FiClock className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-gray-900">Pendente</p>
                          <p className="text-sm text-gray-500">R$ 800,00 • Vence em 3 dias</p>
                        </div>
                      </div>
                      <span className="text-yellow-600 text-sm font-medium">Aguardando</span>
                    </div>
                  </div>
                </div>
              </div>

            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
