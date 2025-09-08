# 🚀 Brimu Backend

Backend do sistema Brimu - Sistema de Gestão para Serviços Arbóreos

## 📁 Estrutura de Armazenamento

```
Backend/
├── uploads/                 # Arquivos enviados pelos usuários
│   ├── images/             # Imagens de projetos e portfólio
│   ├── documents/          # Documentos, contratos, orçamentos
│   └── temp/               # Arquivos temporários
├── public/                  # Arquivos estáticos públicos
│   └── assets/             # Assets compartilhados
├── storage/                 # Armazenamento centralizado
│   ├── shared/             # Arquivos compartilhados
│   └── backups/            # Backups automáticos
└── src/
    ├── config/             # Configurações (upload, database)
    ├── routes/             # Rotas da API
    ├── middleware/         # Middlewares customizados
    └── utils/              # Utilitários (FileManager)
```

## 🛠️ Funcionalidades de Upload

### ✅ Tipos de Arquivo Suportados

#### Imagens
- **Formatos**: JPEG, JPG, PNG, GIF, WebP
- **Tamanho máximo**: 5MB por arquivo
- **Quantidade**: Até 10 imagens por upload

#### Documentos
- **Formatos**: PDF, DOC, DOCX, XLS, XLSX, TXT
- **Tamanho máximo**: 10MB por arquivo
- **Quantidade**: Até 5 documentos por upload

### 🔧 Endpoints da API

#### Upload de Arquivos
- `POST /api/upload/image` - Upload de imagem única
- `POST /api/upload/images` - Upload de múltiplas imagens
- `POST /api/upload/document` - Upload de documento único
- `POST /api/upload/documents` - Upload de múltiplos documentos

#### Gerenciamento de Arquivos
- `GET /api/upload/files/:type` - Listar arquivos por tipo
- `DELETE /api/upload/file/:filename` - Deletar arquivo
- `POST /api/upload/resize-image` - Redimensionar imagem
- `POST /api/upload/thumbnail` - Criar thumbnail
- `POST /api/upload/cleanup-temp` - Limpar arquivos temporários
- `GET /api/upload/disk-space` - Verificar espaço em disco

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
cd Backend
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
cp env.example .env
# Editar o arquivo .env com suas configurações
```

### 3. Executar o Servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📋 Dependências Principais

- **Express.js** - Framework web
- **Multer** - Upload de arquivos
- **Sharp** - Processamento de imagens
- **JWT** - Autenticação
- **Helmet** - Segurança
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Proteção contra ataques

## 🔒 Segurança

- ✅ Validação de tipos de arquivo
- ✅ Limite de tamanho de arquivo
- ✅ Rate limiting por IP
- ✅ Autenticação JWT obrigatória
- ✅ Headers de segurança com Helmet
- ✅ CORS configurado adequadamente

## 📱 Exemplo de Uso

### Upload de Imagem
```javascript
const formData = new FormData();
formData.append('image', file);

const response = await fetch('/api/upload/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Listar Imagens
```javascript
const response = await fetch('/api/upload/files/images', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🎯 Próximos Passos

- [ ] Integração com MongoDB para metadados
- [ ] Sistema de backup automático
- [ ] Compressão de imagens
- [ ] CDN para arquivos estáticos
- [ ] Logs detalhados de upload
- [ ] Sistema de permissões por usuário

---

**Desenvolvido com ❤️ pela equipe Brimu**
