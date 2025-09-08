# Sistema Brimu - Landing Page com Sistema de Gestão

## 🚀 Início Rápido

### 1. Executar o Sistema Completo
```bash
# Execute este arquivo para iniciar tudo automaticamente
start-brimu-complete.bat
```

### 2. Acessar o Sistema
- **Landing Page**: http://localhost:3002
- **Portal de Acesso**: http://localhost:3002/auth
- **Backend API**: http://localhost:5000

### 3. Credenciais de Acesso
- **Admin**: admin@brimu.com / admin123
- **Usuário**: teste@brimu.com / teste123

## 📋 Pré-requisitos

### MongoDB
- MongoDB deve estar instalado
- Se não estiver instalado, execute: `install-mongodb-complete.bat`

### Node.js
- Node.js 18+ instalado
- npm instalado

## 🛠️ Estrutura do Sistema

### Frontend (React + Vite)
- **Porta**: 3002
- **Tecnologias**: React, Tailwind CSS, React Router
- **Componentes**: Landing Page, Sistema de Autenticação, Dashboard

### Backend (Node.js + Express)
- **Porta**: 5000
- **Tecnologias**: Express, MongoDB, JWT
- **Funcionalidades**: API REST, Autenticação, Upload de arquivos

### Banco de Dados
- **MongoDB**: Porta 27017
- **Banco**: brimu

## 🎯 Funcionalidades

### Landing Page
- ✅ Design responsivo e moderno
- ✅ Seções: Hero, Serviços, Sobre, Contato
- ✅ Formulário de contato
- ✅ Integração com WhatsApp
- ✅ Navegação suave

### Sistema de Gestão
- ✅ Autenticação (Login/Registro)
- ✅ Dashboard para Admin e Cliente
- ✅ Gestão de usuários
- ✅ Gestão de ordens de serviço
- ✅ Gestão de orçamentos
- ✅ Gestão de pagamentos
- ✅ Upload de arquivos

## 🔧 Scripts Disponíveis

### Scripts Principais
- `start-brimu-complete.bat` - Inicia o sistema completo
- `start-system.bat` - Inicia apenas frontend e backend
- `test-system.bat` - Testa se o sistema está funcionando
- `fix-system.bat` - Corrige problemas do sistema

### Scripts de Desenvolvimento
```bash
# Backend
cd Backend
npm run dev          # Desenvolvimento
npm start           # Produção
npm run create-admin # Criar usuário admin

# Frontend
cd Frontend
npm run dev         # Desenvolvimento
npm run build       # Build para produção
npm run preview     # Preview da build
```

## 🐛 Solução de Problemas

### MongoDB não inicia
```bash
# Verificar se MongoDB está instalado
mongod --version

# Se não estiver, instalar
install-mongodb-complete.bat
```

### Porta já em uso
```bash
# Parar processos
taskkill /F /IM node.exe
taskkill /F /IM mongod.exe
```

### Dependências não instaladas
```bash
# Backend
cd Backend && npm install

# Frontend
cd Frontend && npm install
```

### Erro de CORS
- Verificar se o CORS_ORIGIN está configurado para http://localhost:3002
- Verificar se o backend está rodando na porta 5000

## 📁 Estrutura de Arquivos

```
Brimu/
├── Backend/                 # API Node.js
│   ├── src/
│   │   ├── models/         # Modelos MongoDB
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middlewares
│   │   └── config/         # Configurações
│   ├── scripts/            # Scripts utilitários
│   └── .env               # Variáveis de ambiente
├── Frontend/               # React App
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/         # Páginas
│   │   ├── services/      # Serviços API
│   │   └── layouts/       # Layouts
│   └── .env               # Variáveis de ambiente
├── storage/               # Armazenamento de arquivos
└── scripts/              # Scripts de inicialização
```

## 🔐 Segurança

### JWT
- Tokens com expiração de 7 dias
- Chave secreta configurável
- Middleware de autenticação

### CORS
- Configurado para desenvolvimento
- Origin permitido: http://localhost:3002

### Rate Limiting
- 100 requisições por 15 minutos por IP
- Configurável via variáveis de ambiente

## 📊 Monitoramento

### Logs
- Logs do backend em `Backend/logs/app.log`
- Logs de desenvolvimento no console

### Health Check
- Endpoint: http://localhost:5000/api/health
- Retorna status do sistema

## 🚀 Deploy

### Produção
1. Configurar variáveis de ambiente
2. Build do frontend: `npm run build`
3. Iniciar backend: `npm start`
4. Configurar proxy reverso (nginx/apache)

### Docker (Futuro)
- Dockerfile para backend
- Dockerfile para frontend
- docker-compose.yml

## 📞 Suporte

### Contato
- WhatsApp: (11) 95033-6105
- Email: contato@brimu.com.br

### Documentação
- API: http://localhost:5000/api/health
- Swagger: (Em desenvolvimento)

## 📝 Changelog

### v1.0.0
- ✅ Landing page responsiva
- ✅ Sistema de autenticação
- ✅ Dashboard admin/cliente
- ✅ CRUD completo
- ✅ Upload de arquivos
- ✅ Integração WhatsApp

---

**Sistema Brimu** - Serviços de Arborização e Paisagismo
