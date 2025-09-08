import React, { useState, useEffect } from 'react';
import { 
  FaTools, 
  FaExclamationTriangle, 
  FaClock, 
  FaCheckCircle, 
  FaWrench,
  FaTruck,
  FaTree,
  FaCut,
  FaShieldAlt,
  FaCog,
  FaEye
} from 'react-icons/fa';
import { useErrorHandler } from '../utils/errorHandler';
import { apiRequest } from '../services/api';

const EquipmentDashboard = () => {
  const [stats, setStats] = useState({});
  const [dueEquipment, setDueEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logError } = useErrorHandler();

  // Categorias de equipamentos
  const categories = [
    { value: 'chainsaw', label: 'Motosserra', icon: FaTree, color: 'text-green-600' },
    { value: 'pruner', label: 'Poda Alta', icon: FaCut, color: 'text-blue-600' },
    { value: 'hedge_trimmer', label: 'Roçadeira', icon: FaTools, color: 'text-yellow-600' },
    { value: 'lawn_mower', label: 'Cortador de Grama', icon: FaTree, color: 'text-green-600' },
    { value: 'truck', label: 'Caminhão', icon: FaTruck, color: 'text-gray-600' },
    { value: 'trailer', label: 'Reboque', icon: FaTruck, color: 'text-gray-600' },
    { value: 'safety_equipment', label: 'EPI', icon: FaShieldAlt, color: 'text-red-600' },
    { value: 'other', label: 'Outros', icon: FaCog, color: 'text-purple-600' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsResponse, dueResponse] = await Promise.all([
        apiRequest('/equipment/stats/overview'),
        apiRequest('/equipment/maintenance/due')
      ]);
      
      setStats(statsResponse);
      setDueEquipment(dueResponse);
    } catch (error) {
      logError(error, { context: 'EquipmentDashboard.loadData' });
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

  const getMaintenanceStatus = (equipment) => {
    if (!equipment.maintenance?.nextMaintenance) return 'unknown';
    const daysUntil = equipment.daysUntilMaintenance;
    if (daysUntil <= 0) return 'overdue';
    if (daysUntil <= 7) return 'due_soon';
    return 'ok';
  };

  const getMaintenanceStatusColor = (status) => {
    switch (status) {
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'due_soon': return 'text-yellow-600 bg-yellow-100';
      case 'ok': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMaintenanceStatusText = (status) => {
    switch (status) {
      case 'overdue': return 'Vencida';
      case 'due_soon': return 'Próxima';
      case 'ok': return 'OK';
      default: return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Equipamentos Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview?.active || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaWrench className="text-yellow-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Em Manutenção</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview?.maintenance || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaTools className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Disponíveis</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview?.available || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <FaExclamationTriangle className="text-red-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Manutenção Vencida</p>
              <p className="text-2xl font-bold text-gray-900">{stats.maintenance?.overdue || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas por Categoria */}
      {stats.categories && stats.categories.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipamentos por Categoria</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.categories.map((category) => {
              const CategoryIcon = getCategoryIcon(category._id);
              const categoryColor = getCategoryColor(category._id);
              
              return (
                <div key={category._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <CategoryIcon className={`text-xl ${categoryColor} mr-3`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{category.count}</p>
                    <p className="text-xs text-gray-600">
                      {categories.find(c => c.value === category._id)?.label || category._id}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Equipamentos com Manutenção Vencida/Próxima */}
      {dueEquipment && dueEquipment.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Manutenção Pendente</h3>
            <span className="text-sm text-gray-500">{dueEquipment.length} equipamentos</span>
          </div>
          
          <div className="space-y-3">
            {dueEquipment.slice(0, 5).map((equipment) => {
              const CategoryIcon = getCategoryIcon(equipment.category);
              const maintenanceStatus = getMaintenanceStatus(equipment);
              
              return (
                <div key={equipment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-forest-100 flex items-center justify-center">
                        <CategoryIcon className="h-5 w-5 text-forest-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{equipment.name}</div>
                      <div className="text-sm text-gray-500">{equipment.code} • {equipment.brand} {equipment.model}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMaintenanceStatusColor(maintenanceStatus)}`}>
                      {getMaintenanceStatusText(maintenanceStatus)}
                    </span>
                    
                    {equipment.maintenance?.nextMaintenance && (
                      <span className="text-sm text-gray-500">
                        {equipment.daysUntilMaintenance > 0 
                          ? `em ${equipment.daysUntilMaintenance} dias`
                          : `${Math.abs(equipment.daysUntilMaintenance)} dias atrasada`
                        }
                      </span>
                    )}
                    
                    <button
                      onClick={() => window.open(`/admin/equipment`, '_blank')}
                      className="text-forest-600 hover:text-forest-900"
                      title="Ver detalhes"
                    >
                      <FaEye />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {dueEquipment.length > 5 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => window.open(`/admin/equipment`, '_blank')}
                className="text-forest-600 hover:text-forest-900 text-sm font-medium"
              >
                Ver todos os {dueEquipment.length} equipamentos
              </button>
            </div>
          )}
        </div>
      )}

      {/* Ações Rápidas */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.open(`/admin/equipment`, '_blank')}
            className="flex items-center justify-center p-4 bg-forest-50 border border-forest-200 rounded-lg hover:bg-forest-100 transition-colors"
          >
            <FaTools className="text-forest-600 text-xl mr-3" />
            <span className="text-forest-700 font-medium">Gerenciar Equipamentos</span>
          </button>
          
          <button
            onClick={() => window.open(`/admin/equipment?filter=maintenance`, '_blank')}
            className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <FaWrench className="text-yellow-600 text-xl mr-3" />
            <span className="text-yellow-700 font-medium">Ver Manutenções</span>
          </button>
          
          <button
            onClick={() => window.open(`/admin/equipment?filter=assigned`, '_blank')}
            className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <FaClock className="text-blue-600 text-xl mr-3" />
            <span className="text-blue-700 font-medium">Equipamentos Atribuídos</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDashboard;
