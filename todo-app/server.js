const express = require('express');
const fs = require('fs');
const path = require('path');
const authRoutes = require('./routes/auth');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'todos.json');

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Helper functions to read/write todos
function readTodos() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { todos: [], nextId: 1 };
  }
}

function writeTodos(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Protected API Routes - All todo routes require authentication

// GET /api/todos - List user's todos
app.get('/api/todos', authenticateToken, (req, res) => {
  const data = readTodos();
  const userTodos = data.todos.filter(todo => todo.userId === req.user.id);
  res.json(userTodos);
});

// POST /api/todos - Create a new todo
app.post('/api/todos', authenticateToken, (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: 'Todo text is required' });
  }

  const data = readTodos();
  const newTodo = {
    id: data.nextId,
    userId: req.user.id,
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  data.todos.push(newTodo);
  data.nextId++;
  writeTodos(data);

  res.status(201).json(newTodo);
});

// PUT /api/todos/:id - Update a todo
app.put('/api/todos/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { text, completed } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid todo ID' });
  }

  const data = readTodos();
  const todoIndex = data.todos.findIndex(
    todo => todo.id === id && todo.userId === req.user.id
  );

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  if (text !== undefined) {
    if (typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'Todo text cannot be empty' });
    }
    data.todos[todoIndex].text = text.trim();
  }

  if (completed !== undefined) {
    data.todos[todoIndex].completed = Boolean(completed);
  }

  data.todos[todoIndex].updatedAt = new Date().toISOString();
  writeTodos(data);

  res.json(data.todos[todoIndex]);
});

// DELETE /api/todos/:id - Delete a todo
app.delete('/api/todos/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid todo ID' });
  }

  const data = readTodos();
  const todoIndex = data.todos.findIndex(
    todo => todo.id === id && todo.userId === req.user.id
  );

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const deletedTodo = data.todos.splice(todoIndex, 1)[0];
  writeTodos(data);

  res.json(deletedTodo);
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Todo app server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
