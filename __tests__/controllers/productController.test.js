/* Name: Tan Qin Xu
 * Student No: A0213002J
 */

import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockGenerate = jest.fn();
const mockSale = jest.fn();

jest.mock("braintree", () => ({
  BraintreeGateway: jest.fn().mockImplementation(() => ({
    clientToken: { generate: mockGenerate },
    transaction: { sale: mockSale },
  })),
  Environment: {
    Sandbox: "sandbox",
  },
}));

jest.mock("../../models/orderModel.js", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({}),
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
    mockGenerate.mockClear();
    res = createRes();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  test("returns 500 when gateway is not initialized (NODE_ENV=test)", async () => {
    await braintreeTokenController({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Braintree not initialized");
    expect(mockGenerate).not.toHaveBeenCalled();
  });
});

describe("brainTreePaymentController", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSale.mockClear();
    res = createRes();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  test("returns 500 when gateway is not initialized (NODE_ENV=test)", async () => {
    req = {
      body: { nonce: "nonce", cart: [{ price: 10 }] },
      user: { _id: "user-test" },
    };

    await brainTreePaymentController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Braintree not initialized");
    expect(mockSale).not.toHaveBeenCalled();
  });
});