import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { imageUpload, documentUpload, multipleImages, multipleDocuments } from '../config/upload';
import fileManager from '../utils/fileManager';
import { auth } from '../middleware/auth';
import File from '../models/File';
import User from '../models/User';
import { parseStringParam, parseNumberParam } from '../utils/queryHelpers';

const router = express.Router();

// Middleware para garantir que os diretórios existam
router.use(async (req: Request, res: Response, next: NextFunction) => {
  await fileManager.ensureDirectories();
  next();
});

// Upload de imagem única
router.post('/image', auth, (imageUpload as any).single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    const userId = req.user.id;
    
    // Verificar se usuário pode fazer upload
    const user = await User.findById(userId);
    if (!user.canUpload(req.file.size, 1)) {
      return res.status(403).json({ 
        message: 'Usuário não tem permissão para fazer upload ou arquivo muito grande' 
      });
    }

    // Processar metadados da imagem
    const imageMetadata = await fileManager.processImageMetadata(req.file.path);
    
    // Criar thumbnail se configurado
    let thumbnailPath = null;
    if (user.uploadSettings.createThumbnails) {
      const thumbnailDir = path.join('uploads', 'thumbnails');
      await fileManager.ensureDirectories();
      thumbnailPath = path.join(thumbnailDir, `thumb_${req.file.filename}`);
      await fileManager.createThumbnail(req.file.path, thumbnailPath);
    }

    // Salvar arquivo no banco de dados
    const fileRecord = new File({
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
      checksum: await fileManager.calculateChecksum(req.file.path)
    });

    await fileRecord.save();
    
    // Atualizar estatísticas do usuário
    await fileManager.updateUserStats(userId, req.file.size);
    
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
  } catch (error) {
    console.error('Erro no upload de imagem:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Upload de múltiplas imagens
router.post('/images', auth, (multipleImages as any), async (req: Request, res: Response) => {
  try {
    if (!req.files || (Array.isArray(req.files) ? req.files.length === 0 : Object.keys(req.files).length === 0)) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    const uploadedFiles = [];
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    
    for (const file of files) {
      const fileInfo = await fileManager.getFileInfo(file.path);
      
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
  } catch (error) {
    console.error('Erro no upload de múltiplas imagens:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Upload de documento único
router.post('/document', auth, (documentUpload as any).single('document'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    const fileInfo = await fileManager.getFileInfo(req.file.path);
    
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
  } catch (error) {
    console.error('Erro no upload de documento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Upload de múltiplos documentos
router.post('/documents', auth, (multipleDocuments as any), async (req: Request, res: Response) => {
  try {
    if (!req.files || (Array.isArray(req.files) ? req.files.length === 0 : Object.keys(req.files).length === 0)) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    const uploadedFiles = [];
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    
    for (const file of files) {
      const fileInfo = await fileManager.getFileInfo(file.path);
      
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
  } catch (error) {
    console.error('Erro no upload de múltiplos documentos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar arquivos por tipo
router.get('/files/:type', auth, async (req: Request, res: Response) => {
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

    const files = await fileManager.listFiles(targetDir);
    const filesInfo = [];

    for (const file of files) {
      const filePath = `${targetDir}/${file}`;
      const info = await fileManager.getFileInfo(filePath);
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
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar arquivo
router.delete('/file/:filename', auth, async (req: Request, res: Response) => {
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
    const deleted = await fileManager.deleteFile(filePath);

    if (deleted) {
      res.status(200).json({ message: 'Arquivo deletado com sucesso' });
    } else {
      res.status(404).json({ message: 'Arquivo não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Redimensionar imagem
router.post('/resize-image', auth, async (req: Request, res: Response) => {
  try {
    const { inputPath, outputPath, width, height, quality, format } = req.body;

    if (!inputPath || !outputPath) {
      return res.status(400).json({ message: 'Caminhos de entrada e saída são obrigatórios' });
    }

    const success = await fileManager.resizeImage(inputPath, outputPath, {
      width: parseInt(width) || 800,
      height: parseInt(height) || 600,
      quality: parseInt(quality) || 80,
      format: format || 'jpeg'
    });

    if (success) {
      res.status(200).json({ message: 'Imagem redimensionada com sucesso' });
    } else {
      res.status(500).json({ message: 'Erro ao redimensionar imagem' });
    }
  } catch (error) {
    console.error('Erro ao redimensionar imagem:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar thumbnail
router.post('/thumbnail', auth, async (req: Request, res: Response) => {
  try {
    const { inputPath, outputPath, size } = req.body;

    if (!inputPath || !outputPath) {
      return res.status(400).json({ message: 'Caminhos de entrada e saída são obrigatórios' });
    }

    const success = await fileManager.createThumbnail(
      inputPath, 
      outputPath, 
      parseInt(size) || 150
    );

    if (success) {
      res.status(200).json({ message: 'Thumbnail criado com sucesso' });
    } else {
      res.status(500).json({ message: 'Erro ao criar thumbnail' });
    }
  } catch (error) {
    console.error('Erro ao criar thumbnail:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Limpar arquivos temporários
router.post('/cleanup-temp', auth, async (req: Request, res: Response) => {
  try {
    const { maxAge } = req.body;
    await fileManager.cleanupTempFiles(maxAge);
    
    res.status(200).json({ message: 'Limpeza de arquivos temporários concluída' });
  } catch (error) {
    console.error('Erro na limpeza de arquivos temporários:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificar espaço em disco
router.get('/disk-space', auth, async (req: Request, res: Response) => {
  try {
    const { directory } = req.query;
    const targetDir = directory || 'uploads';
    
    const spaceInfo = await fileManager.checkDiskSpace(targetDir);
    
    if (spaceInfo) {
      res.status(200).json({
        message: 'Informações de espaço em disco obtidas',
        space: spaceInfo
      });
    } else {
      res.status(500).json({ message: 'Erro ao verificar espaço em disco' });
    }
  } catch (error) {
    console.error('Erro ao verificar espaço em disco:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Buscar arquivos com filtros
router.get('/search', auth, async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      tags, 
      search, 
      limit = 50, 
      skip = 0,
      sortBy = 'uploadDate',
      sortOrder = 'desc'
    } = req.query;

    const criteria = {
      userId: req.user.id,
      category,
      tags: tags ? parseStringParam(tags).split(',') : undefined,
      search,
      limit: parseNumberParam(limit),
      skip: parseNumberParam(skip)
    };

    const files = await fileManager.findFiles(criteria);
    
    res.status(200).json({
      message: 'Arquivos encontrados',
      files: files,
      total: files.length,
      criteria: criteria
    });
  } catch (error) {
    console.error('Erro ao buscar arquivos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter arquivo por ID
router.get('/file/:id', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const file = await File.findById(id).populate('uploadedBy', 'name email');
    
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
  } catch (error) {
    console.error('Erro ao obter arquivo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar metadados do arquivo
router.put('/file/:id', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { tags, description, isPublic } = req.body;

    const file = await File.findById(id);
    
    if (!file) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }

    // Verificar permissões
    if (!file.canAccess(userId, 'write')) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Atualizar campos permitidos
    if (tags !== undefined) file.tags = tags;
    if (description !== undefined) file.description = description;
    if (isPublic !== undefined) file.isPublic = isPublic;

    await file.save();

    res.status(200).json({
      message: 'Arquivo atualizado com sucesso',
      file: file
    });
  } catch (error) {
    console.error('Erro ao atualizar arquivo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Download de arquivo
router.get('/download/:id', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const file = await File.findById(id);
    
    if (!file) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }

    // Verificar permissões
    if (!file.canAccess(userId, 'read')) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Verificar se arquivo existe fisicamente
    try {
      await fs.access(file.path);
    } catch {
      return res.status(404).json({ message: 'Arquivo não encontrado no sistema de arquivos' });
    }

    // Incrementar contador de downloads
    await file.incrementDownload();

    // Definir headers para download
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Length', file.size);

    // Enviar arquivo
    res.sendFile(path.resolve(file.path));
  } catch (error) {
    console.error('Erro no download:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Estatísticas de arquivos
router.get('/stats', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user.hasPermission('viewAnalytics')) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const stats = await File.aggregate([
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

    const categoryStats = await File.aggregate([
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
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
