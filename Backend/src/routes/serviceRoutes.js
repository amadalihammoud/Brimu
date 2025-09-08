const express = require('express');
const router = express.Router();
const { Service } = require('../models');

// GET /api/services - Listar todos os serviços
router.get('/', async (req, res) => {
  try {
    const { category, isActive, isAvailable } = req.query;
    
    // Construir filtros
    const filters = {};
    if (category) filters.category = category;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (isAvailable !== undefined) filters.isAvailable = isAvailable === 'true';
    
    const services = await Service.find(filters)
      .sort({ 'stats.averageRating': -1, name: 1 });
    
    res.json({
      success: true,
      data: services,
      count: services.length
    });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/services/:id - Buscar serviço por ID
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// POST /api/services - Criar novo serviço
router.post('/', async (req, res) => {
  try {
    const serviceData = req.body;
    
    // Validações básicas
    if (!serviceData.name || !serviceData.description || !serviceData.basePrice) {
      return res.status(400).json({
        success: false,
        message: 'Nome, descrição e preço base são obrigatórios'
      });
    }
    
    const service = new Service(serviceData);
    await service.save();
    
    res.status(201).json({
      success: true,
      message: 'Serviço criado com sucesso',
      data: service
    });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// PUT /api/services/:id - Atualizar serviço
router.put('/:id', async (req, res) => {
  try {
    const serviceData = req.body;
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado'
      });
    }
    
    // Atualizar campos
    Object.keys(serviceData).forEach(key => {
      if (serviceData[key] !== undefined) {
        service[key] = serviceData[key];
      }
    });
    
    await service.save();
    
    res.json({
      success: true,
      message: 'Serviço atualizado com sucesso',
      data: service
    });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// DELETE /api/services/:id - Deletar serviço
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado'
      });
    }
    
    // Verificar se há ordens associadas
    const { Order } = require('../models');
    const ordersCount = await Order.countDocuments({ service: req.params.id });
    
    if (ordersCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Não é possível deletar o serviço. Existem ${ordersCount} ordem(ns) associada(s).`
      });
    }
    
    await Service.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Serviço deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/services/category/:category - Buscar serviços por categoria
router.get('/category/:category', async (req, res) => {
  try {
    const services = await Service.findByCategory(req.params.category);
    
    res.json({
      success: true,
      data: services,
      count: services.length
    });
  } catch (error) {
    console.error('Erro ao buscar serviços por categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/services/popular - Buscar serviços populares
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const services = await Service.findPopular(limit);
    
    res.json({
      success: true,
      data: services,
      count: services.length
    });
  } catch (error) {
    console.error('Erro ao buscar serviços populares:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// GET /api/services/stats - Estatísticas dos serviços
router.get('/stats', async (req, res) => {
  try {
    const stats = await Service.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas dos serviços:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

module.exports = router;
