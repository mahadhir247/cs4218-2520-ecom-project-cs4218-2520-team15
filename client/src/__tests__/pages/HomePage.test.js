/* Name: Kok Fangyu Inez
 * Student No: A0258672R
 */

import React from "react";
import axios from "axios";
import toast from "react-hot-toast";
import HomePage from "../../pages/HomePage.js";
import { useCart } from "../../context/cart.js";
import { useNavigate } from "react-router-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import { act } from 'react-dom/test-utils';

// Mock dependencies
jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("@context/cart", () => ({
  useCart: jest.fn()
}));

jest.mock("@components/Layout", () => {
  return ({ children }) => <div data-testid="layout">{children}</div>;
});

jest.mock("@components/Header", () => () => <div>Header</div>);

jest.mock("@components/Prices", () => ({
  Prices: [
    { _id: 0, name: "$0 to 19", array: [0, 19], },
    { _id: 1, name: "$20 to 39", array: [20, 39], },
    { _id: 2, name: "$40 or more", array: [40, Infinity], },
  ]
}));

describe("Home Page", () => {
  let mockNavigate;
  let mockSetCart;
  let mockCart;

  // Mock categories
  const mockCategories = [
    { _id: "cat1", name: "Electronics", slug: "electronics" },
    { _id: "cat2", name: "Clothing", slug: "clothing" },
    { _id: "cat3", name: "Book", slug: "book" },
  ];

  // Mock products
  const mockProducts = [
    {
      _id: "p1",
      name: "Laptop",
      slug: "laptop",
      description: "High-performance laptop with amazing features and great battery life",
      price: 999.99,
      category: { _id: "cat1", name: "Electronics", slug: "electronics" },
    },
    {
      _id: "p2",
      name: "Smartphone",
      slug: "smartphone",
      description: "Latest smartphone with cutting-edge technology and stunning display",
      price: 699.99,
      category: { _id: "cat1", name: "Electronics", slug: "electronics" },
    },
    {
      _id: "p3",
      name: "Tablet",
      slug: "tablet",
      description: "Portable tablet perfect for work and entertainment on the go",
      price: 499.99,
      category: { _id: "cat1", name: "Electronics", slug: "electronics" },
    },
    {
      _id: "p4",
      name: "Socks",
      slug: "socks",
      description: "Comfortable high-cut white socks for daily use",
      price: 5.99,
      category: { _id: "cat2", name: "Clothing", slug: "clothing" },
    },
    {
      _id: "p5",
      name: "Jacket",
      slug: "jacket",
      description: "Retro brown leather jacket for men",
      price: 25.99,
      category: { _id: "cat2", name: "Clothing", slug: "clothing" },
    },
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Hide away console log for testing
    jest.spyOn(console, "log").mockImplementation(() => {});

    mockNavigate = jest.fn();
    mockSetCart = jest.fn();
    mockCart = [];

    useNavigate.mockReturnValue(mockNavigate);
    useCart.mockReturnValue([mockCart, mockSetCart]);

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

  const renderHomePage = () => {
    return render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )
  };

  // ============================================================
  // Component Rendering
  // ============================================================
  describe("Component Rendering", () => {
    it("renders the banner image", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      expect(screen.getByAltText("bannerimage")).toBeInTheDocument();
    });

    it("renders All Products heading", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      expect(screen.getByText("All Products")).toBeInTheDocument();
    });

    it("renders Filter By Category heading", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      expect(screen.getByText("Filter By Category")).toBeInTheDocument();
    });

    it("renders Filter By Price heading", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      expect(screen.getByText("Filter By Price")).toBeInTheDocument();
    });

    it("renders RESET FILTERS button", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      expect(screen.getByText("RESET FILTERS")).toBeInTheDocument();
    });

    it("renders a checkbox for each category", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("Clothing")).toBeInTheDocument();
        expect(screen.getByText("Book")).toBeInTheDocument();
      });
    });

    it("renders a radio for each price range", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      await waitFor(() => {
        expect(screen.getByText("$0 to 19")).toBeInTheDocument();
        expect(screen.getByText("$20 to 39")).toBeInTheDocument();
        expect(screen.getByText("$40 or more")).toBeInTheDocument();
      });
    });

    it("renders product images with the correct src", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      await waitFor(() => {
        expect(screen.getByAltText("Laptop")).toHaveAttribute(
          "src",
          "/api/v1/product/product-photo/p1"
        );
        expect(screen.getByAltText("Smartphone")).toHaveAttribute(
          "src",
          "/api/v1/product/product-photo/p2"
        );
        expect(screen.getByAltText("Tablet")).toHaveAttribute(
          "src",
          "/api/v1/product/product-photo/p3"
        );
        expect(screen.getByAltText("Socks")).toHaveAttribute(
          "src",
          "/api/v1/product/product-photo/p4"
        );
        expect(screen.getByAltText("Jacket")).toHaveAttribute(
          "src",
          "/api/v1/product/product-photo/p5"
        );
      });
    });

    it("renders product prices formatted as USD currency", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      await waitFor(() => {
        expect(screen.getByText("$999.99")).toBeInTheDocument();
        expect(screen.getByText("$699.99")).toBeInTheDocument();
        expect(screen.getByText("$499.99")).toBeInTheDocument();
        expect(screen.getByText("$5.99")).toBeInTheDocument();
        expect(screen.getByText("$25.99")).toBeInTheDocument();
      });
    });

    it("truncates product descriptions to 60 characters followed by ellipsis", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText("High-performance laptop with amazing features and great batt...")
        ).toBeInTheDocument();
      });
    });

    it("renders a More Details button for each product", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      await waitFor(() => {
        expect(screen.getAllByText("More Details")).toHaveLength(mockProducts.length);
      });
    });

    it("renders a ADD TO CART button for each product", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      await waitFor(() => {
        expect(screen.getAllByText("ADD TO CART")).toHaveLength(mockProducts.length);
      });
    });
  });

  // ============================================================
  // API Calls
  // ============================================================
  describe("API calls", () => {
    it("fetches categories on mount", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
      });
    });

    it("fetches total product count on mount", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-count");
      });
    });

    it("fetches page 1 of products on mount", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-list/1");
      });
    });

    it("handles error when fetching categories on mount", async () => {
      // Arrange
      const consoleLogSpy = jest.spyOn(console, "log");
      axios.get
        .mockRejectedValueOnce(new Error("Categories fetch failed"))
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
      });

      consoleLogSpy.mockRestore();
    });

    it("handles error when fetching total product count on mount", async () => {
      // Arrange
      const consoleLogSpy = jest.spyOn(console, "log");
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockRejectedValueOnce(new Error("Count fetch failed"))
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
      });

      consoleLogSpy.mockRestore();
    });

    it("handles error when fetching products on mount", async () => {
      // Arrange
      const consoleLogSpy = jest.spyOn(console, "log");
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockRejectedValueOnce(new Error("Product list fetch failed"));
      
        // Act
      await act(async () => { renderHomePage(); });

      // Assert
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
      });

      consoleLogSpy.mockRestore();
    });

    it("does not populate categories when getAllCategory returns success: false", async () => {
      // Arrange — category endpoint returns success: false
      axios.get
        .mockResolvedValueOnce({ data: { success: false, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      
      // Act
      await act(async () => { renderHomePage(); });

      // Assert — none of the category labels should be rendered
      await waitFor(() => {
        expect(screen.queryByText("Electronics")).not.toBeInTheDocument();
        expect(screen.queryByText("Clothing")).not.toBeInTheDocument();
        expect(screen.queryByText("Book")).not.toBeInTheDocument();
      });
    });

    it("does not update total when getTotal returns success: false", async () => {
      // Arrange — product-count endpoint returns success: false
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: false, total: 99 } })
        .mockResolvedValueOnce({ data: { success: true, products: [mockProducts[0]] } });

      // Act
      await act(async () => { renderHomePage(); });

      // Assert — total stays 0, so products.length (1) is NOT < total (0);
      // Load More should be hidden.
      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.queryByText("Load More")).not.toBeInTheDocument();
      });
    });

    it("does not update product list when getAllProducts returns success: false on page 1", async () => {
      // Arrange — product-list endpoint returns success: false
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: false, products: mockProducts } }); // ignored

      // Act
      await act(async () => { renderHomePage(); });

      // Assert — product cards should not be rendered
      await waitFor(() => {
        expect(screen.queryByText("Laptop")).not.toBeInTheDocument();
        expect(screen.queryByText("ADD TO CART")).not.toBeInTheDocument();
      });
    });

    it("does not append products when getAllProducts returns success: false on page 2", async () => {
      // Arrange — first page succeeds (3 products, total 5 → Load More visible)
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: [mockProducts[0], mockProducts[1], mockProducts[2]] } });

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Load More")).toBeInTheDocument());

      // Second page returns success: false
      axios.get.mockResolvedValueOnce({ data: { success: false, products: [mockProducts[3], mockProducts[4]] } });

      // Act
      await act(async () => { fireEvent.click(screen.getByText("Load More")); });

      // Assert — only the original 3 products remain; new ones are not appended
      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("Smartphone")).toBeInTheDocument();
        expect(screen.getByText("Tablet")).toBeInTheDocument();
        expect(screen.queryByText("Socks")).not.toBeInTheDocument();
        expect(screen.queryByText("Jacket")).not.toBeInTheDocument();
      });
    });

    it("does not update product list when filterProduct returns success: false on filterPage 1", async () => {
        // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      // Filter POST returns success: false
      axios.post.mockResolvedValueOnce({ data: { success: false, products: [mockProducts[0]], total: 1 } });

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Electronics")).toBeInTheDocument());

      // Act — check a category to trigger filterProduct
      const checkbox = screen.getByLabelText("Electronics");
      await act(async () => { fireEvent.click(checkbox); });

      // Assert — product list should remain unchanged (all 5 products still shown),
      // because the if (data?.success) guard was not entered.
      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("Socks")).toBeInTheDocument();
      });    
    });

    it("does not append filtered products when filterProduct returns success: false on filterPage 2", async () => {
      // Arrange — initial load + first filter page succeeds (2 of 3 results)
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      axios.post.mockResolvedValueOnce({
        data: { success: true, products: [mockProducts[0], mockProducts[1]], total: 3 },
      });

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Electronics")).toBeInTheDocument());

      const checkbox = screen.getByLabelText("Electronics");
      await act(async () => { fireEvent.click(checkbox); });
      await waitFor(() => expect(screen.getByText("Load More")).toBeInTheDocument());

      // Second filter page returns success: false
      axios.post.mockResolvedValueOnce({ data: { success: false, products: [mockProducts[2]], total: 3 } });

      // Act
      await act(async () => { fireEvent.click(screen.getByText("Load More")); });

      // Assert — only the 2 products from the first filter page remain
      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("Smartphone")).toBeInTheDocument();
        expect(screen.queryByText("Tablet")).not.toBeInTheDocument();
      });
    });
  });

  // ============================================================
  // Category Filter (Checkbox)
  // ============================================================
  describe("Category Filter", () => {
    it("calls the filter API when a category checkbox is checked", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      axios.post.mockResolvedValueOnce({ data: { success: true, products: [mockProducts[0]], total: 1 } })

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Electronics")).toBeInTheDocument());

      // Act
      const checkbox = screen.getByLabelText("Electronics");
      await act(async () => { fireEvent.click(checkbox); });

      // Assert
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          "/api/v1/product/product-filters",
          expect.objectContaining({ checked: ["cat1"] })
        );
      });
    });

    it("sends page 1 to the filter API when a category is first checked", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      axios.post.mockResolvedValueOnce({ data: { success: true, products: [mockProducts[0]], total: 1 } })

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Electronics")).toBeInTheDocument());

      // Act
      const checkbox = screen.getByLabelText("Electronics");
      await act(async () => { fireEvent.click(checkbox); });

      // Assert
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          "/api/v1/product/product-filters",
          expect.objectContaining({ page: 1 })
        );
      });
    });

    it("replaces product list with filter results when a category is checked", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      axios.post.mockResolvedValueOnce({ data: { success: true, products: [mockProducts[0], mockProducts[1], mockProducts[2]], total: 3 } })

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Electronics")).toBeInTheDocument());

      // Act
      const checkbox = screen.getByLabelText("Electronics");
      await act(async () => { fireEvent.click(checkbox); });

      // Assert (only the filtered product should appear)
      await waitFor(() => {
        expect(screen.queryByText("Laptop")).toBeInTheDocument();
        expect(screen.queryByText("Smartphone")).toBeInTheDocument();
        expect(screen.queryByText("Tablet")).toBeInTheDocument();
        expect(screen.queryByText("Socks")).not.toBeInTheDocument();
        expect(screen.queryByText("Jacket")).not.toBeInTheDocument();
      });
    });

    it("fetches unfiltered products when the last checked category is unchecked", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      axios.post.mockResolvedValueOnce({ data: { success: true, products: [mockProducts[0], mockProducts[1], mockProducts[2]], total: 3 } })

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Electronics")).toBeInTheDocument());

      // Act
      const checkbox = screen.getByLabelText("Electronics");
      await act(async () => { fireEvent.click(checkbox); }); // check
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
      axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });
      await act(async () => { fireEvent.click(checkbox); }); // uncheck

      // Assert (unfiltered list endpoint is called again)
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-list/1");
      });
    });

    it("handles error when filtering products by category", async () => {
      // Arrange
      const consoleLogSpy = jest.spyOn(console, "log");
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      axios.post.mockRejectedValueOnce(new Error("Filter failed"));

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Electronics")).toBeInTheDocument());

      // Act
      const checkbox = screen.getByLabelText("Electronics");
      await act(async () => { fireEvent.click(checkbox); });

      // Assert
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
      });

      consoleLogSpy.mockRestore();
    });
  });

  // ============================================================
  // Price Filter (Radio)
  // ============================================================
  describe("Price Filter", () => {
    it("calls the filter API when a price range radio is selected", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      axios.post.mockResolvedValueOnce({ data: { success: true, products: [mockProducts[3]], total: 1 } })

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("$0 to 19")).toBeInTheDocument());

      // Act
      const radio = screen.getByLabelText("$0 to 19");
      await act(async () => { fireEvent.click(radio); });

      // Assert
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          "/api/v1/product/product-filters",
          expect.objectContaining({ radio: [0, 19] })
        );
      });
    });

    it("replaces product list with results matching the selected price range", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      axios.post.mockResolvedValueOnce({ data: { success: true, products: [mockProducts[3]], total: 1 } })

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("$0 to 19")).toBeInTheDocument());

      // Act
      const radio = screen.getByLabelText("$0 to 19");
      await act(async () => { fireEvent.click(radio); });

      // Assert
      await waitFor(() => {
        expect(screen.queryByText("Laptop")).not.toBeInTheDocument();
        expect(screen.queryByText("Smartphone")).not.toBeInTheDocument();
        expect(screen.queryByText("Tablet")).not.toBeInTheDocument();
        expect(screen.queryByText("Socks")).toBeInTheDocument();
        expect(screen.queryByText("Jacket")).not.toBeInTheDocument();
      });
    });

    it("sends page 1 to the filter API when a price range is first selected", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      axios.post.mockResolvedValueOnce({ data: { success: true, products: [mockProducts[3]], total: 1 } })

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("$0 to 19")).toBeInTheDocument());

      // Act
      const radio = screen.getByLabelText("$0 to 19");
      await act(async () => { fireEvent.click(radio); });

      // Assert
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          "/api/v1/product/product-filters",
          expect.objectContaining({ page: 1 })
        );
      });
    });
  });

  // ============================================================
  // Reset Filters
  // ============================================================
  describe("Reset Filers", () => {
    it("reloads the page when RESET FILTERS button is clicked", async () => {
      // Arrange
      const reloadSpy = jest.fn();
      delete window.location;
      window.location = { reload: reloadSpy };

      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      await act(async () => { renderHomePage(); });

      // Act
      const resetButton = screen.getByText("RESET FILTERS");
      await act(async () => { fireEvent.click(resetButton); });

      // Assert
      expect(reloadSpy).toHaveBeenCalled();
    });
  })

  // ============================================================
  // No Results State
  // ============================================================
  describe("No Results State", () => {
    it("shows 'No products found' message when filter returns no results", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      axios.post.mockResolvedValueOnce({ data: { success: true, products: [], total: 0 } })

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Electronics")).toBeInTheDocument());

      // Act
      const checkbox = screen.getByLabelText("Electronics");
      await act(async () => { fireEvent.click(checkbox); });

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText("No products found for this filter.")
        ).toBeInTheDocument();
      });
    });

    it("does not show 'No products found' message when not filtering", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: [] } });

      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      await waitFor(() => {
        expect(
          screen.queryByText("No products found for this filter.")
        ).not.toBeInTheDocument();
      });
    });

    it("does not show Load More when filter returns no results", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      axios.post.mockResolvedValueOnce({ data: { success: true, products: [], total: 0 } })

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Electronics")).toBeInTheDocument());

      // Act
      const checkbox = screen.getByLabelText("Electronics");
      await act(async () => { fireEvent.click(checkbox); });

      // Assert
      await waitFor(() => {
        expect(screen.queryByText("Load More")).not.toBeInTheDocument();
      });
    });
  });

  // ============================================================
  // Load More (Unfiltered)
  // ============================================================
  describe("Load More (unfiltered)", () => {
    it("shows Load More button when products.length is less than total", async () => {
      // Arrange — 2 products returned but total is 5
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: [mockProducts[0], mockProducts[1]] } });
      
      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("Smartphone")).toBeInTheDocument();
        expect(screen.queryByText("Load More")).toBeInTheDocument();
      });
    });

    it("does not show Load More button when products.length is equal to total", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      
      // Act
      await act(async () => { renderHomePage(); });

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("Smartphone")).toBeInTheDocument();
        expect(screen.getByText("Tablet")).toBeInTheDocument();
        expect(screen.getByText("Socks")).toBeInTheDocument();
        expect(screen.getByText("Jacket")).toBeInTheDocument();
        expect(screen.queryByText("Load More")).not.toBeInTheDocument();
      });
    });

    it("fetches page 2 of products when Load More is clicked", async () => {
      // Arrange — 2 products returned but total is 5
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: [mockProducts[0], mockProducts[1], mockProducts[2]] } });
      axios.get.mockResolvedValueOnce({ data: { products: [mockProducts[3], mockProducts[4]] } });

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Load More")).toBeInTheDocument());

      // Act
      await act(async () => { fireEvent.click(screen.getByText("Load More")); });

      // Assert
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-list/2");
      });
    });

    it("appends new products to the existing list on Load More click", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: [mockProducts[0], mockProducts[1], mockProducts[2]] } });

      await act(async () => { renderHomePage(); });
      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("Load More")).toBeInTheDocument()
      });
      axios.get.mockResolvedValueOnce({ data: { success: true, products: [mockProducts[3], mockProducts[4]] } });

      // Act
      await act(async () => { fireEvent.click(screen.getByText("Load More")); });

      // Assert (all 5 products visible)
      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("Smartphone")).toBeInTheDocument();
        expect(screen.getByText("Tablet")).toBeInTheDocument();
        expect(screen.getByText("Socks")).toBeInTheDocument();
        expect(screen.getByText("Jacket")).toBeInTheDocument();
      });
    });

    it("shows Loading... text on the button while fetching more products", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: [mockProducts[0], mockProducts[1], mockProducts[2]] } });

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Load More")).toBeInTheDocument());

      // Hold the second request open
      let resolveLoadMore;
      const slowPromise = new Promise((resolve) => { resolveLoadMore = resolve; });
      axios.get.mockReturnValueOnce(slowPromise);

      // Act
      await act(async () => { fireEvent.click(screen.getByText("Load More")); });

      // Assert
      expect(screen.getByText("Loading...")).toBeInTheDocument();

      // Cleanup
      resolveLoadMore({ data: { products: [] } });
    });

  });

  // ============================================================
  // Load More (filtered)
  // ============================================================
  describe("Load More (filtered)", () => {
    it("shows Load More when filtered products.length is less than filteredTotal", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      axios.post.mockResolvedValueOnce({ data: { success: true, products: [mockProducts[0]], total: 3 }});

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Electronics")).toBeInTheDocument());

      // Act
      const checkbox = screen.getByLabelText("Electronics");
      await act(async () => { fireEvent.click(checkbox); });

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Load More")).toBeInTheDocument();
      });
    });

    it("does not show Load More when filtered products.length is equal to filteredTotal", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      axios.post.mockResolvedValueOnce({ data: { success: true, products: [mockProducts[0], mockProducts[1], mockProducts[2]], total: 3 }});

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Electronics")).toBeInTheDocument());

      // Act
      const checkbox = screen.getByLabelText("Electronics");
      await act(async () => { fireEvent.click(checkbox); });

      // Assert
      await waitFor(() => {
        expect(screen.queryByText("Load More")).not.toBeInTheDocument();
      });
    });

    it("calls the filter API with page 2 when Load More is clicked while filtering", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      axios.post.mockResolvedValueOnce({ data: { success: true, products: [mockProducts[0], mockProducts[1]], total: 3 }}); // first filtered page

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Electronics")).toBeInTheDocument());

      axios.post.mockResolvedValueOnce({ data: { success: true, products: [mockProducts[2]], total: 3 }}); // second filtered page
      const checkbox = screen.getByLabelText("Electronics");
      await act(async () => { fireEvent.click(checkbox); });
      await waitFor(() => expect(screen.getByText("Load More")).toBeInTheDocument());

      // Act
      await act(async () => { fireEvent.click(screen.getByText("Load More")); });

      // Assert
      await waitFor(() => {
       expect(axios.post).toHaveBeenLastCalledWith(
        "/api/v1/product/product-filters",
        expect.objectContaining({ checked: ["cat1"], page: 2 })
       );
      });
    });

    it("appends new products to filtered list on Load More click", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      axios.post.mockResolvedValueOnce({ data: { success: true, products: [mockProducts[0], mockProducts[1]], total: 3 }}); // first filtered page

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Electronics")).toBeInTheDocument());

      axios.post.mockResolvedValueOnce({ data: { success: true, products: [mockProducts[2]], total: 3 }}); // second filtered page
      const checkbox = screen.getByLabelText("Electronics");
      await act(async () => { fireEvent.click(checkbox); });
      await waitFor(() => expect(screen.getByText("Load More")).toBeInTheDocument());

      // Act
      await act(async () => { fireEvent.click(screen.getByText("Load More")); });

      // Assert (all 3 filtered results visible)
      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("Smartphone")).toBeInTheDocument();
        expect(screen.getByText("Tablet")).toBeInTheDocument();
      });
    });

    it("shows Loading... on the button while fetching more filtered products", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      axios.post.mockResolvedValueOnce({ data: { success: true, products: [mockProducts[0], mockProducts[1]], total: 3 }}); // first filtered page

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Electronics")).toBeInTheDocument());

      const checkbox = screen.getByLabelText("Electronics");
      await act(async () => { fireEvent.click(checkbox); });
      await waitFor(() => expect(screen.getByText("Load More")).toBeInTheDocument());

      // Hold the second POST open
      let resolveLoadMore;
      const slowPromise = new Promise((resolve) => { resolveLoadMore = resolve; });
      axios.post.mockReturnValueOnce(slowPromise);

      // Act
      await act(async () => { fireEvent.click(screen.getByText("Load More")); });

      // Assert
      expect(screen.getByText("Loading...")).toBeInTheDocument();

      // Cleanup
      resolveLoadMore({ data: { products: [], total: 3 } });
    });
  });

  // ============================================================
  // Cart - ADD TO CART
  // ============================================================
  describe("ADD TO CART", () => {
    it("adds the clicked product to the cart state", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      
      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Laptop")).toBeInTheDocument());
      
      // Act
      const addToCartButtons = screen.getAllByText("ADD TO CART");
      await act(async () => { fireEvent.click(addToCartButtons[0]); }); // first product = Laptop

      // Assert
      expect(mockSetCart).toHaveBeenCalledWith([mockProducts[0]]);
    });

    it("persists the updated cart to localStorage", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      
      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Laptop")).toBeInTheDocument());
      
      // Act
      const addToCartButtons = screen.getAllByText("ADD TO CART");
      await act(async () => { fireEvent.click(addToCartButtons[0]); }); // first product = Laptop

      // Assert
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "cart",
        JSON.stringify([mockProducts[0]])
      );
    });

    it("shows a success toast when a product is added to cart", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      
      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Laptop")).toBeInTheDocument());
      
      // Act
      const addToCartButtons = screen.getAllByText("ADD TO CART");
      await act(async () => { fireEvent.click(addToCartButtons[0]); }); // first product = Laptop

      // Assert
      expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
    });

    it("appends the new product to an existing cart", async () => {
      // Arrange
      const existingCart = [{ _id: "existing1", name: "Existing Product" }];
      useCart.mockReturnValue([existingCart, mockSetCart]);

      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      
      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Laptop")).toBeInTheDocument());
      
      // Act
      const addToCartButtons = screen.getAllByText("ADD TO CART");
      await act(async () => { fireEvent.click(addToCartButtons[0]); }); // first product = Laptop

      // Assert
      expect(mockSetCart).toHaveBeenCalledWith([...existingCart, mockProducts[0]]);
    });

    it("saves the full cart including prior items to localStorage", async () => {
      // Arrange
      const existingCart = [{ _id: "existing1", name: "Existing Product" }];
      useCart.mockReturnValue([existingCart, mockSetCart]);

      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });
      
      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Laptop")).toBeInTheDocument());
      
      // Act
      const addToCartButtons = screen.getAllByText("ADD TO CART");
      await act(async () => { fireEvent.click(addToCartButtons[0]); }); // first product = Laptop

      // Assert
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "cart",
        JSON.stringify([...existingCart, mockProducts[0]])
      );
    });

  });

  // ============================================================
  // Navigation
  // ============================================================
  describe("Navigation", () => {
    it("navigates to the correct product page when More Details is clicked", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Laptop")).toBeInTheDocument());

      // Act
      const moreDetailsButtons = screen.getAllByText("More Details");
      await act(async () => { fireEvent.click(moreDetailsButtons[0]); }); // first product = Laptop

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith("/product/laptop");
    });

    it("navigates to the correct product page for the second product", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: mockProducts.length } })
        .mockResolvedValueOnce({ data: { success: true, products: mockProducts } });

      await act(async () => { renderHomePage(); });
      await waitFor(() => expect(screen.getByText("Laptop")).toBeInTheDocument());

      // Act
      const moreDetailsButtons = screen.getAllByText("More Details");
      await act(async () => { fireEvent.click(moreDetailsButtons[1]); }); // second product = Smartphone

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith("/product/smartphone");
    });
  });

  // ============================================================
  // Empty / Edge States
  // ============================================================
  describe("Empty and Edge States", () => {
    it("renders no product cards when the product list is empty", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: 0 } })
        .mockResolvedValueOnce({ data: { success: true, products: [] } });

      // Act
      await act(async () => { renderHomePage(); });
      
      // Assert
      await waitFor(() => {
        expect(screen.queryByText("More Details")).not.toBeInTheDocument();
        expect(screen.queryByText("ADD TO CART")).not.toBeInTheDocument();
      });
    });

    it("does not show Load More when product list is empty and no filters are active", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        .mockResolvedValueOnce({ data: { success: true, total: 0 } })
        .mockResolvedValueOnce({ data: { success: true, products: [] } });

      // Act
      await act(async () => { renderHomePage(); });
      
      // Assert
      await waitFor(() => {
        expect(screen.queryByText("Load More")).not.toBeInTheDocument();
      });
    });

    it("renders no category checkboxes when categories list is empty", async () => {
      // Arrange
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: [] } })
        .mockResolvedValueOnce({ data: { success: true, total: 0 } })
        .mockResolvedValueOnce({ data: { success: true, products: [] } });

      // Act
      await act(async () => { renderHomePage(); });
      
      // Assert
      await waitFor(() => {
        expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
      });
    });
  });
});