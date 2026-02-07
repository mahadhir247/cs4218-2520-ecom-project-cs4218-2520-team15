import bcrypt from "bcrypt";
import { hashPassword, comparePassword } from "../../helpers/authHelper";

jest.mock("bcrypt");

describe("authHelper Tests", () => {
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
            jest.spyOn(global.console, 'log').mockImplementation(() => {});
            bcrypt.hash.mockImplementation(() => { throw mockError });

            await hashPassword("testPassword");

            expect(console.log).toHaveBeenCalledWith(mockError);

            bcrypt.hash.mockReset();
            console.log.mockRestore();
        });
    });

    describe("comparePassword", () => {
        it("should call compare with correct arguments", async () => {
            const spy = jest.spyOn(bcrypt, 'compare');
            
            await comparePassword("password", "hashPassword");

            expect(spy).toHaveBeenCalledWith("password", "hashPassword");
            spy.mockRestore();
        });
    });
});