import userModel from '../../../models/userModel.js';
import { getAllUsersController } from '../../../controllers/authController.js';

describe('getAllUsersController', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('responds with a list of users', async () => {
    const req = {};

    const usersWithSensitive = [
      { _id: 'u1', name: 'User One', email: 'one@example.com', password: 'secret1', answer: 'a1' },
      { _id: 'u2', name: 'User Two', email: 'two@example.com', password: 'secret2', answer: 'a2' },
    ];

    // what select('-password -answer') should yield
    const filteredUsers = usersWithSensitive.map((u) => {
      const copy = { ...u };
      delete copy.password;
      delete copy.answer;
      return copy;
    });

    // mock the mongoose query chain
    const mockQuery = {
      select: jest.fn().mockImplementation(() => {
        mockQuery.exec = jest.fn().mockResolvedValue(filteredUsers);
        // make thenable for await
        mockQuery.then = (onFulfilled, onRejected) => Promise.resolve(filteredUsers).then(onFulfilled, onRejected);
        return mockQuery;
      }),
      exec: jest.fn().mockResolvedValue(filteredUsers),
    };

    const findSpy = jest.spyOn(userModel, 'find').mockReturnValue(mockQuery);

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await getAllUsersController(req, res);

    expect(findSpy).toHaveBeenCalledWith({});
    expect(mockQuery.select).toHaveBeenCalledWith('-password -answer');
    expect(res.json).toHaveBeenCalledWith(filteredUsers);

    // assert that the returned objects do not include password/answer
    const returned = res.json.mock.calls[0][0];
    expect(Array.isArray(returned)).toBe(true);
    returned.forEach((u) => {
      expect(u).not.toHaveProperty('password');
      expect(u).not.toHaveProperty('answer');
    });
  });

  it('handles errors and responds with 500', async () => {
    const req = {};

    const err = new Error('db failure');
    const findSpy = jest.spyOn(userModel, 'find').mockImplementation(() => {
      throw err;
    });

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await getAllUsersController(req, res);

    expect(findSpy).toHaveBeenCalledWith({});
    expect(logSpy).toHaveBeenCalledWith(err);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Error while getting users',
        error: err,
      })
    );
  });
});
