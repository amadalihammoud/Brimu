import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import cron from 'node-cron';

const execAsync = promisify(exec);

class BackupManager {
  public backupDir: string;
  public uploadDir: string; 
  public publicDir: string;
  public storageDir: string;

  constructor() {
    this.backupDir = path.join(process.cwd(), 'storage', 'backups');
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.publicDir = path.join(process.cwd(), 'public');
    this.storageDir = path.join(process.cwd(), 'storage');
    
    this.ensureBackupDirectories();
    this.setupCronJobs();
  }

  // Criar diretórios de backup se não existirem
  async ensureBackupDirectories() {
    const dirs = [
      this.backupDir,
      path.join(this.backupDir, 'daily'),
      path.join(this.backupDir, 'weekly'),
      path.join(this.backupDir, 'monthly'),
      path.join(this.backupDir, 'manual')
    ];

    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        console.log(`📁 Diretório de backup criado: ${dir}`);
      }
    }
  }

  // Configurar jobs de backup automático
  setupCronJobs() {
    // Backup diário às 02:00
    cron.schedule('0 2 * * *', async () => {
      console.log('🔄 Iniciando backup diário...');
      await this.createBackup('daily');
    });

    // Backup semanal aos domingos às 03:00
    cron.schedule('0 3 * * 0', async () => {
      console.log('🔄 Iniciando backup semanal...');
      await this.createBackup('weekly');
    });

    // Backup mensal no primeiro domingo às 04:00
    cron.schedule('0 4 1-7 * 0', async () => {
      console.log('🔄 Iniciando backup mensal...');
      await this.createBackup('monthly');
    });

    // Limpeza de backups antigos diariamente às 05:00
    cron.schedule('0 5 * * *', async () => {
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
      const backupPath = path.join(this.backupDir, type, backupName);

      console.log(`📦 Criando backup: ${backupName}`);

      // Criar diretório do backup
      await fs.mkdir(backupPath, { recursive: true });

      // Backup dos uploads
      await this.backupDirectory(this.uploadDir, path.join(backupPath, 'uploads'));

      // Backup dos arquivos públicos
      await this.backupDirectory(this.publicDir, path.join(backupPath, 'public'));

      // Backup do storage compartilhado
      await this.backupDirectory(this.storageDir, path.join(backupPath, 'storage'));

      // Criar arquivo de metadados do backup
      await this.createBackupMetadata(backupPath, type);

      // Comprimir backup se disponível
      if (await this.isZipAvailable()) {
        await this.compressBackup(backupPath);
      }

      console.log(`✅ Backup criado com sucesso: ${backupName}`);
      return { success: true, backupName, backupPath };

    } catch (error) {
      console.error('❌ Erro ao criar backup:', error);
      return { success: false, error: error.message };
    }
  }

  // Backup de um diretório
  async backupDirectory(sourceDir, targetDir) {
    try {
      await fs.access(sourceDir);
      await fs.mkdir(targetDir, { recursive: true });

      const items = await fs.readdir(sourceDir);
      
      for (const item of items) {
        const sourcePath = path.join(sourceDir, item);
        const targetPath = path.join(targetDir, item);
        
        const stats = await fs.stat(sourcePath);
        
        if (stats.isDirectory()) {
          await this.backupDirectory(sourcePath, targetPath);
        } else {
          await fs.copyFile(sourcePath, targetPath);
        }
      }
    } catch (error) {
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

    const metadataPath = path.join(backupPath, 'backup-metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
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
        const items = await fs.readdir(dir);
        
        for (const item of items) {
          const itemPath = path.join(dir, item);
          const itemStats = await fs.stat(itemPath);
          
          if (itemStats.isDirectory()) {
            stats.directories++;
            await countFiles(itemPath);
          } else {
            stats.totalFiles++;
            stats.totalSize += itemStats.size;
          }
        }
      };

      await countFiles(backupPath);
      return stats;
    } catch (error) {
      return { totalFiles: 0, totalSize: 0, directories: 0 };
    }
  }

  // Verificar se zip está disponível
  async isZipAvailable() {
    try {
      // No Windows, usar PowerShell para compressão
      await execAsync('powershell -Command "Get-Command Compress-Archive"');
      return true;
    } catch {
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
      await fs.rm(backupPath, { recursive: true, force: true });
      
      console.log(`📦 Backup comprimido: ${path.basename(zipPath)}`);
    } catch (error) {
      console.warn('⚠️ Erro ao comprimir backup:', error.message);
    }
  }

  // Listar backups
  async listBackups(type = null) {
    try {
      const backups = [];
      const types = type ? [type] : ['daily', 'weekly', 'monthly', 'manual'];

      for (const backupType of types) {
        const typeDir = path.join(this.backupDir, backupType);
        
        try {
          const items = await fs.readdir(typeDir);
          
          for (const item of items) {
            const itemPath = path.join(typeDir, item);
            const stats = await fs.stat(itemPath);
            
            if (stats.isDirectory() || item.endsWith('.zip')) {
              const metadataPath = stats.isDirectory() 
                ? path.join(itemPath, 'backup-metadata.json')
                : path.join(itemPath.replace('.zip', ''), 'backup-metadata.json');
              
              let metadata = null;
              try {
                const metadataContent = await fs.readFile(metadataPath, 'utf8');
                metadata = JSON.parse(metadataContent);
              } catch {
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
        } catch (error) {
          if (error.code !== 'ENOENT') {
            console.warn(`⚠️ Erro ao listar backups do tipo ${backupType}:`, error.message);
          }
        }
      }

      return backups.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('❌ Erro ao listar backups:', error);
      return [];
    }
  }

  // Restaurar backup
  async restoreBackup(backupName, type = 'manual') {
    try {
      const backupPath = path.join(this.backupDir, type, backupName);
      
      // Verificar se backup existe
      await fs.access(backupPath);
      
      console.log(`🔄 Restaurando backup: ${backupName}`);

      // Criar backup atual antes de restaurar
      await this.createBackup('manual');

      // Restaurar uploads
      const uploadsBackup = path.join(backupPath, 'uploads');
      if (await this.directoryExists(uploadsBackup)) {
        await this.restoreDirectory(uploadsBackup, this.uploadDir);
      }

      // Restaurar arquivos públicos
      const publicBackup = path.join(backupPath, 'public');
      if (await this.directoryExists(publicBackup)) {
        await this.restoreDirectory(publicBackup, this.publicDir);
      }

      // Restaurar storage
      const storageBackup = path.join(backupPath, 'storage');
      if (await this.directoryExists(storageBackup)) {
        await this.restoreDirectory(storageBackup, this.storageDir);
      }

      console.log(`✅ Backup restaurado com sucesso: ${backupName}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao restaurar backup:', error);
      return { success: false, error: error.message };
    }
  }

  // Restaurar diretório
  async restoreDirectory(sourceDir, targetDir) {
    await fs.mkdir(targetDir, { recursive: true });
    
    const items = await fs.readdir(sourceDir);
    
    for (const item of items) {
      const sourcePath = path.join(sourceDir, item);
      const targetPath = path.join(targetDir, item);
      
      const stats = await fs.stat(sourcePath);
      
      if (stats.isDirectory()) {
        await this.restoreDirectory(sourcePath, targetPath);
      } else {
        await fs.copyFile(sourcePath, targetPath);
      }
    }
  }

  // Verificar se diretório existe
  async directoryExists(dirPath) {
    try {
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  // Limpar backups antigos
  async cleanupOldBackups() {
    try {
      const retention = {
        daily: 7,    // Manter 7 dias
        weekly: 4,   // Manter 4 semanas
        monthly: 12, // Manter 12 meses
        manual: 30   // Manter 30 dias
      };

      for (const [type, days] of Object.entries(retention)) {
        const typeDir = path.join(this.backupDir, type);
        
        try {
          const backups = await this.listBackups(type);
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);

          for (const backup of backups) {
            if (backup.createdAt < cutoffDate) {
              await fs.rm(backup.path, { recursive: true, force: true });
              console.log(`🗑️ Backup antigo removido: ${backup.name}`);
            }
          }
        } catch (error) {
          console.warn(`⚠️ Erro na limpeza de backups ${type}:`, error.message);
        }
      }

      console.log('✅ Limpeza de backups antigos concluída');
    } catch (error) {
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
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de backup:', error);
      return null;
    }
  }

  // Método para verificar integridade dos backups
  async verifyBackupIntegrity(backupId: string): Promise<{ isValid: boolean; errors?: string[] }> {
    try {
      // Implementação básica - pode ser expandida
      const backupPath = path.join(this.backupDir, backupId);
      await fs.access(backupPath);
      return { isValid: true };
    } catch (error) {
      return { isValid: false, errors: [`Backup ${backupId} não encontrado`] };
    }
  }
}

export default new BackupManager();
