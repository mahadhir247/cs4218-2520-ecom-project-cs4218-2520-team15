import { jest, describe, test, expect, beforeEach } from "@jest/globals";

jest.mock("../../models/categoryModel.js", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock("slugify", () => ({
  __esModule: true,
  default: jest.fn(),
}));

import categoryModel from "../../models/categoryModel.js";

import {
  categoryController as categoryController,
  singleCategoryController,
} from "../../controllers/categoryController.js";

function createRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.send = jest.fn(() => res);
  return res;
}

describe("categoryController", () => {
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = createRes();
  });

  test("returns all categories with 200 on success", async () => {
    const categories = [
      { _id: "1", name: "Electronics" },
      { _id: "2", name: "Clothing" },
    ];

    categoryModel.find.mockResolvedValue(categories);

    await categoryController({}, res);

    expect(categoryModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "All Categories List",
      category: categories,
    });
  });

  test("returns 500 when error occurs", async () => {
    categoryModel.find.mockRejectedValue(new Error("DB crashed"));

    await categoryController({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Error while getting all categories",
      })
    );
  });
});

describe("singleCategoryController", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = createRes();
  });

  test("returns single category with 200 on success", async () => {
    const category = {
      _id: "1",
      name: "Electronics",
      slug: "electronics",
    };

    req = { params: { slug: "electronics" } };
    categoryModel.findOne.mockResolvedValue(category);

    await singleCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({
      slug: "electronics",
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Get Single Category Successfully",
      category,
    });
  });

  test("returns 500 when error occurs", async () => {
    req = { params: { slug: "electronics" } };
    categoryModel.findOne.mockRejectedValue(new Error("DB crashed"));

    await singleCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Error While getting Single Category",
      })
    );
  });
});
