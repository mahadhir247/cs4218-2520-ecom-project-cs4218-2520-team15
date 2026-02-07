import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import axios from "axios";
import { useCart } from "../../context/cart";
import { useAuth } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import CartPage from "../../pages/CartPage";

jest.mock("axios");
jest.mock("react-hot-toast");
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
jest.mock("braintree-web-drop-in-react", () => {
  return function MockDropIn() {
    return <div />;
  };
});

describe("CartPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
  });

  test("renders empty cart message for guest user", async () => {
    useAuth.mockReturnValue([{ user: null, token: null }, jest.fn()]);
    useCart.mockReturnValue([[], jest.fn()]);
    useNavigate.mockReturnValue(jest.fn());

    await act(async () => {
      render(<CartPage />);
    });

    expect(screen.getByText("Hello Guest")).toBeInTheDocument();
    expect(screen.getByText(/Your Cart Is Empty/i)).toBeInTheDocument();
  });

  test("displays item count and total price when cart has items", async () => {
    const cartItems = [
      { _id: "1", name: "Item 1", description: "First item description", price: 10 },
      { _id: "2", name: "Item 2", description: "Second item description", price: 20 },
    ];
    useAuth.mockReturnValue([{ user: { name: "Test User" }, token: "token-123" }, jest.fn()]);
    useCart.mockReturnValue([cartItems, jest.fn()]);
    useNavigate.mockReturnValue(jest.fn());

    await act(async () => {
      render(<CartPage />);
    });

    expect(screen.getByText(/You Have 2 items in your cart/i)).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText(/Total :/i)).toHaveTextContent("Total : $30.00");
  });

  test("removes item from cart and updates localStorage when Remove button is clicked", async () => {
    const cartItems = [
      { _id: "1", name: "Item 1", description: "First item description", price: 10 },
      { _id: "2", name: "Item 2", description: "Second item description", price: 20 },
    ];
    const mockSetCart = jest.fn();
    useAuth.mockReturnValue([{ user: null, token: null }, jest.fn()]);
    useCart.mockReturnValue([cartItems, mockSetCart]);
    useNavigate.mockReturnValue(jest.fn());

    await act(async () => {
      render(<CartPage />);
    });

    const removeButtons = screen.getAllByText(/Remove/i);
    fireEvent.click(removeButtons[0]);

    expect(mockSetCart).toHaveBeenCalledWith([cartItems[1]]);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "cart",
      JSON.stringify([cartItems[1]])
    );
  });
});