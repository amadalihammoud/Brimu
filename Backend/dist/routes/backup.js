"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const backupManager_1 = __importDefault(require("../utils/backupManager"));
const auth_1 = require("../middleware/auth");
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
// Middleware para verificar permissões de administrador
const requireAdmin = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
        }
        next();
    }
    catch (error) {
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
// Criar backup manual
router.post('/create', auth_1.auth, requireAdmin, async (req, res) => {
    try {
        const { type = 'manual' } = req.body;
        const result = await backupManager_1.default.createBackup(type);
        if (result.success) {
            res.status(200).json({
                message: 'Backup criado com sucesso',
                backup: {
                    name: result.backupName,
                    path: result.backupPath,
                    type: type
                }
            });
        }
        else {
            res.status(500).json({
                message: 'Erro ao criar backup',
                error: result.error
            });
        }
    }
    catch (error) {
        console.error('Erro ao criar backup:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Listar backups
router.get('/list', auth_1.auth, requireAdmin, async (req, res) => {
    try {
        const { type } = req.query;
        const backups = await backupManager_1.default.listBackups(type);
        res.status(200).json({
            message: 'Backups listados com sucesso',
            backups: backups,
            total: backups.length
        });
    }
    catch (error) {
        console.error('Erro ao listar backups:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Restaurar backup
router.post('/restore/:backupName', auth_1.auth, requireAdmin, async (req, res) => {
    try {
        const { backupName } = req.params;
        const { type = 'manual' } = req.body;
        const result = await backupManager_1.default.restoreBackup(backupName, type);
        if (result.success) {
            res.status(200).json({
                message: 'Backup restaurado com sucesso',
                backup: backupName
            });
        }
        else {
            res.status(500).json({
                message: 'Erro ao restaurar backup',
                error: result.error
            });
        }
    }
    catch (error) {
        console.error('Erro ao restaurar backup:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Obter estatísticas de backup
router.get('/stats', auth_1.auth, requireAdmin, async (req, res) => {
    try {
        const stats = await backupManager_1.default.getBackupStats();
        res.status(200).json({
            message: 'Estatísticas de backup obtidas',
            stats: stats
        });
    }
    catch (error) {
        console.error('Erro ao obter estatísticas de backup:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Limpar backups antigos
router.post('/cleanup', auth_1.auth, requireAdmin, async (req, res) => {
    try {
        await backupManager_1.default.cleanupOldBackups();
        res.status(200).json({
            message: 'Limpeza de backups antigos concluída'
        });
    }
    catch (error) {
        console.error('Erro na limpeza de backups:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Download de backup
router.get('/download/:backupName', auth_1.auth, requireAdmin, async (req, res) => {
    try {
        const { backupName } = req.params;
        const { type = 'manual' } = req.query;
        const backupPath = path_1.default.join(backupManager_1.default.backupDir, type, backupName);
        // Verificar se backup existe
        try {
            await promises_1.default.access(backupPath);
        }
        catch {
            return res.status(404).json({ message: 'Backup não encontrado' });
        }
        // Definir headers para download
        res.setHeader('Content-Disposition', `attachment; filename="${backupName}"`);
        res.setHeader('Content-Type', 'application/zip');
        // Enviar arquivo
        res.sendFile(path_1.default.resolve(backupPath));
    }
    catch (error) {
        console.error('Erro no download do backup:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Verificar integridade do backup
router.get('/verify/:backupName', auth_1.auth, requireAdmin, async (req, res) => {
    try {
        const { backupName } = req.params;
        const { type = 'manual' } = req.query;
        const backupPath = path_1.default.join(backupManager_1.default.backupDir, type, backupName);
        // Verificar se backup existe
        try {
            await promises_1.default.access(backupPath);
        }
        catch {
            return res.status(404).json({ message: 'Backup não encontrado' });
        }
        // Verificar metadados
        const metadataPath = path_1.default.join(backupPath, 'backup-metadata.json');
        let metadata = null;
        try {
            const metadataContent = await promises_1.default.readFile(metadataPath, 'utf8');
            metadata = JSON.parse(metadataContent);
        }
        catch {
            return res.status(400).json({ message: 'Metadados do backup não encontrados' });
        }
        // Verificar integridade dos arquivos
        const integrityCheck = await backupManager_1.default.verifyBackupIntegrity(backupPath);
        res.status(200).json({
            message: 'Verificação de integridade concluída',
            backup: backupName,
            metadata: metadata,
            integrity: integrityCheck
        });
    }
    catch (error) {
        console.error('Erro na verificação de integridade:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Configurar agendamento de backups
router.post('/schedule', auth_1.auth, requireAdmin, async (req, res) => {
    try {
        const { daily = true, weekly = true, monthly = true, dailyTime = '02:00', weeklyTime = '03:00', monthlyTime = '04:00' } = req.body;
        // Aqui você implementaria a lógica para configurar os agendamentos
        // Por enquanto, apenas retornamos sucesso
        res.status(200).json({
            message: 'Agendamento de backups configurado',
            schedule: {
                daily: { enabled: daily, time: dailyTime },
                weekly: { enabled: weekly, time: weeklyTime },
                monthly: { enabled: monthly, time: monthlyTime }
            }
        });
    }
    catch (error) {
        console.error('Erro ao configurar agendamento:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Obter status dos jobs de backup
router.get('/status', auth_1.auth, requireAdmin, async (req, res) => {
    try {
        // Aqui você implementaria a lógica para verificar o status dos jobs
        // Por enquanto, retornamos informações básicas
        const stats = await backupManager_1.default.getBackupStats();
        res.status(200).json({
            message: 'Status dos backups obtido',
            status: {
                jobs: {
                    daily: { status: 'active', lastRun: null, nextRun: null },
                    weekly: { status: 'active', lastRun: null, nextRun: null },
                    monthly: { status: 'active', lastRun: null, nextRun: null }
                },
                stats: stats
            }
        });
    }
    catch (error) {
        console.error('Erro ao obter status dos backups:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.default = router;
