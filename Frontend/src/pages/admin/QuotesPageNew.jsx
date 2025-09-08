import React, { useState, useEffect } from 'react';
import { FiEye, FiCheck, FiX, FiTrash2, FiPlus, FiEdit } from 'react-icons/fi';
import { useNotifications } from '../../components/NotificationSystem';
import { useErrorHandler } from '../../utils/errorHandler';
import FileUpload from '../../components/FileUpload';

const QuotesPageNew = ({ theme }) => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { success, error: showError } = useNotifications();
  const { log: logError } = useErrorHandler();
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [quoteToDelete, setQuoteToDelete] = useState(null);
  const [quoteToApprove, setQuoteToApprove] = useState(null);
  const [quoteToReject, setQuoteToReject] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    clientId: '',
    service: '',
    description: '',
    price: '',
    validUntil: '',
    status: 'pending',
    notes: ''
  });

  useEffect(() => {
    loadQuotes();
    loadClients();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const mockQuotes = [
        {
          id: 1,
          client: { id: 1, name: 'João Silva', email: 'joao@email.com' },
          service: 'Poda de Árvores',
          description: 'Poda de manutenção em 5 árvores',
          price: 350.00,
          validUntil: '2025-10-10',
          status: 'pending',
          createdAt: '2025-09-04',
          notes: 'Árvores com galhos secos'
        },
        {
          id: 2,
          client: { id: 2, name: 'Maria Santos', email: 'maria@email.com' },
          service: 'Plantio de Mudas',
          description: 'Plantio de 10 mudas de ipê',
          price: 280.00,
          validUntil: '2025-10-12',
          status: 'approved',
          createdAt: '2025-09-03',
          notes: 'Local com boa drenagem'
        },
        {
          id: 3,
          client: { id: 3, name: 'Pedro Costa', email: 'pedro@email.com' },
          service: 'Remoção de Árvore',
          description: 'Remoção de árvore morta',
          price: 450.00,
          validUntil: '2025-10-15',
          status: 'rejected',
          createdAt: '2025-09-02',
          notes: 'Árvore com risco de queda'
        }
      ];
      setQuotes(mockQuotes);
    } catch (err) {
      logError(err, { action: 'loadQuotes' });
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const mockClients = [
        { id: 1, name: 'João Silva', email: 'joao@email.com' },
        { id: 2, name: 'Maria Santos', email: 'maria@email.com' },
        { id: 3, name: 'Pedro Costa', email: 'pedro@email.com' }
      ];
      setClients(mockClients);
    } catch (err) {
      logError(err, { action: 'loadClients' });
    }
  };

  const handleCreateQuote = async () => {
    try {
      const newQuote = {
        ...formData,
        id: quotes.length + 1,
        client: clients.find(c => c.id === parseInt(formData.clientId)),
        createdAt: new Date().toISOString().split('T')[0]
      };
      setQuotes([...quotes, newQuote]);
      setShowCreateModal(false);
      resetForm();
      success('Orçamento criado com sucesso!');
    } catch (err) {
      showError('Erro ao criar orçamento');
    }
  };

  const confirmApproveQuote = (quote) => {
    setQuoteToApprove(quote);
    setShowApproveModal(true);
  };

  const confirmRejectQuote = (quote) => {
    setQuoteToReject(quote);
    setShowRejectModal(true);
  };

  const confirmDeleteQuote = (quote) => {
    setQuoteToDelete(quote);
    setShowDeleteModal(true);
  };

  const handleDeleteQuote = async () => {
    try {
      setQuotes(quotes.filter(quote => quote.id !== quoteToDelete.id));
      setShowDeleteModal(false);
      setQuoteToDelete(null);
      success('Orçamento excluído com sucesso!');
    } catch (err) {
      showError('Erro ao excluir orçamento');
    }
  };

  const handleApproveQuote = async () => {
    try {
      const updatedQuotes = quotes.map(quote => 
        quote.id === quoteToApprove.id ? { ...quote, status: 'approved' } : quote
      );
      setQuotes(updatedQuotes);
      setShowApproveModal(false);
      setQuoteToApprove(null);
      success('Orçamento aprovado com sucesso!');
    } catch (err) {
      showError('Erro ao aprovar orçamento');
    }
  };

  const handleRejectQuote = async () => {
    try {
      const updatedQuotes = quotes.map(quote => 
        quote.id === quoteToReject.id ? { ...quote, status: 'rejected' } : quote
      );
      setQuotes(updatedQuotes);
      setShowRejectModal(false);
      setQuoteToReject(null);
      success('Orçamento rejeitado com sucesso!');
    } catch (err) {
      showError('Erro ao rejeitar orçamento');
    }
  };

  const openEditModal = (quote) => {
    try {
      if (!quote) {
        showError('Orçamento não encontrado');
        return;
      }

      if (!quote.client || !quote.client.id) {
        showError('Dados do cliente inválidos');
        return;
      }

      setSelectedQuote(quote);
      setFormData({
        clientId: quote.client.id.toString(),
        service: quote.service || '',
        description: quote.description || '',
        price: quote.price ? quote.price.toString() : '',
        validUntil: quote.validUntil || '',
        status: quote.status || 'pending',
        notes: quote.notes || ''
      });
      setAttachments(quote.attachments || []);
      setShowEditModal(true);
    } catch (error) {
      showError('Erro ao abrir modal de edição');
      logError(error, { action: 'openEditModal', quoteId: quote?.id });
    }
  };

  const handleUpdateQuote = async () => {
    try {
      const updatedQuote = {
        ...selectedQuote,
        ...formData,
        client: clients.find(c => c.id === parseInt(formData.clientId)),
        price: parseFloat(formData.price),
        attachments: attachments,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      const updatedQuotes = quotes.map(quote => 
        quote.id === selectedQuote.id ? updatedQuote : quote
      );
      setQuotes(updatedQuotes);
      setShowEditModal(false);
      setSelectedQuote(null);
      resetForm();
      setAttachments([]);
      success('Orçamento atualizado com sucesso!');
    } catch (err) {
      showError('Erro ao atualizar orçamento');
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      service: '',
      description: '',
      price: '',
      validUntil: '',
      status: 'pending',
      notes: ''
    });
  };

  const openViewModal = (quote) => {
    setSelectedQuote(quote);
    setShowViewModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Rejeitado';
      default: return status;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || quote.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

    return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Novo Orçamento
        </button>
        </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
              placeholder="Buscar por serviço ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendente</option>
              <option value="approved">Aprovado</option>
              <option value="rejected">Rejeitado</option>
          </select>
          </div>
        </div>
      </div>

      {/* Tabela de Orçamentos */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviço
                  </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Válido Até
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                      <div className="text-sm font-medium text-gray-900">{quote.client.name}</div>
                      <div className="text-sm text-gray-500">{quote.client.email}</div>
                        </div>
                      </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{quote.service}</div>
                    <div className="text-sm text-gray-500">{quote.description}</div>
                      </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(quote.price)}
                      </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(quote.validUntil).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                      {getStatusText(quote.status)}
                          </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                          <button
                        onClick={() => openViewModal(quote)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                        title="Ver detalhes"
                      >
                        <FiEye className="w-4 h-4" />
                          </button>
                          <button
                        onClick={() => openEditModal(quote)}
                        className="text-yellow-600 hover:text-yellow-900 p-2 rounded-lg hover:bg-yellow-50"
                        title="Editar orçamento"
                      >
                        <FiEdit className="w-4 h-4" />
                          </button>
                      {quote.status === 'pending' && (
                        <>
                          <button
                            onClick={() => confirmApproveQuote(quote)}
                            className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50"
                            title="Aprovar orçamento"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmRejectQuote(quote)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                            title="Rejeitar orçamento"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                          <button
                        onClick={() => confirmDeleteQuote(quote)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                        title="Excluir orçamento"
                      >
                        <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
              ))}
              </tbody>
            </table>
          </div>
      </div>

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Novo Orçamento</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleCreateQuote(); }}>
                <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cliente</label>
                  <select
                    value={formData.clientId}
                      onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Serviço</label>
                  <input
                      type="text"
                      value={formData.service}
                      onChange={(e) => setFormData({...formData, service: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      rows="3"
                        />
                      </div>
                  <div className="grid grid-cols-2 gap-4">
              <div>
                      <label className="block text-sm font-medium text-gray-700">Valor</label>
                    <input
                      type="number"
                      step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                    />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Válido Até</label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        required
                />
              </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                    Criar Orçamento
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {showViewModal && selectedQuote && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes do Orçamento</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cliente</label>
                  <p className="text-sm text-gray-900">{selectedQuote.client.name}</p>
            </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Serviço</label>
                  <p className="text-sm text-gray-900">{selectedQuote.service}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <p className="text-sm text-gray-900">{selectedQuote.description}</p>
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Valor</label>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedQuote.price)}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedQuote.status)}`}>
                      {getStatusText(selectedQuote.status)}
                    </span>
                </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Válido Até</label>
                  <p className="text-sm text-gray-900">{new Date(selectedQuote.validUntil).toLocaleDateString('pt-BR')}</p>
              </div>
                {selectedQuote.notes && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Observações</label>
                    <p className="text-sm text-gray-900">{selectedQuote.notes}</p>
                </div>
                )}
                </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Fechar
                </button>
              </div>
              </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Aprovação */}
      {showApproveModal && quoteToApprove && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <FiCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Confirmar Aprovação</h3>
              <p className="text-sm text-gray-500 mb-6">
                Tem certeza que deseja aprovar o orçamento <strong>"{quoteToApprove.service}"</strong> do cliente <strong>"{quoteToApprove.client.name}"</strong>?
                <br />
                <span className="text-green-600 font-medium">O cliente será notificado sobre a aprovação.</span>
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApproveQuote}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Aprovar
                </button>
                          </div>
                        </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Rejeição */}
      {showRejectModal && quoteToReject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FiX className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Confirmar Rejeição</h3>
              <p className="text-sm text-gray-500 mb-6">
                Tem certeza que deseja rejeitar o orçamento <strong>"{quoteToReject.service}"</strong> do cliente <strong>"{quoteToReject.client.name}"</strong>?
                <br />
                <span className="text-red-600 font-medium">O cliente será notificado sobre a rejeição.</span>
              </p>
              <div className="flex justify-center space-x-3">
                        <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRejectQuote}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Rejeitar
                        </button>
                      </div>
                  </div>
                </div>
            </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[9999]"
          style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div 
            className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white"
            style={{ 
              position: 'relative', 
              top: '2.5rem', 
              margin: '0 auto', 
              padding: '1.25rem', 
              border: '1px solid #d1d5db', 
              width: '91.666667%', 
              maxWidth: '56rem', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
              borderRadius: '0.375rem', 
              backgroundColor: 'white' 
            }}
          >
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Editar Orçamento {selectedQuote ? `- ${selectedQuote.service}` : ''}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  title="Fechar"
                >
                  ×
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateQuote(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                    <select
                      value={formData.clientId}
                      onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione um cliente</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Serviço</label>
                    <input
                      type="text"
                      value={formData.service}
                      onChange={(e) => setFormData({...formData, service: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Válido Até</label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pendente</option>
                      <option value="approved">Aprovado</option>
                      <option value="rejected">Rejeitado</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anexos</label>
                    <FileUpload
                      files={attachments}
                      onFilesChange={setAttachments}
                      maxFiles={10}
                      maxSize={5 * 1024 * 1024}
                      acceptedTypes={['image/*', '.pdf', '.doc', '.docx', '.txt']}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && quoteToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FiTrash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Confirmar Exclusão</h3>
              <p className="text-sm text-gray-500 mb-6">
                Tem certeza que deseja excluir o orçamento <strong>"{quoteToDelete.service}"</strong> do cliente <strong>"{quoteToDelete.client.name}"</strong>?
                <br />
                <span className="text-red-600 font-medium">Esta ação não pode ser desfeita.</span>
              </p>
              <div className="flex justify-center space-x-3">
              <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
              </button>
              <button
                  onClick={handleDeleteQuote}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                  Excluir
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotesPageNew;
