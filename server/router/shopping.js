const Router = require("express").Router();
const ShoppingController = require("../controller/shopping");
const { authenticateToken } = require("../middleware/authentication");

Router.get("/", authenticateToken, ShoppingController.getAll);
Router.get(
  "/status/:status",
  authenticateToken,
  ShoppingController.getByStatus
);
Router.get("/:id", authenticateToken, ShoppingController.getById);
Router.post("/", authenticateToken, ShoppingController.create);
Router.put("/:id", authenticateToken, ShoppingController.update);
Router.delete("/:id", authenticateToken, ShoppingController.delete);

Router.get(
  "/:shoppingLogId/details",
  authenticateToken,
  ShoppingController.getShoppingDetails
);

Router.post(
  "/:shoppingLogId/details",
  authenticateToken,
  ShoppingController.createShoppingDetails
);

Router.put(
  "/details/:detailId",
  authenticateToken,
  ShoppingController.updateShoppingDetail
);

Router.delete(
  "/details/:detailId",
  authenticateToken,
  ShoppingController.deleteShoppingDetail
);

module.exports = Router;
