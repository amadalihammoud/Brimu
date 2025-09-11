"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../utils/logger");
const reportService_1 = require("../services/reportService");
/**
 * Controlador de Relatórios
 * Gera relatórios de negócio, financeiros e operacionais
 */
class ReportsController {
    // Dashboard principal com métricas gerais
    async getDashboard(req, res) {
        try {
            const { period = '30d', startDate, endDate } = req.query;
            const dashboard = await (0, reportService_1.generateBusinessReport)({
                period: period,
                startDate: startDate,
                endDate: endDate
            });
            res.json({
                success: true,
                data: dashboard,
                generatedAt: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.logger.error('Error generating dashboard', error);
            res.status(500).json({
                error: 'Erro ao gerar dashboard',
                code: 'DASHBOARD_ERROR'
            });
        }
    }
    // Relatório financeiro
    async getFinancialReport(req, res) {
        try {
            const { period = '30d', startDate, endDate, detailed = 'false' } = req.query;
            const report = await (0, reportService_1.generateFinancialReport)({
                period: period,
                startDate: startDate,
                endDate: endDate,
                detailed: detailed === 'true'
            });
            res.json({
                success: true,
                data: report,
                generatedAt: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.logger.error('Error generating financial report', error);
            res.status(500).json({
                error: 'Erro ao gerar relatório financeiro',
                code: 'FINANCIAL_REPORT_ERROR'
            });
        }
    }
    // Relatório operacional
    async getOperationalReport(req, res) {
        try {
            const { period = '30d', startDate, endDate } = req.query;
            const report = await (0, reportService_1.generateOperationalReport)({
                period: period,
                startDate: startDate,
                endDate: endDate
            });
            res.json({
                success: true,
                data: report,
                generatedAt: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.logger.error('Error generating operational report', error);
            res.status(500).json({
                error: 'Erro ao gerar relatório operacional',
                code: 'OPERATIONAL_REPORT_ERROR'
            });
        }
    }
    // Relatório de clientes
    async getCustomerReport(req, res) {
        try {
            const { period = '30d', startDate, endDate, segment } = req.query;
            const report = await (0, reportService_1.generateCustomerReport)({
                period: period,
                startDate: startDate,
                endDate: endDate,
                segment: segment
            });
            res.json({
                success: true,
                data: report,
                generatedAt: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.logger.error('Error generating customer report', error);
            res.status(500).json({
                error: 'Erro ao gerar relatório de clientes',
                code: 'CUSTOMER_REPORT_ERROR'
            });
        }
    }
    // Relatório de equipamentos
    async getEquipmentReport(req, res) {
        try {
            const { includeUsage = 'true', includeMaintenance = 'true' } = req.query;
            const report = await (0, reportService_1.generateEquipmentReport)({
                includeUsage: includeUsage === 'true',
                includeMaintenance: includeMaintenance === 'true'
            });
            res.json({
                success: true,
                data: report,
                generatedAt: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.logger.error('Error generating equipment report', error);
            res.status(500).json({
                error: 'Erro ao gerar relatório de equipamentos',
                code: 'EQUIPMENT_REPORT_ERROR'
            });
        }
    }
    // Exportar relatório em PDF
    async exportToPDF(req, res) {
        try {
            const { reportType, period = '30d', startDate, endDate } = req.query;
            if (!reportType) {
                return res.status(400).json({
                    error: 'Tipo de relatório é obrigatório',
                    code: 'MISSING_REPORT_TYPE'
                });
            }
            const pdfBuffer = await (0, reportService_1.exportReportToPDF)({
                reportType: reportType,
                period: period,
                startDate: startDate,
                endDate: endDate
            });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=relatorio-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`);
            res.send(pdfBuffer);
        }
        catch (error) {
            logger_1.logger.error('Error exporting report to PDF', error);
            res.status(500).json({
                error: 'Erro ao exportar relatório em PDF',
                code: 'PDF_EXPORT_ERROR'
            });
        }
    }
    // Exportar relatório em Excel
    async exportToExcel(req, res) {
        try {
            const { reportType, period = '30d', startDate, endDate } = req.query;
            if (!reportType) {
                return res.status(400).json({
                    error: 'Tipo de relatório é obrigatório',
                    code: 'MISSING_REPORT_TYPE'
                });
            }
            const excelBuffer = await (0, reportService_1.exportReportToExcel)({
                reportType: reportType,
                period: period,
                startDate: startDate,
                endDate: endDate
            });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=relatorio-${reportType}-${new Date().toISOString().split('T')[0]}.xlsx`);
            res.send(excelBuffer);
        }
        catch (error) {
            logger_1.logger.error('Error exporting report to Excel', error);
            res.status(500).json({
                error: 'Erro ao exportar relatório em Excel',
                code: 'EXCEL_EXPORT_ERROR'
            });
        }
    }
    // Métricas em tempo real
    async getRealTimeMetrics(req, res) {
        try {
            // TODO: Implementar métricas em tempo real usando WebSockets
            const metrics = {
                timestamp: new Date().toISOString(),
                activeOrders: 0, // Buscar do banco
                ongoingServices: 0,
                equipmentInUse: 0,
                todayRevenue: 0,
                weeklyGrowth: 0,
                customerSatisfaction: 0
            };
            res.json({
                success: true,
                data: metrics
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting real-time metrics', error);
            res.status(500).json({
                error: 'Erro ao obter métricas em tempo real',
                code: 'REALTIME_METRICS_ERROR'
            });
        }
    }
    // Relatório customizado
    async getCustomReport(req, res) {
        try {
            const { metrics, filters, groupBy, period = '30d', startDate, endDate } = req.body;
            if (!metrics || !Array.isArray(metrics)) {
                return res.status(400).json({
                    error: 'Métricas são obrigatórias',
                    code: 'MISSING_METRICS'
                });
            }
            // TODO: Implementar relatório customizável
            const customReport = {
                config: {
                    metrics,
                    filters,
                    groupBy,
                    period,
                    dateRange: { startDate, endDate }
                },
                data: [],
                summary: {},
                generatedAt: new Date().toISOString()
            };
            res.json({
                success: true,
                data: customReport
            });
        }
        catch (error) {
            logger_1.logger.error('Error generating custom report', error);
            res.status(500).json({
                error: 'Erro ao gerar relatório customizado',
                code: 'CUSTOM_REPORT_ERROR'
            });
        }
    }
    // Listar relatórios salvos
    async getSavedReports(req, res) {
        try {
            // TODO: Implementar sistema de relatórios salvos
            const savedReports = [
                {
                    id: '1',
                    name: 'Relatório Mensal Padrão',
                    type: 'financial',
                    createdAt: new Date().toISOString(),
                    lastGenerated: new Date().toISOString(),
                    schedule: 'monthly'
                }
            ];
            res.json({
                success: true,
                data: savedReports
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting saved reports', error);
            res.status(500).json({
                error: 'Erro ao obter relatórios salvos',
                code: 'SAVED_REPORTS_ERROR'
            });
        }
    }
    // Agendar relatório
    async scheduleReport(req, res) {
        try {
            const { reportType, schedule, recipients, config } = req.body;
            if (!reportType || !schedule || !recipients) {
                return res.status(400).json({
                    error: 'Parâmetros obrigatórios: reportType, schedule, recipients',
                    code: 'MISSING_SCHEDULE_PARAMS'
                });
            }
            // TODO: Implementar agendamento de relatórios
            const scheduledReport = {
                id: Date.now().toString(),
                reportType,
                schedule,
                recipients,
                config,
                status: 'active',
                createdAt: new Date().toISOString(),
                nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            };
            logger_1.logger.info('Report scheduled', scheduledReport);
            res.json({
                success: true,
                data: scheduledReport,
                message: 'Relatório agendado com sucesso'
            });
        }
        catch (error) {
            logger_1.logger.error('Error scheduling report', error);
            res.status(500).json({
                error: 'Erro ao agendar relatório',
                code: 'SCHEDULE_REPORT_ERROR'
            });
        }
    }
}
exports.default = new ReportsController();
