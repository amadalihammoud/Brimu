"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const queryHelpers_1 = require("../utils/queryHelpers");
const router = express_1.default.Router();
// Sistema de armazenamento em memória para teste
let calendarEvents = [
    {
        _id: '1',
        title: 'Manutenção Motosserra STIHL MS180',
        description: 'Manutenção preventiva mensal - limpeza e ajustes',
        type: 'manutencao_preventiva',
        startDate: new Date('2025-09-10T09:00:00'),
        endDate: new Date('2025-09-10T11:00:00'),
        allDay: false,
        status: 'agendado',
        priority: 'alta',
        relatedEquipment: '1',
        assignedTo: [
            {
                user: 'user123',
                role: 'tecnico'
            }
        ],
        location: {
            address: 'Depósito Principal',
            city: 'São Paulo',
            state: 'SP'
        },
        serviceDetails: {
            estimatedDuration: 120,
            requiredSkills: ['operacao_equipamento'],
            weatherDependency: false,
            minimumTeamSize: 1
        },
        notifications: {
            enabled: true,
            reminders: [
                {
                    type: 'email',
                    minutesBefore: 60,
                    sent: false
                }
            ]
        },
        color: '#EF4444',
        createdBy: 'admin',
        createdAt: new Date('2025-09-05T10:00:00')
    },
    {
        _id: '2',
        title: 'Poda de Árvores - Residencial Santos',
        description: 'Poda de manutenção de 5 árvores frutíferas no quintal',
        type: 'ordem_servico',
        startDate: new Date('2025-09-12T08:00:00'),
        endDate: new Date('2025-09-12T16:00:00'),
        allDay: false,
        status: 'confirmado',
        priority: 'media',
        relatedOrder: 'order123',
        assignedTo: [
            {
                user: 'user456',
                role: 'tecnico'
            },
            {
                user: 'user789',
                role: 'operador'
            }
        ],
        client: 'client123',
        location: {
            address: 'Rua das Flores, 123',
            city: 'Santos',
            state: 'SP',
            zipCode: '11070-100',
            coordinates: {
                latitude: -23.9618,
                longitude: -46.3322
            }
        },
        serviceDetails: {
            estimatedDuration: 480,
            requiredEquipment: [
                {
                    equipment: '1',
                    quantity: 1
                },
                {
                    equipment: '2',
                    quantity: 1
                }
            ],
            requiredSkills: ['poda', 'operacao_equipamento'],
            weatherDependency: true,
            minimumTeamSize: 2
        },
        weatherConditions: {
            requiredConditions: {
                maxWindSpeed: 30,
                maxRainProbability: 20,
                minTemperature: 15,
                maxTemperature: 35
            },
            suitable: true
        },
        color: '#3B82F6',
        createdBy: 'admin',
        createdAt: new Date('2025-09-06T14:30:00')
    },
    {
        _id: '3',
        title: 'Treinamento Segurança - Uso de EPIs',
        description: 'Treinamento obrigatório sobre uso correto de equipamentos de proteção individual',
        type: 'treinamento',
        startDate: new Date('2025-09-15T14:00:00'),
        endDate: new Date('2025-09-15T17:00:00'),
        allDay: false,
        status: 'agendado',
        priority: 'alta',
        assignedTo: [
            {
                user: 'user456',
                role: 'tecnico'
            },
            {
                user: 'user789',
                role: 'tecnico'
            }
        ],
        location: {
            address: 'Sala de Treinamento - Sede',
            city: 'São Paulo',
            state: 'SP'
        },
        serviceDetails: {
            estimatedDuration: 180,
            requiredSkills: [],
            weatherDependency: false,
            minimumTeamSize: 1
        },
        recurrence: {
            enabled: true,
            pattern: 'monthly',
            interval: 1,
            endRecurrence: new Date('2025-12-31T23:59:59')
        },
        color: '#8B5CF6',
        createdBy: 'admin',
        createdAt: new Date('2025-09-01T09:00:00')
    },
    {
        _id: '4',
        title: 'Instalação Sistema Irrigação',
        description: 'Instalação de sistema de irrigação automática no jardim residencial',
        type: 'instalacao',
        startDate: new Date('2025-09-18T08:00:00'),
        endDate: new Date('2025-09-18T18:00:00'),
        allDay: false,
        status: 'agendado',
        priority: 'media',
        relatedOrder: 'order456',
        assignedTo: [
            {
                user: 'user123',
                role: 'supervisor'
            },
            {
                user: 'user456',
                role: 'tecnico'
            }
        ],
        client: 'client456',
        location: {
            address: 'Av. Paulista, 1000',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01310-100'
        },
        serviceDetails: {
            estimatedDuration: 600,
            requiredSkills: ['instalacao', 'aplicacao'],
            weatherDependency: true,
            minimumTeamSize: 2
        },
        color: '#10B981',
        createdBy: 'admin',
        createdAt: new Date('2025-09-08T11:00:00')
    }
];
// Helper para simular população de dados relacionados
const populateEvent = (event) => {
    const populated = { ...event };
    // Simular população de equipamentos
    if (event.relatedEquipment) {
        populated.relatedEquipment = {
            _id: event.relatedEquipment,
            name: 'Motosserra STIHL MS180',
            code: 'MOT25001',
            category: 'motosserra'
        };
    }
    // Simular população de ordem de serviço
    if (event.relatedOrder) {
        populated.relatedOrder = {
            _id: event.relatedOrder,
            orderNumber: 'OS-2025-' + event.relatedOrder.slice(-3),
            service: { name: 'Poda de Árvores' },
            status: 'em_andamento'
        };
    }
    // Simular população de usuários
    if (event.assignedTo) {
        populated.assignedTo = event.assignedTo.map(assignment => ({
            ...assignment,
            user: {
                _id: assignment.user,
                name: assignment.user === 'user123' ? 'João Silva' :
                    assignment.user === 'user456' ? 'Maria Santos' : 'Pedro Costa',
                email: `${assignment.user}@brimu.com`
            }
        }));
    }
    // Simular população de cliente
    if (event.client) {
        populated.client = {
            _id: event.client,
            name: event.client === 'client123' ? 'Casa Santos' : 'Residencial Paulista',
            email: `${event.client}@email.com`,
            phone: '(11) 99999-9999'
        };
    }
    return populated;
};
// GET /api/calendar - Listar eventos do calendário
router.get('/', (req, res) => {
    try {
        const { startDate, endDate, type, status, assignedTo, client, priority, view = 'month' // month, week, day, agenda
         } = req.query;
        let filteredEvents = [...calendarEvents];
        // Filtrar por período se especificado
        if (startDate || endDate) {
            const start = startDate ? (0, queryHelpers_1.parseDateParam)(startDate) : new Date('1900-01-01');
            const end = endDate ? (0, queryHelpers_1.parseDateParam)(endDate) : new Date('2099-12-31');
            filteredEvents = filteredEvents.filter(event => {
                const eventStart = new Date(event.startDate);
                const eventEnd = new Date(event.endDate);
                return (eventStart >= start && eventStart <= end) ||
                    (eventEnd >= start && eventEnd <= end) ||
                    (eventStart <= start && eventEnd >= end);
            });
        }
        // Aplicar outros filtros
        if (type) {
            const types = Array.isArray(type) ? type : [type];
            filteredEvents = filteredEvents.filter(event => types.includes(event.type));
        }
        if (status) {
            const statuses = Array.isArray(status) ? status : [status];
            filteredEvents = filteredEvents.filter(event => statuses.includes(event.status));
        }
        if (assignedTo) {
            filteredEvents = filteredEvents.filter(event => event.assignedTo && event.assignedTo.some(assignment => assignment.user === assignedTo));
        }
        if (client) {
            filteredEvents = filteredEvents.filter(event => event.client === client);
        }
        if (priority) {
            const priorities = Array.isArray(priority) ? priority : [priority];
            filteredEvents = filteredEvents.filter(event => priorities.includes(event.priority));
        }
        // Ordenar por data de início
        filteredEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        // Popular dados relacionados
        const populatedEvents = filteredEvents.map(populateEvent);
        // Estatísticas
        const stats = {
            total: populatedEvents.length,
            byStatus: {
                agendado: populatedEvents.filter(e => e.status === 'agendado').length,
                confirmado: populatedEvents.filter(e => e.status === 'confirmado').length,
                em_andamento: populatedEvents.filter(e => e.status === 'em_andamento').length,
                concluido: populatedEvents.filter(e => e.status === 'concluido').length,
                cancelado: populatedEvents.filter(e => e.status === 'cancelado').length
            },
            byType: {
                ordem_servico: populatedEvents.filter(e => e.type === 'ordem_servico').length,
                manutencao: populatedEvents.filter(e => e.type.includes('manutencao')).length,
                treinamento: populatedEvents.filter(e => e.type === 'treinamento').length,
                instalacao: populatedEvents.filter(e => e.type === 'instalacao').length,
                inspecao: populatedEvents.filter(e => e.type === 'inspecao').length
            },
            byPriority: {
                critica: populatedEvents.filter(e => e.priority === 'critica').length,
                alta: populatedEvents.filter(e => e.priority === 'alta').length,
                media: populatedEvents.filter(e => e.priority === 'media').length,
                baixa: populatedEvents.filter(e => e.priority === 'baixa').length
            }
        };
        res.json({
            events: populatedEvents,
            stats,
            view,
            period: {
                startDate: startDate || null,
                endDate: endDate || null
            }
        });
    }
    catch (error) {
        console.error('Erro ao listar eventos:', error);
        res.status(500).json({
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/calendar/:id - Buscar evento por ID
router.get('/:id', (req, res) => {
    try {
        const event = calendarEvents.find(e => e._id === req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Evento não encontrado' });
        }
        res.json(populateEvent(event));
    }
    catch (error) {
        console.error('Erro ao buscar evento:', error);
        res.status(500).json({
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/calendar - Criar novo evento
router.post('/', (req, res) => {
    try {
        const { title, description, type, startDate, endDate, allDay = false, priority = 'media', relatedOrder, relatedEquipment, assignedTo = [], client, location, serviceDetails, recurrence, notifications, color, tags = [] } = req.body;
        // Validações básicas
        if (!title || !type || !startDate || !endDate) {
            return res.status(400).json({
                message: 'Campos obrigatórios: title, type, startDate, endDate'
            });
        }
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                message: 'Data de início deve ser anterior à data de término'
            });
        }
        // Verificar conflitos de agendamento
        const conflicts = calendarEvents.filter(event => {
            if (event.status === 'cancelado')
                return false;
            const eventStart = new Date(event.startDate);
            const eventEnd = new Date(event.endDate);
            const newStart = new Date(startDate);
            const newEnd = new Date(endDate);
            // Verificar sobreposição de datas
            const hasTimeOverlap = (newStart < eventEnd && newEnd > eventStart);
            if (!hasTimeOverlap)
                return false;
            // Verificar conflitos de equipe
            if (assignedTo.length > 0 && event.assignedTo) {
                const newUserIds = assignedTo.map(a => a.user);
                const eventUserIds = event.assignedTo.map(a => a.user);
                const hasUserConflict = newUserIds.some(id => eventUserIds.includes(id));
                if (hasUserConflict)
                    return true;
            }
            // Verificar conflitos de equipamento
            if (serviceDetails?.requiredEquipment && event.serviceDetails?.requiredEquipment) {
                const newEquipmentIds = serviceDetails.requiredEquipment.map(e => e.equipment);
                const eventEquipmentIds = event.serviceDetails.requiredEquipment.map(e => e.equipment);
                const hasEquipmentConflict = newEquipmentIds.some(id => eventEquipmentIds.includes(id));
                if (hasEquipmentConflict)
                    return true;
            }
            return false;
        });
        if (conflicts.length > 0) {
            return res.status(409).json({
                message: 'Conflito de agendamento detectado',
                conflicts: conflicts.map(c => ({
                    id: c._id,
                    title: c.title,
                    startDate: c.startDate,
                    endDate: c.endDate
                }))
            });
        }
        // Definir cor baseada no tipo se não especificada
        const colorMap = {
            'ordem_servico': '#3B82F6',
            'manutencao': '#F59E0B',
            'manutencao_preventiva': '#EF4444',
            'instalacao': '#10B981',
            'treinamento': '#8B5CF6',
            'inspecao': '#F97316',
            'evento_personalizado': '#6B7280'
        };
        const newEvent = {
            _id: Date.now().toString(),
            title,
            description: description || '',
            type,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            allDay,
            status: 'agendado',
            priority,
            relatedOrder,
            relatedEquipment,
            assignedTo,
            client,
            location: location || {},
            serviceDetails: serviceDetails || {},
            recurrence: recurrence || { enabled: false },
            notifications: notifications || {
                enabled: true,
                reminders: [{ type: 'email', minutesBefore: 60, sent: false }]
            },
            color: color || colorMap[type] || '#6B7280',
            tags,
            notes: [],
            changes: [],
            createdBy: 'current-user', // TODO: Pegar do token de auth
            lastModifiedBy: 'current-user',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        calendarEvents.push(newEvent);
        res.status(201).json({
            message: 'Evento criado com sucesso',
            event: populateEvent(newEvent)
        });
    }
    catch (error) {
        console.error('Erro ao criar evento:', error);
        res.status(500).json({
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// PUT /api/calendar/:id - Atualizar evento
router.put('/:id', (req, res) => {
    try {
        const eventIndex = calendarEvents.findIndex(e => e._id === req.params.id);
        if (eventIndex === -1) {
            return res.status(404).json({ message: 'Evento não encontrado' });
        }
        const currentEvent = calendarEvents[eventIndex];
        const updates = req.body;
        // Registrar mudanças
        const changes = [];
        Object.keys(updates).forEach(field => {
            if (currentEvent[field] !== updates[field]) {
                changes.push({
                    field,
                    oldValue: JSON.stringify(currentEvent[field]),
                    newValue: JSON.stringify(updates[field]),
                    changedBy: 'current-user',
                    changedAt: new Date(),
                    reason: updates.changeReason || 'Atualização manual'
                });
            }
        });
        // Atualizar evento
        const updatedEvent = {
            ...currentEvent,
            ...updates,
            lastModifiedBy: 'current-user',
            updatedAt: new Date(),
            changes: [...(currentEvent.changes || []), ...changes]
        };
        calendarEvents[eventIndex] = updatedEvent;
        res.json({
            message: 'Evento atualizado com sucesso',
            event: populateEvent(updatedEvent),
            changes
        });
    }
    catch (error) {
        console.error('Erro ao atualizar evento:', error);
        res.status(500).json({
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// DELETE /api/calendar/:id - Remover evento
router.delete('/:id', (req, res) => {
    try {
        const eventIndex = calendarEvents.findIndex(e => e._id === req.params.id);
        if (eventIndex === -1) {
            return res.status(404).json({ message: 'Evento não encontrado' });
        }
        const deletedEvent = calendarEvents.splice(eventIndex, 1)[0];
        res.json({
            message: 'Evento removido com sucesso',
            event: deletedEvent
        });
    }
    catch (error) {
        console.error('Erro ao remover evento:', error);
        res.status(500).json({
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// POST /api/calendar/:id/status - Atualizar status do evento
router.post('/:id/status', (req, res) => {
    try {
        const { status, notes } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Status é obrigatório' });
        }
        const validStatuses = ['agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'reagendado'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Status inválido' });
        }
        const eventIndex = calendarEvents.findIndex(e => e._id === req.params.id);
        if (eventIndex === -1) {
            return res.status(404).json({ message: 'Evento não encontrado' });
        }
        const event = calendarEvents[eventIndex];
        const oldStatus = event.status;
        // Atualizar status
        event.status = status;
        event.lastModifiedBy = 'current-user';
        event.updatedAt = new Date();
        // Adicionar nota se fornecida
        if (notes) {
            event.notes = event.notes || [];
            event.notes.push({
                text: notes,
                author: 'current-user',
                createdAt: new Date()
            });
        }
        // Registrar mudança
        event.changes = event.changes || [];
        event.changes.push({
            field: 'status',
            oldValue: oldStatus,
            newValue: status,
            changedBy: 'current-user',
            changedAt: new Date(),
            reason: notes || `Status alterado para ${status}`
        });
        res.json({
            message: `Status atualizado para ${status}`,
            event: populateEvent(event)
        });
    }
    catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/calendar/upcoming/:days - Eventos próximos
router.get('/upcoming/:days', (req, res) => {
    try {
        const days = parseInt(req.params.days) || 7;
        const now = new Date();
        const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
        const upcomingEvents = calendarEvents.filter(event => {
            const eventStart = new Date(event.startDate);
            return eventStart >= now &&
                eventStart <= futureDate &&
                event.status !== 'cancelado';
        }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        const populatedEvents = upcomingEvents.map(populateEvent);
        res.json({
            events: populatedEvents,
            period: {
                from: now,
                to: futureDate,
                days
            },
            total: populatedEvents.length
        });
    }
    catch (error) {
        console.error('Erro ao buscar eventos próximos:', error);
        res.status(500).json({
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
// GET /api/calendar/stats/overview - Estatísticas do calendário
router.get('/stats/overview', (req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
        const weekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
        const monthFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
        const stats = {
            total: calendarEvents.length,
            today: calendarEvents.filter(e => {
                const eventDate = new Date(e.startDate);
                return eventDate >= today && eventDate < tomorrow && e.status !== 'cancelado';
            }).length,
            tomorrow: calendarEvents.filter(e => {
                const eventDate = new Date(e.startDate);
                const tomorrowEnd = new Date(tomorrow.getTime() + (24 * 60 * 60 * 1000));
                return eventDate >= tomorrow && eventDate < tomorrowEnd && e.status !== 'cancelado';
            }).length,
            thisWeek: calendarEvents.filter(e => {
                const eventDate = new Date(e.startDate);
                return eventDate >= now && eventDate <= weekFromNow && e.status !== 'cancelado';
            }).length,
            thisMonth: calendarEvents.filter(e => {
                const eventDate = new Date(e.startDate);
                return eventDate >= now && eventDate <= monthFromNow && e.status !== 'cancelado';
            }).length,
            byStatus: {
                agendado: calendarEvents.filter(e => e.status === 'agendado').length,
                confirmado: calendarEvents.filter(e => e.status === 'confirmado').length,
                em_andamento: calendarEvents.filter(e => e.status === 'em_andamento').length,
                concluido: calendarEvents.filter(e => e.status === 'concluido').length,
                cancelado: calendarEvents.filter(e => e.status === 'cancelado').length
            },
            byType: {
                ordem_servico: calendarEvents.filter(e => e.type === 'ordem_servico').length,
                manutencao: calendarEvents.filter(e => e.type === 'manutencao' || e.type === 'manutencao_preventiva').length,
                treinamento: calendarEvents.filter(e => e.type === 'treinamento').length,
                instalacao: calendarEvents.filter(e => e.type === 'instalacao').length,
                inspecao: calendarEvents.filter(e => e.type === 'inspecao').length,
                outros: calendarEvents.filter(e => e.type === 'evento_personalizado').length
            },
            overdue: calendarEvents.filter(e => {
                const eventEnd = new Date(e.endDate);
                return eventEnd < now &&
                    ['agendado', 'confirmado', 'em_andamento'].includes(e.status);
            }).length
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Erro ao gerar estatísticas:', error);
        res.status(500).json({
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});
exports.default = router;
