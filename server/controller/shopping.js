const ShoppingModel = require("../model/shopping");

class ShoppingController {
  static async create(req, res, next) {
    try {
      const payload = req.body;
      const userId = req.user.id;

      const createRecord = await ShoppingModel.create(payload, userId);

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
          message: "Invalid shopping log ID",
        });
      }

      const updateRecord = await ShoppingModel.update(id, payload, userId);

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
      const getAllRecords = await ShoppingModel.getAll(userId);

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
          message: "Invalid shopping log ID",
        });
      }

      const getRecord = await ShoppingModel.getById(id, userId);

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
          message: "Invalid shopping log ID",
        });
      }

      const deleteRecord = await ShoppingModel.delete(id, userId);

      if (deleteRecord.success) {
        res.status(200).json(deleteRecord);
      } else {
        res.status(400).json(deleteRecord);
      }
    } catch (error) {
      next(error);
    }
  }

  static async getByStatus(req, res, next) {
    try {
      const { status } = req.params;
      const userId = req.user.id;

      // Validasi status
      const validStatus = ["Direncanakan", "Selesai"];
      if (!validStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be "Direncanakan" or "Selesai"',
        });
      }

      const getRecords = await ShoppingModel.getByStatus(status, userId);

      if (getRecords.success) {
        res.status(200).json(getRecords);
      } else {
        res.status(400).json(getRecords);
      }
    } catch (error) {
      next(error);
    }
  }

  // Shopping Details Controllers
  static async createShoppingDetail(req, res, next) {
    try {
      const shoppingLogId = parseInt(req.params.shoppingLogId);
      const payload = req.body;
      const userId = req.user.id;

      if (isNaN(shoppingLogId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid shopping log ID",
        });
      }

      const createRecord = await ShoppingModel.createShoppingDetails(
        shoppingLogId,
        payload.items,
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

  static async updateShoppingDetail(req, res, next) {
    try {
      const detailId = parseInt(req.params.detailId);
      const payload = req.body;
      const userId = req.user.id;

      if (isNaN(detailId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid shopping detail ID",
        });
      }

      const updateRecord = await ShoppingModel.updateShoppingDetail(
        detailId,
        payload,
        userId
      );

      if (updateRecord.success) {
        res.status(200).json(updateRecord);
      } else {
        res.status(400).json(updateRecord);
      }
    } catch (error) {
      next(error);
    }
  }

  static async deleteShoppingDetail(req, res, next) {
    try {
      const detailId = parseInt(req.params.detailId);
      const userId = req.user.id;

      if (isNaN(detailId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid shopping detail ID",
        });
      }

      const deleteRecord = await ShoppingModel.deleteShoppingDetail(
        detailId,
        userId
      );

      if (deleteRecord.success) {
        res.status(200).json(deleteRecord);
      } else {
        res.status(400).json(deleteRecord);
      }
    } catch (error) {
      next(error);
    }
  }

  static async getShoppingDetails(req, res, next) {
    try {
      const shoppingLogId = parseInt(req.params.shoppingLogId);
      const userId = req.user.id;

      if (isNaN(shoppingLogId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid shopping log ID",
        });
      }

      const getRecords = await ShoppingModel.getShoppingDetails(
        shoppingLogId,
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
}

module.exports = ShoppingController;
