"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const models_1 = require("../models");
const queryHelpers_1 = require("../utils/queryHelpers");
const router = express_1.default.Router();
// GET /api/payments - Listar todos os pagamentos
router.get('/', async (req, res) => {
    try {
        const query = req.query;
        const status = (0, queryHelpers_1.parseStringParam)(query.status);
        const client = (0, queryHelpers_1.parseStringParam)(query.client);
        const order = (0, queryHelpers_1.parseStringParam)(query.order);
        const quote = (0, queryHelpers_1.parseStringParam)(query.quote);
        const limit = (0, queryHelpers_1.parseNumberParam)(query.limit) || 50;
        const page = (0, queryHelpers_1.parseNumberParam)(query.page) || 1;
        // Construir filtros
        const filters = {};
        if (status)
            filters.status = status;
        if (client)
            filters.client = client;
        if (order)
            filters.order = order;
        if (quote)
            filters.quote = quote;
        const skip = (page - 1) * limit;
        const payments = await models_1.Payment.find(filters)
            .populate('client', 'name email phone')
            .populate('order', 'serviceDetails.name status')
            .populate('quote', 'title status')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await models_1.Payment.countDocuments(filters);
        res.json({
            success: true,
            data: payments,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Erro ao buscar pagamentos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/payments/:id - Buscar pagamento por ID
router.get('/:id', async (req, res) => {
    try {
        const payment = await models_1.Payment.findById(req.params.id)
            .populate('client', 'name email phone company')
            .populate('order', 'serviceDetails.name status pricing')
            .populate('quote', 'title status pricing')
            .populate('createdBy', 'name email')
            .populate('refund.requestedBy', 'name email')
            .populate('refund.processedBy', 'name email');
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Pagamento não encontrado'
            });
        }
        res.json({
            success: true,
            data: payment
        });
    }
    catch (error) {
        console.error('Erro ao buscar pagamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/payments - Criar novo pagamento
router.post('/', async (req, res) => {
    try {
        const paymentData = req.body;
        // Validações básicas
        if (!paymentData.client || !paymentData.amount || !paymentData.paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Cliente, valor e método de pagamento são obrigatórios'
            });
        }
        // Verificar se cliente existe
        const client = await models_1.User.findById(paymentData.client);
        if (!client) {
            return res.status(400).json({
                success: false,
                message: 'Cliente não encontrado'
            });
        }
        // Verificar se ordem existe (se fornecida)
        if (paymentData.order) {
            const order = await models_1.Order.findById(paymentData.order);
            if (!order) {
                return res.status(400).json({
                    success: false,
                    message: 'Ordem não encontrada'
                });
            }
        }
        // Verificar se orçamento existe (se fornecido)
        if (paymentData.quote) {
            const quote = await models_1.Quote.findById(paymentData.quote);
            if (!quote) {
                return res.status(400).json({
                    success: false,
                    message: 'Orçamento não encontrado'
                });
            }
        }
        // Definir criador se não fornecido
        if (!paymentData.createdBy) {
            paymentData.createdBy = paymentData.client; // Por enquanto, usar o cliente como criador
        }
        // Definir data de vencimento se não fornecida (30 dias)
        if (!paymentData.dueDate) {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);
            paymentData.dueDate = dueDate;
        }
        const payment = new models_1.Payment(paymentData);
        await payment.save();
        // Buscar pagamento criado com populate
        const createdPayment = await models_1.Payment.findById(payment._id)
            .populate('client', 'name email phone')
            .populate('order', 'serviceDetails.name status')
            .populate('quote', 'title status')
            .populate('createdBy', 'name email');
        res.status(201).json({
            success: true,
            message: 'Pagamento criado com sucesso',
            data: createdPayment
        });
    }
    catch (error) {
        console.error('Erro ao criar pagamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// PUT /api/payments/:id - Atualizar pagamento
router.put('/:id', async (req, res) => {
    try {
        const paymentData = req.body;
        const payment = await models_1.Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Pagamento não encontrado'
            });
        }
        // Não permitir atualização de pagamentos cancelados
        if (payment.status === 'cancelado') {
            return res.status(400).json({
                success: false,
                message: 'Não é possível atualizar pagamentos cancelados'
            });
        }
        // Atualizar campos permitidos
        const allowedFields = [
            'description', 'amount', 'paymentMethod', 'paymentDetails',
            'dueDate', 'notes', 'fees', 'priority', 'tags'
        ];
        allowedFields.forEach(field => {
            if (paymentData[field] !== undefined) {
                payment[field] = paymentData[field];
            }
        });
        await payment.save();
        // Buscar pagamento atualizado com populate
        const updatedPayment = await models_1.Payment.findById(payment._id)
            .populate('client', 'name email phone')
            .populate('order', 'serviceDetails.name status')
            .populate('quote', 'title status')
            .populate('createdBy', 'name email');
        res.json({
            success: true,
            message: 'Pagamento atualizado com sucesso',
            data: updatedPayment
        });
    }
    catch (error) {
        console.error('Erro ao atualizar pagamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// DELETE /api/payments/:id - Deletar pagamento
router.delete('/:id', async (req, res) => {
    try {
        const payment = await models_1.Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Pagamento não encontrado'
            });
        }
        // Não permitir deletar pagamentos já processados
        if (payment.status === 'pago') {
            return res.status(400).json({
                success: false,
                message: 'Não é possível deletar pagamentos já processados'
            });
        }
        await models_1.Payment.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Pagamento deletado com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao deletar pagamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// PUT /api/payments/:id/mark-paid - Marcar como pago
router.put('/:id/mark-paid', async (req, res) => {
    try {
        const { paidBy, notes } = req.body;
        const payment = await models_1.Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Pagamento não encontrado'
            });
        }
        if (payment.status !== 'pendente') {
            return res.status(400).json({
                success: false,
                message: 'Apenas pagamentos pendentes podem ser marcados como pagos'
            });
        }
        await payment.markAsPaid(paidBy, notes);
        // Buscar pagamento atualizado
        const updatedPayment = await models_1.Payment.findById(payment._id)
            .populate('client', 'name email phone')
            .populate('order', 'serviceDetails.name status')
            .populate('quote', 'title status');
        res.json({
            success: true,
            message: 'Pagamento marcado como pago com sucesso',
            data: updatedPayment
        });
    }
    catch (error) {
        console.error('Erro ao marcar pagamento como pago:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// PUT /api/payments/:id/cancel - Cancelar pagamento
router.put('/:id/cancel', async (req, res) => {
    try {
        const { cancelledBy, reason } = req.body;
        const payment = await models_1.Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Pagamento não encontrado'
            });
        }
        if (payment.status === 'pago') {
            return res.status(400).json({
                success: false,
                message: 'Não é possível cancelar pagamentos já processados'
            });
        }
        await payment.cancel(cancelledBy, reason);
        // Buscar pagamento atualizado
        const updatedPayment = await models_1.Payment.findById(payment._id)
            .populate('client', 'name email phone')
            .populate('order', 'serviceDetails.name status')
            .populate('quote', 'title status');
        res.json({
            success: true,
            message: 'Pagamento cancelado com sucesso',
            data: updatedPayment
        });
    }
    catch (error) {
        console.error('Erro ao cancelar pagamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/payments/:id/receipt - Adicionar comprovante
router.post('/:id/receipt', async (req, res) => {
    try {
        const { type, url, filename, uploadedBy } = req.body;
        const payment = await models_1.Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Pagamento não encontrado'
            });
        }
        await payment.addReceipt({
            type,
            url,
            filename,
            uploadedBy
        });
        // Buscar pagamento atualizado
        const updatedPayment = await models_1.Payment.findById(payment._id)
            .populate('client', 'name email phone')
            .populate('order', 'serviceDetails.name status')
            .populate('quote', 'title status');
        res.json({
            success: true,
            message: 'Comprovante adicionado com sucesso',
            data: updatedPayment
        });
    }
    catch (error) {
        console.error('Erro ao adicionar comprovante:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/payments/:id/request-refund - Solicitar reembolso
router.post('/:id/request-refund', async (req, res) => {
    try {
        const { requestedBy, reason, amount } = req.body;
        const payment = await models_1.Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Pagamento não encontrado'
            });
        }
        if (payment.status !== 'pago') {
            return res.status(400).json({
                success: false,
                message: 'Apenas pagamentos processados podem ter reembolso solicitado'
            });
        }
        await payment.requestRefund(requestedBy, reason, amount);
        // Buscar pagamento atualizado
        const updatedPayment = await models_1.Payment.findById(payment._id)
            .populate('client', 'name email phone')
            .populate('refund.requestedBy', 'name email');
        res.json({
            success: true,
            message: 'Reembolso solicitado com sucesso',
            data: updatedPayment
        });
    }
    catch (error) {
        console.error('Erro ao solicitar reembolso:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/payments/client/:clientId - Buscar pagamentos por cliente
router.get('/client/:clientId', async (req, res) => {
    try {
        const payments = await models_1.Payment.findByClient(req.params.clientId);
        res.json({
            success: true,
            data: payments,
            count: payments.length
        });
    }
    catch (error) {
        console.error('Erro ao buscar pagamentos do cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/payments/status/:status - Buscar pagamentos por status
router.get('/status/:status', async (req, res) => {
    try {
        const payments = await models_1.Payment.findByStatus(req.params.status);
        res.json({
            success: true,
            data: payments,
            count: payments.length
        });
    }
    catch (error) {
        console.error('Erro ao buscar pagamentos por status:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/payments/overdue - Buscar pagamentos vencidos
router.get('/overdue', async (req, res) => {
    try {
        const payments = await models_1.Payment.findOverdue();
        res.json({
            success: true,
            data: payments,
            count: payments.length
        });
    }
    catch (error) {
        console.error('Erro ao buscar pagamentos vencidos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/payments/due-soon - Buscar pagamentos próximos do vencimento
router.get('/due-soon', async (req, res) => {
    try {
        const days = (0, queryHelpers_1.parseNumberParam)(req.query.days) || 3;
        const payments = await models_1.Payment.findDueSoon(days);
        res.json({
            success: true,
            data: payments,
            count: payments.length
        });
    }
    catch (error) {
        console.error('Erro ao buscar pagamentos próximos do vencimento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/payments/stats - Estatísticas dos pagamentos
router.get('/stats', async (req, res) => {
    try {
        const stats = await models_1.Payment.getStats();
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Erro ao buscar estatísticas dos pagamentos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
exports.default = router;
