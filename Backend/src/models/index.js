// Modelos do sistema Brimu
const User = require('./User');
const Service = require('./Service');
const Order = require('./Order');
const Quote = require('./Quote');
const Payment = require('./Payment');
const File = require('./File');
const Equipment = require('./Equipment');

// Estabelecer relacionamentos entre modelos

// User -> Order (1:N)
// Um usuário pode ter múltiplas ordens de serviço
User.schema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'client'
});

// User -> Quote (1:N)
// Um usuário pode ter múltiplos orçamentos
User.schema.virtual('quotes', {
  ref: 'Quote',
  localField: '_id',
  foreignField: 'client'
});

// User -> Payment (1:N)
// Um usuário pode ter múltiplos pagamentos
User.schema.virtual('payments', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'client'
});

// Service -> Order (1:N)
// Um serviço pode ter múltiplas ordens
Service.schema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'service'
});

// Service -> Quote (1:N)
// Um serviço pode ter múltiplos orçamentos
Service.schema.virtual('quotes', {
  ref: 'Quote',
  localField: '_id',
  foreignField: 'service'
});

// Order -> Quote (1:1)
// Uma ordem pode ter um orçamento associado
Order.schema.virtual('quote', {
  ref: 'Quote',
  localField: '_id',
  foreignField: 'order',
  justOne: true
});

// Order -> Payment (1:N)
// Uma ordem pode ter múltiplos pagamentos
Order.schema.virtual('payments', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'order'
});

// Quote -> Order (1:1)
// Um orçamento pode gerar uma ordem
Quote.schema.virtual('generatedOrder', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'quote',
  justOne: true
});

// Quote -> Payment (1:N)
// Um orçamento pode ter múltiplos pagamentos
Quote.schema.virtual('payments', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'quote'
});

// Equipment -> Order (N:1)
// Um equipamento pode estar atribuído a uma ordem
Equipment.schema.virtual('order', {
  ref: 'Order',
  localField: 'assignedOrder',
  foreignField: '_id',
  justOne: true
});

// Equipment -> User (N:1)
// Um equipamento pode estar atribuído a um usuário
Equipment.schema.virtual('assignedUser', {
  ref: 'User',
  localField: 'assignedTo',
  foreignField: '_id',
  justOne: true
});

// User -> Equipment (1:N)
// Um usuário pode ter múltiplos equipamentos atribuídos
User.schema.virtual('assignedEquipment', {
  ref: 'Equipment',
  localField: '_id',
  foreignField: 'assignedTo'
});

// Order -> Equipment (1:N)
// Uma ordem pode ter múltiplos equipamentos atribuídos
// Nota: assignedEquipment é um campo real no schema, não um virtual

// Configurar opções de população
User.schema.set('toJSON', { virtuals: true });
Service.schema.set('toJSON', { virtuals: true });
Order.schema.set('toJSON', { virtuals: true });
Quote.schema.set('toJSON', { virtuals: true });
Payment.schema.set('toJSON', { virtuals: true });
Equipment.schema.set('toJSON', { virtuals: true });

module.exports = {
  User,
  Service,
  Order,
  Quote,
  Payment,
  File,
  Equipment
};
