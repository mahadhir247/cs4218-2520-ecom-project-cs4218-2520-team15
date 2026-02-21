/* Name: Kok Fangyu Inez
 * Student No: A0258672R
 */

import productModel from "../../../models/productModel.js";

// Mock braintree before importing the controller
jest.mock("braintree", () => ({
  BraintreeGateway: jest.fn(),
  Environment: {
    Sandbox: "sandbox",
  },
}));

import {
  searchProductController
} from "../../../controllers/productController.js";

// Mocking the Mongoose Model
jest.mock("../../../models/productModel.js");

describe("Product Controller Unit Tests (related to Product Search)", () => {
  let req, res;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Silence console.log statements during test run
    jest.spyOn(console, "log").mockImplementation(() => {});

    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // ============================================================
  // Input Validation
  // ============================================================
  describe("Input validation test cases", () => {
    it("should return 400 when keyword param is missing", async () => {
      // Arrange
      req.params = {};

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return success: false when keyword param is missing", async () => {
      // Arrange
      req.params = {};

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    it("should return an error message when keyword param is missing", async () => {
      // Arrange
      req.params = {};

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Search keyword is required" })
      );
    });

    it("should return an empty results array when keyword param is missing", async () => {
      // Arrange
      req.params = {};

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ results: [] })
      );
    });

    it("should return 400 when keyword param is empty", async () => {
      // Arrange
      req.params = { keyword: "" };

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return success: false when keyword param is empty", async () => {
      // Arrange
      req.params = { keyword: "" };

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    it("should return an error message when keyword param is empty", async () => {
      // Arrange
      req.params = { keyword: "" };

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Search keyword is required" })
      );
    });

    it("should return an empty results array when keyword param is empty", async () => {
      // Arrange
      req.params = { keyword: "" };

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ results: [] })
      );
    });

    it("should return 400 when keyword param is whitespace only", async () => {
      // Arrange
      req.params = { keyword: "   " };

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return success: false when keyword param is whitespace only", async () => {
      // Arrange
      req.params = { keyword: "   " };

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    it("should return an error message when keyword param is whitespace only", async () => {
      // Arrange
      req.params = { keyword: "   " };

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Search keyword is required" })
      );
    });

    it("should return an empty results array when keyword param is whitespace only", async () => {
      // Arrange
      req.params = { keyword: "   " };

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ results: [] })
      );
    });
  });

  // ============================================================
  // Successful Search
  // ============================================================
  describe("Successful search test cases", () => {
    it("should return 200 when a valid keyword is provided", async () => {
      // Arrange
      req.params = { keyword: "laptop" };
      const mockSelect = jest.fn().mockResolvedValue([]);
      productModel.find.mockReturnValue({ select: mockSelect });

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return success: true when a valid keyword is provided", async () => {
      // Arrange
      req.params = { keyword: "laptop" };
      const mockSelect = jest.fn().mockResolvedValue([]);
      productModel.find.mockReturnValue({ select: mockSelect });

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it("should return a success message when a valid keyword is provided", async () => {
      // Arrange
      req.params = { keyword: "laptop" };
      const mockSelect = jest.fn().mockResolvedValue([]);
      productModel.find.mockReturnValue({ select: mockSelect });

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Products searched successfully" })
      );
    });

    it("should return matching products in results when found", async () => {
      // Arrange
      req.params = { keyword: "laptop" };
      const mockProducts = [
        { _id: "1", name: "Laptop Pro", description: "A great laptop" },
        { _id: "2", name: "Gaming Laptop", description: "Fast machine" },
      ];
      const mockSelect = jest.fn().mockResolvedValue(mockProducts);
      productModel.find.mockReturnValue({ select: mockSelect });

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ results: mockProducts })
      );  
    });

    it("should return an empty results array when no products match the keyword", async () => {
      // Arrange
      req.params = { keyword: "nonexistentproduct" };
      const mockSelect = jest.fn().mockResolvedValue([]);
      productModel.find.mockReturnValue({ select: mockSelect });

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ results: [] })
      );
    });

    it("should query productModel using a case-insensitive regex on the name field", async () => {
      // Arrange
      req.params = { keyword: "laptop" };
      const mockSelect = jest.fn().mockResolvedValue([]);
      productModel.find.mockReturnValue({ select: mockSelect });

      // Act
      await searchProductController(req, res);

      // Assert
      expect(productModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { name: { $regex: "laptop", $options: "i" } },
          ]),
        })
      );
    });

    it("should query productModel using a case-insensitive regex on the description field", async () => {
      // Arrange
      req.params = { keyword: "laptop" };
      const mockSelect = jest.fn().mockResolvedValue([]);
      productModel.find.mockReturnValue({ select: mockSelect });

      // Act
      await searchProductController(req, res);

      // Assert
      expect(productModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { description: { $regex: "laptop", $options: "i" } },
          ]),
        })
      );
    });

    it("should exclude the photo field from query results", async () => {
      // Arrange
      req.params = { keyword: "laptop" };
      const mockSelect = jest.fn().mockResolvedValue([]);
      productModel.find.mockReturnValue({ select: mockSelect });

      // Act
      await searchProductController(req, res);

      // Assert
      expect(mockSelect).toHaveBeenCalledWith("-photo");
    });
  });

  // ============================================================
  // Error Handling
  // ============================================================
  describe("Error handling test cases", () => {
    it("should return 500 when the database throws an error", async () => {
      // Arrange
      req.params = { keyword: "laptop" };
      const mockSelect = jest.fn().mockRejectedValue(new Error("DB failure"));
      productModel.find.mockReturnValue({ select: mockSelect });

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should return success: false when the database throws an error", async () => {
      // Arrange
      req.params = { keyword: "laptop" };
      const mockSelect = jest.fn().mockRejectedValue(new Error("DB failure"));
      productModel.find.mockReturnValue({ select: mockSelect });

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    it("should return an error message when the database throws an error", async () => {
      // Arrange
      req.params = { keyword: "laptop" };
      const mockSelect = jest.fn().mockRejectedValue(new Error("DB failure"));
      productModel.find.mockReturnValue({ select: mockSelect });

      // Act
      await searchProductController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Error in searching for products" })
      );
    });

    it("should log the error when the database throws an error", async () => {
      // Arrange
      req.params = { keyword: "laptop" };
      const dbError = new Error("DB failure");
      const mockSelect = jest.fn().mockRejectedValue(dbError);
      productModel.find.mockReturnValue({ select: mockSelect });

      // Act
      await searchProductController(req, res);

      // Assert
      expect(console.log).toHaveBeenCalledWith(dbError);
    });
  });
});