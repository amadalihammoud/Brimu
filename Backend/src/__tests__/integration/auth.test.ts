import request from 'supertest';
import app from '../../app';
import { testUtils } from '../setup';
import User from '../../models/User';

/**
 * Testes de Integração - Sistema de Autenticação
 * Testa fluxos completos de autenticação, autorização e segurança
 */

describe('Autenticação - Testes de Integração', () => {
  let testUser: any;
  let testAdmin: any;

  beforeEach(async () => {
    // Criar usuários de teste
    testUser = await User.create(testUtils.createTestUser());
    testAdmin = await User.create(testUtils.createTestAdmin());
  });

  describe('POST /api/auth/register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const userData = {
        email: 'newuser@brimu.com',
        password: 'password123',
        name: 'Novo Usuário'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      testUtils.expectApiResponse(response.body, true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('email', userData.email);
      expect(response.body.data.user).not.toHaveProperty('password');

      // Verificar se usuário foi criado no banco
      const createdUser = await User.findOne({ email: userData.email });
      expect(createdUser).toBeTruthy();
      expect(createdUser.name).toBe(userData.name);
    });

    it('deve rejeitar registro com email duplicado', async () => {
      const userData = {
        email: testUser.email,
        password: 'password123',
        name: 'Usuário Duplicado'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      testUtils.expectApiResponse(response.body, false);
      expect(response.body.message).toContain('já está em uso');
    });

    it('deve validar campos obrigatórios', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      testUtils.expectApiResponse(response.body, false);
    });

    it('deve validar formato de email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'email-invalido',
          password: 'password123',
          name: 'Usuário Teste'
        })
        .expect(400);

      testUtils.expectApiResponse(response.body, false);
    });

    it('deve validar força da senha', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@brimu.com',
          password: '123',
          name: 'Usuário Teste'
        })
        .expect(400);

      testUtils.expectApiResponse(response.body, false);
      expect(response.body.message).toContain('senha');
    });
  });

  describe('POST /api/auth/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'testpassword123'
        })
        .expect(200);

      testUtils.expectApiResponse(response.body, true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('email', testUser.email);
      
      // Verificar se cookie foi definido
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('deve rejeitar credenciais inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'senhaerrada'
        })
        .expect(401);

      testUtils.expectApiResponse(response.body, false);
      expect(response.body.message).toContain('inválidas');
    });

    it('deve rejeitar usuário inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'naoexiste@brimu.com',
          password: 'password123'
        })
        .expect(401);

      testUtils.expectApiResponse(response.body, false);
    });

    it('deve aplicar rate limiting para tentativas de login', async () => {
      // Simular múltiplas tentativas de login falhadas
      const promises = Array(25).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: 'senhaerrada'
          })
      );

      const responses = await Promise.all(promises);
      
      // Algumas das últimas tentativas devem ser bloqueadas por rate limit
      const blockedResponses = responses.filter(res => res.status === 429);
      expect(blockedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken: string;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'testpassword123'
        });
      
      authToken = loginResponse.body.data.token;
    });

    it('deve fazer logout com sucesso', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      testUtils.expectApiResponse(response.body, true);
    });

    it('deve rejeitar logout sem autenticação', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      testUtils.expectApiResponse(response.body, false);
    });
  });

  describe('GET /api/auth/profile', () => {
    let authToken: string;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'testpassword123'
        });
      
      authToken = loginResponse.body.data.token;
    });

    it('deve retornar perfil do usuário autenticado', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      testUtils.expectApiResponse(response.body, true);
      expect(response.body.data).toHaveProperty('email', testUser.email);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('deve rejeitar acesso sem autenticação', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      testUtils.expectApiResponse(response.body, false);
    });

    it('deve rejeitar token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer token-invalido')
        .expect(401);

      testUtils.expectApiResponse(response.body, false);
    });
  });

  describe('Middleware de Autorização', () => {
    let userToken: string;
    let adminToken: string;

    beforeEach(async () => {
      // Login como usuário comum
      const userLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'testpassword123'
        });
      userToken = userLogin.body.data.token;

      // Login como admin
      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: testAdmin.email,
          password: 'adminpassword123'
        });
      adminToken = adminLogin.body.data.token;
    });

    it('deve permitir acesso admin a rotas administrativas', async () => {
      const response = await request(app)
        .get('/api/metrics/system')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      testUtils.expectApiResponse(response.body, true);
    });

    it('deve bloquear acesso de usuário comum a rotas administrativas', async () => {
      const response = await request(app)
        .get('/api/metrics/system')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      testUtils.expectApiResponse(response.body, false);
      expect(response.body.message).toContain('Acesso negado');
    });
  });

  describe('Segurança e Validações', () => {
    it('deve resistir a ataques de SQL injection', async () => {
      const maliciousPayload = {
        email: "admin@brimu.com'; DROP TABLE users; --",
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(maliciousPayload);

      // Deve processar normalmente (MongoDB não é vulnerável a SQL injection)
      expect([401, 400]).toContain(response.status);
      
      // Verificar se tabela ainda existe
      const userCount = await User.countDocuments();
      expect(userCount).toBeGreaterThan(0);
    });

    it('deve escapar caracteres especiais em campos de texto', async () => {
      const userData = {
        email: 'special@brimu.com',
        password: 'password123',
        name: '<script>alert("XSS")</script>Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Verificar se script foi escapado/sanitizado
      const createdUser = await User.findOne({ email: userData.email });
      expect(createdUser.name).not.toContain('<script>');
    });

    it('deve aplicar headers de segurança', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      // Verificar headers de segurança
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });

  describe('Performance e Carga', () => {
    it('deve processar múltiplos logins simultâneos', async () => {
      const concurrentLogins = 10;
      const promises = Array(concurrentLogins).fill(null).map(async (_, index) => {
        // Criar usuário único para cada login
        const user = await User.create(testUtils.createTestUser({
          email: `concurrent${index}@brimu.com`
        }));

        return request(app)
          .post('/api/auth/login')
          .send({
            email: user.email,
            password: 'testpassword123'
          });
      });

      const responses = await Promise.all(promises);
      
      // Todos os logins devem ter sucesso
      responses.forEach(response => {
        expect(response.status).toBe(200);
        testUtils.expectApiResponse(response.body, true);
      });
    });

    it('deve manter performance adequada com muitos usuários', async () => {
      // Criar muitos usuários
      const userPromises = Array(100).fill(null).map((_, index) =>
        User.create(testUtils.createTestUser({
          email: `perf${index}@brimu.com`
        }))
      );

      await Promise.all(userPromises);

      // Testar tempo de resposta do login
      const startTime = Date.now();
      
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'perf0@brimu.com',
          password: 'testpassword123'
        })
        .expect(200);

      const responseTime = Date.now() - startTime;
      
      // Login deve ser rápido mesmo com muitos usuários
      expect(responseTime).toBeLessThan(1000); // menos de 1 segundo
    });
  });
});