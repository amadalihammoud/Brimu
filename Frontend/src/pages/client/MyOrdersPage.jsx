import React, { useState } from 'react';
import { FileText, Eye, Clock, CheckCircle, Calendar, DollarSign, TrendingUp, User } from 'lucide-react';
import { 
  PageHeader, 
  StatsCards, 
  SearchFilterBar, 
  DataTable, 
  StatusBadge,
  EmptyState
} from '../../components/common/StandardComponents';

const MyOrdersPage = ({ user, theme = 'light' }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Dados mockados específicos do cliente (filtrados por cliente logado)
  const orders = [
    {
      id: 1,
      orderNumber: 'ORD-2024-001',
      service: 'Poda de Árvores',
      description: 'Poda de 5 árvores frutíferas no jardim frontal',
      status: 'em_andamento',
      progress: 60,
      scheduledDate: '2024-03-15',
      scheduledTime: '09:00',
      totalValue: 2500,
      createdAt: '2024-03-10',
      assignedTo: 'João Silva',
      phone: '(11) 99999-9999',
      address: 'Rua das Flores, 123 - Jardim das Américas',
      timeline: [
        { step: 'Solicitação', date: '2024-03-10', completed: true },
        { step: 'Orçamento Aprovado', date: '2024-03-12', completed: true },
        { step: 'Agendamento', date: '2024-03-15', completed: true },
        { step: 'Execução', date: '2024-03-15', completed: false },
        { step: 'Finalização', date: '2024-03-15', completed: false }
      ]
    },
    {
      id: 2,
      orderNumber: 'ORD-2024-002',
      service: 'Remoção de Árvore',
      description: 'Remoção de árvore seca no quintal',
      status: 'pendente',
      progress: 20,
      scheduledDate: '2024-03-20',
      scheduledTime: '14:00',
      totalValue: 1800,
      createdAt: '2024-03-12',
      assignedTo: 'Maria Santos',
      phone: '(11) 88888-8888',
      address: 'Rua das Flores, 123 - Jardim das Américas',
      timeline: [
        { step: 'Solicitação', date: '2024-03-12', completed: true },
        { step: 'Orçamento Aprovado', date: '2024-03-14', completed: true },
        { step: 'Agendamento', date: '2024-03-20', completed: false },
        { step: 'Execução', date: '2024-03-20', completed: false },
        { step: 'Finalização', date: '2024-03-20', completed: false }
      ]
    },
    {
      id: 3,
      orderNumber: 'ORD-2024-003',
      service: 'Plantio de Mudas',
      description: 'Plantio de 10 mudas de árvores nativas',
      status: 'concluido',
      progress: 100,
      scheduledDate: '2024-03-08',
      scheduledTime: '10:00',
      totalValue: 1200,
      createdAt: '2024-03-05',
      assignedTo: 'Pedro Costa',
      phone: '(11) 77777-7777',
      address: 'Rua das Flores, 123 - Jardim das Américas',
      timeline: [
        { step: 'Solicitação', date: '2024-03-05', completed: true },
        { step: 'Orçamento Aprovado', date: '2024-03-06', completed: true },
        { step: 'Agendamento', date: '2024-03-08', completed: true },
        { step: 'Execução', date: '2024-03-08', completed: true },
        { step: 'Finalização', date: '2024-03-08', completed: true }
      ]
    }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Estatísticas
  const stats = [
    {
      label: 'Total de Ordens',
      value: orders.length,
      icon: FileText,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Em Andamento',
      value: orders.filter(o => o.status === 'em_andamento').length,
      icon: Clock,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      label: 'Concluídas',
      value: orders.filter(o => o.status === 'concluido').length,
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      label: 'Valor Total',
      value: formatCurrency(orders.reduce((sum, o) => sum + o.totalValue, 0)),
      icon: DollarSign,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  // Configurações das colunas da tabela
  const columns = [
    {
      key: 'orderNumber',
      label: 'Número',
      render: (value, row) => (
        <div>
          <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {new Date(row.createdAt).toLocaleDateString()}
          </p>
        </div>
      )
    },
    {
      key: 'service',
      label: 'Serviço',
      render: (value, row) => (
        <div>
          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {row.description}
          </p>
        </div>
      )
    },
    {
      key: 'scheduledDate',
      label: 'Data Agendada',
      render: (value, row) => (
        <div>
          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {new Date(value).toLocaleDateString()}
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {row.scheduledTime}
          </p>
        </div>
      )
    },
    {
      key: 'assignedTo',
      label: 'Responsável',
      render: (value) => (
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center mr-2`}>
            <User className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>
          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => (
        <div>
          <StatusBadge status={value} />
          <div className={`mt-1 w-full bg-gray-200 rounded-full h-1.5`}>
            <div 
              className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${row.progress}%` }}
            ></div>
          </div>
        </div>
      )
    },
    {
      key: 'totalValue',
      label: 'Valor',
      render: (value) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(value)}
        </span>
      )
    }
  ];

  // Ações da tabela
  const tableActions = [
    {
      icon: Eye,
      onClick: (order) => console.log('Ver detalhes da ordem:', order),
      tooltip: 'Ver detalhes'
    }
  ];

  // Filtros disponíveis
  const filters = [
    { label: 'Todas', value: 'all' },
    { label: 'Pendentes', value: 'pendente' },
    { label: 'Em Andamento', value: 'em_andamento' },
    { label: 'Concluídas', value: 'concluido' }
  ];

  return (
    <div className={`p-6 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Page Header */}
      <PageHeader
        title="Minhas Ordens de Serviço"
        subtitle="Acompanhe o andamento dos seus serviços contratados"
        breadcrumb={['Cliente', 'Ordens']}
        theme={theme}
      />

      {/* Stats Cards */}
      <StatsCards stats={stats} theme={theme} />

      {/* Search and Filter Bar */}
      <SearchFilterBar
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar por número da ordem ou tipo de serviço..."
        filters={filters}
        activeFilter={filterStatus}
        onFilterChange={setFilterStatus}
        theme={theme}
      />

      {/* Data Table */}
      {filteredOrders.length > 0 ? (
        <DataTable
          columns={columns}
          data={filteredOrders}
          actions={tableActions}
          onRowClick={(order) => console.log('Clique na linha:', order)}
          theme={theme}
        />
      ) : (
        <EmptyState
          icon={FileText}
          title="Nenhuma ordem encontrada"
          description={searchTerm ? 
            "Não foram encontradas ordens que correspondam aos seus critérios de busca." :
            "Você ainda não possui ordens de serviço. Entre em contato conosco para solicitar um serviço."
          }
          theme={theme}
        />
      )}

      {/* Timeline Card - Mostrar apenas se houver ordens */}
      {filteredOrders.length > 0 && (
        <div className={`
          mt-8 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
          rounded-xl shadow-sm border p-6
        `}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Última Atualização
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Ordem ORD-2024-001 em andamento
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Equipe iniciou o serviço de poda às 09:00
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                  há 2 horas
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;