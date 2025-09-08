import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter, 
  FaTools, 
  FaWrench, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaClock,
  FaUser,
  FaTimes,
  FaTree,
  FaCut,
  FaCog,
  FaTruck,
  FaShieldAlt,
  FaEye,
  FaChevronRight,
  FaTimesCircle,
  FaHistory,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBarcode
} from 'react-icons/fa';
import { useEquipment } from '../../contexts/EquipmentContext';

// Configurações de categorias
const CATEGORIES = {
  motosserra: { label: 'Motosserra', icon: FaTree, color: 'text-green-600' },
  poda_alta: { label: 'Poda Alta', icon: FaCut, color: 'text-blue-600' },
  rocadeira: { label: 'Roçadeira', icon: FaTools, color: 'text-orange-600' },
  cortador_grama: { label: 'Cortador de Grama', icon: FaTree, color: 'text-lime-600' },
  caminhao: { label: 'Caminhão', icon: FaTruck, color: 'text-gray-600' },
  reboque: { label: 'Reboque', icon: FaTruck, color: 'text-gray-500' },
  epi: { label: 'EPI', icon: FaShieldAlt, color: 'text-yellow-600' },
  outros: { label: 'Outros', icon: FaCog, color: 'text-purple-600' }
};

// Configurações de status
const STATUS_CONFIG = {
  ativo: { label: 'Ativo', color: 'text-green-600 bg-green-100', icon: FaCheckCircle },
  manutencao: { label: 'Manutenção', color: 'text-yellow-600 bg-yellow-100', icon: FaWrench },
  inativo: { label: 'Inativo', color: 'text-gray-600 bg-gray-100', icon: FaClock },
  aposentado: { label: 'Aposentado', color: 'text-red-600 bg-red-100', icon: FaTimes }
};

// Configurações de status de manutenção
const MAINTENANCE_STATUS_CONFIG = {
  vencida: { label: 'Vencida', color: 'text-red-600 bg-red-100' },
  proxima: { label: 'Próxima', color: 'text-yellow-600 bg-yellow-100' },
  ok: { label: 'OK', color: 'text-green-600 bg-green-100' },
  desconhecido: { label: 'N/A', color: 'text-gray-600 bg-gray-100' }
};

// Componente de estatística individual
const StatCard = memo(({ 
  icon: Icon, 
  title, 
  value, 
  subtitle,
  color = "text-gray-600", 
  bgColor = "bg-white",
  iconBg = "bg-gray-100",
  onClick,
  className = "",
  style = {}
}) => (
  <div 
    className={`card-interactive p-6 ${bgColor} ${className} ${onClick ? 'cursor-pointer' : ''} group`}
    onClick={onClick}
    style={style}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-xl ${iconBg} group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
          <Icon className="text-white text-xl" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {onClick && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <FaChevronRight className="text-gray-400 text-sm" />
        </div>
      )}
    </div>
  </div>
));

// Componente de filtros melhorado
const FilterBar = memo(({ filters, onFilterChange, onClearFilters, onExport }) => (
  <div className="bg-white p-6 rounded-lg shadow mb-6">
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="relative md:col-span-2">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome, código, marca..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
        />
      </div>
      
      <select
        value={filters.status}
        onChange={(e) => onFilterChange({ status: e.target.value })}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
      >
        <option value="">Todos os Status</option>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <option key={key} value={key}>{config.label}</option>
        ))}
      </select>
      
      <select
        value={filters.category}
        onChange={(e) => onFilterChange({ category: e.target.value })}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
      >
        <option value="">Todas as Categorias</option>
        {Object.entries(CATEGORIES).map(([key, config]) => (
          <option key={key} value={key}>{config.label}</option>
        ))}
      </select>
      
      <div className="flex space-x-2">
        <button
          onClick={onClearFilters}
          className="btn-secondary btn-sm gap-2"
        >
          <FaFilter className="w-4 h-4" />
          Limpar
        </button>
        <button
          onClick={onExport}
          className="btn-primary btn-sm gap-2"
        >
          <FaBarcode className="w-4 h-4" />
          Exportar
        </button>
      </div>
    </div>
  </div>
));

// Componente de linha de equipamento melhorado
const EquipmentRow = memo(({ equipment, onEdit, onDelete, onMaintenance, onRelease, onViewDetails }) => {
  const CategoryIcon = CATEGORIES[equipment.category]?.icon || FaCog;
  const statusConfig = STATUS_CONFIG[equipment.status] || STATUS_CONFIG.ativo;
  const maintenanceConfig = MAINTENANCE_STATUS_CONFIG[equipment.maintenanceStatus] || MAINTENANCE_STATUS_CONFIG.desconhecido;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-forest-100 flex items-center justify-center">
              <CategoryIcon className="h-5 w-5 text-forest-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{equipment.name}</div>
            <div className="text-sm text-gray-500">
              <span className="font-mono">{equipment.code}</span> • {equipment.brand} {equipment.model}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${maintenanceConfig.color}`}>
            {maintenanceConfig.label}
          </span>
          {equipment.daysUntilMaintenance !== null && (
            <span className="ml-2 text-xs text-gray-500">
              {equipment.daysUntilMaintenance > 0 
                ? `em ${equipment.daysUntilMaintenance} dias` 
                : `${Math.abs(equipment.daysUntilMaintenance)} dias atrasada`}
            </span>
          )}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewDetails(equipment)}
            className="btn-icon-info"
            title="Ver detalhes completos"
          >
            <FaEye className="text-sm" />
          </button>
          
          <button
            onClick={() => onEdit(equipment)}
            className="btn-icon-primary"
            title="Editar equipamento"
          >
            <FaEdit className="text-sm" />
          </button>
          
          <button
            onClick={() => onMaintenance(equipment)}
            className="btn-icon-warning"
            title="Registrar manutenção"
          >
            <FaWrench className="text-sm" />
          </button>
          
          {equipment.assignedOrder && (
            <button
              onClick={() => onRelease(equipment._id)}
              className="btn-icon-secondary"
              title="Liberar da ordem de serviço"
            >
              <FaClock className="text-sm" />
            </button>
          )}
          
          <button
            onClick={() => onDelete(equipment._id)}
            className="btn-icon-danger"
            title="Desativar equipamento"
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      </td>
    </tr>
  );
});

// Modal de detalhes do equipamento
const EquipmentDetailsModal = memo(({ equipment, isOpen, onClose }) => {
  if (!isOpen || !equipment) return null;

  const CategoryIcon = CATEGORIES[equipment.category]?.icon || FaCog;
  const statusConfig = STATUS_CONFIG[equipment.status] || STATUS_CONFIG.ativo;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CategoryIcon className="h-8 w-8 text-forest-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{equipment.name}</h2>
                <p className="text-sm text-gray-600">{equipment.code} • {equipment.brand} {equipment.model}</p>
              </div>
            </div>
            <button onClick={onClose} className="btn-icon-secondary">
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Informações Básicas</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Categoria</label>
                  <div className="mt-1 text-sm text-gray-900">{CATEGORIES[equipment.category]?.label}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Número de Série</label>
                  <div className="mt-1 text-sm text-gray-900">{equipment.serialNumber || 'Não informado'}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Localização</label>
                  <div className="mt-1 text-sm text-gray-900 flex items-center">
                    <FaMapMarkerAlt className="mr-1" />
                    {equipment.location}
                  </div>
                </div>
              </div>
            </div>

            {/* Informações de Manutenção */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Manutenção</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status de Manutenção</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${MAINTENANCE_STATUS_CONFIG[equipment.maintenanceStatus]?.color}`}>
                      {MAINTENANCE_STATUS_CONFIG[equipment.maintenanceStatus]?.label}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Próxima Manutenção</label>
                  <div className="mt-1 text-sm text-gray-900 flex items-center">
                    <FaCalendarAlt className="mr-1" />
                    {equipment.maintenance?.nextMaintenance 
                      ? new Date(equipment.maintenance.nextMaintenance).toLocaleDateString('pt-BR')
                      : 'Não agendada'}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Última Manutenção</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {equipment.maintenance?.lastMaintenance 
                      ? new Date(equipment.maintenance.lastMaintenance).toLocaleDateString('pt-BR')
                      : 'Nenhuma registrada'}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Intervalo Preventivo</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {equipment.maintenance?.preventiveInterval || 30} dias
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          {equipment.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Observações</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">{equipment.notes}</p>
              </div>
            </div>
          )}

          {/* Histórico de Manutenção */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <FaHistory className="mr-2" />
              Histórico de Manutenção
            </h3>
            {equipment.maintenance?.maintenanceHistory?.length > 0 ? (
              <div className="space-y-3">
                {equipment.maintenance.maintenanceHistory.map((maintenance, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{maintenance.description}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(maintenance.performedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Tipo: {maintenance.type} • Por: {maintenance.performedBy}
                    </p>
                    {maintenance.cost && (
                      <p className="text-xs text-gray-600">
                        Custo: R$ {maintenance.cost.toFixed(2)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma manutenção registrada.</p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
});

// Modal de formulário de equipamento melhorado
const EquipmentModal = memo(({ 
  isOpen, 
  onClose, 
  equipment, 
  onSubmit, 
  isLoading 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    model: '',
    serialNumber: '',
    location: 'Depósito',
    notes: '',
    status: 'ativo'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        category: equipment.category || '',
        brand: equipment.brand || '',
        model: equipment.model || '',
        serialNumber: equipment.serialNumber || '',
        location: equipment.location || 'Depósito',
        notes: equipment.notes || '',
        status: equipment.status || 'ativo'
      });
    } else {
      setFormData({
        name: '',
        category: '',
        brand: '',
        model: '',
        serialNumber: '',
        location: 'Depósito',
        notes: '',
        status: 'ativo'
      });
    }
    setErrors({});
  }, [equipment]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    if (!formData.brand.trim()) newErrors.brand = 'Marca é obrigatória';
    if (!formData.model.trim()) newErrors.model = 'Modelo é obrigatório';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {equipment ? 'Editar Equipamento' : 'Novo Equipamento'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione uma categoria</option>
                {Object.entries(CATEGORIES).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca *
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent ${
                  errors.brand ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo *
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent ${
                  errors.model ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Série
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localização
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              />
            </div>
          </div>

          {equipment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              >
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FaCheckCircle className="mr-2" />
              )}
              {equipment ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

// Modal de manutenção
const MaintenanceModal = memo(({ equipment, isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    type: 'preventiva',
    description: '',
    performedBy: '',
    cost: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: 'preventiva',
        description: '',
        performedBy: '',
        cost: '',
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.performedBy.trim()) newErrors.performedBy = 'Responsável é obrigatório';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : 0
      };
      onSubmit(submitData);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen || !equipment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Registrar Manutenção
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {equipment.name} - {equipment.code}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Manutenção
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              >
                <option value="preventiva">Preventiva</option>
                <option value="corretiva">Corretiva</option>
                <option value="inspecao">Inspeção</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsável *
              </label>
              <input
                type="text"
                name="performedBy"
                value={formData.performedBy}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent ${
                  errors.performedBy ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.performedBy && <p className="mt-1 text-sm text-red-600">{errors.performedBy}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custo (R$)
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FaWrench className="mr-2" />
              )}
              Registrar Manutenção
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

// Componente principal da página
const EquipmentPage = () => {
  const {
    equipment,
    stats,
    isLoading,
    error,
    filters,
    fetchEquipment,
    fetchStats,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    releaseEquipment,
    recordMaintenance,
    setFilters,
    clearError
  } = useEquipment();

  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  useEffect(() => {
    fetchEquipment();
    fetchStats();
  }, [fetchEquipment, fetchStats]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, [setFilters]);

  const handleClearFilters = useCallback(() => {
    setFilters({ search: '', status: '', category: '' });
  }, [setFilters]);

  const handleExport = useCallback(() => {
    // Implementar exportação para CSV
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nome,Código,Categoria,Marca,Modelo,Status,Localização\n"
      + equipment.map(eq => 
          `"${eq.name}","${eq.code}","${CATEGORIES[eq.category]?.label}","${eq.brand}","${eq.model}","${STATUS_CONFIG[eq.status]?.label}","${eq.location}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `equipamentos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [equipment]);

  const handleCreateEquipment = useCallback(() => {
    setSelectedEquipment(null);
    setShowModal(true);
  }, []);

  const handleEditEquipment = useCallback((equipment) => {
    setSelectedEquipment(equipment);
    setShowModal(true);
  }, []);

  const handleViewDetails = useCallback((equipment) => {
    setSelectedEquipment(equipment);
    setShowDetailsModal(true);
  }, []);

  const handleMaintenance = useCallback((equipment) => {
    setSelectedEquipment(equipment);
    setShowMaintenanceModal(true);
  }, []);

  const handleSubmitEquipment = useCallback(async (formData) => {
    try {
      if (selectedEquipment) {
        await updateEquipment(selectedEquipment._id, formData);
      } else {
        await createEquipment(formData);
      }
      setShowModal(false);
      setSelectedEquipment(null);
      fetchStats();
    } catch (error) {
      console.error('Erro ao salvar equipamento:', error);
    }
  }, [selectedEquipment, createEquipment, updateEquipment, fetchStats]);

  const handleSubmitMaintenance = useCallback(async (maintenanceData) => {
    try {
      await recordMaintenance(selectedEquipment._id, maintenanceData);
      setShowMaintenanceModal(false);
      setSelectedEquipment(null);
      fetchStats();
    } catch (error) {
      console.error('Erro ao registrar manutenção:', error);
    }
  }, [selectedEquipment, recordMaintenance, fetchStats]);

  const handleDeleteEquipment = useCallback(async (id) => {
    if (window.confirm('Tem certeza que deseja desativar este equipamento?')) {
      try {
        await deleteEquipment(id);
        fetchStats();
      } catch (error) {
        console.error('Erro ao deletar equipamento:', error);
      }
    }
  }, [deleteEquipment, fetchStats]);

  const handleReleaseEquipment = useCallback(async (id) => {
    if (window.confirm('Tem certeza que deseja liberar este equipamento da ordem de serviço?')) {
      try {
        await releaseEquipment(id);
        fetchStats();
      } catch (error) {
        console.error('Erro ao liberar equipamento:', error);
      }
    }
  }, [releaseEquipment, fetchStats]);

  const handleStatClick = useCallback((statusFilter) => {
    setFilters({ ...filters, status: statusFilter });
  }, [filters, setFilters]);

  if (isLoading && equipment.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce-in">
              <FaTools className="text-2xl text-white" />
            </div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-forest-200 border-t-forest-600 rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">Carregando Equipamentos</h3>
            <p className="text-sm text-gray-500">Aguarde enquanto carregamos seus dados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-fixed section-padding">
        {/* Header Aprimorado */}
        <div className="page-header animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                <FaTools className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="page-title">Gestão de Equipamentos</h1>
                <p className="text-sm text-gray-600 font-medium">
                  Sistema de controle e manutenção - <span className="text-green-600">Atribuições nas Ordens de Serviço</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Sistema Online</span>
              </div>
              <button
                onClick={handleCreateEquipment}
                className="btn-primary gap-2"
              >
                <FaPlus className="w-4 h-4" />
                <span>Novo Equipamento</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message Melhorado */}
        {error && (
          <div className="mb-6 animate-slide-in-right">
            <div className="error-state rounded-xl px-6 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FaTimesCircle className="text-red-600 text-lg" />
                </div>
                <div>
                  <h4 className="font-medium text-red-800">Erro no Sistema</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
              <button 
                onClick={clearError} 
                className="btn-icon-danger"
                title="Fechar mensagem"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        {/* Estatísticas Melhoradas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            icon={FaCheckCircle}
            title="Equipamentos Disponíveis"
            value={stats.ativo}
            subtitle={`${Math.round((stats.ativo / Math.max(stats.total, 1)) * 100)}% operacionais`}
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-50 to-green-100"
            iconBg="bg-green-500"
            onClick={() => handleStatClick('ativo')}
            className="animate-fade-in-up hover:scale-105 transition-transform duration-200"
          />
          <StatCard
            icon={FaWrench}
            title="Em Manutenção"
            value={stats.manutencao}
            subtitle={stats.maintenance?.overdue > 0 ? `${stats.maintenance.overdue} atrasadas` : 'Todas em dia'}
            color="text-yellow-600"
            bgColor="bg-gradient-to-br from-yellow-50 to-yellow-100"
            iconBg="bg-yellow-500"
            onClick={() => handleStatClick('manutencao')}
            className="animate-fade-in-up hover:scale-105 transition-transform duration-200"
            style={{ animationDelay: '0.1s' }}
          />
          <StatCard
            icon={FaUser}
            title="Atribuídos"
            value={stats.assigned}
            color="text-blue-600"
          />
          <StatCard
            icon={FaExclamationTriangle}
            title="Manutenção Vencida"
            value={stats.maintenance?.overdue || 0}
            color="text-red-600"
            onClick={() => setFilters({ ...filters, maintenanceStatus: 'vencida' })}
          />
        </div>

        {/* Filtros */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onExport={handleExport}
        />

        {/* Lista de Equipamentos Aprimorada */}
        <div className="card-elevated overflow-hidden">
          <div className="bg-gradient-to-r from-forest-500/5 to-forest-400/5 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaTools className="text-forest-600" />
                Lista de Equipamentos
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({equipment.length} {equipment.length === 1 ? 'equipamento' : 'equipamentos'})
                </span>
              </h2>
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="loading-spinner"></div>
                  Carregando...
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FaTools className="text-gray-500" />
                      Equipamento
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FaWrench className="text-gray-500" />
                      Manutenção
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FaCog className="text-gray-500" />
                      Ações
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipment.length > 0 ? equipment.map((item) => (
                  <EquipmentRow
                    key={item._id}
                    equipment={item}
                    onEdit={handleEditEquipment}
                    onDelete={handleDeleteEquipment}
                    onMaintenance={handleMaintenance}
                    onRelease={handleReleaseEquipment}
                    onViewDetails={handleViewDetails}
                  />
                )) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                          <FaTools className="text-2xl text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {filters.search || filters.status || filters.category 
                              ? 'Nenhum equipamento encontrado' 
                              : 'Nenhum equipamento cadastrado'}
                          </h3>
                          <p className="text-sm text-gray-500 max-w-sm">
                            {filters.search || filters.status || filters.category 
                              ? 'Tente ajustar os filtros de busca para encontrar o que procura.'
                              : 'Comece criando seu primeiro equipamento para gerenciar seu inventário.'}
                          </p>
                        </div>
                        {!filters.search && !filters.status && !filters.category && (
                          <div className="pt-4">
                            <button
                              onClick={handleCreateEquipment}
                              className="btn-primary gap-2"
                            >
                              <FaPlus className="w-4 h-4" />
                              Criar Primeiro Equipamento
                            </button>
                          </div>
                        )}
                        {(filters.search || filters.status || filters.category) && (
                          <div className="pt-4">
                            <button
                              onClick={handleClearFilters}
                              className="btn-ghost gap-2"
                            >
                              <FaTimes className="w-4 h-4" />
                              Limpar Filtros
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modais */}
        <EquipmentModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedEquipment(null);
          }}
          equipment={selectedEquipment}
          onSubmit={handleSubmitEquipment}
          isLoading={isLoading}
        />

        <EquipmentDetailsModal
          equipment={selectedEquipment}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedEquipment(null);
          }}
        />

        <MaintenanceModal
          equipment={selectedEquipment}
          isOpen={showMaintenanceModal}
          onClose={() => {
            setShowMaintenanceModal(false);
            setSelectedEquipment(null);
          }}
          onSubmit={handleSubmitMaintenance}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default EquipmentPage;