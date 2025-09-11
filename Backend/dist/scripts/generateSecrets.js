"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
/**
 * Gerador de segredos seguros para o sistema Brimu
 * Gera chaves criptograficamente seguras para JWT e outras operações
 */
class SecretGenerator {
    // Gerar JWT secret seguro (256 bits = 32 bytes)
    generateJWTSecret() {
        return crypto_1.default.randomBytes(64).toString('hex');
    }
    // Gerar chave para criptografia (256 bits)
    generateEncryptionKey() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    // Gerar salt para bcrypt
    generateSalt() {
        return crypto_1.default.randomBytes(16).toString('hex');
    }
    // Gerar cookie secret
    generateCookieSecret() {
        return crypto_1.default.randomBytes(32).toString('base64');
    }
    // Gerar API key
    generateAPIKey() {
        return crypto_1.default.randomBytes(48).toString('base64url');
    }
    // Gerar arquivo .env.production com secrets seguros
    async generateProductionEnv() {
        const envPath = path_1.default.join(process.cwd(), '.env.production');
        const envContent = `# Configurações de Produção - GERADAS AUTOMATICAMENTE
# ⚠️  NUNCA COMMITAR ESTE ARQUIVO - APENAS LOCAL/SERVIDOR
# Data de geração: ${new Date().toISOString()}

# Configurações do Servidor
PORT=5000
NODE_ENV=production

# Banco de Dados MongoDB (SUBSTITUIR COM URL DE PRODUÇÃO)
MONGODB_URI=mongodb://localhost:27017/brimu_production

# JWT (JSON Web Token) - GERADO AUTOMATICAMENTE
JWT_SECRET=${this.generateJWTSecret()}
JWT_EXPIRES_IN=7d

# Chaves de Criptografia
ENCRYPTION_KEY=${this.generateEncryptionKey()}
COOKIE_SECRET=${this.generateCookieSecret()}

# API Keys
API_KEY=${this.generateAPIKey()}
ADMIN_API_KEY=${this.generateAPIKey()}

# Email (CONFIGURAR COM CREDENCIAIS REAIS)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email_producao@empresa.com
EMAIL_PASS=sua_senha_de_app_producao
EMAIL_FROM=noreply@empresa.com

# Upload de Arquivos
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads
PUBLIC_PATH=public

# CORS (CONFIGURAR COM DOMÍNIOS REAIS)
CORS_ORIGIN=https://seudominio.com,https://www.seudominio.com

# Rate Limiting (Mais restritivo em produção)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# Logs
LOG_LEVEL=warn
LOG_FILE=logs/app.log

# SSL/TLS
SSL_KEY_PATH=./certs/private-key.pem
SSL_CERT_PATH=./certs/certificate.pem

# Monitoramento
ENABLE_MONITORING=true
HEALTH_CHECK_ENDPOINT=/health

# Backup
BACKUP_ENCRYPTION_KEY=${this.generateEncryptionKey()}
BACKUP_S3_BUCKET=brimu-backups-prod
BACKUP_S3_REGION=us-east-1

# Cache Redis (CONFIGURAR URL DE PRODUÇÃO)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=${this.generateSalt()}

# Webhook secrets
WEBHOOK_SECRET=${this.generateSalt()}
PAYMENT_WEBHOOK_SECRET=${this.generateSalt()}
`;
        await fs_1.promises.writeFile(envPath, envContent);
        console.log(`✅ Arquivo .env.production criado com secrets seguros!`);
        console.log(`📁 Localização: ${envPath}`);
        console.log(`⚠️  IMPORTANTE: Nunca versionar este arquivo!`);
    }
    // Gerar .env.example atualizado
    async updateEnvExample() {
        const envExamplePath = path_1.default.join(process.cwd(), '.env.example');
        const envExampleContent = `# Configurações de Exemplo - Este arquivo pode ser commitado
# Copie para .env e preencha com valores reais

# Configurações do Servidor 
PORT=5000 
NODE_ENV=development 

# Banco de Dados MongoDB 
MONGODB_URI=mongodb://localhost:27017/brimu 

# JWT (JSON Web Token) - GERAR COM: npm run generate-secrets
JWT_SECRET=SUBSTITUIR_POR_CHAVE_SEGURA_DE_64_CHARS_MINIMO
JWT_EXPIRES_IN=7d 

# Chaves de Criptografia - GERAR COM: npm run generate-secrets
ENCRYPTION_KEY=SUBSTITUIR_POR_CHAVE_SEGURA_256_BITS
COOKIE_SECRET=SUBSTITUIR_POR_CHAVE_SEGURA

# Email (Nodemailer) 
EMAIL_HOST=smtp.gmail.com 
EMAIL_PORT=587 
EMAIL_USER=seu_email@gmail.com 
EMAIL_PASS=sua_senha_de_app_do_gmail 
EMAIL_FROM=noreply@empresa.com

# Upload de Arquivos 
MAX_FILE_SIZE=10485760 
UPLOAD_PATH=uploads 
PUBLIC_PATH=public 

# CORS 
CORS_ORIGIN=http://localhost:3002,http://localhost:3000

# Rate Limiting 
RATE_LIMIT_WINDOW_MS=900000 
RATE_LIMIT_MAX_REQUESTS=100 

# Logs 
LOG_LEVEL=info 
LOG_FILE=logs/app.log

# Monitoramento (opcional)
ENABLE_MONITORING=false
HEALTH_CHECK_ENDPOINT=/health

# Cache Redis (opcional)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# API Keys (gerar com npm run generate-secrets)
API_KEY=
ADMIN_API_KEY=
`;
        await fs_1.promises.writeFile(envExamplePath, envExampleContent);
        console.log(`✅ Arquivo .env.example atualizado!`);
    }
    // Gerar gitignore entries para secrets
    async updateGitignore() {
        const gitignorePath = path_1.default.join(process.cwd(), '../../../.gitignore');
        try {
            const gitignoreContent = await fs_1.promises.readFile(gitignorePath, 'utf-8');
            if (!gitignoreContent.includes('.env.production')) {
                const newContent = gitignoreContent + `

# Environment files com secrets (NUNCA COMMITAR!)
.env.production
.env.local
.env.staging
*.env.secret

# Certificados SSL
*.pem
*.key
*.crt
certs/

# Chaves de backup
backup-keys/
*.backup.key
`;
                await fs_1.promises.writeFile(gitignorePath, newContent);
                console.log('✅ .gitignore atualizado com entradas de segurança!');
            }
        }
        catch (error) {
            console.warn('⚠️  Não foi possível atualizar .gitignore:', error.message);
        }
    }
    // Executar tudo
    async generateAll() {
        console.log('🔐 Iniciando geração de secrets seguros...\n');
        await this.generateProductionEnv();
        await this.updateEnvExample();
        await this.updateGitignore();
        console.log('\n🎉 Secrets gerados com sucesso!');
        console.log('\n📋 PRÓXIMOS PASSOS:');
        console.log('1. Copie .env.production para .env (desenvolvimento)');
        console.log('2. Configure MongoDB_URI com sua URL real');
        console.log('3. Configure credenciais de email reais');
        console.log('4. Configure CORS_ORIGIN com seus domínios');
        console.log('5. NUNCA committar arquivos .env.production!');
    }
}
// Executar se chamado diretamente
if (require.main === module) {
    const generator = new SecretGenerator();
    generator.generateAll().catch(console.error);
}
exports.default = SecretGenerator;
