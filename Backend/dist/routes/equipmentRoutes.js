"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Armazenamento em memória otimizado
let equipmentStorage = [
    {
        _id: '1',
        name: 'Motosserra STIHL MS180',
        code: 'MOT25001',
        category: 'motosserra',
        brand: 'STIHL',
        model: 'MS180',
        serialNumber: 'ST123456',
        status: 'ativo',
        location: 'Depósito Principal',
        isActive: true,
        createdAt: new Date(),
        maintenance: {
            preventiveInterval: 30,
            nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            maintenanceHistory: []
        },
        notes: 'Equipamento em perfeito estado'
    },
    {
        _id: '2',
        name: 'Poda Alta Husqvarna P525D',
        code: 'POD25002',
        category: 'poda_alta',
        brand: 'Husqvarna',
        model: 'P525D',
        serialNumber: 'HU789012',
        status: 'ativo',
        location: 'Depósito Principal',
        isActive: true,
        createdAt: new Date(),
        maintenance: {
            preventiveInterval: 30,
            nextMaintenance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            maintenanceHistory: []
        },
        notes: 'Manutenção próxima do vencimento'
    }
];
// Helper para calcular dias até manutenção
const calculateDaysUntilMaintenance = (equipment) => {
    if (!equipment.maintenance?.nextMaintenance)
        return null;
    const today = new Date();
    const nextMaintenance = new Date(equipment.maintenance.nextMaintenance);
    const diffTime = nextMaintenance - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
// Helper para status de manutenção
const getMaintenanceStatus = (equipment) => {
    const daysUntil = calculateDaysUntilMaintenance(equipment);
    if (daysUntil === null)
        return 'desconhecido';
    if (daysUntil <= 0)
        return 'vencida';
    if (daysUntil <= 7)
        return 'proxima';
    return 'ok';
};
// GET /api/equipment - Listar equipamentos com filtros otimizados
router.get('/', (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        let filtered = equipmentStorage.filter(eq => eq.isActive);
        // Aplicar filtros
        if (req.query.status) {
            filtered = filtered.filter(eq => eq.status === req.query.status);
        }
        if (req.query.category) {
            filtered = filtered.filter(eq => eq.category === req.query.category);
        }
        if (req.query.search) {
            const search = req.query.search.toLowerCase();
            filtered = filtered.filter(eq => eq.name.toLowerCase().includes(search) ||
                eq.code.toLowerCase().includes(search) ||
                eq.brand.toLowerCase().includes(search) ||
                eq.model.toLowerCase().includes(search));
        }
        // Adicionar propriedades virtuais
        const equipmentWithVirtuals = filtered.map(eq => ({
            ...eq,
            daysUntilMaintenance: calculateDaysUntilMaintenance(eq),
            maintenanceStatus: getMaintenanceStatus(eq)
        }));
        const paginatedData = equipmentWithVirtuals.slice(skip, skip + limit);
        res.json({
            equipments: paginatedData,
            pagination: {
                page,
                limit,
                total: filtered.length,
                pages: Math.ceil(filtered.length / limit)
            }
        });
    }
    catch (error) {
        console.error('Erro ao listar equipamentos:', error);
        res.status(500).json({
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/equipment/stats/overview - Estatísticas dos equipamentos
router.get('/stats/overview', (req, res) => {
    try {
        const activeEquipments = equipmentStorage.filter(eq => eq.isActive);
        const stats = {
            total: activeEquipments.length,
            ativo: activeEquipments.filter(eq => eq.status === 'ativo').length,
            manutencao: activeEquipments.filter(eq => eq.status === 'manutencao').length,
            inativo: activeEquipments.filter(eq => eq.status === 'inativo').length,
            aposentado: activeEquipments.filter(eq => eq.status === 'aposentado').length,
            assigned: activeEquipments.filter(eq => eq.assignedTo).length,
            maintenance: {
                overdue: activeEquipments.filter(eq => getMaintenanceStatus(eq) === 'vencida').length,
                due_soon: activeEquipments.filter(eq => getMaintenanceStatus(eq) === 'proxima').length
            }
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/equipment/:id - Buscar equipamento por ID
router.get('/:id', (req, res) => {
    try {
        const equipment = equipmentStorage.find(eq => eq._id === req.params.id);
        if (!equipment) {
            return res.status(404).json({ message: 'Equipamento não encontrado' });
        }
        const equipmentWithVirtuals = {
            ...equipment,
            daysUntilMaintenance: calculateDaysUntilMaintenance(equipment),
            maintenanceStatus: getMaintenanceStatus(equipment)
        };
        res.json(equipmentWithVirtuals);
    }
    catch (error) {
        console.error('Erro ao buscar equipamento:', error);
        res.status(500).json({
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/equipment - Criar novo equipamento
router.post('/', (req, res) => {
    try {
        const { name, category, brand, model, serialNumber, location, status, notes } = req.body;
        // Validação obrigatória
        if (!name || !category || !brand || !model) {
            return res.status(400).json({
                message: 'Campos obrigatórios: name, category, brand, model'
            });
        }
        // Gerar código automaticamente
        const categoryPrefixes = {
            'motosserra': 'MOT',
            'poda_alta': 'POD',
            'rocadeira': 'ROC',
            'cortador_grama': 'COR',
            'caminhao': 'CAM',
            'reboque': 'REB',
            'epi': 'EPI',
            'outros': 'OUT'
        };
        const prefix = categoryPrefixes[category] || 'EQP';
        const year = new Date().getFullYear().toString().substr(-2);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const generatedCode = `${prefix}${year}${random}`;
        const equipmentData = {
            _id: Date.now().toString(),
            name: name.trim(),
            category,
            brand: brand.trim(),
            model: model.trim(),
            code: generatedCode,
            serialNumber: serialNumber ? serialNumber.trim() : '',
            location: location || 'Depósito',
            status: status || 'ativo',
            isActive: true,
            createdBy: req.user?.id || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            maintenance: {
                preventiveInterval: 30,
                nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                lastMaintenance: null,
                maintenanceHistory: []
            },
            notes: notes || ''
        };
        equipmentStorage.push(equipmentData);
        res.status(201).json({
            message: 'Equipamento criado com sucesso',
            equipment: equipmentData
        });
    }
    catch (error) {
        console.error('Erro ao criar equipamento:', error);
        res.status(500).json({
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// PUT /api/equipment/:id - Atualizar equipamento
router.put('/:id', (req, res) => {
    try {
        const equipmentIndex = equipmentStorage.findIndex(eq => eq._id === req.params.id);
        if (equipmentIndex === -1) {
            return res.status(404).json({ message: 'Equipamento não encontrado' });
        }
        const allowedFields = ['name', 'category', 'brand', 'model', 'serialNumber', 'location', 'status', 'notes'];
        const equipment = equipmentStorage[equipmentIndex];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                equipment[field] = req.body[field];
            }
        });
        equipment.updatedAt = new Date();
        equipmentStorage[equipmentIndex] = equipment;
        res.json({
            message: 'Equipamento atualizado com sucesso',
            equipment
        });
    }
    catch (error) {
        console.error('Erro ao atualizar equipamento:', error);
        res.status(500).json({
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// DELETE /api/equipment/:id - Desativar equipamento
router.delete('/:id', (req, res) => {
    try {
        const equipmentIndex = equipmentStorage.findIndex(eq => eq._id === req.params.id);
        if (equipmentIndex === -1) {
            return res.status(404).json({ message: 'Equipamento não encontrado' });
        }
        const equipment = equipmentStorage[equipmentIndex];
        // Verificar se está em uso
        if (equipment.assignedOrder) {
            return res.status(400).json({
                message: 'Não é possível desativar equipamento que está em uso'
            });
        }
        equipment.isActive = false;
        equipment.deactivatedAt = new Date();
        equipmentStorage[equipmentIndex] = equipment;
        res.json({ message: 'Equipamento desativado com sucesso' });
    }
    catch (error) {
        console.error('Erro ao desativar equipamento:', error);
        res.status(500).json({
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/equipment/:id/assign - Atribuir equipamento
router.post('/:id/assign', (req, res) => {
    try {
        const equipmentIndex = equipmentStorage.findIndex(eq => eq._id === req.params.id);
        if (equipmentIndex === -1) {
            return res.status(404).json({ message: 'Equipamento não encontrado' });
        }
        const { assignedTo, assignedOrder } = req.body;
        const equipment = equipmentStorage[equipmentIndex];
        equipment.assignedTo = assignedTo;
        equipment.assignedOrder = assignedOrder;
        equipment.updatedAt = new Date();
        equipmentStorage[equipmentIndex] = equipment;
        res.json({
            message: 'Equipamento atribuído com sucesso',
            equipment
        });
    }
    catch (error) {
        console.error('Erro ao atribuir equipamento:', error);
        res.status(500).json({
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/equipment/:id/release - Liberar equipamento
router.post('/:id/release', (req, res) => {
    try {
        const equipmentIndex = equipmentStorage.findIndex(eq => eq._id === req.params.id);
        if (equipmentIndex === -1) {
            return res.status(404).json({ message: 'Equipamento não encontrado' });
        }
        const equipment = equipmentStorage[equipmentIndex];
        equipment.assignedTo = null;
        equipment.assignedOrder = null;
        equipment.updatedAt = new Date();
        equipmentStorage[equipmentIndex] = equipment;
        res.json({
            message: 'Equipamento liberado com sucesso',
            equipment
        });
    }
    catch (error) {
        console.error('Erro ao liberar equipamento:', error);
        res.status(500).json({
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/equipment/:id/maintenance - Registrar manutenção
router.post('/:id/maintenance', (req, res) => {
    try {
        const equipmentIndex = equipmentStorage.findIndex(eq => eq._id === req.params.id);
        if (equipmentIndex === -1) {
            return res.status(404).json({ message: 'Equipamento não encontrado' });
        }
        const { type, description, performedBy, cost, notes } = req.body;
        if (!type || !description || !performedBy) {
            return res.status(400).json({
                message: 'Campos obrigatórios: type, description, performedBy'
            });
        }
        const maintenanceRecord = {
            _id: Date.now().toString(),
            type,
            description,
            performedBy,
            cost: cost || 0,
            notes: notes || '',
            performedAt: new Date(),
            status: 'completa'
        };
        const equipment = equipmentStorage[equipmentIndex];
        equipment.maintenance.maintenanceHistory.push(maintenanceRecord);
        equipment.maintenance.lastMaintenance = new Date();
        // Se for preventiva, agendar próxima
        if (type === 'preventiva') {
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + equipment.maintenance.preventiveInterval);
            equipment.maintenance.nextMaintenance = nextDate;
        }
        equipment.updatedAt = new Date();
        equipmentStorage[equipmentIndex] = equipment;
        res.json({
            message: 'Manutenção registrada com sucesso',
            equipment
        });
    }
    catch (error) {
        console.error('Erro ao registrar manutenção:', error);
        res.status(500).json({
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
exports.default = router;
