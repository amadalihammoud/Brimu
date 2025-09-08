# 🚀 Guia de Instalação Completo - Sistema Brimu

## 📋 Pré-requisitos

### **Software Necessário:**
- **Node.js** (versão 18 ou superior) - [Download](https://nodejs.org/)
- **MongoDB** (local ou Atlas) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)

### **Verificar Instalações:**
```bash
node --version    # Deve ser v18+
npm --version     # Deve ser v8+
mongod --version  # MongoDB instalado
```

## 🛠️ Instalação Passo a Passo

### **1. Configurar MongoDB**

#### **Opção A: MongoDB Local**
```bash
# Windows (usando Chocolatey)
choco install mongodb

# Ou baixar e instalar manualmente
# https://www.mongodb.com/try/download/community

# Iniciar MongoDB
mongod
```

#### **Opção B: MongoDB Atlas (Recomendado)**
1. Acesse [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crie uma conta gratuita
3. Crie um cluster
4. Obtenha a string de conexão

### **2. Configurar Backend**

```bash
# Navegar para o diretório do backend
cd Backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
copy env.example .env
```

**Editar arquivo `.env`:**
```env
# Configurações do Servidor
PORT=5000
NODE_ENV=development

# Banco de Dados MongoDB
MONGODB_URI=mongodb://localhost:27017/brimu
# OU para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/brimu

# JWT (JSON Web Token)
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_123456789
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### **3. Configurar Frontend**

```bash
# Navegar para o diretório do frontend
cd Frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
copy env.example .env
```

**Editar arquivo `.env`:**
```env
# Configurações do Frontend
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Brimu
REACT_APP_VERSION=1.0.0
```

### **4. Criar Usuários Iniciais**

```bash
# No diretório Backend
npm run create-admin
```

**Usuários criados:**
- **Admin**: admin@brimu.com / admin123
- **Usuário**: teste@brimu.com / teste123

### **5. Executar o Sistema**

#### **Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```

#### **Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

## 🌐 Acessar o Sistema

### **URLs Disponíveis:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

### **Credenciais de Teste:**
- **Administrador**: admin@brimu.com / admin123
- **Usuário**: teste@brimu.com / teste123

## 🔧 Configurações Avançadas

### **1. Configurar Email (Opcional)**

No arquivo `.env` do backend:
```env
# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app_do_gmail
```

### **2. Configurar Backup Automático**

O sistema já está configurado para:
- **Backup diário**: 02:00
- **Backup semanal**: Domingo 03:00
- **Backup mensal**: Primeiro domingo 04:00

### **3. Configurar Upload de Arquivos**

Limites padrão:
- **Imagens**: 5MB por arquivo, até 10 arquivos
- **Documentos**: 10MB por arquivo, até 5 arquivos

## 🧪 Testar o Sistema

### **1. Teste de Conectividade**
```bash
# Testar backend
curl http://localhost:5000/api/health

# Resposta esperada:
# {"message":"Brimu Backend funcionando!","timestamp":"...","environment":"development"}
```

### **2. Teste de Autenticação**
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@brimu.com","password":"admin123"}'
```

### **3. Teste de Upload**
1. Acesse http://localhost:3000
2. Faça login com as credenciais
3. Clique em "Sistema de Arquivos"
4. Teste o upload de uma imagem

## 🚨 Troubleshooting

### **Problemas Comuns:**

#### **Backend não inicia:**
```bash
# Verificar se a porta 5000 está livre
netstat -an | findstr :5000

# Verificar logs de erro
npm run dev
```

#### **MongoDB não conecta:**
```bash
# Verificar se MongoDB está rodando
mongod --version

# Testar conexão
mongo mongodb://localhost:27017/brimu
```

#### **Frontend não carrega:**
```bash
# Verificar se a porta 3000 está livre
netstat -an | findstr :3000

# Limpar cache
npm run build
```

#### **Upload não funciona:**
```bash
# Verificar permissões da pasta uploads
ls -la Backend/uploads/

# Verificar espaço em disco
df -h
```

### **Logs de Debug:**

#### **Backend:**
```bash
# Executar com logs detalhados
DEBUG=* npm run dev
```

#### **Frontend:**
```bash
# Executar com logs detalhados
REACT_APP_DEBUG=true npm run dev
```

## 📊 Monitoramento

### **1. Verificar Status do Sistema**
- **Backend**: http://localhost:5000/api/health
- **Frontend**: http://localhost:3000

### **2. Verificar Logs**
```bash
# Backend logs
tail -f Backend/logs/app.log

# MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

### **3. Verificar Espaço em Disco**
```bash
# Verificar espaço usado
du -sh Backend/uploads/
du -sh Backend/storage/
```

## 🔒 Segurança

### **1. Configurações de Produção**
```env
# Backend .env para produção
NODE_ENV=production
JWT_SECRET=chave_super_secreta_para_producao
CORS_ORIGIN=https://seudominio.com
```

### **2. Firewall**
```bash
# Permitir apenas portas necessárias
# 3000 (Frontend)
# 5000 (Backend)
# 27017 (MongoDB - apenas local)
```

### **3. Backup de Segurança**
```bash
# Backup manual
npm run backup:create

# Restaurar backup
npm run backup:restore backup-name
```

## 📈 Próximos Passos

### **1. Personalização**
- Alterar logo e cores
- Configurar textos da empresa
- Adicionar funcionalidades específicas

### **2. Deploy**
- Configurar servidor de produção
- Configurar domínio
- Configurar SSL/HTTPS

### **3. Integração**
- Integrar com sistemas existentes
- Configurar webhooks
- Adicionar APIs externas

## 📞 Suporte

### **Documentação:**
- [Backend README](Backend/README.md)
- [Frontend README](Frontend/README.md)
- [Sistema de Armazenamento](STORAGE_README.md)
- [Guia de Integração](INTEGRATION_GUIDE.md)

### **Contato:**
- **Email**: suporte@brimu.com
- **Telefone**: (11) 99999-9999
- **Chat**: [brimu.com/support](https://brimu.com/support)

---

**Sistema Brimu v1.0**  
*Sistema completo de gestão para serviços arbóreos*  
*Desenvolvido com ❤️ pela equipe Brimu*
