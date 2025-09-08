import { validate, commonSchemas } from '../../src/validators';
import { userRegisterSchema, userLoginSchema } from '../../src/schemas/user';
import { equipmentCreateSchema } from '../../src/schemas/equipment';
import { Request, Response } from 'express';

// Mock Express request/response objects
const mockRequest = (body: any = {}, query: any = {}, params: any = {}): Request => ({
  body,
  query,
  params,
} as Request);

const mockResponse = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('Validators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Registration Validation', () => {
    it('should validate correct user registration data', () => {
      const validData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'Password123'
      };

      const { error } = userRegisterSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        name: 'João Silva',
        email: 'invalid-email',
        password: 'Password123'
      };

      const { error } = userRegisterSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('Email deve ser válido');
    });

    it('should reject weak password', () => {
      const invalidData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'weak'
      };

      const { error } = userRegisterSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('Senha deve conter');
    });

    it('should reject short name', () => {
      const invalidData = {
        name: 'A',
        email: 'joao@example.com',
        password: 'Password123'
      };

      const { error } = userRegisterSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('User Login Validation', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'joao@example.com',
        password: 'password123'
      };

      const { error } = userLoginSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'password123'
      };

      const { error } = userLoginSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'joao@example.com',
        password: ''
      };

      const { error } = userLoginSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('Equipment Validation', () => {
    it('should validate correct equipment data', () => {
      const validData = {
        name: 'Motosserra Stihl',
        type: 'Ferramenta de Corte',
        status: 'available',
        serialNumber: 'ST123456',
        location: 'Almoxarifado A'
      };

      const { error } = equipmentCreateSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid status', () => {
      const invalidData = {
        name: 'Motosserra',
        type: 'Ferramenta',
        status: 'invalid-status'
      };

      const { error } = equipmentCreateSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
        type: 'Ferramenta',
        status: 'available'
      };

      const { error } = equipmentCreateSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('Validation Middleware', () => {
    it('should call next() for valid data', () => {
      const validData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'Password123'
      };

      const req = mockRequest(validData);
      const res = mockResponse();
      const middleware = validate(userRegisterSchema);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid data', () => {
      const invalidData = {
        name: 'A',
        email: 'invalid-email',
        password: 'weak'
      };

      const req = mockRequest(invalidData);
      const res = mockResponse();
      const middleware = validate(userRegisterSchema);

      middleware(req, res, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Dados de entrada inválidos'
        })
      );
    });
  });

  describe('Common Schemas', () => {
    it('should validate MongoDB ObjectId', () => {
      const validId = '507f1f77bcf86cd799439011';
      const { error } = commonSchemas.mongoId.validate(validId);
      expect(error).toBeUndefined();
    });

    it('should reject invalid ObjectId', () => {
      const invalidId = 'invalid-id';
      const { error } = commonSchemas.mongoId.validate(invalidId);
      expect(error).toBeDefined();
    });

    it('should validate pagination parameters', () => {
      const validPagination = {
        page: 2,
        limit: 10,
        sort: 'name',
        order: 'asc'
      };

      const { error } = commonSchemas.pagination.validate(validPagination);
      expect(error).toBeUndefined();
    });

    it('should apply default values for pagination', () => {
      const { value } = commonSchemas.pagination.validate({});
      expect(value.page).toBe(1);
      expect(value.limit).toBe(20);
      expect(value.order).toBe('desc');
    });
  });
});