/* Name: Tan Qin Xu
 * Student No: A0213002J
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CartProvider, useCart } from "../../context/cart";

const CartConsumer = () => {
    const [cart, setCart] = useCart();

    const handleAddItem = () => {
        setCart((prev) => [...prev, { id: 1, name: "Test item" }]);
    };

    const handleAddSecondItem = () => {
        setCart((prev) => [...prev, { id: 2, name: "Second item" }]);
    };

    const handleClearCart = () => {
        setCart([]);
    };

    return (
        <div>
            <span data-testid="cart-value">{JSON.stringify(cart)}</span>
            <span data-testid="cart-length">{cart.length}</span>
            <button data-testid="add-item-button" onClick={handleAddItem}>
                Add item
            </button>
            <button data-testid="add-second-item-button" onClick={handleAddSecondItem}>
                Add second item
            </button>
            <button data-testid="clear-cart-button" onClick={handleClearCart}>
                Clear cart
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

    describe("Initial State", () => {
        test("provides an empty cart by default when localStorage is empty", () => {
            window.localStorage.getItem.mockReturnValueOnce(null);

            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            const cartValue = screen.getByTestId("cart-value").textContent;

            expect(cartValue).toBe("[]");
            expect(window.localStorage.getItem).toHaveBeenCalledWith("cart");
        });

        test("initializes cart from localStorage when valid array data is present", async () => {
            const storedCart = [{ id: 1, name: "Stored item" }];
            window.localStorage.getItem.mockReturnValueOnce(JSON.stringify(storedCart));

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

        test("initializes cart with multiple items from localStorage", async () => {
            const storedCart = [
                { id: 1, name: "Item A" },
                { id: 2, name: "Item B" },
                { id: 3, name: "Item C" },
            ];
            window.localStorage.getItem.mockReturnValueOnce(JSON.stringify(storedCart));

            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId("cart-length").textContent).toBe("3");
                expect(screen.getByTestId("cart-value").textContent).toBe(
                    JSON.stringify(storedCart)
                );
            });
        });
    });

    describe("localStorage Error Handling", () => {
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

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Failed to parse cart from localStorage",
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });

        test("ignores localStorage data silently when stored value is not an array", async () => {
            window.localStorage.getItem.mockReturnValueOnce(JSON.stringify({ id: 1 }));
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

            expect(consoleErrorSpy).not.toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });

        test("ignores localStorage data silently when stored value is a plain string", async () => {
            window.localStorage.getItem.mockReturnValueOnce(JSON.stringify("just a string"));

            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId("cart-value").textContent).toBe("[]");
            });
        });

        test("ignores localStorage data silently when stored value is null JSON", async () => {
            window.localStorage.getItem.mockReturnValueOnce(JSON.stringify(null));

            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId("cart-value").textContent).toBe("[]");
            });
        });
    });

    describe("Cart State Updates", () => {
        test("allows adding a single item to the cart via setCart", () => {
            window.localStorage.getItem.mockReturnValueOnce(null);

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

        test("allows adding multiple items sequentially to the cart", () => {
            window.localStorage.getItem.mockReturnValueOnce(null);

            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            fireEvent.click(screen.getByTestId("add-item-button"));
            fireEvent.click(screen.getByTestId("add-second-item-button"));

            expect(screen.getByTestId("cart-length").textContent).toBe("2");
            expect(screen.getByTestId("cart-value").textContent).toBe(
                JSON.stringify([
                    { id: 1, name: "Test item" },
                    { id: 2, name: "Second item" },
                ])
            );
        });

        test("allows clearing the cart via setCart", () => {
            window.localStorage.getItem.mockReturnValueOnce(null);

            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            fireEvent.click(screen.getByTestId("add-item-button"));
            fireEvent.click(screen.getByTestId("clear-cart-button"));

            expect(screen.getByTestId("cart-value").textContent).toBe("[]");
        });

        test("cart length updates correctly as items are added and removed", () => {
            window.localStorage.getItem.mockReturnValueOnce(null);

            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            expect(screen.getByTestId("cart-length").textContent).toBe("0");

            fireEvent.click(screen.getByTestId("add-item-button"));
            expect(screen.getByTestId("cart-length").textContent).toBe("1");

            fireEvent.click(screen.getByTestId("add-second-item-button"));
            expect(screen.getByTestId("cart-length").textContent).toBe("2");

            fireEvent.click(screen.getByTestId("clear-cart-button"));
            expect(screen.getByTestId("cart-length").textContent).toBe("0");
        });
    });

    describe("Provider Behaviour", () => {
        test("renders children correctly inside CartProvider", () => {
            window.localStorage.getItem.mockReturnValueOnce(null);

            render(
                <CartProvider>
                    <div data-testid="child-element">Hello</div>
                </CartProvider>
            );

            expect(screen.getByTestId("child-element")).toBeInTheDocument();
            expect(screen.getByTestId("child-element").textContent).toBe("Hello");
        });

        test("useCart returns undefined when used outside of CartProvider", () => {
            const consoleErrorSpy = jest
                .spyOn(console, "error")
                .mockImplementation(() => {});

            const NoProviderConsumer = () => {
                const cartContext = useCart();
                return (
                    <span data-testid="context-value">
                        {cartContext === undefined ? "undefined" : "defined"}
                    </span>
                );
            };

            render(<NoProviderConsumer />);

            expect(screen.getByTestId("context-value").textContent).toBe("undefined");

            consoleErrorSpy.mockRestore();
        });

        test("reads localStorage exactly once on mount", () => {
            window.localStorage.getItem.mockReturnValueOnce(null);

            render(
                <CartProvider>
                    <CartConsumer />
                </CartProvider>
            );

            expect(window.localStorage.getItem).toHaveBeenCalledTimes(1);
            expect(window.localStorage.getItem).toHaveBeenCalledWith("cart");
        });
    });
});