import React from "react";
import toast from "react-hot-toast";
import Search from "../../pages/Search.js";
import { useCart } from "../../context/cart.js";
import { useSearch } from "../../context/search.js";
import { useNavigate } from "react-router-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import { act } from 'react-dom/test-utils';

// Mock dependencies
jest.mock("react-hot-toast");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

jest.mock("@context/cart", () => ({
  useCart: jest.fn()
}));

jest.mock("@context/search", () => ({
  useSearch: jest.fn()
}));

jest.mock("@components/Layout", () =>
  ({ children, title }) => (
    <div>
      <title>{title}</title>
      {children}
    </div>
  )
);

jest.mock('@components/Header', () => () => <div>Header</div>);

describe("Search Page", () => {
  let mockNavigate;
  let mockSetCart;
  let mockCart;
  let mockSetValues;
  let mockValues;

  // Mock search results products
  const mockSearchProducts = [
    {
        _id: "1",
        name: "Product Alpha",
        slug: "product-alpha",
        description: "A great product with a very long description that will be trimmed",
        price: 29.99,
        category: { _id: "cat1", name: "Category 1" }
    },
    {
        _id: "2",
        name: "Product Beta",
        slug: "product-beta",
        description: "A great product with short description",
        price: 9.99,
        category: { _id: "cat2", name: "Category 2" }
    },
    {
        _id: "3",
        name: "Product Omega",
        slug: "product-omega",
        description: "Another product that is amazing",
        price: 19.99,
        category: { _id: "cat3", name: "Category 3" }
    },
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Silence console.log statements during test run
    jest.spyOn(console, "log").mockImplementation(() => {});

    mockNavigate = jest.fn();
    mockSetCart = jest.fn();
    mockCart = [];
    mockSetValues = jest.fn();
    mockValues = { keyword: "", results: []};

    useNavigate.mockReturnValue(mockNavigate);
    useCart.mockReturnValue([mockCart, mockSetCart]);
    useSearch.mockReturnValue([mockValues, mockSetValues]);

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

  const renderSearch = () => {
    return render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    )
  };

  // ============================================================
  // Page Structure
  // ============================================================
  describe("Page Structure", () => {
    it("should render the page title in the Layout", async () => {
      // Arrange
      mockValues = { keyword: "random", results: [] };

      // Act
      await act(async () => {renderSearch()});

      // Assert
      expect(document.title || screen.getByText(/search results/i)).toBeTruthy();
    });
    
    it("should render the Search Results heading", async () => {
      // Arrange
      mockValues = { keyword: "random", results: [] };

      // Act
      await act(async () => {renderSearch()});

      // Assert
      expect(screen.getByRole("heading", { name: /search results/i })).toBeInTheDocument();
    });
  });

  // ============================================================
  // Empty State
  // ============================================================
  describe("Empty State", () => {
    it("should display 'No Products Found' when results array is empty", async () => {
      // Arrange
      mockValues = { keyword: "random", results: [] };

      // Act
      await act(async () => {renderSearch()});

      // Assert
      expect(screen.getByText("No Products Found")).toBeInTheDocument();
    });

    it("should not render any product cards when results array is empty", async () => {
      // Arrange
      mockValues = { keyword: "random", results: [] };

      // Act
      await act(async () => {renderSearch()});

      // Assert
      expect(screen.queryAllByRole("img")).toHaveLength(0);
    });
  });

  // ============================================================
  // Results Count
  // ============================================================
  describe("Results Count", () => {
    it("should display the number of results found when results exist", async () => {
      // Arrange
      mockValues = { keyword: "product", results: mockSearchProducts };
      useSearch.mockReturnValue([mockValues, mockSetValues]);

      // Act
      await act(async () => {renderSearch()});

      // Assert
      expect(screen.getByText(`Found ${mockSearchProducts.length} product(s)`)).toBeInTheDocument();
    });

    it("should not display 'No Products Found' when results exist", async () => {
      // Arrange
      mockValues = { keyword: "product", results: mockSearchProducts };
      useSearch.mockReturnValue([mockValues, mockSetValues]);

      // Act
      await act(async () => {renderSearch()});

      // Assert
      expect(screen.queryByText("No Products Found")).not.toBeInTheDocument();
    });
  });

  // ============================================================
  // Product Card Rendering
  // ============================================================
  describe("Product card rendering", () => {
    it("should render a card for each product in results", async () => {
      // Arrange
      mockValues = { keyword: "product", results: mockSearchProducts };
      useSearch.mockReturnValue([mockValues, mockSetValues]);

      // Act
      await act(async () => {renderSearch()});

      // Assert
      expect(screen.getAllByRole("img")).toHaveLength(mockSearchProducts.length);
    });

    it("should display the product name on each card", async () => {
      // Arrange
      mockValues = { keyword: "product", results: mockSearchProducts };
      useSearch.mockReturnValue([mockValues, mockSetValues]);

      // Act
      await act(async () => {renderSearch()});

      // Assert
      mockSearchProducts.forEach((p) => {
        expect(screen.getByText(p.name)).toBeInTheDocument();
      });
    });

    it("should display the product price formatted as USD currency", async () => {
      // Arrange
      mockValues = { keyword: "product", results: mockSearchProducts };
      useSearch.mockReturnValue([mockValues, mockSetValues]);

      // Act
      await act(async () => {renderSearch()});

      // Assert
      mockSearchProducts.forEach((p) => {
        expect(screen.getByText(`$${p.price}`)).toBeInTheDocument();
      });
    });

    it("should truncate product description to 60 characters followed by ellipsis", async () => {
      // Arrange
      mockValues = { keyword: "product", results: [mockSearchProducts[0]] };
      useSearch.mockReturnValue([mockValues, mockSetValues]);

      // Act
      await act(async () => {renderSearch()});

      // Assert
      const expectedText = mockSearchProducts[0].description.substring(0, 60) + "...";
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });

    it("should render the product image with the correct src URL", async () => {
      // Arrange
      mockValues = { keyword: "product", results: [mockSearchProducts[0]] };
      useSearch.mockReturnValue([mockValues, mockSetValues]);

      // Act
      await act(async () => {renderSearch()});

      // Assert
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", `/api/v1/product/product-photo/${mockSearchProducts[0]._id}`);
    });

    it("should render the product image with the product name as alt text", async () => {
      // Arrange
      mockValues = { keyword: "product", results: [mockSearchProducts[0]] };
      useSearch.mockReturnValue([mockValues, mockSetValues]);

      // Act
      await act(async () => {renderSearch()});

      // Assert
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("alt", mockSearchProducts[0].name);
    });

    it("should render 'More Details' and 'ADD TO CART' buttons for each product", async () => {
      // Arrange
      mockValues = { keyword: "product", results: mockSearchProducts };
      useSearch.mockReturnValue([mockValues, mockSetValues]);

      // Act
      await act(async () => {renderSearch()});

      // Assert
      expect(screen.getAllByText("More Details")).toHaveLength(mockSearchProducts.length);
      expect(screen.getAllByText("ADD TO CART")).toHaveLength(mockSearchProducts.length);
    });
  });

  // ============================================================
  // Navigation
  // ============================================================
  describe("More Details Navigation", () => {
    it("should navigate to the correct product page when 'More Details' is clicked", async () => {
      // Arrange
      mockValues = { keyword: "product", results: [mockSearchProducts[0]] };
      useSearch.mockReturnValue([mockValues, mockSetValues]);
      await act(async () => {renderSearch()});
      
      // Act
      fireEvent.click(screen.getByText("More Details"));

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith(`/product/${mockSearchProducts[0].slug}`);
    });

    it("should navigate to the correct product when clicking 'More Details' on a specific card among multiple", async () => {
      // Arrange
      mockValues = { keyword: "product", results: mockSearchProducts };
      useSearch.mockReturnValue([mockValues, mockSetValues]);
      await act(async () => {renderSearch()});
      
      // Act
      const moreDetailsButton = screen.getAllByText("More Details")[1];
      fireEvent.click(moreDetailsButton);

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith(`/product/${mockSearchProducts[1].slug}`);
    });
  });

  // ============================================================
  // Add to Cart
  // ============================================================
  describe("Add to Cart", () => {
    it("appends product to existing cart", async () => {
      // Arrange
      const existingCart = [{ 
        _id: "existing", 
        name: "Existing Item", 
        slug: "existing-item",
        description: "Existing Iterm that has been in the cart",
        price: 5,
        category: { _id: "cat1", name: "Category 1" }
      }];
      useCart.mockReturnValue([existingCart, mockSetCart]);
      mockValues = { keyword: "", results: [mockSearchProducts[0]] };
      useSearch.mockReturnValue([mockValues, mockSetValues]);
      await act(async () => {renderSearch()});

      // Act
      fireEvent.click(screen.getByText("ADD TO CART"));

      // Assert
      expect(mockSetCart).toHaveBeenCalledWith([...existingCart, mockSearchProducts[0]]);
    });

    it("should persist updated cart in local storage", async () => {
      // Arrange
      const existingCart = [{ 
        _id: "existing", 
        name: "Existing Item", 
        slug: "existing-item",
        description: "Existing Iterm that has been in the cart",
        price: 5,
        category: { _id: "cat1", name: "Category 1" }
      }];
      useCart.mockReturnValue([existingCart, mockSetCart]);
      mockValues = { keyword: "", results: [mockSearchProducts[0]] };
      useSearch.mockReturnValue([mockValues, mockSetValues]);
      await act(async () => {renderSearch()});

      // Act
      fireEvent.click(screen.getByText("ADD TO CART"));

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "cart",
        JSON.stringify([...existingCart, mockSearchProducts[0]])
      );
    });

    it("should show a success toast when 'ADD TO CART' is clicked", async () => {
      // Arrange
      const existingCart = [{ 
        _id: "existing", 
        name: "Existing Item", 
        slug: "existing-item",
        description: "Existing Iterm that has been in the cart",
        price: 5,
        category: { _id: "cat1", name: "Category 1" }
      }];
      useCart.mockReturnValue([existingCart, mockSetCart]);
      mockValues = { keyword: "", results: [mockSearchProducts[0]] };
      useSearch.mockReturnValue([mockValues, mockSetValues]);
      await act(async () => {renderSearch()});

      // Act
      fireEvent.click(screen.getByText("ADD TO CART"));

      // Assert
      expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
    });
  });
});
