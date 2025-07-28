const JajanlogController = require('../controller/jajanlog');
const JajanlogModel = require('../model/jajanlog');

// Mock JajanlogModel
jest.mock('../model/jajanlog');

describe('JajanlogController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
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
    it('should create jajanlog successfully', async () => {
      const mockPayload = {
        nama_makanan: 'Nasi Goreng',
        harga: 15000,
        tanggal: '2024-01-15'
      };
      const mockResult = {
        id: 1,
        ...mockPayload,
        userId: 1
      };

      req.body = mockPayload;
      JajanlogModel.create.mockResolvedValue(mockResult);

      await JajanlogController.create(req, res, next);

      expect(JajanlogModel.create).toHaveBeenCalledWith(mockPayload, 1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle error during creation', async () => {
      const mockError = new Error('Database error');
      req.body = { nama_makanan: 'Test' };
      JajanlogModel.create.mockRejectedValue(mockError);

      await JajanlogController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update jajanlog successfully', async () => {
      const mockPayload = {
        nama_makanan: 'Nasi Goreng Updated',
        harga: 18000
      };
      const mockResult = {
        id: 1,
        ...mockPayload,
        userId: 1
      };

      req.params.id = '1';
      req.body = mockPayload;
      JajanlogModel.update.mockResolvedValue(mockResult);

      await JajanlogController.update(req, res, next);

      expect(JajanlogModel.update).toHaveBeenCalledWith(1, mockPayload, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle error during update', async () => {
      const mockError = new Error('Update failed');
      req.params.id = '1';
      req.body = { nama_makanan: 'Test' };
      JajanlogModel.update.mockRejectedValue(mockError);

      await JajanlogController.update(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should get all jajanlog records successfully', async () => {
      const mockResult = [
        { id: 1, nama_makanan: 'Nasi Goreng', harga: 15000, userId: 1 },
        { id: 2, nama_makanan: 'Mie Ayam', harga: 12000, userId: 1 }
      ];

      JajanlogModel.getAll.mockResolvedValue(mockResult);

      await JajanlogController.getAll(req, res, next);

      expect(JajanlogModel.getAll).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle error during getAll', async () => {
      const mockError = new Error('Fetch failed');
      JajanlogModel.getAll.mockRejectedValue(mockError);

      await JajanlogController.getAll(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});