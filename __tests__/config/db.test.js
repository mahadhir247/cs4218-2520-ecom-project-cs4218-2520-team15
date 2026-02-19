/* Name: Tan Qin Xu
 * Student No: A0213002J
 */

import mongoose from "mongoose";
import connectDB from "../../config/db.js";

jest.mock("mongoose");

describe("Database Connection Module (connectDB)", () => {
    let consoleLogSpy;

    beforeEach(() => {
        consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        jest.clearAllMocks();
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
    });

    describe("Successful Connection", () => {
        it("should call mongoose.connect with the MONGO_URL env variable", async () => {
            process.env.MONGO_URL = "mongodb://localhost:27017/testdb";
            mongoose.connect.mockResolvedValueOnce({
                connection: { host: "localhost:27017" },
            });

            await connectDB();

            expect(mongoose.connect).toHaveBeenCalledTimes(1);
            expect(mongoose.connect).toHaveBeenCalledWith("mongodb://localhost:27017/testdb");
        });

        it("should log a success message containing the host on successful connection", async () => {
            process.env.MONGO_URL = "mongodb://localhost:27017/testdb";
            mongoose.connect.mockResolvedValueOnce({
                connection: { host: "localhost:27017" },
            });

            await connectDB();

            expect(consoleLogSpy).toHaveBeenCalledTimes(1);
            const loggedArg = consoleLogSpy.mock.calls[0][0];
            expect(loggedArg).toContain("Connected To Mongodb Database");
            expect(loggedArg).toContain("localhost:27017");
        });

        it("should connect to MongoDB Atlas and log the Atlas host", async () => {
            process.env.MONGO_URL = "mongodb+srv://user:pass@cluster0.mongodb.net/mydb";
            mongoose.connect.mockResolvedValueOnce({
                connection: { host: "cluster0.mongodb.net" },
            });

            await connectDB();

            expect(mongoose.connect).toHaveBeenCalledWith(
                "mongodb+srv://user:pass@cluster0.mongodb.net/mydb"
            );
            const loggedArg = consoleLogSpy.mock.calls[0][0];
            expect(loggedArg).toContain("cluster0.mongodb.net");
        });

        it("should connect using a replica set connection string and log all hosts", async () => {
            const replicaUrl =
                "mongodb://host1:27017,host2:27017,host3:27017/mydb?replicaSet=rs0";
            process.env.MONGO_URL = replicaUrl;
            mongoose.connect.mockResolvedValueOnce({
                connection: { host: "host1:27017,host2:27017,host3:27017" },
            });

            await connectDB();

            expect(mongoose.connect).toHaveBeenCalledWith(replicaUrl);
            const loggedArg = consoleLogSpy.mock.calls[0][0];
            expect(loggedArg).toContain("host1:27017,host2:27017,host3:27017");
        });

        it("should not throw even when connection string contains special characters", async () => {
            const specialUrl = "mongodb://user%40name:p%40ssw0rd!@localhost:27017/test";
            process.env.MONGO_URL = specialUrl;
            mongoose.connect.mockResolvedValueOnce({
                connection: { host: "localhost:27017" },
            });

            await expect(connectDB()).resolves.toBeUndefined();
            expect(mongoose.connect).toHaveBeenCalledWith(specialUrl);
        });
    });

    describe("Connection Failure", () => {
        it("should catch a generic connection error and log it without throwing", async () => {
            mongoose.connect.mockRejectedValueOnce(new Error("Connection timeout"));

            await expect(connectDB()).resolves.toBeUndefined();
        });

        it("should log 'Error in Mongodb' prefix on any connection failure", async () => {
            mongoose.connect.mockRejectedValueOnce(new Error("Something went wrong"));

            await connectDB();

            const loggedArg = consoleLogSpy.mock.calls[0][0];
            expect(loggedArg).toContain("Error in Mongodb");
        });

        it("should include the error message in the log output", async () => {
            mongoose.connect.mockRejectedValueOnce(new Error("ECONNREFUSED"));

            await connectDB();

            const loggedArg = consoleLogSpy.mock.calls[0][0];
            expect(loggedArg).toContain("ECONNREFUSED");
        });

        it("should handle authentication errors", async () => {
            mongoose.connect.mockRejectedValueOnce(
                new Error("Authentication failed: bad auth")
            );

            await connectDB();

            const loggedArg = consoleLogSpy.mock.calls[0][0];
            expect(loggedArg).toContain("Error in Mongodb");
            expect(loggedArg).toContain("Authentication failed");
        });

        it("should handle DNS lookup errors (ENOTFOUND)", async () => {
            mongoose.connect.mockRejectedValueOnce(
                new Error("getaddrinfo ENOTFOUND invalid-host")
            );

            await connectDB();

            const loggedArg = consoleLogSpy.mock.calls[0][0];
            expect(loggedArg).toContain("ENOTFOUND");
        });

        it("should handle server selection timeout errors", async () => {
            mongoose.connect.mockRejectedValueOnce(
                new Error("Server selection timed out after 30000 ms")
            );

            await connectDB();

            const loggedArg = consoleLogSpy.mock.calls[0][0];
            expect(loggedArg).toContain("Server selection timed out");
        });

        it("should log only once (no success log) when connection fails", async () => {
            mongoose.connect.mockRejectedValueOnce(new Error("fail"));

            await connectDB();

            expect(consoleLogSpy).toHaveBeenCalledTimes(1);
            const loggedArg = consoleLogSpy.mock.calls[0][0];
            expect(loggedArg).not.toContain("Connected To Mongodb Database");
        });
    });

    describe("Environment Configuration", () => {
        it("should pass undefined to mongoose.connect when MONGO_URL is not set", async () => {
            delete process.env.MONGO_URL;
            mongoose.connect.mockRejectedValueOnce(new Error("URI must be a string"));

            await connectDB();

            expect(mongoose.connect).toHaveBeenCalledWith(undefined);
            const loggedArg = consoleLogSpy.mock.calls[0][0];
            expect(loggedArg).toContain("Error in Mongodb");
        });

        it("should pass empty string to mongoose.connect when MONGO_URL is empty", async () => {
            process.env.MONGO_URL = "";
            mongoose.connect.mockRejectedValueOnce(new Error("Invalid connection string"));

            await connectDB();

            expect(mongoose.connect).toHaveBeenCalledWith("");
        });

        it("should pass a malformed URL to mongoose.connect and handle the error", async () => {
            process.env.MONGO_URL = "not-a-valid-url";
            mongoose.connect.mockRejectedValueOnce(
                new Error("Invalid connection string format")
            );

            await connectDB();

            expect(mongoose.connect).toHaveBeenCalledWith("not-a-valid-url");
            const loggedArg = consoleLogSpy.mock.calls[0][0];
            expect(loggedArg).toContain("Invalid connection string format");
        });

        it("should handle a very long connection string without issues", async () => {
            const longUrl = `mongodb://localhost:27017/${"a".repeat(500)}`;
            process.env.MONGO_URL = longUrl;
            mongoose.connect.mockResolvedValueOnce({
                connection: { host: "localhost:27017" },
            });

            await connectDB();

            expect(mongoose.connect).toHaveBeenCalledWith(longUrl);
        });
    });

    describe("Edge Cases", () => {
        it("should handle null being thrown as the error value", async () => {
            mongoose.connect.mockRejectedValueOnce(null);

            await connectDB();

            const loggedArg = consoleLogSpy.mock.calls[0][0];
            expect(loggedArg).toContain("Error in Mongodb");
            expect(loggedArg).toContain("null");
        });

        it("should handle a plain object thrown as the error", async () => {
            mongoose.connect.mockRejectedValueOnce({ code: 500, reason: "unknown" });

            await connectDB();

            const loggedArg = consoleLogSpy.mock.calls[0][0];
            expect(loggedArg).toContain("Error in Mongodb");
            expect(loggedArg).toContain("[object Object]");
        });

        it("should handle a string thrown as the error", async () => {
            mongoose.connect.mockRejectedValueOnce("string error message");

            await connectDB();

            const loggedArg = consoleLogSpy.mock.calls[0][0];
            expect(loggedArg).toContain("string error message");
        });

        it("should return undefined (no return value) on success", async () => {
            mongoose.connect.mockResolvedValueOnce({
                connection: { host: "localhost:27017" },
            });

            const result = await connectDB();

            expect(result).toBeUndefined();
        });

        it("should return undefined (no return value) on failure", async () => {
            mongoose.connect.mockRejectedValueOnce(new Error("fail"));

            const result = await connectDB();

            expect(result).toBeUndefined();
        });
    });

    describe("Concurrent and Sequential Calls", () => {
        it("should handle multiple simultaneous connection calls independently", async () => {
            const mockConn = { connection: { host: "localhost:27017" } };
            mongoose.connect.mockResolvedValue(mockConn);

            await Promise.all([connectDB(), connectDB(), connectDB()]);

            expect(mongoose.connect).toHaveBeenCalledTimes(3);
        });

        it("should handle a failure followed by a success on sequential calls", async () => {
            mongoose.connect
                .mockRejectedValueOnce(new Error("First attempt failed"))
                .mockResolvedValueOnce({ connection: { host: "localhost:27017" } });

            await connectDB();
            await connectDB();

            expect(mongoose.connect).toHaveBeenCalledTimes(2);
            expect(consoleLogSpy.mock.calls[0][0]).toContain("Error in Mongodb");
            expect(consoleLogSpy.mock.calls[1][0]).toContain("Connected To Mongodb Database");
        });

        it("should handle a success followed by a failure on sequential calls", async () => {
            mongoose.connect
                .mockResolvedValueOnce({ connection: { host: "localhost:27017" } })
                .mockRejectedValueOnce(new Error("Second attempt failed"));

            await connectDB();
            await connectDB();

            expect(consoleLogSpy.mock.calls[0][0]).toContain("Connected To Mongodb Database");
            expect(consoleLogSpy.mock.calls[1][0]).toContain("Error in Mongodb");
        });
    });
});