# Sistema de Atribuição de Equipamentos

## Funcionalidades Implementadas

### 🔧 Backend (Node.js + MongoDB)

#### 1. Modelo de Dados Atualizado
- **Order Model**: Campo `assignedEquipment` para equipamentos atribuídos
- **Equipment Model**: Referências para ordens atribuídas
- **Validação de conflitos de data**: Evita dupla atribuição no mesmo dia

#### 2. Métodos Implementados no Order Model

```javascript
// Verificar conflitos de equipamento em data específica
Order.checkEquipmentDateConflict(equipmentId, scheduledDate, excludeOrderId)

// Atribuir equipamento à ordem (com validação de conflitos)
order.assignEquipment(equipmentId, assignedBy, notes)

// Atualizar data agendada verificando conflitos
order.updateScheduledDate(newScheduledDate)

// Remover equipamento da ordem
order.removeEquipment(equipmentId)

// Buscar equipamentos disponíveis em uma data
Order.getAvailableEquipment(scheduledDate, excludeOrderId)

// Buscar ordens por equipamento
Order.findByEquipment(equipmentId)
```

#### 3. Endpoints API Criados

```bash
# Atribuir equipamento à ordem
POST /api/orders/:id/equipment
Body: { "equipmentId": "...", "notes": "..." }

# Remover equipamento da ordem
DELETE /api/orders/:id/equipment/:equipmentId

# Listar equipamentos disponíveis para uma data
GET /api/orders/available-equipment?scheduledDate=2024-01-15&excludeOrderId=...

# Verificar conflitos de equipamento
GET /api/orders/equipment-conflicts/:equipmentId?scheduledDate=2024-01-15

# Atualizar data agendada (com validação de conflitos)
PUT /api/orders/:id/scheduled-date
Body: { "scheduledDate": "2024-01-15T10:00:00Z" }

# Buscar ordens por equipamento
GET /api/orders/equipment/:equipmentId
```

### 🎨 Frontend (React)

#### 1. Componente OrderEquipmentSelector Melhorado
- **Validação de conflitos em tempo real**
- **Interface visual clara para conflitos**
- **Filtros por categoria e busca**
- **Seleção múltipla de equipamentos**
- **Indicadores de status e manutenção**

#### 2. Funcionalidades do Frontend

```javascript
// Verificar equipamentos disponíveis para data da ordem
orderAPI.getAvailableEquipment(scheduledDate, orderId)

// Verificar conflitos antes de selecionar
orderAPI.checkEquipmentConflicts(equipmentId, scheduledDate, orderId)

// Atribuir equipamentos à ordem
orderAPI.assignEquipment(orderId, { equipmentId, notes })

// Remover equipamentos da ordem
orderAPI.removeEquipment(orderId, equipmentId)
```

## Como Usar

### 1. Atribuir Equipamentos a uma Ordem

```javascript
// No componente de ordem
import OrderEquipmentSelector from '../components/OrderEquipmentSelector';

const OrderDetails = ({ order }) => {
  const [showEquipmentSelector, setShowEquipmentSelector] = useState(false);

  const handleEquipmentSuccess = () => {
    // Recarregar dados da ordem
    loadOrderData();
  };

  return (
    <div>
      {/* Botão para abrir seletor */}
      <button onClick={() => setShowEquipmentSelector(true)}>
        Gerenciar Equipamentos
      </button>

      {/* Modal do seletor */}
      <OrderEquipmentSelector
        order={order}
        isOpen={showEquipmentSelector}
        onClose={() => setShowEquipmentSelector(false)}
        onSuccess={handleEquipmentSuccess}
      />
    </div>
  );
};
```

### 2. Validação de Conflitos Automática

O sistema automaticamente:
- ✅ Mostra apenas equipamentos disponíveis para a data agendada
- ⚠️ Alerta sobre conflitos antes de atribuir
- 🚫 Impede dupla atribuição no mesmo dia
- 📅 Valida mudanças de data considerando equipamentos já atribuídos

### 3. Indicadores Visuais

- **Verde**: Equipamento disponível
- **Laranja**: Equipamento com conflito (mas pode ser atribuído)
- **Vermelho**: Equipamento selecionado com conflito
- **Cinza**: Equipamento indisponível

## Exemplo de Uso Completo

```javascript
// 1. Criar uma ordem
const order = await orderAPI.create({
  client: "cliente_id",
  service: "servico_id",
  scheduling: {
    scheduledDate: new Date('2024-01-15T10:00:00Z')
  }
});

// 2. Verificar equipamentos disponíveis
const availableEquipment = await orderAPI.getAvailableEquipment(
  new Date('2024-01-15T10:00:00Z')
);

// 3. Atribuir equipamento
try {
  await orderAPI.assignEquipment(order._id, {
    equipmentId: "equipamento_id",
    notes: "Equipamento necessário para poda alta"
  });
} catch (error) {
  // Erro se houver conflito de data
  console.error('Conflito de equipamento:', error.message);
}

// 4. Reagendar ordem (validará conflitos automaticamente)
try {
  await orderAPI.updateScheduledDate(order._id, new Date('2024-01-16T10:00:00Z'));
} catch (error) {
  console.error('Conflito ao reagendar:', error.message);
}
```

## Benefícios

- **✨ Prevent Double Booking**: Evita conflitos de agendamento
- **🔄 Real-time Validation**: Validação em tempo real
- **👁️ Visual Feedback**: Interface clara sobre conflitos
- **📊 Equipment Tracking**: Rastreamento completo de equipamentos
- **⚡ Automatic Updates**: Atualizações automáticas de disponibilidade