"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Schema para eventos do calendário
const calendarEventSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    type: {
        type: String,
        required: true,
        enum: [
            'ordem_servico', // Ordem de serviço agendada
            'manutencao', // Manutenção de equipamento
            'manutencao_preventiva', // Manutenção preventiva automática
            'instalacao', // Instalação de equipamento
            'treinamento', // Treinamento de equipe
            'inspecao', // Inspeção técnica
            'evento_personalizado' // Evento personalizado
        ]
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    allDay: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'reagendado'],
        default: 'agendado'
    },
    priority: {
        type: String,
        enum: ['baixa', 'media', 'alta', 'critica'],
        default: 'media'
    },
    // Relacionamentos
    relatedOrder: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Order',
        required: false
    },
    relatedEquipment: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Equipment',
        required: false
    },
    assignedTo: [{
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            },
            role: {
                type: String,
                enum: ['tecnico', 'supervisor', 'operador', 'responsavel']
            }
        }],
    client: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Localização
    location: {
        address: {
            type: String,
            trim: true
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        },
        city: String,
        state: String,
        zipCode: String
    },
    // Configurações de recorrência
    recurrence: {
        enabled: {
            type: Boolean,
            default: false
        },
        pattern: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'yearly']
        },
        interval: {
            type: Number,
            default: 1,
            min: 1
        },
        daysOfWeek: [{
                type: Number,
                min: 0,
                max: 6 // 0 = Domingo, 6 = Sábado
            }],
        endRecurrence: {
            type: Date
        },
        maxOccurrences: {
            type: Number,
            min: 1
        }
    },
    // Notificações e lembretes
    notifications: {
        enabled: {
            type: Boolean,
            default: true
        },
        reminders: [{
                type: {
                    type: String,
                    enum: ['email', 'sms', 'whatsapp', 'push']
                },
                minutesBefore: {
                    type: Number,
                    required: true
                },
                sent: {
                    type: Boolean,
                    default: false
                }
            }]
    },
    // Dados específicos do setor
    serviceDetails: {
        estimatedDuration: {
            type: Number, // em minutos
            required: false
        },
        requiredEquipment: [{
                equipment: {
                    type: mongoose_1.default.Schema.Types.ObjectId,
                    ref: 'Equipment'
                },
                quantity: {
                    type: Number,
                    default: 1
                }
            }],
        requiredSkills: [{
                type: String,
                enum: ['poda', 'corte', 'plantio', 'tratamento', 'aplicacao', 'operacao_equipamento']
            }],
        weatherDependency: {
            type: Boolean,
            default: true
        },
        minimumTeamSize: {
            type: Number,
            default: 1,
            min: 1
        }
    },
    // Condições climáticas
    weatherConditions: {
        requiredConditions: {
            maxWindSpeed: Number, // km/h
            maxRainProbability: Number, // %
            minTemperature: Number, // °C
            maxTemperature: Number // °C
        },
        checkedAt: Date,
        suitable: Boolean,
        reason: String
    },
    // Histórico e observações
    notes: [{
            text: String,
            author: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
    // Controle de alterações
    changes: [{
            field: String,
            oldValue: String,
            newValue: String,
            changedBy: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            },
            changedAt: {
                type: Date,
                default: Date.now
            },
            reason: String
        }],
    // Metadados
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastModifiedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    tags: [String],
    color: {
        type: String,
        default: '#10B981' // Verde forest
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Índices para performance
calendarEventSchema.index({ startDate: 1, endDate: 1 });
calendarEventSchema.index({ type: 1, status: 1 });
calendarEventSchema.index({ 'assignedTo.user': 1, startDate: 1 });
calendarEventSchema.index({ client: 1, startDate: 1 });
calendarEventSchema.index({ relatedOrder: 1 });
calendarEventSchema.index({ relatedEquipment: 1 });
calendarEventSchema.index({ createdAt: -1 });
// Virtuals para cálculos
calendarEventSchema.virtual('duration').get(function () {
    if (this.startDate && this.endDate) {
        return Math.abs(new Date(this.endDate).getTime() - new Date(this.startDate).getTime()) / (1000 * 60); // em minutos
    }
    return 0;
});
calendarEventSchema.virtual('isToday').get(function () {
    const today = new Date();
    const eventDate = new Date(this.startDate);
    return eventDate.toDateString() === today.toDateString();
});
calendarEventSchema.virtual('isPast').get(function () {
    return new Date() > this.endDate;
});
calendarEventSchema.virtual('isUpcoming').get(function () {
    const now = new Date();
    const dayFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    return this.startDate >= now && this.startDate <= dayFromNow;
});
// Middleware pre-save para validações
calendarEventSchema.pre('save', function (next) {
    // Validar datas
    if (this.startDate >= this.endDate) {
        return next(new Error('Data de início deve ser anterior à data de término'));
    }
    // Se é manutenção preventiva, criar próxima ocorrência
    if (this.type === 'manutencao_preventiva' && this.relatedEquipment) {
        this.title = this.title || `Manutenção Preventiva`;
        this.description = this.description || 'Manutenção preventiva automática gerada pelo sistema';
    }
    // Definir cor baseada no tipo
    if (!this.color) {
        const colorMap = {
            'ordem_servico': '#3B82F6', // Azul
            'manutencao': '#F59E0B', // Amarelo
            'manutencao_preventiva': '#EF4444', // Vermelho
            'instalacao': '#10B981', // Verde
            'treinamento': '#8B5CF6', // Roxo
            'inspecao': '#F97316', // Orange
            'evento_personalizado': '#6B7280' // Cinza
        };
        this.color = colorMap[this.type] || '#6B7280';
    }
    next();
});
// Método para verificar conflitos de agendamento
calendarEventSchema.methods.checkConflicts = async function () {
    const conflictQuery = {
        $and: [
            { _id: { $ne: this._id } },
            { status: { $in: ['agendado', 'confirmado', 'em_andamento'] } },
            {
                $or: [
                    // Evento começa durante outro evento
                    {
                        startDate: { $lte: this.startDate },
                        endDate: { $gt: this.startDate }
                    },
                    // Evento termina durante outro evento
                    {
                        startDate: { $lt: this.endDate },
                        endDate: { $gte: this.endDate }
                    },
                    // Evento engloba outro evento
                    {
                        startDate: { $gte: this.startDate },
                        endDate: { $lte: this.endDate }
                    }
                ]
            }
        ]
    };
    // Verificar conflitos de equipe
    if (this.assignedTo && this.assignedTo.length > 0) {
        const userIds = this.assignedTo.map(assignment => assignment.user);
        conflictQuery['assignedTo.user'] = { $in: userIds };
    }
    // Verificar conflitos de equipamento
    if (this.serviceDetails && this.serviceDetails.requiredEquipment && this.serviceDetails.requiredEquipment.length > 0) {
        const equipmentIds = this.serviceDetails.requiredEquipment.map(req => req.equipment);
        conflictQuery['serviceDetails.requiredEquipment.equipment'] = { $in: equipmentIds };
    }
    return await this.constructor.find(conflictQuery);
};
// Método para gerar eventos recorrentes
calendarEventSchema.methods.generateRecurringEvents = async function () {
    if (!this.recurrence.enabled)
        return [];
    const events = [];
    const baseDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    const duration = endDate.getTime() - baseDate.getTime();
    let currentDate = new Date(baseDate);
    let count = 0;
    while (currentDate <= (this.recurrence.endRecurrence || new Date('2025-12-31')) &&
        (!this.recurrence.maxOccurrences || count < this.recurrence.maxOccurrences)) {
        if (currentDate > baseDate) { // Pular o evento original
            const newEvent = new this.constructor({
                ...this.toObject(),
                _id: undefined,
                startDate: new Date(currentDate),
                endDate: new Date(currentDate.getTime() + duration),
                recurrence: { enabled: false }, // Eventos filhos não são recorrentes
                parentEvent: this._id
            });
            events.push(newEvent);
        }
        // Calcular próxima data baseada no padrão
        switch (this.recurrence.pattern) {
            case 'daily':
                currentDate.setDate(currentDate.getDate() + this.recurrence.interval);
                break;
            case 'weekly':
                currentDate.setDate(currentDate.getDate() + (7 * this.recurrence.interval));
                break;
            case 'monthly':
                currentDate.setMonth(currentDate.getMonth() + this.recurrence.interval);
                break;
            case 'yearly':
                currentDate.setFullYear(currentDate.getFullYear() + this.recurrence.interval);
                break;
        }
        count++;
    }
    return events;
};
// Método estático para buscar eventos por período
calendarEventSchema.statics.findByDateRange = function (startDate, endDate, filters = {}) {
    const query = {
        $and: [
            {
                $or: [
                    // Eventos que começam no período
                    {
                        startDate: { $gte: startDate, $lte: endDate }
                    },
                    // Eventos que terminam no período
                    {
                        endDate: { $gte: startDate, $lte: endDate }
                    },
                    // Eventos que englobam o período
                    {
                        startDate: { $lte: startDate },
                        endDate: { $gte: endDate }
                    }
                ]
            }
        ]
    };
    // Aplicar filtros adicionais
    if (filters.type)
        query.type = filters.type;
    if (filters.status)
        query.status = { $in: Array.isArray(filters.status) ? filters.status : [filters.status] };
    if (filters.assignedTo)
        query['assignedTo.user'] = filters.assignedTo;
    if (filters.client)
        query.client = filters.client;
    if (filters.priority)
        query.priority = filters.priority;
    return this.find(query)
        .populate('assignedTo.user', 'name email')
        .populate('client', 'name email phone')
        .populate('relatedOrder', 'orderNumber service status')
        .populate('relatedEquipment', 'name code category')
        .sort({ startDate: 1 });
};
// Método para verificar disponibilidade de usuário
calendarEventSchema.statics.checkUserAvailability = async function (userId, startDate, endDate, excludeEventId = null) {
    const query = {
        'assignedTo.user': userId,
        status: { $in: ['agendado', 'confirmado', 'em_andamento'] },
        $or: [
            {
                startDate: { $lte: startDate },
                endDate: { $gt: startDate }
            },
            {
                startDate: { $lt: endDate },
                endDate: { $gte: endDate }
            },
            {
                startDate: { $gte: startDate },
                endDate: { $lte: endDate }
            }
        ]
    };
    if (excludeEventId) {
        query._id = { $ne: excludeEventId };
    }
    const conflicts = await this.find(query);
    return conflicts.length === 0;
};
module.exports = mongoose_1.default.model('CalendarEvent', calendarEventSchema);
