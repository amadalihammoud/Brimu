import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Referências
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  quote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Informações do pagamento
  paymentNumber: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Status do pagamento
  status: {
    type: String,
    enum: ['pendente', 'pago', 'cancelado'],
    default: 'pendente'
  },
  
  // Valores
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  currency: {
    type: String,
    default: 'BRL',
    enum: ['BRL', 'USD', 'EUR']
  },
  
  // Método de pagamento
  paymentMethod: {
    type: String,
    enum: [
      'dinheiro',
      'pix',
      'cartao_credito',
      'cartao_debito',
      'transferencia_bancaria',
      'boleto',
      'cheque',
      'outros'
    ],
    required: true
  },
  
  // Detalhes do pagamento
  paymentDetails: {
    // Para PIX
    pixKey: String,
    pixCode: String,
    
    // Para cartão
    cardLastDigits: String,
    cardBrand: String,
    installments: {
      type: Number,
      default: 1,
      min: 1
    },
    
    // Para transferência
    bankName: String,
    bankAccount: String,
    bankAgency: String,
    
    // Para boleto
    boletoCode: String,
    boletoDueDate: Date,
    
    // Para cheque
    checkNumber: String,
    checkBank: String,
    checkDueDate: Date,
    
    // Transação externa
    externalTransactionId: String,
    externalGateway: String
  },
  
  // Datas importantes
  dueDate: {
    type: Date,
    required: true
  },
  paidAt: Date,
  cancelledAt: Date,
  
  // Comprovantes
  receipts: [{
    type: {
      type: String,
      enum: ['comprovante', 'nota_fiscal', 'recibo', 'outros']
    },
    url: String,
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Notas e observações
  notes: String,
  internalNotes: String,
  
  // Taxas e descontos
  fees: {
    processingFee: {
      type: Number,
      default: 0
    },
    lateFee: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    discountReason: String
  },
  
  // Status de cobrança
  billing: {
    attempts: {
      type: Number,
      default: 0
    },
    lastAttempt: Date,
    nextAttempt: Date,
    maxAttempts: {
      type: Number,
      default: 3
    },
    isOverdue: {
      type: Boolean,
      default: false
    }
  },
  
  // Reembolso
  refund: {
    requestedAt: Date,
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    processedAt: Date,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    reason: String,
    status: {
      type: String,
      enum: ['solicitado', 'processando', 'processado', 'negado'],
      default: 'solicitado'
    }
  },
  
  // Metadados
  priority: {
    type: String,
    enum: ['baixa', 'normal', 'alta', 'urgente'],
    default: 'normal'
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
paymentSchema.index({ client: 1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ quote: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentNumber: 1 });
paymentSchema.index({ dueDate: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual para status formatado
paymentSchema.virtual('statusFormatted').get(function() {
  const statusMap = {
    'pendente': 'Pendente',
    'pago': 'Pago',
    'cancelado': 'Cancelado'
  };
  return statusMap[this.status] || this.status;
});

// Virtual para método de pagamento formatado
paymentSchema.virtual('paymentMethodFormatted').get(function() {
  const methods = {
    'dinheiro': 'Dinheiro',
    'pix': 'PIX',
    'cartao_credito': 'Cartão de Crédito',
    'cartao_debito': 'Cartão de Débito',
    'transferencia_bancaria': 'Transferência Bancária',
    'boleto': 'Boleto',
    'cheque': 'Cheque',
    'outros': 'Outros'
  };
  return methods[this.paymentMethod] || this.paymentMethod;
});

// Virtual para valor formatado
paymentSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

// Virtual para data de vencimento formatada
paymentSchema.virtual('formattedDueDate').get(function() {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(this.dueDate);
});

// Virtual para data de pagamento formatada
paymentSchema.virtual('formattedPaidAt').get(function() {
  if (this.paidAt) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(this.paidAt);
  }
  return null;
});

// Virtual para dias em atraso
paymentSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'pendente' && this.dueDate < new Date()) {
    const today = new Date();
    const diffTime = today - this.dueDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual para status de vencimento
paymentSchema.virtual('isOverdue').get(function() {
  return this.status === 'pendente' && this.dueDate < new Date();
});

// Virtual para status de urgência
paymentSchema.virtual('isUrgent').get(function() {
  const today = new Date();
  const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
  return this.status === 'pendente' && this.dueDate <= threeDaysFromNow;
});

// Middleware para gerar número do pagamento
paymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.paymentNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.paymentNumber = `PAG${year}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Middleware para atualizar updatedAt
paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Middleware para verificar vencimento
paymentSchema.pre('save', function(next) {
  if (this.status === 'pendente' && this.dueDate < new Date()) {
    this.billing.isOverdue = true;
  }
  next();
});

// Método para marcar como pago
paymentSchema.methods.markAsPaid = function(paidBy, notes = null) {
  this.status = 'pago';
  this.paidAt = new Date();
  this.billing.isOverdue = false;
  if (notes) {
    this.notes = notes;
  }
  return this.save();
};

// Método para cancelar pagamento
paymentSchema.methods.cancel = function(cancelledBy, reason = null) {
  this.status = 'cancelado';
  this.cancelledAt = new Date();
  if (reason) {
    this.notes = reason;
  }
  return this.save();
};

// Método para adicionar comprovante
paymentSchema.methods.addReceipt = function(receiptData) {
  this.receipts.push({
    ...receiptData,
    uploadedAt: new Date()
  });
  return this.save();
};

// Método para registrar tentativa de cobrança
paymentSchema.methods.recordBillingAttempt = function() {
  this.billing.attempts += 1;
  this.billing.lastAttempt = new Date();
  
  // Calcular próxima tentativa (3 dias depois)
  const nextAttempt = new Date();
  nextAttempt.setDate(nextAttempt.getDate() + 3);
  this.billing.nextAttempt = nextAttempt;
  
  return this.save();
};

// Método para solicitar reembolso
paymentSchema.methods.requestRefund = function(requestedBy, reason, amount = null) {
  this.refund.requestedAt = new Date();
  this.refund.requestedBy = requestedBy;
  this.refund.reason = reason;
  this.refund.amount = amount || this.amount;
  this.refund.status = 'solicitado';
  return this.save();
};

// Método para processar reembolso
paymentSchema.methods.processRefund = function(processedBy) {
  this.refund.processedAt = new Date();
  this.refund.processedBy = processedBy;
  this.refund.status = 'processado';
  return this.save();
};

// Método estático para buscar pagamentos por cliente
paymentSchema.statics.findByClient = function(clientId) {
  return this.find({ client: clientId })
    .populate('order', 'serviceDetails.name status')
    .populate('quote', 'title status')
    .sort({ createdAt: -1 });
};

// Método estático para buscar pagamentos por status
paymentSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('client', 'name email phone')
    .populate('order', 'serviceDetails.name')
    .populate('quote', 'title')
    .sort({ createdAt: -1 });
};

// Método estático para buscar pagamentos vencidos
paymentSchema.statics.findOverdue = function() {
  return this.find({
    status: 'pendente',
    dueDate: { $lt: new Date() }
  })
  .populate('client', 'name email phone')
  .populate('order', 'serviceDetails.name')
  .populate('quote', 'title')
  .sort({ dueDate: 1 });
};

// Método estático para buscar pagamentos próximos do vencimento
paymentSchema.statics.findDueSoon = function(days = 3) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    status: 'pendente',
    dueDate: {
      $gte: new Date(),
      $lte: futureDate
    }
  })
  .populate('client', 'name email phone')
  .populate('order', 'serviceDetails.name')
  .populate('quote', 'title')
  .sort({ dueDate: 1 });
};

// Método estático para estatísticas
paymentSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        pendingPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'pendente'] }, 1, 0] }
        },
        paidPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'pago'] }, 1, 0] }
        },
        cancelledPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelado'] }, 1, 0] }
        },
        totalAmount: { $sum: '$amount' },
        paidAmount: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'pago'] },
              '$amount',
              0
            ]
          }
        },
        pendingAmount: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'pendente'] },
              '$amount',
              0
            ]
          }
        },
        overdueAmount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'pendente'] },
                  { $lt: ['$dueDate', new Date()] }
                ]
              },
              '$amount',
              0
            ]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalPayments: 0,
    pendingPayments: 0,
    paidPayments: 0,
    cancelledPayments: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0
  };
};

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
