import userModel from '../../../models/userModel.js';
import { hashPassword } from '../../../helpers/authHelper.js';
import { updateProfileController } from '../../../controllers/authController.js';

jest.mock('../../../models/userModel.js', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../../../helpers/authHelper.js', () => ({
  hashPassword: jest.fn(),
}));

describe('updateProfileController tests', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterAll(() => {
    console.log.mockRestore();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns error JSON when password is shorter than 6 characters', async () => {
    const req = {
      body: { password: '123' },
      user: { _id: 'uid1' },
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    userModel.findById.mockResolvedValue({ name: 'John', password: 'old' });

    await updateProfileController(req, res);

    expect(res.json).toHaveBeenCalledWith({ error: 'Password is required and should be at least 6 characters long' });
  });

  it('updates profile successfully when no password is provided', async () => {
    const existingUser = { name: 'John', password: 'old', phone: '111', address: 'A' };
    const updatedUser = { ...existingUser, name: 'Jane' };

    userModel.findById.mockResolvedValue(existingUser);
    userModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

    const req = {
      body: { name: 'Jane', email: 'john@test.com', phone: '222', address: 'B' },
      user: { _id: 'uid2' },
    };

    const sendMock = jest.fn();
    const statusMock = jest.fn(() => ({ send: sendMock }));
    const res = { status: statusMock };

    await updateProfileController(req, res);

    expect(userModel.findById).toHaveBeenCalledWith('uid2');
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'uid2',
      expect.objectContaining({
        name: 'Jane',
        phone: '222',
        address: 'B',
      }),
      { new: true }
    );
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ success: true, updatedUser }));
  });

  it('updates profile and hashes password when password is provided', async () => {
    const existingUser = { name: 'John', password: 'old', phone: '111', address: 'A' };
    const hashed = 'hashed-pwd';
    const updatedUser = { ...existingUser, password: hashed };

    userModel.findById.mockResolvedValue(existingUser);
    hashPassword.mockResolvedValue(hashed);
    userModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

    const req = {
      body: { password: 'newpassword', name: 'John' },
      user: { _id: 'uid3' },
    };

    const sendMock = jest.fn();
    const statusMock = jest.fn(() => ({ send: sendMock }));
    const res = { status: statusMock };

    await updateProfileController(req, res);

    expect(hashPassword).toHaveBeenCalledWith('newpassword');
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'uid3',
      expect.objectContaining({ password: hashed }),
      { new: true }
    );
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ success: true, updatedUser }));
  });

  it('handles thrown errors and responds with status 400', async () => {
    // simulate DB error
    userModel.findById.mockRejectedValueOnce(new Error('db error'));
    const req = { body: {}, user: { _id: 'uid4' } };
    const sendMock = jest.fn();
    const statusMock = jest.fn(() => ({ send: sendMock }));
    const res = { status: statusMock };

    await updateProfileController(req, res);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'Error while updating profile' }));
  });
});
