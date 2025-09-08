import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { randomBytes, createHash } from 'crypto';
import File from '../models/File';
import User from '../models/User';

class FileManager {
  private basePaths: any;

  constructor() {
    this.basePaths = {
      images: 'uploads/images',
      documents: 'uploads/documents',
      temp: 'uploads/temp',
      public: 'public/assets'
    };
  }

  // Criar diretórios se não existirem
  async ensureDirectories() {
    for (const [key, dirPath] of Object.entries(this.basePaths)) {
      try {
        await fs.access(dirPath as string);
      } catch {
        await fs.mkdir(dirPath as string, { recursive: true });
      }
    }
  }

  // Salvar arquivo
  async saveFile(file, destination, filename = null, userId = null) {
    const finalFilename = filename || this.generateUniqueFilename(file.originalname);
    const filePath = path.join(destination, finalFilename);
    
    await fs.writeFile(filePath, file.buffer);
    
    // Calcular checksum
    const checksum = await this.calculateChecksum(filePath);
    
    // Salvar metadados no banco de dados
    if (userId) {
      const fileRecord = new File({
        filename: finalFilename,
        originalName: file.originalname,
        path: filePath,
        size: file.size,
        mimetype: file.mimetype,
        uploadedBy: userId,
        checksum: checksum
      });
      
      await fileRecord.save();
    }
    
    return { filePath, checksum, filename: finalFilename };
  }

  // Deletar arquivo
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error(`Erro ao deletar arquivo: ${error.message}`);
      return false;
    }
  }

  // Mover arquivo
  async moveFile(sourcePath, destinationPath) {
    try {
      await fs.rename(sourcePath, destinationPath);
      return true;
    } catch (error) {
      console.error(`Erro ao mover arquivo: ${error.message}`);
      return false;
    }
  }

  // Copiar arquivo
  async copyFile(sourcePath, destinationPath) {
    try {
      await fs.copyFile(sourcePath, destinationPath);
      return true;
    } catch (error) {
      console.error(`Erro ao copiar arquivo: ${error.message}`);
      return false;
    }
  }

  // Listar arquivos em um diretório
  async listFiles(directory, extensions = []) {
    try {
      const files = await fs.readdir(directory);
      
      if (extensions.length === 0) {
        return files;
      }

      return files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return extensions.includes(ext);
      });
    } catch (error) {
      console.error(`Erro ao listar arquivos: ${error.message}`);
      return [];
    }
  }

  // Obter informações do arquivo
  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        name: path.basename(filePath),
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      console.error(`Erro ao obter informações do arquivo: ${error.message}`);
      return null;
    }
  }

  // Redimensionar imagem
  async resizeImage(inputPath: string, outputPath: string, options: any = {}) {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'jpeg'
    } = options;

    try {
      await sharp(inputPath)
        .resize(width, height, { fit: 'inside', withoutEnlargement: true })
        .toFormat(format, { quality })
        .toFile(outputPath);

      return true;
    } catch (error) {
      console.error(`Erro ao redimensionar imagem: ${error.message}`);
      return false;
    }
  }

  // Criar thumbnail
  async createThumbnail(inputPath, outputPath, size = 150) {
    try {
      await sharp(inputPath)
        .resize(size, size, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(outputPath);

      return true;
    } catch (error) {
      console.error(`Erro ao criar thumbnail: ${error.message}`);
      return false;
    }
  }

  // Limpar arquivos temporários
  async cleanupTempFiles(maxAge = 24 * 60 * 60 * 1000) { // 24 horas por padrão
    try {
      const tempDir = this.basePaths.temp;
      const files = await fs.readdir(tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          console.log(`Arquivo temporário removido: ${file}`);
        }
      }
    } catch (error) {
      console.error(`Erro na limpeza de arquivos temporários: ${error.message}`);
    }
  }

  // Verificar espaço em disco
  async checkDiskSpace(directory) {
    try {
      // No Windows, usar uma abordagem simplificada
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      // Obter informações do disco usando PowerShell
      const { stdout } = await execAsync(`powershell -Command "Get-WmiObject -Class Win32_LogicalDisk | Where-Object {$_.DeviceID -eq 'C:'} | Select-Object Size,FreeSpace"`);
      
      // Parse da saída do PowerShell
      const lines = stdout.split('\n');
      let size = 0, freeSpace = 0;
      
      for (const line of lines) {
        if (line.includes('Size')) {
          const match = line.match(/(\d+)/);
          if (match) size = parseInt(match[1]);
        }
        if (line.includes('FreeSpace')) {
          const match = line.match(/(\d+)/);
          if (match) freeSpace = parseInt(match[1]);
        }
      }
      
      const usedSpace = size - freeSpace;
      
      return {
        free: freeSpace,
        total: size,
        used: usedSpace,
        percentage: size > 0 ? (usedSpace / size) * 100 : 0
      };
    } catch (error) {
      console.error(`Erro ao verificar espaço em disco: ${error.message}`);
      // Retornar valores padrão se não conseguir obter informações
      return {
        free: 1000000000, // 1GB
        total: 10000000000, // 10GB
        used: 9000000000, // 9GB
        percentage: 90
      };
    }
  }

  // Validar tipo de arquivo
  validateFileType(filename, allowedTypes) {
    const ext = path.extname(filename).toLowerCase();
    return allowedTypes.includes(ext);
  }

  // Gerar nome único para arquivo
  generateUniqueFilename(originalName, prefix = '') {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    
    return `${prefix}${name}-${timestamp}-${random}${ext}`;
  }

  // Calcular checksum do arquivo
  async calculateChecksum(filePath) {
    try {
      const fileBuffer = await fs.readFile(filePath);
      return createHash('sha256').update(fileBuffer).digest('hex');
    } catch (error) {
      console.error('Erro ao calcular checksum:', error);
      return null;
    }
  }

  // Processar metadados de imagem
  async processImageMetadata(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        hasAlpha: metadata.hasAlpha,
        density: metadata.density,
        space: metadata.space,
        channels: metadata.channels
      };
    } catch (error) {
      console.error('Erro ao processar metadados da imagem:', error);
      return null;
    }
  }

  // Buscar arquivos por critérios
  async findFiles(criteria: any = {}) {
    try {
      const query: any = { status: 'active' };
      
      if (criteria.userId) {
        query.$or = [
          { uploadedBy: criteria.userId },
          { isPublic: true },
          { 'permissions.read': criteria.userId }
        ];
      }
      
      if (criteria.category) {
        query.category = criteria.category;
      }
      
      if (criteria.tags && criteria.tags.length > 0) {
        query.tags = { $in: criteria.tags };
      }
      
      if (criteria.search) {
        query.$or = [
          { originalName: { $regex: criteria.search, $options: 'i' } },
          { description: { $regex: criteria.search, $options: 'i' } },
          { tags: { $in: [new RegExp(criteria.search, 'i')] } }
        ];
      }
      
      const files = await File.find(query)
        .populate('uploadedBy', 'name email')
        .sort({ uploadDate: -1 })
        .limit(criteria.limit || 50)
        .skip(criteria.skip || 0);
      
      return files;
    } catch (error) {
      console.error('Erro ao buscar arquivos:', error);
      return [];
    }
  }

  // Atualizar estatísticas do usuário
  async updateUserStats(userId, fileSize) {
    try {
      await User.findByIdAndUpdate(userId, {
        $inc: {
          'stats.totalUploads': 1,
          'stats.totalStorageUsed': fileSize
        },
        $set: {
          'stats.lastUploadDate': new Date()
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar estatísticas do usuário:', error);
    }
  }
}

export default new FileManager();
