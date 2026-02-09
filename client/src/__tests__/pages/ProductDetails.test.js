import React from "react";
import axios from "axios";
import toast from "react-hot-toast";
import ProductDetails from "../../pages/ProductDetails.js";
import { useCart } from "../../context/cart.js";
import { useParams, useNavigate } from "react-router-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import { act } from 'react-dom/test-utils';

// Mock dependencies
jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock("@context/cart", () => ({
  useCart: jest.fn()
}));

jest.mock("@components/Layout", () => {
  return ({ children }) => <div data-testid="layout">{children}</div>;
});

jest.mock('@components/Header', () => () => <div>Header</div>);

describe("Product Details Page", () => {
  let mockNavigate;
  let mockSetCart;
  let mockCart;

  // Mock product data and related products
  const mockProduct = {
    _id: "product123",
    name: "Test Product",
    description: "This is a test product description",
    price: 99.99,
    slug: "test-product",
    category: {
      _id: "category123",
      name: "Test Category",
    },
  };

  const mockRelatedProducts = [
    {
      _id: "related1",
      name: "Related Product 1",
      description: "This is a related product with a longer description that will be truncated",
      price: 49.99,
      slug: "related-product-1",
    },
    {
      _id: "related2",
      name: "Related Product 2",
      description: "Another related product description that is quite long",
      price: 79.99,
      slug: "related-product-2",
    },
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    mockNavigate = jest.fn();
    mockSetCart = jest.fn();
    mockCart = [];

    useNavigate.mockReturnValue(mockNavigate);
    useCart.mockReturnValue([mockCart, mockSetCart]);
    useParams.mockReturnValue({ slug: "test-product" });

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

  const renderProductDetails = () => {
    return render(
      <BrowserRouter>
        <ProductDetails />
      </BrowserRouter>
    )
  }

  // ============================================================
  // Component Rendering
  // ============================================================
  it("displays product details when data is loaded", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockResolvedValueOnce({ data: { products: [] } });

    await act(async () => {renderProductDetails()});

    await waitFor(() => {
      expect(screen.getByText("Product Details")).toBeInTheDocument();
      expect(screen.getByText(/Name : Test Product/i)).toBeInTheDocument();
      expect(screen.getByText(/Description : This is a test product description/i)).toBeInTheDocument();
      expect(screen.getByText(/Price :/i)).toBeInTheDocument();
      expect(screen.getByText(/\$99.99/)).toBeInTheDocument();
      expect(screen.getByText(/Category : Test Category/i)).toBeInTheDocument();
    });
  });

  it("renders product image with correct attributes", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockResolvedValueOnce({ data: { products: [] } });

    await act(async () => {renderProductDetails()});

    await waitFor(() => {
      const productImage = screen.getByAltText("Test Product");
      expect(productImage).toBeInTheDocument();
      expect(productImage).toHaveAttribute(
        "src",
        "/api/v1/product/product-photo/product123"
      );
    });
  })

  it("renders ADD TO CART button", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockResolvedValueOnce({ data: { products: [] } });

    await act(async () => {renderProductDetails()});

    await waitFor(() => {
      const addToCartButtons = screen.getAllByText("ADD TO CART");
      expect(addToCartButtons[0]).toBeInTheDocument();
    });
  });

  // ============================================================
  // API Calls
  // ============================================================  
  it("fetches product details on mount", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockResolvedValueOnce({ data: { products: [] } });

    await act(async () => {renderProductDetails()});

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/api/v1/product/get-product/test-product"
      );
    });   
  });

  it("fetches similar products after getting product details", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    await act(async () => {renderProductDetails()});

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/api/v1/product/related-product/product123/category123"
      );
    });   
  });

  it("handles error when fetching product details", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    await act(async () => {renderProductDetails()});

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    consoleLogSpy.mockRestore();
  });

  it("handles error when fetching similar product", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    await act(async () => {renderProductDetails()});

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    consoleLogSpy.mockRestore();
  });

  // ============================================================
  // Similar Products Section
  // ============================================================
  it("displays similar products heading", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    await act(async () => {renderProductDetails()});

    await waitFor(() => {
      expect(screen.getByText(/Similar Products/i)).toBeInTheDocument();
    }); 
  });

  it("displays message when no similar products are found", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockResolvedValueOnce({ data: { products: [] } });

    await act(async () => {renderProductDetails()});

    await waitFor(() => {
      expect(screen.getByText("No Similar Products found")).toBeInTheDocument();
    }); 
  });

  it("renders related products cards", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    await act(async () => {renderProductDetails()});

    await waitFor(() => {
      expect(screen.getByText("Related Product 1")).toBeInTheDocument();
      expect(screen.getByText("Related Product 2")).toBeInTheDocument();
    }); 
  });

  it("truncates related product descriptions", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    await act(async () => {renderProductDetails()});

    await waitFor(() => {
      expect(
        screen.getByText(/This is a related product with a longer description that/i)
      ).toBeInTheDocument();
    }); 
  });

  it("displays prices for related products", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    await act(async () => {renderProductDetails()});

    await waitFor(() => {
      expect(screen.getByText("$49.99")).toBeInTheDocument();
      expect(screen.getByText("$79.99")).toBeInTheDocument();
    }); 
  });

  // ============================================================
  // Cart Functionality
  // ============================================================
  it("adds main product to cart when ADD TO CART is clicked", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockResolvedValueOnce({ data: { products: [] } });

    await act(async () => {renderProductDetails()});

    await waitFor(() => {
      const addToCartButton = screen.getAllByText("ADD TO CART")[0];
      fireEvent.click(addToCartButton);
    });

    expect(mockSetCart).toHaveBeenCalledWith([mockProduct]);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "cart",
      JSON.stringify([mockProduct])
    );
    expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
  });

  it("adds related product to cart when ADD TO CART is clicked", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    await act(async () => {renderProductDetails()});

    await waitFor(() => {
      const addToCartButton = screen.getAllByText("ADD TO CART")[1];
      fireEvent.click(addToCartButton);
    });

    expect(mockSetCart).toHaveBeenCalledWith([mockRelatedProducts[0]]);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "cart",
      JSON.stringify([mockRelatedProducts[0]])
    );
    expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
  });

  it("appends product to existing cart", async () => {
    const existingCart = [{ _id: "existing1", name: "Existing Product" }];
    useCart.mockReturnValue([existingCart, mockSetCart]);

    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockResolvedValueOnce({ data: { products: [] } });

    await act(async () => {renderProductDetails()});

    await waitFor(() => {
      const addToCartButton = screen.getAllByText("ADD TO CART")[0];
      fireEvent.click(addToCartButton);
    });

    expect(mockSetCart).toHaveBeenCalledWith([...existingCart, mockProduct]);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "cart",
      JSON.stringify([...existingCart, mockProduct])
    );
  });

  // ============================================================
  // Navigation and Hook
  // ============================================================
  it("navigates to related product details page when More Details is clicked", async () => {
    axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
    axios.get.mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    await act(async () => {renderProductDetails()});

    await waitFor(() => {
      const moreDetailsButtons = screen.getAllByText("More Details");
      fireEvent.click(moreDetailsButtons[0]);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/product/related-product-1");
  });

  it("refetches product when slug param changes", async () => {
    axios.get.mockResolvedValue({ data: { product: mockProduct, products: [] } });

    await act(async () => {renderProductDetails()});

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
    });

    // Change the slug
    useParams.mockReturnValue({ slug: "new-product-slug" });

    await act(async () => {renderProductDetails()});

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/api/v1/product/get-product/new-product-slug"
      );
    });
  });
});