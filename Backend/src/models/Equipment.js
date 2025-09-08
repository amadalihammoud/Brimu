const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['preventiva', 'corretiva', 'inspecao'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  performedAt: {
    type: Date,
    default: Date.now
  },
  cost: {
    type: Number,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['completa', 'pendente', 'cancelada'],
    default: 'completa'
  }
}, {
  timestamps: true
});

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    required: true,
    enum: ['motosserra', 'poda_alta', 'rocadeira', 'cortador_grama', 'caminhao', 'reboque', 'epi', 'outros']
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true
  },
  purchaseDate: {
    type: Date
  },
  purchasePrice: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['ativo', 'manutencao', 'inativo', 'aposentado'],
    default: 'ativo'
  },
  location: {
    type: String,
    trim: true,
    default: 'Depósito'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  maintenance: {
    preventiveInterval: {
      type: Number,
      default: 30
    },
    lastMaintenance: {
      type: Date
    },
    nextMaintenance: {
      type: Date
    },
    maintenanceHistory: [maintenanceSchema]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

equipmentSchema.index({ code: 1 });
equipmentSchema.index({ status: 1 });
equipmentSchema.index({ category: 1 });
equipmentSchema.index({ assignedTo: 1 });
equipmentSchema.index({ isActive: 1 });

equipmentSchema.virtual('daysUntilMaintenance').get(function() {
  if (!this.maintenance?.nextMaintenance) return null;
  const today = new Date();
  const diffTime = this.maintenance.nextMaintenance - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

equipmentSchema.virtual('maintenanceStatus').get(function() {
  const daysUntil = this.daysUntilMaintenance;
  if (daysUntil === null) return 'desconhecido';
  if (daysUntil <= 0) return 'vencida';
  if (daysUntil <= 7) return 'proxima';
  return 'ok';
});

equipmentSchema.methods.scheduleNextMaintenance = function() {
  const interval = this.maintenance.preventiveInterval || 30;
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  this.maintenance.nextMaintenance = nextDate;
  return this.save();
};

equipmentSchema.methods.recordMaintenance = function(maintenanceData) {
  this.maintenance.maintenanceHistory.push(maintenanceData);
  this.maintenance.lastMaintenance = new Date();
  
  if (maintenanceData.type === 'preventiva') {
    this.scheduleNextMaintenance();
  }
  
  return this.save();
};

equipmentSchema.methods.assignToOrder = function(orderId, userId) {
  this.assignedOrder = orderId;
  this.assignedTo = userId;
  this.status = 'ativo';
  return this.save();
};

equipmentSchema.methods.releaseFromOrder = function() {
  this.assignedOrder = null;
  this.assignedTo = null;
  return this.save();
};

equipmentSchema.pre('save', function(next) {
  if (!this.code && this.isNew) {
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
    const prefix = categoryPrefixes[this.category] || 'EQP';
    const year = new Date().getFullYear().toString().substr(-2);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.code = `${prefix}${year}${random}`;
  }
  next();
});

equipmentSchema.set('toJSON', { virtuals: true });
equipmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Equipment', equipmentSchema);
