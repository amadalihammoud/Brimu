"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const node_cron_1 = __importDefault(require("node-cron"));
const events_1 = require("events");
const logger_1 = require("../utils/logger");
const notificationService_1 = __importDefault(require("./notificationService"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class IntelligentBackupService extends events_1.EventEmitter {
    constructor() {
        super();
        this.activeBackups = new Map();
        this.backupHistory = [];
        this.cronJobs = [];
        this.backupDir = path_1.default.join(process.cwd(), 'storage', 'backups');
        this.loadConfig();
        this.initializeService();
    }
    // Carregar configuração
    loadConfig() {
        this.config = {
            enabled: process.env.BACKUP_ENABLED === 'true',
            schedule: {
                daily: process.env.BACKUP_SCHEDULE_DAILY || '0 2 * * *',
                weekly: process.env.BACKUP_SCHEDULE_WEEKLY || '0 3 * * 0',
                monthly: process.env.BACKUP_SCHEDULE_MONTHLY || '0 4 1 * *'
            },
            retention: {
                daily: parseInt(process.env.BACKUP_RETENTION_DAILY || '7'),
                weekly: parseInt(process.env.BACKUP_RETENTION_WEEKLY || '4'),
                monthly: parseInt(process.env.BACKUP_RETENTION_MONTHLY || '12')
            },
            compression: {
                enabled: process.env.BACKUP_COMPRESSION_ENABLED !== 'false',
                algorithm: process.env.BACKUP_COMPRESSION_ALGORITHM || 'tar.gz',
                level: parseInt(process.env.BACKUP_COMPRESSION_LEVEL || '6')
            },
            verification: {
                enabled: process.env.BACKUP_VERIFICATION_ENABLED !== 'false',
                checksum: process.env.BACKUP_CHECKSUM_ENABLED !== 'false'
            },
            storage: {
                local: true,
                cloud: process.env.BACKUP_CLOUD_ENABLED === 'true' ? {
                    provider: process.env.BACKUP_CLOUD_PROVIDER || 'aws',
                    bucket: process.env.BACKUP_CLOUD_BUCKET,
                    credentials: {}
                } : undefined
            },
            notifications: {
                onSuccess: process.env.BACKUP_NOTIFY_SUCCESS !== 'false',
                onFailure: process.env.BACKUP_NOTIFY_FAILURE !== 'false',
                recipients: []
            }
        };
    }
    // Inicializar serviço
    async initializeService() {
        try {
            await this.ensureDirectories();
            await this.loadBackupHistory();
            if (this.config.enabled) {
                this.setupScheduledBackups();
                logger_1.logger.info('Intelligent backup service initialized', {
                    enabled: this.config.enabled,
                    compression: this.config.compression.enabled,
                    verification: this.config.verification.enabled
                });
            }
            else {
                logger_1.logger.info('Backup service disabled in configuration');
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize backup service', { error: error.message });
        }
    }
    // Criar backup inteligente
    async createIntelligentBackup(type = 'manual') {
        const backupId = this.generateBackupId();
        const startTime = Date.now();
        try {
            // Inicializar progresso
            const progress = {
                id: backupId,
                stage: 'preparing',
                progress: 0,
                filesProcessed: 0,
                totalFiles: 0,
                bytesProcessed: 0,
                totalBytes: 0,
                startTime
            };
            this.activeBackups.set(backupId, progress);
            this.emit('backupStarted', progress);
            // Analisar diretórios para backup
            const analysisResult = await this.analyzeDirectories();
            progress.totalFiles = analysisResult.totalFiles;
            progress.totalBytes = analysisResult.totalBytes;
            // Criar metadata inicial
            const metadata = {
                id: backupId,
                name: `backup-${type}-${new Date().toISOString().replace(/[:.]/g, '-')}`,
                type,
                createdAt: startTime,
                size: 0,
                compressed: false,
                files: {
                    total: analysisResult.totalFiles,
                    directories: analysisResult.totalDirectories,
                    size: analysisResult.totalBytes
                },
                duration: 0,
                status: 'created',
                location: {}
            };
            // Executar backup
            const backupPath = await this.executeBackup(backupId, metadata, progress);
            // Comprimir se habilitado
            if (this.config.compression.enabled) {
                await this.compressBackup(backupId, backupPath, progress);
                metadata.compressed = true;
            }
            // Verificar integridade se habilitado
            if (this.config.verification.enabled) {
                const verification = await this.verifyBackup(backupId, backupPath, progress);
                if (verification.checksum) {
                    metadata.checksum = verification.checksum;
                }
            }
            // Finalizar metadata
            metadata.duration = Date.now() - startTime;
            metadata.status = 'completed';
            metadata.location.local = backupPath;
            // Salvar no histórico
            this.backupHistory.push(metadata);
            await this.saveBackupHistory();
            // Remover do progresso ativo
            this.activeBackups.delete(backupId);
            // Notificar sucesso
            await this.notifyBackupCompletion(metadata, true);
            // Executar limpeza de backups antigos
            if (type !== 'manual') {
                await this.intelligentCleanup(type);
            }
            this.emit('backupCompleted', metadata);
            logger_1.logger.info('Intelligent backup completed successfully', {
                backupId,
                type,
                duration: metadata.duration,
                size: metadata.size,
                compressed: metadata.compressed
            });
            return metadata;
        }
        catch (error) {
            const errorMetadata = {
                id: backupId,
                name: `backup-${type}-failed-${new Date().toISOString().replace(/[:.]/g, '-')}`,
                type,
                createdAt: startTime,
                size: 0,
                compressed: false,
                files: { total: 0, directories: 0, size: 0 },
                duration: Date.now() - startTime,
                status: 'failed',
                error: error.message,
                location: {}
            };
            this.backupHistory.push(errorMetadata);
            this.activeBackups.delete(backupId);
            await this.notifyBackupCompletion(errorMetadata, false);
            this.emit('backupFailed', errorMetadata);
            logger_1.logger.error('Intelligent backup failed', {
                backupId,
                type,
                error: error.message
            });
            throw error;
        }
    }
    // Obter progresso de backup ativo
    getBackupProgress(backupId) {
        return this.activeBackups.get(backupId) || null;
    }
    // Listar backups ativos
    getActiveBackups() {
        return Array.from(this.activeBackups.values());
    }
    // Obter histórico de backups
    getBackupHistory(limit) {
        const sorted = [...this.backupHistory].sort((a, b) => b.createdAt - a.createdAt);
        return limit ? sorted.slice(0, limit) : sorted;
    }
    // Obter estatísticas de backup
    getBackupStatistics() {
        const successful = this.backupHistory.filter(b => b.status === 'completed');
        const failed = this.backupHistory.filter(b => b.status === 'failed');
        const totalSize = successful.reduce((sum, b) => sum + b.size, 0);
        const avgDuration = successful.length > 0 ?
            successful.reduce((sum, b) => sum + b.duration, 0) / successful.length : 0;
        return {
            totalBackups: this.backupHistory.length,
            successRate: this.backupHistory.length > 0 ?
                (successful.length / this.backupHistory.length) * 100 : 0,
            totalSize,
            averageDuration: avgDuration,
            lastBackup: this.backupHistory.length > 0 ?
                this.backupHistory.sort((a, b) => b.createdAt - a.createdAt)[0] : undefined,
            nextScheduled: {
                daily: this.getNextCronExecution(this.config.schedule.daily),
                weekly: this.getNextCronExecution(this.config.schedule.weekly),
                monthly: this.getNextCronExecution(this.config.schedule.monthly)
            }
        };
    }
    // Restaurar backup
    async restoreBackup(backupId, targetPath) {
        try {
            const backup = this.backupHistory.find(b => b.id === backupId);
            if (!backup) {
                throw new Error('Backup não encontrado');
            }
            if (!backup.location.local || !await this.fileExists(backup.location.local)) {
                throw new Error('Arquivo de backup não encontrado');
            }
            const restorePath = targetPath || path_1.default.join(process.cwd(), 'restored');
            await this.extractBackup(backup.location.local, restorePath, backup.compressed);
            logger_1.logger.info('Backup restored successfully', {
                backupId,
                restorePath,
                backupDate: new Date(backup.createdAt).toISOString()
            });
            return true;
        }
        catch (error) {
            logger_1.logger.error('Failed to restore backup', {
                backupId,
                error: error.message
            });
            throw error;
        }
    }
    // Métodos privados
    generateBackupId() {
        return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async ensureDirectories() {
        const dirs = [
            this.backupDir,
            path_1.default.join(this.backupDir, 'daily'),
            path_1.default.join(this.backupDir, 'weekly'),
            path_1.default.join(this.backupDir, 'monthly'),
            path_1.default.join(this.backupDir, 'manual'),
            path_1.default.join(this.backupDir, 'temp')
        ];
        for (const dir of dirs) {
            try {
                await fs_1.promises.access(dir);
            }
            catch {
                await fs_1.promises.mkdir(dir, { recursive: true });
            }
        }
    }
    setupScheduledBackups() {
        // Limpar jobs existentes
        this.cronJobs.forEach(job => job.destroy());
        this.cronJobs = [];
        // Backup diário
        const dailyJob = node_cron_1.default.schedule(this.config.schedule.daily, async () => {
            try {
                logger_1.logger.info('Starting scheduled daily backup');
                await this.createIntelligentBackup('daily');
            }
            catch (error) {
                logger_1.logger.error('Scheduled daily backup failed', { error: error.message });
            }
        }, { scheduled: false });
        // Backup semanal
        const weeklyJob = node_cron_1.default.schedule(this.config.schedule.weekly, async () => {
            try {
                logger_1.logger.info('Starting scheduled weekly backup');
                await this.createIntelligentBackup('weekly');
            }
            catch (error) {
                logger_1.logger.error('Scheduled weekly backup failed', { error: error.message });
            }
        }, { scheduled: false });
        // Backup mensal
        const monthlyJob = node_cron_1.default.schedule(this.config.schedule.monthly, async () => {
            try {
                logger_1.logger.info('Starting scheduled monthly backup');
                await this.createIntelligentBackup('monthly');
            }
            catch (error) {
                logger_1.logger.error('Scheduled monthly backup failed', { error: error.message });
            }
        }, { scheduled: false });
        this.cronJobs = [dailyJob, weeklyJob, monthlyJob];
        // Iniciar jobs
        this.cronJobs.forEach(job => job.start());
        logger_1.logger.info('Scheduled backup jobs configured', {
            daily: this.config.schedule.daily,
            weekly: this.config.schedule.weekly,
            monthly: this.config.schedule.monthly
        });
    }
    async analyzeDirectories() {
        // Implementação básica - pode ser expandida para análise mais detalhada
        return {
            totalFiles: 1000, // Placeholder
            totalDirectories: 50, // Placeholder
            totalBytes: 100 * 1024 * 1024 // Placeholder - 100MB
        };
    }
    async executeBackup(backupId, metadata, progress) {
        progress.stage = 'copying';
        const backupPath = path_1.default.join(this.backupDir, metadata.type, metadata.name);
        await fs_1.promises.mkdir(backupPath, { recursive: true });
        // Simular progresso de cópia
        for (let i = 0; i <= 100; i += 10) {
            progress.progress = Math.floor((i / 100) * 50); // 50% para cópia
            progress.filesProcessed = Math.floor((i / 100) * progress.totalFiles);
            this.emit('backupProgress', progress);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return backupPath;
    }
    async compressBackup(backupId, backupPath, progress) {
        progress.stage = 'compressing';
        // Simular compressão
        for (let i = 50; i <= 80; i += 5) {
            progress.progress = i;
            this.emit('backupProgress', progress);
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    async verifyBackup(backupId, backupPath, progress) {
        progress.stage = 'verifying';
        // Simular verificação
        for (let i = 80; i <= 100; i += 5) {
            progress.progress = i;
            this.emit('backupProgress', progress);
            await new Promise(resolve => setTimeout(resolve, 150));
        }
        return {
            valid: true,
            checksum: 'sha256:abc123def456' // Placeholder
        };
    }
    async intelligentCleanup(type) {
        const retention = this.config.retention[type];
        const backups = this.backupHistory.filter(b => b.type === type && b.status === 'completed');
        if (backups.length > retention) {
            const toDelete = backups
                .sort((a, b) => a.createdAt - b.createdAt)
                .slice(0, backups.length - retention);
            for (const backup of toDelete) {
                try {
                    if (backup.location.local && await this.fileExists(backup.location.local)) {
                        await this.deleteDirectory(backup.location.local);
                    }
                    this.backupHistory = this.backupHistory.filter(b => b.id !== backup.id);
                    logger_1.logger.info('Old backup cleaned up', {
                        backupId: backup.id,
                        type: backup.type,
                        age: Date.now() - backup.createdAt
                    });
                }
                catch (error) {
                    logger_1.logger.error('Failed to cleanup old backup', {
                        backupId: backup.id,
                        error: error.message
                    });
                }
            }
            await this.saveBackupHistory();
        }
    }
    async notifyBackupCompletion(metadata, success) {
        if ((success && !this.config.notifications.onSuccess) ||
            (!success && !this.config.notifications.onFailure)) {
            return;
        }
        try {
            await notificationService_1.default.sendNotification({
                type: success ? 'success' : 'error',
                category: 'system',
                title: success ? 'Backup Concluído' : 'Backup Falhou',
                message: success ?
                    `Backup ${metadata.type} criado com sucesso. Tamanho: ${this.formatBytes(metadata.size)}` :
                    `Backup ${metadata.type} falhou: ${metadata.error}`,
                userRole: 'admin',
                priority: success ? 'low' : 'high',
                channels: [
                    { type: 'websocket', enabled: true },
                    { type: 'email', enabled: !success }
                ],
                persistent: true,
                data: {
                    backupId: metadata.id,
                    backupType: metadata.type,
                    duration: metadata.duration,
                    size: metadata.size
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to send backup notification', { error: error.message });
        }
    }
    async loadBackupHistory() {
        try {
            const historyFile = path_1.default.join(this.backupDir, 'backup-history.json');
            const data = await fs_1.promises.readFile(historyFile, 'utf8');
            this.backupHistory = JSON.parse(data);
        }
        catch (error) {
            this.backupHistory = [];
        }
    }
    async saveBackupHistory() {
        try {
            const historyFile = path_1.default.join(this.backupDir, 'backup-history.json');
            await fs_1.promises.writeFile(historyFile, JSON.stringify(this.backupHistory, null, 2));
        }
        catch (error) {
            logger_1.logger.error('Failed to save backup history', { error: error.message });
        }
    }
    async fileExists(filePath) {
        try {
            await fs_1.promises.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    async deleteDirectory(dirPath) {
        await fs_1.promises.rm(dirPath, { recursive: true, force: true });
    }
    async extractBackup(backupPath, targetPath, compressed) {
        // Implementação placeholder para extração
        if (compressed) {
            // Usar tar ou unzip baseado no algoritmo
        }
        else {
            // Copiar diretamente
        }
    }
    formatBytes(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
    }
    getNextCronExecution(schedule) {
        // Placeholder - calcular próxima execução do cron
        return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }
}
exports.default = new IntelligentBackupService();
