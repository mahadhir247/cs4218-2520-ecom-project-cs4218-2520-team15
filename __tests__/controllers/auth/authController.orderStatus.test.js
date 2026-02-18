import orderModel from '../../../models/orderModel.js';
import { orderStatusController } from '../../../controllers/authController.js';

jest.mock('../../../models/orderModel.js');

describe('orderStatusController', () => {
  let req, res;
  
  beforeEach(() => {
    req = {
      params: { orderId: 'order-id-1' },
      body: { status: 'Shipped' },
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });
  
  it('updates the order status and returns the updated order', async () => {
    const updatedOrder = { _id: 'order-id-1', status: 'Shipped' };
    orderModel.findByIdAndUpdate.mockResolvedValue(updatedOrder);

    await orderStatusController(req, res);

    expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'order-id-1',
      { status: 'Shipped' },
      { new: true }
    );
    expect(res.json).toHaveBeenCalledWith(updatedOrder);
  });

  it('handles errors and responds with 500', async () => {
    const err = new Error('Database error');
    orderModel.findByIdAndUpdate.mockImplementation(() => {
      throw err;
    });
    
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await orderStatusController(req, res);
    
    expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'order-id-1',
      { status: 'Shipped' },
      { new: true }
    );
    expect(logSpy).toHaveBeenCalledWith(err);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Error while updating order',
        error: err,
      })
    );

    logSpy.mockRestore();
  });
});