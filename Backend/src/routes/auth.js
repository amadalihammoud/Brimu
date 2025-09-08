const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const config = require('../config');
const User = require('../models/User');

// Middleware para validar dados
const validateUser = [
  body('name').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
];

// Registrar usuário
router.post('/register', validateUser, async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { name, email, password, role = 'employee' } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Usuário já existe com este email' });
    }

    // Criar novo usuário
    const user = new User({
      name,
      email,
      password,
      role,
      isActive: true,
      isVerified: true // Para desenvolvimento, marcar como verificado
    });

    await user.save();

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      config.auth.jwtSecret,
      { expiresIn: config.auth.jwtExpiresIn }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Verificar se MongoDB está disponível
    const { isConnected } = require('../config/database');
    
    let user = null;
    
    if (isConnected()) {
      // Usar MongoDB se disponível
      user = await User.findOne({ email, isActive: true });
      if (user) {
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          user = null;
        }
      }
    } else {
      // Usar usuários de teste se MongoDB não estiver disponível
      const testUsers = [
        { id: 1, name: 'Admin', email: 'admin@brimu.com', password: 'admin123', role: 'admin' },
        { id: 2, name: 'Usuário Teste', email: 'teste@brimu.com', password: 'teste123', role: 'user' }
      ];

      const testUser = testUsers.find(u => u.email === email && u.password === password);
      if (testUser) {
        user = {
          _id: testUser.id,
          id: testUser.id,
          name: testUser.name,
          email: testUser.email,
          role: testUser.role,
          isActive: true
        };
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: user._id || user.id, 
        email: user.email, 
        role: user.role 
      },
      config.auth.jwtSecret,
      { expiresIn: config.auth.jwtExpiresIn }
    );

    // Atualizar último login se usando MongoDB
    if (isConnected() && user.updateStats) {
      await user.updateStats('login');
    }

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter perfil do usuário
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret);
    
    // Verificar se MongoDB está disponível
    const { isConnected } = require('../config/database');
    
    let user = null;
    
    if (isConnected()) {
      // Usar MongoDB se disponível
      user = await User.findById(decoded.id).select('-password -security');
    } else {
      // Usar usuários de teste se MongoDB não estiver disponível
      const testUsers = [
        { id: 1, name: 'Admin', email: 'admin@brimu.com', role: 'admin' },
        { id: 2, name: 'Usuário Teste', email: 'teste@brimu.com', role: 'user' }
      ];

      const testUser = testUsers.find(u => u.id === decoded.id);
      if (testUser) {
        user = {
          _id: testUser.id,
          id: testUser.id,
          name: testUser.name,
          email: testUser.email,
          role: testUser.role,
          isActive: true
        };
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    res.json({
      message: 'Perfil obtido com sucesso',
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        phone: user.phone,
        company: user.company,
        position: user.position
      }
    });

  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
});

// Atualizar perfil
router.put('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    const { name, phone, company, position } = req.body;

    // Atualizar campos permitidos
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (company) user.company = company;
    if (position) user.position = position;

    await user.save();

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        position: user.position
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Alterar senha
router.put('/change-password', [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    const { currentPassword, newPassword } = req.body;

    // Verificar senha atual
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Senha atual incorreta' });
    }

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Senha alterada com sucesso' });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Logout (invalidar token)
router.post('/logout', (req, res) => {
  // Em uma implementação mais robusta, você manteria uma blacklist de tokens
  // Por enquanto, apenas retornamos sucesso
  res.json({ message: 'Logout realizado com sucesso' });
});

module.exports = router;
