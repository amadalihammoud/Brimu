import express from 'express';
import reportsController from '../controllers/reportsController';
import { authenticateWithCookie } from '../middleware/security';
import securityConfig from '../middleware/security';
import { cacheMiddleware } from '../middleware/cache';

const router = express.Router();

/**
 * Rotas de Relatórios
 * Endpoints para geração e exportação de relatórios
 */

// Aplicar autenticação em todas as rotas
router.use(authenticateWithCookie);

// Aplicar rate limiting específico para relatórios
const reportRateLimit = securityConfig.rateLimits.api;
router.use(reportRateLimit);

// Cache middleware para relatórios (15 minutos de cache)
const reportCache = cacheMiddleware({
  ttl: 900, // 15 minutes
  keyGenerator: (req) => `report:${req.path}:${JSON.stringify(req.query)}`,
});

// Dashboard principal com métricas gerais
router.get('/dashboard', reportCache, reportsController.getDashboard);

// Relatórios específicos
router.get('/financial', reportCache, reportsController.getFinancialReport);
router.get('/operational', reportCache, reportsController.getOperationalReport);
router.get('/customers', reportCache, reportsController.getCustomerReport);
router.get('/equipment', reportCache, reportsController.getEquipmentReport);

// Métricas em tempo real
router.get('/realtime', reportsController.getRealTimeMetrics);

// Relatório customizado
router.post('/custom', reportsController.getCustomReport);

// Exportações
router.get('/export/pdf', reportsController.exportToPDF);
router.get('/export/excel', reportsController.exportToExcel);

// Relatórios salvos e agendados
router.get('/saved', reportsController.getSavedReports);
router.post('/schedule', reportsController.scheduleReport);

export default router;