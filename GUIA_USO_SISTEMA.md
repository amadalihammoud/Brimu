# 🌳 Guia de Uso do Sistema Brimu

## 🚀 **SISTEMA FUNCIONANDO PERFEITAMENTE!**

### ✅ **Status Atual:**
- **Backend**: ✅ Rodando na porta 5000
- **Frontend**: ✅ Rodando na porta 3000
- **Portal de Acesso**: ✅ Integrado na landing page

## 🌐 **Como Acessar o Sistema:**

### **1. Acesse a Landing Page**
- **URL**: http://localhost:3000
- **Página inicial** com informações sobre a empresa Brimu

### **2. Clique no Botão "Portal de Acesso"**
- **Localização**: Seção Hero (parte principal da página)
- **Botão verde** com ícone de árvore 🌳
- **Ao lado do botão** "Entre em Contato" (WhatsApp)

### **3. Faça Login no Portal**
- **Tela de login** será exibida
- **Credenciais de teste** disponíveis:

#### **👑 Administrador:**
- **Email**: admin@brimu.com
- **Senha**: admin123
- **Permissões**: Total (upload, download, delete, gerenciar usuários)

#### **👤 Usuário:**
- **Email**: teste@brimu.com
- **Senha**: teste123
- **Permissões**: Básicas (upload, download)

### **4. Acesse o Sistema de Arquivos**
- **Após login**, você será redirecionado para o sistema
- **Interface completa** de gerenciamento de arquivos
- **Funcionalidades disponíveis**:
  - Upload de imagens e documentos
  - Visualização de arquivos
  - Download de arquivos
  - Gerenciamento de usuários (admin)
  - Sistema de backup

## 🎯 **Fluxo de Navegação:**

```
Landing Page (http://localhost:3000)
    ↓
[Botão "Portal de Acesso"]
    ↓
Tela de Login/Registro
    ↓
Sistema de Arquivos
    ↓
[Botão "Voltar ao site"] → Landing Page
```

## 🔧 **Funcionalidades Disponíveis:**

### **📁 Upload de Arquivos:**
- **Imagens**: JPEG, PNG, GIF, WebP (até 5MB)
- **Documentos**: PDF, DOC, DOCX, XLS, XLSX, TXT (até 10MB)
- **Drag & Drop**: Interface intuitiva
- **Múltiplos arquivos**: Upload em lote

### **👥 Gestão de Usuários (Admin):**
- **Criar usuários** com diferentes roles
- **Controle de permissões** granular
- **Visualizar estatísticas** de upload

### **💾 Sistema de Backup:**
- **Backup automático** diário, semanal e mensal
- **Backup manual** sob demanda
- **Restauração** de backups

### **📊 Relatórios:**
- **Estatísticas** de upload
- **Uso de espaço** em disco
- **Atividade** dos usuários

## 🎨 **Interface do Sistema:**

### **Landing Page:**
- **Design moderno** com gradientes verdes
- **Responsivo** para mobile e desktop
- **Animações suaves** e profissionais
- **Botão destacado** "Portal de Acesso"

### **Portal de Login:**
- **Interface limpa** e intuitiva
- **Recursos destacados** do sistema
- **Credenciais de teste** visíveis
- **Botão "Voltar ao site"** para retornar

### **Sistema de Arquivos:**
- **Dashboard completo** com estatísticas
- **Upload drag & drop** com preview
- **Lista de arquivos** com filtros
- **Ações rápidas** (visualizar, download, deletar)

## 🔒 **Segurança:**

### **Autenticação:**
- **JWT Tokens** para sessões seguras
- **Controle de acesso** por roles
- **Validação** de dados de entrada

### **Upload de Arquivos:**
- **Validação** de tipos de arquivo
- **Limite de tamanho** configurável
- **Sanitização** de nomes de arquivo

### **API:**
- **Rate limiting** para prevenir abuso
- **CORS** configurado
- **Helmet** para headers de segurança

## 📱 **Responsividade:**

- **Mobile First**: Otimizado para dispositivos móveis
- **Tablet**: Interface adaptada para tablets
- **Desktop**: Experiência completa em telas grandes
- **Touch Friendly**: Botões e elementos otimizados para toque

## 🚀 **Próximos Passos:**

### **Para Produção:**
1. **Instalar MongoDB** (local ou Atlas)
2. **Configurar .env** com MONGODB_URI real
3. **Executar `npm run create-admin`** para criar usuários reais
4. **Substituir `app-test.js`** por `app.js` com MongoDB

### **Para Personalização:**
1. **Alterar logo e cores** no frontend
2. **Configurar textos** da empresa
3. **Adicionar funcionalidades** específicas
4. **Integrar com sistemas** existentes

## 🆘 **Suporte e Troubleshooting:**

### **Problemas Comuns:**

#### **Backend não inicia:**
```bash
# Verificar se a porta 5000 está livre
netstat -an | findstr :5000

# Iniciar manualmente
cd Backend
node src/app-test.js
```

#### **Frontend não carrega:**
```bash
# Verificar se a porta 3000 está livre
netstat -an | findstr :3000

# Iniciar manualmente
cd Frontend
npm run dev
```

#### **Login não funciona:**
- Verificar se o backend está rodando
- Usar credenciais de teste fornecidas
- Verificar console do navegador para erros

### **Logs de Debug:**
- **Backend**: Console do terminal onde está rodando
- **Frontend**: Console do navegador (F12)
- **Network**: Aba Network no DevTools para ver requisições

## 📞 **Contato:**

- **Sistema**: http://localhost:3000
- **API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## 🎉 **SISTEMA 100% FUNCIONAL!**

O sistema Brimu está **completamente operacional** e pronto para uso! 

**Acesse agora**: http://localhost:3000 → Clique em "Portal de Acesso" → Faça login → Use o sistema!

**Desenvolvido com ❤️ pela equipe Brimu**
