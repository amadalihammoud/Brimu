import express, { Request, Response } from 'express';
import '../types/mongoose-fix';
import { parseStringParam, parseNumberParam } from '../types/mongoose-fix';
import { Order, Service, User, Equipment } from '../models';

const router = express.Router();

// GET /api/orders - Listar todas as ordens
router.get('/', async (req, res) => {
  try {
    const { status, client, service, limit, page } = req.query;
    
    // Construir filtros
    const filters: any = {};
    if (status) filters.status = parseStringParam(status);
    if (client) filters.client = parseStringParam(client);
    if (service) filters.service = parseStringParam(service);
    
    const limitNum = parseNumberParam(limit) || 50;
    const pageNum = parseNumberParam(page) || 1;
    const skip = (pageNum - 1) * limitNum;
    
    const orders = await Order.find(filters)
      .populate('client', 'name email phone')
      .populate('service', 'name category basePrice')
      .populate('assignedTeam.user', 'name email')
      .populate('assignedEquipment.equipment', 'name code brand model status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Order.countDocuments(filters);
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar ordens:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/orders/available-equipment - Listar equipamentos disponíveis para uma data
router.get('/available-equipment', async (req, res) => {
  try {
    const { scheduledDate, excludeOrderId } = req.query;
    
    if (!scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Data agendada é obrigatória'
      });
    }
    
    const availableEquipment = await Order.getAvailableEquipment(
      new Date(scheduledDate), 
      excludeOrderId
    );
    
    res.json({
      success: true,
      data: availableEquipment,
      count: availableEquipment.length
    });
  } catch (error) {
    console.error('Erro ao buscar equipamentos disponíveis:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/orders/equipment-conflicts/:equipmentId - Verificar conflitos de equipamento
router.get('/equipment-conflicts/:equipmentId', async (req, res) => {
  try {
    const { scheduledDate, excludeOrderId } = req.query;
    
    if (!scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Data agendada é obrigatória'
      });
    }
    
    const conflicts = await Order.checkEquipmentDateConflict(
      req.params.equipmentId,
      new Date(scheduledDate),
      excludeOrderId
    );
    
    res.json({
      success: true,
      hasConflicts: conflicts.length > 0,
      conflicts: conflicts,
      count: conflicts.length
    });
  } catch (error) {
    console.error('Erro ao verificar conflitos de equipamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// POST /api/orders - Criar nova ordem
router.post('/', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Validações básicas
    if (!orderData.client || !orderData.service || !orderData.serviceDetails) {
      return res.status(400).json({
        success: false,
        message: 'Cliente, serviço e detalhes do serviço são obrigatórios'
      });
    }
    
    // Verificar se cliente existe
    const client = await User.findById(orderData.client);
    if (!client) {
      return res.status(400).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    // Verificar se serviço existe
    const service = await Service.findById(orderData.service);
    if (!service) {
      return res.status(400).json({
        success: false,
        message: 'Serviço não encontrado'
      });
    }
    
    // Preencher dados do serviço se não fornecidos
    if (!orderData.serviceDetails.name) {
      orderData.serviceDetails.name = service.name;
    }
    if (!orderData.serviceDetails.category) {
      orderData.serviceDetails.category = service.category;
    }
    if (!orderData.serviceDetails.estimatedDuration) {
      orderData.serviceDetails.estimatedDuration = service.estimatedDuration;
    }
    if (!orderData.serviceDetails.basePrice) {
      orderData.serviceDetails.basePrice = service.basePrice;
    }
    
    // Calcular valores se não fornecidos
    if (!orderData.pricing) {
      orderData.pricing = {
        basePrice: service.basePrice,
        totalAmount: service.basePrice,
        paidAmount: 0,
        pendingAmount: service.basePrice
      };
    }
    
    const order = new Order(orderData);
    await order.save();
    
    // Buscar ordem criada com populate
    const createdOrder = await Order.findById(order._id)
      .populate('client', 'name email phone')
      .populate('service', 'name category');
    
    res.status(201).json({
      success: true,
      message: 'Ordem criada com sucesso',
      data: createdOrder
    });
  } catch (error) {
    console.error('Erro ao criar ordem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// PUT /api/orders/:id - Atualizar ordem
router.put('/:id', async (req, res) => {
  try {
    const orderData = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Ordem não encontrada'
      });
    }
    
    // Atualizar campos permitidos
    const allowedFields = [
      'status', 'progress', 'pricing', 'scheduling', 'location',
      'assignedTeam', 'documents', 'evaluation', 'communication',
      'specialRequirements', 'priority', 'tags'
    ];
    
    allowedFields.forEach(field => {
      if (orderData[field] !== undefined) {
        order[field] = orderData[field];
      }
    });
    
    await order.save();
    
    // Buscar ordem atualizada com populate
    const updatedOrder = await Order.findById(order._id)
      .populate('client', 'name email phone')
      .populate('service', 'name category')
      .populate('assignedTeam.user', 'name email');
    
    res.json({
      success: true,
      message: 'Ordem atualizada com sucesso',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Erro ao atualizar ordem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// DELETE /api/orders/:id - Deletar ordem
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Ordem não encontrada'
      });
    }
    
    // Verificar se há pagamentos associados
    const { Payment } = require('../models');
    const paymentsCount = await Payment.countDocuments({ order: req.params.id });
    
    if (paymentsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Não é possível deletar a ordem. Existem ${paymentsCount} pagamento(s) associado(s).`
      });
    }
    
    await Order.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Ordem deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar ordem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// PUT /api/orders/:id/status - Atualizar status da ordem
router.put('/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Ordem não encontrada'
      });
    }
    
    await order.updateStatus(status, notes);
    
    // Buscar ordem atualizada
    const updatedOrder = await Order.findById(order._id)
      .populate('client', 'name email phone')
      .populate('service', 'name category');
    
    res.json({
      success: true,
      message: 'Status da ordem atualizado com sucesso',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Erro ao atualizar status da ordem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/orders/client/:clientId - Buscar ordens por cliente
router.get('/client/:clientId', async (req, res) => {
  try {
    const orders = await Order.findByClient(req.params.clientId);
    
    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Erro ao buscar ordens do cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/orders/status/:status - Buscar ordens por status
router.get('/status/:status', async (req, res) => {
  try {
    const orders = await Order.findByStatus(req.params.status);
    
    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Erro ao buscar ordens por status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/orders/scheduled - Buscar ordens agendadas
router.get('/scheduled', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Data de início e fim são obrigatórias'
      });
    }
    
    const orders = await Order.findScheduled(new Date(startDate), new Date(endDate));
    
    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Erro ao buscar ordens agendadas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/orders/stats - Estatísticas das ordens
router.get('/stats', async (req, res) => {
  try {
    const stats = await Order.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas das ordens:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// POST /api/orders/:id/equipment - Atribuir equipamento à ordem
router.post('/:id/equipment', async (req, res) => {
  try {
    const { equipmentId, notes } = req.body;
    const assignedBy = req.user?.id || 'system'; // Assumindo que há middleware de auth
    
    if (!equipmentId) {
      return res.status(400).json({
        success: false,
        message: 'ID do equipamento é obrigatório'
      });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Ordem não encontrada'
      });
    }
    
    // Verificar se equipamento existe e está disponível
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipamento não encontrado'
      });
    }
    
    if (equipment.status !== 'ativo') {
      return res.status(400).json({
        success: false,
        message: 'Equipamento não está disponível para atribuição'
      });
    }
    
    if (equipment.assignedOrder) {
      return res.status(400).json({
        success: false,
        message: 'Equipamento já está atribuído a outra ordem'
      });
    }
    
    // Atribuir equipamento à ordem
    await order.assignEquipment(equipmentId, assignedBy, notes);
    
    // Atualizar equipamento
    equipment.assignedOrder = order._id;
    await equipment.save();
    
    // Buscar ordem atualizada
    const updatedOrder = await Order.findById(req.params.id)
      .populate('client', 'name email phone')
      .populate('service', 'name category basePrice')
      .populate('assignedTeam.user', 'name email')
      .populate('assignedEquipment.equipment', 'name code brand model status');
    
    res.json({
      success: true,
      message: 'Equipamento atribuído com sucesso',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Erro ao atribuir equipamento:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

// DELETE /api/orders/:id/equipment/:equipmentId - Remover equipamento da ordem
router.delete('/:id/equipment/:equipmentId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Ordem não encontrada'
      });
    }
    
    // Remover equipamento da ordem
    await order.removeEquipment(req.params.equipmentId);
    
    // Liberar equipamento
    const equipment = await Equipment.findById(req.params.equipmentId);
    if (equipment) {
      equipment.assignedOrder = undefined;
      equipment.assignedTo = undefined;
      await equipment.save();
    }
    
    // Buscar ordem atualizada
    const updatedOrder = await Order.findById(req.params.id)
      .populate('client', 'name email phone')
      .populate('service', 'name category basePrice')
      .populate('assignedTeam.user', 'name email')
      .populate('assignedEquipment.equipment', 'name code brand model status');
    
    res.json({
      success: true,
      message: 'Equipamento removido com sucesso',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Erro ao remover equipamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/orders/equipment/:equipmentId - Buscar ordens por equipamento
router.get('/equipment/:equipmentId', async (req, res) => {
  try {
    const orders = await Order.findByEquipment(req.params.equipmentId);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Erro ao buscar ordens por equipamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/orders/:id - Buscar ordem por ID (deve ser a última rota)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('client', 'name email phone company')
      .populate('service', 'name category basePrice estimatedDuration')
      .populate('assignedTeam.user', 'name email phone')
      .populate('progress.notes.author', 'name email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Ordem não encontrada'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Erro ao buscar ordem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

export default router;
