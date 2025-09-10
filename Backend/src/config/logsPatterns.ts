import { LogPattern } from '../services/advancedLoggingService';

/**
 * Padrões de monitoramento predefinidos para o sistema de logs
 */
export const defaultLogPatterns: LogPattern[] = [
  {
    id: 'critical-errors',
    name: 'Erros Críticos do Sistema',
    pattern: /error|exception|crash|fail|fatal/i,
    level: 'error',
    description: 'Detectar erros críticos que requerem atenção imediata',
    action: 'alert',
    threshold: 1,
    timeWindow: 300000 // 5 minutos
  },
  {
    id: 'authentication-failures',
    name: 'Falhas de Autenticação',
    pattern: /authentication failed|invalid credentials|login error|unauthorized/i,
    level: 'warn',
    description: 'Monitorar tentativas de login falhadas para detectar ataques',
    action: 'alert',
    threshold: 5,
    timeWindow: 600000 // 10 minutos
  },
  {
    id: 'performance-issues',
    name: 'Problemas de Performance',
    pattern: /slow query|timeout|performance|high memory|cpu spike/i,
    level: 'warn',
    description: 'Detectar problemas de performance do sistema',
    action: 'count',
    threshold: 3,
    timeWindow: 900000 // 15 minutos
  },
  {
    id: 'database-errors',
    name: 'Erros de Banco de Dados',
    pattern: /mongodb|database|connection pool|query error|duplicate key/i,
    level: 'error',
    description: 'Monitorar problemas relacionados ao banco de dados',
    action: 'alert',
    threshold: 2,
    timeWindow: 300000 // 5 minutos
  },
  {
    id: 'security-events',
    name: 'Eventos de Segurança',
    pattern: /blocked ip|malicious|csrf|xss|injection|scanning/i,
    level: 'warn',
    description: 'Detectar atividades suspeitas e tentativas de ataque',
    action: 'alert',
    threshold: 1,
    timeWindow: 60000 // 1 minuto
  },
  {
    id: 'api-rate-limits',
    name: 'Rate Limit Atingido',
    pattern: /rate limit|too many requests|429/i,
    level: 'warn',
    description: 'Monitorar quando rate limits são atingidos',
    action: 'count',
    threshold: 10,
    timeWindow: 300000 // 5 minutos
  },
  {
    id: 'cache-misses',
    name: 'Cache Misses Excessivos',
    pattern: /cache miss|cache unavailable|redis/i,
    level: 'info',
    description: 'Monitorar problemas de cache que podem afetar performance',
    action: 'count',
    threshold: 50,
    timeWindow: 600000 // 10 minutos
  },
  {
    id: 'backup-failures',
    name: 'Falhas de Backup',
    pattern: /backup failed|backup error|backup timeout/i,
    level: 'error',
    description: 'Detectar falhas no sistema de backup',
    action: 'alert',
    threshold: 1,
    timeWindow: 86400000 // 24 horas
  },
  {
    id: 'upload-errors',
    name: 'Erros de Upload',
    pattern: /upload failed|file too large|invalid file|multer error/i,
    level: 'warn',
    description: 'Monitorar problemas no sistema de upload',
    action: 'count',
    threshold: 5,
    timeWindow: 300000 // 5 minutos
  },
  {
    id: 'notification-failures',
    name: 'Falhas de Notificação',
    pattern: /notification failed|email error|sms error|webhook timeout/i,
    level: 'warn',
    description: 'Detectar falhas no sistema de notificações',
    action: 'count',
    threshold: 3,
    timeWindow: 600000 // 10 minutos
  }
];

/**
 * Configurações de retenção de logs por nível
 */
export const logRetentionConfig = {
  error: 90 * 24 * 60 * 60 * 1000, // 90 dias
  warn: 60 * 24 * 60 * 60 * 1000,  // 60 dias
  info: 30 * 24 * 60 * 60 * 1000,  // 30 dias
  http: 7 * 24 * 60 * 60 * 1000,   // 7 dias
  verbose: 3 * 24 * 60 * 60 * 1000, // 3 dias
  debug: 1 * 24 * 60 * 60 * 1000,   // 1 dia
  silly: 12 * 60 * 60 * 1000        // 12 horas
};

/**
 * Configurações de alertas por canal
 */
export const alertChannelConfig = {
  error: ['email', 'webhook'],
  warn: ['email'],
  info: [],
  http: [],
  verbose: [],
  debug: [],
  silly: []
};