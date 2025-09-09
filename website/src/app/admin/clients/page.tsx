'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Search, 
  Filter,
  Plus,
  Eye, 
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Star,
  Building
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  totalOrders: number;
  totalRevenue: number;
  lastOrder: string;
  createdAt: string;
  isActive: boolean;
  rating: number;
  category: 'Standard' | 'Premium' | 'Enterprise';
}

export default function AdminClientsPage() {
  const { user, loading, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dataLoading, setDataLoading] = useState(true);

  // Redirecionar se não for admin autenticado
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  // Carregar clientes
  useEffect(() => {
    if (user && isAdmin) {
      loadClients();
    }
  }, [user, isAdmin]);

  // Filtrar clientes
  useEffect(() => {
    let filtered = clients;

    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => 
        statusFilter === 'active' ? client.isActive : !client.isActive
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(client => client.category === categoryFilter);
    }

    setFilteredClients(filtered);
  }, [clients, searchTerm, statusFilter, categoryFilter]);

  const loadClients = async () => {
    try {
      setDataLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados mockados expandidos
      const mockClients: Client[] = [
        {
          id: '1',
          name: 'João Silva',
          email: 'joao.silva@empresa.com',
          phone: '(11) 98765-4321',
          company: 'Green Solutions Ltda.',
          address: 'São Paulo, SP',
          totalOrders: 12,
          totalRevenue: 25500,
          lastOrder: '2024-03-10',
          createdAt: '2023-01-15',
          isActive: true,
          rating: 4.9,
          category: 'Premium'
        },
        {
          id: '2',
          name: 'Maria Santos',
          email: 'maria.santos@jardins.com',
          phone: '(21) 98765-1234',
          company: 'Jardins Tropicais Corp.',
          address: 'Rio de Janeiro, RJ',
          totalOrders: 8,
          totalRevenue: 18400,
          lastOrder: '2024-03-08',
          createdAt: '2023-02-20',
          isActive: true,
          rating: 4.7,
          category: 'Premium'
        },
        {
          id: '3',
          name: 'Pedro Oliveira',
          email: 'pedro@construtora.com',
          phone: '(31) 98765-5678',
          company: 'Construtora Verde Ltda.',
          address: 'Belo Horizonte, MG',
          totalOrders: 15,
          totalRevenue: 42800,
          lastOrder: '2024-02-28',
          createdAt: '2023-01-05',
          isActive: false,
          rating: 4.5,
          category: 'Enterprise'
        },
        {
          id: '4',
          name: 'Ana Costa',
          email: 'ana.costa@email.com',
          phone: '(47) 98765-9999',
          address: 'Florianópolis, SC',
          totalOrders: 3,
          totalRevenue: 4200,
          lastOrder: '2024-03-01',
          createdAt: '2024-01-10',
          isActive: true,
          rating: 4.2,
          category: 'Standard'
        }
      ];
      
      setClients(mockClients);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
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

  const getCategoryColor = (category: string) => {
    const colors = {
      'Standard': 'bg-gray-100 text-gray-800',
      'Premium': 'bg-blue-100 text-blue-800',
      'Enterprise': 'bg-purple-100 text-purple-800'
    };
    return colors[category as keyof typeof colors] || colors.Standard;
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleViewClient = (client: Client) => {
    console.log('Ver cliente:', client);
  };

  const handleEditClient = (client: Client) => {
    console.log('Editar cliente:', client);
  };

  const handleCreateClient = () => {
    console.log('Criar novo cliente');
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.isActive).length,
    totalRevenue: clients.reduce((sum, client) => sum + client.totalRevenue, 0),
    avgOrderValue: clients.reduce((sum, client) => sum + client.totalRevenue, 0) / 
                   clients.reduce((sum, client) => sum + client.totalOrders, 0) || 0
  };

  return (
    <AuthenticatedLayout user={user} onLogout={logout}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gerenciar Clientes</h1>
            <p className="text-gray-600">Gerencie sua base de clientes e relacionamentos</p>
          </div>
          
          <button
            onClick={handleCreateClient}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cliente</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total de Clientes</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Clientes Ativos</p>
                <p className="text-xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Receita Total</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Ticket Médio</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.avgOrderValue)}</p>
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
                  placeholder="Buscar por nome, email, empresa ou cidade..."
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
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
              
              <select
                className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Todas as categorias</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {clients.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum resultado encontrado'}
              </h3>
              <p className="text-gray-500">
                {clients.length === 0 
                  ? 'Comece criando seu primeiro cliente'
                  : 'Tente ajustar os filtros de busca'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estatísticas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-medium">
                              {client.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{client.name}</p>
                            {client.company && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Building className="w-3 h-3 mr-1" />
                                {client.company}
                              </div>
                            )}
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="w-3 h-3 mr-1" />
                              {client.address}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {client.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {client.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(client.category)}`}>
                            {client.category}
                          </span>
                          <div className="flex items-center">
                            {getRatingStars(client.rating)}
                            <span className="ml-1 text-sm text-gray-600">{client.rating}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="space-y-1">
                          <div>{client.totalOrders} pedidos</div>
                          <div className="font-medium text-green-600">
                            {formatCurrency(client.totalRevenue)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(client.lastOrder)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewClient(client)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClient(client)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}