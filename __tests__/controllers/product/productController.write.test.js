import {
  createProductController,
  updateProductController,
} from "../../../controllers/productController";

jest.mock(
  "slugify",
  () => (value) => `${value.toLowerCase().trim().replace(" ", "-")}-slug`,
);

jest.mock("fs", () => ({ readFileSync: jest.fn(() => "mock-file") }));

jest.mock("../../../models/productModel");

import productModel from "../../../models/productModel";

describe("createProductController function", () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };

  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    productModel.mockImplementation((data) => {
      const product = { ...data };
      Object.defineProperty(product, "save", {
        value: jest.fn(),
        enumerable: false,
      });
      return product;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create product correctly", async () => {
    const mockReq = {
      fields: {
        name: "Laptop",
        description: "A mock laptop",
        price: "9.99",
        category: "1",
        quantity: "10",
        shipping: "0",
      },
      files: {
        photo: {
          path: "/path/mock-file.png",
          type: "image/png",
          size: 100,
        },
      },
    };

    await createProductController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Product created successfully",
      products: {
        name: "Laptop",
        slug: "laptop-slug",
        description: "A mock laptop",
        price: "9.99",
        category: "1",
        quantity: "10",
        shipping: 0,
        photo: {
          data: "mock-file",
          contentType: "image/png",
        },
      },
    });
  });

  it("should create product correctly if shipping is undefined", async () => {
    const mockReq = {
      fields: {
        name: "Laptop",
        description: "A mock laptop",
        price: "9.99",
        category: "1",
        quantity: "10",
      },
      files: {
        photo: {
          path: "/path/mock-file.png",
          type: "image/png",
          size: 100,
        },
      },
    };

    await createProductController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Product created successfully",
      products: {
        name: "Laptop",
        slug: "laptop-slug",
        description: "A mock laptop",
        price: "9.99",
        category: "1",
        quantity: "10",
        shipping: false,
        photo: {
          data: "mock-file",
          contentType: "image/png",
        },
      },
    });
  });

  it("should return error if server issues", async () => {
    const mockReq = {
      fields: {
        name: "Laptop",
        description: "A mock laptop",
        price: "9.99",
        category: "1",
        quantity: "10",
      },
      files: {
        photo: {
          path: "/path/mock-file.png",
          type: "image/png",
          size: 100,
        },
      },
    };
    productModel.mockImplementation((data) => {
      const product = { ...data };
      Object.defineProperty(product, "save", {
        value: jest.fn().mockRejectedValue(new Error("Create product error")),
        enumerable: false,
      });
      return product;
    });

    await createProductController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: new Error("Create product error"),
      message: "Error in creating product",
    });
  });

  describe("Field validation", () => {
    it("should return error if name is missing", async () => {
      const mockReq = {
        fields: {
          description: "A mock laptop",
          price: "9.99",
          category: "1",
          quantity: "10",
        },
        files: {
          photo: {
            path: "/path/mock-file.png",
            type: "image/png",
            size: 100,
          },
        },
      };

      await createProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        message: "Name is required",
      });
    });

    it("should return error if description is missing", async () => {
      const mockReq = {
        fields: {
          name: "Laptop",
          price: "9.99",
          category: "1",
          quantity: "10",
        },
        files: {
          photo: {
            path: "/path/mock-file.png",
            type: "image/png",
            size: 100,
          },
        },
      };

      await createProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        message: "Description is required",
      });
    });

    it("should return error if price is missing", async () => {
      const mockReq = {
        fields: {
          name: "Laptop",
          description: "A mock laptop",
          category: "1",
          quantity: "10",
        },
        files: {
          photo: {
            path: "/path/mock-file.png",
            type: "image/png",
            size: 100,
          },
        },
      };

      await createProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        message: "Price is required",
      });
    });

    it("should return error if category is missing", async () => {
      const mockReq = {
        fields: {
          name: "Laptop",
          description: "A mock laptop",
          price: "9.99",
          quantity: "10",
        },
        files: {
          photo: {
            path: "/path/mock-file.png",
            type: "image/png",
            size: 100,
          },
        },
      };

      await createProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        message: "Category is required",
      });
    });

    it("should return error if quantity is missing", async () => {
      const mockReq = {
        fields: {
          name: "Laptop",
          description: "A mock laptop",
          price: "9.99",
          category: "1",
        },
        files: {
          photo: {
            path: "/path/mock-file.png",
            type: "image/png",
            size: 100,
          },
        },
      };

      await createProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        message: "Quantity is required",
      });
    });

    it("should return error if photo is missing", async () => {
      const mockReq = {
        fields: {
          name: "Laptop",
          description: "A mock laptop",
          price: "9.99",
          category: "1",
          quantity: "10",
        },
        files: {},
      };

      await createProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        message: "Photo is required",
      });
    });

    it("should return error if photo size exceed limit", async () => {
      const mockReq = {
        fields: {
          name: "Laptop",
          description: "A mock laptop",
          price: "9.99",
          category: "1",
          quantity: "10",
          shipping: "0",
        },
        files: {
          photo: {
            path: "/path/mock-file.png",
            type: "image/png",
            size: 1000001,
          },
        },
      };

      await createProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        message: "Photo should be less then 1MB",
      });
    });

    it("should do nothing if photo size equals to limit", async () => {
      const mockReq = {
        fields: {
          name: "Laptop",
          description: "A mock laptop",
          price: "9.99",
          category: "1",
          quantity: "10",
          shipping: "0",
        },
        files: {
          photo: {
            path: "/path/mock-file.png",
            type: "image/png",
            size: 1000000,
          },
        },
      };

      await createProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: true,
        message: "Product created successfully",
        products: {
          name: "Laptop",
          slug: "laptop-slug",
          description: "A mock laptop",
          price: "9.99",
          category: "1",
          quantity: "10",
          shipping: 0,
          photo: {
            data: "mock-file",
            contentType: "image/png",
          },
        },
      });
    });
  });
});

describe("updateProductController function", () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  const modelSaveWrapper = (data) => {
    const product = { ...data };
    Object.defineProperty(product, "save", {
      value: jest.fn(),
      enumerable: false,
    });
    return product;
  };

  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should update product correctly", async () => {
    const mockReq = {
      params: { pid: "1" },
      fields: {
        name: "Computer",
        description: "A mock computer",
        price: "10.99",
        category: "1",
        quantity: "10",
        shipping: "1",
      },
      files: {
        photo: {
          path: "/path/mock-file-1.png",
          type: "image/png",
          size: 100,
        },
      },
    };
    productModel.findByIdAndUpdate.mockResolvedValueOnce(
      modelSaveWrapper({
        _id: "1",
        name: "Computer",
        description: "A mock computer",
        price: 10.99,
        category: "1",
        quantity: 10,
        shipping: true,
        photo: {
          data: "mock-file-1",
          contentType: "image/png",
        },
      }),
    );

    await updateProductController(mockReq, mockRes);

    expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "1",
      {
        name: "Computer",
        description: "A mock computer",
        price: "10.99",
        category: "1",
        quantity: "10",
        shipping: "1",
        slug: "computer-slug",
        shipping: 1,
      },
      { new: true },
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Product updated successfully",
      products: {
        _id: "1",
        name: "Computer",
        description: "A mock computer",
        price: 10.99,
        category: "1",
        quantity: 10,
        shipping: true,
        photo: {
          data: "mock-file",
          contentType: "image/png",
        },
      },
    });
  });

  it("should update product correctly if shipping is undefined", async () => {
    const mockReq = {
      params: { pid: "1" },
      fields: {
        name: "Computer",
        description: "A mock computer",
        price: "10.99",
        category: "1",
        quantity: "10",
      },
      files: {
        photo: {
          path: "/path/mock-file-1.png",
          type: "image/png",
          size: 100,
        },
      },
    };
    productModel.findByIdAndUpdate.mockResolvedValueOnce(
      modelSaveWrapper({
        _id: "1",
        name: "Computer",
        description: "A mock computer",
        price: 10.99,
        category: "1",
        quantity: 10,
        shipping: false,
        photo: {
          data: "mock-file-1",
          contentType: "image/png",
        },
      }),
    );

    await updateProductController(mockReq, mockRes);

    expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "1",
      {
        name: "Computer",
        description: "A mock computer",
        price: "10.99",
        category: "1",
        quantity: "10",
        shipping: "1",
        slug: "computer-slug",
        shipping: false,
      },
      { new: true },
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Product updated successfully",
      products: {
        _id: "1",
        name: "Computer",
        description: "A mock computer",
        price: 10.99,
        category: "1",
        quantity: 10,
        shipping: false,
        photo: {
          data: "mock-file",
          contentType: "image/png",
        },
      },
    });
  });

  it("should update product correctly if photo is undefined", async () => {
    const mockReq = {
      params: { pid: "1" },
      fields: {
        name: "Computer",
        description: "A mock computer",
        price: "10.99",
        category: "1",
        quantity: "10",
        shipping: "1",
      },
      files: {},
    };
    productModel.findByIdAndUpdate.mockResolvedValueOnce(
      modelSaveWrapper({
        _id: "1",
        name: "Computer",
        description: "A mock computer",
        price: 10.99,
        category: "1",
        quantity: 10,
        shipping: true,
        photo: {
          data: "mock-file",
          contentType: "image/png",
        },
      }),
    );

    await updateProductController(mockReq, mockRes);

    expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "1",
      {
        name: "Computer",
        description: "A mock computer",
        price: "10.99",
        category: "1",
        quantity: "10",
        shipping: "1",
        slug: "computer-slug",
        shipping: 1,
      },
      { new: true },
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Product updated successfully",
      products: {
        _id: "1",
        name: "Computer",
        description: "A mock computer",
        price: 10.99,
        category: "1",
        quantity: 10,
        shipping: true,
        photo: {
          data: "mock-file",
          contentType: "image/png",
        },
      },
    });
  });

  it("should return error if product does not exist", async () => {
    const mockReq = {
      params: { pid: "1" },
      fields: {
        name: "Computer",
        description: "A mock computer",
        price: "10.99",
        category: "1",
        quantity: "10",
        shipping: "1",
      },
      files: {},
    };
    productModel.findByIdAndUpdate.mockResolvedValueOnce(null);

    await updateProductController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      message: "Product does not exist",
    });
  });

  it("should return error if server issues", async () => {
    const mockReq = {
      params: { pid: "1" },
      fields: {
        name: "Computer",
        description: "A mock computer",
        price: "10.99",
        category: "1",
        quantity: "10",
        shipping: "1",
      },
      files: {},
    };
    productModel.findByIdAndUpdate.mockRejectedValue(
      new Error("Update product error"),
    );

    await updateProductController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: new Error("Update product error"),
      message: "Error in updating product",
    });
  });

  describe("Field validation", () => {
    it("should return error if name is missing", async () => {
      const mockReq = {
        params: { pid: "1" },
        fields: {
          description: "A mock computer",
          price: "10.99",
          category: "1",
          quantity: "10",
          shipping: "1",
        },
        files: {},
      };

      await updateProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        message: "Name is required",
      });
    });

    it("should return error if description is missing", async () => {
      const mockReq = {
        params: { pid: "1" },
        fields: {
          name: "Computer",
          price: "10.99",
          category: "1",
          quantity: "10",
          shipping: "1",
        },
        files: {},
      };

      await updateProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        message: "Description is required",
      });
    });

    it("should return error if price is missing", async () => {
      const mockReq = {
        params: { pid: "1" },
        fields: {
          name: "Computer",
          description: "A mock computer",
          category: "1",
          quantity: "10",
          shipping: "1",
        },
        files: {},
      };

      await updateProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        message: "Price is required",
      });
    });

    it("should return error if category is missing", async () => {
      const mockReq = {
        params: { pid: "1" },
        fields: {
          name: "Computer",
          description: "A mock computer",
          price: "10.99",
          quantity: "10",
          shipping: "1",
        },
        files: {},
      };

      await updateProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        message: "Category is required",
      });
    });

    it("should return error if quantity is missing", async () => {
      const mockReq = {
        params: { pid: "1" },
        fields: {
          name: "Computer",
          description: "A mock computer",
          price: "10.99",
          category: "1",
          shipping: "1",
        },
        files: {},
      };

      await updateProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        message: "Quantity is required",
      });
    });

    it("should return error if photo size exceed limit", async () => {
      const mockReq = {
        params: { pid: "1" },
        fields: {
          name: "Computer",
          description: "A mock computer",
          price: "10.99",
          category: "1",
          quantity: "10",
          shipping: "1",
        },
        files: {
          photo: {
            path: "/path/mock-file.png",
            type: "image/png",
            size: 1000001,
          },
        },
      };

      await updateProductController(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: false,
        message: "Photo should be less then 1MB",
      });
    });

    it("should do nothing if photo size equals to limit", async () => {
      const mockReq = {
        params: { pid: "1" },
        fields: {
          name: "Computer",
          description: "A mock computer",
          price: "10.99",
          category: "1",
          quantity: "10",
          shipping: "1",
        },
        files: {
          photo: {
            path: "/path/mock-file.png",
            type: "image/png",
            size: 1000000,
          },
        },
      };
      productModel.findByIdAndUpdate.mockResolvedValueOnce(
        modelSaveWrapper({
          _id: "1",
          name: "Computer",
          description: "A mock computer",
          price: 10.99,
          category: "1",
          quantity: 10,
          shipping: true,
          photo: {
            data: "mock-file-1",
            contentType: "image/png",
          },
        }),
      );

      await updateProductController(mockReq, mockRes);

      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "1",
        {
          name: "Computer",
          description: "A mock computer",
          price: "10.99",
          category: "1",
          quantity: "10",
          shipping: "1",
          slug: "computer-slug",
          shipping: 1,
        },
        { new: true },
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith({
        success: true,
        message: "Product updated successfully",
        products: {
          _id: "1",
          name: "Computer",
          description: "A mock computer",
          price: 10.99,
          category: "1",
          quantity: 10,
          shipping: true,
          photo: {
            data: "mock-file",
            contentType: "image/png",
          },
        },
      });
    });
  });
});
