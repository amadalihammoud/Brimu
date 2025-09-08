# 🗂️ Sistema de Armazenamento Brimu

## 📋 Visão Geral

O sistema de armazenamento do Brimu foi criado para gerenciar todos os arquivos do sistema de forma organizada, segura e escalável. Ele suporta uploads de imagens, documentos e outros tipos de arquivo, com validação, processamento e organização automática.

## 🏗️ Arquitetura

```
Brimu/
├── Backend/                    # Servidor Node.js
│   ├── uploads/               # Arquivos enviados pelos usuários
│   │   ├── images/            # Imagens de projetos
│   │   ├── documents/         # Documentos e contratos
│   │   └── temp/              # Arquivos temporários
│   ├── public/                # Arquivos estáticos públicos
│   │   └── assets/            # Assets compartilhados
│   └── src/
│       ├── config/            # Configurações de upload
│       ├── routes/            # Rotas da API
│       ├── middleware/        # Autenticação e validação
│       └── utils/             # Gerenciador de arquivos
├── Frontend/                   # Aplicação React
│   └── src/
│       ├── components/        # Componente de upload
│       └── config/            # Configurações do frontend
└── storage/                    # Armazenamento centralizado
    ├── shared/                # Arquivos compartilhados
    └── backups/               # Sistema de backup
```

## 🚀 Funcionalidades Principais

### ✅ Upload de Arquivos
- **Drag & Drop** com interface intuitiva
- **Validação automática** de tipo e tamanho
- **Upload múltiplo** de arquivos
- **Progress bar** em tempo real
- **Retry automático** em caso de falha

### 🖼️ Processamento de Imagens
- **Redimensionamento automático** para otimização
- **Criação de thumbnails** para galerias
- **Compressão inteligente** mantendo qualidade
- **Suporte a múltiplos formatos** (JPG, PNG, GIF, WebP)

### 📄 Gerenciamento de Documentos
- **Validação de tipos** (PDF, DOC, XLS, etc.)
- **Organização por categoria** automática
- **Sistema de versionamento** para contratos
- **Busca e filtros** avançados

### 🔒 Segurança e Controle
- **Autenticação JWT** obrigatória
- **Validação de tipos** de arquivo
- **Limite de tamanho** configurável
- **Rate limiting** por IP
- **Sanitização** de nomes de arquivo

## 🛠️ Como Usar

### 1. Backend (Node.js)

#### Instalação
```bash
cd Backend
npm install
```

#### Configuração
```bash
cp env.example .env
# Editar variáveis de ambiente
```

#### Execução
```bash
npm run dev  # Desenvolvimento
npm start    # Produção
```

### 2. Frontend (React)

#### Componente de Upload
```jsx
import FileUpload from './components/FileUpload';

<FileUpload
  onUpload={handleUpload}
  multiple={true}
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  maxFiles={10}
  destination="images"
/>
```

#### Configuração
```javascript
import { UPLOAD_CONFIG } from './config/upload';

// Usar configurações
const maxSize = UPLOAD_CONFIG.LIMITS.IMAGE.MAX_SIZE;
```

## 📡 API Endpoints

### Upload
- `POST /api/upload/image` - Imagem única
- `POST /api/upload/images` - Múltiplas imagens
- `POST /api/upload/document` - Documento único
- `POST /api/upload/documents` - Múltiplos documentos

### Gerenciamento
- `GET /api/upload/files/:type` - Listar arquivos
- `DELETE /api/upload/file/:filename` - Deletar arquivo
- `POST /api/upload/resize-image` - Redimensionar
- `POST /api/upload/thumbnail` - Criar thumbnail

### Monitoramento
- `GET /api/upload/disk-space` - Espaço em disco
- `POST /api/upload/cleanup-temp` - Limpeza automática

## 🔧 Configurações

### Limites de Arquivo
```javascript
// Imagens
MAX_SIZE: 5MB
MAX_FILES: 10
TYPES: JPG, PNG, GIF, WebP

// Documentos
MAX_SIZE: 10MB
MAX_FILES: 5
TYPES: PDF, DOC, DOCX, XLS, XLSX, TXT
```

### Processamento de Imagem
```javascript
THUMBNAIL_SIZE: 150px
PREVIEW_SIZE: 800px
QUALITY: 80%
FORMAT: JPEG
```

## 📊 Monitoramento

### Métricas Coletadas
- **Uploads**: Contagem e tamanho
- **Downloads**: Frequência de acesso
- **Espaço**: Uso de disco em tempo real
- **Performance**: Tempo de resposta da API
- **Erros**: Falhas e tentativas de retry

### Alertas Automáticos
- **Espaço baixo**: < 20GB livre
- **Upload falhou**: 3 tentativas sem sucesso
- **Backup falhou**: Notificação imediata
- **Taxa de erro**: > 5% de falhas

## 🚨 Troubleshooting

### Problemas Comuns

#### Upload Falha
```bash
# Verificar logs
tail -f Backend/logs/app.log

# Verificar espaço em disco
df -h

# Verificar permissões
ls -la Backend/uploads/
```

#### Imagem Não Processa
```bash
# Verificar dependências
npm list sharp

# Verificar memória
free -h

# Reiniciar serviço
npm run dev
```

#### Arquivo Não Aparece
```bash
# Verificar rota estática
curl http://localhost:5000/uploads/images/

# Verificar permissões
chmod 755 Backend/uploads/

# Verificar CORS
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     http://localhost:5000/api/upload/image
```

## 🔄 Manutenção

### Tarefas Diárias
- Limpeza de arquivos temporários
- Verificação de espaço em disco
- Monitoramento de logs de erro

### Tarefas Semanais
- Backup incremental dos uploads
- Análise de métricas de performance
- Verificação de integridade de arquivos

### Tarefas Mensais
- Backup completo do sistema
- Limpeza de logs antigos
- Otimização de banco de dados
- Atualização de dependências

## 🎯 Próximas Funcionalidades

- [ ] **CDN Integration** - Distribuição global de arquivos
- [ ] **AI Processing** - Análise automática de imagens
- [ ] **Version Control** - Controle de versão de documentos
- [ ] **Advanced Search** - Busca por conteúdo de arquivos
- [ ] **Batch Operations** - Operações em lote
- [ ] **Webhook Support** - Notificações em tempo real
- [ ] **Multi-tenant** - Suporte a múltiplas empresas
- [ ] **Audit Trail** - Log completo de todas as operações

## 📞 Suporte

### Documentação
- [Backend README](Backend/README.md)
- [Storage README](storage/README.md)
- [API Documentation](Backend/README.md#endpoints-da-api)

### Contato
- **Email**: suporte@brimu.com
- **Telefone**: (11) 99999-9999
- **Chat**: [brimu.com/support](https://brimu.com/support)

---

**Sistema de Armazenamento Brimu v1.0**  
*Desenvolvido com ❤️ pela equipe Brimu*
