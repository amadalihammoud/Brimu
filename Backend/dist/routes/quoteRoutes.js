"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("../types/mongoose-fix");
const models_1 = require("../models");
const queryHelpers_1 = require("../utils/queryHelpers");
const router = express_1.default.Router();
// GET /api/quotes - Listar todos os orçamentos
router.get('/', async (req, res) => {
    try {
        const query = req.query;
        const status = (0, queryHelpers_1.parseStringParam)(query.status);
        const client = (0, queryHelpers_1.parseStringParam)(query.client);
        const service = (0, queryHelpers_1.parseStringParam)(query.service);
        const limit = (0, queryHelpers_1.parseNumberParam)(query.limit) || 50;
        const page = (0, queryHelpers_1.parseNumberParam)(query.page) || 1;
        // Construir filtros
        const filters = {};
        if (status)
            filters.status = status;
        if (client)
            filters.client = client;
        if (service)
            filters.service = service;
        const skip = (page - 1) * limit;
        const quotes = await models_1.Quote.find(filters)
            .populate('client', 'name email phone')
            .populate('service', 'name category basePrice')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await models_1.Quote.countDocuments(filters);
        res.json({
            success: true,
            data: quotes,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar orçamentos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/quotes/:id - Buscar orçamento por ID
router.get('/:id', async (req, res) => {
    try {
        const quote = await models_1.Quote.findById(req.params.id)
            .populate('client', 'name email phone company')
            .populate('service', 'name category basePrice estimatedDuration')
            .populate('createdBy', 'name email')
            .populate('approval.approvedBy', 'name email')
            .populate('approval.rejectedBy', 'name email')
            .populate('communication.clientQuestions.answeredBy', 'name email');
        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Orçamento não encontrado'
            });
        }
        res.json({
            success: true,
            data: quote
        });
    }
    catch (error) {
        console.error('Erro ao buscar orçamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/quotes - Criar novo orçamento
router.post('/', async (req, res) => {
    try {
        const quoteData = req.body;
        // Validações básicas
        if (!quoteData.client || !quoteData.service || !quoteData.title || !quoteData.description) {
            return res.status(400).json({
                success: false,
                message: 'Cliente, serviço, título e descrição são obrigatórios'
            });
        }
        // Verificar se cliente existe
        const client = await models_1.User.findById(quoteData.client);
        if (!client) {
            return res.status(400).json({
                success: false,
                message: 'Cliente não encontrado'
            });
        }
        // Verificar se serviço existe
        const service = await models_1.Service.findById(quoteData.service);
        if (!service) {
            return res.status(400).json({
                success: false,
                message: 'Serviço não encontrado'
            });
        }
        // Definir criador se não fornecido
        if (!quoteData.createdBy) {
            quoteData.createdBy = quoteData.client; // Por enquanto, usar o cliente como criador
        }
        // Definir localização se não fornecida
        if (!quoteData.location) {
            quoteData.location = {
                address: 'Endereço não informado',
                city: 'Cidade não informada',
                state: 'Estado não informado'
            };
        }
        // Definir itens básicos se não fornecidos
        if (!quoteData.items || quoteData.items.length === 0) {
            quoteData.items = [{
                    name: service.name,
                    description: service.description,
                    category: 'servico',
                    quantity: 1,
                    unit: 'serviço',
                    unitPrice: service.basePrice,
                    totalPrice: service.basePrice
                }];
        }
        const quote = new models_1.Quote(quoteData);
        await quote.save();
        // Buscar orçamento criado com populate
        const createdQuote = await models_1.Quote.findById(quote._id)
            .populate('client', 'name email phone')
            .populate('service', 'name category')
            .populate('createdBy', 'name email');
        res.status(201).json({
            success: true,
            message: 'Orçamento criado com sucesso',
            data: createdQuote
        });
    }
    catch (error) {
        console.error('Erro ao criar orçamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// PUT /api/quotes/:id - Atualizar orçamento
router.put('/:id', async (req, res) => {
    try {
        const quoteData = req.body;
        const quote = await models_1.Quote.findById(req.params.id);
        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Orçamento não encontrado'
            });
        }
        // Não permitir atualização de orçamentos aprovados ou rejeitados
        if (quote.status === 'aprovado' || quote.status === 'rejeitado') {
            return res.status(400).json({
                success: false,
                message: 'Não é possível atualizar orçamentos aprovados ou rejeitados'
            });
        }
        // Atualizar campos permitidos
        const allowedFields = [
            'title', 'description', 'items', 'pricing', 'terms', 'proposedScheduling',
            'documents', 'communication', 'location', 'priority', 'tags'
        ];
        allowedFields.forEach(field => {
            if (quoteData[field] !== undefined) {
                quote[field] = quoteData[field];
            }
        });
        await quote.save();
        // Buscar orçamento atualizado com populate
        const updatedQuote = await models_1.Quote.findById(quote._id)
            .populate('client', 'name email phone')
            .populate('service', 'name category')
            .populate('createdBy', 'name email');
        res.json({
            success: true,
            message: 'Orçamento atualizado com sucesso',
            data: updatedQuote
        });
    }
    catch (error) {
        console.error('Erro ao atualizar orçamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// DELETE /api/quotes/:id - Deletar orçamento
router.delete('/:id', async (req, res) => {
    try {
        const quote = await models_1.Quote.findById(req.params.id);
        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Orçamento não encontrado'
            });
        }
        // Não permitir deletar orçamentos aprovados
        if (quote.status === 'aprovado') {
            return res.status(400).json({
                success: false,
                message: 'Não é possível deletar orçamentos aprovados'
            });
        }
        // Verificar se há ordens associadas
        const { Order } = require('../models');
        const ordersCount = await Order.countDocuments({ quote: req.params.id });
        if (ordersCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Não é possível deletar o orçamento. Existe(m) ${ordersCount} ordem(ns) associada(s).`
            });
        }
        await models_1.Quote.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Orçamento deletado com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao deletar orçamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// PUT /api/quotes/:id/approve - Aprovar orçamento
router.put('/:id/approve', async (req, res) => {
    try {
        const { approvedBy, clientFeedback } = req.body;
        const quote = await models_1.Quote.findById(req.params.id);
        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Orçamento não encontrado'
            });
        }
        if (quote.status !== 'enviado') {
            return res.status(400).json({
                success: false,
                message: 'Apenas orçamentos enviados podem ser aprovados'
            });
        }
        await quote.approve(approvedBy, clientFeedback);
        // Buscar orçamento atualizado
        const updatedQuote = await models_1.Quote.findById(quote._id)
            .populate('client', 'name email phone')
            .populate('service', 'name category')
            .populate('approval.approvedBy', 'name email');
        res.json({
            success: true,
            message: 'Orçamento aprovado com sucesso',
            data: updatedQuote
        });
    }
    catch (error) {
        console.error('Erro ao aprovar orçamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// PUT /api/quotes/:id/reject - Rejeitar orçamento
router.put('/:id/reject', async (req, res) => {
    try {
        const { rejectedBy, reason, clientFeedback } = req.body;
        const quote = await models_1.Quote.findById(req.params.id);
        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Orçamento não encontrado'
            });
        }
        if (quote.status !== 'enviado') {
            return res.status(400).json({
                success: false,
                message: 'Apenas orçamentos enviados podem ser rejeitados'
            });
        }
        await quote.reject(rejectedBy, reason, clientFeedback);
        // Buscar orçamento atualizado
        const updatedQuote = await models_1.Quote.findById(quote._id)
            .populate('client', 'name email phone')
            .populate('service', 'name category')
            .populate('approval.rejectedBy', 'name email');
        res.json({
            success: true,
            message: 'Orçamento rejeitado com sucesso',
            data: updatedQuote
        });
    }
    catch (error) {
        console.error('Erro ao rejeitar orçamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// PUT /api/quotes/:id/send - Enviar orçamento
router.put('/:id/send', async (req, res) => {
    try {
        const { sentVia } = req.body;
        const quote = await models_1.Quote.findById(req.params.id);
        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Orçamento não encontrado'
            });
        }
        if (quote.status !== 'rascunho') {
            return res.status(400).json({
                success: false,
                message: 'Apenas orçamentos em rascunho podem ser enviados'
            });
        }
        await quote.send(sentVia || 'email');
        // Buscar orçamento atualizado
        const updatedQuote = await models_1.Quote.findById(quote._id)
            .populate('client', 'name email phone')
            .populate('service', 'name category');
        res.json({
            success: true,
            message: 'Orçamento enviado com sucesso',
            data: updatedQuote
        });
    }
    catch (error) {
        console.error('Erro ao enviar orçamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/quotes/client/:clientId - Buscar orçamentos por cliente
router.get('/client/:clientId', async (req, res) => {
    try {
        const quotes = await models_1.Quote.findByClient(req.params.clientId);
        res.json({
            success: true,
            data: quotes,
            count: quotes.length
        });
    }
    catch (error) {
        console.error('Erro ao buscar orçamentos do cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/quotes/status/:status - Buscar orçamentos por status
router.get('/status/:status', async (req, res) => {
    try {
        const quotes = await models_1.Quote.findByStatus(req.params.status);
        res.json({
            success: true,
            data: quotes,
            count: quotes.length
        });
    }
    catch (error) {
        console.error('Erro ao buscar orçamentos por status:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/quotes/expired - Buscar orçamentos expirados
router.get('/expired', async (req, res) => {
    try {
        const quotes = await models_1.Quote.findExpired();
        res.json({
            success: true,
            data: quotes,
            count: quotes.length
        });
    }
    catch (error) {
        console.error('Erro ao buscar orçamentos expirados:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/quotes/expiring-soon - Buscar orçamentos próximos do vencimento
router.get('/expiring-soon', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 3;
        const quotes = await models_1.Quote.findExpiringSoon(days);
        res.json({
            success: true,
            data: quotes,
            count: quotes.length
        });
    }
    catch (error) {
        console.error('Erro ao buscar orçamentos próximos do vencimento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/quotes/stats - Estatísticas dos orçamentos
router.get('/stats', async (req, res) => {
    try {
        const stats = await models_1.Quote.getStats();
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Erro ao buscar estatísticas dos orçamentos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/quotes/:id/convert-to-order - Converter orçamento em ordem de serviço
router.post('/:id/convert-to-order', async (req, res) => {
    try {
        const quote = await models_1.Quote.findById(req.params.id)
            .populate('client')
            .populate('service');
        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Orçamento não encontrado'
            });
        }
        if (quote.status !== 'aprovado') {
            return res.status(400).json({
                success: false,
                message: 'Apenas orçamentos aprovados podem ser convertidos em ordens de serviço'
            });
        }
        // Verificar se já existe uma ordem para este orçamento
        const { Order } = require('../models');
        const existingOrder = await Order.findOne({ quote: quote._id });
        if (existingOrder) {
            return res.status(400).json({
                success: false,
                message: 'Já existe uma ordem de serviço para este orçamento',
                data: { orderId: existingOrder._id }
            });
        }
        // Criar nova ordem baseada no orçamento
        const orderData = {
            client: quote.client._id,
            service: quote.service._id,
            quote: quote._id,
            serviceDetails: {
                name: quote.title,
                description: quote.description,
                category: quote.service.category,
                estimatedDuration: quote.service.estimatedDuration || quote.estimatedDuration,
                basePrice: quote.totalAmount
            },
            location: quote.location || {},
            scheduling: {
                preferredDate: quote.preferredDate || new Date(),
                preferredTimeSlot: 'manha'
            },
            pricing: {
                basePrice: quote.totalAmount,
                totalAmount: quote.totalAmount,
                paidAmount: 0,
                pendingAmount: quote.totalAmount
            },
            priority: 'normal',
            source: 'orcamento'
        };
        const order = new Order(orderData);
        await order.save();
        // Atualizar status do orçamento para convertido
        quote.status = 'convertido';
        quote.convertedAt = new Date();
        await quote.save();
        // Buscar ordem criada com populate
        const createdOrder = await Order.findById(order._id)
            .populate('client', 'name email phone')
            .populate('service', 'name category')
            .populate('quote', 'title totalAmount');
        res.status(201).json({
            success: true,
            message: 'Orçamento convertido em ordem de serviço com sucesso',
            data: {
                order: createdOrder,
                quote: quote
            }
        });
    }
    catch (error) {
        console.error('Erro ao converter orçamento em ordem:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/quotes/:id/payments - Registrar pagamento para orçamento
router.post('/:id/payments', async (req, res) => {
    try {
        const quote = await models_1.Quote.findById(req.params.id);
        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Orçamento não encontrado'
            });
        }
        const { amount, paymentMethod, description, paymentDetails, createdBy } = req.body;
        // Validações básicas
        if (!amount || !paymentMethod || !description) {
            return res.status(400).json({
                success: false,
                message: 'Valor, método de pagamento e descrição são obrigatórios'
            });
        }
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valor do pagamento deve ser maior que zero'
            });
        }
        // Verificar se o valor não excede o total do orçamento
        const { Payment } = require('../models');
        const existingPayments = await Payment.find({
            quote: req.params.id,
            status: { $ne: 'cancelado' }
        });
        const totalPaid = existingPayments.reduce((sum, payment) => sum + payment.amount, 0);
        if (totalPaid + amount > quote.totalAmount) {
            return res.status(400).json({
                success: false,
                message: `Valor excede o saldo pendente. Saldo disponível: R$ ${(quote.totalAmount - totalPaid).toFixed(2)}`
            });
        }
        // Gerar número do pagamento
        const paymentCount = await Payment.countDocuments();
        const paymentNumber = `PAG${String(paymentCount + 1).padStart(6, '0')}`;
        // Criar pagamento
        const paymentData = {
            client: quote.client,
            quote: quote._id,
            paymentNumber,
            description,
            amount,
            paymentMethod,
            paymentDetails: paymentDetails || {},
            createdBy: createdBy || 'system'
        };
        const payment = new Payment(paymentData);
        await payment.save();
        // Buscar pagamento criado com populate
        const createdPayment = await Payment.findById(payment._id)
            .populate('client', 'name email phone')
            .populate('quote', 'title totalAmount')
            .populate('createdBy', 'name email');
        res.status(201).json({
            success: true,
            message: 'Pagamento registrado com sucesso',
            data: createdPayment
        });
    }
    catch (error) {
        console.error('Erro ao registrar pagamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/quotes/:id/payments - Listar pagamentos do orçamento
router.get('/:id/payments', async (req, res) => {
    try {
        const quote = await models_1.Quote.findById(req.params.id);
        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Orçamento não encontrado'
            });
        }
        const { Payment } = require('../models');
        const payments = await Payment.find({ quote: req.params.id })
            .populate('client', 'name email phone')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        // Calcular totais
        const totalPaid = payments
            .filter(p => p.status === 'pago')
            .reduce((sum, payment) => sum + payment.amount, 0);
        const totalPending = payments
            .filter(p => p.status === 'pendente')
            .reduce((sum, payment) => sum + payment.amount, 0);
        const remainingAmount = quote.totalAmount - totalPaid - totalPending;
        res.json({
            success: true,
            data: payments,
            summary: {
                totalAmount: quote.totalAmount,
                totalPaid,
                totalPending,
                remainingAmount,
                count: payments.length
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar pagamentos do orçamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
exports.default = router;
