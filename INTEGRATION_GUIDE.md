# 🔗 Guia de Integração - Sistema de Armazenamento Brimu

## 📋 Visão Geral

Este guia mostra como integrar e usar o sistema completo de armazenamento do Brimu, que inclui backend, frontend e sistema de backup totalmente alinhados.

## 🏗️ Arquitetura Integrada

```
Brimu/
├── Backend/                    # API Node.js + Express
│   ├── src/
│   │   ├── models/            # Modelos MongoDB (User, File)
│   │   ├── routes/            # Rotas da API (upload, backup)
│   │   ├── middleware/        # Autenticação JWT
│   │   ├── utils/             # FileManager, BackupManager
│   │   └── config/            # Configurações de upload
│   ├── uploads/               # Arquivos enviados
│   │   ├── images/            # Imagens de projetos
│   │   ├── documents/         # Documentos e contratos
│   │   └── temp/              # Arquivos temporários
│   └── storage/               # Sistema de backup
├── Frontend/                   # React + Tailwind CSS
│   ├── src/
│   │   ├── components/        # FileUpload, FileManager, BackupManager
│   │   ├── pages/             # StorageDemo
│   │   └── config/            # Configurações de upload
└── storage/                    # Armazenamento centralizado
    ├── shared/                # Arquivos compartilhados
    └── backups/               # Backups automáticos
```

## 🚀 Como Executar o Sistema Completo

### 1. Backend (Node.js + Express + MongoDB)

```bash
cd Backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env
# Editar o arquivo .env com suas configurações

# Executar servidor
npm run dev
```

**Servidor estará disponível em:** `http://localhost:5000`

### 2. Frontend (React + Tailwind)

```bash
cd Frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env
# Editar o arquivo .env com suas configurações

# Executar aplicação
npm start
```

**Aplicação estará disponível em:** `http://localhost:3000`

### 3. Banco de Dados (MongoDB)

```bash
# Instalar MongoDB localmente ou usar MongoDB Atlas
# Configurar MONGODB_URI no arquivo .env do backend
```

## 📡 API Endpoints Disponíveis

### Upload de Arquivos
- `POST /api/upload/image` - Upload de imagem única
- `POST /api/upload/images` - Upload de múltiplas imagens
- `POST /api/upload/document` - Upload de documento único
- `POST /api/upload/documents` - Upload de múltiplos documentos

### Gerenciamento de Arquivos
- `GET /api/upload/search` - Buscar arquivos com filtros
- `GET /api/upload/file/:id` - Obter arquivo por ID
- `PUT /api/upload/file/:id` - Atualizar metadados
- `GET /api/upload/download/:id` - Download de arquivo
- `DELETE /api/upload/file/:filename` - Deletar arquivo
- `GET /api/upload/stats` - Estatísticas de arquivos

### Sistema de Backup
- `POST /api/backup/create` - Criar backup manual
- `GET /api/backup/list` - Listar backups
- `POST /api/backup/restore/:backupName` - Restaurar backup
- `GET /api/backup/stats` - Estatísticas de backup
- `POST /api/backup/cleanup` - Limpar backups antigos
- `GET /api/backup/download/:backupName` - Download de backup

## 🎯 Componentes React Disponíveis

### 1. FileUpload
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

### 2. FileManager
```jsx
import FileManager from './components/FileManager';

<FileManager
  onFileSelect={handleFileSelect}
  onFileEdit={handleFileEdit}
  onFileDelete={handleFileDelete}
/>
```

### 3. BackupManager
```jsx
import BackupManager from './components/BackupManager';

<BackupManager />
```

### 4. StorageDemo (Página Completa)
```jsx
import StorageDemo from './pages/StorageDemo';

// Página completa com todas as funcionalidades
<StorageDemo />
```

## 🔧 Configurações

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/brimu
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Brimu
REACT_APP_MAX_FILE_SIZE=10485760
```

## 🔒 Sistema de Autenticação

### 1. Login (Exemplo)
```javascript
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
};
```

### 2. Usar Token nas Requisições
```javascript
const token = localStorage.getItem('token');
const response = await fetch('/api/upload/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## 📊 Funcionalidades Principais

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

### 💾 Sistema de Backup
- **Backup automático** diário, semanal e mensal
- **Compressão** de backups
- **Limpeza automática** de backups antigos
- **Restauração** de backups
- **Download** de backups

## 🎨 Interface do Usuário

### Características
- **Design responsivo** com Tailwind CSS
- **Interface intuitiva** com drag & drop
- **Feedback visual** em tempo real
- **Navegação por tabs** organizada
- **Componentes reutilizáveis**

### Temas
- **Cores**: Verde e marrom (tema arbóreo)
- **Ícones**: Feather Icons
- **Tipografia**: Sistema nativo
- **Layout**: Grid responsivo

## 🚨 Troubleshooting

### Problemas Comuns

#### Backend não inicia
```bash
# Verificar se a porta 5000 está livre
netstat -an | findstr :5000

# Verificar logs de erro
npm run dev
```

#### Frontend não conecta com API
```bash
# Verificar se REACT_APP_API_URL está correto
# Verificar se CORS está configurado no backend
# Verificar se o token JWT está sendo enviado
```

#### Upload falha
```bash
# Verificar permissões de pasta uploads/
# Verificar espaço em disco
# Verificar logs do servidor
```

#### Backup não funciona
```bash
# Verificar se node-cron está instalado
# Verificar permissões de escrita em storage/
# Verificar logs de backup
```

## 📈 Próximos Passos

### Funcionalidades Planejadas
- [ ] **CDN Integration** - Distribuição global de arquivos
- [ ] **AI Processing** - Análise automática de imagens
- [ ] **Version Control** - Controle de versão de documentos
- [ ] **Advanced Search** - Busca por conteúdo de arquivos
- [ ] **Batch Operations** - Operações em lote
- [ ] **Webhook Support** - Notificações em tempo real
- [ ] **Multi-tenant** - Suporte a múltiplas empresas
- [ ] **Audit Trail** - Log completo de todas as operações

### Melhorias de Performance
- [ ] **Lazy Loading** - Carregamento sob demanda
- [ ] **Image Optimization** - Otimização automática
- [ ] **Caching** - Sistema de cache inteligente
- [ ] **Compression** - Compressão de arquivos
- [ ] **CDN** - Distribuição de conteúdo

## 📞 Suporte

### Documentação
- [Backend README](Backend/README.md)
- [Storage README](storage/README.md)
- [Sistema de Armazenamento](STORAGE_README.md)

### Contato
- **Email**: suporte@brimu.com
- **Telefone**: (11) 99999-9999
- **Chat**: [brimu.com/support](https://brimu.com/support)

---

**Sistema de Armazenamento Brimu v1.0**  
*Sistema completo e integrado para gestão de arquivos*  
*Desenvolvido com ❤️ pela equipe Brimu*
