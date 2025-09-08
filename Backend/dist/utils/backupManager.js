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
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class BackupManager {
    constructor() {
        this.backupDir = path_1.default.join(process.cwd(), 'storage', 'backups');
        this.uploadDir = path_1.default.join(process.cwd(), 'uploads');
        this.publicDir = path_1.default.join(process.cwd(), 'public');
        this.storageDir = path_1.default.join(process.cwd(), 'storage');
        this.ensureBackupDirectories();
        this.setupCronJobs();
    }
    // Criar diretórios de backup se não existirem
    async ensureBackupDirectories() {
        const dirs = [
            this.backupDir,
            path_1.default.join(this.backupDir, 'daily'),
            path_1.default.join(this.backupDir, 'weekly'),
            path_1.default.join(this.backupDir, 'monthly'),
            path_1.default.join(this.backupDir, 'manual')
        ];
        for (const dir of dirs) {
            try {
                await fs_1.promises.access(dir);
            }
            catch {
                await fs_1.promises.mkdir(dir, { recursive: true });
                console.log(`📁 Diretório de backup criado: ${dir}`);
            }
        }
    }
    // Configurar jobs de backup automático
    setupCronJobs() {
        // Backup diário às 02:00
        node_cron_1.default.schedule('0 2 * * *', async () => {
            console.log('🔄 Iniciando backup diário...');
            await this.createBackup('daily');
        });
        // Backup semanal aos domingos às 03:00
        node_cron_1.default.schedule('0 3 * * 0', async () => {
            console.log('🔄 Iniciando backup semanal...');
            await this.createBackup('weekly');
        });
        // Backup mensal no primeiro domingo às 04:00
        node_cron_1.default.schedule('0 4 1-7 * 0', async () => {
            console.log('🔄 Iniciando backup mensal...');
            await this.createBackup('monthly');
        });
        // Limpeza de backups antigos diariamente às 05:00
        node_cron_1.default.schedule('0 5 * * *', async () => {
            console.log('🧹 Iniciando limpeza de backups antigos...');
            await this.cleanupOldBackups();
        });
        console.log('⏰ Jobs de backup automático configurados');
    }
    // Criar backup
    async createBackup(type = 'manual') {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupName = `backup-${type}-${timestamp}`;
            const backupPath = path_1.default.join(this.backupDir, type, backupName);
            console.log(`📦 Criando backup: ${backupName}`);
            // Criar diretório do backup
            await fs_1.promises.mkdir(backupPath, { recursive: true });
            // Backup dos uploads
            await this.backupDirectory(this.uploadDir, path_1.default.join(backupPath, 'uploads'));
            // Backup dos arquivos públicos
            await this.backupDirectory(this.publicDir, path_1.default.join(backupPath, 'public'));
            // Backup do storage compartilhado
            await this.backupDirectory(this.storageDir, path_1.default.join(backupPath, 'storage'));
            // Criar arquivo de metadados do backup
            await this.createBackupMetadata(backupPath, type);
            // Comprimir backup se disponível
            if (await this.isZipAvailable()) {
                await this.compressBackup(backupPath);
            }
            console.log(`✅ Backup criado com sucesso: ${backupName}`);
            return { success: true, backupName, backupPath };
        }
        catch (error) {
            console.error('❌ Erro ao criar backup:', error);
            return { success: false, error: error.message };
        }
    }
    // Backup de um diretório
    async backupDirectory(sourceDir, targetDir) {
        try {
            await fs_1.promises.access(sourceDir);
            await fs_1.promises.mkdir(targetDir, { recursive: true });
            const items = await fs_1.promises.readdir(sourceDir);
            for (const item of items) {
                const sourcePath = path_1.default.join(sourceDir, item);
                const targetPath = path_1.default.join(targetDir, item);
                const stats = await fs_1.promises.stat(sourcePath);
                if (stats.isDirectory()) {
                    await this.backupDirectory(sourcePath, targetPath);
                }
                else {
                    await fs_1.promises.copyFile(sourcePath, targetPath);
                }
            }
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }
    // Criar metadados do backup
    async createBackupMetadata(backupPath, type) {
        const metadata = {
            type,
            createdAt: new Date().toISOString(),
            version: '1.0',
            source: {
                uploads: this.uploadDir,
                public: this.publicDir,
                storage: this.storageDir
            },
            stats: await this.getBackupStats(backupPath)
        };
        const metadataPath = path_1.default.join(backupPath, 'backup-metadata.json');
        await fs_1.promises.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    }
    // Obter estatísticas do backup
    async getBackupStats(backupPath) {
        try {
            const stats = {
                totalFiles: 0,
                totalSize: 0,
                directories: 0
            };
            const countFiles = async (dir) => {
                const items = await fs_1.promises.readdir(dir);
                for (const item of items) {
                    const itemPath = path_1.default.join(dir, item);
                    const itemStats = await fs_1.promises.stat(itemPath);
                    if (itemStats.isDirectory()) {
                        stats.directories++;
                        await countFiles(itemPath);
                    }
                    else {
                        stats.totalFiles++;
                        stats.totalSize += itemStats.size;
                    }
                }
            };
            await countFiles(backupPath);
            return stats;
        }
        catch (error) {
            return { totalFiles: 0, totalSize: 0, directories: 0 };
        }
    }
    // Verificar se zip está disponível
    async isZipAvailable() {
        try {
            // No Windows, usar PowerShell para compressão
            await execAsync('powershell -Command "Get-Command Compress-Archive"');
            return true;
        }
        catch {
            return false;
        }
    }
    // Comprimir backup
    async compressBackup(backupPath) {
        try {
            const zipPath = `${backupPath}.zip`;
            // Usar PowerShell para compressão no Windows
            await execAsync(`powershell -Command "Compress-Archive -Path '${backupPath}' -DestinationPath '${zipPath}' -Force"`);
            // Remover diretório original após compressão
            await fs_1.promises.rm(backupPath, { recursive: true, force: true });
            console.log(`📦 Backup comprimido: ${path_1.default.basename(zipPath)}`);
        }
        catch (error) {
            console.warn('⚠️ Erro ao comprimir backup:', error.message);
        }
    }
    // Listar backups
    async listBackups(type = null) {
        try {
            const backups = [];
            const types = type ? [type] : ['daily', 'weekly', 'monthly', 'manual'];
            for (const backupType of types) {
                const typeDir = path_1.default.join(this.backupDir, backupType);
                try {
                    const items = await fs_1.promises.readdir(typeDir);
                    for (const item of items) {
                        const itemPath = path_1.default.join(typeDir, item);
                        const stats = await fs_1.promises.stat(itemPath);
                        if (stats.isDirectory() || item.endsWith('.zip')) {
                            const metadataPath = stats.isDirectory()
                                ? path_1.default.join(itemPath, 'backup-metadata.json')
                                : path_1.default.join(itemPath.replace('.zip', ''), 'backup-metadata.json');
                            let metadata = null;
                            try {
                                const metadataContent = await fs_1.promises.readFile(metadataPath, 'utf8');
                                metadata = JSON.parse(metadataContent);
                            }
                            catch {
                                // Metadados não encontrados, usar informações básicas
                                metadata = {
                                    type: backupType,
                                    createdAt: stats.birthtime.toISOString(),
                                    stats: { totalFiles: 0, totalSize: stats.size }
                                };
                            }
                            backups.push({
                                name: item,
                                type: backupType,
                                path: itemPath,
                                size: stats.size,
                                createdAt: stats.birthtime,
                                metadata
                            });
                        }
                    }
                }
                catch (error) {
                    if (error.code !== 'ENOENT') {
                        console.warn(`⚠️ Erro ao listar backups do tipo ${backupType}:`, error.message);
                    }
                }
            }
            return backups.sort((a, b) => b.createdAt - a.createdAt);
        }
        catch (error) {
            console.error('❌ Erro ao listar backups:', error);
            return [];
        }
    }
    // Restaurar backup
    async restoreBackup(backupName, type = 'manual') {
        try {
            const backupPath = path_1.default.join(this.backupDir, type, backupName);
            // Verificar se backup existe
            await fs_1.promises.access(backupPath);
            console.log(`🔄 Restaurando backup: ${backupName}`);
            // Criar backup atual antes de restaurar
            await this.createBackup('manual');
            // Restaurar uploads
            const uploadsBackup = path_1.default.join(backupPath, 'uploads');
            if (await this.directoryExists(uploadsBackup)) {
                await this.restoreDirectory(uploadsBackup, this.uploadDir);
            }
            // Restaurar arquivos públicos
            const publicBackup = path_1.default.join(backupPath, 'public');
            if (await this.directoryExists(publicBackup)) {
                await this.restoreDirectory(publicBackup, this.publicDir);
            }
            // Restaurar storage
            const storageBackup = path_1.default.join(backupPath, 'storage');
            if (await this.directoryExists(storageBackup)) {
                await this.restoreDirectory(storageBackup, this.storageDir);
            }
            console.log(`✅ Backup restaurado com sucesso: ${backupName}`);
            return { success: true };
        }
        catch (error) {
            console.error('❌ Erro ao restaurar backup:', error);
            return { success: false, error: error.message };
        }
    }
    // Restaurar diretório
    async restoreDirectory(sourceDir, targetDir) {
        await fs_1.promises.mkdir(targetDir, { recursive: true });
        const items = await fs_1.promises.readdir(sourceDir);
        for (const item of items) {
            const sourcePath = path_1.default.join(sourceDir, item);
            const targetPath = path_1.default.join(targetDir, item);
            const stats = await fs_1.promises.stat(sourcePath);
            if (stats.isDirectory()) {
                await this.restoreDirectory(sourcePath, targetPath);
            }
            else {
                await fs_1.promises.copyFile(sourcePath, targetPath);
            }
        }
    }
    // Verificar se diretório existe
    async directoryExists(dirPath) {
        try {
            const stats = await fs_1.promises.stat(dirPath);
            return stats.isDirectory();
        }
        catch {
            return false;
        }
    }
    // Limpar backups antigos
    async cleanupOldBackups() {
        try {
            const retention = {
                daily: 7, // Manter 7 dias
                weekly: 4, // Manter 4 semanas
                monthly: 12, // Manter 12 meses
                manual: 30 // Manter 30 dias
            };
            for (const [type, days] of Object.entries(retention)) {
                const typeDir = path_1.default.join(this.backupDir, type);
                try {
                    const backups = await this.listBackups(type);
                    const cutoffDate = new Date();
                    cutoffDate.setDate(cutoffDate.getDate() - days);
                    for (const backup of backups) {
                        if (backup.createdAt < cutoffDate) {
                            await fs_1.promises.rm(backup.path, { recursive: true, force: true });
                            console.log(`🗑️ Backup antigo removido: ${backup.name}`);
                        }
                    }
                }
                catch (error) {
                    console.warn(`⚠️ Erro na limpeza de backups ${type}:`, error.message);
                }
            }
            console.log('✅ Limpeza de backups antigos concluída');
        }
        catch (error) {
            console.error('❌ Erro na limpeza de backups:', error);
        }
    }
    // Obter estatísticas de backup
    async getBackupStats() {
        try {
            const backups = await this.listBackups();
            const stats = {
                total: backups.length,
                byType: {},
                totalSize: 0,
                oldest: null,
                newest: null
            };
            for (const backup of backups) {
                // Contar por tipo
                stats.byType[backup.type] = (stats.byType[backup.type] || 0) + 1;
                // Somar tamanho
                stats.totalSize += backup.size;
                // Encontrar mais antigo e mais novo
                if (!stats.oldest || backup.createdAt < stats.oldest) {
                    stats.oldest = backup.createdAt;
                }
                if (!stats.newest || backup.createdAt > stats.newest) {
                    stats.newest = backup.createdAt;
                }
            }
            return stats;
        }
        catch (error) {
            console.error('❌ Erro ao obter estatísticas de backup:', error);
            return null;
        }
    }
}
exports.default = new BackupManager();
