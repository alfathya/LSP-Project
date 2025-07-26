// Authentication Manager
class AuthManager {
  constructor() {
    this.apiService = window.apiService;
    this.currentUser = null;
    this.isAuthenticated = false;
    this.isOfflineMode = false;
    this.reconnectInterval = null;
  }

  // Initialize auth functionality
  init() {
    // Show loading screen while checking auth
    this.showLoadingScreen();
    this.checkExistingAuth();
    this.setupEventListeners();
  }

  // Show loading screen
  showLoadingScreen() {
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
      loadingScreen.style.display = "flex";
      loadingScreen.classList.remove("hidden");
    }
  }

  // Hide loading screen
  hideLoadingScreen() {
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
      loadingScreen.classList.add("hidden");
      setTimeout(() => {
        loadingScreen.style.display = "none";
      }, 500);
    }
  } // Check if user is already authenticated
  async checkExistingAuth() {
    const token = this.apiService.getToken();
    const userData = localStorage.getItem("userData");
    
    console.log("checkExistingAuth - Token exists:", token ? "Yes" : "No");
    console.log("checkExistingAuth - UserData exists:", userData ? "Yes" : "No");

    if (token) {
      try {
        // Try to validate token by making a request to the server
        const isValidToken = await this.validateToken(token);
        console.log("Token validation result:", isValidToken);

        if (isValidToken) {
          this.isAuthenticated = true;
          console.log("Token valid, showing main app");
          console.log("Current user after validation:", this.currentUser);
          this.showMainApp();
        } else {
          // If token validation fails but we have userData, try fallback
          if (userData) {
            console.log("Token validation failed, but userData exists. Trying fallback...");
            try {
              this.currentUser = JSON.parse(userData);
              this.isAuthenticated = true;
              console.log("Using cached user data, showing main app");
              this.showMainApp();
              
              // Show a warning message that server might be down
               setTimeout(() => {
                 this.showMessage("Koneksi server terbatas. Beberapa fitur mungkin tidak tersedia.", "warning");
                 this.startReconnectAttempts();
               }, 2000);
            } catch (parseError) {
              console.error("Error parsing cached user data:", parseError);
              this.logout();
            }
          } else {
            console.log("No cached user data, logging out");
            this.logout();
          }
        }
      } catch (error) {
        console.error("Error validating token:", error);
        
        // If there's a network error but we have cached data, use it
        if (userData) {
          console.log("Network error, but userData exists. Using cached data...");
          try {
            this.currentUser = JSON.parse(userData);
            this.isAuthenticated = true;
            console.log("Using cached user data due to network error");
            this.showMainApp();
            
            // Show a warning message about network issues
             setTimeout(() => {
               this.showMessage("Tidak dapat terhubung ke server. Mode offline aktif.", "warning");
               this.startReconnectAttempts();
             }, 2000);
          } catch (parseError) {
            console.error("Error parsing cached user data:", parseError);
            this.logout();
          }
        } else {
          this.logout();
        }
      }
    } else {
      console.log("No token found");
      this.showAuthPages();
    }

    // Hide loading screen after auth check
    this.hideLoadingScreen();
  }

  // Validate token by making a test API call
  async validateToken(token) {
    try {
      console.log("Validating token:", token ? "Token exists" : "No token");

      // Try to get user info to validate token
      const response = await fetch(`${this.apiService.baseURL}/auth/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const responseText = await response.text();
        console.log("Raw response text:", responseText);

        // Check if response is valid JSON
        if (!responseText || responseText.trim() === "") {
          console.log("Empty response from server");
          return false;
        }

        try {
          const data = JSON.parse(responseText);
          console.log("Parsed data:", data);

          // Update user data if we get fresh data from server
          if (data.success && data.data) {
            // Map the server response fields to frontend format
            const userData = {
              id: data.data.id_user,
              nama: data.data.nama_pengguna,
              email: data.data.email,
              jenis_kelamin: data.data.jenis_kelamin,
              tahun_lahir: data.data.tahun_lahir,
            };

            localStorage.setItem("userData", JSON.stringify(userData));
            this.currentUser = userData;
            return true;
          }
          return false;
        } catch (parseError) {
          console.error(
            "JSON parse error:",
            parseError,
            "Response was:",
            responseText
          );
          return false;
        }
      } else {
        const errorText = await response.text();
        console.log(
          "Response not ok:",
          response.status,
          response.statusText,
          "Error:",
          errorText
        );
        return false;
      }
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    // Register form
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", (e) => this.handleRegister(e));
    }

    // Password confirmation validation
    const confirmPasswordInput = document.getElementById(
      "registerConfirmPassword"
    );
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener("input", () =>
        this.validatePasswordConfirmation()
      );
    }
  }

  // Handle login form submission
  async handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    // Validate inputs
    if (!email || !password) {
      this.showMessage("Mohon isi semua field", "error");
      return;
    }

    if (!this.isValidEmail(email)) {
      this.showMessage("Format email tidak valid", "error");
      return;
    }

    const loginBtn = document.querySelector("#loginForm .btn-auth");
    this.setButtonLoading(loginBtn, true);

    try {
      const response = await this.apiService.login({
        email: email,
        password: password,
      });

      if (response.success) {
        // Store auth data
        this.apiService.setToken(response.data.token);
        this.currentUser = response.data.user;
        this.isAuthenticated = true;

        // Store user data
        localStorage.setItem("userData", JSON.stringify(this.currentUser));

        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }

        this.showMessage("Login berhasil! Mengalihkan...", "success");

        // Redirect to main app after short delay
        setTimeout(() => {
          this.showMainApp();
        }, 1500);
      } else {
        throw new Error(response.message || "Login gagal");
      }
    } catch (error) {
      console.error("Login error:", error);
      this.showMessage(
        error.message || "Login gagal. Silakan coba lagi.",
        "error"
      );
    } finally {
      this.setButtonLoading(loginBtn, false);
    }
  }

  // Handle register form submission
  async handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById(
      "registerConfirmPassword"
    ).value;
    const agreeTerms = document.getElementById("agreeTerms").checked;

    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      this.showMessage("Mohon isi semua field", "error");
      return;
    }

    if (!this.isValidEmail(email)) {
      this.showMessage("Format email tidak valid", "error");
      return;
    }

    if (password.length < 6) {
      this.showMessage("Password minimal 6 karakter", "error");
      return;
    }

    if (password !== confirmPassword) {
      this.showMessage("Konfirmasi password tidak sesuai", "error");
      return;
    }

    if (!agreeTerms) {
      this.showMessage("Anda harus menyetujui syarat dan ketentuan", "error");
      return;
    }

    const registerBtn = document.querySelector("#registerForm .btn-auth");
    this.setButtonLoading(registerBtn, true);

    try {
      const response = await this.apiService.register({
        nama: name,
        email: email,
        password: password,
      });

      if (response.success) {
        this.showMessage("Registrasi berhasil! Silakan login.", "success");

        // Auto fill login form
        setTimeout(() => {
          document.getElementById("loginEmail").value = email;
          this.showLoginPage();
        }, 2000);
      } else {
        throw new Error(response.message || "Registrasi gagal");
      }
    } catch (error) {
      console.error("Register error:", error);
      this.showMessage(
        error.message || "Registrasi gagal. Silakan coba lagi.",
        "error"
      );
    } finally {
      this.setButtonLoading(registerBtn, false);
    }
  }

  // Validate password confirmation
  validatePasswordConfirmation() {
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById(
      "registerConfirmPassword"
    ).value;
    const confirmInput = document.getElementById("registerConfirmPassword");

    if (confirmPassword && password !== confirmPassword) {
      confirmInput.setCustomValidity("Password confirmation does not match");
      confirmInput.style.borderColor = "var(--error-color)";
    } else {
      confirmInput.setCustomValidity("");
      confirmInput.style.borderColor = "var(--border-color)";
    }
  }

  // Show login page
  showLoginPage() {
    const loginPage = document.getElementById("loginPage");
    const registerPage = document.getElementById("registerPage");

    registerPage.classList.remove("active");
    loginPage.classList.add("active");

    // Clear form
    document.getElementById("loginForm").reset();
    this.clearMessages();
  }

  // Show register page
  showRegisterPage() {
    const loginPage = document.getElementById("loginPage");
    const registerPage = document.getElementById("registerPage");

    loginPage.classList.remove("active");
    registerPage.classList.add("active");

    // Clear form
    document.getElementById("registerForm").reset();
    this.clearMessages();
  }

  // Show main application
  showMainApp() {
    const authContainer = document.getElementById("authContainer");
    const mainApp = document.getElementById("mainApp");
    const navbar = document.getElementById("navbar");

    // Hide loading screen first
    this.hideLoadingScreen();

    if (authContainer) authContainer.style.display = "none";
    if (mainApp) mainApp.style.display = "block";
    if (navbar) navbar.style.display = "block";

    // Initialize main app if available
    if (window.app && typeof window.app.init === "function") {
      window.app.init();
    }

    // Update UI with user info
    this.updateUserInterface();
  }

  // Show auth pages
  showAuthPages() {
    const authContainer = document.getElementById("authContainer");
    const mainApp = document.getElementById("mainApp");
    const navbar = document.getElementById("navbar");

    // Hide loading screen first
    this.hideLoadingScreen();

    if (authContainer) authContainer.style.display = "flex";
    if (mainApp) mainApp.style.display = "none";
    if (navbar) navbar.style.display = "none";
  }

  // Update user interface with user info
  updateUserInterface() {
    if (this.currentUser) {
      // Update profile information
      const profileElements = document.querySelectorAll(".user-name");
      profileElements.forEach((el) => {
        el.textContent = this.currentUser.nama || "User";
      });

      const emailElements = document.querySelectorAll(".user-email");
      emailElements.forEach((el) => {
        el.textContent = this.currentUser.email || "";
      });
    }
  }

  // Logout user
  async logout() {
    try {
      await this.apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local data
      this.apiService.removeToken();
      localStorage.removeItem("userData");
      localStorage.removeItem("rememberMe");

      this.currentUser = null;
      this.isAuthenticated = false;
      this.isOfflineMode = false;
      
      // Stop reconnect attempts
      this.stopReconnectAttempts();

      // Hide loading screen if showing
      this.hideLoadingScreen();

      // Redirect to auth pages
      this.showAuthPages();
      this.showLoginPage();
    }
  }

  // Utility methods
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  setButtonLoading(button, loading) {
    if (loading) {
      button.classList.add("loading");
      button.disabled = true;
    } else {
      button.classList.remove("loading");
      button.disabled = false;
    }
  }

  showMessage(message, type) {
    // Remove existing messages
    this.clearMessages();

    // Create message element
    const messageDiv = document.createElement("div");
    messageDiv.className = `auth-message ${type}`;
    messageDiv.textContent = message;

    // Find where to insert the message
    let targetContainer = null;
    
    // If we're in auth pages, insert in active form
    const activeForm = document.querySelector(".auth-page.active .auth-form");
    if (activeForm) {
      targetContainer = activeForm;
      activeForm.insertBefore(messageDiv, activeForm.firstChild);
    } else {
      // If we're in main app, create a notification at the top
      targetContainer = document.body;
      messageDiv.style.position = "fixed";
      messageDiv.style.top = "20px";
      messageDiv.style.left = "50%";
      messageDiv.style.transform = "translateX(-50%)";
      messageDiv.style.zIndex = "10000";
      messageDiv.style.minWidth = "300px";
      messageDiv.style.maxWidth = "500px";
      messageDiv.style.boxShadow = "var(--shadow-lg)";
      document.body.appendChild(messageDiv);
    }

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 5000);
  }

  clearMessages() {
    const messages = document.querySelectorAll(".auth-message");
    messages.forEach((msg) => {
      if (msg.parentNode) {
        msg.parentNode.removeChild(msg);
      }
    });
  }

  // Retry server connection
  async retryServerConnection() {
    try {
      const token = this.apiService.getToken();
      if (token) {
        const isValidToken = await this.validateToken(token);
        if (isValidToken) {
          this.showMessage("Koneksi server berhasil dipulihkan!", "success");
          this.isOfflineMode = false;
          this.stopReconnectAttempts();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Retry connection failed:", error);
      return false;
    }
  }

  // Start periodic reconnect attempts
  startReconnectAttempts() {
    if (this.reconnectInterval) {
      return; // Already running
    }

    this.isOfflineMode = true;
    console.log("Starting reconnect attempts...");
    
    this.reconnectInterval = setInterval(async () => {
      console.log("Attempting to reconnect to server...");
      const success = await this.retryServerConnection();
      if (success) {
        console.log("Reconnection successful!");
      }
    }, 30000); // Try every 30 seconds
  }

  // Stop periodic reconnect attempts
  stopReconnectAttempts() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
      console.log("Stopped reconnect attempts");
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if authenticated
  getIsAuthenticated() {
    return this.isAuthenticated;
  }
}

// Global functions for HTML onclick events
window.showLoginPage = function () {
  if (window.authManager) {
    window.authManager.showLoginPage();
  }
};

window.showRegisterPage = function () {
  if (window.authManager) {
    window.authManager.showRegisterPage();
  }
};

window.logout = function () {
  if (window.authManager) {
    window.authManager.logout();
  }
};

// Initialize Auth Manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Wait for API service to be ready
  const initAuth = () => {
    if (window.apiService) {
      window.authManager = new AuthManager();
      window.authManager.init();
    } else {
      // Retry after short delay
      setTimeout(initAuth, 100);
    }
  };

  initAuth();
});
