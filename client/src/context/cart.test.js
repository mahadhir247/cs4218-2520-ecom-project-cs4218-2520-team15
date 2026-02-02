import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CartProvider, useCart } from "./cart";

const CartConsumer = () => {
  const [cart, setCart] = useCart();

  const handleAddItem = () => {
    setCart((prev) => [...prev, { id: 1, name: "Test item" }]);
  };

  return (
    <div>
      <span data-testid="cart-value">{JSON.stringify(cart)}</span>
      <button data-testid="add-item-button" onClick={handleAddItem}>
        Add item
      </button>
    </div>
  );
};

let localStorageStore;

describe("CartContext", () => {
  beforeEach(() => {
    localStorageStore = {};

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key) =>
          Object.prototype.hasOwnProperty.call(localStorageStore, key)
            ? localStorageStore[key]
            : null
        ),
        setItem: jest.fn((key, value) => {
          localStorageStore[key] = value;
        }),
        removeItem: jest.fn((key) => {
          delete localStorageStore[key];
        }),
        clear: jest.fn(() => {
          localStorageStore = {};
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("provides an empty cart by default when localStorage is empty", () => {
    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    const cartValue = screen.getByTestId("cart-value").textContent;

    expect(cartValue).toBe("[]");
    expect(window.localStorage.getItem).toHaveBeenCalledWith("cart");
  });

  test("initializes cart from localStorage when valid data is present", async () => {
    const storedCart = [{ id: 1, name: "Stored item" }];
    window.localStorage.getItem.mockReturnValueOnce(
      JSON.stringify(storedCart)
    );

    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("cart-value").textContent).toBe(
        JSON.stringify(storedCart)
      );
    });
  });

  test("allows updating the cart via setCart", () => {
    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId("add-item-button"));

    expect(screen.getByTestId("cart-value").textContent).toBe(
      JSON.stringify([{ id: 1, name: "Test item" }])
    );
  });

  test("handles invalid JSON in localStorage gracefully and keeps cart empty", async () => {
    window.localStorage.getItem.mockReturnValueOnce("this-is-not-json");
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <CartProvider>
        <CartConsumer />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("cart-value").textContent).toBe("[]");
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

