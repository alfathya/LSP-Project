const Router = require("express").Router();
const JajanlogController = require('../controller/jajanlog');
const { authenticateToken } = require("../middleware/authentication");

Router.get('/', authenticateToken, JajanlogController.getAll);
Router.post("/", authenticateToken, JajanlogController.create);
Router.put("/:id", authenticateToken, JajanlogController.update);

module.exports = Router;
