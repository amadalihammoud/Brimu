import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

/**
 * Configuração Global de Testes
 * Setup para MongoDB em memória, mocks e utilitários
 */

// Instância do MongoDB em memória
let mongoServer: MongoMemoryServer;

// Setup global antes de todos os testes
beforeAll(async () => {
  try {
    // Iniciar MongoDB em memória
    mongoServer = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'brimu-test'
      }
    });

    const mongoUri = mongoServer.getUri();

    // Conectar mongoose ao MongoDB em memória
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    } as any);

    console.log('🧪 MongoDB em memória conectado para testes');

    // Configurar variáveis de ambiente para testes
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
    process.env.MONGODB_URI = mongoUri;
    process.env.REDIS_URL = 'redis://localhost:6379/1'; // DB diferente para testes

    // Mock de console em ambiente de teste para reduzir ruído
    if (process.env.SILENT_TESTS === 'true') {
      console.log = jest.fn();
      console.warn = jest.fn();
      console.error = jest.fn();
    }

  } catch (error) {
    console.error('Erro ao configurar ambiente de teste:', error);
    throw error;
  }
});

// Cleanup após todos os testes
afterAll(async () => {
  try {
    // Fechar conexão do mongoose
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    // Parar MongoDB em memória
    if (mongoServer) {
      await mongoServer.stop();
    }

    console.log('🧪 Cleanup de testes concluído');
  } catch (error) {
    console.error('Erro durante cleanup de testes:', error);
  }
});

// Limpar dados entre cada teste
beforeEach(async () => {
  // Limpar todas as coleções
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Mock de serviços externos
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    verify: jest.fn().mockResolvedValue(true)
  }))
}));

jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    flushAll: jest.fn().mockResolvedValue('OK'),
    on: jest.fn()
  }))
}));

// Utilitários para testes
export const testUtils = {
  // Criar usuário de teste
  createTestUser: (overrides = {}) => ({
    email: 'test@brimu.com',
    password: 'testpassword123',
    name: 'Test User',
    role: 'user',
    isActive: true,
    ...overrides
  }),

  // Criar admin de teste
  createTestAdmin: (overrides = {}) => ({
    email: 'admin@brimu.com',
    password: 'adminpassword123',
    name: 'Test Admin',
    role: 'admin',
    isActive: true,
    ...overrides
  }),

  // Criar serviço de teste
  createTestService: (overrides = {}) => ({
    name: 'Poda de Teste',
    description: 'Serviço de poda para testes',
    basePrice: 100,
    category: 'Poda',
    isActive: true,
    duration: 120,
    ...overrides
  }),

  // Criar ordem de teste
  createTestOrder: (overrides = {}) => ({
    customerName: 'Cliente Teste',
    customerEmail: 'cliente@teste.com',
    customerPhone: '11999999999',
    serviceType: 'Poda',
    description: 'Ordem de teste',
    status: 'pending',
    priority: 'medium',
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    estimatedPrice: 150,
    ...overrides
  }),

  // Criar equipamento de teste
  createTestEquipment: (overrides = {}) => ({
    name: 'Motosserra Teste',
    category: 'motosserra',
    brand: 'Teste Brand',
    model: 'T-1000',
    status: 'ativo',
    location: 'Depósito Teste',
    ...overrides
  }),

  // Aguardar async
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Simular delay de rede
  mockNetworkDelay: (min = 100, max = 500) => {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  },

  // Gerar dados de teste aleatórios
  randomString: (length = 8) => 
    Math.random().toString(36).substring(2, 2 + length),

  randomEmail: () => 
    `test-${testUtils.randomString()}@brimu.com`,

  randomPhoneNumber: () => 
    `11${Math.floor(Math.random() * 900000000) + 100000000}`,

  // Mock de request com usuário autenticado
  mockAuthenticatedRequest: (user?: any) => ({
    user: user || testUtils.createTestUser(),
    headers: { authorization: 'Bearer mock-token' },
    body: {},
    query: {},
    params: {}
  }),

  // Mock de response
  mockResponse: () => {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    };
    return res;
  },

  // Verificar se objeto tem propriedades esperadas
  expectToHaveProperties: (obj: any, properties: string[]) => {
    properties.forEach(prop => {
      expect(obj).toHaveProperty(prop);
    });
  },

  // Verificar estrutura de resposta da API
  expectApiResponse: (response: any, expectSuccess = true) => {
    expect(response).toHaveProperty('success', expectSuccess);
    
    if (expectSuccess) {
      expect(response).toHaveProperty('data');
    } else {
      expect(response).toHaveProperty('message');
    }
  },

  // Matcher personalizado para datas
  expectRecentDate: (date: string | Date, maxAgeMs = 5000) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const age = now.getTime() - dateObj.getTime();
    
    expect(age).toBeLessThan(maxAgeMs);
    expect(age).toBeGreaterThanOrEqual(0);
  }
};

// Configuração global do Jest
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeRecentDate(): R;
    }
  }
}

// Matcher customizado para Jest
expect.extend({
  toBeRecentDate(received: string | Date, maxAgeMs = 5000) {
    try {
      testUtils.expectRecentDate(received, maxAgeMs);
      return {
        pass: true,
        message: () => `Expected ${received} to be a recent date`
      };
    } catch (error) {
      return {
        pass: false,
        message: () => `Expected ${received} to be a recent date within ${maxAgeMs}ms, but it wasn't`
      };
    }
  }
});

export default testUtils;