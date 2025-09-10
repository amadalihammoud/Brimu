# 🐳 Dockerfile para Frontend do Brimu
# Multi-stage build com Nginx otimizado

# Stage 1: Build
FROM node:18-alpine AS builder

LABEL maintainer="Equipe Brimu"
LABEL description="Frontend React do sistema Brimu"
LABEL version="1.0.0"

# Instalar dependências do sistema
RUN apk add --no-cache git python3 make g++

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --omit=dev

# Copiar código fonte
COPY public/ ./public/
COPY src/ ./src/
COPY index.html ./
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Copiar arquivo de ambiente para build
COPY .env.example .env

# Build da aplicação para produção
RUN npm run build

# Stage 2: Production com Nginx
FROM nginx:1.25-alpine AS production

# Instalar dependências adicionais
RUN apk add --no-cache curl tini

# Remover configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar script de inicialização
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Criar usuário não-root
RUN addgroup -g 1001 -S nginx-user \
    && adduser -S nginx-user -u 1001 -G nginx-user

# Ajustar permissões
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html \
    && chown -R nginx-user:nginx-user /var/cache/nginx \
    && chown -R nginx-user:nginx-user /var/log/nginx \
    && chown -R nginx-user:nginx-user /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R nginx-user:nginx-user /var/run/nginx.pid

# Definir variáveis de ambiente
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d

# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Mudar para usuário não-root
USER nginx-user

# Usar tini como init process
ENTRYPOINT ["/sbin/tini", "--"]

# Comando padrão
CMD ["/docker-entrypoint.sh"]

# Metadata
LABEL org.opencontainers.image.title="Brimu Frontend"
LABEL org.opencontainers.image.description="Frontend React do sistema Brimu"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Equipe Brimu"
LABEL org.opencontainers.image.licenses="MIT"