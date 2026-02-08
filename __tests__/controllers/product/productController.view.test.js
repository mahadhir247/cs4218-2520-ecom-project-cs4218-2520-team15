import productModel from "../../../models/productModel.js";
import categoryModel from "../../../models/categoryModel.js";

// Mock braintree before importing the controller
jest.mock("braintree", () => ({
  BraintreeGateway: jest.fn(),
  Environment: {
    Sandbox: "sandbox",
  },
}));

import {
  getSingleProductController,
  productPhotoController,
  relatedProductController,
  productCategoryController
} from "../../../controllers/productController.js";

// Mocking the Mongoose Model
jest.mock("../../../models/productModel.js");
jest.mock("../../../models/categoryModel.js");

describe("Product Controller Unit Tests (related to Product View)", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    // Silence console.log statements during test run
    jest.spyOn(console, "log").mockImplementation(() => {});

    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      set: jest.fn(),
    };
  });

  // ============================================================
  // 1. getSingleProductController
  // ============================================================
  it("should fetch a single product successfully", async () => {
    const mockProduct = { 
      name: "Test Product", 
      slug: "test-product",
      category: { name: "Test Category" } 
    };

    const selectMock = jest.fn().mockReturnThis();
    const populateMock = jest.fn().mockResolvedValue(mockProduct);

    productModel.findOne.mockReturnValue({
      select: selectMock,
      populate: populateMock,
    });

    req.params.slug = "test-product";
    await getSingleProductController(req, res);

    expect(productModel.findOne).toHaveBeenCalledWith({ slug: "test-product" });
    expect(selectMock).toHaveBeenCalledWith("-photo");
    expect(populateMock).toHaveBeenCalledWith("category");
    
    expect(res.status).toHaveBeenCalledWith(200);
    const sentData = res.send.mock.calls[0][0];
    expect(sentData.success).toBe(true);
    expect(sentData.message).toBe("Single product fetched successfully");
    expect(sentData.product).toEqual(mockProduct);
  });

  it("should handle error when product is not found", async () => {
    const selectMock = jest.fn().mockReturnThis();
    const populateMock = jest.fn().mockResolvedValue(null);
    
    productModel.findOne.mockReturnValue({
      select: selectMock,
      populate: populateMock,
    });

    req.params.slug = "non-existent-product";
    await getSingleProductController(req, res);

    expect(productModel.findOne).toHaveBeenCalledWith({ slug: "non-existent-product" });
    expect(selectMock).toHaveBeenCalledWith("-photo");
    expect(populateMock).toHaveBeenCalledWith("category");

    expect(res.status).toHaveBeenCalledWith(404);
    const sentData = res.send.mock.calls[0][0];
    expect(sentData.success).toBe(false);
    expect(sentData.message).toBe("Product not found");
  });

  it("should handle errors in fetching a single product", async () => {
    const mockError = new Error("Database error");

    const selectMock = jest.fn().mockReturnThis();
    const populateMock = jest.fn().mockRejectedValue(mockError);
    
    productModel.findOne.mockReturnValue({
      select: selectMock,
      populate: populateMock,
    });

    req.params.slug = "test-product";
    await getSingleProductController(req, res);
    
    expect(productModel.findOne).toHaveBeenCalledWith({ slug: "test-product" });
    expect(selectMock).toHaveBeenCalledWith("-photo");
    expect(populateMock).toHaveBeenCalledWith("category");

    expect(res.status).toHaveBeenCalledWith(500);
    const sentData = res.send.mock.calls[0][0];
    expect(sentData.success).toBe(false);
    expect(sentData.message).toBe("Error while getting single product");
  });

  // ============================================================
  // 2. productPhotoController
  // ============================================================
  it("should fetch product photo successfully", async () => {
    const mockPhotoData = Buffer.from("mock photo data");
    const mockContentType = "image/png";
  
    const selectMock = jest.fn().mockReturnValue({
      photo: {
        data: mockPhotoData,
        contentType: mockContentType,
      },
    });

    productModel.findById.mockReturnValue({
      select: selectMock,
    });

    req.params.pid = "123";
    await productPhotoController(req, res);

    expect(productModel.findById).toHaveBeenCalledWith("123");
    expect(selectMock).toHaveBeenCalledWith("photo");

    expect(res.set).toHaveBeenCalledWith("Content-type", mockContentType);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockPhotoData);
  });

  it("should handle error when product is missing", async () => {
    const selectMock = jest.fn().mockReturnValue(null);

    productModel.findById.mockReturnValue({
      select: selectMock,
    });

    req.params.pid = "123";
    await productPhotoController(req, res);

    expect(productModel.findById).toHaveBeenCalledWith("123");
    expect(selectMock).toHaveBeenCalledWith("photo");

    expect(res.status).toHaveBeenCalledWith(404);
    const sentData = res.send.mock.calls[0][0];
    expect(sentData.success).toBe(false);
    expect(sentData.message).toBe("Product not found");
  });

  it("should handle error when photo is missing", async () => {
    const selectMock = jest.fn().mockReturnValue({
      photo: null,
    });

    productModel.findById.mockReturnValue({
      select: selectMock,
    });

    req.params.pid = "123";
    await productPhotoController(req, res);

    expect(productModel.findById).toHaveBeenCalledWith("123");
    expect(selectMock).toHaveBeenCalledWith("photo");

    expect(res.status).toHaveBeenCalledWith(404);
    const sentData = res.send.mock.calls[0][0];
    expect(sentData.success).toBe(false);
    expect(sentData.message).toBe("Photo not found");
  });

  it("should handle errors in fetching photo", async () => {
    const mockError = new Error("Database error");

    const selectMock = jest.fn().mockRejectedValue(mockError);

    productModel.findById.mockReturnValue({
      select: selectMock,
    });

    req.params.pid = "123";
    await productPhotoController(req, res);

    expect(productModel.findById).toHaveBeenCalledWith("123");
    expect(selectMock).toHaveBeenCalledWith("photo");

    expect(res.status).toHaveBeenCalledWith(500);
    const sentData = res.send.mock.calls[0][0];
    expect(sentData.success).toBe(false);
    expect(sentData.message).toBe("Error while getting photo");
  });

  // ============================================================
  // 3. relatedProductController
  // ============================================================
  it("should fetch related products successfully", async () => {
    const mockProducts = [
      { name: "Related Product 1" },
      { name: "Related Product 2" },
    ];

    const selectMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockReturnThis();
    const populateMock = jest.fn().mockResolvedValue(mockProducts);

    productModel.find.mockReturnValue({
      select: selectMock,
      limit: limitMock,
      populate: populateMock,
    });

    req.params = { pid: "123", cid: "456" };
    await relatedProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      category: "456",
      _id: { $ne: "123" },
    });
    expect(selectMock).toHaveBeenCalledWith("-photo");
    expect(limitMock).toHaveBeenCalledWith(3);
    expect(populateMock).toHaveBeenCalledWith("category");

    expect(res.status).toHaveBeenCalledWith(200);
    const sentData = res.send.mock.calls[0][0];
    expect(sentData.success).toBe(true);
    expect(sentData.message).toBe("Related products fetched successfully");
    expect(sentData.products).toEqual(mockProducts);
  });

  it("should handle error when no related products are found", async () => {
    const selectMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockReturnThis();
    const populateMock = jest.fn().mockResolvedValue([]);

    productModel.find.mockReturnValue({
      select: selectMock,
      limit: limitMock,
      populate: populateMock,
    });

    req.params = { pid: "123", cid: "456" };
    await relatedProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      category: "456",
      _id: { $ne: "123" },
    });
    expect(selectMock).toHaveBeenCalledWith("-photo");
    expect(limitMock).toHaveBeenCalledWith(3);
    expect(populateMock).toHaveBeenCalledWith("category");

    expect(res.status).toHaveBeenCalledWith(404);
    const sentData = res.send.mock.calls[0][0];
    expect(sentData.success).toBe(false);
    expect(sentData.message).toBe("No related products found");
  });

  it("should handle errors in fetching related products", async () => {
    const mockError = new Error("Database error");

    const selectMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockReturnThis();
    const populateMock = jest.fn().mockRejectedValue(mockError);

    productModel.find.mockReturnValue({
      select: selectMock,
      limit: limitMock,
      populate: populateMock,
    });

    req.params = { pid: "123", cid: "456" };
    await relatedProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      category: "456",
      _id: { $ne: "123" },
    });
    expect(selectMock).toHaveBeenCalledWith("-photo");
    expect(limitMock).toHaveBeenCalledWith(3);
    expect(populateMock).toHaveBeenCalledWith("category");

    expect(res.status).toHaveBeenCalledWith(400);
    const sentData = res.send.mock.calls[0][0];
    expect(sentData.success).toBe(false);
    expect(sentData.message).toBe("Error while getting related products");
  });

  // ============================================================
  // 4. productCategoryController
  // ============================================================
  it("should fetch products by category successfully", async () => {
    const mockCategory = { _id: "456", name: "Test Category", slug: "test-category" };
    const mockProducts = [
      { name: "Product 1", category: mockCategory },
      { name: "Product 2", category: mockCategory },
    ];

    const populateMock = jest.fn().mockResolvedValue(mockProducts);

    categoryModel.findOne.mockResolvedValue(mockCategory);
    productModel.find.mockReturnValue({
      populate: populateMock,
    });

    req.params.slug = "test-category";
    await productCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: "test-category" });
    expect(populateMock).toHaveBeenCalledWith("category");
    expect(productModel.find).toHaveBeenCalledWith({ category: mockCategory });
    
    expect(res.status).toHaveBeenCalledWith(200);
    const sentData = res.send.mock.calls[0][0];
    expect(sentData.success).toBe(true);
    expect(sentData.message).toBe("Products by category fetched successfully");
    expect(sentData.category).toEqual(mockCategory);
    expect(sentData.products).toEqual(mockProducts);
  });

  it("should handle error when no category is found", async () => {
    categoryModel.findOne.mockResolvedValue(null);
    
    req.params.slug = "non-existent-category";
    await productCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: "non-existent-category" });

    expect(res.status).toHaveBeenCalledWith(404);
    const sentData = res.send.mock.calls[0][0];
    expect(sentData.success).toBe(false);
    expect(sentData.message).toBe("Category not found");
  });

  it("should handle error when no products in category are found", async () => {
    const mockCategory = { _id: "456", name: "Test Category", slug: "test-category" };

    const populateMock = jest.fn().mockResolvedValue([]);

    categoryModel.findOne.mockResolvedValue(mockCategory);
    productModel.find.mockReturnValue({
      populate: populateMock,
    });

    req.params.slug = "test-category";
    await productCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: "test-category" });
    expect(populateMock).toHaveBeenCalledWith("category");
    expect(productModel.find).toHaveBeenCalledWith({ category: mockCategory });

    expect(res.status).toHaveBeenCalledWith(404);
    const sentData = res.send.mock.calls[0][0];
    expect(sentData.success).toBe(false);
    expect(sentData.message).toBe("No products found in this category");
  });

  it("should handle errors in fetching products by category (category)", async () => {
    const mockError = new Error("Database error");

    categoryModel.findOne.mockRejectedValue(mockError);

    req.params.slug = "test-category";
    await productCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: "test-category" });
    expect(res.status).toHaveBeenCalledWith(400);
    const sentData = res.send.mock.calls[0][0];
    expect(sentData.success).toBe(false);
    expect(sentData.message).toBe("Error while getting products by category");
  });

  it("should handle errors in fetching products by category (product)", async () => {
    const mockError = new Error("Database error");

    const populateMock = jest.fn().mockRejectedValue(mockError);
    categoryModel.findOne.mockResolvedValue({ _id: "456", name: "Test Category", slug: "test-category" });
    productModel.find.mockReturnValue({
      populate: populateMock,
    });

    req.params.slug = "test-category";
    await productCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: "test-category" });
    expect(res.status).toHaveBeenCalledWith(400);
    const sentData = res.send.mock.calls[0][0];
    expect(sentData.success).toBe(false);
    expect(sentData.message).toBe("Error while getting products by category");
  });
});
