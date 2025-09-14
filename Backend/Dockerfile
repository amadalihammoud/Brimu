# 🐳 Dockerfile para Backend do Brimu
# Multi-stage build para otimizar tamanho da imagem

# Stage 1: Build
FROM node:18-alpine AS builder

LABEL maintainer="Equipe Brimu"
LABEL description="Backend API do sistema Brimu - Gestão para Serviços Arbóreos"
LABEL version="1.0.0"

# Instalar dependências do sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/cache/apk/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências (incluindo devDependencies para build)
RUN npm ci --include=dev

# Copiar código fonte
COPY src/ ./src/
COPY scripts/ ./scripts/

# Build da aplicação
RUN npm run build

# Limpar devDependencies
RUN npm prune --production

# Stage 2: Production
FROM node:18-alpine AS production

# Instalar dependências de runtime necessárias
RUN apk add --no-cache \
    tini \
    curl \
    && rm -rf /var/cache/apk/*

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs \
    && adduser -S backend -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos do stage de build
COPY --from=builder --chown=backend:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=backend:nodejs /app/dist ./dist
COPY --from=builder --chown=backend:nodejs /app/package*.json ./

# Criar diretórios necessários
RUN mkdir -p storage/logs storage/temp storage/backups uploads public \
    && chown -R backend:nodejs storage uploads public

# Copiar arquivos de configuração
COPY --chown=backend:nodejs .env.production .env || COPY --chown=backend:nodejs .env.example .env

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=5000
ENV LOG_LEVEL=info

# Expor porta
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Mudar para usuário não-root
USER backend

# Usar tini como init process para gerenciar sinais
ENTRYPOINT ["/sbin/tini", "--"]

# Comando padrão
CMD ["node", "dist/app.js"]

# Metadata
LABEL org.opencontainers.image.title="Brimu Backend"
LABEL org.opencontainers.image.description="Backend API do sistema Brimu"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Equipe Brimu"
LABEL org.opencontainers.image.licenses="MIT"