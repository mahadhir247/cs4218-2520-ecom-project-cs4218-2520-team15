import { forgotPasswordController, loginController, registerController, testController } from "../../controllers/authController";
import userModel from "../../models/userModel.js";
import { hashPassword, comparePassword } from "../../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import { afterEach } from "node:test";

jest.mock("../../models/userModel.js");
jest.mock("../../helpers/authHelper.js");
jest.mock("jsonwebtoken");

describe("Auth Controller Test", () => {
    let req, res;
    const mockError = new Error("mock-error");

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

            expect(res.send).toHaveBeenCalledWith({ message: "Name is required for registration." })
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

            expect(res.send).toHaveBeenCalledWith({ message: "Email is required for registration." })
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

            expect(res.send).toHaveBeenCalledWith({ message: "Password is required for registration." })
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

            expect(res.send).toHaveBeenCalledWith({ message: "Phone number is required for registration." })
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

            expect(res.send).toHaveBeenCalledWith({ message: "Address is required for registration." })
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

            expect(res.send).toHaveBeenCalledWith({ message: "Answer is required for registration." })
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
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "User is already registered. Please login." })
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
            expect(res.send).toHaveBeenCalledWith({ success: true, message: "User registered successfully", user: mockUser });
        });

        it("should return 500 if internal error is thrown", async () => {
            hashPassword.mockImplementation(() => { throw mockError; });
            jest.spyOn(global.console, 'log').mockImplementation(() => {});
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

            expect(console.log).toHaveBeenCalledWith(mockError);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    success: false, 
                    message: "Error in Registration" 
                })
            );

            hashPassword.mockReset();
            console.log.mockRestore();
        });
    });

    describe("loginController", () => {
        it("should return error if missing email", async () => {
            req.body = {
                // email: 'test@gmail.com',
                password: 'testpassword',
            }

            await loginController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Invalid email or password" });
        });

        it("should return error if missing password", async () => {
            req.body = {
                email: 'test@gmail.com',
                // password: 'testpassword',
            }

            await loginController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Invalid email or password" });
        });

        it("should return error if user not registered", async () => {
            req.body = {
                email: 'test@gmail.com',
                password: 'testpassword',
            }
            userModel.findOne.mockResolvedValue(null);

            await loginController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
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
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Password is incorrect" });
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
            JWT.sign.mockImplementation(() => { throw mockError });
            jest.spyOn(global.console, 'log').mockImplementation(() => {});

            await loginController(req, res);

            expect(console.log).toHaveBeenCalledWith(mockError);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    success: false, 
                    message: "Error in login" 
                })
            );

            JWT.sign.mockReset();
            console.log.mockRestore();
        });
    });

    describe("forgotPasswordController", () => {
        it("should return error if missing email", async () => {
            req.body = {
                // email: 'test@gmail.com',
                answer: 'test',
                password: 'test'
            }

            await forgotPasswordController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ message: "Email is required for password reset." });
        });

        it("should return error if missing answer", async () => {
            req.body = {
                email: 'test@gmail.com',
                // answer: 'test',
                password: 'test'
            }

            await forgotPasswordController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ message: "Answer is required for password reset." });
        });

        it("should return error if missing new password", async () => {
            req.body = {
                email: 'test@gmail.com',
                answer: 'test',
                // password: 'test'
            }

            await forgotPasswordController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ message: "New password is required for password reset." });
        });

        // Source code validates by finding email, answer pair in db
        it("should return error if answer does not match email pair", async () => {
            req.body = {
                email: 'test@gmail.com',
                answer: 'test',
                password: 'test'
            }
            userModel.findOne.mockResolvedValue(null);

            await forgotPasswordController(req, res);

            expect(userModel.findOne).toHaveBeenCalledWith({ email: 'test@gmail.com', answer: 'test' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Answer is incorrect" });
        });

        it("should reset password successfully", async () => {
            req.body = {
                email: 'test@gmail.com',
                answer: 'test',
                password: 'test'
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
                password: 'test'
            }
            userModel.findOne.mockImplementation(() => { throw mockError });
            jest.spyOn(global.console, 'log').mockImplementation(() => {});

            await forgotPasswordController(req, res);

            expect(console.log).toHaveBeenCalledWith(mockError);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    success: false, 
                    message: "Error in resetting password"
                })
            );

            userModel.findOne.mockReset();
            console.log.mockRestore();
        })
    });

    describe("testController", () => {
        it("should successfully return protected routes", async () => {
            await testController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ success: true, message: "Protected Routes working" });
        });

        it("should return 500 if internal error is thrown", async () => {
            res.send.mockImplementationOnce(() => { throw mockError });
            jest.spyOn(global.console, 'log').mockImplementation(() => {});
            
            await testController(req, res);
            
            expect(console.log).toHaveBeenCalledWith(mockError);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    success: false, 
                    message: "Error in protected route"
                })
            );

            res.send.mockReset();
            console.log.mockRestore();
        });
    });
});