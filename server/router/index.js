const Router = require("express").Router();

const AuthRouter = require("./auth");
const JajanlogRouter = require("./jajanlog");
const ShoppingRouter = require("./shopping");
const MealPlanRouter = require("./mealplan");

Router.use("/auth", AuthRouter);
Router.use("/jajanlog", JajanlogRouter);
Router.use("/shopping", ShoppingRouter);
Router.use("/mealplan", MealPlanRouter);

Router.use("/", (req, res) => {
  res.send("Welcome to the REST API");
});

module.exports = Router;
