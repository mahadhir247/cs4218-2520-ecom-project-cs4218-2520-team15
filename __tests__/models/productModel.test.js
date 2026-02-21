/* Name: Kok Fangyu Inez
 * Student No: A0258672R
 */

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
  jest.restoreAllMocks();
});

describe("Product Model Test", () => {
  
  it("should create a product successfully", async () => {
    // Arrange
    const validProduct = {
      name: "iPhone 15",
      slug: "iphone-15",
      description: "Latest apple phone",
      price: 999,
      category: new mongoose.Types.ObjectId(),
      quantity: 50,
      photo: { 
        data: Buffer.from("fake-image-data-string"), 
        contentType: "image/png" 
      }
    };
    
    // Act
    const newProduct = new productModel(validProduct);
    const savedProduct = await newProduct.save();
    
    // Assert
    expect(savedProduct._id).toBeDefined();
    expect(savedProduct.name).toBe(validProduct.name);
  });

  it("should fail if a required field is missing (name)", async () => {
    // Arrange
    const productWithoutName = new productModel({ 
      // should fail: missing name
      slug: "test-item", 
      description: "test-item description",
      price: 10,
      category: new mongoose.Types.ObjectId(),
      quantity: 2,
      photo: { 
        data: Buffer.from("fake-image-data-string"), 
        contentType: "image/png" 
      }
    });
    
    // Act
    let err;
    try {
      await productWithoutName.save();
    } catch (error) {
      err = error;
    }
    
    // Assert
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.name).toBeDefined();
  });

  it("should fail if a required field is missing (photo)", async () => {
    // Arrange
    const productWithoutPhoto = new productModel({ 
      name: "Test Item",
      slug: "test-item", 
      description: "test-item description",
      price: 10,
      category: new mongoose.Types.ObjectId(),
      quantity: 2
      // should fail: missing photo
    });
    
    // Act
    let err;
    try {
      await productWithoutPhoto.save();
    } catch (error) {
      err = error;
    }
    
    // Assert
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors['photo.data']).toBeDefined();
    expect(err.errors['photo.contentType']).toBeDefined();
  });

  it("should fail if price is not a number", async () => {
    // Arrange
    const productWithInvalidPrice = new productModel({
      name: "Bad Price",
      slug: "bad-price",
      description: "test",
      price: "not-a-number", // should fail: invalid price
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      photo: { 
        data: Buffer.from("fake-image-data-string"), 
        contentType: "image/png" 
      }
    });

    // Act
    let err;
    try {
      await productWithInvalidPrice.save();
    } catch (error) {
      err = error;
    }
    
    // Assert
    expect(err.errors.price).toBeDefined();
    expect(err.errors.price.kind).toBe("Number");
  });
});
