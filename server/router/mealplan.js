const Router = require("express").Router();
const MealPlanController = require("../controller/mealplan");
const { authenticateToken } = require("../middleware/authentication");

// GET all meal plans for user
Router.get("/", authenticateToken, MealPlanController.getAll);

// GET meal plans by date range
Router.get("/range", authenticateToken, MealPlanController.getByDateRange);

// GET meal plan by specific date
Router.get("/date/:date", authenticateToken, MealPlanController.getByDate);

// GET specific meal plan by ID
Router.get("/:id", authenticateToken, MealPlanController.getById);

// POST create new meal plan
Router.post("/", authenticateToken, MealPlanController.create);

// PUT update meal plan
Router.put("/:id", authenticateToken, MealPlanController.update);

// DELETE meal plan
Router.delete("/:id", authenticateToken, MealPlanController.delete);

// Session Routes
// POST add new session to meal plan
Router.post(
  "/:mealPlanId/sessions",
  authenticateToken,
  MealPlanController.addSession
);

// Menu Routes
// POST add new menu to session
Router.post(
  "/sessions/:sessionId/menus",
  authenticateToken,
  MealPlanController.addMenuToSession
);

module.exports = Router;
