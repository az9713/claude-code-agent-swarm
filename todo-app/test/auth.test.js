/**
 * Auth Unit Tests
 * Tests for password hashing and JWT token generation/verification
 */

const assert = require('assert');
const { describe, it } = require('node:test');
const { hashPassword, comparePassword } = require('../utils/password');
const { authenticateToken, generateToken, JWT_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should return a hashed password different from the original', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      assert.notStrictEqual(hash, password);
      assert.ok(hash.length > 0);
    });

    it('should return different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      assert.notStrictEqual(hash1, hash2);
    });

    it('should handle empty password', async () => {
      const hash = await hashPassword('');
      assert.ok(hash.length > 0);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const result = await comparePassword(password, hash);

      assert.strictEqual(result, true);
    });

    it('should return false for non-matching password and hash', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword123';
      const hash = await hashPassword(password);
      const result = await comparePassword(wrongPassword, hash);

      assert.strictEqual(result, false);
    });

    it('should handle special characters in password', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await hashPassword(password);
      const result = await comparePassword(password, hash);

      assert.strictEqual(result, true);
    });

    it('should handle unicode characters in password', async () => {
      const password = 'password';
      const hash = await hashPassword(password);
      const result = await comparePassword(password, hash);

      assert.strictEqual(result, true);
    });
  });
});

describe('JWT Token Utilities', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const user = { id: 1, email: 'test@example.com' };
      const token = generateToken(user);

      assert.ok(token);
      assert.ok(typeof token === 'string');
      assert.ok(token.split('.').length === 3);
    });

    it('should include user id and email in token payload', () => {
      const user = { id: 1, email: 'test@example.com' };
      const token = generateToken(user);
      const decoded = jwt.verify(token, JWT_SECRET);

      assert.strictEqual(decoded.id, user.id);
      assert.strictEqual(decoded.email, user.email);
    });

    it('should set token expiration', () => {
      const user = { id: 1, email: 'test@example.com' };
      const token = generateToken(user);
      const decoded = jwt.verify(token, JWT_SECRET);

      assert.ok(decoded.exp);
      assert.ok(decoded.exp > decoded.iat);
    });
  });

  describe('authenticateToken middleware', () => {
    it('should return 401 when no token is provided', () => {
      const req = { headers: {} };
      const res = {
        statusCode: null,
        jsonData: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.jsonData = data;
          return this;
        }
      };
      const next = () => {};

      authenticateToken(req, res, next);

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.jsonData.error, 'Authentication required');
    });

    it('should return 403 for invalid token', () => {
      const req = { headers: { authorization: 'Bearer invalidtoken' } };
      const res = {
        statusCode: null,
        jsonData: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.jsonData = data;
          return this;
        }
      };
      const next = () => {};

      authenticateToken(req, res, next);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.jsonData.error, 'Invalid or expired token');
    });

    it('should call next and set req.user for valid token', async () => {
      const user = { id: 1, email: 'test@example.com' };
      const token = generateToken(user);
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = {};
      let nextCalled = false;

      const next = () => {
        nextCalled = true;
      };

      authenticateToken(req, res, next);

      // Wait for async jwt.verify to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      assert.strictEqual(nextCalled, true);
      assert.ok(req.user);
      assert.strictEqual(req.user.id, user.id);
      assert.strictEqual(req.user.email, user.email);
    });

    it('should return 403 for expired token', () => {
      const expiredToken = jwt.sign(
        { id: 1, email: 'test@example.com' },
        JWT_SECRET,
        { expiresIn: '-1h' }
      );
      const req = { headers: { authorization: `Bearer ${expiredToken}` } };
      const res = {
        statusCode: null,
        jsonData: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.jsonData = data;
          return this;
        }
      };
      const next = () => {};

      authenticateToken(req, res, next);

      assert.strictEqual(res.statusCode, 403);
    });
  });
});
