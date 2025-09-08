import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs/promises';
import backupManager from '../utils/backupManager';
import { auth } from '../middleware/auth';
import User from '../models/User';
import { parseStringParam } from '../utils/queryHelpers';

const router = express.Router();

// Middleware para verificar permissões de administrador
const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Criar backup manual
router.post('/create', auth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { type = 'manual' } = req.body;
    
    const result = await backupManager.createBackup(type);
    
    if (result.success) {
      res.status(200).json({
        message: 'Backup criado com sucesso',
        backup: {
          name: result.backupName,
          path: result.backupPath,
          type: type
        }
      });
    } else {
      res.status(500).json({
        message: 'Erro ao criar backup',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Listar backups
router.get('/list', auth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    
    const backups = await backupManager.listBackups(type);
    
    res.status(200).json({
      message: 'Backups listados com sucesso',
      backups: backups,
      total: backups.length
    });
  } catch (error) {
    console.error('Erro ao listar backups:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Restaurar backup
router.post('/restore/:backupName', auth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { backupName } = req.params;
    const { type = 'manual' } = req.body;
    
    const result = await backupManager.restoreBackup(backupName, type);
    
    if (result.success) {
      res.status(200).json({
        message: 'Backup restaurado com sucesso',
        backup: backupName
      });
    } else {
      res.status(500).json({
        message: 'Erro ao restaurar backup',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter estatísticas de backup
router.get('/stats', auth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await backupManager.getGeneralBackupStats();
    
    res.status(200).json({
      message: 'Estatísticas de backup obtidas',
      stats: stats
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas de backup:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Limpar backups antigos
router.post('/cleanup', auth, requireAdmin, async (req: Request, res: Response) => {
  try {
    await backupManager.cleanupOldBackups();
    
    res.status(200).json({
      message: 'Limpeza de backups antigos concluída'
    });
  } catch (error) {
    console.error('Erro na limpeza de backups:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Download de backup
router.get('/download/:backupName', auth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { backupName } = req.params;
    const type = parseStringParam(req.query.type) || 'manual';
    
    const backupPath = path.join(backupManager.backupDir, type, backupName);
    
    // Verificar se backup existe
    try {
      await fs.access(backupPath);
    } catch {
      return res.status(404).json({ message: 'Backup não encontrado' });
    }
    
    // Definir headers para download
    res.setHeader('Content-Disposition', `attachment; filename="${backupName}"`);
    res.setHeader('Content-Type', 'application/zip');
    
    // Enviar arquivo
    res.sendFile(path.resolve(backupPath));
  } catch (error) {
    console.error('Erro no download do backup:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Verificar integridade do backup
router.get('/verify/:backupName', auth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { backupName } = req.params;
    const type = parseStringParam(req.query.type) || 'manual';
    
    const backupPath = path.join(backupManager.backupDir, type, backupName);
    
    // Verificar se backup existe
    try {
      await fs.access(backupPath);
    } catch {
      return res.status(404).json({ message: 'Backup não encontrado' });
    }
    
    // Verificar metadados
    const metadataPath = path.join(backupPath, 'backup-metadata.json');
    let metadata = null;
    
    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      metadata = JSON.parse(metadataContent);
    } catch {
      return res.status(400).json({ message: 'Metadados do backup não encontrados' });
    }
    
    // Verificar integridade dos arquivos
    const integrityCheck = await backupManager.verifyBackupIntegrity(backupPath);
    
    res.status(200).json({
      message: 'Verificação de integridade concluída',
      backup: backupName,
      metadata: metadata,
      integrity: integrityCheck
    });
  } catch (error) {
    console.error('Erro na verificação de integridade:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Configurar agendamento de backups
router.post('/schedule', auth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { 
      daily = true, 
      weekly = true, 
      monthly = true,
      dailyTime = '02:00',
      weeklyTime = '03:00',
      monthlyTime = '04:00'
    } = req.body;
    
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
  } catch (error) {
    console.error('Erro ao configurar agendamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter status dos jobs de backup
router.get('/status', auth, requireAdmin, async (req: Request, res: Response) => {
  try {
    // Aqui você implementaria a lógica para verificar o status dos jobs
    // Por enquanto, retornamos informações básicas
    
    const stats = await backupManager.getGeneralBackupStats();
    
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
  } catch (error) {
    console.error('Erro ao obter status dos backups:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;
