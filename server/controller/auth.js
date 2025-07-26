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

      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const userId = req.user.id;

      const user = await AuthModel.getUserById(userId);

      if (!user || !user.success) {
        return res.status(404).json({
          success: false,
          message: user?.message || "User not found",
        });
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = AuthController;
