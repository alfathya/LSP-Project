// API Service untuk TummyMate
class APIService {
  constructor() {
    this.baseURL = "http://localhost:3001";
    this.token = localStorage.getItem("authToken");
    this.isRefreshingToken = false;
    this.refreshPromise = null;
    
    // Check if we have valid authentication
    this.checkAuthentication();
  }

  // Check authentication status
  async checkAuthentication() {
    if (!this.token) {
      console.log("No auth token found, attempting auto-login...");
      await this.attemptAutoLogin();
    } else {
      console.log("Auth token found, testing connection...");
      await this.testConnection();
    }
  }

  // Attempt automatic login with demo credentials
  async attemptAutoLogin() {
    try {
      console.log("Attempting auto-login with demo credentials...");
      const loginResponse = await this.login({
        email: "demo@tummymate.com",
        password: "demo123"
      });
      
      if (loginResponse.success) {
        console.log("✅ Auto-login successful");
        this.setToken(loginResponse.data.token);
        return true;
      } else {
        console.log("❌ Auto-login failed, trying to register demo user...");
        return await this.attemptAutoRegister();
      }
    } catch (error) {
      console.log("❌ Auto-login error:", error.message);
      return await this.attemptAutoRegister();
    }
  }

  // Attempt to register demo user if login fails
  async attemptAutoRegister() {
    try {
      console.log("Attempting to register demo user...");
      const registerResponse = await this.register({
        name: "Demo User",
        email: "demo@tummymate.com",
        password: "demo123"
      });
      
      if (registerResponse.success) {
        console.log("✅ Demo user registered successfully");
        this.setToken(registerResponse.data.token);
        return true;
      } else {
        console.log("❌ Demo user registration failed");
        return false;
      }
    } catch (error) {
      console.log("❌ Demo user registration error:", error.message);
      return false;
    }
  }

  // Login method
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Register method
  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  }

  // Test API connection
  async testConnection() {
    try {
      console.log("Testing API connection...");
      const response = await fetch(`${this.baseURL}/auth/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      if (response.ok) {
        console.log("✅ API connection successful");
        const data = await response.json();
        console.log("User data:", data);
        return true;
      } else if (response.status === 401 || response.status === 403) {
        console.log("❌ Token expired or invalid, attempting refresh...");
        return await this.handleTokenExpiration();
      } else {
        console.log("❌ API connection failed:", response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.log("❌ API connection error:", error.message);
      console.log("Make sure the backend server is running on http://localhost:3001");
      return false;
    }
  }

  // Handle token expiration
  async handleTokenExpiration() {
    if (this.isRefreshingToken) {
      // If already refreshing, wait for the existing refresh to complete
      return await this.refreshPromise;
    }

    this.isRefreshingToken = true;
    this.refreshPromise = this.refreshToken();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshingToken = false;
      this.refreshPromise = null;
    }
  }

  // Refresh token by re-authenticating
  async refreshToken() {
    console.log("🔄 Refreshing authentication...");
    
    // Clear current token
    this.removeToken();
    
    // Attempt auto-login again
    const success = await this.attemptAutoLogin();
    
    if (success) {
      console.log("✅ Token refreshed successfully");
      return true;
    } else {
      console.log("❌ Token refresh failed");
      // Redirect to login page or show login modal
      this.handleAuthenticationFailure();
      return false;
    }
  }

  // Handle authentication failure
  handleAuthenticationFailure() {
    console.log("🚨 Authentication failed, user needs to login");
    
    // Show a user-friendly message
    if (window.app && typeof window.app.showMessage === 'function') {
      window.app.showMessage("Sesi telah berakhir. Silakan login kembali.", "error");
    }
    
    // You could redirect to login page here
    // window.location.href = '/login.html';
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem("authToken", token);
  }

  // Get authentication token
  getToken() {
    return this.token || localStorage.getItem("authToken");
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    localStorage.removeItem("authToken");
  }

  // Generic HTTP request method with automatic token refresh
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // First attempt
    let response = await this.makeRequest(url, options);
    
    // If unauthorized and not already retrying, try to refresh token
    if ((response.status === 401 || response.status === 403) && !options._isRetry) {
      console.log("🔄 Request failed with auth error, attempting token refresh...");
      
      const refreshSuccess = await this.handleTokenExpiration();
      
      if (refreshSuccess) {
        // Retry the request with new token
        options._isRetry = true;
        response = await this.makeRequest(url, options);
      }
    }
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || `HTTP error! status: ${response.status}`
      );
    }

    return data;
  }

  // Make HTTP request
  async makeRequest(url, options = {}) {
    const token = this.getToken();

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      return await fetch(url, config);
    } catch (error) {
      console.error("Network request error:", error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }

  // ====== JAJAN LOG API METHODS ======

  // Get all jajan logs
  async getJajanLogs() {
    return this.get("/jajanlog");
  }

  // Create new jajan log
  async createJajanLog(jajanData) {
    // Format tanggal to proper ISO-8601 DateTime
    let formattedDate = jajanData.tanggal;
    if (jajanData.tanggal && !jajanData.tanggal.includes("Z")) {
      // If it's datetime-local format (YYYY-MM-DDTHH:MM), convert to proper ISO format
      if (jajanData.tanggal.includes("T")) {
        // Create a Date object from the local datetime and convert to ISO string
        const localDate = new Date(jajanData.tanggal);
        formattedDate = localDate.toISOString();
      } else {
        // If it's just a date (YYYY-MM-DD), add time and convert to ISO
        const localDate = new Date(jajanData.tanggal + "T12:00:00");
        formattedDate = localDate.toISOString();
      }
    }

    const payload = {
      nama: jajanData.nama_jajan,
      tanggal: formattedDate,
      kategori: jajanData.kategori_jajan,
      tempat: jajanData.tempat_jajan,
      harga: jajanData.harga_jajanan,
    };
    console.log("Creating jajan log with payload:", payload);
    return this.post("/jajanlog", payload);
  }

  // Update jajan log
  async updateJajanLog(id, jajanData) {
    // Format tanggal to proper ISO-8601 DateTime
    let formattedDate = jajanData.tanggal;
    if (jajanData.tanggal && !jajanData.tanggal.includes("Z")) {
      // If it's datetime-local format (YYYY-MM-DDTHH:MM), convert to proper ISO format
      if (jajanData.tanggal.includes("T")) {
        // Create a Date object from the local datetime and convert to ISO string
        const localDate = new Date(jajanData.tanggal);
        formattedDate = localDate.toISOString();
      } else {
        // If it's just a date (YYYY-MM-DD), add time and convert to ISO
        const localDate = new Date(jajanData.tanggal + "T12:00:00");
        formattedDate = localDate.toISOString();
      }
    }

    const payload = {
      nama: jajanData.nama_jajan,
      tanggal: formattedDate,
      kategori: jajanData.kategori_jajan,
      tempat: jajanData.tempat_jajan,
      harga: jajanData.harga_jajanan,
    };
    console.log("Updating jajan log with payload:", payload);
    return this.put(`/jajanlog/${id}`, payload);
  }

  // ====== SHOPPING API METHODS ======

  // Get all shopping logs
  async getShoppingLogs() {
    return this.get("/shopping");
  }

  // Create new shopping log
  async createShoppingLog(shoppingData) {
    return this.post("/shopping", shoppingData);
  }

  // Update shopping log
  async updateShoppingLog(id, shoppingData) {
    return this.put(`/shopping/${id}`, shoppingData);
  }

  // Delete shopping log
  async deleteShoppingLog(id) {
    return this.delete(`/shopping/${id}`);
  }

  // Get shopping log by ID
  async getShoppingLogById(id) {
    return this.get(`/shopping/${id}`);
  }

  // Get shopping logs by status
  async getShoppingLogsByStatus(status) {
    return this.get(`/shopping/status/${status}`);
  }

  // Shopping Details API
  async getShoppingDetails(shoppingLogId) {
    return this.get(`/shopping/${shoppingLogId}/details`);
  }

  async createShoppingDetail(shoppingLogId, detailData) {
    return this.post(`/shopping/${shoppingLogId}/details`, detailData);
  }

  async updateShoppingDetail(detailId, detailData) {
    return this.put(`/shopping/details/${detailId}`, detailData);
  }

  async deleteShoppingDetail(detailId) {
    return this.delete(`/shopping/details/${detailId}`);
  }

  // ====== MEAL PLAN API METHODS ======

  // Get all meal plans
  async getMealPlans() {
    return this.get("/mealplan");
  }

  // Create new meal plan
  async createMealPlan(mealPlanData) {
    return this.post("/mealplan", mealPlanData);
  }

  // Update meal plan
  async updateMealPlan(id, mealPlanData) {
    return this.put(`/mealplan/${id}`, mealPlanData);
  }

  // Delete meal plan
  async deleteMealPlan(id) {
    return this.delete(`/mealplan/${id}`);
  }

  // Get meal plan by ID
  async getMealPlanById(id) {
    return this.get(`/mealplan/${id}`);
  }

  // Get meal plan by date
  async getMealPlanByDate(date) {
    return this.get(`/mealplan/date/${date}`);
  }

  // Get meal plans by date range
  async getMealPlansByDateRange(startDate, endDate) {
    return this.get(
      `/mealplan/range?startDate=${startDate}&endDate=${endDate}`
    );
  }

  // Add session to meal plan
  async addMealPlanSession(mealPlanId, sessionData) {
    return this.post(`/mealplan/${mealPlanId}/sessions`, sessionData);
  }

  // Add menu to session
  async addMenuToSession(sessionId, menuData) {
    return this.post(`/mealplan/sessions/${sessionId}/menus`, menuData);
  }

  // ====== AUTH API METHODS ======

  // Login
  async login(credentials) {
    return this.post("/auth/login", credentials);
  }

  // Register
  async register(userData) {
    return this.post("/auth/register", userData);
  }

  // Logout
  async logout() {
    try {
      await this.post("/auth/logout");
    } finally {
      this.removeToken();
    }
  }

  // Get user profile
  async getUserProfile() {
    return this.get("/auth/user");
  }

  // Shopping Items API methods - using existing server endpoints
  async getShoppingItems(shoppingLogId) {
    return this.get(`/shopping/${shoppingLogId}/details`);
  }

  async createShoppingItem(itemData) {
    const { id_shoppinglog, ...data } = itemData;
    return this.post(`/shopping/${id_shoppinglog}/details`, data);
  }

  async updateShoppingItem(itemId, itemData) {
    return this.put(`/shopping/details/${itemId}`, itemData);
  }

  async deleteShoppingItem(itemId) {
    return this.delete(`/shopping/details/${itemId}`);
  }
}

// Create global API service instance
window.apiService = new APIService();
window.APIService = window.apiService; // For backward compatibility
