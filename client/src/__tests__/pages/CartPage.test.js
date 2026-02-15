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

  test("renders empty cart message for guest user", async () => {
    useAuth.mockReturnValue([{ user: null, token: null }, jest.fn()]);
    useCart.mockReturnValue([[], jest.fn()]);

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

  test("displays DropIn and payment button when user is logged in with address and cart has items", async () => {
    const cartItems = [
      { _id: "1", name: "Item 1", description: "First item description", price: 10 },
    ];
    useAuth.mockReturnValue([
      { user: { name: "Test User", address: "123 Main St" }, token: "token-123" },
      jest.fn(),
    ]);
    useCart.mockReturnValue([cartItems, jest.fn()]);

    await act(async () => {
      render(<CartPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("drop-in")).toBeInTheDocument();
    });
    expect(screen.getByText("Make Payment")).toBeInTheDocument();
  });

  test("handles successful payment and redirects to orders page", async () => {
    const cartItems = [
      { _id: "1", name: "Item 1", description: "First item description", price: 10 },
    ];
    const mockSetCart = jest.fn();
    const mockInstance = {
      requestPaymentMethod: jest.fn().mockResolvedValue({
        nonce: "fake-nonce-from-braintree",
      }),
    };
    useAuth.mockReturnValue([
      { user: { name: "Test User", address: "123 Main St" }, token: "token-123" },
      jest.fn(),
    ]);
    useCart.mockReturnValue([cartItems, mockSetCart]);
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

    const paymentButton = screen.getByText("Make Payment");
    expect(paymentButton).toBeEnabled();
    await act(async () => {
      fireEvent.click(paymentButton);
    });

    await waitFor(() => {
      expect(mockInstance.requestPaymentMethod).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalledWith("/api/v1/product/braintree/payment", {
        nonce: "fake-nonce-from-braintree",
        cart: cartItems,
      });
      expect(window.localStorage.removeItem).toHaveBeenCalledWith("cart");
      expect(mockSetCart).toHaveBeenCalledWith([]);
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/orders");
      expect(toast.success).toHaveBeenCalledWith("Payment Completed Successfully ");
    });
  });

  test("handles payment error gracefully", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const cartItems = [
      { _id: "1", name: "Item 1", description: "First item description", price: 10 },
    ];
    const mockInstance = {
      requestPaymentMethod: jest.fn().mockRejectedValue(new Error("Payment failed")),
    };
    useAuth.mockReturnValue([
      { user: { name: "Test User", address: "123 Main St" }, token: "token-123" },
      jest.fn(),
    ]);
    useCart.mockReturnValue([cartItems, jest.fn()]);

    await act(async () => {
      render(<CartPage />);
    });
    await waitFor(() => {
      expect(screen.getByTestId("drop-in")).toBeInTheDocument();
    });
    await act(async () => {
      mockInstanceCallback(mockInstance);
    });

    const paymentButton = screen.getByText("Make Payment");
    await act(async () => {
      fireEvent.click(paymentButton);
    });

    await waitFor(() => {
      expect(mockInstance.requestPaymentMethod).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    });
    consoleLogSpy.mockRestore();
  });

  test("shows 'Update Address' button when logged in user has no address", async () => {
    const cartItems = [
      { _id: "1", name: "Item 1", description: "First item description", price: 10 },
    ];
    useAuth.mockReturnValue([
      { user: { name: "Test User" }, token: "token-123" },
      jest.fn(),
    ]);
    useCart.mockReturnValue([cartItems, jest.fn()]);

    await act(async () => {
      render(<CartPage />);
    });

    const updateButtons = screen.getAllByText("Update Address");
    expect(updateButtons[0]).toBeInTheDocument();

    fireEvent.click(updateButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
  });

  test("shows 'Please Login to checkout' button for guest user with items", async () => {
    const cartItems = [
      { _id: "1", name: "Item 1", description: "First item description", price: 10 },
    ];
    useAuth.mockReturnValue([{ user: null, token: null }, jest.fn()]);
    useCart.mockReturnValue([cartItems, jest.fn()]);

    await act(async () => {
      render(<CartPage />);
    });

    const loginButton = screen.getByText("Plase Login to checkout");
    expect(loginButton).toBeInTheDocument();

    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith("/login", { state: "/cart" });
  });

  test("displays current address and allows updating it", async () => {
    const cartItems = [
      { _id: "1", name: "Item 1", description: "First item description", price: 10 },
    ];
    useAuth.mockReturnValue([
      { user: { name: "Test User", address: "123 Main St" }, token: "token-123" },
      jest.fn(),
    ]);
    useCart.mockReturnValue([cartItems, jest.fn()]);

    await act(async () => {
      render(<CartPage />);
    });

    expect(screen.getByText("Current Address")).toBeInTheDocument();
    expect(screen.getByText("123 Main St")).toBeInTheDocument();

    const updateButton = screen.getByText("Update Address");
    fireEvent.click(updateButton);

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
  });

  test("payment button is disabled when user has no address", async () => {
    const cartItems = [
      { _id: "1", name: "Item 1", description: "First item description", price: 10 },
    ];
    useAuth.mockReturnValue([
      { user: { name: "Test User" }, token: "token-123" },
      jest.fn(),
    ]);
    useCart.mockReturnValue([cartItems, jest.fn()]);

    await act(async () => {
      render(<CartPage />);
    });
    await waitFor(() => {
      expect(screen.getByTestId("drop-in")).toBeInTheDocument();
    });
    await act(async () => {
      mockInstanceCallback({ requestPaymentMethod: jest.fn() });
    });

    const paymentButton = screen.getByText("Make Payment");

    expect(paymentButton).toBeDisabled();
  });

  test("handles error in removeCartItem", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const cartItems = [
      { _id: "1", name: "Item 1", description: "First item description", price: 10 },
    ];
    const mockSetCart = jest.fn(() => {
      throw new Error("Set cart error");
    });
    useAuth.mockReturnValue([{ user: null, token: null }, jest.fn()]);
    useCart.mockReturnValue([cartItems, mockSetCart]);

    await act(async () => {
      render(<CartPage />);
    });

    const removeButton = screen.getByText(/Remove/i);
    fireEvent.click(removeButton);

    expect(consoleLogSpy).toHaveBeenCalled();
    consoleLogSpy.mockRestore();
  });
});