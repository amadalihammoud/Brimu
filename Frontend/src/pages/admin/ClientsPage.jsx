import React, { useState, useEffect } from 'react';
import { UserPlus, Users, TrendingUp, DollarSign, Activity, Download, Mail, Phone, Calendar } from 'lucide-react';
import { clientAPI } from '../../services/api';
import { 
  ModernPageHeader, 
  ModernStatsCards, 
  ModernSearchFilterBar, 
  ModernDataTable, 
  ModernStatusBadge,
  ModernEmptyState
} from '../../components/common/ModernComponents';
import { StandardActionButton, StandardEntityIcon } from '../../components/common/IconStandards';

const ClientsPage = ({ theme = 'light' }) => {
  // Estados
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Buscar clientes ao montar componente
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular delay para mostrar loading
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Dados mockados expandidos com mais detalhes
      setClients([
        { 
          id: 1, 
          name: 'João Silva', 
          email: 'joao.silva@empresa.com', 
          phone: '(11) 98765-4321', 
          company: 'Green Solutions Ltda.', 
          totalOrders: 12, 
          totalRevenue: 25500, 
          isActive: true,
          lastOrder: '2024-03-10',
          createdAt: '2023-01-15',
          address: 'São Paulo, SP',
          rating: 4.9,
          category: 'Premium'
        },
        { 
          id: 2, 
          name: 'Maria Santos', 
          email: 'maria.santos@jardins.com', 
          phone: '(21) 98765-1234', 
          company: 'Jardins Tropicais Corp.', 
          totalOrders: 8, 
          totalRevenue: 18400, 
          isActive: true,
          lastOrder: '2024-03-08',
          createdAt: '2023-02-20',
          address: 'Rio de Janeiro, RJ',
          rating: 4.7,
          category: 'Premium'
        },
        { 
          id: 3, 
          name: 'Pedro Oliveira', 
          email: 'pedro@construtora.com', 
          phone: '(31) 98765-5678', 
          company: 'Construtora Verde Ltda.', 
          totalOrders: 15, 
          totalRevenue: 42800, 
          isActive: false,
          lastOrder: '2024-02-28',
          createdAt: '2023-01-05',
          address: 'Belo Horizonte, MG',
          rating: 4.5,
          category: 'Enterprise'
        },
        { 
          id: 4, 
          name: 'Ana Costa', 
          email: 'ana.costa@residencial.com', 
          phone: '(41) 98765-9012', 
          company: 'Costa Residencial', 
          totalOrders: 4, 
          totalRevenue: 9500, 
          isActive: true,
          lastOrder: '2024-03-12',
          createdAt: '2024-01-01',
          address: 'Curitiba, PR',
          rating: 5.0,
          category: 'Standard'
        },
        { 
          id: 5, 
          name: 'Carlos Mendes', 
          email: 'carlos@shopping.com', 
          phone: '(85) 98765-3456', 
          company: 'Shopping Verde Plaza', 
          totalOrders: 25, 
          totalRevenue: 95200, 
          isActive: true,
          lastOrder: '2024-03-14',
          createdAt: '2022-08-12',
          address: 'Fortaleza, CE',
          rating: 4.8,
          category: 'Enterprise'
        }
      ]);
      
    } catch (err) {
      setError('Erro ao carregar clientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar clientes
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && client.isActive) ||
      (filterStatus === 'inactive' && !client.isActive) ||
      (filterStatus === 'premium' && client.category === 'Premium') ||
      (filterStatus === 'enterprise' && client.category === 'Enterprise');
    
    return matchesSearch && matchesStatus;
  });

  // Estatísticas aprimoradas
  const stats = [
    {
      label: 'Total de Clientes',
      value: clients.length.toLocaleString(),
      icon: Users,
      iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600',
      iconColor: 'text-white',
      change: { type: 'increase', value: '+12%', period: 'este mês' }
    },
    {
      label: 'Clientes Ativos',
      value: clients.filter(c => c.isActive).length.toLocaleString(),
      icon: Activity,
      iconBg: 'bg-gradient-to-br from-emerald-400 to-green-600',
      iconColor: 'text-white',
      change: { type: 'increase', value: '+8%', period: 'esta semana' }
    },
    {
      label: 'Receita Total',
      value: `R$ ${clients.reduce((sum, c) => sum + (c.totalRevenue || 0), 0).toLocaleString()}`,
      icon: DollarSign,
      iconBg: 'bg-gradient-to-br from-yellow-400 to-orange-600',
      iconColor: 'text-white',
      change: { type: 'increase', value: '+24%', period: 'este mês' }
    },
    {
      label: 'Pedidos Totais',
      value: clients.reduce((sum, c) => sum + (c.totalOrders || 0), 0).toLocaleString(),
      icon: TrendingUp,
      iconBg: 'bg-gradient-to-br from-purple-400 to-pink-600',
      iconColor: 'text-white',
      change: { type: 'increase', value: '+18%', period: 'este mês' }
    }
  ];

  // Configurações das colunas da tabela
  const columns = [
    {
      key: 'name',
      label: 'Cliente',
      render: (value, row) => (
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {value.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <p className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Mail className="w-3 h-3" />
              <span>{row.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Phone className="w-3 h-3" />
              <span>{row.phone}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'company',
      label: 'Empresa',
      render: (value, row) => (
        <div>
          <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {value || '-'}
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {row.address}
          </p>
          <div className="mt-1">
            <span className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-bold
              ${row.category === 'Enterprise' 
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800' 
                : row.category === 'Premium' 
                ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800'
                : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800'
              }
            `}>
              {row.category}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'totalOrders',
      label: 'Pedidos',
      render: (value, row) => (
        <div className="text-center">
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          <div className="flex items-center justify-center space-x-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full ${
                  i < row.rating ? 'bg-yellow-400' : 'bg-gray-300'
                }`}
              />
            ))}
            <span className="ml-1 text-xs text-gray-500">
              {row.rating}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'totalRevenue',
      label: 'Receita',
      render: (value) => (
        <div className="text-right">
          <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">
            R$ {value.toLocaleString()}
          </p>
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => <ModernStatusBadge status={value ? 'active' : 'inactive'} />
    }
  ];

  // Ações da tabela padronizadas
  const tableActions = [
    {
      action: 'view',
      onClick: (client) => console.log('Ver cliente:', client),
      tooltip: 'Visualizar cliente'
    },
    {
      action: 'edit',
      onClick: (client) => console.log('Editar cliente:', client),
      tooltip: 'Editar cliente'
    },
    {
      action: 'delete',
      onClick: (client) => {
        if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
          console.log('Excluir cliente:', client);
        }
      },
      tooltip: 'Excluir cliente'
    }
  ];

  // Filtros disponíveis
  const filters = [
    { label: 'Todos', value: 'all' },
    { label: 'Ativos', value: 'active' },
    { label: 'Inativos', value: 'inactive' },
    { label: 'Premium', value: 'premium' },
    { label: 'Enterprise', value: 'enterprise' }
  ];

  // Ações do cabeçalho
  const headerActions = [
    {
      label: 'Novo Cliente',
      icon: UserPlus,
      onClick: () => console.log('Novo cliente'),
      variant: 'primary'
    }
  ];

  // Ações da barra de busca
  const searchActions = [
    {
      label: 'Exportar',
      icon: Download,
      onClick: () => console.log('Exportar clientes'),
      variant: 'secondary'
    }
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl shadow-lg">
          <p className="font-semibold">{error}</p>
          <button onClick={fetchClients} className="mt-2 underline font-medium hover:no-underline">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50'}`}>
      {/* Modern Page Header */}
      <ModernPageHeader
        title="Gestão de Clientes"
        subtitle="Gerencie todos os clientes cadastrados no sistema com ferramentas avançadas de análise e relacionamento"
        actions={headerActions}
        breadcrumb={['Dashboard', 'Gestão', 'Clientes']}
        theme={theme}
        gradient={true}
      />

      {/* Modern Stats Cards */}
      <ModernStatsCards stats={stats} theme={theme} />

      {/* Modern Search and Filter Bar */}
      <ModernSearchFilterBar
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar clientes por nome, email, empresa..."
        filters={filters}
        activeFilter={filterStatus}
        onFilterChange={setFilterStatus}
        actions={searchActions}
        theme={theme}
      />

      {/* Modern Data Table */}
      {loading ? (
        <ModernDataTable loading={true} theme={theme} />
      ) : filteredClients.length > 0 ? (
        <ModernDataTable
          columns={columns}
          data={filteredClients}
          actions={tableActions}
          onRowClick={(client) => console.log('Clique na linha:', client)}
          theme={theme}
        />
      ) : (
        <ModernEmptyState
          icon={Users}
          title="Nenhum cliente encontrado"
          description={searchTerm ? 
            "Não foram encontrados clientes que correspondam aos critérios de busca. Tente ajustar os filtros ou termos de busca." :
            "Você ainda não possui clientes cadastrados. Comece construindo sua base de clientes adicionando o primeiro cliente ao sistema."
          }
          action={!searchTerm ? {
            label: 'Adicionar Primeiro Cliente',
            icon: UserPlus,
            onClick: () => console.log('Adicionar cliente')
          } : null}
          theme={theme}
        />
      )}

      {/* Insights Section */}
      {filteredClients.length > 0 && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Clients */}
          <div className={`
            rounded-2xl backdrop-blur-sm shadow-lg border p-6
            ${theme === 'dark' 
              ? 'bg-gray-800/80 border-gray-700/50' 
              : 'bg-white/80 border-gray-200/50'
            }
          `}>
            <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              🏆 Principais Clientes
            </h3>
            <div className="space-y-3">
              {clients
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .slice(0, 3)
                .map((client, index) => (
                  <div key={client.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                        ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                          index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                          'bg-gradient-to-r from-amber-600 to-yellow-700'}
                      `}>
                        {index + 1}
                      </div>
                      <div>
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {client.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {client.company}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        R$ {client.totalRevenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {client.totalOrders} pedidos
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`
            rounded-2xl backdrop-blur-sm shadow-lg border p-6
            ${theme === 'dark' 
              ? 'bg-gray-800/80 border-gray-700/50' 
              : 'bg-white/80 border-gray-200/50'
            }
          `}>
            <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ⚡ Atividade Recente
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Novo cliente adicionado
                  </p>
                  <p className="text-sm text-gray-500">Ana Costa se cadastrou • há 2 horas</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Pedido concluído
                  </p>
                  <p className="text-sm text-gray-500">Carlos Mendes finalizou pedido • há 4 horas</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Avaliação recebida
                  </p>
                  <p className="text-sm text-gray-500">João Silva avaliou com 5 estrelas • há 1 dia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;