"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const crypto_1 = require("crypto");
const File_1 = __importDefault(require("../models/File"));
const User_1 = __importDefault(require("../models/User"));
class FileManager {
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
                await promises_1.default.access(dirPath);
            }
            catch {
                await promises_1.default.mkdir(dirPath, { recursive: true });
            }
        }
    }
    // Salvar arquivo
    async saveFile(file, destination, filename = null, userId = null) {
        const finalFilename = filename || this.generateUniqueFilename(file.originalname);
        const filePath = path_1.default.join(destination, finalFilename);
        await promises_1.default.writeFile(filePath, file.buffer);
        // Calcular checksum
        const checksum = await this.calculateChecksum(filePath);
        // Salvar metadados no banco de dados
        if (userId) {
            const fileRecord = new File_1.default({
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
            await promises_1.default.unlink(filePath);
            return true;
        }
        catch (error) {
            console.error(`Erro ao deletar arquivo: ${error.message}`);
            return false;
        }
    }
    // Mover arquivo
    async moveFile(sourcePath, destinationPath) {
        try {
            await promises_1.default.rename(sourcePath, destinationPath);
            return true;
        }
        catch (error) {
            console.error(`Erro ao mover arquivo: ${error.message}`);
            return false;
        }
    }
    // Copiar arquivo
    async copyFile(sourcePath, destinationPath) {
        try {
            await promises_1.default.copyFile(sourcePath, destinationPath);
            return true;
        }
        catch (error) {
            console.error(`Erro ao copiar arquivo: ${error.message}`);
            return false;
        }
    }
    // Listar arquivos em um diretório
    async listFiles(directory, extensions = []) {
        try {
            const files = await promises_1.default.readdir(directory);
            if (extensions.length === 0) {
                return files;
            }
            return files.filter(file => {
                const ext = path_1.default.extname(file).toLowerCase();
                return extensions.includes(ext);
            });
        }
        catch (error) {
            console.error(`Erro ao listar arquivos: ${error.message}`);
            return [];
        }
    }
    // Obter informações do arquivo
    async getFileInfo(filePath) {
        try {
            const stats = await promises_1.default.stat(filePath);
            return {
                name: path_1.default.basename(filePath),
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                isDirectory: stats.isDirectory()
            };
        }
        catch (error) {
            console.error(`Erro ao obter informações do arquivo: ${error.message}`);
            return null;
        }
    }
    // Redimensionar imagem
    async resizeImage(inputPath, outputPath, options = {}) {
        const { width = 800, height = 600, quality = 80, format = 'jpeg' } = options;
        try {
            await (0, sharp_1.default)(inputPath)
                .resize(width, height, { fit: 'inside', withoutEnlargement: true })
                .toFormat(format, { quality })
                .toFile(outputPath);
            return true;
        }
        catch (error) {
            console.error(`Erro ao redimensionar imagem: ${error.message}`);
            return false;
        }
    }
    // Criar thumbnail
    async createThumbnail(inputPath, outputPath, size = 150) {
        try {
            await (0, sharp_1.default)(inputPath)
                .resize(size, size, { fit: 'cover' })
                .jpeg({ quality: 80 })
                .toFile(outputPath);
            return true;
        }
        catch (error) {
            console.error(`Erro ao criar thumbnail: ${error.message}`);
            return false;
        }
    }
    // Limpar arquivos temporários
    async cleanupTempFiles(maxAge = 24 * 60 * 60 * 1000) {
        try {
            const tempDir = this.basePaths.temp;
            const files = await promises_1.default.readdir(tempDir);
            const now = Date.now();
            for (const file of files) {
                const filePath = path_1.default.join(tempDir, file);
                const stats = await promises_1.default.stat(filePath);
                if (now - stats.mtime.getTime() > maxAge) {
                    await promises_1.default.unlink(filePath);
                    console.log(`Arquivo temporário removido: ${file}`);
                }
            }
        }
        catch (error) {
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
                    if (match)
                        size = parseInt(match[1]);
                }
                if (line.includes('FreeSpace')) {
                    const match = line.match(/(\d+)/);
                    if (match)
                        freeSpace = parseInt(match[1]);
                }
            }
            const usedSpace = size - freeSpace;
            return {
                free: freeSpace,
                total: size,
                used: usedSpace,
                percentage: size > 0 ? (usedSpace / size) * 100 : 0
            };
        }
        catch (error) {
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
        const ext = path_1.default.extname(filename).toLowerCase();
        return allowedTypes.includes(ext);
    }
    // Gerar nome único para arquivo
    generateUniqueFilename(originalName, prefix = '') {
        const ext = path_1.default.extname(originalName);
        const name = path_1.default.basename(originalName, ext);
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${prefix}${name}-${timestamp}-${random}${ext}`;
    }
    // Calcular checksum do arquivo
    async calculateChecksum(filePath) {
        try {
            const fileBuffer = await promises_1.default.readFile(filePath);
            return (0, crypto_1.createHash)('sha256').update(fileBuffer).digest('hex');
        }
        catch (error) {
            console.error('Erro ao calcular checksum:', error);
            return null;
        }
    }
    // Processar metadados de imagem
    async processImageMetadata(filePath) {
        try {
            const metadata = await (0, sharp_1.default)(filePath).metadata();
            return {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                hasAlpha: metadata.hasAlpha,
                density: metadata.density,
                space: metadata.space,
                channels: metadata.channels
            };
        }
        catch (error) {
            console.error('Erro ao processar metadados da imagem:', error);
            return null;
        }
    }
    // Buscar arquivos por critérios
    async findFiles(criteria = {}) {
        try {
            const query = { status: 'active' };
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
            const files = await File_1.default.find(query)
                .populate('uploadedBy', 'name email')
                .sort({ uploadDate: -1 })
                .limit(criteria.limit || 50)
                .skip(criteria.skip || 0);
            return files;
        }
        catch (error) {
            console.error('Erro ao buscar arquivos:', error);
            return [];
        }
    }
    // Atualizar estatísticas do usuário
    async updateUserStats(userId, fileSize) {
        try {
            await User_1.default.findByIdAndUpdate(userId, {
                $inc: {
                    'stats.totalUploads': 1,
                    'stats.totalStorageUsed': fileSize
                },
                $set: {
                    'stats.lastUploadDate': new Date()
                }
            });
        }
        catch (error) {
            console.error('Erro ao atualizar estatísticas do usuário:', error);
        }
    }
}
exports.default = new FileManager();
