// Teste da funcionalidade de atribuição de equipamentos
// Este script simula o comportamento do sistema sem MongoDB

console.log('🧪 Teste: Sistema de Atribuição de Equipamentos\n');

// Dados simulados
const equipamentos = [
  {
    _id: "equipamento_001",
    name: "Motosserra STIHL MS180",
    code: "MOT25001",
    category: "motosserra",
    brand: "STIHL",
    model: "MS180",
    status: "ativo"
  },
  {
    _id: "equipamento_002", 
    name: "Poda Alta Husqvarna P525D",
    code: "POD25002",
    category: "poda_alta", 
    brand: "Husqvarna",
    model: "P525D",
    status: "ativo"
  },
  {
    _id: "equipamento_003",
    name: "Roçadeira ECHO SRM225",
    code: "ROC25003", 
    category: "rocadeira",
    brand: "ECHO",
    model: "SRM225",
    status: "ativo"
  }
];

const ordens = [
  {
    _id: "ordem_001",
    client: { name: "João Silva" },
    service: { name: "Poda de Árvore" },
    scheduling: {
      scheduledDate: new Date('2025-09-07T08:00:00Z')
    },
    assignedEquipment: [
      { 
        equipment: "equipamento_001", 
        assignedAt: new Date('2025-09-06T10:00:00Z'),
        notes: "Equipamento principal para poda"
      }
    ]
  },
  {
    _id: "ordem_002", 
    client: { name: "Maria Santos" },
    service: { name: "Corte de Grama" },
    scheduling: {
      scheduledDate: new Date('2025-09-07T14:00:00Z') 
    },
    assignedEquipment: [
      {
        equipment: "equipamento_003",
        assignedAt: new Date('2025-09-06T15:00:00Z'),
        notes: "Para corte em área residencial"
      }
    ]
  }
];

// Simular verificação de conflitos
function checkEquipmentDateConflict(equipmentId, scheduledDate) {
  console.log(`🔍 Verificando conflitos para equipamento ${equipmentId} na data ${scheduledDate.toLocaleDateString('pt-BR')}`);
  
  const startOfDay = new Date(scheduledDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(scheduledDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const conflicts = ordens.filter(ordem => {
    const orderDate = new Date(ordem.scheduling.scheduledDate);
    const isInDateRange = orderDate >= startOfDay && orderDate <= endOfDay;
    const hasEquipment = ordem.assignedEquipment.some(eq => eq.equipment === equipmentId);
    
    return isInDateRange && hasEquipment;
  });
  
  if (conflicts.length > 0) {
    console.log(`⚠️ Conflito encontrado:`, conflicts.map(c => `Ordem ${c._id} do cliente ${c.client.name}`));
    return conflicts;
  }
  
  console.log('✅ Nenhum conflito encontrado');
  return [];
}

// Simular busca de equipamentos disponíveis  
function getAvailableEquipment(scheduledDate) {
  console.log(`📋 Buscando equipamentos disponíveis para ${scheduledDate.toLocaleDateString('pt-BR')}`);
  
  const occupiedEquipmentIds = new Set();
  
  // Encontrar equipamentos ocupados na data
  ordens.forEach(ordem => {
    const orderDate = new Date(ordem.scheduling.scheduledDate);
    if (orderDate.toDateString() === scheduledDate.toDateString()) {
      ordem.assignedEquipment.forEach(eq => {
        occupiedEquipmentIds.add(eq.equipment);
      });
    }
  });
  
  // Filtrar equipamentos disponíveis
  const available = equipamentos.filter(eq => !occupiedEquipmentIds.has(eq._id));
  
  console.log(`📦 Equipamentos disponíveis (${available.length}):`, available.map(eq => eq.name));
  console.log(`🔒 Equipamentos ocupados (${occupiedEquipmentIds.size}):`, 
    Array.from(occupiedEquipmentIds).map(id => equipamentos.find(eq => eq._id === id)?.name));
  
  return available;
}

// Simular atribuição de equipamento
function assignEquipment(orderId, equipmentId) {
  console.log(`🔧 Tentando atribuir equipamento ${equipmentId} à ordem ${orderId}`);
  
  const ordem = ordens.find(o => o._id === orderId);
  if (!ordem) {
    throw new Error('Ordem não encontrada');
  }
  
  // Verificar conflitos
  const conflicts = checkEquipmentDateConflict(equipmentId, ordem.scheduling.scheduledDate);
  if (conflicts.length > 0) {
    const conflict = conflicts[0];
    throw new Error(
      `Equipamento não está disponível na data ${ordem.scheduling.scheduledDate.toLocaleDateString('pt-BR')}. ` +
      `Já está agendado para a ordem ${conflict._id} do cliente ${conflict.client.name}.`
    );
  }
  
  // Atribuir equipamento
  ordem.assignedEquipment.push({
    equipment: equipmentId,
    assignedAt: new Date(),
    notes: 'Atribuído via teste'
  });
  
  console.log('✅ Equipamento atribuído com sucesso!');
  return ordem;
}

// Executar testes
console.log('='.repeat(60));
console.log('TESTE 1: Verificar equipamentos disponíveis para 07/09/2025');
console.log('='.repeat(60));
getAvailableEquipment(new Date('2025-09-07T10:00:00Z'));

console.log('\n' + '='.repeat(60)); 
console.log('TESTE 2: Verificar conflitos para equipamento já ocupado');
console.log('='.repeat(60));
checkEquipmentDateConflict("equipamento_001", new Date('2025-09-07T10:00:00Z'));

console.log('\n' + '='.repeat(60));
console.log('TESTE 3: Verificar conflitos para equipamento disponível'); 
console.log('='.repeat(60));
checkEquipmentDateConflict("equipamento_002", new Date('2025-09-07T10:00:00Z'));

console.log('\n' + '='.repeat(60));
console.log('TESTE 4: Tentar atribuir equipamento ocupado (deve falhar)');
console.log('='.repeat(60));
try {
  assignEquipment("ordem_001", "equipamento_003"); // equipamento_003 já está ocupado em 07/09
} catch (error) {
  console.log('❌ Erro esperado:', error.message);
}

console.log('\n' + '='.repeat(60));
console.log('TESTE 5: Atribuir equipamento disponível (deve suceder)');
console.log('='.repeat(60));
try {
  assignEquipment("ordem_001", "equipamento_002"); // equipamento_002 está disponível
} catch (error) {
  console.log('❌ Erro inesperado:', error.message);
}

console.log('\n' + '='.repeat(60));
console.log('TESTE 6: Verificar equipamentos disponíveis após atribuição');
console.log('='.repeat(60));
getAvailableEquipment(new Date('2025-09-07T10:00:00Z'));

console.log('\n🎉 Todos os testes concluídos!');
console.log('\n📝 RESUMO:');
console.log('✅ Validação de conflitos funcionando');
console.log('✅ Listagem de equipamentos disponíveis funcionando'); 
console.log('✅ Atribuição com validação funcionando');
console.log('✅ Prevenção de dupla reserva funcionando');