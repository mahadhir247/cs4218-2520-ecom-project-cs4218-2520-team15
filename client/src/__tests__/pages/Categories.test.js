import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Categories from "../../pages/Categories";
import useCategory from "../../hooks/useCategory";

jest.mock("../../hooks/useCategory");
jest.mock("../../components/Layout", () => {
  return function MockLayout({ children, title }) {
    return (
      <div data-testid="layout" data-title={title}>
        {children}
      </div>
    );
  };
});

describe("Categories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders categories with links when categories are available", () => {
    const mockCategories = [
      { _id: "1", name: "Electronics", slug: "electronics" },
      { _id: "2", name: "Clothing", slug: "clothing" },
      { _id: "3", name: "Books", slug: "books" },
    ];
    useCategory.mockReturnValue(mockCategories);

    render(
      <BrowserRouter>
        <Categories />
      </BrowserRouter>
    );

    expect(screen.getByTestId("layout")).toHaveAttribute("data-title", "All Categories");

    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Clothing")).toBeInTheDocument();
    expect(screen.getByText("Books")).toBeInTheDocument();

    const electronicsLink = screen.getByText("Electronics").closest("a");
    expect(electronicsLink).toHaveAttribute("href", "/category/electronics");

    const clothingLink = screen.getByText("Clothing").closest("a");
    expect(clothingLink).toHaveAttribute("href", "/category/clothing");

    const booksLink = screen.getByText("Books").closest("a");
    expect(booksLink).toHaveAttribute("href", "/category/books");
  });

  test("renders empty list when no categories are available", () => {
    useCategory.mockReturnValue([]);

    render(
      <BrowserRouter>
        <Categories />
      </BrowserRouter>
    );

    expect(screen.getByTestId("layout")).toBeInTheDocument();

    const links = screen.queryAllByRole("link");
    expect(links).toHaveLength(0);
  });

  test("renders single category correctly", () => {
    const mockCategories = [{ _id: "1", name: "Electronics", slug: "electronics" }];
    useCategory.mockReturnValue(mockCategories);

    render(
      <BrowserRouter>
        <Categories />
      </BrowserRouter>
    );

    expect(screen.getByText("Electronics")).toBeInTheDocument();
    const link = screen.getByText("Electronics").closest("a");
    expect(link).toHaveAttribute("href", "/category/electronics");
  });
});