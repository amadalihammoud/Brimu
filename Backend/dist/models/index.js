"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Equipment = exports.File = exports.Payment = exports.Quote = exports.Order = exports.Service = exports.User = void 0;
// Modelos do sistema Brimu
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Service_1 = __importDefault(require("./Service"));
exports.Service = Service_1.default;
const Order_1 = __importDefault(require("./Order"));
exports.Order = Order_1.default;
const Quote_1 = __importDefault(require("./Quote"));
exports.Quote = Quote_1.default;
const Payment_1 = __importDefault(require("./Payment"));
exports.Payment = Payment_1.default;
const File_1 = __importDefault(require("./File"));
exports.File = File_1.default;
const Equipment_1 = __importDefault(require("./Equipment"));
exports.Equipment = Equipment_1.default;
// Estabelecer relacionamentos entre modelos
// User -> Order (1:N)
// Um usuário pode ter múltiplas ordens de serviço
User_1.default.schema.virtual('orders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'client'
});
// User -> Quote (1:N)
// Um usuário pode ter múltiplos orçamentos
User_1.default.schema.virtual('quotes', {
    ref: 'Quote',
    localField: '_id',
    foreignField: 'client'
});
// User -> Payment (1:N)
// Um usuário pode ter múltiplos pagamentos
User_1.default.schema.virtual('payments', {
    ref: 'Payment',
    localField: '_id',
    foreignField: 'client'
});
// Service -> Order (1:N)
// Um serviço pode ter múltiplas ordens
Service_1.default.schema.virtual('orders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'service'
});
// Service -> Quote (1:N)
// Um serviço pode ter múltiplos orçamentos
Service_1.default.schema.virtual('quotes', {
    ref: 'Quote',
    localField: '_id',
    foreignField: 'service'
});
// Order -> Quote (1:1)
// Uma ordem pode ter um orçamento associado
Order_1.default.schema.virtual('quote', {
    ref: 'Quote',
    localField: '_id',
    foreignField: 'order',
    justOne: true
});
// Order -> Payment (1:N)
// Uma ordem pode ter múltiplos pagamentos
Order_1.default.schema.virtual('payments', {
    ref: 'Payment',
    localField: '_id',
    foreignField: 'order'
});
// Quote -> Order (1:1)
// Um orçamento pode gerar uma ordem
Quote_1.default.schema.virtual('generatedOrder', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'quote',
    justOne: true
});
// Quote -> Payment (1:N)
// Um orçamento pode ter múltiplos pagamentos
Quote_1.default.schema.virtual('payments', {
    ref: 'Payment',
    localField: '_id',
    foreignField: 'quote'
});
// Equipment -> Order (N:1)
// Um equipamento pode estar atribuído a uma ordem
Equipment_1.default.schema.virtual('order', {
    ref: 'Order',
    localField: 'assignedOrder',
    foreignField: '_id',
    justOne: true
});
// Equipment -> User (N:1)
// Um equipamento pode estar atribuído a um usuário
Equipment_1.default.schema.virtual('assignedUser', {
    ref: 'User',
    localField: 'assignedTo',
    foreignField: '_id',
    justOne: true
});
// User -> Equipment (1:N)
// Um usuário pode ter múltiplos equipamentos atribuídos
User_1.default.schema.virtual('assignedEquipment', {
    ref: 'Equipment',
    localField: '_id',
    foreignField: 'assignedTo'
});
// Order -> Equipment (1:N)
// Uma ordem pode ter múltiplos equipamentos atribuídos
// Nota: assignedEquipment é um campo real no schema, não um virtual
// Configurar opções de população
User_1.default.schema.set('toJSON', { virtuals: true });
Service_1.default.schema.set('toJSON', { virtuals: true });
Order_1.default.schema.set('toJSON', { virtuals: true });
Quote_1.default.schema.set('toJSON', { virtuals: true });
Payment_1.default.schema.set('toJSON', { virtuals: true });
Equipment_1.default.schema.set('toJSON', { virtuals: true });
