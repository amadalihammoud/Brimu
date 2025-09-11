"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reportsController_1 = __importDefault(require("../controllers/reportsController"));
const security_1 = require("../middleware/security");
const security_2 = __importDefault(require("../middleware/security"));
const cache_1 = require("../middleware/cache");
const router = express_1.default.Router();
/**
 * Rotas de Relatórios
 * Endpoints para geração e exportação de relatórios
 */
// Aplicar autenticação em todas as rotas
router.use(security_1.authenticateWithCookie);
// Aplicar rate limiting específico para relatórios
const reportRateLimit = security_2.default.rateLimits.api;
router.use(reportRateLimit);
// Cache middleware para relatórios (15 minutos de cache)
const reportCache = (0, cache_1.cacheMiddleware)({
    ttl: 900, // 15 minutes
    keyGenerator: (req) => `report:${req.path}:${JSON.stringify(req.query)}`,
});
// Dashboard principal com métricas gerais
router.get('/dashboard', reportCache, reportsController_1.default.getDashboard);
// Relatórios específicos
router.get('/financial', reportCache, reportsController_1.default.getFinancialReport);
router.get('/operational', reportCache, reportsController_1.default.getOperationalReport);
router.get('/customers', reportCache, reportsController_1.default.getCustomerReport);
router.get('/equipment', reportCache, reportsController_1.default.getEquipmentReport);
// Métricas em tempo real
router.get('/realtime', reportsController_1.default.getRealTimeMetrics);
// Relatório customizado
router.post('/custom', reportsController_1.default.getCustomReport);
// Exportações
router.get('/export/pdf', reportsController_1.default.exportToPDF);
router.get('/export/excel', reportsController_1.default.exportToExcel);
// Relatórios salvos e agendados
router.get('/saved', reportsController_1.default.getSavedReports);
router.post('/schedule', reportsController_1.default.scheduleReport);
exports.default = router;
