/* Name: Kok Fangyu Inez
 * Student No: A0258672R
 */

import React from "react";
import { render, screen, act } from "@testing-library/react";
import { SearchProvider, useSearch } from "../../context/search";

// Helper consumer component to expose context values in tests
const SearchConsumer = ({ onRender }) => {
  const contextValue = useSearch();
  onRender(contextValue);
  return null;
};

describe("SearchContext", () => {
  // ============================================================
  // SearchProvider (initial state)
  // ============================================================
  describe("SearchProvider (initial state)", () => {
    it("should provide an initial keyword of empty string", () => {
      // Arrange
      let capturedValues;
      const capture = (value) => { capturedValues = value; };

      // Act
      render(
        <SearchProvider>
          <SearchConsumer onRender={capture} />
        </SearchProvider>
      );

      // Assert
      expect(capturedValues[0].keyword).toBe("");
    });

    it("should provide an initial results array that is empty", () => {
      // Arrange
      let capturedValues;
      const capture = (value) => { capturedValues = value; };

      // Act
      render(
        <SearchProvider>
          <SearchConsumer onRender={capture} />
        </SearchProvider>
      );

      // Assert
      expect(capturedValues[0].results).toEqual([]);
    });

    it("should expose a setter function as the second element of the context tuple", () => {
      // Arrange
      let capturedValues;
      const capture = (value) => { capturedValues = value; };

      // Act
      render(
        <SearchProvider>
          <SearchConsumer onRender={capture} />
        </SearchProvider>
      );

      // Assert
      expect(typeof capturedValues[1]).toBe("function");
    });
  });

  // ============================================================
  // SearchProvider (state updates)
  // ============================================================
  describe("SearchProvider (state updates)", () => {
    it("should update the keyword when the setter is called with a new keyword", () => {
      // Arrange
      let capturedValues;
      const capture = (value) => { capturedValues = value; };
      render(
        <SearchProvider>
          <SearchConsumer onRender={capture} />
        </SearchProvider>
      );

      // Act
      act(() => {
        capturedValues[1]({ keyword: "shoes", results: [] });
      });

      // Assert
      expect(capturedValues[0].keyword).toBe("shoes");
    });

    it("should update the results array when the setter is called with new results", () => {
      // Arrange
      const mockResults = [{ _id: "1", name: "Product A" }];
      let capturedValues;
      const capture = (value) => { capturedValues = value; };
      render(
        <SearchProvider>
          <SearchConsumer onRender={capture} />
        </SearchProvider>
      );

      // Act
      act(() => {
        capturedValues[1]({ keyword: "", results: mockResults });
      });

      // Assert
      expect(capturedValues[0].results).toEqual(mockResults);
    });

    it("should preserve other state fields when only keyword is updated", () => {
      // Arrange
      const existingResults = [{ _id: "1", name: "Product A" }];
      let capturedValues;
      const capture = (value) => { capturedValues = value; };
      render(
        <SearchProvider>
          <SearchConsumer onRender={capture} />
        </SearchProvider>
      );
      act(() => {
        capturedValues[1]({ keyword: "", results: existingResults });
      });

      // Act
      act(() => {
        capturedValues[1]({ ...capturedValues[0], keyword: "boots" });
      });

      // Assert
      expect(capturedValues[0].results).toEqual(existingResults);
      expect(capturedValues[0].keyword).toEqual("boots"); // only keyword updated
    });
  });

  // ============================================================
  // useSearch (hook access)
  // ============================================================
  describe("useSearch (hook access)", () => {
    it("should return undefined when useSearch is used outside of SearchProvider", () => {
      // Arrange
      // createContext() with no default means the context value is undefined
      // outside a provider. React does not throw — it simply returns undefined.
      let capturedValue = "NOT_SET";
      const OutsideConsumer = () => {
        capturedValue = useSearch();
        return null;
      };

      // Act
      render(<OutsideConsumer />);

      // Assert
      expect(capturedValue).toBeUndefined();
    });
  });
});