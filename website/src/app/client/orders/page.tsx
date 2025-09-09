'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Search, 
  Eye, 
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Phone,
  Wrench
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

interface Order {
  id: string;
  service: string;
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  technician?: {
    name: string;
    phone: string;
  };
  description?: string;
  createdAt: string;
}

export default function ClientOrdersPage() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dataLoading, setDataLoading] = useState(true);

  // Redirecionar se não estiver autenticado ou se for admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role === 'admin')) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, user, router]);

  // Carregar ordens
  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  // Filtrar ordens
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      setDataLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados mockados
      const mockOrders: Order[] = [
        {
          id: 'ORD2024001',
          service: 'Poda de Árvore',
          status: 'agendado',
          scheduledDate: '2024-03-18',
          scheduledTime: '09:00',
          address: 'Rua das Flores, 123 - Jardim Botânico',
          technician: {
            name: 'João Silva',
            phone: '(11) 99999-9999'
          },
          description: 'Poda técnica de árvore de grande porte no jardim frontal',
          createdAt: '2024-03-10'
        },
        {
          id: 'ORD2024002',
          service: 'Plantio de Mudas',
          status: 'em_andamento',
          scheduledDate: '2024-03-15',
          scheduledTime: '14:00',
          address: 'Av. Central, 456 - Centro',
          technician: {
            name: 'Maria Santos',
            phone: '(11) 88888-8888'
          },
          description: 'Plantio de 10 mudas nativas no quintal',
          createdAt: '2024-03-05'
        },
        {
          id: 'ORD2024003',
          service: 'Remoção de Árvore',
          status: 'concluido',
          scheduledDate: '2024-03-01',
          scheduledTime: '08:00',
          address: 'Rua das Palmeiras, 789 - Vila Verde',
          technician: {
            name: 'Pedro Oliveira',
            phone: '(11) 77777-7777'
          },
          description: 'Remoção segura de árvore com risco de queda',
          createdAt: '2024-02-20'
        }
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Erro ao carregar ordens:', error);
    } finally {
      setDataLoading(false);
    }
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
      cancelado: {
        label: 'Cancelado',
        color: 'bg-red-100 text-red-800',
        icon: <AlertTriangle className="w-4 h-4" />
      }
    };
    
    return configs[status as keyof typeof configs] || configs.agendado;
  };

  const handleViewOrder = (order: Order) => {
    // Implementar visualização da ordem
    console.log('Ver ordem:', order);
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

  if (!user) {
    return null;
  }

  return (
    <AuthenticatedLayout user={user} onLogout={logout}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Minhas Ordens de Serviço</h1>
          <p className="text-gray-600">Acompanhe o andamento dos seus serviços contratados</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Agendados</p>
                <p className="text-xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'agendado').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Wrench className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'em_andamento').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Concluídos</p>
                <p className="text-xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'concluido').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por serviço, código ou endereço..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <select
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos os status</option>
                <option value="agendado">Agendado</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
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
                {orders.length === 0 ? 'Nenhuma ordem encontrada' : 'Nenhum resultado'}
              </h3>
              <p className="text-gray-500">
                {orders.length === 0 
                  ? 'Você ainda não possui ordens de serviço'
                  : 'Tente ajustar os filtros de busca'
                }
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{order.service}</h3>
                        <p className="text-sm text-gray-600">Ordem #{order.id}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          {statusConfig.icon}
                          <span className="ml-1">{statusConfig.label}</span>
                        </span>
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Ver detalhes"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDateTime(order.scheduledDate, order.scheduledTime)}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{order.address}</span>
                        </div>
                      </div>

                      {order.technician && (
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-2" />
                            <span>Técnico: {order.technician.name}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{order.technician.phone}</span>
                          </div>
                        </div>
                      )}
                    </div>

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