"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminOrOwner = exports.requireAdmin = exports.requireRole = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const auth = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({
                message: 'Acesso negado. Token não fornecido.',
                code: 'NO_TOKEN'
            });
        }
        // Verificar formato do header
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Formato de autorização inválido.',
                code: 'INVALID_FORMAT'
            });
        }
        const token = authHeader.replace('Bearer ', '');
        // Verificar formato do token JWT
        if (!/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/.test(token)) {
            return res.status(401).json({
                message: 'Formato de token inválido.',
                code: 'INVALID_TOKEN_FORMAT'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.auth.jwtSecret);
        // Verificar se o token contém informações necessárias
        if (!decoded.id || !decoded.role) {
            return res.status(401).json({
                message: 'Token malformado.',
                code: 'MALFORMED_TOKEN'
            });
        }
        // Adicionar informações do usuário à requisição
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            iat: decoded.iat,
            exp: decoded.exp
        };
        next();
    }
    catch (error) {
        let message = 'Erro na verificação do token.';
        let code = 'TOKEN_ERROR';
        if (error.name === 'TokenExpiredError') {
            message = 'Token expirado.';
            code = 'TOKEN_EXPIRED';
        }
        else if (error.name === 'JsonWebTokenError') {
            message = 'Token inválido.';
            code = 'INVALID_TOKEN';
        }
        else if (error.name === 'NotBeforeError') {
            message = 'Token ainda não é válido.';
            code = 'TOKEN_NOT_ACTIVE';
        }
        return res.status(401).json({
            message,
            code,
            timestamp: new Date().toISOString()
        });
    }
};
exports.auth = auth;
// Middleware para verificar roles específicos
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: 'Usuário não autenticado.',
                code: 'NOT_AUTHENTICATED'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Acesso negado. Permissão insuficiente.',
                code: 'INSUFFICIENT_PERMISSIONS',
                required: roles,
                current: req.user.role
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
// Middleware para verificar se é admin
const requireAdmin = requireRole('admin');
exports.requireAdmin = requireAdmin;
// Middleware para verificar se é admin ou o próprio usuário
const requireAdminOrOwner = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: 'Usuário não autenticado.',
            code: 'NOT_AUTHENTICATED'
        });
    }
    const userId = req.params.id || req.params.userId;
    if (req.user.role === 'admin' || req.user.id.toString() === userId) {
        return next();
    }
    return res.status(403).json({
        message: 'Acesso negado. Você só pode acessar seus próprios dados.',
        code: 'ACCESS_DENIED'
    });
};
exports.requireAdminOrOwner = requireAdminOrOwner;
