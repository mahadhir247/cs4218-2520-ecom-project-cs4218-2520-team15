import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";
import Spinner from "../../components/Spinner";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

describe("Spinner", () => {
  let mockNavigate;
  let mockLocation;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockNavigate = jest.fn();
    mockLocation = { pathname: "/some-path" };
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue(mockLocation);
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  test("renders spinner with initial countdown", () => {
    render(
      <BrowserRouter>
        <Spinner />
      </BrowserRouter>
    );

    expect(screen.getByText(/redirecting to you in 3 second/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  test("counts down from 3 to 0", async () => {
    render(
      <BrowserRouter>
        <Spinner />
      </BrowserRouter>
    );

    expect(screen.getByText(/redirecting to you in 3 second/i)).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/redirecting to you in 2 second/i)).toBeInTheDocument();
    });

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/redirecting to you in 1 second/i)).toBeInTheDocument();
    });
  });

  test("navigates to default login path after countdown", async () => {
    render(
      <BrowserRouter>
        <Spinner />
      </BrowserRouter>
    );

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login", {
        state: "/some-path",
      });
    });
  });

  test("navigates to custom path when provided", async () => {
    render(
      <BrowserRouter>
        <Spinner path="register" />
      </BrowserRouter>
    );

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/register", {
        state: "/some-path",
      });
    });
  });

  test("clears interval on unmount", () => {
    const { unmount } = render(
      <BrowserRouter>
        <Spinner />
      </BrowserRouter>
    );

    const clearIntervalSpy = jest.spyOn(global, "clearInterval");
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});