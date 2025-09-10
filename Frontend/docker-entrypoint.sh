#!/bin/sh
set -e

# Script de inicialização do container Frontend
echo "🚀 Starting Brimu Frontend..."

# Validar se os arquivos buildados existem
if [ ! -f "/usr/share/nginx/html/index.html" ]; then
    echo "❌ Erro: Arquivos buildados não encontrados!"
    exit 1
fi

# Configurar variáveis de ambiente se necessário
if [ -n "$REACT_APP_API_URL" ]; then
    echo "🔧 Configurando API_URL: $REACT_APP_API_URL"
    # Substituir placeholder no index.html se existir
    sed -i "s|REACT_APP_API_URL_PLACEHOLDER|$REACT_APP_API_URL|g" /usr/share/nginx/html/index.html || true
fi

# Verificar configuração do Nginx
echo "🔍 Testando configuração do Nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuração do Nginx está válida"
else
    echo "❌ Erro na configuração do Nginx"
    exit 1
fi

# Inicializar Nginx
echo "🌐 Iniciando servidor Nginx..."
exec nginx -g "daemon off;"