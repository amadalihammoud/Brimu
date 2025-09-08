import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Referências
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  assignedTeam: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['supervisor', 'operador', 'auxiliar'],
      default: 'operador'
    }
  }],
  
  // Equipamentos atribuídos
  assignedEquipment: [{
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  
  // Informações do serviço
  serviceDetails: {
    name: {
      type: String,
      required: true
    },
    description: String,
    category: String,
    estimatedDuration: Number, // em horas
    basePrice: Number
  },
  
  // Localização
  location: {
    address: {
      type: String,
      required: true
    },
    neighborhood: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    accessInstructions: String,
    parkingInfo: String
  },
  
  // Agendamento
  scheduling: {
    preferredDate: {
      type: Date,
      required: true
    },
    preferredTimeSlot: {
      type: String,
      enum: ['manha', 'tarde', 'dia_inteiro'],
      default: 'manha'
    },
    scheduledDate: Date,
    scheduledStartTime: Date,
    scheduledEndTime: Date,
    actualStartTime: Date,
    actualEndTime: Date,
    isFlexible: {
      type: Boolean,
      default: true
    }
  },
  
  // Status da ordem
  status: {
    type: String,
    enum: ['pendente', 'em_andamento', 'concluido', 'cancelado'],
    default: 'pendente'
  },
  
  // Progresso
  progress: {
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    currentPhase: {
      type: String,
      enum: ['agendamento', 'preparacao', 'execucao', 'finalizacao', 'concluido'],
      default: 'agendamento'
    },
    notes: [{
      phase: String,
      note: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  
  // Preços e custos
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    additionalCosts: [{
      description: String,
      amount: Number,
      category: {
        type: String,
        enum: ['material', 'equipamento', 'transporte', 'taxa_extra', 'outros']
      }
    }],
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    pendingAmount: {
      type: Number,
      default: 0
    }
  },
  
  // Documentos e evidências
  documents: {
    contract: String, // URL do contrato
    photos: [{
      url: String,
      description: String,
      phase: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    beforePhotos: [String],
    afterPhotos: [String],
    workReport: String,
    invoice: String
  },
  
  // Avaliação e feedback
  evaluation: {
    clientRating: {
      type: Number,
      min: 1,
      max: 5
    },
    clientFeedback: String,
    clientFeedbackDate: Date,
    internalRating: {
      type: Number,
      min: 1,
      max: 5
    },
    internalNotes: String,
    qualityCheck: {
      passed: Boolean,
      notes: String,
      checkedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      checkedAt: Date
    }
  },
  
  // Comunicação
  communication: {
    lastContact: Date,
    contactMethod: {
      type: String,
      enum: ['email', 'telefone', 'whatsapp', 'presencial']
    },
    nextFollowUp: Date,
    reminders: [{
      type: {
        type: String,
        enum: ['agendamento', 'pagamento', 'avaliacao', 'outros']
      },
      scheduledFor: Date,
      sent: Boolean,
      sentAt: Date
    }]
  },
  
  // Configurações especiais
  specialRequirements: {
    equipment: [String],
    materials: [String],
    permits: [String],
    weatherDependent: {
      type: Boolean,
      default: false
    },
    safetyRequirements: [String],
    environmentalConsiderations: [String]
  },
  
  // Metadados
  priority: {
    type: String,
    enum: ['baixa', 'normal', 'alta', 'urgente'],
    default: 'normal'
  },
  source: {
    type: String,
    enum: ['website', 'telefone', 'indicacao', 'redes_sociais', 'outros'],
    default: 'website'
  },
  tags: [String],
  
  // Timestamps automáticos
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
orderSchema.index({ client: 1 });
orderSchema.index({ service: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'scheduling.scheduledDate': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'location.city': 1 });

// Virtual para status formatado
orderSchema.virtual('statusFormatted').get(function() {
  const statusMap = {
    'pendente': 'Pendente',
    'em_andamento': 'Em Andamento',
    'concluido': 'Concluído',
    'cancelado': 'Cancelado'
  };
  return statusMap[this.status] || this.status;
});

// Virtual para prioridade formatada
orderSchema.virtual('priorityFormatted').get(function() {
  const priorityMap = {
    'baixa': 'Baixa',
    'normal': 'Normal',
    'alta': 'Alta',
    'urgente': 'Urgente'
  };
  return priorityMap[this.priority] || this.priority;
});

// Virtual para valor total formatado
orderSchema.virtual('formattedTotalAmount').get(function() {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(this.pricing.totalAmount);
});

// Virtual para valor pendente formatado
orderSchema.virtual('formattedPendingAmount').get(function() {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(this.pricing.pendingAmount);
});

// Virtual para duração estimada formatada
orderSchema.virtual('formattedEstimatedDuration').get(function() {
  if (this.serviceDetails.estimatedDuration < 1) {
    return `${Math.round(this.serviceDetails.estimatedDuration * 60)} minutos`;
  } else if (this.serviceDetails.estimatedDuration === 1) {
    return '1 hora';
  } else {
    return `${this.serviceDetails.estimatedDuration} horas`;
  }
});

// Virtual para data agendada formatada
orderSchema.virtual('formattedScheduledDate').get(function() {
  if (this.scheduling.scheduledDate) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(this.scheduling.scheduledDate);
  }
  return 'Não agendado';
});

// Middleware para atualizar updatedAt
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Middleware para calcular valores pendentes
orderSchema.pre('save', function(next) {
  this.pricing.pendingAmount = this.pricing.totalAmount - this.pricing.paidAmount;
  next();
});

// Método para atualizar status
orderSchema.methods.updateStatus = function(newStatus, notes = null) {
  this.status = newStatus;
  
  if (notes) {
    this.progress.notes.push({
      phase: this.progress.currentPhase,
      note: notes,
      timestamp: new Date()
    });
  }
  
  // Atualizar timestamps baseado no status
  if (newStatus === 'concluido') {
    this.completedAt = new Date();
    this.progress.percentage = 100;
    this.progress.currentPhase = 'concluido';
  } else if (newStatus === 'cancelado') {
    this.cancelledAt = new Date();
  }
  
  return this.save();
};

// Método para adicionar foto
orderSchema.methods.addPhoto = function(url, description, phase) {
  this.documents.photos.push({
    url,
    description,
    phase,
    timestamp: new Date()
  });
  return this.save();
};

// Método para calcular custos adicionais
orderSchema.methods.calculateTotalAmount = function() {
  let total = this.pricing.basePrice;
  
  this.pricing.additionalCosts.forEach(cost => {
    total += cost.amount;
  });
  
  total -= this.pricing.discount;
  
  this.pricing.totalAmount = Math.max(0, total);
  this.pricing.pendingAmount = this.pricing.totalAmount - this.pricing.paidAmount;
  
  return this.pricing.totalAmount;
};

// Método estático para buscar ordens por cliente
orderSchema.statics.findByClient = function(clientId) {
  return this.find({ client: clientId })
    .populate('service', 'name category basePrice')
    .sort({ createdAt: -1 });
};

// Método estático para buscar ordens por status
orderSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('client', 'name email phone')
    .populate('service', 'name category')
    .sort({ createdAt: -1 });
};

// Método estático para buscar ordens agendadas
orderSchema.statics.findScheduled = function(startDate, endDate) {
  return this.find({
    'scheduling.scheduledDate': {
      $gte: startDate,
      $lte: endDate
    },
    status: { $in: ['pendente', 'em_andamento'] }
  })
  .populate('client', 'name phone')
  .populate('service', 'name estimatedDuration')
  .sort({ 'scheduling.scheduledDate': 1 });
};

// Método para verificar conflito de equipamento em data específica
orderSchema.statics.checkEquipmentDateConflict = async function(equipmentId, scheduledDate, excludeOrderId = null) {
  const startOfDay = new Date(scheduledDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(scheduledDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const query = {
    'assignedEquipment.equipment': equipmentId,
    'scheduling.scheduledDate': {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $in: ['pendente', 'em_andamento'] }
  };
  
  if (excludeOrderId) {
    query._id = { $ne: excludeOrderId };
  }
  
  const conflictingOrders = await this.find(query)
    .populate('client', 'name')
    .populate('service', 'name');
    
  return conflictingOrders;
};

// Método para atribuir equipamento à ordem
orderSchema.methods.assignEquipment = async function(equipmentId, assignedBy, notes) {
  // Verificar se equipamento já está atribuído a esta ordem
  const existingAssignment = this.assignedEquipment.find(
    assignment => assignment.equipment.toString() === equipmentId.toString()
  );
  
  if (existingAssignment) {
    throw new Error('Equipamento já está atribuído a esta ordem');
  }
  
  // Verificar conflitos de data se a ordem tem data agendada
  if (this.scheduling.scheduledDate) {
    const conflictingOrders = await this.constructor.checkEquipmentDateConflict(
      equipmentId, 
      this.scheduling.scheduledDate, 
      this._id
    );
    
    if (conflictingOrders.length > 0) {
      const conflictOrder = conflictingOrders[0];
      throw new Error(
        `Equipamento não está disponível na data ${this.scheduling.scheduledDate.toLocaleDateString('pt-BR')}. ` +
        `Já está agendado para a ordem de serviço ${conflictOrder._id} do cliente ${conflictOrder.client.name}.`
      );
    }
  }
  
  this.assignedEquipment.push({
    equipment: equipmentId,
    assignedBy: assignedBy,
    notes: notes
  });
  
  return this.save();
};

// Método para atualizar data agendada verificando conflitos de equipamentos
orderSchema.methods.updateScheduledDate = async function(newScheduledDate) {
  const oldDate = this.scheduling.scheduledDate;
  
  // Se há equipamentos atribuídos, verificar conflitos na nova data
  if (this.assignedEquipment.length > 0) {
    const conflicts = [];
    
    for (const assignment of this.assignedEquipment) {
      const conflictingOrders = await this.constructor.checkEquipmentDateConflict(
        assignment.equipment,
        newScheduledDate,
        this._id
      );
      
      if (conflictingOrders.length > 0) {
        const equipment = await this.model('Equipment').findById(assignment.equipment);
        conflicts.push({
          equipment: equipment,
          conflictingOrder: conflictingOrders[0]
        });
      }
    }
    
    if (conflicts.length > 0) {
      const conflictMessages = conflicts.map(conflict => 
        `${conflict.equipment.name} (${conflict.equipment.code}) - conflito com ordem ${conflict.conflictingOrder._id}`
      );
      throw new Error(
        `Não é possível agendar para ${newScheduledDate.toLocaleDateString('pt-BR')}. ` +
        `Conflitos de equipamentos: ${conflictMessages.join(', ')}`
      );
    }
  }
  
  this.scheduling.scheduledDate = newScheduledDate;
  return this.save();
};

// Método para remover equipamento da ordem
orderSchema.methods.removeEquipment = function(equipmentId) {
  this.assignedEquipment = this.assignedEquipment.filter(
    assignment => assignment.equipment.toString() !== equipmentId.toString()
  );
  
  return this.save();
};

// Método estático para listar equipamentos disponíveis em uma data
orderSchema.statics.getAvailableEquipment = async function(scheduledDate, excludeOrderId = null) {
  const Equipment = this.model('Equipment');
  
  // Buscar todos os equipamentos ativos
  const allEquipment = await Equipment.find({ 
    status: 'ativo',
    isActive: true 
  });
  
  const startOfDay = new Date(scheduledDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(scheduledDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Buscar ordens que têm equipamentos atribuídos na data especificada
  const query = {
    'scheduling.scheduledDate': {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $in: ['pendente', 'em_andamento'] },
    assignedEquipment: { $exists: true, $not: { $size: 0 } }
  };
  
  if (excludeOrderId) {
    query._id = { $ne: excludeOrderId };
  }
  
  const occupiedOrders = await this.find(query).select('assignedEquipment');
  const occupiedEquipmentIds = new Set();
  
  occupiedOrders.forEach(order => {
    order.assignedEquipment.forEach(assignment => {
      occupiedEquipmentIds.add(assignment.equipment.toString());
    });
  });
  
  // Filtrar equipamentos disponíveis
  const availableEquipment = allEquipment.filter(equipment => 
    !occupiedEquipmentIds.has(equipment._id.toString())
  );
  
  return availableEquipment;
};

// Método estático para buscar ordens por equipamento
orderSchema.statics.findByEquipment = function(equipmentId) {
  return this.find({ 'assignedEquipment.equipment': equipmentId })
    .populate('client', 'name email phone')
    .populate('service', 'name category')
    .populate('assignedEquipment.equipment', 'name code brand model')
    .sort({ createdAt: -1 });
};

// Método estático para estatísticas
orderSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pendente'] }, 1, 0] }
        },
        inProgressOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'em_andamento'] }, 1, 0] }
        },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'concluido'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelado'] }, 1, 0] }
        },
        totalRevenue: { $sum: '$pricing.totalAmount' },
        totalPaid: { $sum: '$pricing.paidAmount' },
        totalPending: { $sum: '$pricing.pendingAmount' },
        averageRating: { $avg: '$evaluation.clientRating' }
      }
    }
  ]);
  
  return stats[0] || {
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    totalPaid: 0,
    totalPending: 0,
    averageRating: 0
  };
};

const Order = mongoose.model('Order', orderSchema);
export default Order;
