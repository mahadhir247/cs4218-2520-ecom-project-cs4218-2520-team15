import { registerController } from "../../controllers/authController";
import userModel from "../../models/userModel.js";
import { hashPassword } from "../../helpers/authHelper.js";

jest.mock("../../models/userModel.js");
jest.mock("../../helpers/authHelper.js");

describe("Auth Controller Test", () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {}
        }
        res = {
            send: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
    });

    describe("registerController", () => {
        it("should return error if name is missing", async () => {
            req.body = {
                // name: 'Test',
                email: 'test@gmail.com',
                password: 'testpassword',
                phone: '123',
                address: 'test',
                answer: 'test'
            }

            await registerController(req, res);

            expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" })
        });

        it("should return error if email is missing", async () => {
            req.body = {
                name: 'Test',
                // email: 'test@gmail.com',
                password: 'testpassword',
                phone: '123',
                address: 'test',
                answer: 'test'
            }

            await registerController(req, res);

            expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" })
        });

        it("should return error if password is missing", async () => {
            req.body = {
                name: 'Test',
                email: 'test@gmail.com',
                // password: 'testpassword',
                phone: '123',
                address: 'test',
                answer: 'test'
            }

            await registerController(req, res);

            expect(res.send).toHaveBeenCalledWith({ message: "Password is Required" })
        });

        it("should return error if phone is missing", async () => {
            req.body = {
                name: 'Test',
                email: 'test@gmail.com',
                password: 'testpassword',
                // phone: '123',
                address: 'test',
                answer: 'test'
            }

            await registerController(req, res);

            expect(res.send).toHaveBeenCalledWith({ message: "Phone no is Required" })
        });

        it("should return error if address is missing", async () => {
            req.body = {
                name: 'Test',
                email: 'test@gmail.com',
                password: 'testpassword',
                phone: '123',
                // address: 'test',
                answer: 'test'
            }

            await registerController(req, res);

            expect(res.send).toHaveBeenCalledWith({ message: "Address is Required" })
        });

        it("should return error if answer is missing", async () => {
            req.body = {
                name: 'Test',
                email: 'test@gmail.com',
                password: 'testpassword',
                phone: '123',
                address: 'test',
                // answer: 'test'
            }

            await registerController(req, res);

            expect(res.send).toHaveBeenCalledWith({ message: "Answer is Required" })
        });

        it("should return error if user already exists", async () => {
            req.body = {
                name: 'Test',
                email: 'test@gmail.com',
                password: 'testpassword',
                phone: '123',
                address: 'test',
                answer: 'test'
            }
            userModel.findOne.mockResolvedValue({ email: 'test@gmail.com' });

            await registerController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Already Register please login" })
        });

        it("should register user successfully", async () => {
            req.body = {
                name: 'Test',
                email: 'test@gmail.com',
                password: 'testpassword',
                phone: '123',
                address: 'test',
                answer: 'test'
            }
            userModel.findOne.mockResolvedValue(null);
            const mockUser = {...req.body, password: 'mockHash'};
            userModel.prototype.save.mockResolvedValue(mockUser);

            await registerController(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith({ success: true, message: "User Register Successfully", user: mockUser });
        });

        it("should return 500 if internal error is thrown", async () => {
            hashPassword.mockImplementation(() => { throw new Error("mock-error"); });
            req.body = {
                name: 'Test',
                email: 'test@gmail.com',
                password: 'testpassword',
                phone: '123',
                address: 'test',
                answer: 'test'
            }
            userModel.findOne.mockResolvedValue(null);

            await registerController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    success: false, 
                    message: "Error in Registration" 
                })
            );
        })
    });
});