# 📁 Sistema de Armazenamento Brimu

Esta pasta contém o sistema centralizado de armazenamento para o projeto Brimu.

## 🗂️ Estrutura de Pastas

```
storage/
├── shared/              # Arquivos compartilhados entre usuários
│   ├── templates/       # Modelos de documentos
│   ├── logos/           # Logos e branding
│   └── common/          # Arquivos comuns
├── backups/             # Backups automáticos e manuais
│   ├── daily/           # Backups diários
│   ├── weekly/          # Backups semanais
│   └── monthly/         # Backups mensais
└── README.md            # Este arquivo
```

## 🔄 Sistema de Backup

### Backup Automático
- **Diário**: Todos os dias às 02:00
- **Semanal**: Todo domingo às 03:00
- **Mensal**: Primeiro domingo do mês às 04:00

### Backup Manual
```bash
# Criar backup manual
npm run backup:create

# Restaurar backup
npm run backup:restore <data>
```

## 📋 Tipos de Arquivo

### ✅ Arquivos Permitidos
- **Imagens**: JPG, PNG, GIF, WebP, SVG
- **Documentos**: PDF, DOC, DOCX, XLS, XLSX, TXT
- **Vídeos**: MP4, AVI, MOV (máx. 100MB)
- **Arquivos**: ZIP, RAR (máx. 50MB)

### ❌ Arquivos Bloqueados
- Executáveis (.exe, .bat, .sh)
- Scripts (.php, .js, .py)
- Arquivos de sistema

## 🚀 Como Usar

### 1. Acesso Direto
```bash
cd storage/shared
# Adicionar arquivos diretamente
```

### 2. Via API
```javascript
// Upload para pasta compartilhada
const formData = new FormData();
formData.append('file', file);
formData.append('destination', 'shared/templates');

await fetch('/api/upload/shared', {
  method: 'POST',
  body: formData
});
```

### 3. Via Frontend
- Use o componente `FileUpload` com destino `shared`
- Selecione a pasta de destino
- Faça upload dos arquivos

## 🔒 Permissões

### 👥 Usuários Comuns
- ✅ Visualizar arquivos públicos
- ✅ Fazer download de templates
- ❌ Modificar arquivos compartilhados
- ❌ Deletar arquivos

### 👨‍💼 Administradores
- ✅ Todas as permissões de usuários
- ✅ Upload de arquivos compartilhados
- ✅ Modificar e deletar arquivos
- ✅ Gerenciar backups

## 📊 Monitoramento

### Espaço em Disco
- **Total**: 100GB
- **Usado**: Monitorado automaticamente
- **Livre**: Alertas quando < 10GB

### Estatísticas
- **Arquivos**: Contagem total
- **Tamanho**: Soma dos tamanhos
- **Última modificação**: Timestamp
- **Downloads**: Contador de acessos

## 🛠️ Manutenção

### Limpeza Automática
- Arquivos temporários: 24h
- Logs antigos: 30 dias
- Backups antigos: 90 dias

### Limpeza Manual
```bash
# Limpar arquivos temporários
npm run storage:cleanup

# Verificar integridade
npm run storage:verify

# Otimizar espaço
npm run storage:optimize
```

## 🚨 Alertas

### Espaço Baixo
- **Aviso**: < 20GB livre
- **Crítico**: < 5GB livre
- **Ação**: Notificação automática

### Backup Falhou
- **Tentativas**: 3x
- **Ação**: Notificação manual
- **Fallback**: Backup incremental

## 📈 Métricas

### Performance
- **Upload**: Tempo médio
- **Download**: Velocidade
- **Processamento**: CPU/RAM

### Qualidade
- **Integridade**: Checksum
- **Redundância**: Cópias
- **Disponibilidade**: Uptime

---

**Sistema de Armazenamento Brimu v1.0**
