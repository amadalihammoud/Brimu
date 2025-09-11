"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectionStats = exports.isConnected = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("./index"));
const connectDB = async () => {
    try {
        // Verificar se MongoDB está configurado
        if (!index_1.default.database.uri) {
            console.log('⚠️ MongoDB não configurado - modo teste ativado');
            return false;
        }
        const conn = await mongoose_1.default.connect(index_1.default.database.uri, index_1.default.database.options);
        console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        // Configurar eventos de conexão
        mongoose_1.default.connection.on('error', (err) => {
            console.error('❌ Erro na conexão MongoDB:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB desconectado');
        });
        mongoose_1.default.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconectado');
        });
        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose_1.default.connection.close();
            console.log('🔌 Conexão MongoDB fechada');
            process.exit(0);
        });
        return true;
    }
    catch (error) {
        console.log('⚠️ MongoDB não disponível - modo teste ativado');
        console.log('💡 Para usar MongoDB, configure MONGODB_URI no arquivo .env');
        console.log('🔧 Erro:', error.message);
        return false;
    }
};
exports.connectDB = connectDB;
// Função para verificar se o banco está conectado
const isConnected = () => {
    return mongoose_1.default.connection.readyState === 1;
};
exports.isConnected = isConnected;
// Função para obter estatísticas da conexão
const getConnectionStats = () => {
    if (!isConnected()) {
        return { connected: false, message: 'MongoDB não conectado' };
    }
    const conn = mongoose_1.default.connection;
    return {
        connected: true,
        host: conn.host,
        port: conn.port,
        name: conn.name,
        readyState: conn.readyState,
        collections: Object.keys(conn.collections).length
    };
};
exports.getConnectionStats = getConnectionStats;
