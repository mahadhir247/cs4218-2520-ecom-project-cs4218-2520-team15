import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import {
  braintreeTokenController,
  brainTreePaymentController,
} from "../../controllers/productController.js";

jest.mock("../../models/orderModel.js", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    save: jest.fn(),
  })),
}));

function createRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.send = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

let mockGateway;

beforeEach(() => {
  jest.clearAllMocks();

  mockGateway = {
    clientToken: {
      generate: jest.fn(),
    },
    transaction: {
      sale: jest.fn(),
    },
  };
});

describe("braintreeTokenController", () => {
  test("returns token on success", async () => {
    mockGateway.clientToken.generate.mockImplementation((_, cb) =>
      cb(null, "token123")
    );

    const res = createRes();

    await braintreeTokenController({}, res, mockGateway);

    expect(res.send).toHaveBeenCalledWith("token123");
  });

  test("returns 500 if error", async () => {
    mockGateway.clientToken.generate.mockImplementation((_, cb) =>
      cb("error", null)
    );

    const res = createRes();

    await braintreeTokenController({}, res, mockGateway);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("brainTreePaymentController", () => {
  test("successful payment", async () => {
    mockGateway.transaction.sale.mockImplementation((_, cb) =>
      cb(null, { success: true })
    );

    const req = {
      body: { nonce: "nonce123", cart: [{ price: 10 }, { price: 5 }] },
      user: { _id: "user1" },
    };

    const res = createRes();

    await brainTreePaymentController(req, res, mockGateway);

    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  test("payment failure", async () => {
    mockGateway.transaction.sale.mockImplementation((_, cb) =>
      cb("payment failed", null)
    );

    const req = {
      body: { nonce: "nonce123", cart: [{ price: 10 }] },
      user: { _id: "user1" },
    };

    const res = createRes();

    await brainTreePaymentController(req, res, mockGateway);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
