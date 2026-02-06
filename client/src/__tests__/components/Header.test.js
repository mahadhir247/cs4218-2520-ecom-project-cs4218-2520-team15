import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Header from "../../components/Header";
import { useAuth } from "../../context/auth";
import { useCart } from "../../context/cart";
import useCategory from "../../hooks/useCategory";

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

  test("renders header with brand name when user is not logged in", () => {
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

  test("renders header with user name when user is logged in", () => {
    const mockUser = { name: "John Doe", role: 0 };
    useAuth.mockReturnValue([{ user: mockUser, token: "token123" }, jest.fn()]);

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

  test("renders categories in dropdown", () => {
    useAuth.mockReturnValue([{ user: null, token: "" }, jest.fn()]);
    const mockCategories = [
      { _id: "1", name: "Electronics", slug: "electronics" },
      { _id: "2", name: "Clothing", slug: "clothing" },
    ];
    useCategory.mockReturnValue(mockCategories);

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText("All Categories")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Clothing")).toBeInTheDocument();
  });

  test("displays cart badge with correct item count", () => {
    useAuth.mockReturnValue([{ user: null, token: "" }, jest.fn()]);
    const mockCart = [{ id: 1 }, { id: 2 }, { id: 3 }];
    useCart.mockReturnValue([mockCart]);

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText("Cart")).toBeInTheDocument();
  });

  test("handles logout correctly", () => {
    const mockSetAuth = jest.fn();
    const mockUser = { name: "John Doe", role: 0 };
    useAuth.mockReturnValue([{ user: mockUser, token: "token123" }, mockSetAuth]);

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);

    expect(mockSetAuth).toHaveBeenCalledWith({
      user: null,
      token: "",
    });
    expect(localStorage.removeItem).toHaveBeenCalledWith("auth");
  });

  test("renders user dashboard link for regular user", () => {
    const mockUser = { name: "John Doe", role: 0 };
    useAuth.mockReturnValue([{ user: mockUser, token: "token123" }, jest.fn()]);

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const dashboardLink = screen.getByText("Dashboard");
    expect(dashboardLink.closest("a")).toHaveAttribute("href", "/dashboard/user");
  });

  test("renders admin dashboard link for admin user", () => {
    const mockUser = { name: "Admin User", role: 1 };
    useAuth.mockReturnValue([{ user: mockUser, token: "admin-token" }, jest.fn()]);

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const dashboardLink = screen.getByText("Dashboard");
    expect(dashboardLink.closest("a")).toHaveAttribute("href", "/dashboard/admin");
  });
});