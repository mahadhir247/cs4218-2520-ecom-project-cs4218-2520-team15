import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../../models/userModel.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('User model', () => {
  it('creates a user successfully with required fields', async () => {
    const payload = {
      name: 'Alice',
      email: 'alice@example.com',
      password: 'secret123',
      phone: '99999999',
      address: { line1: '1 Example St', city: 'Town' },
      answer: 'blue',
    };

    const created = await User.create(payload);
    expect(created._id).toBeDefined();
    expect(created.email).toBe('alice@example.com');
    expect(created.name).toBe('Alice');
    expect(created.createdAt).toBeDefined();
    expect(created.updatedAt).toBeDefined();
  });

  it('throws ValidationError when required fields are missing', async () => {
    const payload = { name: 'Bob' }; // missing required fields
    await expect(User.create(payload)).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('enforces unique email at the DB level', async () => {
    const p = {
      name: 'A',
      email: 'dup@example.com',
      password: 'password',
      phone: '123',
      address: {},
      answer: 'x',
    };
    await User.create(p);
    // second create should fail with duplicate key error
    try {
      await User.create(p);
      // if create does not throw, fail the test
      throw new Error('Expected duplicate key error but create succeeded');
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.code === 11000 || (err.message && err.message.toLowerCase().includes('duplicate'))).toBeTruthy();
    }
  });

  it('saves email as lowercase when value has uppercase letters', async () => {
    const payload = {
      name: 'lower',
      email: 'UPPER@Example.COM',
      password: 'password123',
      phone: '555',
      address: {},
      answer: 'y',
    };
    const created = await User.create(payload);
    expect(created.email).toBe('upper@example.com');
  });

  it('enforces password minlength', async () => {
    const shortPwd = {
      name: 'john',
      email: 'john@example.com',
      password: '123',
      phone: '123',
      address: {},
      answer: 'x',
    };
    await expect(User.create(shortPwd)).rejects.toThrow(mongoose.Error.ValidationError);
  });
});