import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockFindOne = jest.fn();
const mockFind = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockFindByIdAndDelete = jest.fn();
const mockSave = jest.fn();
const MockCategoryModel = jest.fn(() => ({ save: mockSave }));
MockCategoryModel.findOne = mockFindOne;
MockCategoryModel.find = mockFind;
MockCategoryModel.findByIdAndUpdate = mockFindByIdAndUpdate;
MockCategoryModel.findByIdAndDelete = mockFindByIdAndDelete;

const mockSlugify = jest.fn((name) => name.toLowerCase().replace(/\s+/g, "-"));

await jest.unstable_mockModule("../models/categoryModel.js", () => ({
  default: MockCategoryModel,
}));

await jest.unstable_mockModule("slugify", () => ({
  default: mockSlugify,
}));

const {
  createCategoryController,
  updateCategoryController,
  categoryControlller,
  singleCategoryController,
  deleteCategoryCOntroller,
} = await import("./categoryController.js");

function createRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.send = jest.fn(() => res);
  return res;
}

describe("createCategoryController", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = createRes();
  });

  test("returns 401 when name is missing", async () => {
    req = { body: {} };

    await createCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ message: "Name is required" });
    expect(mockFindOne).not.toHaveBeenCalled();
  });

  test("returns 200 when category already exists", async () => {
    req = { body: { name: "Electronics" } };
    mockFindOne.mockResolvedValue({ _id: "existing-id", name: "Electronics" });

    await createCategoryController(req, res);

    expect(mockFindOne).toHaveBeenCalledWith({ name: "Electronics" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Category Already Exisits",
    });
    expect(MockCategoryModel).not.toHaveBeenCalled();
  });

  test("creates category and returns 201 on success", async () => {
    req = { body: { name: "Electronics" } };
    mockFindOne.mockResolvedValue(null);
    const savedCategory = { _id: "new-id", name: "Electronics", slug: "electronics" };
    mockSave.mockResolvedValue(savedCategory);

    await createCategoryController(req, res);

    expect(mockFindOne).toHaveBeenCalledWith({ name: "Electronics" });
    expect(MockCategoryModel).toHaveBeenCalledWith({
      name: "Electronics",
      slug: "electronics",
    });
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "new category created",
      category: savedCategory,
    });
  });

  test("returns 500 when an unexpected error is thrown", async () => {
    req = { body: { name: "Electronics" } };
    mockFindOne.mockRejectedValue(new Error("DB crashed"));

    await createCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "Error in Category" })
    );
  });
});

describe("updateCategoryController", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = createRes();
  });

  test("updates category and returns 200 on success", async () => {
    req = { body: { name: "New Name" }, params: { id: "cat-123" } };
    const updatedCategory = { _id: "cat-123", name: "New Name", slug: "new-name" };
    mockFindByIdAndUpdate.mockResolvedValue(updatedCategory);

    await updateCategoryController(req, res);

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      "cat-123",
      { name: "New Name", slug: "new-name" },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      messsage: "Category Updated Successfully",
      category: updatedCategory,
    });
  });

  test("returns 500 when an unexpected error is thrown", async () => {
    req = { body: { name: "New Name" }, params: { id: "cat-123" } };
    mockFindByIdAndUpdate.mockRejectedValue(new Error("DB crashed"));

    await updateCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "Error while updating category" })
    );
  });
});

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
      message: "Get SIngle Category SUccessfully",
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

describe("deleteCategoryCOntroller", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = createRes();
  });

  test("deletes category and returns 200 on success", async () => {
    req = { params: { id: "cat-123" } };
    mockFindByIdAndDelete.mockResolvedValue({});

    await deleteCategoryCOntroller(req, res);

    expect(mockFindByIdAndDelete).toHaveBeenCalledWith("cat-123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Categry Deleted Successfully",
    });
  });

  test("returns 500 when an unexpected error is thrown", async () => {
    req = { params: { id: "cat-123" } };
    mockFindByIdAndDelete.mockRejectedValue(new Error("DB crashed"));

    await deleteCategoryCOntroller(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: "error while deleting category" })
    );
  });
});