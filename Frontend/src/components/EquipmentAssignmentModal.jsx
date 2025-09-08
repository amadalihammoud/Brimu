import React, { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useErrorHandler } from '../utils/errorHandler';
import api from '../services/api';

const EquipmentAssignmentModal = ({ 
  isOpen, 
  onClose, 
  equipment, 
  onSuccess 
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notes, setNotes] = useState('');
  const { logError } = useErrorHandler();

  useEffect(() => {
    if (isOpen) {
      loadAvailableOrders();
    }
  }, [isOpen]);

  const loadAvailableOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders?status=pendente,em_andamento&limit=50');
      setOrders(response.data || []);
    } catch (error) {
      logError(error, { context: 'loadAvailableOrders' });
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedOrder) {
      alert('Selecione uma ordem de serviço');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/orders/${selectedOrder._id}/equipment`, {
        equipmentId: equipment._id,
        notes: notes
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      logError(error, { context: 'handleAssign' });
      alert('Erro ao atribuir equipamento: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.service?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Atribuir Equipamento
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {equipment?.name} - {equipment?.code}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Busca de Ordens */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Ordem de Serviço
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Digite número da ordem, cliente ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Lista de Ordens */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Ordens Disponíveis
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FaExclamationTriangle className="mx-auto text-2xl mb-2" />
                    <p>Nenhuma ordem encontrada</p>
                    <p className="text-sm">Tente ajustar os filtros de busca</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div
                      key={order._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedOrder?._id === order._id
                          ? 'border-forest-500 bg-forest-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              selectedOrder?._id === order._id ? 'bg-forest-500' : 'bg-gray-300'
                            }`}></div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Ordem #{order.orderNumber || order._id.slice(-6)}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {order.client?.name} • {order.service?.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {order.location?.address}, {order.location?.city}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status === 'pendente' ? 'Pendente' :
                             order.status === 'em_andamento' ? 'Em Andamento' :
                             order.status}
                          </span>
                          {order.scheduling?.scheduledDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(order.scheduling.scheduledDate).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Ordem Selecionada */}
          {selectedOrder && (
            <div className="mb-6 p-4 bg-forest-50 border border-forest-200 rounded-lg">
              <h4 className="font-medium text-forest-900 mb-2">
                Ordem Selecionada
              </h4>
              <div className="text-sm text-forest-700">
                <p><strong>Número:</strong> #{selectedOrder.orderNumber || selectedOrder._id.slice(-6)}</p>
                <p><strong>Cliente:</strong> {selectedOrder.client?.name}</p>
                <p><strong>Serviço:</strong> {selectedOrder.service?.name}</p>
                <p><strong>Endereço:</strong> {selectedOrder.location?.address}, {selectedOrder.location?.city}</p>
                {selectedOrder.scheduling?.scheduledDate && (
                  <p><strong>Data Agendada:</strong> {new Date(selectedOrder.scheduling.scheduledDate).toLocaleDateString('pt-BR')}</p>
                )}
              </div>
            </div>
          )}

          {/* Observações */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="Adicione observações sobre a atribuição..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedOrder || loading}
            className="px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <FaCheck className="mr-2" />
            )}
            Atribuir Equipamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentAssignmentModal;
