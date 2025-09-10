# 📧 Guia de Configuração de Email - Sistema Brimu

## 🎯 Objetivo
Configurar o sistema de email do Brimu para envio de notificações, confirmações e comunicações com clientes.

## 🚀 Opções de Configuração

### 1. 📧 Gmail (Recomendado para desenvolvimento)

#### Pré-requisitos:
- Conta Gmail ativa
- Autenticação de 2 fatores ativada

#### Configuração:
1. **Ativar Autenticação de 2 Fatores:**
   - Acesse: https://myaccount.google.com/security
   - Vá em "Verificação em duas etapas"
   - Siga as instruções para ativar

2. **Gerar Senha de App:**
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "Mail" como aplicativo
   - Gere a senha (16 caracteres)

3. **Configurar .env:**
   ```bash
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=seu_email@gmail.com
   EMAIL_PASS=sua_senha_de_app_de_16_digitos
   EMAIL_FROM=seu_email@gmail.com
   ```

### 2. 🏢 Outlook/Hotmail

#### Configuração:
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=seu_email@outlook.com
EMAIL_PASS=sua_senha_normal
EMAIL_FROM=seu_email@outlook.com
```

### 3. 🌐 Provedor Profissional (Recomendado para produção)

#### Exemplos comuns:
```bash
# Hostgator
EMAIL_HOST=mail.seudominio.com
EMAIL_PORT=587

# GoDaddy
EMAIL_HOST=smtpout.secureserver.net
EMAIL_PORT=465

# Amazon SES
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
```

## 🧪 Testando a Configuração

### Comandos de Teste:

```bash
# Teste completo
npm run test-email

# Apenas verificar configuração
npm run test-email-verify

# Enviar email de teste
npm run test-email-send

# Testar configurações alternativas
npm run test-email-alternatives

# Enviar para email específico
npm run test-email-send seuemail@exemplo.com
```

## 🔧 Solução de Problemas

### ❌ Erro: "Invalid login"
**Solução:**
- Gmail: Use senha de app (não a senha normal)
- Outlook: Verifique se a conta não tem 2FA
- Outros: Verifique credenciais

### ❌ Erro: "Connection timeout"
**Soluções:**
- Verifique firewall/antivírus
- Tente porta 465 (SSL) em vez de 587 (TLS)
- Verifique se o provedor permite SMTP

### ❌ Erro: "Self signed certificate"
**Solução temporária (desenvolvimento):**
```javascript
// Em config/email.js
secure: false,
tls: {
  rejectUnauthorized: false
}
```

### ❌ Erro: "Rate limit exceeded"
**Soluções:**
- Gmail: Max 500 emails/dia (contas gratuitas)
- Use provedor profissional para produção
- Implemente fila de emails

## 📋 Lista de Verificação

### ✅ Desenvolvimento:
- [ ] Configurar Gmail com senha de app
- [ ] Testar envio com `npm run test-email`
- [ ] Verificar recebimento do email de teste
- [ ] Confirmar formatação HTML/texto

### ✅ Produção:
- [ ] Configurar email profissional (@seudominio.com)
- [ ] Configurar registro SPF no DNS
- [ ] Configurar registro DKIM no DNS
- [ ] Configurar registro DMARC no DNS
- [ ] Testar deliverability
- [ ] Monitorar bounces/spam

## 🛡️ Segurança

### Boas Práticas:
1. **Nunca commitar senhas:** Use variáveis de ambiente
2. **Use emails dedicados:** Ex: noreply@empresa.com
3. **Implemente rate limiting:** Evite spam/abuse
4. **Monitore logs:** Acompanhe envios e erros
5. **Backup de configurações:** Documente settings

### Exemplo de Email Seguro:
```bash
# .env.production
EMAIL_HOST=smtp.seudominio.com
EMAIL_PORT=587
EMAIL_USER=noreply@seudominio.com
EMAIL_PASS=senha_muito_segura_aqui
EMAIL_FROM="Sistema Brimu <noreply@seudominio.com>"
EMAIL_REPLY_TO=contato@seudominio.com
```

## 🎨 Templates de Email

O sistema inclui templates para:
- ✅ Confirmação de cadastro
- 📧 Reset de senha
- 📋 Notificações de orçamento
- 🔔 Lembretes de serviço
- 📊 Relatórios automáticos

## 📞 Suporte

### Se precisar de ajuda:
1. Execute `npm run test-email` e envie o output
2. Verifique logs em `logs/app.log`
3. Consulte documentação do provedor de email
4. Considere usar serviços como SendGrid/Mailgun para produção

## 🚀 Próximos Passos

Após configurar o email:
1. Teste todas as funcionalidades
2. Configure templates personalizados
3. Implemente monitoramento
4. Configure backup das configurações
5. Documente processo para equipe

---

💡 **Dica:** Para produção, considere usar serviços especializados como:
- SendGrid
- Mailgun  
- Amazon SES
- Postmark

Eles oferecem melhor deliverability e recursos avançados.