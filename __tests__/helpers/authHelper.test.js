import bcrypt from "bcrypt";
import { hashPassword } from "../../helpers/authHelper";
import { describe } from "node:test";

jest.mock("bcrypt");

describe("hashPassword", () => {
    it("should return hashed password", async () => {
        const mockHash = "mockhashedvalue";
        bcrypt.hash.mockResolvedValue(mockHash);

        const result = await hashPassword("testPassword");

        expect(bcrypt.hash).toHaveBeenCalledWith("testPassword", 10);
        expect(result).toBe(mockHash);
    });

    it("should log error if internal error is thrown", async () => {
        const mockError = new Error("mock-error");
        const consoleSpy = jest.spyOn(global.console, 'log');
        bcrypt.hash.mockImplementation(() => { throw mockError });

        await hashPassword("testPassword");

        expect(consoleSpy).toHaveBeenCalledWith(mockError);

        bcrypt.hash.mockReset();
    })
});