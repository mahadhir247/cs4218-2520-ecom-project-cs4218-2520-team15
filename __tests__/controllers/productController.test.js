import { jest, describe, test, expect, beforeEach } from "@jest/globals";

jest.mock("dotenv", () => ({ config: jest.fn() }));
jest.mock("fs", () => ({ readFileSync: jest.fn(() => Buffer.from("data")) }));
jest.mock("slugify", () => jest.fn(() => "slugged"));

jest.mock("braintree", () => ({
  __esModule: true,
  BraintreeGateway: jest.fn().mockImplementation(() => ({
    clientToken: { generate: jest.fn() },
    transaction: { sale: jest.fn() },
  })),
  Environment: { Sandbox: "sandbox" },
}));

jest.mock("../../models/orderModel.js", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    save: jest.fn(),
  })),
}));

jest.mock("../../models/productModel.js", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../../models/categoryModel.js", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}));

import productModel from "../../models/productModel.js";
import categoryModel from "../../models/categoryModel.js";
import orderModel from "../../models/orderModel.js";
import { BraintreeGateway } from "braintree";

import {
  createProductController,
  getProductController,
  getSingleProductController,
  productPhotoController,
  deleteProductController,
  updateProductController,
  productFiltersController,
  productCountController,
  productListController,
  searchProductController,
  relatedProductController,
  productCategoryController,
  braintreeTokenController,
  brainTreePaymentController,
} from "../../controllers/productController.js";

function createRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.send = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.set = jest.fn(() => res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createProductController", () => {
  test("validation fail", async () => {
    const res = createRes();
    await createProductController({ fields: {}, files: {} }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("success", async () => {
    const saveMock = jest.fn();
    productModel.mockImplementation(() => ({
      photo: {},
      save: saveMock,
    }));

    const req = {
      fields: {
        name: "A",
        description: "B",
        price: 10,
        category: "C",
        quantity: 1,
      },
      files: {},
    };

    const res = createRes();
    await createProductController(req, res);

    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe("getProductController", () => {
  test("success", async () => {
    productModel.find = jest.fn(() => ({
      populate: () => ({
        select: () => ({
          limit: () => ({
            sort: () => [],
          }),
        }),
      }),
    }));

    const res = createRes();
    await getProductController({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("getSingleProductController", () => {
  test("404", async () => {
    productModel.findOne = jest.fn(() => ({
      select: () => ({
        populate: () => null,
      }),
    }));

    const res = createRes();
    await getSingleProductController({ params: { slug: "x" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("productPhotoController", () => {
  test("product not found", async () => {
    productModel.findById = jest.fn(() => ({
      select: () => null,
    }));

    const res = createRes();
    await productPhotoController({ params: { pid: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("photo success", async () => {
    productModel.findById = jest.fn(() => ({
      select: () => ({
        photo: { data: Buffer.from("a"), contentType: "image/png" },
      }),
    }));

    const res = createRes();
    await productPhotoController({ params: { pid: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("deleteProductController", () => {
  test("success", async () => {
    productModel.findByIdAndDelete = jest.fn(() => ({
      select: () => ({}),
    }));

    const res = createRes();
    await deleteProductController({ params: { pid: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("updateProductController", () => {
  test("validation fail", async () => {
    const res = createRes();
    await updateProductController({ fields: {}, files: {} }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("success", async () => {
    const saveMock = jest.fn();
    productModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
      photo: {},
      save: saveMock,
    });

    const req = {
      params: { pid: "1" },
      fields: {
        name: "A",
        description: "B",
        price: 10,
        category: "C",
        quantity: 1,
      },
      files: {},
    };

    const res = createRes();
    await updateProductController(req, res);
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe("filters", () => {
  test("filter success", async () => {
    productModel.find = jest.fn().mockResolvedValue([]);
    const res = createRes();
    await productFiltersController({ body: { checked: [], radio: [] } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("productCountController", () => {
  test("success", async () => {
    productModel.find = jest.fn(() => ({
      estimatedDocumentCount: () => 5,
    }));

    const res = createRes();
    await productCountController({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("productListController", () => {
  test("success", async () => {
    productModel.find = jest.fn(() => ({
      select: () => ({
        skip: () => ({
          limit: () => ({
            sort: () => [],
          }),
        }),
      }),
    }));

    const res = createRes();
    await productListController({ params: { page: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("searchProductController", () => {
  test("success", async () => {
    productModel.find = jest.fn(() => ({
      select: () => [],
    }));

    const res = createRes();
    await searchProductController({ params: { keyword: "a" } }, res);
    expect(res.json).toHaveBeenCalled();
  });
});

describe("relatedProductController", () => {
  test("success", async () => {
    productModel.find = jest.fn(() => ({
      select: () => ({
        limit: () => ({
          populate: () => [],
        }),
      }),
    }));

    const res = createRes();
    await relatedProductController(
      { params: { pid: "1", cid: "2" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("productCategoryController", () => {
  test("404", async () => {
    categoryModel.findOne.mockResolvedValue(null);
    const res = createRes();
    await productCategoryController({ params: { slug: "x" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("braintree controllers", () => {
  test("token success", async () => {
    const gateway = new BraintreeGateway();
    gateway.clientToken.generate.mockImplementation((o, cb) =>
      cb(null, "token")
    );

    const res = createRes();
    await braintreeTokenController({}, res, gateway);
    expect(res.send).toHaveBeenCalledWith("token");
  });

  test("payment success", async () => {
    const gateway = new BraintreeGateway();
    gateway.transaction.sale.mockImplementation((o, cb) =>
      cb(null, { status: "ok" })
    );

    const req = {
      body: { nonce: "n", cart: [{ price: 10 }] },
      user: { _id: "u" },
    };

    const res = createRes();
    await brainTreePaymentController(req, res, gateway);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });
});
