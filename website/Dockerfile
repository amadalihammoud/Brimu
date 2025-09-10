# 🐳 Dockerfile para Website Next.js do Brimu
# Multi-stage build otimizado para Next.js

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copiar dependências do stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fonte
COPY . .

# Definir variáveis de ambiente para build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build da aplicação
RUN npm run build

# Stage 3: Production
FROM node:18-alpine AS runner
WORKDIR /app

# Instalar dependências de runtime
RUN apk add --no-cache tini curl

# Definir variáveis de ambiente
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários do build
COPY --from=builder /app/public ./public

# Copiar arquivos buildados
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Criar script de inicialização
RUN cat > docker-entrypoint.sh << 'EOF'
#!/bin/sh
set -e

echo "🚀 Starting Brimu Website (Next.js)..."

# Verificar se arquivos necessários existem
if [ ! -f "server.js" ]; then
    echo "❌ Erro: server.js não encontrado!"
    exit 1
fi

# Configurar variáveis de ambiente runtime se necessário
export HOSTNAME="0.0.0.0"
export PORT="${PORT:-3000}"

echo "🌐 Iniciando servidor na porta $PORT..."
exec node server.js
EOF

RUN chmod +x docker-entrypoint.sh

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Mudar para usuário não-root
USER nextjs

# Usar tini como init process
ENTRYPOINT ["/sbin/tini", "--"]

# Comando padrão
CMD ["./docker-entrypoint.sh"]

# Metadata
LABEL org.opencontainers.image.title="Brimu Website"
LABEL org.opencontainers.image.description="Website Next.js do sistema Brimu"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Equipe Brimu"
LABEL org.opencontainers.image.licenses="MIT"