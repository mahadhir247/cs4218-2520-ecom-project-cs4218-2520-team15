import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import orderModel from "../../models/orderModel.js";
import { before } from "node:test";

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

beforeEach(async () => {
  const { collections } = mongoose.connection;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("Order Model", () => {
  it("should create an order successfully with products and buyer", async () => {
    const validOrder = {
      products: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
      payment: { method: "card", paid: true },
      buyer: new mongoose.Types.ObjectId(),
    };

    const newOrder = new orderModel(validOrder);
    const savedOrder = await newOrder.save();

    expect(savedOrder._id).toBeDefined();
    expect(savedOrder.products).toHaveLength(2);
    expect(savedOrder.payment).toBeDefined();
    expect(savedOrder.buyer).toBeDefined();
    expect(savedOrder.status).toBe("Not Processed"); // default
    expect(savedOrder.createdAt).toBeDefined();
    expect(savedOrder.updatedAt).toBeDefined();
  });

  it("should allow creating an order without products (optional) and use default status", async () => {
    const orderNoProducts = {
      payment: { method: "cod" },
      buyer: new mongoose.Types.ObjectId(),
    };

    const newOrder = new orderModel(orderNoProducts);
    const savedOrder = await newOrder.save();

    expect(savedOrder._id).toBeDefined();
    // products should default to an empty array
    expect(Array.isArray(savedOrder.products)).toBe(true);
    expect(savedOrder.products.length).toBe(0);
    expect(savedOrder.status).toBe("Not Processed");
  });

  it("should fail validation when status is not one of the enum values", async () => {
    const invalidStatusOrder = new orderModel({
      products: [new mongoose.Types.ObjectId()],
      payment: {},
      buyer: new mongoose.Types.ObjectId(),
      status: "Invalid Status",
    });

    let err;
    try {
      await invalidStatusOrder.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.status).toBeDefined();
    expect(err.errors.status.kind).toBe("enum");
  });

  it("should keep createdAt and update updatedAt when the document is modified and saved", async () => {
    const order = new orderModel({ payment: {}, buyer: new mongoose.Types.ObjectId() });
    const saved = await order.save();

    const createdAt1 = saved.createdAt;
    const updatedAt1 = saved.updatedAt;

    // ensure some time passes so updatedAt will differ
    await new Promise((res) => setTimeout(res, 20));

    saved.status = "Processing";
    const saved2 = await saved.save();

    expect(saved2.createdAt.getTime()).toBe(createdAt1.getTime());
    expect(saved2.updatedAt.getTime()).toBeGreaterThan(updatedAt1.getTime());
  });
});
