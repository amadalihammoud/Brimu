import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import config from '../config';

interface CustomJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        iat?: number;
        exp?: number;
        [key: string]: any;
      };
    }
  }
}

const auth = (req: Request, res: Response, next: NextFunction) => {
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

    const decoded = jwt.verify(token, config.auth.jwtSecret) as CustomJwtPayload;

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
  } catch (error) {
    let message = 'Erro na verificação do token.';
    let code = 'TOKEN_ERROR';

    if (error.name === 'TokenExpiredError') {
      message = 'Token expirado.';
      code = 'TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Token inválido.';
      code = 'INVALID_TOKEN';
    } else if (error.name === 'NotBeforeError') {
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

// Middleware para verificar roles específicos
const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
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

// Middleware para verificar se é admin
const requireAdmin = requireRole('admin');

// Middleware para verificar se é admin ou o próprio usuário
const requireAdminOrOwner = (req: Request, res: Response, next: NextFunction) => {
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

export {
  auth,
  requireRole,
  requireAdmin,
  requireAdminOrOwner
};
