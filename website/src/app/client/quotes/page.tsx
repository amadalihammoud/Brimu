'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Search, 
  Eye, 
  Download, 
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

interface Quote {
  id: string;
  service: string;
  status: 'enviado' | 'aprovado' | 'rejeitado' | 'expirado';
  totalValue: number;
  createdAt: string;
  validUntil: string;
  description?: string;
}

export default function ClientQuotesPage() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dataLoading, setDataLoading] = useState(true);

  // Redirecionar se não estiver autenticado ou se for admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role === 'admin')) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, user, router]);

  // Carregar orçamentos
  useEffect(() => {
    if (user) {
      loadQuotes();
    }
  }, [user]);

  // Filtrar orçamentos
  useEffect(() => {
    let filtered = quotes;

    if (searchTerm) {
      filtered = filtered.filter(quote => 
        quote.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    setFilteredQuotes(filtered);
  }, [quotes, searchTerm, statusFilter]);

  const loadQuotes = async () => {
    try {
      setDataLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados mockados
      const mockQuotes: Quote[] = [
        {
          id: 'COT2024001',
          service: 'Poda de Árvore',
          status: 'enviado',
          totalValue: 500,
          createdAt: '2024-03-10',
          validUntil: '2024-03-25',
          description: 'Poda técnica de árvore de grande porte no jardim frontal'
        },
        {
          id: 'COT2024002', 
          service: 'Plantio de Mudas',
          status: 'aprovado',
          totalValue: 800,
          createdAt: '2024-03-05',
          validUntil: '2024-03-20',
          description: 'Plantio de 10 mudas nativas no quintal'
        },
        {
          id: 'COT2024003',
          service: 'Remoção de Árvore',
          status: 'expirado',
          totalValue: 1200,
          createdAt: '2024-02-15',
          validUntil: '2024-03-01',
          description: 'Remoção segura de árvore com risco de queda'
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
        color: 'bg-gray-100 text-gray-800',
        icon: <AlertCircle className="w-4 h-4" />
      }
    };
    
    return configs[status as keyof typeof configs] || configs.enviado;
  };

  const handleViewQuote = (quote: Quote) => {
    // Implementar visualização do orçamento
    console.log('Ver orçamento:', quote);
  };

  const handleDownloadQuote = (quote: Quote) => {
    // Implementar download do PDF
    console.log('Download orçamento:', quote);
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

  if (!user) {
    return null;
  }

  return (
    <AuthenticatedLayout user={user} onLogout={logout}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Meus Orçamentos</h1>
          <p className="text-gray-600">Acompanhe o status dos seus orçamentos solicitados</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{quotes.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Aguardando</p>
                <p className="text-xl font-bold text-gray-900">
                  {quotes.filter(q => q.status === 'enviado').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Aprovados</p>
                <p className="text-xl font-bold text-gray-900">
                  {quotes.filter(q => q.status === 'aprovado').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(quotes.reduce((sum, quote) => sum + quote.totalValue, 0))}
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
                  placeholder="Buscar por serviço ou código..."
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
                <option value="enviado">Enviado</option>
                <option value="aprovado">Aprovado</option>
                <option value="rejeitado">Rejeitado</option>
                <option value="expirado">Expirado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quotes List */}
        <div className="bg-white rounded-lg shadow">
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {quotes.length === 0 ? 'Nenhum orçamento encontrado' : 'Nenhum resultado'}
              </h3>
              <p className="text-gray-500">
                {quotes.length === 0 
                  ? 'Você ainda não possui orçamentos solicitados'
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Válido até
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
                              <p className="text-xs text-gray-500 mt-1">{quote.description}</p>
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
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(quote.validUntil)}
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
                              onClick={() => handleDownloadQuote(quote)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
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