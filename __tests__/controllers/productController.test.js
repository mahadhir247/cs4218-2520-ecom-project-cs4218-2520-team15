import { jest, describe, test, expect, beforeEach } from "@jest/globals";

jest.mock("braintree", () => {
  return {
    __esModule: true,
    BraintreeGateway: jest.fn().mockImplementation(() => ({
      clientToken: { generate: jest.fn() },
      transaction: { sale: jest.fn() },
    })),
    Environment: { Sandbox: "sandbox" },
  };
});

jest.mock("../../models/orderModel.js", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    save: jest.fn(),
  })),
}));

jest.mock("dotenv", () => ({ config: jest.fn() }));
jest.mock("../../models/productModel.js");
jest.mock("../../models/categoryModel.js");
jest.mock("fs");
jest.mock("slugify");

import {
  braintreeTokenController,
  brainTreePaymentController,
} from "../../controllers/productController.js";
import orderModel from "../../models/orderModel.js";
import { BraintreeGateway } from "braintree";

function createRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.send = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("braintreeTokenController", () => {
  let res, gateway;

  beforeEach(() => {
    jest.clearAllMocks();
    res = createRes();
    gateway = new BraintreeGateway();
  });

  test("sends client token when gateway generates it successfully", async () => {
    const mockToken = "test-braintree-client-token";
    gateway.clientToken.generate.mockImplementation((opts, cb) => cb(null, mockToken));

    await braintreeTokenController({}, res, gateway);

    expect(gateway.clientToken.generate).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(mockToken);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("returns 500 when gateway callback returns an error", async () => {
    const mockError = new Error("Braintree token generation failed");
    gateway.clientToken.generate.mockImplementation((opts, cb) => cb(mockError, null));

    await braintreeTokenController({}, res, gateway);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(mockError);
  });

  test("returns 500 when an unexpected error is thrown", async () => {
    const unexpectedError = new Error("Unexpected crash");
    gateway.clientToken.generate.mockImplementation(() => { throw unexpectedError; });

    await braintreeTokenController({}, res, gateway);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(unexpectedError);
  });
});

describe("brainTreePaymentController", () => {
  let req, res, gateway;

  beforeEach(() => {
    jest.clearAllMocks();
    res = createRes();
    gateway = new BraintreeGateway();
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

    gateway.transaction.sale.mockImplementation((saleOptions, cb) =>
      cb(null, { status: "submitted_for_settlement" })
    );

    await brainTreePaymentController(req, res, gateway);

    const totalAmount = cart.reduce((sum, i) => sum + i.price, 0);

    const [saleArgs] = gateway.transaction.sale.mock.calls[0];
    expect(saleArgs.amount).toBe(totalAmount);
    expect(saleArgs.paymentMethodNonce).toBe("test-nonce");
    expect(saleArgs.options.submitForSettlement).toBe(true);

    expect(orderModel).toHaveBeenCalledWith({
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
    gateway.transaction.sale.mockImplementation((saleOptions, cb) => cb(paymentError, null));

    await brainTreePaymentController(req, res, gateway);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(paymentError);
    expect(orderModel).not.toHaveBeenCalled();
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

    gateway.transaction.sale.mockImplementation((saleOptions, cb) =>
      cb(null, { status: "submitted_for_settlement" })
    );

    await brainTreePaymentController(req, res, gateway);

    const [saleArgs] = gateway.transaction.sale.mock.calls[0];
    expect(saleArgs.amount).toBe(50);
  });

  test("processes payment correctly with a single item in cart", async () => {
    const cart = [{ _id: "1", name: "Solo Item", price: 99 }];

    req = {
      body: { nonce: "single-nonce", cart },
      user: { _id: "user-solo" },
    };

    gateway.transaction.sale.mockImplementation((saleOptions, cb) =>
      cb(null, { status: "submitted_for_settlement" })
    );

    await brainTreePaymentController(req, res, gateway);

    const [saleArgs] = gateway.transaction.sale.mock.calls[0];
    expect(saleArgs.amount).toBe(99);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  test("returns 500 when an unexpected error is thrown", async () => {
    req = {
      body: { nonce: "nonce", cart: [{ price: 10 }] },
      user: { _id: "user-crash" },
    };

    const unexpectedError = new Error("Something exploded");
    gateway.transaction.sale.mockImplementation(() => { throw unexpectedError; });

    await brainTreePaymentController(req, res, gateway);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(unexpectedError);
  });
});
