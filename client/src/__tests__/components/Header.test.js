/* Name: Tan Qin Xu
 * Student No: A0213002J
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Header from "../../components/Header";
import { useAuth } from "../../context/auth";
import { useCart } from "../../context/cart";
import useCategory from "../../hooks/useCategory";
import toast from "react-hot-toast";

jest.mock("../../context/auth");
jest.mock("../../context/cart");
jest.mock("../../hooks/useCategory");
jest.mock("react-hot-toast", () => ({
    success: jest.fn(),
}));
jest.mock("../../components/Form/SearchInput", () => {
    return function MockSearchInput() {
        return <div data-testid="search-input">Search</div>;
    };
});

describe("Header", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useCategory.mockReturnValue([]);
        useCart.mockReturnValue([[]]);
        Storage.prototype.removeItem = jest.fn();
    });

    describe("Guest User", () => {
        test("renders brand name, Home, Register and Login links when not logged in", () => {
            useAuth.mockReturnValue([{ user: null, token: "" }, jest.fn()]);

            render(
                <BrowserRouter>
                    <Header />
                </BrowserRouter>
            );

            expect(screen.getByText(/Virtual Vault/i)).toBeInTheDocument();
            expect(screen.getByText("Home")).toBeInTheDocument();
            expect(screen.getByText("Register")).toBeInTheDocument();
            expect(screen.getByText("Login")).toBeInTheDocument();
            expect(screen.queryByText("Logout")).not.toBeInTheDocument();
        });
    });

    describe("Authenticated User", () => {
        test("renders user name and Logout, hides Register and Login when logged in", () => {
            useAuth.mockReturnValue([{ user: { name: "John Doe", role: 0 }, token: "token123" }, jest.fn()]);

            render(
                <BrowserRouter>
                    <Header />
                </BrowserRouter>
            );

            expect(screen.getByText("John Doe")).toBeInTheDocument();
            expect(screen.getByText("Logout")).toBeInTheDocument();
            expect(screen.queryByText("Register")).not.toBeInTheDocument();
            expect(screen.queryByText("Login")).not.toBeInTheDocument();
        });

        test("renders Dashboard link pointing to /dashboard/user for regular user", () => {
            useAuth.mockReturnValue([{ user: { name: "John Doe", role: 0 }, token: "token123" }, jest.fn()]);

            render(
                <BrowserRouter>
                    <Header />
                </BrowserRouter>
            );

            expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute("href", "/dashboard/user");
        });

        test("renders Dashboard link pointing to /dashboard/admin for admin user", () => {
            useAuth.mockReturnValue([{ user: { name: "Admin User", role: 1 }, token: "admin-token" }, jest.fn()]);

            render(
                <BrowserRouter>
                    <Header />
                </BrowserRouter>
            );

            expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute("href", "/dashboard/admin");
        });

        test("logout clears user, removes auth from localStorage and shows toast", () => {
            const mockSetAuth = jest.fn();
            const mockAuth = { user: { name: "John Doe", role: 0 }, token: "token123" };
            useAuth.mockReturnValue([mockAuth, mockSetAuth]);

            render(
                <BrowserRouter>
                    <Header />
                </BrowserRouter>
            );

            fireEvent.click(screen.getByText("Logout"));

            expect(mockSetAuth).toHaveBeenCalledWith({
                user: null,
                token: "",
            });
            expect(localStorage.removeItem).toHaveBeenCalledWith("auth");
            expect(toast.success).toHaveBeenCalledWith("Logout Successfully");
        });
    });

    describe("Categories Dropdown", () => {
        test("renders All Categories link and each category in dropdown", () => {
            useAuth.mockReturnValue([{ user: null, token: "" }, jest.fn()]);
            useCategory.mockReturnValue([
                { _id: "1", name: "Electronics", slug: "electronics" },
                { _id: "2", name: "Clothing", slug: "clothing" },
            ]);

            render(
                <BrowserRouter>
                    <Header />
                </BrowserRouter>
            );

            expect(screen.getByText("All Categories")).toBeInTheDocument();
            expect(screen.getByText("Electronics")).toBeInTheDocument();
            expect(screen.getByText("Clothing")).toBeInTheDocument();
        });

        test("renders no category items in dropdown when categories list is empty", () => {
            useAuth.mockReturnValue([{ user: null, token: "" }, jest.fn()]);
            useCategory.mockReturnValue([]);

            render(
                <BrowserRouter>
                    <Header />
                </BrowserRouter>
            );

            expect(screen.getByText("All Categories")).toBeInTheDocument();
            expect(screen.queryByText("Electronics")).not.toBeInTheDocument();
        });
    });

    describe("Cart Badge", () => {
        test("displays cart badge with correct item count", () => {
            useAuth.mockReturnValue([{ user: null, token: "" }, jest.fn()]);
            useCart.mockReturnValue([[{ id: 1 }, { id: 2 }, { id: 3 }]]);

            render(
                <BrowserRouter>
                    <Header />
                </BrowserRouter>
            );

            expect(screen.getByText("Cart")).toBeInTheDocument();
            expect(screen.getByText("3")).toBeInTheDocument();
        });

        test("displays zero badge count when cart is empty", () => {
            useAuth.mockReturnValue([{ user: null, token: "" }, jest.fn()]);
            useCart.mockReturnValue([[]]);

            render(
                <BrowserRouter>
                    <Header />
                </BrowserRouter>
            );

            expect(screen.getByText("0")).toBeInTheDocument();
        });
    });
});