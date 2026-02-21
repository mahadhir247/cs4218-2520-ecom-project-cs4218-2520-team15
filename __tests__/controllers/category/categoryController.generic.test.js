/* Name: Tan Qin Xu
 * Student No: A0213002J
 */

import { jest, describe, test, expect, beforeEach } from "@jest/globals";

jest.mock("../../../models/categoryModel.js", () => ({
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

import categoryModel from "../../../models/categoryModel.js";
import {
    categoryController,
    singleCategoryController,
} from "../../../controllers/categoryController.js";

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

    test("returns all categories with status 200 on success", async () => {
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

    test("returns empty array with status 200 when no categories exist", async () => {
        categoryModel.find.mockResolvedValue([]);

        await categoryController({}, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "All Categories List",
            category: [],
        });
    });

    test("returns status 500 with error details when database throws", async () => {
        const dbError = new Error("DB crashed");
        categoryModel.find.mockRejectedValue(dbError);

        await categoryController({}, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: dbError,
            message: "Error while getting all categories",
        });
    });
});

describe("singleCategoryController", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        res = createRes();
    });

    test("returns single category with status 200 when found by slug", async () => {
        const category = { _id: "1", name: "Electronics", slug: "electronics" };
        req = { params: { slug: "electronics" } };
        categoryModel.findOne.mockResolvedValue(category);

        await singleCategoryController(req, res);

        expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: "electronics" });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Get Single Category Successfully",
            category,
        });
    });

    test("uses the correct slug from req.params when querying", async () => {
        const category = { _id: "2", name: "Clothing", slug: "clothing" };
        req = { params: { slug: "clothing" } };
        categoryModel.findOne.mockResolvedValue(category);

        await singleCategoryController(req, res);

        expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: "clothing" });
        expect(res.send).toHaveBeenCalledWith(
            expect.objectContaining({ category })
        );
    });

    test("returns null category with status 200 when slug does not match any category", async () => {
        req = { params: { slug: "nonexistent" } };
        categoryModel.findOne.mockResolvedValue(null);

        await singleCategoryController(req, res);

        expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: "nonexistent" });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Get Single Category Successfully",
            category: null,
        });
    });

    test("returns status 500 with error details when database throws", async () => {
        const dbError = new Error("DB crashed");
        req = { params: { slug: "electronics" } };
        categoryModel.findOne.mockRejectedValue(dbError);

        await singleCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: dbError,
            message: "Error While getting Single Category",
        });
    });
});