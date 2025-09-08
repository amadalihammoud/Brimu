import React, { useState } from 'react';
import { 
  FiFileText, 
  FiCheckCircle,
  FiX,
  FiClock,
  FiAlertTriangle,
  FiCalendar,
  FiDollarSign,
  FiDownload,
  FiEye
} from 'react-icons/fi';

const MyQuotesPage = ({ user }) => {
  const [activeSection, setActiveSection] = useState('aguardando');

  // Dados mockados específicos do cliente (filtrados por cliente logado)
  const quotes = {
    aguardando: [
      {
        id: 1,
        quoteNumber: 'ORC-2024-001',
        service: 'Poda de Árvores',
        description: 'Poda de 5 árvores frutíferas no jardim frontal',
        status: 'enviado',
        totalValue: 2500,
        validUntil: '2024-03-25',
        createdAt: '2024-03-10',
        daysUntilExpiry: 5,
        services: [
          { name: 'Poda de Árvore 1', price: 500 },
          { name: 'Poda de Árvore 2', price: 500 },
          { name: 'Poda de Árvore 3', price: 500 },
          { name: 'Poda de Árvore 4', price: 500 },
          { name: 'Poda de Árvore 5', price: 500 }
        ],
        notes: 'Serviço inclui limpeza e remoção dos galhos podados.'
      }
    ],
    aprovados: [
      {
        id: 2,
        quoteNumber: 'ORC-2024-002',
        service: 'Remoção de Árvore',
        description: 'Remoção de árvore seca no quintal',
        status: 'aprovado',
        totalValue: 1800,
        validUntil: '2024-03-30',
        createdAt: '2024-03-12',
        daysUntilExpiry: 10,
        approvedAt: '2024-03-14',
        services: [
          { name: 'Remoção da árvore', price: 1200 },
          { name: 'Limpeza do local', price: 300 },
          { name: 'Descarte dos resíduos', price: 300 }
        ],
        notes: 'Árvore será removida com cuidado para não danificar o jardim ao redor.'
      }
    ],
    historico: [
      {
        id: 3,
        quoteNumber: 'ORC-2024-003',
        service: 'Plantio de Mudas',
        description: 'Plantio de 10 mudas de árvores nativas',
        status: 'rejeitado',
        totalValue: 1200,
        validUntil: '2024-03-20',
        createdAt: '2024-03-05',
        daysUntilExpiry: 0,
        rejectedAt: '2024-03-18',
        rejectionReason: 'Cliente optou por outro fornecedor',
        services: [
          { name: 'Plantio de 10 mudas', price: 800 },
          { name: 'Adubo e substrato', price: 200 },
          { name: 'Irrigação inicial', price: 200 }
        ],
        notes: 'Mudas serão plantadas seguindo as melhores práticas de jardinagem.'
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      'enviado': { color: 'blue', text: 'Aguardando Resposta', icon: FiClock },
      'aprovado': { color: 'green', text: 'Aprovado', icon: FiCheckCircle },
      'rejeitado': { color: 'red', text: 'Rejeitado', icon: FiX }
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

  const getExpiryWarning = (daysUntilExpiry, status) => {
    if (status === 'enviado' && daysUntilExpiry <= 3) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <FiAlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">
              Atenção! Este orçamento expira em {daysUntilExpiry} dias
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderQuoteCard = (quote) => (
    <div key={quote.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header do Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">{quote.quoteNumber}</h3>
            <p className="text-blue-100">{quote.service}</p>
          </div>
          <div className="text-right">
            {getStatusBadge(quote.status)}
            <div className="text-white text-sm mt-2">
              {formatCurrency(quote.totalValue)}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Alerta de Expiração */}
        {getExpiryWarning(quote.daysUntilExpiry, quote.status)}

        {/* Descrição */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Descrição do Serviço</h4>
          <p className="text-gray-700">{quote.description}</p>
        </div>

        {/* Lista de Serviços */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <FiFileText className="w-5 h-5 mr-2" />
            Serviços Incluídos
          </h4>
          <div className="space-y-2">
            {quote.services.map((service, index) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{service.name}</span>
                <span className="font-medium text-gray-900">{formatCurrency(service.price)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Observações */}
        {quote.notes && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Observações</h4>
            <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">{quote.notes}</p>
          </div>
        )}

        {/* Informações de Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-gray-600">
            <FiCalendar className="w-4 h-4 mr-2" />
            <span className="text-sm">Criado em {formatDate(quote.createdAt)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FiCalendar className="w-4 h-4 mr-2" />
            <span className="text-sm">Válido até {formatDate(quote.validUntil)}</span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <FiEye className="w-4 h-4 mr-2" />
            Ver Detalhes
          </button>
          
          <button className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <FiDownload className="w-4 h-4 mr-2" />
            Baixar PDF
          </button>

          {quote.status === 'enviado' && (
            <>
              <button className="flex items-center justify-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                <FiCheckCircle className="w-4 h-4 mr-2" />
                Aprovar
              </button>
              
              <button className="flex items-center justify-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                <FiX className="w-4 h-4 mr-2" />
                Rejeitar
              </button>
            </>
          )}
        </div>

        {/* Status Específico */}
        {quote.status === 'aprovado' && quote.approvedAt && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              <FiCheckCircle className="w-4 h-4 inline mr-1" />
              Aprovado em {formatDate(quote.approvedAt)}
            </p>
          </div>
        )}

        {quote.status === 'rejeitado' && quote.rejectionReason && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              <FiX className="w-4 h-4 inline mr-1" />
              Rejeitado em {formatDate(quote.rejectedAt)} - {quote.rejectionReason}
            </p>
          </div>
        )}
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Orçamentos</h1>
              <p className="text-gray-600">Gerencie seus orçamentos e aprovações</p>
            </div>
          </div>
        </div>

        {/* Navegação por Seções */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setActiveSection('aguardando')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'aguardando' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Aguardando Resposta ({quotes.aguardando.length})
            </button>
            <button
              onClick={() => setActiveSection('aprovados')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'aprovados' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Aprovados ({quotes.aprovados.length})
            </button>
            <button
              onClick={() => setActiveSection('historico')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'historico' 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Histórico ({quotes.historico.length})
            </button>
          </div>
        </div>

        {/* Conteúdo das Seções */}
        <div className="space-y-6">
          {quotes[activeSection].map(renderQuoteCard)}
        </div>

        {quotes[activeSection].length === 0 && (
          <div className="text-center py-12">
            <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeSection === 'aguardando' && 'Nenhum orçamento aguardando resposta'}
              {activeSection === 'aprovados' && 'Nenhum orçamento aprovado'}
              {activeSection === 'historico' && 'Nenhum orçamento no histórico'}
            </h3>
            <p className="text-gray-500">
              {activeSection === 'aguardando' && 'Todos os seus orçamentos foram respondidos.'}
              {activeSection === 'aprovados' && 'Você ainda não aprovou nenhum orçamento.'}
              {activeSection === 'historico' && 'Não há orçamentos no histórico.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyQuotesPage;
