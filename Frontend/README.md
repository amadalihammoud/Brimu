# Brimu - Serviços de Arborização e Paisagismo

Uma landing page moderna e responsiva para empresa de serviços arbóreos brasileira, desenvolvida com React, Vite e Tailwind CSS.

## 🚀 Características

- **Design Moderno**: Interface limpa e profissional com foco na conversão
- **Totalmente Responsivo**: Otimizado para todos os dispositivos
- **Performance Otimizada**: Construído com Vite para carregamento rápido
- **SEO Friendly**: Meta tags e estrutura semântica otimizada
- **Acessibilidade**: Componentes acessíveis e navegação por teclado
- **Animações Suaves**: Transições e hover effects elegantes

## 🎨 Seções da Landing Page

1. **Hero Section** - Call-to-action forte com informações de contato
2. **Serviços** - Apresentação dos 4 serviços principais
3. **Sobre a Empresa** - História, valores e estatísticas
4. **Portfolio** - Galeria de trabalhos realizados com filtros
5. **Contato/Orçamento** - Formulário de contato e informações
6. **Footer** - Links úteis, redes sociais e newsletter

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca de interface do usuário
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **React Icons** - Ícones SVG para React
- **PostCSS** - Processador CSS
- **Autoprefixer** - Prefixos CSS automáticos

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── Header.jsx      # Navegação principal
│   ├── Hero.jsx        # Seção hero com CTA
│   ├── Services.jsx    # Lista de serviços
│   ├── About.jsx       # Informações sobre a empresa
│   ├── Portfolio.jsx   # Galeria de trabalhos
│   ├── Contact.jsx     # Formulário de contato
│   └── Footer.jsx      # Rodapé da página
├── App.jsx             # Componente principal
├── main.jsx            # Ponto de entrada
└── index.css           # Estilos globais e Tailwind
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Passos para instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd brimu-frontend
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Execute o projeto em modo de desenvolvimento**
   ```bash
   npm run dev
   ```

4. **Abra no navegador**
   ```
   http://localhost:3000
   ```

### Scripts disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run preview` - Visualiza a build de produção
- `npm run lint` - Executa o linter

## 🎨 Personalização

### Cores
O projeto utiliza uma paleta de cores personalizada baseada em tons de verde e marrom:

- **Forest**: Tons de verde para elementos principais
- **Sage**: Tons de verde-acinzentado para elementos secundários  
- **Earth**: Tons de marrom para acentos

### Fontes
- **Inter**: Para texto do corpo
- **Poppins**: Para títulos e headings

### Componentes
Todos os componentes são modulares e podem ser facilmente personalizados editando as classes do Tailwind CSS.

## 📱 Responsividade

A landing page é totalmente responsiva e inclui:
- Design mobile-first
- Breakpoints para tablet e desktop
- Navegação mobile com menu hambúrguer
- Grid layouts adaptativos
- Imagens responsivas

## 🔧 Configurações

### Tailwind CSS
O arquivo `tailwind.config.js` contém:
- Paleta de cores personalizada
- Fontes customizadas
- Padrões de background
- Extensões de tema

### Vite
O arquivo `vite.config.js` inclui:
- Plugin React
- Configuração do servidor de desenvolvimento
- Porta padrão 3000

## 📊 Performance

- **Lazy Loading**: Componentes carregados sob demanda
- **Otimização de Imagens**: Uso de imagens otimizadas do Unsplash
- **CSS Purge**: Tailwind CSS otimizado para produção
- **Bundle Splitting**: Código dividido em chunks menores

## 🌐 SEO e Acessibilidade

- Meta tags otimizadas
- Estrutura HTML semântica
- Alt text para imagens
- Navegação por teclado
- ARIA labels
- Schema markup preparado

## 📈 Conversão

A landing page foi projetada com foco em conversão:
- CTAs estratégicos em cada seção
- Formulário de contato simplificado
- Informações de contato sempre visíveis
- Social proof com estatísticas
- Portfolio para demonstrar qualidade

## 🚀 Deploy

### Build de Produção
```bash
npm run build
```

### Deploy no Vercel
1. Conecte seu repositório ao Vercel
2. Configure o build command: `npm run build`
3. Configure o output directory: `dist`
4. Deploy automático a cada push

### Deploy no Netlify
1. Conecte seu repositório ao Netlify
2. Configure o build command: `npm run build`
3. Configure o publish directory: `dist`
4. Deploy automático a cada push

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
- Email: contato@brimu.com.br
- WhatsApp: (11) 99999-9999

---

**Brimu** - Transformando jardins em paraísos desde 2014 🌳✨
