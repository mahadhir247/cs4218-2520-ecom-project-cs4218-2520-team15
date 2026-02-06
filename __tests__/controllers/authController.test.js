import { forgotPasswordController, loginController, registerController } from "../../controllers/authController";
import userModel from "../../models/userModel.js";
import { hashPassword, comparePassword } from "../../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import { afterEach } from "node:test";

jest.mock("../../models/userModel.js");
jest.mock("../../helpers/authHelper.js");
jest.mock("jsonwebtoken");

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
    });

    afterEach(() => {
        jest.resetAllMocks();
    })

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

            hashPassword.mockReset();
        });
    });

    describe("loginController", () => {
        it("should return error if missing email", async () => {
            req.body = {
                // email: 'test@gmail.com',
                password: 'testpassword',
            }

            await loginController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Invalid email or password" });
        });

        it("should return error if missing password", async () => {
            req.body = {
                email: 'test@gmail.com',
                // password: 'testpassword',
            }

            await loginController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Invalid email or password" });
        });

        it("should return error if user not registered", async () => {
            req.body = {
                email: 'test@gmail.com',
                password: 'testpassword',
            }
            userModel.findOne.mockResolvedValue(null);

            await loginController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Email is not registered" });
        });

        it("should return error if password does not match", async () => {
            req.body = {
                email: 'test@gmail.com',
                password: 'testpassword',
            }
            userModel.findOne.mockResolvedValue({ email: 'test@gmail.com' });
            comparePassword.mockResolvedValue(false);

            await loginController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Invalid Password" });
        });

        it("should login user successfully", async () => {
            req.body = {
                email: 'test@gmail.com',
                password: 'testpassword',
            }
            userModel.findOne.mockResolvedValue({ email: 'test@gmail.com' });
            comparePassword.mockResolvedValue(true);
            JWT.sign.mockResolvedValue('mockToken');
            
            await loginController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "login successfully",
                    token: "mockToken"
                })
            );
        });

        it("should return 500 if internal error is thrown", async () => {
            req.body = {
                email: 'test@gmail.com',
                password: 'testpassword',
            }
            userModel.findOne.mockResolvedValue({ email: 'test@gmail.com' });
            comparePassword.mockResolvedValue(true);
            JWT.sign.mockImplementation(() => { throw new Error("mock-error") });

            await loginController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    success: false, 
                    message: "Error in login" 
                })
            );

            JWT.sign.mockReset();
        });
    });

    describe("forgotPasswordController", () => {
        it("should return error if missing email", async () => {
            req.body = {
                // email: 'test@gmail.com',
                answer: 'test',
                newPassword: 'test'
            }

            await forgotPasswordController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ message: "Email is required" });
        });

        it("should return error if missing answer", async () => {
            req.body = {
                email: 'test@gmail.com',
                // answer: 'test',
                newPassword: 'test'
            }

            await forgotPasswordController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ message: "Answer is required" });
        });

        it("should return error if missing new password", async () => {
            req.body = {
                email: 'test@gmail.com',
                answer: 'test',
                // newPassword: 'test'
            }

            await forgotPasswordController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ message: "New Password is required" });
        });

        // Source code validates by finding email, answer pair in db
        it("should return error if wrong email or answer", async () => {
            req.body = {
                email: 'test@gmail.com',
                answer: 'test',
                newPassword: 'test'
            }
            userModel.findOne.mockResolvedValue(null);

            await forgotPasswordController(req, res);

            expect(userModel.findOne).toHaveBeenCalledWith({ email: 'test@gmail.com', answer: 'test' });
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Wrong Email Or Answer" });
        });

        it("should reset password successfully", async () => {
            req.body = {
                email: 'test@gmail.com',
                answer: 'test',
                newPassword: 'test'
            }
            userModel.findOne.mockResolvedValue({ _id: 1 });
            hashPassword.mockResolvedValue('mockHashedPassword');

            await forgotPasswordController(req, res);

            expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(1, { password: 'mockHashedPassword' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ success: true, message: "Password Reset Successfully" });
        });

        it("should return 500 if internal error is thrown", async () => {
            req.body = {
                email: 'test@gmail.com',
                answer: 'test',
                newPassword: 'test'
            }
            userModel.findOne.mockImplementation(() => { throw new Error("mock-error") });

            await forgotPasswordController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    success: false, 
                    message: "Something went wrong"
                })
            );

            userModel.findOne.mockReset();
        })
    });
});