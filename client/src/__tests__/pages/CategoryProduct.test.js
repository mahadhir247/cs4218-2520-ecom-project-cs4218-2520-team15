/* Name: Kok Fangyu Inez
 * Student No: A0258672R
 */

import React from "react";
import axios from "axios";
import toast from "react-hot-toast";
import CategoryProduct from "../../pages/CategoryProduct.js";
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

describe("Category Product Page", () => {
  let mockNavigate;
  let mockSetCart;
  let mockCart;

  // Mock category
  const mockCategory = {
    _id: "cat1",
    name: "Electronics",
    slug: "electronics"
  };

  // Mock products found in category
  const mockProducts = [{
    _id: "p1",
    name: "Laptop",
    slug: "laptop",
    description: "High-performance laptop with amazing features and great battery life",
    price: 999.99,
    category: mockCategory
  }, {
    _id: "p2",
    name: "Smartphone",
    slug: "smartphone",
    description: "Latest smartphone with cutting-edge technology and stunning display",
    price: 699.99,
    category:mockCategory
  }, {
    _id: "p3",
    name: "Tablet",
    slug: "tablet",
    description: "Portable tablet perfect for work and entertainment on the go",
    price: 499.99,
    category: mockCategory
  }];

  // Mock API response
  const mockApiResponse = {
    category: mockCategory,
    products: mockProducts,
    total: 3
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Hide away console output for testing
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});

    mockNavigate = jest.fn();
    mockSetCart = jest.fn();
    mockCart = [];

    useNavigate.mockReturnValue(mockNavigate);
    useCart.mockReturnValue([mockCart, mockSetCart]);
    useParams.mockReturnValue({ slug: "electronics" });

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

  const renderCategoryProduct = () => {
    return render(
      <BrowserRouter>
        <CategoryProduct />
      </BrowserRouter>
    )
  };

  // ============================================================
  // Component Rendering
  // ============================================================
  it("displays category name when data is loaded", async () => {
    // Arrange
    axios.get.mockResolvedValueOnce({ data: mockApiResponse });

    // Act
    await act(async () => {renderCategoryProduct()});

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Category - Electronics/i)).toBeInTheDocument();
    });
  });

  it("displays product count correctly", async () => {
    // Arrange
    axios.get.mockResolvedValueOnce({ data: mockApiResponse });

    // Act
    await act(async () => {renderCategoryProduct()});

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Showing 3 of 3 result\(s\)/i)).toBeInTheDocument();
    });
  });

  it("renders all products in the category", async () => {
    // Arrange
    axios.get.mockResolvedValueOnce({ data: mockApiResponse });

    // Act
    await act(async () => {renderCategoryProduct()});

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Laptop")).toBeInTheDocument();
      expect(screen.getByText("Smartphone")).toBeInTheDocument();
      expect(screen.getByText("Tablet")).toBeInTheDocument();
    });
  });

  it("displays product images with correct attributes", async () => {
    // Arrange
    axios.get.mockResolvedValueOnce({ data: mockApiResponse });

    // Act
    await act(async () => {renderCategoryProduct()});

    // Assert
    await waitFor(() => {
      const laptopImage = screen.getByAltText("Laptop");
      expect(laptopImage).toBeInTheDocument();
      expect(laptopImage).toHaveAttribute(
        "src",
        "/api/v1/product/product-photo/p1"
      );
    });
  });

  it("displays product prices in USD format", async () => {
    // Arrange
    axios.get.mockResolvedValueOnce({ data: mockApiResponse });

    // Act
    await act(async () => {renderCategoryProduct()});

    // Assert
    await waitFor(() => {
      expect(screen.getByText("$999.99")).toBeInTheDocument();
      expect(screen.getByText("$699.99")).toBeInTheDocument();
      expect(screen.getByText("$499.99")).toBeInTheDocument();
    });
  });

  it("truncates product descriptions to 60 characters", async () => {
    // Arrange
    axios.get.mockResolvedValueOnce({ data: mockApiResponse });

    // Act
    await act(async () => {renderCategoryProduct()});

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/High-performance laptop with amazing features and great ba/i)).toBeInTheDocument();
    });
  });

  // ============================================================
  // API Calls
  // ============================================================
  it("fetches products by category on mount", async () => {
    // Arrange
    axios.get.mockResolvedValueOnce({ data: mockApiResponse });

    // Act
    await act(async () => {renderCategoryProduct()});

    // Assert
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/api/v1/product/product-category/electronics/1"
      );
    });
  });

  it("handles error when fetching products", async () => {
    // Arrange
    const consoleLogSpy = jest.spyOn(console, "log");
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    // Act
    await act(async () => {renderCategoryProduct()});

    // Assert
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    });

  });

  it("sets loading state while fetching", async () => {
    // Arrange
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    axios.get.mockReturnValue(promise);

    // Act
    await act(async () => {renderCategoryProduct()});

    // Assert
    // Loading state should be true initially
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Resolve the promise
    resolvePromise({ data: mockApiResponse });

    await waitFor(() => {
      expect(screen.getByText("Laptop")).toBeInTheDocument();
    });
  });

  // ============================================================
  // Pagination - Load More Feature
  // ============================================================
  it("shows Load More button when there are more products", async () => {
    // Arrange
    const partialResponse = {
      ...mockApiResponse,
      products: [mockProducts[0], mockProducts[1]], // Only 2 products
      total: 5 // But total is 5
    };

    axios.get.mockResolvedValueOnce({ data: partialResponse });

    // Act
    await act(async () => {renderCategoryProduct()});

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Load More")).toBeInTheDocument();
    });
  });

  it("does not show Load More button when all products are loaded", async () => {
    // Arrange
    axios.get.mockResolvedValueOnce({ data: mockApiResponse });

    // Act
    await act(async () => {renderCategoryProduct()});

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Laptop")).toBeInTheDocument();
    });

    expect(screen.queryByText("Load More")).not.toBeInTheDocument();
  });

  it("loads more products when Load More button is clicked", async () => {
    // Arrange
    const firstPageResponse = {
      category: mockCategory,
      products: [mockProducts[0], mockProducts[1]],
      total: 3
    };

    const secondPageResponse = {
      category: mockCategory,
      products: [mockProducts[2]],
      total: 3
    };

    // First page load
    axios.get.mockResolvedValueOnce({ data: firstPageResponse });

    await act(async () => {renderCategoryProduct()});

    await waitFor(() => {
      expect(screen.getByText("Laptop")).toBeInTheDocument();
      expect(screen.getByText("Smartphone")).toBeInTheDocument();
    });

    // Second page load
    axios.get.mockResolvedValueOnce({ data: secondPageResponse });

    // Act
    const loadMoreButton = screen.getByText("Load More");
    fireEvent.click(loadMoreButton);

    // Assert
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/api/v1/product/product-category/electronics/2"
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Tablet")).toBeInTheDocument();
    });
  });

  it("displays Loading.. text while loading more products", async () => {
    // Arrange
    const firstPageResponse = {
      category: mockCategory,
      products: [mockProducts[0], mockProducts[1]],
      total: 3
    };
    
    axios.get.mockResolvedValueOnce({ data: firstPageResponse });

    await act(async () => {renderCategoryProduct()});

    await waitFor(() => {
      expect(screen.getByText("Load More")).toBeInTheDocument();
    });

    // Mock a slow response
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    axios.get.mockReturnValue(promise);

    // Act
    const loadMoreButton = screen.getByText("Load More");
    fireEvent.click(loadMoreButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    // Resolve the promise
    resolvePromise({ 
      data: {
        category: mockCategory,
        products: [mockProducts[1]],
        total: 3
      }
    });
  });

  it("appends new products to existing products on Load More", async () => {
    // Arrange
    const firstPageResponse = {
      category: mockCategory,
      products: [mockProducts[0], mockProducts[1]],
      total: 3
    };

    const secondPageResponse = {
      category: mockCategory,
      products: [mockProducts[2]],
      total: 3
    };
    
    axios.get.mockResolvedValueOnce({ data: firstPageResponse });

    await act(async () => {renderCategoryProduct()});

    await waitFor(() => {
      expect(screen.getByText("Laptop")).toBeInTheDocument();
      expect(screen.getByText("Smartphone")).toBeInTheDocument();
    });

    axios.get.mockResolvedValueOnce({ data: secondPageResponse });

    // Act
    const loadMoreButton = screen.getByText("Load More");
    fireEvent.click(loadMoreButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Laptop")).toBeInTheDocument();
      expect(screen.getByText("Smartphone")).toBeInTheDocument();
      expect(screen.getByText("Tablet")).toBeInTheDocument();
    });
  });

  // ============================================================
  // Cart - ADD TO CART Feature
  // ============================================================
  it("adds product to cart when ADD TO CART is clicked", async () => {
    // Arrange
    axios.get.mockResolvedValueOnce({ data: mockApiResponse });

    await act(async () => {renderCategoryProduct()});

    // Act
    const addToCartButtons = screen.getAllByText("ADD TO CART");
    fireEvent.click(addToCartButtons[0]); // Add Laptop

    // Assert
    expect(mockSetCart).toHaveBeenCalledWith([mockProducts[0]]);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "cart",
      JSON.stringify([mockProducts[0]])
    );
    expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
  });

  it("appends product to existing cart", async () => {
    // Arrange
    const existingCart = [{ _id: "existing1", name: "Existing Product" }];
    useCart.mockReturnValue([existingCart, mockSetCart]);

    axios.get.mockResolvedValueOnce({ data: mockApiResponse });

    await act(async () => {renderCategoryProduct()});

    // Act
    const addToCartButtons = screen.getAllByText("ADD TO CART");
    fireEvent.click(addToCartButtons[0]); // Add Laptop

    // Assert
    expect(mockSetCart).toHaveBeenCalledWith([...existingCart, mockProducts[0]]);
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "cart",
      JSON.stringify([...existingCart, mockProducts[0]])
    );
    expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
  });

  // ============================================================
  // Navigation and Hook
  // ============================================================
  it("navigates to correct product when More Details is clicked", async () => {
    // Arrange
    axios.get.mockResolvedValueOnce({ data: mockApiResponse });

    await act(async () => {renderCategoryProduct()});

    await waitFor(() => {
      expect(screen.getByText("Laptop")).toBeInTheDocument();
    });

    // Act
    const moreDetailsButtons = screen.getAllByText("More Details");
    fireEvent.click(moreDetailsButtons[0]);

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith("/product/laptop");
  });

  it("reset state when category slug changes", async () => {
    // Arrange
    axios.get.mockResolvedValueOnce({ data: mockApiResponse });

    await act(async () => {renderCategoryProduct()});

    await waitFor(() => {
      expect(screen.getByText("Laptop")).toBeInTheDocument();
    });

    // Change the slug
    useParams.mockReturnValue({ slug: "books" });

    const newMockApiResponse = {
      category: { _id: "cat2", name: "Books", slug: "books" },
      products: [],
      total: 0
    };

    axios.get.mockResolvedValueOnce({ data: newMockApiResponse });

    // Act
    await act(async () => {renderCategoryProduct()});

    // Assert
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/api/v1/product/product-category/books/1"
      );
    });
  });

  it("does not fetch products when slug is undefined", async () => {
    // Arrange
    useParams.mockReturnValue({ slug: undefined });

    // Act
    await act(async () => {renderCategoryProduct()});

    // Assert
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("refetches products when page changes", async () => {
    // Arrange
    const firstPageResponse = {
      category: mockCategory,
      products: [mockProducts[0]],
      total: 2
    };

    axios.get.mockResolvedValueOnce({ data: firstPageResponse });

    await act(async () => {renderCategoryProduct()});

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    // Trigger page change
    axios.get.mockResolvedValueOnce({ 
      data: {
        category: mockCategory,
        products: [mockProducts[1]],
        total: 2
      }
    });

    // Act
    const loadMoreButton = screen.getByText("Load More");
    fireEvent.click(loadMoreButton);

    // Assert
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================================
  // Empty State Handling
  // ============================================================
  it("handles category with no products", async () => {
    // Arrange
    const emptyResponse = {
      category: mockCategory,
      products: [],
      total: 0
    };

    axios.get.mockResolvedValueOnce({ data: emptyResponse });

    // Act
    await act(async () => {renderCategoryProduct()});

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Category - Electronics/i)).toBeInTheDocument();
      expect(screen.getByText(/Showing 0 of 0 result\(s\)/i)).toBeInTheDocument();
    });

    expect(screen.queryByText("Load More")).not.toBeInTheDocument();    
  });
});
