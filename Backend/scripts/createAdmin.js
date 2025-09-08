const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');

const createAdminUser = async () => {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/brimu');
    console.log('✅ Conectado ao MongoDB');

    // Verificar se já existe um admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️ Usuário administrador já existe:', existingAdmin.email);
      process.exit(0);
    }

    // Criar usuário administrador
    const adminUser = new User({
      name: 'Administrador Brimu',
      email: 'admin@brimu.com',
      password: 'admin123', // Senha padrão - deve ser alterada
      role: 'admin',
      isActive: true,
      isVerified: true,
      permissions: {
        upload: true,
        download: true,
        delete: true,
        manageUsers: true,
        manageFiles: true,
        viewAnalytics: true
      },
      uploadSettings: {
        maxFileSize: 50 * 1024 * 1024, // 50MB
        maxFilesPerUpload: 20,
        allowedFileTypes: ['*'],
        autoCompressImages: true,
        createThumbnails: true
      }
    });

    await adminUser.save();

    console.log('🎉 Usuário administrador criado com sucesso!');
    console.log('📧 Email: admin@brimu.com');
    console.log('🔑 Senha: admin123');
    console.log('⚠️ IMPORTANTE: Altere a senha após o primeiro login!');

    // Criar usuário de teste
    const testUser = new User({
      name: 'Usuário Teste',
      email: 'teste@brimu.com',
      password: 'teste123',
      role: 'employee',
      isActive: true,
      isVerified: true,
      permissions: {
        upload: true,
        download: true,
        delete: false,
        manageUsers: false,
        manageFiles: false,
        viewAnalytics: false
      }
    });

    await testUser.save();

    console.log('👤 Usuário de teste criado:');
    console.log('📧 Email: teste@brimu.com');
    console.log('🔑 Senha: teste123');

    process.exit(0);

  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error);
    process.exit(1);
  }
};

// Executar script
createAdminUser();
