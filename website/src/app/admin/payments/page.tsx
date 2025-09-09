'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, 
  Search, 
  Plus,
  Eye, 
  Edit,
  Download,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  CreditCard,
  Receipt,
  Filter,
  User,
  FileText
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

interface Payment {
  id: string;
  client: {
    name: string;
    email: string;
  };
  order: {
    id: string;
    service: string;
  };
  amount: number;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado' | 'reembolsado';
  method: 'pix' | 'boleto' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'transferencia';
  dueDate: string;
  paidDate?: string;
  description?: string;
  createdAt: string;
  installment?: {
    current: number;
    total: number;
  };
}

export default function AdminPaymentsPage() {
  const { user, loading, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [dataLoading, setDataLoading] = useState(true);

  // Redirecionar se não for admin autenticado
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  // Carregar pagamentos
  useEffect(() => {
    if (user && isAdmin) {
      loadPayments();
    }
  }, [user, isAdmin]);

  // Filtrar pagamentos
  useEffect(() => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.order.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.method === methodFilter);
    }

    if (periodFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(payment => {
        const dueDate = new Date(payment.dueDate);
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (periodFilter) {
          case 'overdue':
            return diffDays < 0 && payment.status === 'pendente';
          case 'today':
            return diffDays === 0;
          case 'week':
            return diffDays >= 0 && diffDays <= 7;
          case 'month':
            return diffDays >= 0 && diffDays <= 30;
          default:
            return true;
        }
      });
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter, methodFilter, periodFilter]);

  const loadPayments = async () => {
    try {
      setDataLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados mockados expandidos
      const mockPayments: Payment[] = [
        {
          id: 'PAG2024001',
          client: {
            name: 'João Silva',
            email: 'joao.silva@empresa.com'
          },
          order: {
            id: 'ORD2024001',
            service: 'Poda de Árvore'
          },
          amount: 500,
          status: 'pago',
          method: 'pix',
          dueDate: '2024-03-15',
          paidDate: '2024-03-14',
          description: 'Pagamento à vista com desconto de 5%',
          createdAt: '2024-03-10'
        },
        {
          id: 'PAG2024002',
          client: {
            name: 'Maria Santos',
            email: 'maria.santos@jardins.com'
          },
          order: {
            id: 'ORD2024002',
            service: 'Plantio de Mudas'
          },
          amount: 400,
          status: 'pendente',
          method: 'boleto',
          dueDate: '2024-03-20',
          description: 'Primeira parcela de 3x',
          createdAt: '2024-03-08',
          installment: {
            current: 1,
            total: 3
          }
        },
        {
          id: 'PAG2024003',
          client: {
            name: 'Pedro Oliveira',
            email: 'pedro@construtora.com'
          },
          order: {
            id: 'ORD2024003',
            service: 'Remoção de Árvore'
          },
          amount: 1800,
          status: 'pago',
          method: 'transferencia',
          dueDate: '2024-03-05',
          paidDate: '2024-03-05',
          description: 'Pagamento à vista por transferência bancária',
          createdAt: '2024-02-20'
        },
        {
          id: 'PAG2024004',
          client: {
            name: 'Ana Costa',
            email: 'ana.costa@email.com'
          },
          order: {
            id: 'ORD2024004',
            service: 'Manutenção de Jardim'
          },
          amount: 150,
          status: 'atrasado',
          method: 'boleto',
          dueDate: '2024-03-01',
          description: 'Pagamento mensal - março',
          createdAt: '2024-02-25'
        },
        {
          id: 'PAG2024005',
          client: {
            name: 'Carlos Mendes',
            email: 'carlos@loja.com'
          },
          order: {
            id: 'ORD2024005',
            service: 'Consultoria Paisagística'
          },
          amount: 400,
          status: 'cancelado',
          method: 'cartao_credito',
          dueDate: '2024-03-25',
          description: 'Pagamento cancelado devido ao cancelamento do serviço',
          createdAt: '2024-03-12'
        },
        {
          id: 'PAG2024006',
          client: {
            name: 'Lúcia Fernandes',
            email: 'lucia@residencial.com'
          },
          order: {
            id: 'ORD2024006',
            service: 'Paisagismo Completo'
          },
          amount: 650,
          status: 'reembolsado',
          method: 'pix',
          dueDate: '2024-03-10',
          paidDate: '2024-03-09',
          description: 'Reembolso solicitado por problema no serviço',
          createdAt: '2024-03-01'
        }
      ];
      
      setPayments(mockPayments);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
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
      pendente: {
        label: 'Pendente',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Clock className="w-4 h-4" />
      },
      pago: {
        label: 'Pago',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-4 h-4" />
      },
      atrasado: {
        label: 'Atrasado',
        color: 'bg-red-100 text-red-800',
        icon: <AlertTriangle className="w-4 h-4" />
      },
      cancelado: {
        label: 'Cancelado',
        color: 'bg-gray-100 text-gray-800',
        icon: <XCircle className="w-4 h-4" />
      },
      reembolsado: {
        label: 'Reembolsado',
        color: 'bg-purple-100 text-purple-800',
        icon: <Receipt className="w-4 h-4" />
      }
    };
    
    return configs[status as keyof typeof configs] || configs.pendente;
  };

  const getMethodConfig = (method: string) => {
    const configs = {
      pix: { label: 'PIX', icon: '🏦' },
      boleto: { label: 'Boleto', icon: '📄' },
      cartao_credito: { label: 'Cartão de Crédito', icon: '💳' },
      cartao_debito: { label: 'Cartão de Débito', icon: '💳' },
      dinheiro: { label: 'Dinheiro', icon: '💵' },
      transferencia: { label: 'Transferência', icon: '🏦' }
    };
    
    return configs[method as keyof typeof configs] || { label: method, icon: '💳' };
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewPayment = (payment: Payment) => {
    console.log('Ver pagamento:', payment);
  };

  const handleEditPayment = (payment: Payment) => {
    console.log('Editar pagamento:', payment);
  };

  const handleDownloadReceipt = (payment: Payment) => {
    console.log('Download comprovante:', payment);
  };

  const handleCreatePayment = () => {
    console.log('Criar novo pagamento');
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pagamentos...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pendente').length,
    paid: payments.filter(p => p.status === 'pago').length,
    overdue: payments.filter(p => p.status === 'atrasado').length,
    totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
    paidAmount: payments.filter(p => p.status === 'pago').reduce((sum, payment) => sum + payment.amount, 0),
    pendingAmount: payments.filter(p => p.status === 'pendente').reduce((sum, payment) => sum + payment.amount, 0)
  };

  return (
    <AuthenticatedLayout user={user} onLogout={logout}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gerenciar Pagamentos</h1>
            <p className="text-gray-600">Controle financeiro e cobrança de serviços</p>
          </div>
          
          <button
            onClick={handleCreatePayment}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Pagamento</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Pagos</p>
                <p className="text-xl font-bold text-gray-900">{stats.paid}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Atrasados</p>
                <p className="text-xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Recebido</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.paidAmount)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">A Receber</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.pendingAmount)}</p>
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
            
            <div className="flex flex-wrap gap-4">
              <select
                className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="atrasado">Atrasado</option>
                <option value="cancelado">Cancelado</option>
                <option value="reembolsado">Reembolsado</option>
              </select>
              
              <select
                className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <option value="all">Todos os métodos</option>
                <option value="pix">PIX</option>
                <option value="boleto">Boleto</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="transferencia">Transferência</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
              
              <select
                className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
              >
                <option value="all">Todos os períodos</option>
                <option value="overdue">Atrasados</option>
                <option value="today">Vencem hoje</option>
                <option value="week">Próximos 7 dias</option>
                <option value="month">Próximos 30 dias</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {payments.length === 0 ? 'Nenhum pagamento registrado' : 'Nenhum resultado encontrado'}
              </h3>
              <p className="text-gray-500">
                {payments.length === 0 
                  ? 'Comece registrando seu primeiro pagamento'
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
                      Pagamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => {
                    const statusConfig = getStatusConfig(payment.status);
                    const methodConfig = getMethodConfig(payment.method);
                    const daysOverdue = getDaysOverdue(payment.dueDate);
                    
                    return (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{payment.id}</p>
                            <p className="text-sm text-gray-600">{payment.order.service}</p>
                            <p className="text-xs text-gray-500">Ordem: {payment.order.id}</p>
                            {payment.installment && (
                              <p className="text-xs text-blue-600">
                                Parcela {payment.installment.current}/{payment.installment.total}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{payment.client.name}</p>
                            <p className="text-sm text-gray-600">{payment.client.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                          {payment.paidDate && (
                            <p className="text-xs text-green-600">
                              Pago em {formatDate(payment.paidDate)}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.icon}
                            <span className="ml-1">{statusConfig.label}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="mr-1">{methodConfig.icon}</span>
                            {methodConfig.label}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <p className="text-gray-600">{formatDate(payment.dueDate)}</p>
                          {payment.status === 'atrasado' && daysOverdue > 0 && (
                            <p className="text-red-600 text-xs font-medium">
                              {daysOverdue} dias em atraso
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewPayment(payment)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Ver detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditPayment(payment)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {payment.status === 'pago' && (
                              <button
                                onClick={() => handleDownloadReceipt(payment)}
                                className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                                title="Download comprovante"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
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