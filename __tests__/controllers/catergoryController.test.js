import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockFindOne = jest.fn();
const mockFind = jest.fn();

const MockCategoryModel = jest.fn();
MockCategoryModel.findOne = mockFindOne;
MockCategoryModel.find = mockFind;

await jest.unstable_mockModule("../../models/categoryModel.js", () => ({
  default: MockCategoryModel,
}));

await jest.unstable_mockModule("slugify", () => ({
  default: jest.fn(),
}));

const {
  categoryControlller,
  singleCategoryController,
} = await import("../../controllers/categoryController.js");

function createRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.send = jest.fn(() => res);
  return res;
}

describe("categoryControlller", () => {
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
    mockFind.mockResolvedValue(categories);

    await categoryControlller({}, res);

    expect(mockFind).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "All Categories List",
      category: categories,
    });
  });

  test("returns 500 when an unexpected error is thrown", async () => {
    mockFind.mockRejectedValue(new Error("DB crashed"));

    await categoryControlller({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "Error while getting all categories" })
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
    const category = { _id: "1", name: "Electronics", slug: "electronics" };
    req = { params: { slug: "electronics" } };
    mockFindOne.mockResolvedValue(category);

    await singleCategoryController(req, res);

    expect(mockFindOne).toHaveBeenCalledWith({ slug: "electronics" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Get Single Category SUccessfully",
      category,
    });
  });

  test("returns 500 when an unexpected error is thrown", async () => {
    req = { params: { slug: "electronics" } };
    mockFindOne.mockRejectedValue(new Error("DB crashed"));

    await singleCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "Error While getting Single Category" })
    );
  });
});