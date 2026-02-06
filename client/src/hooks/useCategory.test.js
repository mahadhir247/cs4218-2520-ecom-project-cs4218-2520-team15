import { renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import useCategory from "./useCategory";

jest.mock("axios");

describe("useCategory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetches and returns categories on mount", async () => {
    const mockCategories = [
      { _id: "1", name: "Electronics", slug: "electronics" },
      { _id: "2", name: "Clothing", slug: "clothing" },
    ];
    axios.get.mockResolvedValue({ data: { category: mockCategories } });

    const { result } = renderHook(() => useCategory());

    expect(result.current).toEqual([]);

    await waitFor(() => {
      expect(result.current).toEqual(mockCategories);
    });

    expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  test("returns empty array when API call fails", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    axios.get.mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(new Error("API Error"));
    });

    expect(result.current).toEqual([]);

    consoleLogSpy.mockRestore();
  });

  test("handles undefined category in response", async () => {
    axios.get.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(result.current).toEqual(undefined);
    });
  });

  test("handles null category in response", async () => {
    axios.get.mockResolvedValue({ data: { category: null } });

    const { result } = renderHook(() => useCategory());

    await waitFor(() => {
      expect(result.current).toEqual(null);
    });
  });
});