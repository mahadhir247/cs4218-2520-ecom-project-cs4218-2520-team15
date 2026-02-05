import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import productModel from "../../models/productModel.js";

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

describe("Product Model Test", () => {
  
  it("should create a product successfully", async () => {
    const validProduct = {
      name: "iPhone 15",
      slug: "iphone-15",
      description: "Latest apple phone",
      price: 999,
      category: new mongoose.Types.ObjectId(),
      quantity: 50,
    };
    const newProduct = new productModel(validProduct);
    const savedProduct = await newProduct.save();
    
    expect(savedProduct._id).toBeDefined();
    expect(savedProduct.name).toBe(validProduct.name);
  });

  it("should fail if a required field is missing", async () => {
    const productWithoutName = new productModel({ 
      // should fail: missing name
      slug: "test-item", 
      description: "test-item description",
      price: 10,
      category: new mongoose.Types.ObjectId(),
      quantity: 2
    });
    
    let err;
    try {
      await productWithoutName.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.name).toBeDefined();
  });

  it("should fail if price is not a number", async () => {
    const productWithInvalidPrice = new productModel({
      name: "Bad Price",
      slug: "bad-price",
      description: "test",
      price: "not-a-number", // should fail: invalid price
      category: new mongoose.Types.ObjectId(),
      quantity: 1
    });

    let err;
    try {
      await productWithInvalidPrice.save();
    } catch (error) {
      err = error;
    }
    
    expect(err.errors.price).toBeDefined();
    expect(err.errors.price.kind).toBe("Number");
  });
});
