/* Name: Kok Fangyu Inez
 * Student No: A0258672R
 */

import React from "react";
import axios from "axios";
import SearchInput from "../../../components/Form/SearchInput.js";
import { useSearch } from "../../../context/search.js";
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

jest.mock("@context/search", () => ({
  useSearch: jest.fn()
}));

describe("Search Input Form Component", () => {
  let mockNavigate;
  let mockSetValues;
  let mockValues;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Silence console.log statements during test run
    jest.spyOn(console, "log").mockImplementation(() => {});

    mockNavigate = jest.fn();
    mockSetValues = jest.fn();
    mockValues = { keyword: "", results: [] };

    useNavigate.mockReturnValue(mockNavigate);
    useSearch.mockReturnValue([mockValues, mockSetValues]);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  const renderSearchInput = () => {
    return render(
      <BrowserRouter>
        <SearchInput />
      </BrowserRouter>
    )
  }

  // ============================================================
  // Component Rendering
  // ============================================================
  describe("Component Rendering", () => {
    it("should render the search input field", async () => {
      // Arrange & Act
      await act(async () => {renderSearchInput()});

      // Assert
      expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    });

    it("should render the search submit button", async () => {
      // Arrange & Act
      await act(async () => {renderSearchInput()});

      // Assert
      expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
    });

    it("should display the current keyword value in the input field", async () => {
      // Arrange
      const mockExistingValues = { keyword: "shoes", results: [] };
      useSearch.mockReturnValue([mockExistingValues, mockSetValues]);

      // Act
      await act(async () => {renderSearchInput()});

      // Assert
      expect(screen.getByPlaceholderText("Search").value).toBe("shoes");
    });

  });

  // ============================================================
  // User Interaction (typing)
  // ============================================================
  describe("User Interaction (typing)", () => {
    it("should call setValues with the updated keyword when the user types", async () => {
      // Arrange
      await act(async () => {renderSearchInput()});
      const input = screen.getByPlaceholderText("Search");

      // Act
      fireEvent.change(input, { target: { value: "boots" } });

      // Assert
      expect(mockSetValues).toHaveBeenCalledWith({ keyword: "boots", results: [] });
    });

    it("should call setValues exactly once per keystroke", async () => {
      // Arrange
      await act(async () => {renderSearchInput()});
      const input = screen.getByPlaceholderText("Search");

      // Act
      fireEvent.change(input, { target: { value: "b" } });

      // Assert
      expect(mockSetValues).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // Form Submission (success)
  // ============================================================
  describe("Form Submission (success)", () => {
    it("should call the search API with the current keyword on submit", async () => {
      // Arrange
      useSearch.mockReturnValue([{ keyword: "shoes", results: [] }, mockSetValues]);
      axios.get.mockResolvedValue({ data: { results: [] } });
      await act(async () => {renderSearchInput()});

      // Act
      fireEvent.submit(screen.getByRole("button", { name: /search/i }).closest("form"));

      // Assert
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/shoes");
      });
    });

    it("should call setValues with the results returned from the API", async () => {
      // Arrange
      const mockResults = [{ _id: "1", name: "Blue Sneakers" }];
      useSearch.mockReturnValue([{ keyword: "shoes", results: [] }, mockSetValues]);
      axios.get.mockResolvedValue({ data: { results: mockResults } });
      await act(async () => {renderSearchInput()});

      // Act
      fireEvent.submit(screen.getByRole("button", { name: /search/i }).closest("form"));

      // Assert
      await waitFor(() => {
        expect(mockSetValues).toHaveBeenCalledWith({ keyword: "shoes", results: mockResults });
      });
    });

    it("should navigate to /search after a successful API response", async () => {
      // Arrange
      useSearch.mockReturnValue([{ keyword: "shoes", results: [] }, mockSetValues]);
      axios.get.mockResolvedValue({ data: { results: [] } });
      await act(async () => {renderSearchInput()});

      // Act
      fireEvent.submit(screen.getByRole("button", { name: /search/i }).closest("form"));

      // Assert
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/search");
      });
    });
  });

  // ============================================================
  // Form Submission (failure)
  // ============================================================
  describe("Form Submission (failure)", () => {
    it("should log the error to the console when the API call fails", async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      const mockError = new Error("Network Error");
      useSearch.mockReturnValue([{ keyword: "shoes", results: [] }, mockSetValues]);
      axios.get.mockRejectedValue(mockError);
      await act(async () => {renderSearchInput()});

      // Act
      fireEvent.submit(screen.getByRole("button", { name: /search/i }).closest("form"));

      // Assert
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(mockError);
      });

      consoleSpy.mockRestore();
    });

    it("should not navigate when the API call fails", async () => {
      // Arrange
      useSearch.mockReturnValue([{ keyword: "shoes", results: [] }, mockSetValues]);
      axios.get.mockRejectedValue(new Error("Network Error"));
      await act(async () => {renderSearchInput()});

      // Act
      fireEvent.submit(screen.getByRole("button", { name: /search/i }).closest("form"));

      // Assert
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it("should log the error to the console when the keyword is empty", async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      const mockError = new Error("Search keyword should not be empty or only whitepsaces");
      useSearch.mockReturnValue([{ keyword: "", results: [] }, mockSetValues]);
      // won't run axios GET request
      await act(async () => {renderSearchInput()});

      // Act
      fireEvent.submit(screen.getByRole("button", { name: /search/i }).closest("form"));

      // Assert
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(mockError);
      });

      consoleSpy.mockRestore();
    });

    it("should not make API call when the keyword is empty", async () => {
      // Arrange
      useSearch.mockReturnValue([{ keyword: "", results: [] }, mockSetValues]);
      await act(async () => {renderSearchInput()});

      // Act
      fireEvent.submit(screen.getByRole("button", { name: /search/i }).closest("form"));

      // Assert
      await waitFor(() => {
        expect(axios.get).not.toHaveBeenCalled();
      });
    });

    it("should not navigate when the keyword is empty", async () => {
      // Arrange
      useSearch.mockReturnValue([{ keyword: "", results: [] }, mockSetValues]);
      // won't run axios GET request
      await act(async () => {renderSearchInput()});

      // Act
      fireEvent.submit(screen.getByRole("button", { name: /search/i }).closest("form"));

      // Assert
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it("should log the error to the console when the keyword is whitepsaces only", async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      const mockError = new Error("Search keyword should not be empty or only whitepsaces");
      useSearch.mockReturnValue([{ keyword: "   ", results: [] }, mockSetValues]);
      // won't run axios GET request
      await act(async () => {renderSearchInput()});

      // Act
      fireEvent.submit(screen.getByRole("button", { name: /search/i }).closest("form"));

      // Assert
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(mockError);
      });

      consoleSpy.mockRestore();
    });

    it("should not make API call when the keyword is whitespaces only", async () => {
      // Arrange
      useSearch.mockReturnValue([{ keyword: "   ", results: [] }, mockSetValues]);
      await act(async () => {renderSearchInput()});

      // Act
      fireEvent.submit(screen.getByRole("button", { name: /search/i }).closest("form"));

      // Assert
      await waitFor(() => {
        expect(axios.get).not.toHaveBeenCalled();
      });
    });

    it("should not navigate when the keyword is whitespaces only", async () => {
      // Arrange
      useSearch.mockReturnValue([{ keyword: "   ", results: [] }, mockSetValues]);
      // won't run axios GET request
      await act(async () => {renderSearchInput()});

      // Act
      fireEvent.submit(screen.getByRole("button", { name: /search/i }).closest("form"));

      // Assert
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });
});