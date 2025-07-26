const Router = require("express").Router();
const AuthController = require("../controller/auth");
const { authenticateToken } = require("../middleware/authentication");

Router.post("/register", AuthController.register);
Router.post("/login", AuthController.login);
Router.post("/logout", AuthController.logout);
Router.get("/user", authenticateToken, AuthController.getUser);

module.exports = Router;
