import orderModel from '../../../models/orderModel.js';
import { getAllOrdersController } from '../../../controllers/authController.js';

jest.mock('../../../models/orderModel.js');

describe('getAllOrdersController', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('fetches all orders and returns them in JSON format', async () => {
    const mockOrders = [
      { _id: '1', status: 'Processing', buyer: 'John' },
      { _id: '2', status: 'Shipped', buyer: 'Jane' },
    ];

    const mockQuery = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockOrders),
    };
    orderModel.find.mockReturnValue(mockQuery);

    await getAllOrdersController(req, res);

    expect(orderModel.find).toHaveBeenCalledWith({});
    expect(mockQuery.populate).toHaveBeenCalledTimes(2);
    expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res.json).toHaveBeenCalledWith(mockOrders);
  });

  it('handles errors and responds with 500', async () => {
    const err = new Error('Database error');
    orderModel.find.mockImplementation(() => {
      throw err;
    });

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await getAllOrdersController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
		expect(logSpy).toHaveBeenCalledWith(err);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Error while getting orders',
        error: err,
      })
    );

    logSpy.mockRestore();
  });
});
