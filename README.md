# 🌳 Brimu - Sistema de Gestão para Serviços Arbóreos

## 📋 Descrição do Projeto

O **Brimu** é um sistema web completo desenvolvido para empresas de serviços arbóreos, oferecendo uma solução integrada que combina uma landing page atrativa para captação de clientes e um portal interno robusto para gestão de operações.

### 🎯 Funcionalidades Principais

#### Landing Page
- **Design responsivo e moderno** para captar leads
- **Formulários de contato** integrados
- **Portfólio de serviços** com galeria de imagens
- **Depoimentos de clientes** para aumentar credibilidade
- **Informações sobre a empresa** e equipe
- **Orçamentos online** para serviços básicos

#### Portal Interno
- **Painel Administrativo**
  - Gestão de usuários e permissões
  - Dashboard com métricas e KPIs
  - Controle de orçamentos e projetos
  - Gestão de equipe e escalas
  - Relatórios financeiros e operacionais
  
- **Portal do Cliente**
  - Acompanhamento de projetos em tempo real
  - Histórico de serviços contratados
  - Sistema de tickets para suporte
  - Área de documentos e contratos
  - Comunicação direta com a equipe

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca JavaScript para interfaces
- **Tailwind CSS** - Framework CSS utilitário para design responsivo
- **React Router** - Roteamento da aplicação
- **Axios** - Cliente HTTP para comunicação com API
- **React Hook Form** - Gerenciamento de formulários
- **React Query** - Gerenciamento de estado e cache
- **Framer Motion** - Animações e transições

### Backend
- **Node.js** - Runtime JavaScript no servidor
- **Express.js** - Framework web para Node.js
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação e autorização
- **Bcrypt** - Criptografia de senhas
- **Multer** - Upload de arquivos
- **Nodemailer** - Envio de emails

### Ferramentas de Desenvolvimento
- **Git** - Controle de versão
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Nodemon** - Reinicialização automática do servidor
- **Concurrently** - Execução simultânea de comandos

## 🚀 Instalação e Configuração

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **MongoDB** (local ou Atlas)
- **Git**

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/brimu.git
cd brimu
```

### 2. Instalação das Dependências

#### Backend
```bash
cd Backend
npm install
```

#### Frontend
```bash
cd Frontend
npm install
```

### 3. Configuração das Variáveis de Ambiente

#### Backend (.env)
```bash
cd Backend
cp .env.example .env
```

Configure as seguintes variáveis no arquivo `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/brimu
JWT_SECRET=sua_chave_secreta_aqui
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
```

#### Frontend (.env)
```bash
cd Frontend
cp .env.example .env
```

Configure as seguintes variáveis no arquivo `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Brimu
```

## 🏃‍♂️ Como Executar

### Executando o Backend

```bash
cd Backend

# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start
```

O backend estará disponível em: `http://localhost:5000`

### Executando o Frontend

```bash
cd Frontend

# Desenvolvimento
npm start

# Build para produção
npm run build
```

O frontend estará disponível em: `http://localhost:3000`

### Executando Ambos Simultaneamente

Na raiz do projeto:
```bash
# Instalar dependências globais (uma vez)
npm install -g concurrently

# Executar ambos os serviços
npm run dev
```

## 📁 Estrutura do Projeto

```
Brimu/
├── Backend/                 # Servidor Node.js + Express
│   ├── src/
│   │   ├── controllers/    # Controladores da API
│   │   ├── models/         # Modelos do MongoDB
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middlewares customizados
│   │   ├── utils/          # Utilitários e helpers
│   │   └── app.js          # Configuração principal
│   ├── package.json
│   └── .env
├── Frontend/                # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Serviços de API
│   │   ├── utils/          # Utilitários
│   │   └── App.js          # Componente principal
│   ├── package.json
│   └── .env
└── README.md
```

## 🔧 Scripts Disponíveis

### Backend
```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest"
  }
}
```

### Frontend
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

## 🌐 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Perfil do usuário

### Usuários
- `GET /api/users` - Listar usuários (admin)
- `GET /api/users/:id` - Obter usuário específico
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário (admin)

### Projetos
- `GET /api/projects` - Listar projetos
- `POST /api/projects` - Criar projeto
- `GET /api/projects/:id` - Obter projeto específico
- `PUT /api/projects/:id` - Atualizar projeto
- `DELETE /api/projects/:id` - Deletar projeto

### Orçamentos
- `GET /api/quotes` - Listar orçamentos
- `POST /api/quotes` - Criar orçamento
- `GET /api/quotes/:id` - Obter orçamento específico
- `PUT /api/quotes/:id` - Atualizar orçamento

## 🎨 Personalização

### Cores do Tema
O sistema utiliza um esquema de cores baseado em tons de verde e marrom, adequados para uma empresa de serviços arbóreos. As cores podem ser personalizadas no arquivo de configuração do Tailwind.

### Logo e Branding
Substitua os arquivos de logo na pasta `Frontend/src/assets/` para personalizar a identidade visual da sua empresa.

## 📱 Responsividade

O sistema é totalmente responsivo e funciona perfeitamente em:
- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

## 🔒 Segurança

- **JWT** para autenticação
- **Bcrypt** para hash de senhas
- **Middleware de autorização** para rotas protegidas
- **Validação de entrada** em todos os endpoints
- **Rate limiting** para prevenir ataques
- **CORS** configurado adequadamente

## 🚀 Deploy

### Backend (Heroku, Railway, Render)
```bash
cd Backend
npm run build
```

### Frontend (Vercel, Netlify, GitHub Pages)
```bash
cd Frontend
npm run build
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o projeto:
- **Email**: suporte@brimu.com
- **Telefone**: (11) 99999-9999
- **Documentação**: [docs.brimu.com](https://docs.brimu.com)

## 🙏 Agradecimentos

- Equipe de desenvolvimento
- Comunidade React e Node.js
- Contribuidores open source
- Clientes e usuários beta

---

**Desenvolvido com ❤️ pela equipe Brimu**

*Sistema completo para empresas de serviços arbóreos*
