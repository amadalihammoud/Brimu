import request from 'supertest';
import app from '../../app';
import { testUtils } from '../setup';
import User from '../../models/User';
import Service from '../../models/Service';

/**
 * Testes End-to-End - Fluxo Completo
 * Testa workflows completos da aplicação simulando uso real
 */

describe('Workflow Completo - Testes E2E', () => {
  let adminToken: string;
  let userToken: string;
  let testService: any;

  beforeAll(async () => {
    // Criar admin
    const admin = await User.create(testUtils.createTestAdmin());
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: admin.email,
        password: 'adminpassword123'
      });
    adminToken = adminLogin.body.data.token;

    // Criar usuário comum
    const user = await User.create(testUtils.createTestUser());
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: 'testpassword123'
      });
    userToken = userLogin.body.data.token;

    // Criar serviço de teste
    testService = await Service.create(testUtils.createTestService());
  });

  describe('Workflow: Ciclo Completo de Ordem de Serviço', () => {
    let orderId: string;
    let backupId: string;

    it('1. Cliente deve conseguir visualizar serviços disponíveis', async () => {
      const response = await request(app)
        .get('/api/services')
        .expect(200);

      testUtils.expectApiResponse(response.body, true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);

      const service = response.body.data.find((s: any) => s._id === testService._id.toString());
      expect(service).toBeDefined();
      expect(service).toHaveProperty('name', testService.name);
    });

    it('2. Cliente deve conseguir criar uma ordem de serviço', async () => {
      const orderData = {
        serviceId: testService._id.toString(),
        customerName: 'Cliente Teste E2E',
        customerEmail: 'cliente.e2e@brimu.com',
        customerPhone: '11999888777',
        description: 'Preciso de poda de árvore no quintal',
        scheduledDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        address: {
          street: 'Rua Teste, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567'
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      testUtils.expectApiResponse(response.body, true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('status', 'pending');
      expect(response.body.data).toHaveProperty('customerName', orderData.customerName);

      orderId = response.body.data._id;
    });

    it('3. Admin deve conseguir visualizar a nova ordem no dashboard', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      testUtils.expectApiResponse(response.body, true);
      
      const order = response.body.data.find((o: any) => o._id === orderId);
      expect(order).toBeDefined();
      expect(order).toHaveProperty('status', 'pending');
    });

    it('4. Admin deve conseguir aceitar a ordem', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'confirmed',
          estimatedPrice: 200,
          notes: 'Ordem confirmada - equipe será alocada'
        })
        .expect(200);

      testUtils.expectApiResponse(response.body, true);
      expect(response.body.data).toHaveProperty('status', 'confirmed');
      expect(response.body.data).toHaveProperty('estimatedPrice', 200);
    });

    it('5. Sistema deve permitir visualizar métricas da nova atividade', async () => {
      // Aguardar um pouco para métricas serem coletadas
      await testUtils.waitFor(1000);

      const response = await request(app)
        .get('/api/metrics/system')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      testUtils.expectApiResponse(response.body, true);
      expect(response.body.data).toHaveProperty('requestsPerMinute');
      expect(response.body.data.requestsPerMinute).toBeGreaterThan(0);
    });

    it('6. Admin deve conseguir criar backup do sistema', async () => {
      const response = await request(app)
        .post('/api/backups/intelligent/create')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ type: 'manual' })
        .expect(200);

      testUtils.expectApiResponse(response.body, true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('type', 'manual');

      backupId = response.body.data.id;
    });

    it('7. Sistema deve mostrar estatísticas de backup', async () => {
      const response = await request(app)
        .get('/api/backups/intelligent/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      testUtils.expectApiResponse(response.body, true);
      expect(response.body.data).toHaveProperty('totalBackups');
      expect(response.body.data.totalBackups).toBeGreaterThan(0);
    });

    it('8. Admin deve conseguir completar a ordem', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'completed',
          finalPrice: 180,
          completedAt: new Date().toISOString(),
          notes: 'Serviço realizado com sucesso'
        })
        .expect(200);

      testUtils.expectApiResponse(response.body, true);
      expect(response.body.data).toHaveProperty('status', 'completed');
      expect(response.body.data).toHaveProperty('finalPrice', 180);
    });
  });

  describe('Workflow: Sistema de Notificações', () => {
    it('1. Admin deve conseguir enviar notificação para todos os usuários', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'info',
          category: 'general',
          title: 'Manutenção Programada',
          message: 'Sistema ficará em manutenção das 02h às 04h',
          priority: 'medium',
          channels: [{ type: 'websocket', enabled: true }]
        })
        .expect(200);

      testUtils.expectApiResponse(response.body, true);
      expect(response.body).toHaveProperty('notificationId');
    });

    it('2. Admin deve conseguir visualizar templates de notificação', async () => {
      const response = await request(app)
        .get('/api/notifications/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      testUtils.expectApiResponse(response.body, true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('3. Admin deve conseguir ver estatísticas de notificações', async () => {
      const response = await request(app)
        .get('/api/notifications/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      testUtils.expectApiResponse(response.body, true);
      expect(response.body.data).toHaveProperty('totalNotifications');
      expect(response.body.data).toHaveProperty('activeConnections');
    });
  });

  describe('Workflow: Monitoramento e Alertas', () => {
    it('1. Sistema deve coletar métricas automaticamente', async () => {
      // Fazer várias requisições para gerar métricas
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .get('/api/services')
          .expect(200)
      );

      await Promise.all(requests);

      // Verificar se métricas foram coletadas
      const response = await request(app)
        .get('/api/metrics/performance')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ period: '1h' })
        .expect(200);

      testUtils.expectApiResponse(response.body, true);
      expect(response.body.data).toHaveProperty('totalRequests');
      expect(response.body.data.totalRequests).toBeGreaterThan(0);
    });

    it('2. Admin deve conseguir visualizar dashboard de métricas', async () => {
      const response = await request(app)
        .get('/api/metrics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      testUtils.expectApiResponse(response.body, true);
      
      const { data } = response.body;
      expect(data).toHaveProperty('kpis');
      expect(data).toHaveProperty('systemMetrics');
      expect(data).toHaveProperty('performanceMetrics');

      expect(data.kpis).toHaveProperty('systemHealth');
      expect(data.kpis).toHaveProperty('performance');
    });

    it('3. Sistema deve permitir exportar métricas', async () => {
      const response = await request(app)
        .get('/api/metrics/export')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      testUtils.expectApiResponse(response.body, true);
      expect(response.body.data).toHaveProperty('performance');
      expect(response.body.data).toHaveProperty('system');
      expect(response.body.data).toHaveProperty('aggregated');
    });
  });

  describe('Workflow: Segurança e Auditoria', () => {
    it('1. Sistema deve bloquear acesso não autorizado a recursos admin', async () => {
      const response = await request(app)
        .get('/api/metrics/system')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      testUtils.expectApiResponse(response.body, false);
      expect(response.body.message).toContain('Acesso negado');
    });

    it('2. Sistema deve aplicar rate limiting adequadamente', async () => {
      // Fazer muitas requisições rapidamente
      const promises = Array(30).fill(null).map(() =>
        request(app)
          .get('/api/services')
      );

      const responses = await Promise.allSettled(promises);
      const rateLimitedResponses = responses.filter(
        (result: any) => result.status === 'fulfilled' && result.value.status === 429
      );

      // Algumas requisições devem ser limitadas
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('3. Sistema deve registrar atividades de segurança', async () => {
      // Tentar login com credenciais inválidas para gerar evento de segurança
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'attacker@malicious.com',
          password: 'wrongpassword'
        })
        .expect(401);

      // Verificar se alertas de segurança foram gerados
      const response = await request(app)
        .get('/api/metrics/alerts')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      testUtils.expectApiResponse(response.body, true);
      // Sistema pode ou não ter alertas dependendo dos thresholds, mas deve responder
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('Workflow: Health Check e Status', () => {
    it('1. Health check deve retornar status completo do sistema', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('metrics');
    });

    it('2. Status endpoint deve fornecer informações detalhadas', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body).toHaveProperty('server');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('features');

      expect(response.body.server).toHaveProperty('status', 'running');
      expect(response.body.features).toHaveProperty('upload');
      expect(response.body.features).toHaveProperty('backup');
    });
  });

  describe('Performance: Sistema sob Carga', () => {
    it('deve manter performance adequada com múltiplas operações simultâneas', async () => {
      const startTime = Date.now();

      // Simular carga mista: leituras, escritas, autenticações
      const operations = [
        // Leituras
        ...Array(20).fill(null).map(() =>
          request(app).get('/api/services')
        ),
        
        // Verificações de saúde
        ...Array(10).fill(null).map(() =>
          request(app).get('/api/health')
        ),
        
        // Métricas (requer autenticação)
        ...Array(5).fill(null).map(() =>
          request(app)
            .get('/api/metrics/system')
            .set('Authorization', `Bearer ${adminToken}`)
        )
      ];

      const responses = await Promise.all(operations);
      const totalTime = Date.now() - startTime;

      // Verificar se todas as operações foram bem-sucedidas
      const successful = responses.filter(res => res.status < 400);
      expect(successful.length).toBeGreaterThan(operations.length * 0.95); // 95% sucesso

      // Sistema deve responder em tempo razoável mesmo sob carga
      expect(totalTime).toBeLessThan(5000); // Menos de 5 segundos para todas as operações
    });

    it('deve manter integridade dos dados sob concorrência', async () => {
      // Criar múltiplos serviços simultaneamente
      const servicePromises = Array(10).fill(null).map((_, index) =>
        Service.create(testUtils.createTestService({
          name: `Serviço Concorrente ${index}`,
          basePrice: 100 + index
        }))
      );

      const services = await Promise.all(servicePromises);

      // Verificar se todos foram criados corretamente
      expect(services.length).toBe(10);
      services.forEach((service, index) => {
        expect(service.name).toBe(`Serviço Concorrente ${index}`);
        expect(service.basePrice).toBe(100 + index);
      });

      // Verificar integridade no banco de dados
      const serviceCount = await Service.countDocuments();
      expect(serviceCount).toBeGreaterThanOrEqual(10);
    });
  });
});