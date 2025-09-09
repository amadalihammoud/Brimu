'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Search, 
  Plus,
  Eye, 
  Edit,
  Download,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  TrendingUp,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

interface Quote {
  id: string;
  client: {
    name: string;
    email: string;
    company?: string;
  };
  service: string;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado' | 'expirado';
  totalValue: number;
  createdAt: string;
  validUntil: string;
  description?: string;
  daysToExpire: number;
}

export default function AdminQuotesPage() {
  const { user, loading, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [dataLoading, setDataLoading] = useState(true);

  // Redirecionar se não for admin autenticado
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  // Carregar orçamentos
  useEffect(() => {
    if (user && isAdmin) {
      loadQuotes();
    }
  }, [user, isAdmin]);

  // Filtrar orçamentos
  useEffect(() => {
    let filtered = quotes;

    if (searchTerm) {
      filtered = filtered.filter(quote => 
        quote.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    if (periodFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(quote => {
        const createdDate = new Date(quote.createdAt);
        const diffTime = Math.abs(now.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (periodFilter) {
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          case 'quarter':
            return diffDays <= 90;
          default:
            return true;
        }
      });
    }

    setFilteredQuotes(filtered);
  }, [quotes, searchTerm, statusFilter, periodFilter]);

  const loadQuotes = async () => {
    try {
      setDataLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados mockados expandidos
      const mockQuotes: Quote[] = [
        {
          id: 'COT2024001',
          client: {
            name: 'João Silva',
            email: 'joao.silva@empresa.com',
            company: 'Green Solutions Ltda.'
          },
          service: 'Poda de Árvore',
          status: 'enviado',
          totalValue: 500,
          createdAt: '2024-03-10',
          validUntil: '2024-03-25',
          description: 'Poda técnica de árvore de grande porte no jardim frontal',
          daysToExpire: 5
        },
        {
          id: 'COT2024002',
          client: {
            name: 'Maria Santos',
            email: 'maria.santos@jardins.com',
            company: 'Jardins Tropicais'
          },
          service: 'Remoção de Árvore',
          status: 'aprovado',
          totalValue: 1200,
          createdAt: '2024-03-08',
          validUntil: '2024-03-30',
          description: 'Remoção segura de árvore com risco de queda',
          daysToExpire: 10
        },
        {
          id: 'COT2024003',
          client: {
            name: 'Pedro Oliveira',
            email: 'pedro@construtora.com',
            company: 'Construtora Verde'
          },
          service: 'Manutenção de Jardim',
          status: 'rejeitado',
          totalValue: 800,
          createdAt: '2024-03-05',
          validUntil: '2024-03-20',
          description: 'Manutenção mensal completa do jardim empresarial',
          daysToExpire: 0
        },
        {
          id: 'COT2024004',
          client: {
            name: 'Ana Costa',
            email: 'ana.costa@email.com'
          },
          service: 'Plantio de Mudas',
          status: 'rascunho',
          totalValue: 650,
          createdAt: '2024-03-12',
          validUntil: '2024-03-27',
          description: 'Plantio de 15 mudas nativas no quintal residencial',
          daysToExpire: 7
        },
        {
          id: 'COT2024005',
          client: {
            name: 'Carlos Mendes',
            email: 'carlos@loja.com',
            company: 'Loja Verde'
          },
          service: 'Consultoria Paisagística',
          status: 'expirado',
          totalValue: 300,
          createdAt: '2024-02-20',
          validUntil: '2024-03-06',
          description: 'Consultoria para projeto de paisagismo comercial',
          daysToExpire: -4
        }
      ];
      
      setQuotes(mockQuotes);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
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

  const getStatusConfig = (status: string) => {
    const configs = {
      rascunho: {
        label: 'Rascunho',
        color: 'bg-gray-100 text-gray-800',
        icon: <Edit className="w-4 h-4" />
      },
      enviado: {
        label: 'Enviado',
        color: 'bg-blue-100 text-blue-800',
        icon: <Clock className="w-4 h-4" />
      },
      aprovado: {
        label: 'Aprovado',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-4 h-4" />
      },
      rejeitado: {
        label: 'Rejeitado',
        color: 'bg-red-100 text-red-800',
        icon: <XCircle className="w-4 h-4" />
      },
      expirado: {
        label: 'Expirado',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <AlertTriangle className="w-4 h-4" />
      }
    };
    
    return configs[status as keyof typeof configs] || configs.enviado;
  };

  const getUrgencyColor = (daysToExpire: number) => {
    if (daysToExpire < 0) return 'text-red-600';
    if (daysToExpire <= 2) return 'text-orange-600';
    if (daysToExpire <= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleViewQuote = (quote: Quote) => {
    console.log('Ver orçamento:', quote);
  };

  const handleEditQuote = (quote: Quote) => {
    console.log('Editar orçamento:', quote);
  };

  const handleDownloadQuote = (quote: Quote) => {
    console.log('Download PDF:', quote);
  };

  const handleCreateQuote = () => {
    console.log('Criar novo orçamento');
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando orçamentos...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const stats = {
    total: quotes.length,
    sent: quotes.filter(q => q.status === 'enviado').length,
    approved: quotes.filter(q => q.status === 'aprovado').length,
    totalValue: quotes.reduce((sum, quote) => sum + quote.totalValue, 0),
    approvalRate: quotes.length > 0 ? (quotes.filter(q => q.status === 'aprovado').length / quotes.length * 100).toFixed(1) : '0'
  };

  return (
    <AuthenticatedLayout user={user} onLogout={logout}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gerenciar Orçamentos</h1>
            <p className="text-gray-600">Controle todos os orçamentos da empresa</p>
          </div>
          
          <button
            onClick={handleCreateQuote}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Orçamento</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-500 mr-3" />
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
                <p className="text-sm text-gray-600">Enviados</p>
                <p className="text-xl font-bold text-gray-900">{stats.sent}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Aprovados</p>
                <p className="text-xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Taxa Aprovação</p>
                <p className="text-xl font-bold text-gray-900">{stats.approvalRate}%</p>
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
                  placeholder="Buscar por cliente, serviço ou código..."
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
                <option value="rascunho">Rascunho</option>
                <option value="enviado">Enviado</option>
                <option value="aprovado">Aprovado</option>
                <option value="rejeitado">Rejeitado</option>
                <option value="expirado">Expirado</option>
              </select>
              
              <select
                className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
              >
                <option value="all">Todos os períodos</option>
                <option value="week">Última semana</option>
                <option value="month">Último mês</option>
                <option value="quarter">Último trimestre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quotes Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {quotes.length === 0 ? 'Nenhum orçamento criado' : 'Nenhum resultado encontrado'}
              </h3>
              <p className="text-gray-500">
                {quotes.length === 0 
                  ? 'Comece criando seu primeiro orçamento'
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
                      Orçamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuotes.map((quote) => {
                    const statusConfig = getStatusConfig(quote.status);
                    
                    return (
                      <tr key={quote.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{quote.id}</p>
                            <p className="text-sm text-gray-600">{quote.service}</p>
                            {quote.description && (
                              <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{quote.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{quote.client.name}</p>
                            <p className="text-sm text-gray-600">{quote.client.email}</p>
                            {quote.client.company && (
                              <p className="text-xs text-gray-500">{quote.client.company}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.icon}
                            <span className="ml-1">{statusConfig.label}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {formatCurrency(quote.totalValue)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div>
                            <p className="text-gray-600">{formatDate(quote.validUntil)}</p>
                            <p className={`text-xs font-medium ${getUrgencyColor(quote.daysToExpire)}`}>
                              {quote.daysToExpire < 0 
                                ? `Expirado há ${Math.abs(quote.daysToExpire)} dias`
                                : quote.daysToExpire === 0 
                                  ? 'Expira hoje'
                                  : `${quote.daysToExpire} dias restantes`
                              }
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewQuote(quote)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Ver detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditQuote(quote)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadQuote(quote)}
                              className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}