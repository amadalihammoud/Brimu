import React, { useState, useEffect } from 'react';
import { FileText, Plus, Calendar, Clock, CheckCircle, AlertTriangle, TrendingUp, MapPin, User, Settings, Wrench } from 'lucide-react';
import { orderAPI } from '../../services/api';
import { useNotifications } from '../../components/NotificationSystem';
import { 
  ModernPageHeader, 
  ModernStatsCards, 
  ModernSearchFilterBar, 
  ModernDataTable, 
  ModernStatusBadge,
  ModernEmptyState
} from '../../components/common/ModernComponents';
import { StandardActionButton, StandardEntityIcon } from '../../components/common/IconStandards';
import OrderEquipmentSelector from '../../components/OrderEquipmentSelector';

const OrdersPage = ({ theme = 'light' }) => {
  // Estados
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { success, error: showError } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEquipmentSelector, setShowEquipmentSelector] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Simular delay para mostrar o loading moderno
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Dados mockados expandidos com mais detalhes
      const mockOrders = [
        {
          id: 1,
          orderNumber: 'OS-2024-001',
          client: { name: 'João Silva', email: 'joao@empresa.com', avatar: 'JS' },
          service: 'Poda de Árvores',
          description: 'Poda de manutenção em 5 árvores frutíferas',
          priority: 'high',
          scheduledDate: '2024-09-10',
          estimatedDuration: '4 horas',
          status: 'pending',
          createdAt: '2024-09-04',
          notes: 'Árvores com galhos secos',
          value: 1500,
          location: 'São Paulo, SP',
          equipment: ['Motosserra', 'Escada'],
          technician: 'Carlos Silva'
        },
        {
          id: 2,
          orderNumber: 'OS-2024-002',
          client: { name: 'Maria Santos', email: 'maria@jardins.com', avatar: 'MS' },
          service: 'Plantio de Mudas',
          description: 'Plantio de 10 mudas de ipê amarelo',
          priority: 'medium',
          scheduledDate: '2024-09-12',
          estimatedDuration: '2 horas',
          status: 'in_progress',
          createdAt: '2024-09-03',
          notes: 'Local com boa drenagem',
          value: 800,
          location: 'Rio de Janeiro, RJ',
          equipment: ['Pás', 'Adubo'],
          technician: 'Ana Costa'
        },
        {
          id: 3,
          orderNumber: 'OS-2024-003',
          client: { name: 'Pedro Costa', email: 'pedro@construtora.com', avatar: 'PC' },
          service: 'Remoção de Árvore',
          description: 'Remoção de árvore morta com risco de queda',
          priority: 'high',
          scheduledDate: '2024-09-15',
          estimatedDuration: '3 horas',
          status: 'completed',
          createdAt: '2024-09-02',
          notes: 'Árvore com risco de queda',
          value: 2200,
          location: 'Belo Horizonte, MG',
          equipment: ['Motosserra', 'Guindaste'],
          technician: 'Roberto Lima'
        },
        {
          id: 4,
          orderNumber: 'OS-2024-004',
          client: { name: 'Ana Costa', email: 'ana@residencial.com', avatar: 'AC' },
          service: 'Tratamento Fitossanitário',
          description: 'Aplicação de defensivos contra pragas',
          priority: 'medium',
          scheduledDate: '2024-09-08',
          estimatedDuration: '1 hora',
          status: 'cancelled',
          createdAt: '2024-09-01',
          notes: 'Cliente cancelou por mudança de planos',
          value: 450,
          location: 'Curitiba, PR',
          equipment: ['Pulverizador'],
          technician: 'José Santos'
        },
        {
          id: 5,
          orderNumber: 'OS-2024-005',
          client: { name: 'Carlos Mendes', email: 'carlos@shopping.com', avatar: 'CM' },
          service: 'Paisagismo Completo',
          description: 'Redesign completo do jardim principal',
          priority: 'low',
          scheduledDate: '2024-09-20',
          estimatedDuration: '8 horas',
          status: 'pending',
          createdAt: '2024-08-28',
          notes: 'Projeto de grande porte',
          value: 5800,
          location: 'Fortaleza, CE',
          equipment: ['Diversos'],
          technician: 'Equipe Completa'
        }
      ];
      
      setOrders(mockOrders);
    } catch (err) {
      setError('Erro ao carregar ordens');
      showError('Erro ao carregar ordens de serviço');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar ordens
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Função para gerenciar equipamentos
  const handleManageEquipment = (order) => {
    setSelectedOrder(order);
    setShowEquipmentSelector(true);
  };

  const handleEquipmentSuccess = () => {
    success('Equipamentos atribuídos com sucesso!');
    loadOrders(); // Recarregar dados
  };

  // Estatísticas aprimoradas
  const stats = [
    {
      label: 'Total de Ordens',
      value: orders.length.toLocaleString(),
      icon: FileText,
      iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600',
      iconColor: 'text-white',
      change: { type: 'increase', value: '+15%', period: 'este mês' }
    },
    {
      label: 'Em Andamento',
      value: orders.filter(o => o.status === 'in_progress').length.toLocaleString(),
      icon: Clock,
      iconBg: 'bg-gradient-to-br from-orange-400 to-yellow-600',
      iconColor: 'text-white',
      change: { type: 'increase', value: '+5%', period: 'esta semana' }
    },
    {
      label: 'Concluídas',
      value: orders.filter(o => o.status === 'completed').length.toLocaleString(),
      icon: CheckCircle,
      iconBg: 'bg-gradient-to-br from-emerald-400 to-green-600',
      iconColor: 'text-white',
      change: { type: 'increase', value: '+22%', period: 'este mês' }
    },
    {
      label: 'Faturamento',
      value: `R$ ${orders.reduce((sum, o) => sum + (o.value || 0), 0).toLocaleString()}`,
      icon: TrendingUp,
      iconBg: 'bg-gradient-to-br from-purple-400 to-pink-600',
      iconColor: 'text-white',
      change: { type: 'increase', value: '+28%', period: 'este mês' }
    }
  ];

  // Configurações das colunas da tabela
  const columns = [
    {
      key: 'orderNumber',
      label: 'Ordem de Serviço',
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg
            ${row.priority === 'high' ? 'bg-gradient-to-br from-red-400 to-pink-600' :
              row.priority === 'medium' ? 'bg-gradient-to-br from-yellow-400 to-orange-600' :
              'bg-gradient-to-br from-gray-400 to-gray-600'
            }
          `}>
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {new Date(row.createdAt).toLocaleDateString('pt-BR')}
            </p>
            <ModernStatusBadge status={row.priority} size="xs" />
          </div>
        </div>
      )
    },
    {
      key: 'client',
      label: 'Cliente',
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {value.avatar}
          </div>
          <div>
            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {value.name}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {value.email}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'service',
      label: 'Serviço',
      render: (value, row) => (
        <div>
          <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
            {row.description}
          </p>
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="w-3 h-3 mr-1" />
            {row.location}
          </div>
        </div>
      )
    },
    {
      key: 'scheduledDate',
      label: 'Agendamento',
      render: (value, row) => (
        <div>
          <div className="flex items-center mb-1">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {new Date(value).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            {row.estimatedDuration}
          </div>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <User className="w-3 h-3 mr-1" />
            {row.technician}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <ModernStatusBadge status={value} />
    },
    {
      key: 'value',
      label: 'Valor',
      render: (value) => (
        <div className="text-right">
          <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">
            R$ {value.toLocaleString()}
          </p>
        </div>
      )
    }
  ];

  // Ações da tabela padronizadas
  const tableActions = [
    {
      action: 'view',
      onClick: (order) => console.log('Ver ordem:', order),
      tooltip: 'Visualizar ordem'
    },
    {
      action: 'edit',
      onClick: (order) => console.log('Editar ordem:', order),
      tooltip: 'Editar ordem'
    },
    {
      action: 'custom',
      icon: Wrench,
      onClick: (order) => handleManageEquipment(order),
      tooltip: 'Gerenciar equipamentos',
      color: 'text-blue-600 hover:text-blue-800'
    },
    {
      action: 'delete',
      onClick: (order) => {
        if (window.confirm('Tem certeza que deseja excluir esta ordem?')) {
          console.log('Excluir ordem:', order);
        }
      },
      tooltip: 'Excluir ordem'
    }
  ];

  // Filtros disponíveis
  const filters = [
    { label: 'Todas', value: 'all' },
    { label: 'Pendentes', value: 'pending' },
    { label: 'Em Andamento', value: 'in_progress' },
    { label: 'Concluídas', value: 'completed' },
    { label: 'Canceladas', value: 'cancelled' }
  ];

  // Ações do cabeçalho
  const headerActions = [
    {
      label: 'Nova Ordem',
      icon: Plus,
      onClick: () => console.log('Nova ordem'),
      variant: 'primary'
    }
  ];

  // Ações da barra de busca
  const searchActions = [
    {
      label: 'Exportar',
      icon: Calendar,
      onClick: () => console.log('Exportar ordens'),
      variant: 'secondary'
    }
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl shadow-lg">
          <p className="font-semibold">{error}</p>
          <button onClick={loadOrders} className="mt-2 underline font-medium hover:no-underline">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50'}`}>
      {/* Modern Page Header */}
      <ModernPageHeader
        title="Ordens de Serviço"
        subtitle="Gerencie e acompanhe todas as ordens de serviço com ferramentas avançadas de controle e monitoramento"
        actions={headerActions}
        breadcrumb={['Dashboard', 'Operações', 'Ordens de Serviço']}
        theme={theme}
        gradient={true}
      />

      {/* Modern Stats Cards */}
      <ModernStatsCards stats={stats} theme={theme} />

      {/* Modern Search and Filter Bar */}
      <ModernSearchFilterBar
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar por número, cliente, serviço ou localização..."
        filters={filters}
        activeFilter={filterStatus}
        onFilterChange={setFilterStatus}
        actions={searchActions}
        theme={theme}
      />

      {/* Modern Data Table */}
      {loading ? (
        <ModernDataTable loading={true} theme={theme} />
      ) : filteredOrders.length > 0 ? (
        <ModernDataTable
          columns={columns}
          data={filteredOrders}
          actions={tableActions}
          onRowClick={(order) => console.log('Clique na linha:', order)}
          theme={theme}
        />
      ) : (
        <ModernEmptyState
          icon={FileText}
          title="Nenhuma ordem encontrada"
          description={searchTerm ? 
            "Não foram encontradas ordens que correspondam aos critérios de busca. Tente ajustar os filtros ou termos de busca." :
            "Você ainda não possui ordens de serviço. Comece criando sua primeira ordem para organizar o trabalho da equipe."
          }
          action={!searchTerm ? {
            label: 'Criar Primeira Ordem',
            icon: Plus,
            onClick: () => console.log('Criar ordem')
          } : null}
          theme={theme}
        />
      )}

      {/* Analytics Dashboard */}
      {filteredOrders.length > 0 && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Priority Distribution */}
          <div className={`
            rounded-2xl backdrop-blur-sm shadow-lg border p-6
            ${theme === 'dark' 
              ? 'bg-gray-800/80 border-gray-700/50' 
              : 'bg-white/80 border-gray-200/50'
            }
          `}>
            <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              🎯 Distribuição por Prioridade
            </h3>
            <div className="space-y-3">
              {['high', 'medium', 'low'].map((priority) => {
                const count = orders.filter(o => o.priority === priority).length;
                const percentage = ((count / orders.length) * 100).toFixed(1);
                return (
                  <div key={priority} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ModernStatusBadge status={priority} size="xs" />
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {priority === 'high' ? 'Alta' : priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{count}</span>
                      <span className="text-sm text-gray-500 ml-2">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Overview */}
          <div className={`
            rounded-2xl backdrop-blur-sm shadow-lg border p-6
            ${theme === 'dark' 
              ? 'bg-gray-800/80 border-gray-700/50' 
              : 'bg-white/80 border-gray-200/50'
            }
          `}>
            <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              📊 Status das Ordens
            </h3>
            <div className="space-y-3">
              {['pending', 'in_progress', 'completed', 'cancelled'].map((status) => {
                const count = orders.filter(o => o.status === status).length;
                return (
                  <div key={status} className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                    <div className="flex items-center space-x-3">
                      <ModernStatusBadge status={status} size="xs" />
                    </div>
                    <span className={`font-bold text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Services */}
          <div className={`
            rounded-2xl backdrop-blur-sm shadow-lg border p-6
            ${theme === 'dark' 
              ? 'bg-gray-800/80 border-gray-700/50' 
              : 'bg-white/80 border-gray-200/50'
            }
          `}>
            <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              🔧 Serviços Principais
            </h3>
            <div className="space-y-3">
              {Array.from(new Set(orders.map(o => o.service)))
                .slice(0, 4)
                .map((service, index) => {
                  const count = orders.filter(o => o.service === service).length;
                  const revenue = orders
                    .filter(o => o.service === service)
                    .reduce((sum, o) => sum + o.value, 0);
                  
                  return (
                    <div key={service} className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                      <div>
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {service}
                        </p>
                        <p className="text-sm text-gray-500">{count} ordens</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          R$ {revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Equipment Selector Modal */}
      {showEquipmentSelector && selectedOrder && (
        <OrderEquipmentSelector
          order={selectedOrder}
          onClose={() => {
            setShowEquipmentSelector(false);
            setSelectedOrder(null);
          }}
          onSuccess={handleEquipmentSuccess}
        />
      )}
    </div>
  );
};

export default OrdersPage;