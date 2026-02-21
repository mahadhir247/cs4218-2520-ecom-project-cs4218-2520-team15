/* Name: Tan Qin Xu
 * Student No: A0213002J
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import axios from "axios";
import toast from "react-hot-toast";
import { useCart } from "../../context/cart";
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import CartPage from "../../pages/CartPage";

jest.mock("axios");
jest.mock("react-hot-toast", () => ({
    success: jest.fn(),
}));
jest.mock("../../components/Layout", () => {
    return function MockLayout({ children }) {
        return <div>{children}</div>;
    };
});
jest.mock("../../context/cart", () => ({
    useCart: jest.fn(),
}));
jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

let mockInstanceCallback = null;
jest.mock("braintree-web-drop-in-react", () => {
    return function MockDropIn({ onInstance }) {
        mockInstanceCallback = onInstance;
        return <div data-testid="drop-in">Braintree DropIn</div>;
    };
});

const SINGLE_ITEM = [
    { _id: "1", name: "Item 1", description: "First item description", price: 10 },
];

const TWO_ITEMS = [
    { _id: "1", name: "Item 1", description: "First item description", price: 10 },
    { _id: "2", name: "Item 2", description: "Second item description", price: 20 },
];

const GUEST_AUTH = [{ user: null, token: null }, jest.fn()];
const LOGGED_IN_NO_ADDRESS = [{ user: { name: "Test User" }, token: "token-123" }, jest.fn()];
const LOGGED_IN_WITH_ADDRESS = [
    { user: { name: "Test User", address: "123 Main St" }, token: "token-123" },
    jest.fn(),
];

describe("CartPage", () => {
    let mockNavigate;

    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);
        axios.get.mockResolvedValue({ data: { clientToken: "mock-braintree-token" } });
        Object.defineProperty(window, "localStorage", {
            value: {
                getItem: jest.fn(),
                setItem: jest.fn(),
                removeItem: jest.fn(),
                clear: jest.fn(),
            },
            writable: true,
        });
        mockInstanceCallback = null;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("Guest User Display", () => {
        test("renders empty cart message and guest greeting for unauthenticated user", async () => {
            useAuth.mockReturnValue(GUEST_AUTH);
            useCart.mockReturnValue([[], jest.fn()]);

            await act(async () => {
                render(<CartPage />);
            });

            expect(screen.getByText("Hello Guest")).toBeInTheDocument();
            expect(screen.getByText(/Your Cart Is Empty/i)).toBeInTheDocument();
        });

        test("shows login button for guest user and navigates to login with cart state", async () => {
            useAuth.mockReturnValue(GUEST_AUTH);
            useCart.mockReturnValue([SINGLE_ITEM, jest.fn()]);

            await act(async () => {
                render(<CartPage />);
            });

            const loginButton = screen.getByText("Please Login to checkout");
            expect(loginButton).toBeInTheDocument();
            fireEvent.click(loginButton);

            expect(mockNavigate).toHaveBeenCalledWith("/login", { state: "/cart" });
        });

        test("does not render Braintree DropIn for guest user", async () => {
            useAuth.mockReturnValue(GUEST_AUTH);
            useCart.mockReturnValue([SINGLE_ITEM, jest.fn()]);

            await act(async () => {
                render(<CartPage />);
            });

            expect(screen.queryByTestId("drop-in")).not.toBeInTheDocument();
        });
    });

    describe("Authenticated User Display", () => {
        test("displays item count, item names, and correct total for logged in user", async () => {
            useAuth.mockReturnValue(LOGGED_IN_WITH_ADDRESS);
            useCart.mockReturnValue([TWO_ITEMS, jest.fn()]);

            await act(async () => {
                render(<CartPage />);
            });

            expect(screen.getByText(/You Have 2 items in your cart/i)).toBeInTheDocument();
            expect(screen.getByText("Item 1")).toBeInTheDocument();
            expect(screen.getByText("Item 2")).toBeInTheDocument();
            expect(screen.getByText(/Total :/i)).toHaveTextContent("Total : $30.00");
        });

        test("truncates item description to 30 characters", async () => {
            const itemWithLongDescription = [
                {
                    _id: "1",
                    name: "Item 1",
                    description: "This is a very long description that should be truncated",
                    price: 10,
                },
            ];
            useAuth.mockReturnValue(LOGGED_IN_WITH_ADDRESS);
            useCart.mockReturnValue([itemWithLongDescription, jest.fn()]);

            await act(async () => {
                render(<CartPage />);
            });

            expect(screen.getByText("This is a very long descriptio")).toBeInTheDocument();
        });

        test("displays current address and Update Address button when user has address", async () => {
            useAuth.mockReturnValue(LOGGED_IN_WITH_ADDRESS);
            useCart.mockReturnValue([SINGLE_ITEM, jest.fn()]);

            await act(async () => {
                render(<CartPage />);
            });

            expect(screen.getByText("Current Address")).toBeInTheDocument();
            expect(screen.getByText("123 Main St")).toBeInTheDocument();

            fireEvent.click(screen.getByText("Update Address"));

            expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
        });

        test("shows Update Address button and navigates to profile when user has no address", async () => {
            useAuth.mockReturnValue(LOGGED_IN_NO_ADDRESS);
            useCart.mockReturnValue([SINGLE_ITEM, jest.fn()]);

            await act(async () => {
                render(<CartPage />);
            });

            fireEvent.click(screen.getAllByText("Update Address")[0]);

            expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
        });

        test("displays $0.00 total for an empty cart", async () => {
            useAuth.mockReturnValue(LOGGED_IN_WITH_ADDRESS);
            useCart.mockReturnValue([[], jest.fn()]);

            await act(async () => {
                render(<CartPage />);
            });

            expect(screen.getByText(/Total :/i)).toHaveTextContent("Total : $0.00");
        });
    });

    describe("Remove Item from Cart", () => {
        test("removes item, updates cart state and persists to localStorage", async () => {
            const mockSetCart = jest.fn();
            useAuth.mockReturnValue(GUEST_AUTH);
            useCart.mockReturnValue([TWO_ITEMS, mockSetCart]);

            await act(async () => {
                render(<CartPage />);
            });

            fireEvent.click(screen.getAllByText(/Remove/i)[0]);

            expect(mockSetCart).toHaveBeenCalledWith([TWO_ITEMS[1]]);
            expect(window.localStorage.setItem).toHaveBeenCalledWith(
                "cart",
                JSON.stringify([TWO_ITEMS[1]])
            );
        });

        test("handles errors in removeCartItem gracefully without crashing", async () => {
            const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
            useAuth.mockReturnValue(GUEST_AUTH);
            useCart.mockReturnValue([SINGLE_ITEM, jest.fn()]);
            window.localStorage.setItem.mockImplementation(() => {
                throw new Error("localStorage write error");
            });

            await act(async () => {
                render(<CartPage />);
            });

            fireEvent.click(screen.getByText(/Remove/i));

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
            consoleLogSpy.mockRestore();
        });
    });

    describe("Braintree Payment DropIn", () => {
        test("renders DropIn when logged in with address and cart has items", async () => {
            useAuth.mockReturnValue(LOGGED_IN_WITH_ADDRESS);
            useCart.mockReturnValue([SINGLE_ITEM, jest.fn()]);

            await act(async () => {
                render(<CartPage />);
            });

            await waitFor(() => {
                expect(screen.getByTestId("drop-in")).toBeInTheDocument();
            });
        });

        test("does not render DropIn when cart is empty", async () => {
            useAuth.mockReturnValue(LOGGED_IN_WITH_ADDRESS);
            useCart.mockReturnValue([[], jest.fn()]);

            await act(async () => {
                render(<CartPage />);
            });

            expect(screen.queryByTestId("drop-in")).not.toBeInTheDocument();
        });

        test("does not render DropIn when Braintree token fetch fails", async () => {
            const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
            axios.get.mockRejectedValue(new Error("Token fetch failed"));
            useAuth.mockReturnValue(LOGGED_IN_WITH_ADDRESS);
            useCart.mockReturnValue([SINGLE_ITEM, jest.fn()]);

            await act(async () => {
                render(<CartPage />);
            });

            expect(screen.queryByTestId("drop-in")).not.toBeInTheDocument();
            consoleLogSpy.mockRestore();
        });

        test("Make Payment button is disabled without instance and enabled once instance is set", async () => {
            useAuth.mockReturnValue(LOGGED_IN_WITH_ADDRESS);
            useCart.mockReturnValue([SINGLE_ITEM, jest.fn()]);

            await act(async () => {
                render(<CartPage />);
            });

            await waitFor(() => {
                expect(screen.getByTestId("drop-in")).toBeInTheDocument();
            });

            expect(screen.getByText("Make Payment")).toBeDisabled();

            await act(async () => {
                mockInstanceCallback({ requestPaymentMethod: jest.fn() });
            });

            expect(screen.getByText("Make Payment")).toBeEnabled();
        });

        test("Make Payment button is disabled when user has no address even with instance set", async () => {
            useAuth.mockReturnValue(LOGGED_IN_NO_ADDRESS);
            useCart.mockReturnValue([SINGLE_ITEM, jest.fn()]);

            await act(async () => {
                render(<CartPage />);
            });

            await waitFor(() => {
                expect(screen.getByTestId("drop-in")).toBeInTheDocument();
            });

            await act(async () => {
                mockInstanceCallback({ requestPaymentMethod: jest.fn() });
            });

            expect(screen.getByText("Make Payment")).toBeDisabled();
        });
    });

    describe("Payment Processing", () => {
        test("completes successful payment: clears cart, navigates to orders, shows toast", async () => {
            const mockSetCart = jest.fn();
            const mockInstance = {
                requestPaymentMethod: jest.fn().mockResolvedValue({ nonce: "fake-nonce" }),
            };
            useAuth.mockReturnValue(LOGGED_IN_WITH_ADDRESS);
            useCart.mockReturnValue([SINGLE_ITEM, mockSetCart]);
            axios.post.mockResolvedValue({ data: { success: true } });

            await act(async () => {
                render(<CartPage />);
            });

            await waitFor(() => {
                expect(screen.getByTestId("drop-in")).toBeInTheDocument();
            });

            await act(async () => {
                mockInstanceCallback(mockInstance);
            });

            await act(async () => {
                fireEvent.click(screen.getByText("Make Payment"));
            });

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith("/api/v1/product/braintree/payment", {
                    nonce: "fake-nonce",
                    cart: SINGLE_ITEM,
                });
                expect(window.localStorage.removeItem).toHaveBeenCalledWith("cart");
                expect(mockSetCart).toHaveBeenCalledWith([]);
                expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/orders");
                expect(toast.success).toHaveBeenCalledWith("Payment Completed Successfully ");
            });
        });

        test("logs error and does not navigate when requestPaymentMethod fails", async () => {
            const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
            const mockInstance = {
                requestPaymentMethod: jest.fn().mockRejectedValue(new Error("Payment failed")),
            };
            useAuth.mockReturnValue(LOGGED_IN_WITH_ADDRESS);
            useCart.mockReturnValue([SINGLE_ITEM, jest.fn()]);

            await act(async () => {
                render(<CartPage />);
            });

            await waitFor(() => {
                expect(screen.getByTestId("drop-in")).toBeInTheDocument();
            });

            await act(async () => {
                mockInstanceCallback(mockInstance);
            });

            await act(async () => {
                fireEvent.click(screen.getByText("Make Payment"));
            });

            await waitFor(() => {
                expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
                expect(mockNavigate).not.toHaveBeenCalled();
                expect(toast.success).not.toHaveBeenCalled();
            });

            consoleLogSpy.mockRestore();
        });

        test("logs error and does not navigate when payment API call fails", async () => {
            const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
            const mockInstance = {
                requestPaymentMethod: jest.fn().mockResolvedValue({ nonce: "fake-nonce" }),
            };
            useAuth.mockReturnValue(LOGGED_IN_WITH_ADDRESS);
            useCart.mockReturnValue([SINGLE_ITEM, jest.fn()]);
            axios.post.mockRejectedValue(new Error("API error"));

            await act(async () => {
                render(<CartPage />);
            });

            await waitFor(() => {
                expect(screen.getByTestId("drop-in")).toBeInTheDocument();
            });

            await act(async () => {
                mockInstanceCallback(mockInstance);
            });

            await act(async () => {
                fireEvent.click(screen.getByText("Make Payment"));
            });

            await waitFor(() => {
                expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
                expect(mockNavigate).not.toHaveBeenCalled();
            });

            consoleLogSpy.mockRestore();
        });
    });
});