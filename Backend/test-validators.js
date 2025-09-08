// Teste rápido dos validadores
const { userRegisterSchema, userLoginSchema } = require('./dist/schemas/user');
const { equipmentCreateSchema } = require('./dist/schemas/equipment');

console.log('🧪 Testando Validadores...\n');

// Teste 1: Validação de usuário válido
console.log('1. Teste de registro válido:');
const validUser = {
  name: 'João Silva',
  email: 'joao@example.com',
  password: 'Password123'
};
const { error: error1 } = userRegisterSchema.validate(validUser);
console.log(error1 ? `❌ ${error1.details[0].message}` : '✅ Dados válidos');

// Teste 2: Validação de email inválido
console.log('\n2. Teste de email inválido:');
const invalidUser = {
  name: 'João Silva',
  email: 'email-inválido',
  password: 'Password123'
};
const { error: error2 } = userRegisterSchema.validate(invalidUser);
console.log(error2 ? `❌ ${error2.details[0].message}` : '✅ Dados válidos');

// Teste 3: Validação de senha fraca
console.log('\n3. Teste de senha fraca:');
const weakPassword = {
  name: 'João Silva',
  email: 'joao@example.com',
  password: 'weak'
};
const { error: error3 } = userRegisterSchema.validate(weakPassword);
console.log(error3 ? `❌ ${error3.details[0].message}` : '✅ Dados válidos');

// Teste 4: Validação de equipamento válido
console.log('\n4. Teste de equipamento válido:');
const validEquipment = {
  name: 'Motosserra Stihl MS 250',
  type: 'Ferramenta de Corte',
  status: 'available',
  serialNumber: 'ST123456',
  location: 'Almoxarifado A'
};
const { error: error4 } = equipmentCreateSchema.validate(validEquipment);
console.log(error4 ? `❌ ${error4.details[0].message}` : '✅ Dados válidos');

// Teste 5: Validação de status inválido
console.log('\n5. Teste de status inválido:');
const invalidEquipment = {
  name: 'Motosserra',
  type: 'Ferramenta',
  status: 'status-inválido'
};
const { error: error5 } = equipmentCreateSchema.validate(invalidEquipment);
console.log(error5 ? `❌ ${error5.details[0].message}` : '✅ Dados válidos');

console.log('\n🎉 Teste de validadores concluído!');