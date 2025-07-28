const MealPlanController = require('../controller/mealplan');
const MealPlanModel = require('../model/mealplan');

// Mock MealPlanModel
jest.mock('../model/mealplan');

describe('MealPlanController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 1 }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create meal plan successfully', async () => {
      const mockPayload = {
        nama_meal_plan: 'Meal Plan Mingguan',
        tanggal: '2024-01-15',
        deskripsi: 'Rencana makan sehat'
      };
      const mockResult = {
        success: true,
        data: { id: 1, ...mockPayload, userId: 1 }
      };

      req.body = mockPayload;
      MealPlanModel.create.mockResolvedValue(mockResult);

      await MealPlanController.create(req, res, next);

      expect(MealPlanModel.create).toHaveBeenCalledWith(mockPayload, 1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when creation fails', async () => {
      const mockResult = {
        success: false,
        message: 'Creation failed'
      };

      req.body = { nama_meal_plan: 'Test' };
      MealPlanModel.create.mockResolvedValue(mockResult);

      await MealPlanController.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle error during creation', async () => {
      const mockError = new Error('Database error');
      req.body = { nama_meal_plan: 'Test' };
      MealPlanModel.create.mockRejectedValue(mockError);

      await MealPlanController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('update', () => {
    it('should update meal plan successfully', async () => {
      const mockPayload = {
        nama_meal_plan: 'Meal Plan Updated',
        deskripsi: 'Updated description'
      };
      const mockResult = {
        success: true,
        data: { id: 1, ...mockPayload, userId: 1 }
      };

      req.params.id = '1';
      req.body = mockPayload;
      MealPlanModel.update.mockResolvedValue(mockResult);

      await MealPlanController.update(req, res, next);

      expect(MealPlanModel.update).toHaveBeenCalledWith(1, mockPayload, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 for invalid ID', async () => {
      req.params.id = 'invalid';

      await MealPlanController.update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid meal plan ID'
      });
    });

    it('should return 400 when update fails', async () => {
      const mockResult = {
        success: false,
        message: 'Update failed'
      };

      req.params.id = '1';
      req.body = { nama_meal_plan: 'Test' };
      MealPlanModel.update.mockResolvedValue(mockResult);

      await MealPlanController.update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('getAll', () => {
    it('should get all meal plans successfully', async () => {
      const mockResult = {
        success: true,
        data: [
          { id: 1, nama_meal_plan: 'Meal Plan 1', userId: 1 },
          { id: 2, nama_meal_plan: 'Meal Plan 2', userId: 1 }
        ]
      };

      MealPlanModel.getAll.mockResolvedValue(mockResult);

      await MealPlanController.getAll(req, res, next);

      expect(MealPlanModel.getAll).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 when getAll fails', async () => {
      const mockResult = {
        success: false,
        message: 'Fetch failed'
      };

      MealPlanModel.getAll.mockResolvedValue(mockResult);

      await MealPlanController.getAll(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('getById', () => {
    it('should get meal plan by ID successfully', async () => {
      const mockResult = {
        success: true,
        data: { id: 1, nama_meal_plan: 'Meal Plan 1', userId: 1 }
      };

      req.params.id = '1';
      MealPlanModel.getById.mockResolvedValue(mockResult);

      await MealPlanController.getById(req, res, next);

      expect(MealPlanModel.getById).toHaveBeenCalledWith(1, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 for invalid ID', async () => {
      req.params.id = 'invalid';

      await MealPlanController.getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid meal plan ID'
      });
    });

    it('should return 404 when record not found', async () => {
      const mockResult = {
        success: false,
        message: 'Record not found'
      };

      req.params.id = '1';
      MealPlanModel.getById.mockResolvedValue(mockResult);

      await MealPlanController.getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('delete', () => {
    it('should delete meal plan successfully', async () => {
      const mockResult = {
        success: true,
        message: 'Record deleted successfully'
      };

      req.params.id = '1';
      MealPlanModel.delete.mockResolvedValue(mockResult);

      await MealPlanController.delete(req, res, next);

      expect(MealPlanModel.delete).toHaveBeenCalledWith(1, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 for invalid ID', async () => {
      req.params.id = 'invalid';

      await MealPlanController.delete(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid meal plan ID'
      });
    });
  });

  describe('getByDateRange', () => {
    it('should get meal plans by date range successfully', async () => {
      const mockResult = {
        success: true,
        data: [
          { id: 1, nama_meal_plan: 'Meal Plan 1', tanggal: '2024-01-15' }
        ]
      };

      req.query.startDate = '2024-01-01';
      req.query.endDate = '2024-01-31';
      MealPlanModel.getByDateRange.mockResolvedValue(mockResult);

      await MealPlanController.getByDateRange(req, res, next);

      expect(MealPlanModel.getByDateRange).toHaveBeenCalledWith('2024-01-01', '2024-01-31', 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 when dates are missing', async () => {
      req.query = {}; // No startDate and endDate

      await MealPlanController.getByDateRange(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Start date and end date are required'
      });
    });

    it('should return 400 when only startDate is provided', async () => {
      req.query.startDate = '2024-01-01';
      // No endDate

      await MealPlanController.getByDateRange(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Start date and end date are required'
      });
    });
  });

  describe('getByDate', () => {
    it('should get meal plan by specific date successfully', async () => {
      const mockResult = {
        success: true,
        data: { id: 1, nama_meal_plan: 'Meal Plan 1', tanggal: '2024-01-15' }
      };

      req.params.date = '2024-01-15';
      MealPlanModel.getByDate.mockResolvedValue(mockResult);

      await MealPlanController.getByDate(req, res, next);

      expect(MealPlanModel.getByDate).toHaveBeenCalledWith('2024-01-15', 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 when date parameter is missing', async () => {
      req.params = {}; // No date parameter

      await MealPlanController.getByDate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Date parameter is required'
      });
    });
  });

  describe('addSession', () => {
    it('should add session to meal plan successfully', async () => {
      const mockSessionData = {
        nama_session: 'Sarapan',
        waktu: '07:00'
      };
      const mockResult = {
        success: true,
        data: { id: 1, ...mockSessionData, mealPlanId: 1 }
      };

      req.params.mealPlanId = '1';
      req.body = mockSessionData;
      MealPlanModel.addSession.mockResolvedValue(mockResult);

      await MealPlanController.addSession(req, res, next);

      expect(MealPlanModel.addSession).toHaveBeenCalledWith(1, mockSessionData, 1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 for invalid meal plan ID', async () => {
      req.params.mealPlanId = 'invalid';

      await MealPlanController.addSession(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid meal plan ID'
      });
    });

    it('should return 400 when session creation fails', async () => {
      const mockResult = {
        success: false,
        message: 'Session creation failed'
      };

      req.params.mealPlanId = '1';
      req.body = { nama_session: 'Test' };
      MealPlanModel.addSession.mockResolvedValue(mockResult);

      await MealPlanController.addSession(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('addMenuToSession', () => {
    it('should add menu to session successfully', async () => {
      const mockMenuData = {
        nama_menu: 'Nasi Goreng',
        kalori: 350,
        protein: 15
      };
      const mockResult = {
        success: true,
        data: { id: 1, ...mockMenuData, sessionId: 1 }
      };

      req.params.sessionId = '1';
      req.body = mockMenuData;
      MealPlanModel.addMenuToSession.mockResolvedValue(mockResult);

      await MealPlanController.addMenuToSession(req, res, next);

      expect(MealPlanModel.addMenuToSession).toHaveBeenCalledWith(1, mockMenuData, 1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 for invalid session ID', async () => {
      req.params.sessionId = 'invalid';

      await MealPlanController.addMenuToSession(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid session ID'
      });
    });

    it('should return 400 when menu creation fails', async () => {
      const mockResult = {
        success: false,
        message: 'Menu creation failed'
      };

      req.params.sessionId = '1';
      req.body = { nama_menu: 'Test' };
      MealPlanModel.addMenuToSession.mockResolvedValue(mockResult);

      await MealPlanController.addMenuToSession(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });
});