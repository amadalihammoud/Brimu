import mongoose from 'mongoose';
import config from './index';

const connectDB = async (): Promise<boolean> => {
  try {
    // Verificar se MongoDB está configurado
    if (!config.database.uri) {
      console.log('⚠️ MongoDB não configurado - modo teste ativado');
      return false;
    }

    const conn = await mongoose.connect(config.database.uri, config.database.options);

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Configurar eventos de conexão
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erro na conexão MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconectado');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 Conexão MongoDB fechada');
      process.exit(0);
    });

    return true;

  } catch (error) {
    console.log('⚠️ MongoDB não disponível - modo teste ativado');
    console.log('💡 Para usar MongoDB, configure MONGODB_URI no arquivo .env');
    console.log('🔧 Erro:', (error as Error).message);
    return false;
  }
};

// Função para verificar se o banco está conectado
const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

// Função para obter estatísticas da conexão
const getConnectionStats = (): any => {
  if (!isConnected()) {
    return { connected: false, message: 'MongoDB não conectado' };
  }

  const conn = mongoose.connection;
  return {
    connected: true,
    host: conn.host,
    port: conn.port,
    name: conn.name,
    readyState: conn.readyState,
    collections: Object.keys(conn.collections).length
  };
};

export {
  connectDB,
  isConnected,
  getConnectionStats
};
