const jwt = require('jsonwebtoken');
const { authenticate, requireRole, requireAdmin, JWT_SECRET } = require('../src/middleware/auth');
const User = require('../src/models/User');

describe('Authentication & Role-Based Access Control (RBAC) Middleware', () => {
  describe('JWT Verification Middleware', () => {
    test('rejects request with 401 when Authorization header is missing', async () => {
      const req = { headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringMatching(/Missing or malformed/i) })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('rejects request with 401 when token is invalid or corrupted', async () => {
      const req = { headers: { authorization: 'Bearer invalid.token.value' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringMatching(/Invalid or expired/i) })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('authenticates successfully when token is valid and user exists', async () => {
      const mockUser = {
        _id: '64b1f2e5a7b8c9d0e1f2a3b4',
        username: 'alice',
        role: 'user',
      };
      const token = jwt.sign({ id: mockUser._id, role: mockUser.role }, JWT_SECRET);

      const findByIdSpy = jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await authenticate(req, res, next);

      expect(findByIdSpy).toHaveBeenCalledWith(mockUser._id);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();

      findByIdSpy.mockRestore();
    });
  });

  describe('Role-Based Access Control Middleware', () => {
    test('blocks non-admin user with 403 Forbidden', () => {
      const req = { user: { role: 'user' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringMatching(/Forbidden/i) })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('allows admin user through to next()', () => {
      const req = { user: { role: 'admin' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
