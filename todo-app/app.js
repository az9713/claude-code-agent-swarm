// Auth Token Management
const auth = {
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'auth_user',

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  setToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  },

  getUser() {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  setUser(user) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  clearUser() {
    localStorage.removeItem(this.USER_KEY);
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};

// Fetch wrapper with auth headers
async function fetchWithAuth(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...auth.getAuthHeaders(),
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });

  // Handle 401/403 - token expired or invalid
  if (response.status === 401 || response.status === 403) {
    auth.clearToken();
    auth.clearUser();
    if (typeof authUI !== 'undefined') {
      authUI.showUnauthenticatedState();
    }
    throw new Error('Session expired. Please log in again.');
  }

  return response;
}

// DOM Elements
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const filterButtons = document.querySelectorAll('.filter-btn');
const taskSummary = document.getElementById('task-summary');

// State
let todos = [];
let currentFilter = 'all';

// Load todos from server
async function loadTodos() {
  if (!auth.isAuthenticated()) {
    todos = [];
    renderTodos();
    return;
  }

  try {
    const response = await fetchWithAuth('/api/todos');
    if (response.ok) {
      todos = await response.json();
      renderTodos();
    }
  } catch (error) {
    console.error('Failed to load todos:', error);
    announceToScreenReader('Failed to load tasks');
  }
}

// Clear todos (used on logout)
function clearTodos() {
  todos = [];
  renderTodos();
}

// Get filtered todos based on current filter
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// Update task count summary
function updateTaskSummary() {
    const total = todos.length;
    const active = todos.filter(todo => !todo.completed).length;
    const completed = total - active;

    if (total === 0) {
        taskSummary.textContent = 'No tasks yet';
    } else {
        taskSummary.textContent = `${active} active, ${completed} completed of ${total} total`;
    }
}

// Render empty state
function renderEmptyState(message) {
    const emptyDiv = document.createElement('li');
    emptyDiv.className = 'empty-state';
    emptyDiv.setAttribute('role', 'listitem');
    emptyDiv.innerHTML = `
        <div class="empty-state-icon" aria-hidden="true">&#9744;</div>
        <p class="empty-state-text">${message}</p>
    `;
    list.appendChild(emptyDiv);
}

// Render todos
function renderTodos() {
    list.innerHTML = '';
    const filteredTodos = getFilteredTodos();

    if (filteredTodos.length === 0) {
        if (todos.length === 0) {
            renderEmptyState('Add your first task above');
        } else if (currentFilter === 'active') {
            renderEmptyState('No active tasks');
        } else if (currentFilter === 'completed') {
            renderEmptyState('No completed tasks');
        }
        updateTaskSummary();
        return;
    }

    filteredTodos.forEach((todo) => {
        // Find the original index in the todos array
        const originalIndex = todos.indexOf(todo);

        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.completed ? ' completed' : '');
        li.setAttribute('role', 'listitem');
        li.setAttribute('data-index', originalIndex);

        // Checkbox wrapper for custom styling
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'checkbox-wrapper';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.id = `todo-${originalIndex}`;
        checkbox.setAttribute('aria-label', `Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`);
        checkbox.addEventListener('change', () => toggleTodo(originalIndex));

        const checkboxCustom = document.createElement('span');
        checkboxCustom.className = 'checkbox-custom';
        checkboxCustom.setAttribute('aria-hidden', 'true');

        checkboxWrapper.appendChild(checkbox);
        checkboxWrapper.appendChild(checkboxCustom);

        const label = document.createElement('span');
        label.textContent = todo.text;
        label.id = `todo-label-${originalIndex}`;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.setAttribute('aria-label', `Delete task: ${todo.text}`);
        deleteBtn.addEventListener('click', () => deleteTodo(originalIndex, li));

        li.appendChild(checkboxWrapper);
        li.appendChild(label);
        li.appendChild(deleteBtn);

        // Keyboard navigation within item
        li.addEventListener('keydown', (e) => handleItemKeydown(e, originalIndex, li));

        list.appendChild(li);
    });

    updateTaskSummary();
}

// Handle keyboard navigation within todo items
function handleItemKeydown(e, index, li) {
    switch (e.key) {
        case 'Delete':
        case 'Backspace':
            if (e.target.tagName !== 'INPUT' || e.target.type === 'checkbox') {
                e.preventDefault();
                deleteTodo(index, li);
            }
            break;
        case ' ':
            if (e.target.tagName !== 'BUTTON') {
                e.preventDefault();
                toggleTodo(index);
            }
            break;
        case 'ArrowUp':
            e.preventDefault();
            focusPreviousItem(li);
            break;
        case 'ArrowDown':
            e.preventDefault();
            focusNextItem(li);
            break;
    }
}

// Focus navigation helpers
function focusPreviousItem(currentItem) {
    const prev = currentItem.previousElementSibling;
    if (prev && prev.classList.contains('todo-item')) {
        prev.querySelector('input[type="checkbox"]').focus();
    }
}

function focusNextItem(currentItem) {
    const next = currentItem.nextElementSibling;
    if (next && next.classList.contains('todo-item')) {
        next.querySelector('input[type="checkbox"]').focus();
    }
}

// Add a new todo
async function addTodo(text) {
    if (!auth.isAuthenticated()) {
        announceToScreenReader('Please log in to add tasks');
        return;
    }

    try {
        const response = await fetchWithAuth('/api/todos', {
            method: 'POST',
            body: JSON.stringify({ text })
        });

        if (response.ok) {
            const newTodo = await response.json();
            todos.push(newTodo);
            renderTodos();
            announceToScreenReader(`Task "${text}" added`);
        } else {
            const error = await response.json();
            announceToScreenReader(error.error || 'Failed to add task');
        }
    } catch (error) {
        console.error('Failed to add todo:', error);
        announceToScreenReader('Failed to add task');
    }
}

// Toggle todo completion
async function toggleTodo(index) {
    const todo = todos[index];
    const newCompleted = !todo.completed;

    try {
        const response = await fetchWithAuth(`/api/todos/${todo.id}`, {
            method: 'PUT',
            body: JSON.stringify({ completed: newCompleted })
        });

        if (response.ok) {
            todo.completed = newCompleted;
            renderTodos();
            const status = todo.completed ? 'completed' : 'marked as active';
            announceToScreenReader(`Task "${todo.text}" ${status}`);
        } else {
            const error = await response.json();
            announceToScreenReader(error.error || 'Failed to update task');
        }
    } catch (error) {
        console.error('Failed to toggle todo:', error);
        announceToScreenReader('Failed to update task');
    }
}

// Delete a todo with animation
async function deleteTodo(index, li) {
    const todo = todos[index];
    const todoText = todo.text;

    try {
        const response = await fetchWithAuth(`/api/todos/${todo.id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            if (li) {
                li.classList.add('removing');
                li.addEventListener('animationend', () => {
                    todos.splice(index, 1);
                    renderTodos();
                }, { once: true });
            } else {
                todos.splice(index, 1);
                renderTodos();
            }
            announceToScreenReader(`Task "${todoText}" deleted`);
        } else {
            const error = await response.json();
            announceToScreenReader(error.error || 'Failed to delete task');
        }
    } catch (error) {
        console.error('Failed to delete todo:', error);
        announceToScreenReader('Failed to delete task');
    }
}

// Set active filter
function setFilter(filter) {
    currentFilter = filter;

    // Update button states
    filterButtons.forEach(btn => {
        const isActive = btn.dataset.filter === filter;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
    });

    renderTodos();

    // Announce to screen readers
    const filterName = filter.charAt(0).toUpperCase() + filter.slice(1);
    announceToScreenReader(`Showing ${filterName} tasks`);
}

// Screen reader announcements
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'visually-hidden';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Event Listeners

// Form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) {
        await addTodo(text);
        input.value = '';
        input.focus();
    }
});

// Filter buttons
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

// Global keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + 1/2/3 for quick filter switching
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        switch (e.key) {
            case '1':
                e.preventDefault();
                setFilter('all');
                break;
            case '2':
                e.preventDefault();
                setFilter('active');
                break;
            case '3':
                e.preventDefault();
                setFilter('completed');
                break;
        }
    }

    // / to focus search/input
    if (e.key === '/' && document.activeElement !== input) {
        e.preventDefault();
        input.focus();
    }

    // Escape to clear input focus
    if (e.key === 'Escape' && document.activeElement === input) {
        input.blur();
    }
});

// Initialize
if (auth.isAuthenticated()) {
    loadTodos();
} else {
    renderTodos();
}
