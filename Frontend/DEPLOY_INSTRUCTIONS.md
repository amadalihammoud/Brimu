# 🚀 Instruções de Deploy - Brimu

## ✅ Google Analytics Configurado
- **ID do GA4**: `G-L3K0S1CNRW`
- **Status**: Pronto para produção

## 🔧 Configuração do Vercel

### 1. Variáveis de Ambiente
Configure estas variáveis no painel do Vercel (Settings → Environment Variables):

```
REACT_APP_GA_MEASUREMENT_ID=G-L3K0S1CNRW
REACT_APP_PWA_ENABLED=true
REACT_APP_CONTRAST_FIXES=true
NODE_ENV=production
```

### 2. Configurações de Build
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm ci`

### 3. Deploy
```bash
git add .
git commit -m "feat: configure GA4 and fix deployment"
git push
```

## 📊 Analytics Ativo
- ✅ Tracking de páginas
- ✅ Eventos customizados
- ✅ Web Vitals
- ✅ Scroll tracking
- ✅ Time tracking

## 🔍 Verificação
Após o deploy, verifique:
1. Site carregando em `https://brimu.vercel.app`
2. Console do navegador sem erros
3. Google Analytics recebendo dados (24-48h)

## 🛠️ Troubleshooting
Se ainda houver erro 404:
1. Verifique se o build está na pasta `dist/`
2. Confirme que `index.html` existe em `dist/index.html`
3. Verifique as variáveis de ambiente no Vercel
