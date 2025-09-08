import React, { useState, useEffect } from 'react';
import { 
  FaTools, 
  FaCheck, 
  FaTimes, 
  FaSearch, 
  FaFilter,
  FaTree,
  FaCut,
  FaTruck,
  FaShieldAlt,
  FaCog
} from 'react-icons/fa';
import { useErrorHandler } from '../utils/errorHandler';
import { equipmentAPI, orderAPI } from '../services/api';

const OrderEquipmentSelector = ({ 
  order, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [equipmentConflicts, setEquipmentConflicts] = useState({});
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const { log, logError } = useErrorHandler();

  // Categorias de equipamentos (atualizadas para português)
  const categories = [
    { value: 'motosserra', label: 'Motosserra', icon: FaTree, color: 'text-green-600' },
    { value: 'poda_alta', label: 'Poda Alta', icon: FaCut, color: 'text-blue-600' },
    { value: 'rocadeira', label: 'Roçadeira', icon: FaTools, color: 'text-orange-600' },
    { value: 'cortador_grama', label: 'Cortador de Grama', icon: FaTree, color: 'text-lime-600' },
    { value: 'caminhao', label: 'Caminhão', icon: FaTruck, color: 'text-gray-600' },
    { value: 'reboque', label: 'Reboque', icon: FaTruck, color: 'text-gray-500' },
    { value: 'epi', label: 'EPI', icon: FaShieldAlt, color: 'text-yellow-600' },
    { value: 'outros', label: 'Outros', icon: FaCog, color: 'text-purple-600' }
  ];

  useEffect(() => {
    if (isOpen && order) {
      loadAvailableEquipment();
      loadOrderEquipment();
    }
  }, [isOpen, order]);

  const loadAvailableEquipment = async () => {
    try {
      setLoading(true);
      console.log('🔍 Buscando equipamentos disponíveis...');
      
      // Se a ordem tem data agendada, buscar apenas equipamentos disponíveis nesta data
      if (order?.scheduling?.scheduledDate) {
        const scheduledDate = new Date(order.scheduling.scheduledDate);
        const response = await orderAPI.getAvailableEquipment(scheduledDate, order._id);
        console.log('📦 Equipamentos disponíveis para data:', response);
        setAvailableEquipment(response.data || []);
      } else {
        // Se não tem data agendada, buscar todos os equipamentos ativos
        const response = await equipmentAPI.getAll({ status: 'ativo', limit: 100 });
        console.log('📦 Equipamentos recebidos:', response);
        setAvailableEquipment(response.equipments || []);
      }
      
      console.log('✅ Equipamentos carregados:', availableEquipment.length);
    } catch (error) {
      console.error('❌ Erro ao carregar equipamentos:', error);
      logError(error, { context: 'loadAvailableEquipment' });
    } finally {
      setLoading(false);
    }
  };

  const loadOrderEquipment = async () => {
    try {
      if (order?.assignedEquipment) {
        setSelectedEquipment(order.assignedEquipment.map(item => item.equipment));
      }
    } catch (error) {
      logError(error, { context: 'loadOrderEquipment' });
    }
  };

  const checkEquipmentConflict = async (equipmentId) => {
    if (!order?.scheduling?.scheduledDate) return null;
    
    try {
      setCheckingConflicts(true);
      const response = await orderAPI.checkEquipmentConflicts(
        equipmentId, 
        new Date(order.scheduling.scheduledDate),
        order._id
      );
      
      setEquipmentConflicts(prev => ({
        ...prev,
        [equipmentId]: response.hasConflicts ? response.conflicts : null
      }));
      
      return response.hasConflicts ? response.conflicts : null;
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
      return null;
    } finally {
      setCheckingConflicts(false);
    }
  };

  const handleEquipmentToggle = async (equipment) => {
    const isCurrentlySelected = selectedEquipment.some(item => item._id === equipment._id);
    
    if (!isCurrentlySelected && order?.scheduling?.scheduledDate) {
      // Verificar conflitos antes de selecionar
      const conflicts = await checkEquipmentConflict(equipment._id);
      if (conflicts && conflicts.length > 0) {
        const conflict = conflicts[0];
        const confirmMessage = `O equipamento "${equipment.name}" já está agendado para ${new Date(order.scheduling.scheduledDate).toLocaleDateString('pt-BR')} na ordem ${conflict._id} do cliente ${conflict.client?.name}.\n\nDeseja continuar mesmo assim?`;
        
        if (!window.confirm(confirmMessage)) {
          return;
        }
      }
    }
    
    setSelectedEquipment(prev => {
      if (isCurrentlySelected) {
        // Remover da seleção e limpar conflitos
        setEquipmentConflicts(prevConflicts => {
          const newConflicts = { ...prevConflicts };
          delete newConflicts[equipment._id];
          return newConflicts;
        });
        return prev.filter(item => item._id !== equipment._id);
      } else {
        return [...prev, equipment];
      }
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Obter equipamentos atualmente atribuídos
      const currentlyAssigned = order?.assignedEquipment?.map(item => item.equipment._id || item.equipment) || [];
      const newSelection = selectedEquipment.map(eq => eq._id);
      
      // Equipamentos para remover (estavam atribuídos mas não estão mais selecionados)
      const toRemove = currentlyAssigned.filter(id => !newSelection.includes(id));
      
      // Equipamentos para adicionar (estão selecionados mas não estavam atribuídos)
      const toAdd = newSelection.filter(id => !currentlyAssigned.includes(id));
      
      // Remover equipamentos não selecionados
      for (const equipmentId of toRemove) {
        try {
          await orderAPI.removeEquipment(order._id, equipmentId);
        } catch (error) {
          console.warn('Erro ao remover equipamento:', error);
        }
      }
      
      // Adicionar novos equipamentos
      for (const equipmentId of toAdd) {
        try {
          await orderAPI.assignEquipment(order._id, {
            equipmentId: equipmentId,
            notes: `Atribuído via seletor de equipamentos em ${new Date().toLocaleString('pt-BR')}`
          });
        } catch (error) {
          console.error('Erro ao atribuir equipamento:', error);
          // Mostrar erro específico para o usuário
          const equipment = selectedEquipment.find(eq => eq._id === equipmentId);
          alert(`Erro ao atribuir equipamento "${equipment?.name}": ${error.message || 'Erro desconhecido'}`);
        }
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      logError(error, { context: 'handleSave' });
      alert('Erro ao salvar equipamentos: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const categoryOption = categories.find(c => c.value === category);
    return categoryOption ? categoryOption.icon : FaCog;
  };

  const getCategoryColor = (category) => {
    const categoryOption = categories.find(c => c.value === category);
    return categoryOption ? categoryOption.color : 'text-gray-600';
  };

  const filteredEquipment = availableEquipment.filter(equipment => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || equipment.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;
  
  // Se não há ordem, mostrar mensagem de erro
  if (!order) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Erro
            </h2>
            <p className="text-gray-600 mb-6">
              Nenhuma ordem foi selecionada para atribuir equipamentos.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Selecionar Equipamentos para Ordem
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Ordem #{order.orderNumber || (order._id ? order._id.slice(-6) : order.id)} - {order.client?.name}
              </p>
              <p className="text-sm text-gray-500">
                Serviço: {order.service?.name}
              </p>
              {order?.scheduling?.scheduledDate && (
                <p className="text-sm text-blue-600 font-medium">
                  📅 Data agendada: {new Date(order.scheduling.scheduledDate).toLocaleDateString('pt-BR')}
                </p>
              )}
              {!order?.scheduling?.scheduledDate && (
                <p className="text-sm text-yellow-600">
                  ⚠️ Ordem sem data agendada - todos os equipamentos disponíveis
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar equipamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
            >
              <option value="">Todas as Categorias</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumo da Seleção */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Equipamentos Selecionados
              </h3>
              <p className="text-sm text-gray-600">
                {selectedEquipment.length} equipamento(s) selecionado(s)
              </p>
            </div>
            {selectedEquipment.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedEquipment.map(equipment => {
                  const CategoryIcon = getCategoryIcon(equipment.category);
                  return (
                    <span
                      key={equipment._id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-forest-100 text-forest-800"
                    >
                      <CategoryIcon className="w-4 h-4 mr-2" />
                      {equipment.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Lista de Equipamentos */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEquipment.map((equipment) => {
                const CategoryIcon = getCategoryIcon(equipment.category);
                const categoryColor = getCategoryColor(equipment.category);
                const isSelected = selectedEquipment.some(item => item._id === equipment._id);
                const hasConflict = equipmentConflicts[equipment._id];
                
                return (
                  <div
                    key={equipment._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? hasConflict
                          ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                          : 'border-forest-500 bg-forest-50 ring-2 ring-forest-200'
                        : hasConflict
                        ? 'border-orange-300 bg-orange-50 hover:border-orange-400'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => handleEquipmentToggle(equipment)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center ${
                          isSelected ? 'bg-forest-200' : ''
                        }`}>
                          <CategoryIcon className={`w-5 h-5 ${categoryColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {equipment.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {equipment.code} • {equipment.brand} {equipment.model}
                          </p>
                          <p className="text-xs text-gray-500">
                            {categories.find(c => c.value === equipment.category)?.label}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <div className="w-6 h-6 bg-forest-500 rounded-full flex items-center justify-center">
                            <FaCheck className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    {/* Status e Informações Adicionais */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-2 py-1 rounded-full ${
                          equipment.status === 'ativo' ? 'bg-green-100 text-green-800' :
                          equipment.status === 'manutencao' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {equipment.status === 'ativo' ? 'Disponível' :
                           equipment.status === 'manutencao' ? 'Manutenção' :
                           equipment.status === 'inativo' ? 'Inativo' :
                           equipment.status === 'aposentado' ? 'Aposentado' :
                           equipment.status}
                        </span>
                        
                        {equipment.location && (
                          <span className="text-gray-500">
                            📍 {equipment.location}
                          </span>
                        )}
                      </div>
                      
                      {equipment.maintenance?.nextMaintenance && (
                        <div className="mt-2 text-xs text-gray-500">
                          <span className={`${
                            equipment.daysUntilMaintenance <= 0 ? 'text-red-600' :
                            equipment.daysUntilMaintenance <= 7 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            🔧 Manutenção: {
                              equipment.daysUntilMaintenance <= 0 ? 'Vencida' :
                              equipment.daysUntilMaintenance <= 7 ? 'Próxima' :
                              'OK'
                            }
                          </span>
                        </div>
                      )}
                      
                      {/* Aviso de Conflito */}
                      {hasConflict && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
                          <div className="flex items-center">
                            <span className="font-medium">⚠️ Conflito de agendamento</span>
                          </div>
                          <div className="mt-1">
                            Já agendado para ordem {hasConflict[0]._id} do cliente {hasConflict[0].client?.name}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {filteredEquipment.length === 0 && !loading && (
            <div className="text-center py-12">
              <FaTools className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum equipamento encontrado
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros de busca ou cadastre novos equipamentos.
              </p>
            </div>
          )}
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
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <FaCheck className="mr-2" />
            )}
            Salvar Equipamentos ({selectedEquipment.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderEquipmentSelector;
