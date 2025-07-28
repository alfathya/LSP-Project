const AuthController = require("../controller/auth");
const AuthModel = require("../model/authModel");

// Mock AuthModel
jest.mock("../model/authModel");

describe("AuthController", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      user: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register user successfully", async () => {
      const mockUserData = {
        email: "test@example.com",
        password: "password123",
        nama: "Test User",
        jenis_kelamin: "L",
        tahun_lahir: 1990
      };

      const mockResponse = {
        success: true,
        message: "User registered successfully",
        data: {
          id: 1,
          nama: "Test User",
          email: "test@example.com",
          tanggal_registrasi: new Date()
        }
      };

      req.body = mockUserData;
      AuthModel.register.mockResolvedValue(mockResponse);

      await AuthController.register(req, res, next);

      expect(AuthModel.register).toHaveBeenCalledWith(mockUserData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle registration error", async () => {
      const mockError = new Error("Email already registered");
      req.body = {
        email: "existing@example.com",
        password: "password123"
      };

      AuthModel.register.mockRejectedValue(mockError);

      await AuthController.register(req, res, next);

      expect(AuthModel.register).toHaveBeenCalledWith(req.body);
      expect(next).toHaveBeenCalledWith(mockError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      const mockLoginData = {
        email: "test@example.com",
        password: "password123"
      };

      const mockResponse = {
        success: true,
        message: "Login successful",
        data: {
          id: 1,
          nama: "Test User",
          email: "test@example.com",
          token: "mock-jwt-token"
        }
      };

      req.body = mockLoginData;
      AuthModel.login.mockResolvedValue(mockResponse);

      await AuthController.login(req, res, next);

      expect(AuthModel.login).toHaveBeenCalledWith(mockLoginData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return error when email is missing", async () => {
      req.body = {
        password: "password123"
      };

      await AuthController.login(req, res, next);

      expect(AuthModel.login).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe("email and password are required");
    });

    it("should return error when password is missing", async () => {
      req.body = {
        email: "test@example.com"
      };

      await AuthController.login(req, res, next);

      expect(AuthModel.login).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe("email and password are required");
    });

    it("should return error when both email and password are missing", async () => {
      req.body = {};

      await AuthController.login(req, res, next);

      expect(AuthModel.login).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe("email and password are required");
    });

    it("should handle login error from AuthModel", async () => {
      const mockError = new Error("Invalid credentials");
      req.body = {
        email: "test@example.com",
        password: "wrongpassword"
      };

      AuthModel.login.mockRejectedValue(mockError);

      await AuthController.login(req, res, next);

      expect(AuthModel.login).toHaveBeenCalledWith(req.body);
      expect(next).toHaveBeenCalledWith(mockError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      const expectedResponse = {
        success: true,
        message: "Logout successful"
      };

      await AuthController.logout(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResponse);
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle logout error", async () => {
      const mockError = new Error("Logout error");
      
      // Mock res.status to throw error
      res.status.mockImplementation(() => {
        throw mockError;
      });

      await AuthController.logout(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getUser", () => {
    it("should get user successfully", async () => {
      const mockUser = {
        success: true,
        data: {
          id_user: 1,
          email: "test@example.com",
          nama_pengguna: "Test User",
          jenis_kelamin: "L",
          tahun_lahir: 1990,
          tanggal_registrasi: new Date()
        }
      };

      req.user = { id: 1 };
      AuthModel.getUserById.mockResolvedValue(mockUser);

      await AuthController.getUser(req, res, next);

      expect(AuthModel.getUserById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it("should return 401 when user is not authenticated (no req.user)", async () => {
      req.user = null;

      await AuthController.getUser(req, res, next);

      expect(AuthModel.getUserById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not authenticated"
      });
    });

    it("should return 401 when user id is missing", async () => {
      req.user = {};

      await AuthController.getUser(req, res, next);

      expect(AuthModel.getUserById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not authenticated"
      });
    });

    it("should return 404 when user is not found", async () => {
      const mockResponse = {
        success: false,
        message: "User not found"
      };

      req.user = { id: 999 };
      AuthModel.getUserById.mockResolvedValue(mockResponse);

      await AuthController.getUser(req, res, next);

      expect(AuthModel.getUserById).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found"
      });
    });

    it("should return 404 when AuthModel returns null", async () => {
      req.user = { id: 999 };
      AuthModel.getUserById.mockResolvedValue(null);

      await AuthController.getUser(req, res, next);

      expect(AuthModel.getUserById).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found"
      });
    });

    it("should handle internal server error", async () => {
      const mockError = new Error("Database connection failed");
      req.user = { id: 1 };
      AuthModel.getUserById.mockRejectedValue(mockError);

      await AuthController.getUser(req, res, next);

      expect(AuthModel.getUserById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal server error"
      });
    });
  });
});