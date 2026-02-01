/**
 * Integration Tests
 * Full auth flow and protected endpoint tests
 */

const assert = require('assert');
const { describe, it, before, after, beforeEach } = require('node:test');
const request = require('supertest');
const fs = require('fs');
const path = require('path');

const app = require('../server');

// Test data file paths
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
const TODOS_FILE = path.join(__dirname, '..', 'data', 'todos.json');

// Backup original data
let originalUsers = null;
let originalTodos = null;

describe('Integration Tests', () => {
  before(() => {
    // Backup original data
    try {
      originalUsers = fs.readFileSync(USERS_FILE, 'utf8');
    } catch (e) {
      originalUsers = JSON.stringify({ users: [], nextId: 1 });
    }
    try {
      originalTodos = fs.readFileSync(TODOS_FILE, 'utf8');
    } catch (e) {
      originalTodos = JSON.stringify({ todos: [], nextId: 1 });
    }
  });

  after(() => {
    // Restore original data
    if (originalUsers) {
      fs.writeFileSync(USERS_FILE, originalUsers);
    }
    if (originalTodos) {
      fs.writeFileSync(TODOS_FILE, originalTodos);
    }
  });

  beforeEach(() => {
    // Reset test data before each test
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [], nextId: 1 }));
    fs.writeFileSync(TODOS_FILE, JSON.stringify({ todos: [], nextId: 1 }));
  });

  describe('Auth Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', async () => {
        const res = await request(app)
          .post('/api/auth/register')
          .send({ email: 'test@example.com', password: 'password123' });

        assert.strictEqual(res.status, 201);
        assert.ok(res.body.id);
        assert.strictEqual(res.body.email, 'test@example.com');
        assert.ok(res.body.createdAt);
      });

      it('should reject registration with missing email', async () => {
        const res = await request(app)
          .post('/api/auth/register')
          .send({ password: 'password123' });

        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'Email and password are required');
      });

      it('should reject registration with missing password', async () => {
        const res = await request(app)
          .post('/api/auth/register')
          .send({ email: 'test@example.com' });

        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'Email and password are required');
      });

      it('should reject registration with invalid email format', async () => {
        const res = await request(app)
          .post('/api/auth/register')
          .send({ email: 'invalid-email', password: 'password123' });

        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'Invalid email format');
      });

      it('should reject registration with short password', async () => {
        const res = await request(app)
          .post('/api/auth/register')
          .send({ email: 'test@example.com', password: '1234567' });

        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'Password must be at least 8 characters');
      });

      it('should reject duplicate email registration', async () => {
        await request(app)
          .post('/api/auth/register')
          .send({ email: 'test@example.com', password: 'password123' });

        const res = await request(app)
          .post('/api/auth/register')
          .send({ email: 'test@example.com', password: 'password456' });

        assert.strictEqual(res.status, 409);
        assert.strictEqual(res.body.error, 'Email already registered');
      });

      it('should normalize email to lowercase', async () => {
        const res = await request(app)
          .post('/api/auth/register')
          .send({ email: 'TEST@EXAMPLE.COM', password: 'password123' });

        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.email, 'test@example.com');
      });
    });

    describe('POST /api/auth/login', () => {
      beforeEach(async () => {
        await request(app)
          .post('/api/auth/register')
          .send({ email: 'test@example.com', password: 'password123' });
      });

      it('should login successfully with correct credentials', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'password123' });

        assert.strictEqual(res.status, 200);
        assert.ok(res.body.token);
        assert.ok(res.body.user);
        assert.strictEqual(res.body.user.email, 'test@example.com');
      });

      it('should reject login with wrong password', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'wrongpassword' });

        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.body.error, 'Invalid credentials');
      });

      it('should reject login with non-existent email', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({ email: 'nonexistent@example.com', password: 'password123' });

        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.body.error, 'Invalid credentials');
      });

      it('should login with case-insensitive email', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({ email: 'TEST@EXAMPLE.COM', password: 'password123' });

        assert.strictEqual(res.status, 200);
        assert.ok(res.body.token);
      });
    });

    describe('GET /api/auth/me', () => {
      let authToken;

      beforeEach(async () => {
        await request(app)
          .post('/api/auth/register')
          .send({ email: 'test@example.com', password: 'password123' });

        const loginRes = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'password123' });

        authToken = loginRes.body.token;
      });

      it('should return current user info with valid token', async () => {
        const res = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${authToken}`);

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.email, 'test@example.com');
        assert.ok(res.body.id);
      });

      it('should reject request without token', async () => {
        const res = await request(app)
          .get('/api/auth/me');

        assert.strictEqual(res.status, 401);
      });

      it('should reject request with invalid token', async () => {
        const res = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer invalidtoken');

        assert.strictEqual(res.status, 403);
      });
    });
  });

  describe('Protected Todo Endpoints', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      authToken = loginRes.body.token;
      userId = loginRes.body.user.id;
    });

    describe('GET /api/todos', () => {
      it('should return empty array for new user', async () => {
        const res = await request(app)
          .get('/api/todos')
          .set('Authorization', `Bearer ${authToken}`);

        assert.strictEqual(res.status, 200);
        assert.deepStrictEqual(res.body, []);
      });

      it('should reject unauthenticated request', async () => {
        const res = await request(app)
          .get('/api/todos');

        assert.strictEqual(res.status, 401);
      });

      it('should only return todos belonging to the authenticated user', async () => {
        // Create todo for first user
        await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ text: 'User 1 todo' });

        // Register and login second user
        await request(app)
          .post('/api/auth/register')
          .send({ email: 'user2@example.com', password: 'password123' });

        const user2Login = await request(app)
          .post('/api/auth/login')
          .send({ email: 'user2@example.com', password: 'password123' });

        // Create todo for second user
        await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${user2Login.body.token}`)
          .send({ text: 'User 2 todo' });

        // Get todos for first user
        const res = await request(app)
          .get('/api/todos')
          .set('Authorization', `Bearer ${authToken}`);

        assert.strictEqual(res.body.length, 1);
        assert.strictEqual(res.body[0].text, 'User 1 todo');
      });
    });

    describe('POST /api/todos', () => {
      it('should create a new todo', async () => {
        const res = await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ text: 'New todo item' });

        assert.strictEqual(res.status, 201);
        assert.ok(res.body.id);
        assert.strictEqual(res.body.text, 'New todo item');
        assert.strictEqual(res.body.completed, false);
        assert.strictEqual(res.body.userId, userId);
      });

      it('should reject empty todo text', async () => {
        const res = await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ text: '' });

        assert.strictEqual(res.status, 400);
      });

      it('should reject missing todo text', async () => {
        const res = await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${authToken}`)
          .send({});

        assert.strictEqual(res.status, 400);
      });

      it('should trim whitespace from todo text', async () => {
        const res = await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ text: '  trimmed text  ' });

        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.text, 'trimmed text');
      });
    });

    describe('PUT /api/todos/:id', () => {
      let todoId;

      beforeEach(async () => {
        const createRes = await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ text: 'Original todo' });

        todoId = createRes.body.id;
      });

      it('should update todo text', async () => {
        const res = await request(app)
          .put(`/api/todos/${todoId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ text: 'Updated todo' });

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.text, 'Updated todo');
      });

      it('should update todo completed status', async () => {
        const res = await request(app)
          .put(`/api/todos/${todoId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ completed: true });

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.completed, true);
      });

      it('should reject update for non-existent todo', async () => {
        const res = await request(app)
          .put('/api/todos/9999')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ text: 'Updated' });

        assert.strictEqual(res.status, 404);
      });

      it('should not allow updating another user\'s todo', async () => {
        // Register and login second user
        await request(app)
          .post('/api/auth/register')
          .send({ email: 'user2@example.com', password: 'password123' });

        const user2Login = await request(app)
          .post('/api/auth/login')
          .send({ email: 'user2@example.com', password: 'password123' });

        const res = await request(app)
          .put(`/api/todos/${todoId}`)
          .set('Authorization', `Bearer ${user2Login.body.token}`)
          .send({ text: 'Hacked' });

        assert.strictEqual(res.status, 404);
      });
    });

    describe('DELETE /api/todos/:id', () => {
      let todoId;

      beforeEach(async () => {
        const createRes = await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ text: 'Todo to delete' });

        todoId = createRes.body.id;
      });

      it('should delete a todo', async () => {
        const res = await request(app)
          .delete(`/api/todos/${todoId}`)
          .set('Authorization', `Bearer ${authToken}`);

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.id, todoId);

        // Verify deletion
        const getRes = await request(app)
          .get('/api/todos')
          .set('Authorization', `Bearer ${authToken}`);

        assert.strictEqual(getRes.body.length, 0);
      });

      it('should reject deletion of non-existent todo', async () => {
        const res = await request(app)
          .delete('/api/todos/9999')
          .set('Authorization', `Bearer ${authToken}`);

        assert.strictEqual(res.status, 404);
      });

      it('should not allow deleting another user\'s todo', async () => {
        // Register and login second user
        await request(app)
          .post('/api/auth/register')
          .send({ email: 'user2@example.com', password: 'password123' });

        const user2Login = await request(app)
          .post('/api/auth/login')
          .send({ email: 'user2@example.com', password: 'password123' });

        const res = await request(app)
          .delete(`/api/todos/${todoId}`)
          .set('Authorization', `Bearer ${user2Login.body.token}`);

        assert.strictEqual(res.status, 404);
      });
    });
  });
});
