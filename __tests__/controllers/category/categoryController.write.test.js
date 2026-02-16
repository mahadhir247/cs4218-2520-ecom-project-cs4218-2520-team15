/* Name: Lee Guan Kai Delon
 * Student No: A0273286W
 */

import { createCategoryController } from "../../../controllers/categoryController";

jest.mock(
  "slugify",
  () => (value) => `${value.toLowerCase().trim().replace(" ", "-")}-slug`,
);

jest.mock("../../../models/categoryModel");

import categoryModel from "../../../models/categoryModel";

describe("createCategoryController function", () => {
  let mockRes = {};

  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    mockRes.status = jest.fn(() => mockRes);
    mockRes.send = jest.fn(() => mockRes);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create category correctly", async () => {
    const mockReq = { body: { name: "Category A" } };
    categoryModel.findOne.mockResolvedValueOnce(null);
    categoryModel.mockImplementation(() => ({
      save: jest.fn(() => ({
        _id: "1",
        name: "Category A",
        slug: "category-a-slug",
      })),
    }));

    await createCategoryController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "New category created",
      category: {
        _id: "1",
        name: "Category A",
        slug: "category-a-slug",
      },
    });
  });

  it("should return error if missing fields", async () => {
    const mockReq = { body: { name: "" } };

    await createCategoryController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      message: "Name is required",
    });
  });

  it("should return error if category already exists", async () => {
    const mockReq = { body: { name: "Category A" } };
    categoryModel.findOne.mockResolvedValueOnce({
      _id: "1",
      name: "Category A",
      slug: "category-a-slug",
    });

    await createCategoryController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      message: "Category already exists",
    });
  });

  it("should return error if server issues", async () => {
    const mockReq = { body: { name: "Category A" } };
    categoryModel.findOne.mockResolvedValueOnce(null);
    categoryModel.mockImplementation(() => ({
      save: jest.fn(() => {
        throw new Error("DB error");
      }),
    }));

    await createCategoryController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: new Error("DB error"),
      message: "Error in creating category",
    });
  });
});
