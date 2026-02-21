/* Name: Mahadhir Bin Mohd Ismail
 * Student No: A0252808B
 */

import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, waitFor } from "@testing-library/react";
import axios from "axios";
import toast from "react-hot-toast";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ForgotPassword from "../../../pages/Auth/ForgotPassword";

// Mocking axios.post
jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("@context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("@context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("@context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe("ForgotPassword Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: { category: [] } });
  });

  it("renders reset password page", async () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(getByText("RESET PASSWORD")).toBeInTheDocument();
      expect(getByPlaceholderText("Enter Your Email")).toBeInTheDocument();
      expect(getByPlaceholderText("What is Your Favorite sports")).toBeInTheDocument();
      expect(getByPlaceholderText("Enter Your New Password")).toBeInTheDocument();
    });
  });

  it("should allow typing email, answer and password", async () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>,
    );
    
    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), {
      target: { value: "test" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your New Password"), {
      target: { value: "password123" },
    });

    await waitFor(() => {
      expect(getByText("RESET PASSWORD")).toBeInTheDocument();
      expect(getByPlaceholderText("Enter Your Email").value).toBe(
        "test@example.com",
      );
      expect(getByPlaceholderText("What is Your Favorite sports").value).toBe(
        "test",
      );
      expect(getByPlaceholderText("Enter Your New Password").value).toBe(
        "password123",
      );
    });
  });

  it("should reset password successfully", async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true, message: "Password Reset Successfully" } });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), {
      target: { value: "test" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your New Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(getByText("RESET"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith("Password Reset Successfully", {
      duration: 5000,
      icon: "🙏",
      style: {
        background: "green",
        color: "white",
      },
    });
  });

  it("should display error message on failed reset", async () => {
    axios.post.mockResolvedValueOnce({ 
      data: {
        success: false,
        message: "Answer is incorrect" 
      }
    });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), {
      target: { value: "test" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your New Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(getByText("RESET"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Answer is incorrect");
  });

  it("should display error on internal error", async () => {
    const mockError = new Error("mockError");
    axios.post.mockImplementation(() => { throw mockError });
    jest.spyOn(global.console, 'log').mockImplementation(() => {});

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), {
      target: { value: "test" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your New Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(getByText("RESET"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(console.log).toHaveBeenCalledWith(mockError)
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");

    axios.post.mockRestore();
    console.log.mockRestore();
  });
});
