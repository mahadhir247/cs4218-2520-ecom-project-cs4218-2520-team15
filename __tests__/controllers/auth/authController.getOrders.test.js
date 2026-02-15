import orderModel from '../../../models/orderModel.js';
import { getOrdersController } from '../../../controllers/authController.js';

describe('getOrdersController', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('responds with orders for the authenticated user', async () => {
		const req = { user: { _id: 'user-id-1' } };

		const orders = [
			{ _id: 'o1', buyer: 'user-id-1' },
			{ _id: 'o2', buyer: 'user-id-1' },
		];

		// mock the mongoose query chain: find(...).populate(...).populate(...)
		const mockQuery = {
			populate: jest.fn().mockReturnThis(),
			exec: jest.fn().mockResolvedValue(orders),
		};
        
		mockQuery.then = (onFulfilled, onRejected) => Promise.resolve(orders).then(onFulfilled, onRejected);

		const findSpy = jest.spyOn(orderModel, 'find').mockReturnValue(mockQuery);

		const res = {
			json: jest.fn(),
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
		};

		await getOrdersController(req, res);

		expect(findSpy).toHaveBeenCalledWith({ buyer: req.user._id });
		expect(mockQuery.populate).toHaveBeenNthCalledWith(1, 'products', '-photo');
		expect(mockQuery.populate).toHaveBeenNthCalledWith(2, 'buyer', 'name');
		expect(res.json).toHaveBeenCalledWith(orders);
	});

	it('handles errors and responds with 500', async () => {
		const req = { user: { _id: 'user-id-2' } };

		const err = new Error('db failure');
		const findSpy = jest.spyOn(orderModel, 'find').mockImplementation(() => {
			throw err;
		});

		const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

		const res = {
			json: jest.fn(),
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
		};

		await getOrdersController(req, res);

		expect(findSpy).toHaveBeenCalledWith({ buyer: req.user._id });
		expect(logSpy).toHaveBeenCalledWith(err);
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: 'Error while getting orders',
				error: err,
			})
		);
	});
});

