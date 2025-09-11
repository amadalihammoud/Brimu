"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const upload_1 = require("../config/upload");
const fileManager_1 = __importDefault(require("../utils/fileManager"));
const auth_1 = require("../middleware/auth");
const File_1 = __importDefault(require("../models/File"));
const User_1 = __importDefault(require("../models/User"));
const queryHelpers_1 = require("../utils/queryHelpers");
const router = express_1.default.Router();
// Middleware para garantir que os diretórios existam
router.use(async (req, res, next) => {
    await fileManager_1.default.ensureDirectories();
    next();
});
// Upload de imagem única
router.post('/image', auth_1.auth, upload_1.imageUpload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado' });
        }
        const userId = req.user.id;
        // Verificar se usuário pode fazer upload
        const user = await User_1.default.findById(userId);
        if (!user.canUpload(req.file.size, 1)) {
            return res.status(403).json({
                message: 'Usuário não tem permissão para fazer upload ou arquivo muito grande'
            });
        }
        // Processar metadados da imagem
        const imageMetadata = await fileManager_1.default.processImageMetadata(req.file.path);
        // Criar thumbnail se configurado
        let thumbnailPath = null;
        if (user.uploadSettings.createThumbnails) {
            const thumbnailDir = path_1.default.join('uploads', 'thumbnails');
            await fileManager_1.default.ensureDirectories();
            thumbnailPath = path_1.default.join(thumbnailDir, `thumb_${req.file.filename}`);
            await fileManager_1.default.createThumbnail(req.file.path, thumbnailPath);
        }
        // Salvar arquivo no banco de dados
        const fileRecord = new File_1.default({
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadedBy: userId,
            imageMetadata: {
                ...imageMetadata,
                hasThumbnail: !!thumbnailPath,
                thumbnailPath: thumbnailPath
            },
            checksum: await fileManager_1.default.calculateChecksum(req.file.path)
        });
        await fileRecord.save();
        // Atualizar estatísticas do usuário
        await fileManager_1.default.updateUserStats(userId, req.file.size);
        res.status(200).json({
            message: 'Imagem enviada com sucesso',
            file: {
                id: fileRecord._id,
                filename: req.file.filename,
                originalname: req.file.originalname,
                path: req.file.path,
                size: req.file.size,
                mimetype: req.file.mimetype,
                url: fileRecord.url,
                thumbnailUrl: fileRecord.thumbnailUrl,
                imageMetadata: imageMetadata
            }
        });
    }
    catch (error) {
        console.error('Erro no upload de imagem:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Upload de múltiplas imagens
router.post('/images', auth_1.auth, upload_1.multipleImages, async (req, res) => {
    try {
        if (!req.files || (Array.isArray(req.files) ? req.files.length === 0 : Object.keys(req.files).length === 0)) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado' });
        }
        const uploadedFiles = [];
        const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
        for (const file of files) {
            const fileInfo = await fileManager_1.default.getFileInfo(file.path);
            uploadedFiles.push({
                filename: file.filename,
                originalname: file.originalname,
                path: file.path,
                size: fileInfo.size,
                mimetype: file.mimetype
            });
        }
        res.status(200).json({
            message: `${uploadedFiles.length} imagens enviadas com sucesso`,
            files: uploadedFiles
        });
    }
    catch (error) {
        console.error('Erro no upload de múltiplas imagens:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Upload de documento único
router.post('/document', auth_1.auth, upload_1.documentUpload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado' });
        }
        const fileInfo = await fileManager_1.default.getFileInfo(req.file.path);
        res.status(200).json({
            message: 'Documento enviado com sucesso',
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                path: req.file.path,
                size: fileInfo.size,
                mimetype: req.file.mimetype
            }
        });
    }
    catch (error) {
        console.error('Erro no upload de documento:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Upload de múltiplos documentos
router.post('/documents', auth_1.auth, upload_1.multipleDocuments, async (req, res) => {
    try {
        if (!req.files || (Array.isArray(req.files) ? req.files.length === 0 : Object.keys(req.files).length === 0)) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado' });
        }
        const uploadedFiles = [];
        const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
        for (const file of files) {
            const fileInfo = await fileManager_1.default.getFileInfo(file.path);
            uploadedFiles.push({
                filename: file.filename,
                originalname: file.originalname,
                path: file.path,
                size: fileInfo.size,
                mimetype: file.mimetype
            });
        }
        res.status(200).json({
            message: `${uploadedFiles.length} documentos enviados com sucesso`,
            files: uploadedFiles
        });
    }
    catch (error) {
        console.error('Erro no upload de múltiplos documentos:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Listar arquivos por tipo
router.get('/files/:type', auth_1.auth, async (req, res) => {
    try {
        const { type } = req.params;
        const { directory } = req.query;
        let targetDir;
        switch (type) {
            case 'images':
                targetDir = directory || 'uploads/images';
                break;
            case 'documents':
                targetDir = directory || 'uploads/documents';
                break;
            default:
                return res.status(400).json({ message: 'Tipo de arquivo inválido' });
        }
        const files = await fileManager_1.default.listFiles(targetDir);
        const filesInfo = [];
        for (const file of files) {
            const filePath = `${targetDir}/${file}`;
            const info = await fileManager_1.default.getFileInfo(filePath);
            if (info) {
                filesInfo.push({
                    ...info,
                    path: filePath
                });
            }
        }
        res.status(200).json({
            message: 'Arquivos listados com sucesso',
            files: filesInfo
        });
    }
    catch (error) {
        console.error('Erro ao listar arquivos:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Deletar arquivo
router.delete('/file/:filename', auth_1.auth, async (req, res) => {
    try {
        const { filename } = req.params;
        const { type } = req.query;
        let targetDir;
        switch (type) {
            case 'images':
                targetDir = 'uploads/images';
                break;
            case 'documents':
                targetDir = 'uploads/documents';
                break;
            default:
                return res.status(400).json({ message: 'Tipo de arquivo inválido' });
        }
        const filePath = `${targetDir}/${filename}`;
        const deleted = await fileManager_1.default.deleteFile(filePath);
        if (deleted) {
            res.status(200).json({ message: 'Arquivo deletado com sucesso' });
        }
        else {
            res.status(404).json({ message: 'Arquivo não encontrado' });
        }
    }
    catch (error) {
        console.error('Erro ao deletar arquivo:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Redimensionar imagem
router.post('/resize-image', auth_1.auth, async (req, res) => {
    try {
        const { inputPath, outputPath, width, height, quality, format } = req.body;
        if (!inputPath || !outputPath) {
            return res.status(400).json({ message: 'Caminhos de entrada e saída são obrigatórios' });
        }
        const success = await fileManager_1.default.resizeImage(inputPath, outputPath, {
            width: parseInt(width) || 800,
            height: parseInt(height) || 600,
            quality: parseInt(quality) || 80,
            format: format || 'jpeg'
        });
        if (success) {
            res.status(200).json({ message: 'Imagem redimensionada com sucesso' });
        }
        else {
            res.status(500).json({ message: 'Erro ao redimensionar imagem' });
        }
    }
    catch (error) {
        console.error('Erro ao redimensionar imagem:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Criar thumbnail
router.post('/thumbnail', auth_1.auth, async (req, res) => {
    try {
        const { inputPath, outputPath, size } = req.body;
        if (!inputPath || !outputPath) {
            return res.status(400).json({ message: 'Caminhos de entrada e saída são obrigatórios' });
        }
        const success = await fileManager_1.default.createThumbnail(inputPath, outputPath, parseInt(size) || 150);
        if (success) {
            res.status(200).json({ message: 'Thumbnail criado com sucesso' });
        }
        else {
            res.status(500).json({ message: 'Erro ao criar thumbnail' });
        }
    }
    catch (error) {
        console.error('Erro ao criar thumbnail:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Limpar arquivos temporários
router.post('/cleanup-temp', auth_1.auth, async (req, res) => {
    try {
        const { maxAge } = req.body;
        await fileManager_1.default.cleanupTempFiles(maxAge);
        res.status(200).json({ message: 'Limpeza de arquivos temporários concluída' });
    }
    catch (error) {
        console.error('Erro na limpeza de arquivos temporários:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Verificar espaço em disco
router.get('/disk-space', auth_1.auth, async (req, res) => {
    try {
        const { directory } = req.query;
        const targetDir = directory || 'uploads';
        const spaceInfo = await fileManager_1.default.checkDiskSpace(targetDir);
        if (spaceInfo) {
            res.status(200).json({
                message: 'Informações de espaço em disco obtidas',
                space: spaceInfo
            });
        }
        else {
            res.status(500).json({ message: 'Erro ao verificar espaço em disco' });
        }
    }
    catch (error) {
        console.error('Erro ao verificar espaço em disco:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Buscar arquivos com filtros
router.get('/search', auth_1.auth, async (req, res) => {
    try {
        const { category, tags, search, limit = 50, skip = 0, sortBy = 'uploadDate', sortOrder = 'desc' } = req.query;
        const criteria = {
            userId: req.user.id,
            category,
            tags: tags ? (0, queryHelpers_1.parseStringParam)(tags).split(',') : undefined,
            search,
            limit: (0, queryHelpers_1.parseNumberParam)(limit),
            skip: (0, queryHelpers_1.parseNumberParam)(skip)
        };
        const files = await fileManager_1.default.findFiles(criteria);
        res.status(200).json({
            message: 'Arquivos encontrados',
            files: files,
            total: files.length,
            criteria: criteria
        });
    }
    catch (error) {
        console.error('Erro ao buscar arquivos:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Obter arquivo por ID
router.get('/file/:id', auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const file = await File_1.default.findById(id).populate('uploadedBy', 'name email');
        if (!file) {
            return res.status(404).json({ message: 'Arquivo não encontrado' });
        }
        // Verificar permissões
        if (!file.canAccess(userId, 'read')) {
            return res.status(403).json({ message: 'Acesso negado' });
        }
        // Incrementar contador de visualizações
        await file.incrementView();
        res.status(200).json({
            message: 'Arquivo encontrado',
            file: file
        });
    }
    catch (error) {
        console.error('Erro ao obter arquivo:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Atualizar metadados do arquivo
router.put('/file/:id', auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { tags, description, isPublic } = req.body;
        const file = await File_1.default.findById(id);
        if (!file) {
            return res.status(404).json({ message: 'Arquivo não encontrado' });
        }
        // Verificar permissões
        if (!file.canAccess(userId, 'write')) {
            return res.status(403).json({ message: 'Acesso negado' });
        }
        // Atualizar campos permitidos
        if (tags !== undefined)
            file.tags = tags;
        if (description !== undefined)
            file.description = description;
        if (isPublic !== undefined)
            file.isPublic = isPublic;
        await file.save();
        res.status(200).json({
            message: 'Arquivo atualizado com sucesso',
            file: file
        });
    }
    catch (error) {
        console.error('Erro ao atualizar arquivo:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Download de arquivo
router.get('/download/:id', auth_1.auth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const file = await File_1.default.findById(id);
        if (!file) {
            return res.status(404).json({ message: 'Arquivo não encontrado' });
        }
        // Verificar permissões
        if (!file.canAccess(userId, 'read')) {
            return res.status(403).json({ message: 'Acesso negado' });
        }
        // Verificar se arquivo existe fisicamente
        try {
            await promises_1.default.access(file.path);
        }
        catch {
            return res.status(404).json({ message: 'Arquivo não encontrado no sistema de arquivos' });
        }
        // Incrementar contador de downloads
        await file.incrementDownload();
        // Definir headers para download
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.setHeader('Content-Type', file.mimetype);
        res.setHeader('Content-Length', file.size);
        // Enviar arquivo
        res.sendFile(path_1.default.resolve(file.path));
    }
    catch (error) {
        console.error('Erro no download:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Estatísticas de arquivos
router.get('/stats', auth_1.auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User_1.default.findById(userId);
        if (!user.hasPermission('viewAnalytics')) {
            return res.status(403).json({ message: 'Acesso negado' });
        }
        const stats = await File_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    totalFiles: { $sum: 1 },
                    totalSize: { $sum: '$size' },
                    totalDownloads: { $sum: '$downloadCount' },
                    totalViews: { $sum: '$viewCount' },
                    byCategory: {
                        $push: {
                            category: '$category',
                            size: '$size'
                        }
                    }
                }
            }
        ]);
        const categoryStats = await File_1.default.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalSize: { $sum: '$size' }
                }
            }
        ]);
        res.status(200).json({
            message: 'Estatísticas obtidas',
            stats: stats[0] || {
                totalFiles: 0,
                totalSize: 0,
                totalDownloads: 0,
                totalViews: 0
            },
            categoryStats: categoryStats
        });
    }
    catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
exports.default = router;
