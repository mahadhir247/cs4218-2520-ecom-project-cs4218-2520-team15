import bcrypt from "bcrypt";
import { hashPassword, comparePassword } from "../../helpers/authHelper";

jest.mock("bcrypt");

describe("authHelper Tests", () => {
    const mockError = new Error("mock-error");

    describe("hashPassword", () => {
        it("should return hashed password", async () => {
            const mockHash = "mockhashedvalue";
            bcrypt.hash.mockResolvedValue(mockHash);

            const result = await hashPassword("testPassword");

            expect(bcrypt.hash).toHaveBeenCalledWith("testPassword", 10);
            expect(result).toBe(mockHash);
        });

        it("should log error if internal error is thrown", async () => {
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

        it("should log error if internal error is thrown", async () => {
            jest.spyOn(global.console, 'log').mockImplementation(() => {});
            bcrypt.compare.mockImplementation(() => { throw mockError });

            await comparePassword("password", "hashPassword");

            expect(console.log).toHaveBeenCalledWith(mockError);

            bcrypt.compare.mockReset();
            console.log.mockRestore();
        });
    });
});