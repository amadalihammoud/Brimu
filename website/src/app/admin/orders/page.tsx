'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Search, 
  Plus,
  Eye, 
  Edit,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Phone,
  Wrench,
  Truck,
  TrendingUp,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

interface Order {
  id: string;
  client: {
    name: string;
    email: string;
    phone: string;
  };
  service: string;
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado' | 'pausado';
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: string;
  address: string;
  technician?: {
    name: string;
    phone: string;
  };
  description?: string;
  createdAt: string;
  value: number;
}

export default function AdminOrdersPage() {
  const { user, loading, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [dataLoading, setDataLoading] = useState(true);

  // Redirecionar se não for admin autenticado
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  // Carregar ordens
  useEffect(() => {
    if (user && isAdmin) {
      loadOrders();
    }
  }, [user, isAdmin]);

  // Filtrar ordens
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(order => order.priority === priorityFilter);
    }

    if (dateFilter !== 'all') {
      const today = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.scheduledDate);
        const diffTime = orderDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'today':
            return diffDays === 0;
          case 'tomorrow':
            return diffDays === 1;
          case 'week':
            return diffDays >= 0 && diffDays <= 7;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, priorityFilter, dateFilter]);

  const loadOrders = async () => {
    try {
      setDataLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados mockados expandidos
      const mockOrders: Order[] = [
        {
          id: 'ORD2024001',
          client: {
            name: 'João Silva',
            email: 'joao.silva@empresa.com',
            phone: '(11) 98765-4321'
          },
          service: 'Poda de Árvore',
          status: 'agendado',
          priority: 'alta',
          scheduledDate: '2024-03-18',
          scheduledTime: '09:00',
          estimatedDuration: '4 horas',
          address: 'Rua das Flores, 123 - Jardim Botânico, São Paulo/SP',
          technician: {
            name: 'Carlos Santos',
            phone: '(11) 99999-9999'
          },
          description: 'Poda técnica de árvore de grande porte no jardim frontal com remoção de galhos secos',
          createdAt: '2024-03-10',
          value: 500
        },
        {
          id: 'ORD2024002',
          client: {
            name: 'Maria Santos',
            email: 'maria@jardins.com',
            phone: '(21) 98765-1234'
          },
          service: 'Plantio de Mudas',
          status: 'em_andamento',
          priority: 'media',
          scheduledDate: '2024-03-15',
          scheduledTime: '14:00',
          estimatedDuration: '6 horas',
          address: 'Av. Central, 456 - Centro, Rio de Janeiro/RJ',
          technician: {
            name: 'Ana Costa',
            phone: '(21) 88888-8888'
          },
          description: 'Plantio de 20 mudas nativas no jardim empresarial com sistema de irrigação',
          createdAt: '2024-03-05',
          value: 1200
        },
        {
          id: 'ORD2024003',
          client: {
            name: 'Pedro Oliveira',
            email: 'pedro@construtora.com',
            phone: '(31) 98765-5678'
          },
          service: 'Remoção de Árvore',
          status: 'concluido',
          priority: 'urgente',
          scheduledDate: '2024-03-01',
          scheduledTime: '08:00',
          estimatedDuration: '8 horas',
          address: 'Rua das Palmeiras, 789 - Vila Verde, Belo Horizonte/MG',
          technician: {
            name: 'Roberto Lima',
            phone: '(31) 77777-7777'
          },
          description: 'Remoção emergencial de árvore com risco iminente de queda sobre residência',
          createdAt: '2024-02-20',
          value: 1800
        },
        {
          id: 'ORD2024004',
          client: {
            name: 'Ana Costa',
            email: 'ana.costa@email.com',
            phone: '(47) 98765-9999'
          },
          service: 'Manutenção de Jardim',
          status: 'pausado',
          priority: 'baixa',
          scheduledDate: '2024-03-20',
          scheduledTime: '10:00',
          estimatedDuration: '3 horas',
          address: 'Rua Verde, 321 - Centro, Florianópolis/SC',
          description: 'Manutenção mensal do jardim residencial com poda de arbustos',
          createdAt: '2024-03-08',
          value: 300
        },
        {
          id: 'ORD2024005',
          client: {
            name: 'Carlos Mendes',
            email: 'carlos@loja.com',
            phone: '(85) 98765-1111'
          },
          service: 'Consultoria Paisagística',
          status: 'cancelado',
          priority: 'media',
          scheduledDate: '2024-03-22',
          scheduledTime: '16:00',
          estimatedDuration: '2 horas',
          address: 'Shopping Center, Loja 45 - Fortaleza/CE',
          description: 'Consultoria para projeto de paisagismo em área comercial',
          createdAt: '2024-03-12',
          value: 400
        }
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Erro ao carregar ordens:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (date: string, time: string) => {
    return `${formatDate(date)} às ${time}`;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      agendado: {
        label: 'Agendado',
        color: 'bg-blue-100 text-blue-800',
        icon: <Clock className="w-4 h-4" />
      },
      em_andamento: {
        label: 'Em Andamento',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Wrench className="w-4 h-4" />
      },
      concluido: {
        label: 'Concluído',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-4 h-4" />
      },
      pausado: {
        label: 'Pausado',
        color: 'bg-orange-100 text-orange-800',
        icon: <AlertTriangle className="w-4 h-4" />
      },
      cancelado: {
        label: 'Cancelado',
        color: 'bg-red-100 text-red-800',
        icon: <AlertTriangle className="w-4 h-4" />
      }
    };
    
    return configs[status as keyof typeof configs] || configs.agendado;
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      baixa: {
        label: 'Baixa',
        color: 'bg-gray-100 text-gray-600'
      },
      media: {
        label: 'Média',
        color: 'bg-blue-100 text-blue-600'
      },
      alta: {
        label: 'Alta',
        color: 'bg-orange-100 text-orange-600'
      },
      urgente: {
        label: 'Urgente',
        color: 'bg-red-100 text-red-600'
      }
    };
    
    return configs[priority as keyof typeof configs] || configs.media;
  };

  const handleViewOrder = (order: Order) => {
    console.log('Ver ordem:', order);
  };

  const handleEditOrder = (order: Order) => {
    console.log('Editar ordem:', order);
  };

  const handleCreateOrder = () => {
    console.log('Criar nova ordem');
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando ordens de serviço...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const stats = {
    total: orders.length,
    scheduled: orders.filter(o => o.status === 'agendado').length,
    inProgress: orders.filter(o => o.status === 'em_andamento').length,
    completed: orders.filter(o => o.status === 'concluido').length,
    totalValue: orders.reduce((sum, order) => sum + order.value, 0)
  };

  return (
    <AuthenticatedLayout user={user} onLogout={logout}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gerenciar Ordens de Serviço</h1>
            <p className="text-gray-600">Controle e acompanhe todos os serviços em execução</p>
          </div>
          
          <button
            onClick={handleCreateOrder}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Ordem</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Agendados</p>
                <p className="text-xl font-bold text-gray-900">{stats.scheduled}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Wrench className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Concluídos</p>
                <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, serviço, código ou endereço..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos os status</option>
                <option value="agendado">Agendado</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
                <option value="pausado">Pausado</option>
                <option value="cancelado">Cancelado</option>
              </select>
              
              <select
                className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">Todas as prioridades</option>
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
              
              <select
                className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">Todas as datas</option>
                <option value="today">Hoje</option>
                <option value="tomorrow">Amanhã</option>
                <option value="week">Esta semana</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {orders.length === 0 ? 'Nenhuma ordem criada' : 'Nenhum resultado encontrado'}
              </h3>
              <p className="text-gray-500">
                {orders.length === 0 
                  ? 'Comece criando sua primeira ordem de serviço'
                  : 'Tente ajustar os filtros de busca'
                }
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const priorityConfig = getPriorityConfig(order.priority);
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{order.service}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.icon}
                            <span className="ml-1">{statusConfig.label}</span>
                          </span>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                            {priorityConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Ordem #{order.id} • {formatCurrency(order.value)}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                          title="Ver detalhes"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {/* Client Info */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Cliente
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="font-medium">{order.client.name}</p>
                          <p>{order.client.email}</p>
                          <p className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {order.client.phone}
                          </p>
                        </div>
                      </div>

                      {/* Schedule Info */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Agendamento
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{formatDateTime(order.scheduledDate, order.scheduledTime)}</p>
                          <p>Duração estimada: {order.estimatedDuration}</p>
                        </div>
                      </div>

                      {/* Technician Info */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <Truck className="w-4 h-4 mr-2" />
                          Técnico
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          {order.technician ? (
                            <>
                              <p className="font-medium">{order.technician.name}</p>
                              <p className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {order.technician.phone}
                              </p>
                            </>
                          ) : (
                            <p className="text-gray-400">Não atribuído</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="mb-4">
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{order.address}</span>
                      </div>
                    </div>

                    {/* Description */}
                    {order.description && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-600">
                          <strong>Descrição:</strong> {order.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}