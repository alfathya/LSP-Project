const ShoppingController = require('../controller/shopping');
const ShoppingModel = require('../model/shopping');

// Mock ShoppingModel
jest.mock('../model/shopping');

describe('ShoppingController', () => {
  let req, res, next;
  let consoleErrorSpy;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: 1, id_user: 1 }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // Mock console.error to suppress error output in tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  describe('create', () => {
    it('should create shopping record successfully', async () => {
      const mockPayload = {
        nama_belanja: 'Belanja Mingguan',
        tanggal: '2024-01-15',
        status: 'Direncanakan'
      };
      const mockResult = {
        success: true,
        data: { id: 1, ...mockPayload, userId: 1 }
      };

      req.body = mockPayload;
      ShoppingModel.create.mockResolvedValue(mockResult);

      await ShoppingController.create(req, res, next);

      expect(ShoppingModel.create).toHaveBeenCalledWith(mockPayload, 1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when creation fails', async () => {
      const mockResult = {
        success: false,
        message: 'Creation failed'
      };

      req.body = { nama_belanja: 'Test' };
      ShoppingModel.create.mockResolvedValue(mockResult);

      await ShoppingController.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle error during creation', async () => {
      const mockError = new Error('Database error');
      req.body = { nama_belanja: 'Test' };
      ShoppingModel.create.mockRejectedValue(mockError);

      await ShoppingController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('update', () => {
    it('should update shopping record successfully', async () => {
      const mockPayload = {
        nama_belanja: 'Belanja Updated',
        status: 'Selesai'
      };
      const mockResult = {
        success: true,
        data: { id: 1, ...mockPayload, userId: 1 }
      };

      req.params.id = '1';
      req.body = mockPayload;
      ShoppingModel.update.mockResolvedValue(mockResult);

      await ShoppingController.update(req, res, next);

      expect(ShoppingModel.update).toHaveBeenCalledWith(1, mockPayload, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 for invalid ID', async () => {
      req.params.id = 'invalid';

      await ShoppingController.update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid shopping log ID'
      });
    });

    it('should return 400 when update fails', async () => {
      const mockResult = {
        success: false,
        message: 'Update failed'
      };

      req.params.id = '1';
      req.body = { nama_belanja: 'Test' };
      ShoppingModel.update.mockResolvedValue(mockResult);

      await ShoppingController.update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('getAll', () => {
    it('should get all shopping records successfully', async () => {
      const mockResult = {
        success: true,
        data: [
          { id: 1, nama_belanja: 'Belanja 1', userId: 1 },
          { id: 2, nama_belanja: 'Belanja 2', userId: 1 }
        ]
      };

      ShoppingModel.getAll.mockResolvedValue(mockResult);

      await ShoppingController.getAll(req, res, next);

      expect(ShoppingModel.getAll).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 when getAll fails', async () => {
      const mockResult = {
        success: false,
        message: 'Fetch failed'
      };

      ShoppingModel.getAll.mockResolvedValue(mockResult);

      await ShoppingController.getAll(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('getById', () => {
    it('should get shopping record by ID successfully', async () => {
      const mockResult = {
        success: true,
        data: { id: 1, nama_belanja: 'Belanja 1', userId: 1 }
      };

      req.params.id = '1';
      ShoppingModel.getById.mockResolvedValue(mockResult);

      await ShoppingController.getById(req, res, next);

      expect(ShoppingModel.getById).toHaveBeenCalledWith(1, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 for invalid ID', async () => {
      req.params.id = 'invalid';

      await ShoppingController.getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid shopping log ID'
      });
    });

    it('should return 404 when record not found', async () => {
      const mockResult = {
        success: false,
        message: 'Record not found'
      };

      req.params.id = '1';
      ShoppingModel.getById.mockResolvedValue(mockResult);

      await ShoppingController.getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('delete', () => {
    it('should delete shopping record successfully', async () => {
      const mockResult = {
        success: true,
        message: 'Record deleted successfully'
      };

      req.params.id = '1';
      ShoppingModel.delete.mockResolvedValue(mockResult);

      await ShoppingController.delete(req, res, next);

      expect(ShoppingModel.delete).toHaveBeenCalledWith(1, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 for invalid ID', async () => {
      req.params.id = 'invalid';

      await ShoppingController.delete(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid shopping log ID'
      });
    });
  });

  describe('getByStatus', () => {
    it('should get records by valid status', async () => {
      const mockResult = {
        success: true,
        data: [{ id: 1, nama_belanja: 'Belanja 1', status: 'Direncanakan' }]
      };

      req.params.status = 'Direncanakan';
      ShoppingModel.getByStatus.mockResolvedValue(mockResult);

      await ShoppingController.getByStatus(req, res, next);

      expect(ShoppingModel.getByStatus).toHaveBeenCalledWith('Direncanakan', 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 for invalid status', async () => {
      req.params.status = 'InvalidStatus';

      await ShoppingController.getByStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid status. Must be "Direncanakan" or "Selesai"'
      });
    });
  });

  describe('createShoppingDetails', () => {
    it('should create shopping details successfully', async () => {
      const mockItems = [
        { nama_item: 'Beras', jumlah: 5, harga: 50000 }
      ];
      const mockResult = {
        success: true,
        data: { id: 1, items: mockItems }
      };

      req.params.shoppingLogId = '1';
      req.body.items = mockItems;
      ShoppingModel.createShoppingDetails.mockResolvedValue(mockResult);

      await ShoppingController.createShoppingDetails(req, res, next);

      expect(ShoppingModel.createShoppingDetails).toHaveBeenCalledWith(1, mockItems, 1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 when creation fails', async () => {
      const mockResult = {
        success: false,
        message: 'Creation failed'
      };

      req.params.shoppingLogId = '1';
      req.body.items = [];
      ShoppingModel.createShoppingDetails.mockResolvedValue(mockResult);

      await ShoppingController.createShoppingDetails(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle error during creation', async () => {
      const mockError = new Error('Database error');
      req.params.shoppingLogId = '1';
      req.body.items = [];
      ShoppingModel.createShoppingDetails.mockRejectedValue(mockError);

      await ShoppingController.createShoppingDetails(req, res, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error in createShoppingDetails controller:', mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
        error: mockError.message
      });
    });
  });

  describe('updateShoppingDetail', () => {
    it('should update shopping detail successfully', async () => {
      const mockPayload = {
        nama_item: 'Beras Updated',
        jumlah: 10
      };
      const mockResult = {
        success: true,
        data: { id: 1, ...mockPayload }
      };

      req.params.detailId = '1';
      req.body = mockPayload;
      ShoppingModel.updateShoppingDetail.mockResolvedValue(mockResult);

      await ShoppingController.updateShoppingDetail(req, res, next);

      expect(ShoppingModel.updateShoppingDetail).toHaveBeenCalledWith(1, mockPayload, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 for invalid detail ID', async () => {
      req.params.detailId = 'invalid';

      await ShoppingController.updateShoppingDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid shopping detail ID'
      });
    });
  });

  describe('deleteShoppingDetail', () => {
    it('should delete shopping detail successfully', async () => {
      const mockResult = {
        success: true,
        message: 'Detail deleted successfully'
      };

      req.params.detailId = '1';
      ShoppingModel.deleteShoppingDetail.mockResolvedValue(mockResult);

      await ShoppingController.deleteShoppingDetail(req, res, next);

      expect(ShoppingModel.deleteShoppingDetail).toHaveBeenCalledWith(1, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 for invalid detail ID', async () => {
      req.params.detailId = 'invalid';

      await ShoppingController.deleteShoppingDetail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid shopping detail ID'
      });
    });
  });

  describe('getShoppingDetails', () => {
    it('should get shopping details successfully', async () => {
      const mockResult = {
        success: true,
        data: [
          { id: 1, nama_item: 'Beras', jumlah: 5, harga: 50000 }
        ]
      };

      req.params.shoppingLogId = '1';
      ShoppingModel.getShoppingDetails.mockResolvedValue(mockResult);

      await ShoppingController.getShoppingDetails(req, res, next);

      expect(ShoppingModel.getShoppingDetails).toHaveBeenCalledWith(1, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 for invalid shopping log ID', async () => {
      req.params.shoppingLogId = 'invalid';

      await ShoppingController.getShoppingDetails(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid shopping log ID'
      });
    });
  });
});