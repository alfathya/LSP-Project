const AuthModel = require("../model/authModel");

class AuthController {
  static async register(req, res, next) {
    try {
      const data = req.body;
      const user = await AuthModel.register(data);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const data = req.body;

      if (!data.email || !data.password) {
        throw new Error("email and password are required");
      }
      const user = await AuthModel.login(data);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      // Simple logout - in a real app you might want to blacklist the token
      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUser(req, res, next) {
    try {
      console.log("getUser called");
      console.log("req.user:", req.user); // Debug log

      if (!req.user || !req.user.id) {
        console.log("No user ID in request");
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const userId = req.user.id; // dari JWT payload
      console.log("Fetching user with ID:", userId);

      const user = await AuthModel.getUserById(userId);

      console.log("User result:", user); // Debug log

      if (!user || !user.success) {
        console.log("User not found or query failed");
        return res.status(404).json({
          success: false,
          message: user?.message || "User not found",
        });
      }

      console.log("Sending successful response:", user);
      res.status(200).json(user);
    } catch (error) {
      console.error("getUser error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = AuthController;
