import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema({
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
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Informações do orçamento
  quoteNumber: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Status do orçamento
  status: {
    type: String,
    enum: ['rascunho', 'enviado', 'aprovado', 'rejeitado', 'convertido'],
    default: 'rascunho'
  },
  
  // Localização do serviço
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
    accessInstructions: String
  },
  
  // Itens do orçamento
  items: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    category: {
      type: String,
      enum: ['servico', 'material', 'equipamento', 'transporte', 'taxa', 'outros'],
      default: 'servico'
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.01
    },
    unit: {
      type: String,
      required: true
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    isOptional: {
      type: Boolean,
      default: false
    },
    notes: String
  }],
  
  // Preços e custos
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    discountType: {
      type: String,
      enum: ['percentual', 'valor_fixo'],
      default: 'valor_fixo'
    },
    discountReason: String,
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    validUntil: {
      type: Date,
      required: true
    }
  },
  
  // Condições e termos
  terms: {
    paymentTerms: {
      type: String,
      default: '50% na aprovação, 50% na conclusão'
    },
    warranty: {
      type: String,
      default: '90 dias para serviços de poda, 1 ano para plantios'
    },
    cancellationPolicy: {
      type: String,
      default: 'Cancelamento gratuito até 24h antes do agendamento'
    },
    specialConditions: [String],
    notes: String
  },
  
  // Agendamento proposto
  proposedScheduling: {
    preferredDates: [Date],
    preferredTimeSlots: [{
      type: String,
      enum: ['manha', 'tarde', 'dia_inteiro']
    }],
    estimatedDuration: Number, // em horas
    isFlexible: {
      type: Boolean,
      default: true
    },
    weatherDependent: {
      type: Boolean,
      default: false
    }
  },
  
  // Documentos e anexos
  documents: {
    quotePdf: String, // URL do PDF do orçamento
    photos: [{
      url: String,
      description: String,
      category: {
        type: String,
        enum: ['antes', 'referencia', 'localizacao', 'outros']
      }
    }],
    attachments: [{
      name: String,
      url: String,
      type: String,
      size: Number
    }]
  },
  
  // Comunicação e follow-up
  communication: {
    sentAt: Date,
    sentVia: {
      type: String,
      enum: ['email', 'whatsapp', 'presencial', 'telefone']
    },
    clientViewedAt: Date,
    lastFollowUp: Date,
    nextFollowUp: Date,
    reminders: [{
      scheduledFor: Date,
      sent: Boolean,
      sentAt: Date,
      type: {
        type: String,
        enum: ['lembrete', 'promocao', 'atualizacao']
      }
    }],
    clientQuestions: [{
      question: String,
      answer: String,
      askedAt: Date,
      answeredAt: Date,
      answeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  
  // Aprovação/Rejeição
  approval: {
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: String,
    clientFeedback: String,
    counterOffer: {
      amount: Number,
      notes: String,
      proposedAt: Date
    }
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
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  convertedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
quoteSchema.index({ client: 1 });
quoteSchema.index({ service: 1 });
quoteSchema.index({ status: 1 });
quoteSchema.index({ quoteNumber: 1 });
quoteSchema.index({ createdAt: -1 });
quoteSchema.index({ 'pricing.validUntil': 1 });

// Virtual para status formatado
quoteSchema.virtual('statusFormatted').get(function() {
  const statusMap = {
    'rascunho': 'Rascunho',
    'enviado': 'Enviado',
    'aprovado': 'Aprovado',
    'rejeitado': 'Rejeitado'
  };
  return statusMap[this.status] || this.status;
});

// Virtual para valor total formatado
quoteSchema.virtual('formattedTotalAmount').get(function() {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(this.pricing.totalAmount);
});

// Virtual para desconto formatado
quoteSchema.virtual('formattedDiscount').get(function() {
  if (this.pricing.discountType === 'percentual') {
    return `${this.pricing.discount}%`;
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(this.pricing.discount);
});

// Virtual para validade formatada
quoteSchema.virtual('formattedValidUntil').get(function() {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(this.pricing.validUntil);
});

// Virtual para dias até expirar
quoteSchema.virtual('daysUntilExpiry').get(function() {
  const today = new Date();
  const expiry = new Date(this.pricing.validUntil);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual para status de expiração
quoteSchema.virtual('isExpired').get(function() {
  return new Date() > new Date(this.pricing.validUntil);
});

// Virtual para status de urgência
quoteSchema.virtual('isUrgent').get(function() {
  return this.daysUntilExpiry <= 3 && this.status === 'enviado';
});

// Middleware para gerar número do orçamento
quoteSchema.pre('save', async function(next) {
  if (this.isNew && !this.quoteNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.quoteNumber = `ORC${year}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Middleware para calcular total
quoteSchema.pre('save', function(next) {
  // Calcular subtotal
  this.pricing.subtotal = this.items.reduce((sum, item) => {
    return sum + item.totalPrice;
  }, 0);
  
  // Calcular desconto
  let discount = this.pricing.discount;
  if (this.pricing.discountType === 'percentual') {
    discount = (this.pricing.subtotal * this.pricing.discount) / 100;
  }
  
  // Calcular total
  this.pricing.totalAmount = this.pricing.subtotal - discount + this.pricing.tax;
  
  // Definir data de expiração se não estiver definida
  if (!this.pricing.validUntil) {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30); // 30 dias
    this.pricing.validUntil = validUntil;
  }
  
  next();
});

// Middleware para atualizar updatedAt
quoteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Método para aprovar orçamento
quoteSchema.methods.approve = function(approvedBy, clientFeedback = null) {
  this.status = 'aprovado';
  this.approval.approvedAt = new Date();
  this.approval.approvedBy = approvedBy;
  if (clientFeedback) {
    this.approval.clientFeedback = clientFeedback;
  }
  return this.save();
};

// Método para rejeitar orçamento
quoteSchema.methods.reject = function(rejectedBy, reason, clientFeedback = null) {
  this.status = 'rejeitado';
  this.approval.rejectedAt = new Date();
  this.approval.rejectedBy = rejectedBy;
  this.approval.rejectionReason = reason;
  if (clientFeedback) {
    this.approval.clientFeedback = clientFeedback;
  }
  return this.save();
};

// Método para enviar orçamento
quoteSchema.methods.send = function(sentVia) {
  this.status = 'enviado';
  this.communication.sentAt = new Date();
  this.communication.sentVia = sentVia;
  return this.save();
};

// Método para adicionar item
quoteSchema.methods.addItem = function(itemData) {
  const item = {
    ...itemData,
    totalPrice: itemData.quantity * itemData.unitPrice
  };
  this.items.push(item);
  return this.save();
};

// Método para calcular total dos itens
quoteSchema.methods.calculateTotal = function() {
  this.pricing.subtotal = this.items.reduce((sum, item) => {
    return sum + (item.quantity * item.unitPrice);
  }, 0);
  
  let discount = this.pricing.discount;
  if (this.pricing.discountType === 'percentual') {
    discount = (this.pricing.subtotal * this.pricing.discount) / 100;
  }
  
  this.pricing.totalAmount = this.pricing.subtotal - discount + this.pricing.tax;
  return this.pricing.totalAmount;
};

// Método estático para buscar orçamentos por cliente
quoteSchema.statics.findByClient = function(clientId) {
  return this.find({ client: clientId })
    .populate('service', 'name category basePrice')
    .sort({ createdAt: -1 });
};

// Método estático para buscar orçamentos por status
quoteSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('client', 'name email phone')
    .populate('service', 'name category')
    .sort({ createdAt: -1 });
};

// Método estático para buscar orçamentos expirados
quoteSchema.statics.findExpired = function() {
  return this.find({
    'pricing.validUntil': { $lt: new Date() },
    status: { $in: ['enviado', 'rascunho'] }
  })
  .populate('client', 'name email')
  .populate('service', 'name');
};

// Método estático para buscar orçamentos próximos do vencimento
quoteSchema.statics.findExpiringSoon = function(days = 3) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    'pricing.validUntil': {
      $gte: new Date(),
      $lte: futureDate
    },
    status: 'enviado'
  })
  .populate('client', 'name email phone')
  .populate('service', 'name');
};

// Método estático para estatísticas
quoteSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalQuotes: { $sum: 1 },
        draftQuotes: {
          $sum: { $cond: [{ $eq: ['$status', 'rascunho'] }, 1, 0] }
        },
        sentQuotes: {
          $sum: { $cond: [{ $eq: ['$status', 'enviado'] }, 1, 0] }
        },
        approvedQuotes: {
          $sum: { $cond: [{ $eq: ['$status', 'aprovado'] }, 1, 0] }
        },
        rejectedQuotes: {
          $sum: { $cond: [{ $eq: ['$status', 'rejeitado'] }, 1, 0] }
        },
        totalValue: { $sum: '$pricing.totalAmount' },
        approvedValue: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'aprovado'] },
              '$pricing.totalAmount',
              0
            ]
          }
        },
        conversionRate: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'aprovado'] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
  
  const result = stats[0] || {
    totalQuotes: 0,
    draftQuotes: 0,
    sentQuotes: 0,
    approvedQuotes: 0,
    rejectedQuotes: 0,
    totalValue: 0,
    approvedValue: 0,
    conversionRate: 0
  };
  
  // Calcular taxa de conversão em percentual
  if (result.totalQuotes > 0) {
    result.conversionRate = (result.approvedQuotes / result.totalQuotes) * 100;
  }
  
  return result;
};

const Quote = mongoose.model('Quote', quoteSchema);
export default Quote;
