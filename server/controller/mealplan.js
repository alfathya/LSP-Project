const MealPlanModel = require("../model/mealplan");

class MealPlanController {
  static async create(req, res, next) {
    try {
      const payload = req.body;
      const userId = req.user.id;

      const createRecord = await MealPlanModel.create(payload, userId);

      if (createRecord.success) {
        res.status(201).json(createRecord);
      } else {
        res.status(400).json(createRecord);
      }
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const payload = req.body;
      const userId = req.user.id;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid meal plan ID",
        });
      }

      const updateRecord = await MealPlanModel.update(id, payload, userId);

      if (updateRecord.success) {
        res.status(200).json(updateRecord);
      } else {
        res.status(400).json(updateRecord);
      }
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const userId = req.user.id;
      const getAllRecords = await MealPlanModel.getAll(userId);

      if (getAllRecords.success) {
        res.status(200).json(getAllRecords);
      } else {
        res.status(400).json(getAllRecords);
      }
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid meal plan ID",
        });
      }

      const getRecord = await MealPlanModel.getById(id, userId);

      if (getRecord.success) {
        res.status(200).json(getRecord);
      } else {
        res.status(404).json(getRecord);
      }
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid meal plan ID",
        });
      }

      const deleteRecord = await MealPlanModel.delete(id, userId);

      if (deleteRecord.success) {
        res.status(200).json(deleteRecord);
      } else {
        res.status(400).json(deleteRecord);
      }
    } catch (error) {
      next(error);
    }
  }

  static async getByDateRange(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const userId = req.user.id;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Start date and end date are required",
        });
      }

      const getRecords = await MealPlanModel.getByDateRange(
        startDate,
        endDate,
        userId
      );

      if (getRecords.success) {
        res.status(200).json(getRecords);
      } else {
        res.status(400).json(getRecords);
      }
    } catch (error) {
      next(error);
    }
  }

  static async getByDate(req, res, next) {
    try {
      const { date } = req.params;
      const userId = req.user.id;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: "Date parameter is required",
        });
      }

      const getRecord = await MealPlanModel.getByDate(date, userId);

      if (getRecord.success) {
        res.status(200).json(getRecord);
      } else {
        res.status(400).json(getRecord);
      }
    } catch (error) {
      next(error);
    }
  }

  // Session Controllers
  static async addSession(req, res, next) {
    try {
      const mealPlanId = parseInt(req.params.mealPlanId);
      const sessionData = req.body;
      const userId = req.user.id;

      if (isNaN(mealPlanId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid meal plan ID",
        });
      }

      const createRecord = await MealPlanModel.addSession(
        mealPlanId,
        sessionData,
        userId
      );

      if (createRecord.success) {
        res.status(201).json(createRecord);
      } else {
        res.status(400).json(createRecord);
      }
    } catch (error) {
      next(error);
    }
  }

  // Menu Controllers
  static async addMenuToSession(req, res, next) {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const menuData = req.body;
      const userId = req.user.id;

      if (isNaN(sessionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid session ID",
        });
      }

      const createRecord = await MealPlanModel.addMenuToSession(
        sessionId,
        menuData,
        userId
      );

      if (createRecord.success) {
        res.status(201).json(createRecord);
      } else {
        res.status(400).json(createRecord);
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MealPlanController;
