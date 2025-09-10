module.exports = {
  // Ambiente de execução dos testes
  testEnvironment: 'node',

  // Roots dos testes
  roots: ['<rootDir>/src'],

  // Padrões de arquivos de teste
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],

  // Transformações para TypeScript
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },

  // Extensões de arquivo reconhecidas
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Setup de testes
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

  // Coleta de cobertura
  collectCoverage: true,
  
  // Diretório de cobertura
  coverageDirectory: 'coverage',

  // Formatos de relatório de cobertura
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],

  // Arquivos/diretórios para coleta de cobertura
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/__tests__/**',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/**/index.ts',
    '!src/app.ts', // App principal (testado via integração)
    '!src/types/**'
  ],

  // Thresholds de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Timeout para testes
  testTimeout: 10000, // 10 segundos

  // Configurações específicas do ts-jest
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },

  // Ignorar arquivos/diretórios
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/'
  ],

  // Clear mocks automaticamente
  clearMocks: true,
  
  // Restore mocks automaticamente
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Executar testes em paralelo
  maxWorkers: '50%',

  // Cache do Jest
  cache: true,

  // Detectar arquivos abertos
  detectOpenHandles: true,
  
  // Força saída após testes
  forceExit: true
};