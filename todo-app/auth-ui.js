// Auth UI Module
// Handles login/register forms and auth state display

const authUI = {
  // Initialize auth UI
  init() {
    this.authContainer = document.getElementById('auth-container');
    this.appContainer = document.getElementById('app-container');
    this.userInfo = document.getElementById('user-info');
    this.userEmail = document.getElementById('user-email');
    this.logoutBtn = document.getElementById('logout-btn');
    this.authForm = document.getElementById('auth-form');
    this.authTitle = document.getElementById('auth-title');
    this.authSubmit = document.getElementById('auth-submit');
    this.authToggle = document.getElementById('auth-toggle');
    this.authToggleLink = document.getElementById('auth-toggle-link');
    this.emailInput = document.getElementById('auth-email');
    this.passwordInput = document.getElementById('auth-password');
    this.authError = document.getElementById('auth-error');

    this.isLoginMode = true;

    this.bindEvents();
    this.checkAuthState();
  },

  // Bind event listeners
  bindEvents() {
    this.authForm.addEventListener('submit', (e) => this.handleAuthSubmit(e));
    this.authToggleLink.addEventListener('click', (e) => this.toggleAuthMode(e));
    this.logoutBtn.addEventListener('click', () => this.handleLogout());
  },

  // Toggle between login and register modes
  toggleAuthMode(e) {
    e.preventDefault();
    this.isLoginMode = !this.isLoginMode;
    this.updateAuthForm();
    this.clearError();
  },

  // Update form display based on mode
  updateAuthForm() {
    if (this.isLoginMode) {
      this.authTitle.textContent = 'Login';
      this.authSubmit.textContent = 'Login';
      this.authToggle.innerHTML = 'Don\'t have an account? <a href="#" id="auth-toggle-link">Register</a>';
    } else {
      this.authTitle.textContent = 'Register';
      this.authSubmit.textContent = 'Register';
      this.authToggle.innerHTML = 'Already have an account? <a href="#" id="auth-toggle-link">Login</a>';
    }
    // Rebind toggle link
    this.authToggleLink = document.getElementById('auth-toggle-link');
    this.authToggleLink.addEventListener('click', (e) => this.toggleAuthMode(e));
  },

  // Handle form submission
  async handleAuthSubmit(e) {
    e.preventDefault();
    this.clearError();

    const email = this.emailInput.value.trim();
    const password = this.passwordInput.value;

    if (!email || !password) {
      this.showError('Email and password are required');
      return;
    }

    this.authSubmit.disabled = true;
    this.authSubmit.textContent = this.isLoginMode ? 'Logging in...' : 'Registering...';

    try {
      if (this.isLoginMode) {
        await this.login(email, password);
      } else {
        await this.register(email, password);
      }
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.authSubmit.disabled = false;
      this.authSubmit.textContent = this.isLoginMode ? 'Login' : 'Register';
    }
  },

  // Login API call
  async login(email, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    auth.setToken(data.token);
    auth.setUser(data.user);
    this.showAuthenticatedState();

    // Reload todos for the logged-in user
    if (typeof loadTodos === 'function') {
      loadTodos();
    }
  },

  // Register API call
  async register(email, password) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    // Auto-login after successful registration
    await this.login(email, password);
  },

  // Handle logout
  async handleLogout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: auth.getAuthHeaders()
      });
    } catch (error) {
      // Ignore errors, we'll clear local state anyway
    }

    auth.clearToken();
    auth.clearUser();
    this.showUnauthenticatedState();

    // Clear todos display
    if (typeof clearTodos === 'function') {
      clearTodos();
    }
  },

  // Check initial auth state
  checkAuthState() {
    if (auth.isAuthenticated()) {
      this.showAuthenticatedState();
    } else {
      this.showUnauthenticatedState();
    }
  },

  // Show authenticated state (hide login, show app)
  showAuthenticatedState() {
    const user = auth.getUser();
    this.userEmail.textContent = user ? user.email : '';
    this.authContainer.classList.add('hidden');
    this.appContainer.classList.remove('hidden');
    this.userInfo.classList.remove('hidden');
  },

  // Show unauthenticated state (show login, hide app)
  showUnauthenticatedState() {
    this.authContainer.classList.remove('hidden');
    this.appContainer.classList.add('hidden');
    this.userInfo.classList.add('hidden');
    this.emailInput.value = '';
    this.passwordInput.value = '';
    this.isLoginMode = true;
    this.updateAuthForm();
  },

  // Show error message
  showError(message) {
    this.authError.textContent = message;
    this.authError.classList.remove('hidden');
  },

  // Clear error message
  clearError() {
    this.authError.textContent = '';
    this.authError.classList.add('hidden');
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  authUI.init();
});
