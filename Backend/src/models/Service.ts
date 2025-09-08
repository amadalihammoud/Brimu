const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  // Informações básicas do serviço
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: [
      'poda_arborea',
      'remocao_arvore',
      'plantio_arvore',
      'manutencao_jardim',
      'limpeza_terreno',
      'consultoria_arborea',
      'emergencia_arborea',
      'outros'
    ],
    default: 'outros'
  },
  
  // Preços e custos
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  priceUnit: {
    type: String,
    enum: ['por_servico', 'por_hora', 'por_metro_quadrado', 'por_arvore'],
    default: 'por_servico'
  },
  
  // Duração estimada
  estimatedDuration: {
    type: Number, // em horas
    required: true,
    min: 0.5
  },
  
  // Equipamentos necessários
  requiredEquipment: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    isEssential: {
      type: Boolean,
      default: true
    }
  }],
  
  // Materiais necessários
  requiredMaterials: [{
    name: {
      type: String,
      required: true
    },
    quantity: Number,
    unit: String,
    isEssential: {
      type: Boolean,
      default: true
    }
  }],
  
  // Requisitos e condições
  requirements: {
    minTeamSize: {
      type: Number,
      default: 1,
      min: 1
    },
    maxTeamSize: {
      type: Number,
      default: 5,
      min: 1
    },
    weatherDependent: {
      type: Boolean,
      default: false
    },
    permitRequired: {
      type: Boolean,
      default: false
    },
    specialConditions: [String]
  },
  
  // Status e disponibilidade
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  // Estatísticas
  stats: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  
  // Metadados
  tags: [String],
  images: [String], // URLs das imagens
  documents: [String], // URLs dos documentos
  
  // Configurações
  settings: {
    allowOnlineBooking: {
      type: Boolean,
      default: true
    },
    requiresApproval: {
      type: Boolean,
      default: false
    },
    maxAdvanceBooking: {
      type: Number,
      default: 30 // dias
    },
    minAdvanceBooking: {
      type: Number,
      default: 1 // dias
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
serviceSchema.index({ name: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1, isAvailable: 1 });
serviceSchema.index({ 'stats.averageRating': -1 });

// Virtual para categoria formatada
serviceSchema.virtual('categoryFormatted').get(function() {
  const categories = {
    'poda_arborea': 'Poda Arbórea',
    'remocao_arvore': 'Remoção de Árvore',
    'plantio_arvore': 'Plantio de Árvore',
    'manutencao_jardim': 'Manutenção de Jardim',
    'limpeza_terreno': 'Limpeza de Terreno',
    'consultoria_arborea': 'Consultoria Arbórea',
    'emergencia_arborea': 'Emergência Arbórea',
    'outros': 'Outros'
  };
  return categories[this.category] || this.category;
});

// Virtual para preço formatado
serviceSchema.virtual('formattedPrice').get(function() {
  const units = {
    'por_servico': 'por serviço',
    'por_hora': 'por hora',
    'por_metro_quadrado': 'por m²',
    'por_arvore': 'por árvore'
  };
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(this.basePrice) + ` ${units[this.priceUnit]}`;
});

// Virtual para duração formatada
serviceSchema.virtual('formattedDuration').get(function() {
  if (this.estimatedDuration < 1) {
    return `${Math.round(this.estimatedDuration * 60)} minutos`;
  } else if (this.estimatedDuration === 1) {
    return '1 hora';
  } else {
    return `${this.estimatedDuration} horas`;
  }
});

// Método para atualizar estatísticas
serviceSchema.methods.updateStats = function(orderValue, rating = null) {
  this.stats.totalOrders += 1;
  this.stats.totalRevenue += orderValue;
  
  if (rating !== null) {
    const totalRating = this.stats.averageRating * this.stats.totalRatings;
    this.stats.totalRatings += 1;
    this.stats.averageRating = (totalRating + rating) / this.stats.totalRatings;
  }
  
  return this.save();
};

// Método para verificar disponibilidade
serviceSchema.methods.isAvailableForDate = function(date) {
  if (!this.isActive || !this.isAvailable) return false;
  
  const today = new Date();
  const bookingDate = new Date(date);
  const daysDiff = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24));
  
  return daysDiff >= this.settings.minAdvanceBooking && 
         daysDiff <= this.settings.maxAdvanceBooking;
};

// Método estático para buscar serviços por categoria
serviceSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category, 
    isActive: true, 
    isAvailable: true 
  }).sort({ 'stats.averageRating': -1, name: 1 });
};

// Método estático para buscar serviços populares
serviceSchema.statics.findPopular = function(limit = 10) {
  return this.find({ 
    isActive: true, 
    isAvailable: true 
  })
  .sort({ 'stats.totalOrders': -1, 'stats.averageRating': -1 })
  .limit(limit);
};

// Método estático para estatísticas gerais
serviceSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalServices: { $sum: 1 },
        activeServices: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        availableServices: {
          $sum: { $cond: [{ $and: [{ $eq: ['$isActive', true] }, { $eq: ['$isAvailable', true] }] }, 1, 0] }
        },
        totalOrders: { $sum: '$stats.totalOrders' },
        totalRevenue: { $sum: '$stats.totalRevenue' },
        averageRating: { $avg: '$stats.averageRating' }
      }
    }
  ]);
  
  return stats[0] || {
    totalServices: 0,
    activeServices: 0,
    availableServices: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0
  };
};

module.exports = mongoose.model('Service', serviceSchema);
