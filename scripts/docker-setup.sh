#!/bin/bash
# 🐳 Script de Setup Docker para Sistema Brimu

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Setup Docker - Sistema Brimu${NC}"
echo "========================================"

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado!${NC}"
    echo "Instale o Docker primeiro: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não está instalado!${NC}"
    echo "Instale o Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker e Docker Compose encontrados${NC}"

# Verificar se arquivo .env.docker existe
if [ ! -f ".env.docker" ]; then
    echo -e "${YELLOW}⚠️ Arquivo .env.docker não encontrado${NC}"
    echo "Copiando template..."
    cp .env.docker.example .env.docker 2>/dev/null || echo "Template não encontrado, criando arquivo básico..."
fi

# Escolher ambiente
echo ""
echo "Escolha o ambiente:"
echo "1) Produção (completo)"
echo "2) Desenvolvimento (com ferramentas de debug)"
echo "3) Apenas Backend + MongoDB"
echo "4) Build apenas (sem executar)"

read -p "Digite sua escolha (1-4): " choice

case $choice in
    1)
        echo -e "${BLUE}🚀 Configurando ambiente de PRODUÇÃO${NC}"
        COMPOSE_FILE="docker-compose.yml"
        ;;
    2)
        echo -e "${BLUE}🛠️ Configurando ambiente de DESENVOLVIMENTO${NC}"
        COMPOSE_FILE="docker-compose.development.yml"
        ;;
    3)
        echo -e "${BLUE}🔧 Configurando apenas Backend + MongoDB${NC}"
        COMPOSE_FILE="docker-compose.yml"
        SERVICES="mongodb redis backend"
        ;;
    4)
        echo -e "${BLUE}🏗️ Apenas BUILD das imagens${NC}"
        BUILD_ONLY=true
        ;;
    *)
        echo -e "${RED}❌ Opção inválida${NC}"
        exit 1
        ;;
esac

# Verificar e criar diretórios necessários
echo ""
echo -e "${BLUE}📁 Criando diretórios necessários...${NC}"
mkdir -p nginx/conf.d nginx/ssl
mkdir -p scripts

# Gerar segredos se necessário
if [ -f "Backend/package.json" ]; then
    echo -e "${BLUE}🔐 Verificando configurações de segurança...${NC}"
    cd Backend
    if [ -f "scripts/generateSecrets.ts" ]; then
        echo "Gerando secrets seguros..."
        npm run generate-secrets --silent || echo "Erro ao gerar secrets, continuando..."
    fi
    cd ..
fi

# Função para build apenas
if [ "$BUILD_ONLY" = true ]; then
    echo -e "${BLUE}🏗️ Building imagens Docker...${NC}"
    
    # Build Backend
    if [ -f "Backend/Dockerfile" ]; then
        echo "Building Backend..."
        docker build -t brimu-backend:latest ./Backend
    fi
    
    # Build Frontend
    if [ -f "Frontend/Dockerfile" ]; then
        echo "Building Frontend..."
        docker build -t brimu-frontend:latest ./Frontend
    fi
    
    # Build Website
    if [ -f "website/Dockerfile" ]; then
        echo "Building Website..."
        docker build -t brimu-website:latest ./website
    fi
    
    echo -e "${GREEN}✅ Build concluído!${NC}"
    exit 0
fi

# Parar containers existentes
echo -e "${YELLOW}🛑 Parando containers existentes...${NC}"
docker-compose -f $COMPOSE_FILE down --remove-orphans || true

# Limpar volumes se solicitado
read -p "Limpar volumes de dados existentes? (y/N): " clean_volumes
if [[ $clean_volumes =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🧹 Removendo volumes...${NC}"
    docker-compose -f $COMPOSE_FILE down -v
fi

# Build das imagens
echo -e "${BLUE}🏗️ Building imagens...${NC}"
if [ -n "$SERVICES" ]; then
    docker-compose -f $COMPOSE_FILE build $SERVICES
else
    docker-compose -f $COMPOSE_FILE build
fi

# Inicializar serviços
echo -e "${BLUE}🚀 Iniciando serviços...${NC}"
if [ -n "$SERVICES" ]; then
    docker-compose -f $COMPOSE_FILE up -d $SERVICES
else
    docker-compose -f $COMPOSE_FILE up -d
fi

# Aguardar serviços ficarem saudáveis
echo -e "${BLUE}⏳ Aguardando serviços ficarem prontos...${NC}"
sleep 10

# Verificar status dos serviços
echo ""
echo -e "${BLUE}📊 Status dos serviços:${NC}"
docker-compose -f $COMPOSE_FILE ps

# Verificar logs se houver erro
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Alguns serviços falharam ao iniciar${NC}"
    echo "Logs dos serviços:"
    docker-compose -f $COMPOSE_FILE logs --tail=10
    exit 1
fi

# URLs de acesso
echo ""
echo -e "${GREEN}🎉 Setup concluído com sucesso!${NC}"
echo ""
echo "🌐 URLs de acesso:"
echo "   • Website (Next.js): http://localhost:3000"
echo "   • Frontend (React): http://localhost:3002"
echo "   • Backend API: http://localhost:5000"

if [ "$COMPOSE_FILE" = "docker-compose.development.yml" ]; then
    echo ""
    echo "🛠️ Ferramentas de desenvolvimento:"
    echo "   • MongoDB Express: http://localhost:8081 (admin/admin)"
    echo "   • Redis Commander: http://localhost:8082 (admin/admin)"
    echo "   • MailHog: http://localhost:8025"
fi

echo ""
echo "📋 Comandos úteis:"
echo "   • Ver logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "   • Parar: docker-compose -f $COMPOSE_FILE down"
echo "   • Reiniciar: docker-compose -f $COMPOSE_FILE restart"
echo "   • Status: docker-compose -f $COMPOSE_FILE ps"

echo ""
echo -e "${BLUE}✅ Sistema Brimu está rodando!${NC}"