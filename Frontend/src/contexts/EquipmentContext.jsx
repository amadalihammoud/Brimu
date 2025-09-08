import React, { createContext, useContext, useReducer, useCallback } from 'react';

const EQUIPMENT_ACTIONS = {
  SET_EQUIPMENT: 'SET_EQUIPMENT',
  ADD_EQUIPMENT: 'ADD_EQUIPMENT',
  UPDATE_EQUIPMENT: 'UPDATE_EQUIPMENT',
  REMOVE_EQUIPMENT: 'REMOVE_EQUIPMENT',
  SET_LOADING: 'SET_LOADING',
  SET_FILTERS: 'SET_FILTERS',
  SET_STATS: 'SET_STATS',
  SET_ERROR: 'SET_ERROR'
};

const initialState = {
  equipment: [],
  stats: {
    total: 0,
    ativo: 0,
    manutencao: 0,
    inativo: 0,
    aposentado: 0,
    assigned: 0,
    maintenance: { overdue: 0, due_soon: 0 }
  },
  isLoading: false,
  error: null,
  filters: {
    search: '',
    status: '',
    category: ''
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  }
};

const equipmentReducer = (state, action) => {
  switch (action.type) {
    case EQUIPMENT_ACTIONS.SET_EQUIPMENT:
      return {
        ...state,
        equipment: action.payload.equipments || [],
        pagination: action.payload.pagination || state.pagination,
        isLoading: false,
        error: null
      };

    case EQUIPMENT_ACTIONS.ADD_EQUIPMENT:
      return {
        ...state,
        equipment: [action.payload, ...state.equipment],
        stats: {
          ...state.stats,
          total: state.stats.total + 1,
          ativo: state.stats.ativo + 1
        }
      };

    case EQUIPMENT_ACTIONS.UPDATE_EQUIPMENT:
      return {
        ...state,
        equipment: state.equipment.map(item =>
          item._id === action.payload._id ? action.payload : item
        )
      };

    case EQUIPMENT_ACTIONS.REMOVE_EQUIPMENT:
      return {
        ...state,
        equipment: state.equipment.filter(item => item._id !== action.payload)
      };

    case EQUIPMENT_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case EQUIPMENT_ACTIONS.SET_STATS:
      return {
        ...state,
        stats: action.payload
      };

    case EQUIPMENT_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }
      };

    case EQUIPMENT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    default:
      return state;
  }
};

const EquipmentContext = createContext();

export const useEquipment = () => {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error('useEquipment must be used within an EquipmentProvider');
  }
  return context;
};

export const EquipmentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(equipmentReducer, initialState);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const apiRequest = useCallback(async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...(options.body && { body: JSON.stringify(options.body) })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }, [API_URL]);

  const fetchEquipment = useCallback(async () => {
    dispatch({ type: EQUIPMENT_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const params = new URLSearchParams({
        page: state.pagination.page,
        limit: state.pagination.limit,
        ...Object.fromEntries(
          Object.entries(state.filters).filter(([_, value]) => value !== '')
        )
      });

      const data = await apiRequest(`/equipment?${params}`);
      
      dispatch({
        type: EQUIPMENT_ACTIONS.SET_EQUIPMENT,
        payload: data
      });

      return data;
    } catch (error) {
      dispatch({ 
        type: EQUIPMENT_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      throw error;
    }
  }, [apiRequest, state.pagination.page, state.pagination.limit, state.filters]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiRequest('/equipment/stats/overview');
      dispatch({
        type: EQUIPMENT_ACTIONS.SET_STATS,
        payload: data
      });
      return data;
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, [apiRequest]);

  const createEquipment = useCallback(async (equipmentData) => {
    dispatch({ type: EQUIPMENT_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const data = await apiRequest('/equipment', {
        method: 'POST',
        body: equipmentData
      });

      dispatch({
        type: EQUIPMENT_ACTIONS.ADD_EQUIPMENT,
        payload: data.equipment
      });

      return data;
    } catch (error) {
      dispatch({ 
        type: EQUIPMENT_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      throw error;
    } finally {
      dispatch({ type: EQUIPMENT_ACTIONS.SET_LOADING, payload: false });
    }
  }, [apiRequest]);

  const updateEquipment = useCallback(async (id, equipmentData) => {
    dispatch({ type: EQUIPMENT_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const data = await apiRequest(`/equipment/${id}`, {
        method: 'PUT',
        body: equipmentData
      });

      dispatch({
        type: EQUIPMENT_ACTIONS.UPDATE_EQUIPMENT,
        payload: data.equipment
      });

      return data;
    } catch (error) {
      dispatch({ 
        type: EQUIPMENT_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      throw error;
    } finally {
      dispatch({ type: EQUIPMENT_ACTIONS.SET_LOADING, payload: false });
    }
  }, [apiRequest]);

  const deleteEquipment = useCallback(async (id) => {
    dispatch({ type: EQUIPMENT_ACTIONS.SET_LOADING, payload: true });
    
    try {
      await apiRequest(`/equipment/${id}`, {
        method: 'DELETE'
      });

      dispatch({
        type: EQUIPMENT_ACTIONS.REMOVE_EQUIPMENT,
        payload: id
      });

    } catch (error) {
      dispatch({ 
        type: EQUIPMENT_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      throw error;
    } finally {
      dispatch({ type: EQUIPMENT_ACTIONS.SET_LOADING, payload: false });
    }
  }, [apiRequest]);

  const assignEquipment = useCallback(async (id, assignmentData) => {
    try {
      const data = await apiRequest(`/equipment/${id}/assign`, {
        method: 'POST',
        body: assignmentData
      });

      dispatch({
        type: EQUIPMENT_ACTIONS.UPDATE_EQUIPMENT,
        payload: data.equipment
      });

      return data;
    } catch (error) {
      dispatch({ 
        type: EQUIPMENT_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      throw error;
    }
  }, [apiRequest]);

  const releaseEquipment = useCallback(async (id) => {
    try {
      const data = await apiRequest(`/equipment/${id}/release`, {
        method: 'POST'
      });

      dispatch({
        type: EQUIPMENT_ACTIONS.UPDATE_EQUIPMENT,
        payload: data.equipment
      });

      return data;
    } catch (error) {
      dispatch({ 
        type: EQUIPMENT_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      throw error;
    }
  }, [apiRequest]);

  const recordMaintenance = useCallback(async (id, maintenanceData) => {
    try {
      const data = await apiRequest(`/equipment/${id}/maintenance`, {
        method: 'POST',
        body: maintenanceData
      });

      dispatch({
        type: EQUIPMENT_ACTIONS.UPDATE_EQUIPMENT,
        payload: data.equipment
      });

      return data;
    } catch (error) {
      dispatch({ 
        type: EQUIPMENT_ACTIONS.SET_ERROR, 
        payload: error.message 
      });
      throw error;
    }
  }, [apiRequest]);

  const setFilters = useCallback((filters) => {
    dispatch({ type: EQUIPMENT_ACTIONS.SET_FILTERS, payload: filters });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: EQUIPMENT_ACTIONS.SET_ERROR, payload: null });
  }, []);

  const value = {
    ...state,
    fetchEquipment,
    fetchStats,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    assignEquipment,
    releaseEquipment,
    recordMaintenance,
    setFilters,
    clearError
  };

  return (
    <EquipmentContext.Provider value={value}>
      {children}
    </EquipmentContext.Provider>
  );
};