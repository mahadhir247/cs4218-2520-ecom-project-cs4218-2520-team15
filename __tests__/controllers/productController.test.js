import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockGenerate = jest.fn();
const mockSale = jest.fn();
const mockSave = jest.fn().mockResolvedValue({});
const MockOrderModel = jest.fn(() => ({ save: mockSave }));

await jest.unstable_mockModule("braintree", () => ({
  default: {
    BraintreeGateway: jest.fn(() => ({
      clientToken: { generate: mockGenerate },
      transaction: { sale: mockSale },
    })),
    Environment: { Sandbox: "sandbox" },
  },
}));

await jest.unstable_mockModule("../../models/orderModel.js", () => ({
  default: MockOrderModel,
}));

await jest.unstable_mockModule("dotenv", () => ({
  default: { config: jest.fn() },
}));

await jest.unstable_mockModule("../../models/productModel.js", () => ({
  default: jest.fn(),
}));

await jest.unstable_mockModule("../../models/categoryModel.js", () => ({
  default: jest.fn(),
}));

await jest.unstable_mockModule("fs", () => ({
  default: jest.fn(),
}));

await jest.unstable_mockModule("slugify", () => ({
  default: jest.fn(),
}));

const { braintreeTokenController, brainTreePaymentController } =
  await import("../../controllers/productController.js");

function createRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.send = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("braintreeTokenController", () => {
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = createRes();
  });

  test("sends client token when gateway generates it successfully", async () => {
    const mockToken = "test-braintree-client-token";
    mockGenerate.mockImplementation((options, callback) => {
      callback(null, mockToken);
    });

    await braintreeTokenController({}, res);

    expect(mockGenerate).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(mockToken);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("returns 500 when gateway callback returns an error", async () => {
    const mockError = new Error("Braintree token generation failed");
    mockGenerate.mockImplementation((options, callback) => {
      callback(mockError, null);
    });

    await braintreeTokenController({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(mockError);
  });

  test("returns 500 when an unexpected error is thrown", async () => {
    const unexpectedError = new Error("Unexpected crash");
    mockGenerate.mockImplementation(() => {
      throw unexpectedError;
    });

    await braintreeTokenController({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(unexpectedError);
  });
});

describe("brainTreePaymentController", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = createRes();
  });

  test("processes payment and creates order on success", async () => {
    const cart = [
      { _id: "1", name: "Item A", price: 15 },
      { _id: "2", name: "Item B", price: 25 },
    ];
    req = {
      body: { nonce: "test-nonce", cart },
      user: { _id: "user-123" },
    };

    mockSale.mockImplementation((saleOptions, callback) => {
      callback(null, { status: "submitted_for_settlement" });
    });

    await brainTreePaymentController(req, res);

    expect(mockSale).toHaveBeenCalledTimes(1);
    const [saleArgs] = mockSale.mock.calls[0];
    expect(saleArgs.amount).toBe(40);
    expect(saleArgs.paymentMethodNonce).toBe("test-nonce");
    expect(saleArgs.options.submitForSettlement).toBe(true);

    expect(MockOrderModel).toHaveBeenCalledWith({
      products: cart,
      payment: { status: "submitted_for_settlement" },
      buyer: "user-123",
    });

    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  test("returns 500 when payment transaction fails", async () => {
    const cart = [{ _id: "1", name: "Item A", price: 10 }];
    req = {
      body: { nonce: "bad-nonce", cart },
      user: { _id: "user-456" },
    };
    const paymentError = new Error("Card declined");

    mockSale.mockImplementation((saleOptions, callback) => {
      callback(paymentError, null);
    });

    await brainTreePaymentController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(paymentError);
    expect(MockOrderModel).not.toHaveBeenCalled();
  });

  test("calculates total correctly for multiple cart items", async () => {
    const cart = [
      { _id: "1", price: 5 },
      { _id: "2", price: 10 },
      { _id: "3", price: 35 },
    ];
    req = {
      body: { nonce: "nonce-abc", cart },
      user: { _id: "user-789" },
    };

    mockSale.mockImplementation((saleOptions, callback) => {
      callback(null, { status: "submitted_for_settlement" });
    });

    await brainTreePaymentController(req, res);

    const [saleArgs] = mockSale.mock.calls[0];
    expect(saleArgs.amount).toBe(50);
  });

  test("processes payment correctly with a single item in cart", async () => {
    const cart = [{ _id: "1", name: "Solo Item", price: 99 }];
    req = {
      body: { nonce: "single-nonce", cart },
      user: { _id: "user-solo" },
    };

    mockSale.mockImplementation((saleOptions, callback) => {
      callback(null, { status: "submitted_for_settlement" });
    });

    await brainTreePaymentController(req, res);

    const [saleArgs] = mockSale.mock.calls[0];
    expect(saleArgs.amount).toBe(99);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  test("returns 500 when an unexpected error is thrown", async () => {
    req = {
      body: { nonce: "nonce", cart: [{ price: 10 }] },
      user: { _id: "user-crash" },
    };
    const unexpectedError = new Error("Something exploded");
    mockSale.mockImplementation(() => {
      throw unexpectedError;
    });

    await brainTreePaymentController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(unexpectedError);
  });
});