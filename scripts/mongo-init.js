// 🍃 Script de inicialização do MongoDB para produção
// Este script é executado automaticamente quando o container MongoDB é criado

// Conectar ao banco de dados
db = db.getSiblingDB('brimu');

// Criar usuário da aplicação
db.createUser({
  user: 'brimu_app',
  pwd: 'brimu_app_password_change_in_production',
  roles: [
    {
      role: 'readWrite',
      db: 'brimu'
    }
  ]
});

// Criar coleções principais com validação
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "name", "role"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        },
        password: {
          bsonType: "string",
          minLength: 6
        },
        name: {
          bsonType: "string",
          minLength: 2
        },
        role: {
          enum: ["admin", "user", "client"]
        },
        createdAt: {
          bsonType: "date"
        }
      }
    }
  }
});

db.createCollection('services', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "description", "price", "category"],
      properties: {
        name: {
          bsonType: "string",
          minLength: 3
        },
        description: {
          bsonType: "string"
        },
        price: {
          bsonType: "number",
          minimum: 0
        },
        category: {
          bsonType: "string"
        }
      }
    }
  }
});

db.createCollection('orders');
db.createCollection('quotes');
db.createCollection('equipment');
db.createCollection('calendar_events');
db.createCollection('payments');

// Criar índices para performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

db.services.createIndex({ "category": 1 });
db.services.createIndex({ "name": "text", "description": "text" });

db.orders.createIndex({ "userId": 1 });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "createdAt": -1 });

db.quotes.createIndex({ "clientEmail": 1 });
db.quotes.createIndex({ "status": 1 });
db.quotes.createIndex({ "createdAt": -1 });

db.equipment.createIndex({ "status": 1 });
db.equipment.createIndex({ "category": 1 });

db.calendar_events.createIndex({ "date": 1 });
db.calendar_events.createIndex({ "assignedTo": 1 });

db.payments.createIndex({ "orderId": 1 });
db.payments.createIndex({ "status": 1 });
db.payments.createIndex({ "createdAt": -1 });

// Inserir dados iniciais (exemplos)
db.services.insertMany([
  {
    name: "Poda de Árvores",
    description: "Serviço profissional de poda para manutenção e segurança",
    price: 150.00,
    category: "Manutenção",
    createdAt: new Date()
  },
  {
    name: "Remoção de Árvore",
    description: "Remoção segura de árvores com equipamentos especializados",
    price: 500.00,
    category: "Remoção",
    createdAt: new Date()
  },
  {
    name: "Plantio de Mudas",
    description: "Plantio profissional com mudas selecionadas",
    price: 80.00,
    category: "Plantio",
    createdAt: new Date()
  }
]);

db.equipment.insertMany([
  {
    name: "Motosserra Stihl MS 250",
    category: "Corte",
    status: "disponível",
    condition: "ótimo",
    acquisitionDate: new Date("2023-01-15"),
    createdAt: new Date()
  },
  {
    name: "Caminhão Munck",
    category: "Transporte",
    status: "disponível",
    condition: "bom",
    acquisitionDate: new Date("2022-06-10"),
    createdAt: new Date()
  },
  {
    name: "Triturador de Galhos",
    category: "Processamento",
    status: "manutenção",
    condition: "bom",
    acquisitionDate: new Date("2023-03-20"),
    createdAt: new Date()
  }
]);

print('✅ MongoDB inicializado com sucesso!');
print('📊 Banco: brimu');
print('👤 Usuário: brimu_app');
print('📝 Coleções criadas: users, services, orders, quotes, equipment, calendar_events, payments');
print('🔍 Índices criados para performance');
print('📦 Dados de exemplo inseridos');