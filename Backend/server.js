const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Dados mock para teste
const users = [
  { id: 1, name: 'Admin', email: 'admin@brimu.com', role: 'admin' },
  { id: 2, name: 'Usuário Teste', email: 'teste@brimu.com', role: 'user' }
];

// Rotas
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend Brimu funcionando!',
    timestamp: new Date().toISOString(),
    mongodb: 'Modo teste (sem MongoDB)'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Tentativa de login:', { email, password });
  
  // Validação simples
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }
  
  // Credenciais de teste
  if (email === 'admin@brimu.com' && password === 'admin123') {
    const user = users.find(u => u.email === email);
    const token = 'mock-jwt-token-' + Date.now();
    
    res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } else if (email === 'teste@brimu.com' && password === 'teste123') {
    const user = users.find(u => u.email === email);
    const token = 'mock-jwt-token-' + Date.now();
    
    res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }
  
  // Simular criação de usuário
  const newUser = {
    id: users.length + 1,
    name,
    email,
    role: 'user'
  };
  
  users.push(newUser);
  
  const token = 'mock-jwt-token-' + Date.now();
  
  res.json({
    message: 'Usuário criado com sucesso!',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
});

// Rota para upload de arquivos (mock)
app.post('/api/upload', (req, res) => {
  res.json({
    message: 'Upload realizado com sucesso!',
    file: {
      id: Date.now(),
      name: 'arquivo-teste.jpg',
      size: 1024,
      url: '/uploads/arquivo-teste.jpg'
    }
  });
});

// Rota para listar arquivos (mock)
app.get('/api/files', (req, res) => {
  res.json({
    files: [
      { id: 1, name: 'documento1.pdf', size: 2048, date: new Date().toISOString() },
      { id: 2, name: 'imagem1.jpg', size: 1536, date: new Date().toISOString() }
    ]
  });
});

// Rota para dashboard (mock)
app.get('/api/dashboard', (req, res) => {
  res.json({
    stats: {
      totalFiles: 15,
      totalUsers: 4,
      totalStorage: '2.5 GB',
      recentActivity: [
        { id: 1, action: 'Upload', file: 'documento.pdf', user: 'Admin', time: new Date().toISOString() },
        { id: 2, action: 'Login', user: 'Usuário Teste', time: new Date().toISOString() }
      ]
    }
  });
});

// Rota catch-all para SPA
app.get('*', (req, res) => {
  res.json({ message: 'API Brimu - Rota não encontrada', path: req.path });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Backend Brimu rodando!');
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log('🔑 Credenciais de teste:');
  console.log('   Admin: admin@brimu.com / admin123');
  console.log('   Usuário: teste@brimu.com / teste123');
  console.log('⚠️  Modo teste (sem MongoDB)');
});

module.exports = app;
