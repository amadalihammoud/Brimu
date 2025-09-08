"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const config_1 = __importDefault(require("../config"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
// Middleware para validar dados
const validateUser = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
];
// Registrar usuário
router.post('/register', validateUser, async (req, res) => {
    try {
        // Verificar erros de validação
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Dados inválidos',
                errors: errors.array()
            });
        }
        const { name, email, password, role = 'employee' } = req.body;
        // Verificar se usuário já existe
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Usuário já existe com este email' });
        }
        // Criar novo usuário
        const user = new User_1.default({
            name,
            email,
            password,
            role,
            isActive: true,
            isVerified: true // Para desenvolvimento, marcar como verificado
        });
        await user.save();
        // Gerar token JWT
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.email,
            role: user.role
        }, config_1.default.auth.jwtSecret, { expiresIn: config_1.default.auth.jwtExpiresIn });
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
    }
    catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Login
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Senha é obrigatória')
], async (req, res) => {
    try {
        // Verificar erros de validação
        const errors = (0, express_validator_1.validationResult)(req);
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
            user = await User_1.default.findOne({ email, isActive: true });
            if (user) {
                const isPasswordValid = await user.comparePassword(password);
                if (!isPasswordValid) {
                    user = null;
                }
            }
        }
        else {
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
        const token = jsonwebtoken_1.default.sign({
            id: user._id || user.id,
            email: user.email,
            role: user.role
        }, config_1.default.auth.jwtSecret, { expiresIn: config_1.default.auth.jwtExpiresIn });
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
    }
    catch (error) {
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
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.auth.jwtSecret);
        // Verificar se MongoDB está disponível
        const { isConnected } = require('../config/database');
        let user = null;
        if (isConnected()) {
            // Usar MongoDB se disponível
            user = await User_1.default.findById(decoded.id).select('-password -security');
        }
        else {
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
    }
    catch (error) {
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
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.auth.jwtSecret);
        const user = await User_1.default.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Usuário não encontrado' });
        }
        const { name, phone, company, position } = req.body;
        // Atualizar campos permitidos
        if (name)
            user.name = name;
        if (phone)
            user.phone = phone;
        if (company)
            user.company = company;
        if (position)
            user.position = position;
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
    }
    catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
// Alterar senha
router.put('/change-password', [
    (0, express_validator_1.body)('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
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
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.auth.jwtSecret);
        const user = await User_1.default.findById(decoded.id);
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
    }
    catch (error) {
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
exports.default = router;
