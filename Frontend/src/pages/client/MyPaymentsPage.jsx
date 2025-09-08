import React, { useState } from 'react';
import { 
  FiDollarSign, 
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiCalendar,
  FiCreditCard,
  FiSmartphone,
  FiHome,
  FiDownload,
  FiEye,
  FiMaximize2
} from 'react-icons/fi';

const MyPaymentsPage = ({ user }) => {
  const [activeSection, setActiveSection] = useState('pendentes');

  // Dados mockados específicos do cliente (filtrados por cliente logado)
  const payments = {
    pendentes: [
      {
        id: 1,
        paymentNumber: 'PAG-2024-001',
        order: 'ORD-2024-001',
        service: 'Poda de Árvores',
        status: 'pendente',
        amount: 2500,
        paymentMethod: 'pix',
        dueDate: '2024-03-20',
        createdAt: '2024-03-10',
        isOverdue: false,
        daysUntilDue: 3
      },
      {
        id: 2,
        paymentNumber: 'PAG-2024-002',
        order: 'ORD-2024-002',
        service: 'Remoção de Árvore',
        status: 'pendente',
        amount: 1800,
        paymentMethod: 'boleto',
        dueDate: '2024-03-15',
        createdAt: '2024-03-12',
        isOverdue: true,
        daysUntilDue: -2
      }
    ],
    pagos: [
      {
        id: 3,
        paymentNumber: 'PAG-2024-003',
        order: 'ORD-2024-003',
        service: 'Plantio de Mudas',
        status: 'pago',
        amount: 1200,
        paymentMethod: 'cartao_credito',
        dueDate: '2024-03-08',
        paidAt: '2024-03-08',
        createdAt: '2024-03-05',
        proofOfPayment: 'comprovante_003.pdf'
      }
    ]
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status, isOverdue) => {
    const statusConfig = {
      'pendente': { 
        color: isOverdue ? 'red' : 'yellow', 
        text: isOverdue ? 'Vencido' : 'Pendente', 
        icon: isOverdue ? FiAlertTriangle : FiClock 
      },
      'pago': { color: 'green', text: 'Pago', icon: FiCheckCircle }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="w-4 h-4 mr-2" />
        {config.text}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    const methodIcons = {
      'pix': FiSmartphone,
      'cartao_credito': FiCreditCard,
      'cartao_debito': FiCreditCard,
      'boleto': FiHome,
      'transferencia_bancaria': FiHome,
      'dinheiro': FiDollarSign
    };

    const Icon = methodIcons[method] || FiDollarSign;
    return <Icon className="w-5 h-5" />;
  };

  const getPaymentMethodText = (method) => {
    const methodTexts = {
      'pix': 'PIX',
      'cartao_credito': 'Cartão de Crédito',
      'cartao_debito': 'Cartão de Débito',
      'boleto': 'Boleto Bancário',
      'transferencia_bancaria': 'Transferência Bancária',
      'dinheiro': 'Dinheiro'
    };

    return methodTexts[method] || method;
  };

  const renderPaymentCard = (payment) => (
    <div key={payment.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header do Card */}
      <div className={`px-6 py-4 ${
        payment.status === 'pago' 
          ? 'bg-gradient-to-r from-green-600 to-green-700' 
          : payment.isOverdue 
            ? 'bg-gradient-to-r from-red-600 to-red-700'
            : 'bg-gradient-to-r from-yellow-600 to-yellow-700'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">{payment.paymentNumber}</h3>
            <p className="text-white/90">{payment.service}</p>
          </div>
          <div className="text-right">
            {getStatusBadge(payment.status, payment.isOverdue)}
            <div className="text-white text-lg font-bold mt-2">
              {formatCurrency(payment.amount)}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Informações do Pagamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Informações do Pagamento</h4>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <FiCalendar className="w-4 h-4 mr-2" />
                <span className="text-sm">Vencimento: {formatDate(payment.dueDate)}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                {getPaymentMethodIcon(payment.paymentMethod)}
                <span className="text-sm ml-2">Método: {getPaymentMethodText(payment.paymentMethod)}</span>
              </div>

              {payment.status === 'pago' && payment.paidAt && (
                <div className="flex items-center text-green-600">
                  <FiCheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Pago em {formatDate(payment.paidAt)}</span>
                </div>
              )}

              {payment.status === 'pendente' && (
                <div className={`flex items-center ${
                  payment.isOverdue ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  <FiAlertTriangle className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    {payment.isOverdue 
                      ? `Vencido há ${Math.abs(payment.daysUntilDue)} dias`
                      : `Vence em ${payment.daysUntilDue} dias`
                    }
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Opções de Pagamento */}
          {payment.status === 'pendente' && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Opções de Pagamento</h4>
              <div className="space-y-3">
                {payment.paymentMethod === 'pix' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <FiSmartphone className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-800">PIX</span>
                      </div>
                      <button className="text-green-600 hover:text-green-700">
                        <FiMaximize2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-green-700 mb-2">Chave PIX: cliente@email.com</p>
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                      Copiar Chave PIX
                    </button>
                  </div>
                )}

                {payment.paymentMethod === 'boleto' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <FiHome className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-800">Boleto Bancário</span>
                    </div>
                    <p className="text-sm text-blue-700 mb-3">Gere o boleto para pagamento em qualquer banco</p>
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      Gerar Boleto
                    </button>
                  </div>
                )}

                {payment.paymentMethod === 'cartao_credito' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <FiCreditCard className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="font-medium text-purple-800">Cartão de Crédito</span>
                    </div>
                    <p className="text-sm text-purple-700 mb-3">Pague com cartão de crédito</p>
                    <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                      Pagar com Cartão
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comprovante se pago */}
          {payment.status === 'pago' && payment.proofOfPayment && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Comprovante</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiDownload className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800">{payment.proofOfPayment}</span>
                  </div>
                  <button className="text-green-600 hover:text-green-700">
                    <FiDownload className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <FiEye className="w-4 h-4 mr-2" />
            Ver Detalhes
          </button>
          
          {payment.status === 'pendente' && (
            <button className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <FiCheckCircle className="w-4 h-4 mr-2" />
              Marcar como Pago
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Pagamentos</h1>
              <p className="text-gray-600">Gerencie seus pagamentos e comprovantes</p>
            </div>
          </div>
        </div>

        {/* Navegação por Seções */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setActiveSection('pendentes')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'pendentes' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendentes ({payments.pendentes.length})
            </button>
            <button
              onClick={() => setActiveSection('pagos')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'pagos' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pagos ({payments.pagos.length})
            </button>
          </div>
        </div>

        {/* Conteúdo das Seções */}
        <div className="space-y-6">
          {payments[activeSection].map(renderPaymentCard)}
        </div>

        {payments[activeSection].length === 0 && (
          <div className="text-center py-12">
            <FiDollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeSection === 'pendentes' && 'Nenhum pagamento pendente'}
              {activeSection === 'pagos' && 'Nenhum pagamento realizado'}
            </h3>
            <p className="text-gray-500">
              {activeSection === 'pendentes' && 'Todos os seus pagamentos estão em dia.'}
              {activeSection === 'pagos' && 'Você ainda não realizou nenhum pagamento.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPaymentsPage;
