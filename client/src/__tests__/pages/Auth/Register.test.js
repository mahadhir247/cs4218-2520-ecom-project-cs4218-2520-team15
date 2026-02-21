/* Name: Mahadhir Bin Mohd Ismail
 * Student No: A0252808B
 */

import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, waitFor } from "@testing-library/react";
import axios from "axios";
import toast from "react-hot-toast";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Register from "../../../pages/Auth/Register";

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

describe("Register Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: { category: [] } });
  });

  it("renders register form", async () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(getByText("REGISTER FORM")).toBeInTheDocument();
      expect(getByPlaceholderText("Enter Your Name")).toBeInTheDocument();
      expect(getByPlaceholderText("Enter Your Email")).toBeInTheDocument();
      expect(getByPlaceholderText("Enter Your Password")).toBeInTheDocument();
      expect(getByPlaceholderText("Enter Your Phone")).toBeInTheDocument();
      expect(getByPlaceholderText("Enter Your Address")).toBeInTheDocument();
      expect(getByPlaceholderText("Enter Your DOB")).toBeInTheDocument();
      expect(getByPlaceholderText("What is Your Favorite sports")).toBeInTheDocument();
    });
  });

  it("should allow typing user details", async () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>,
    );
    
    fireEvent.change(getByPlaceholderText("Enter Your Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Phone"), {
      target: { value: "1234567890" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Address"), {
      target: { value: "testAddress" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your DOB"), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), {
      target: { value: "test" },
    });

    await waitFor(() => {
      expect(getByText("REGISTER FORM")).toBeInTheDocument();
      expect(getByPlaceholderText("Enter Your Name").value).toBe(
        "John Doe"
      );
      expect(getByPlaceholderText("Enter Your Email").value).toBe(
        "test@example.com",
      );
      expect(getByPlaceholderText("Enter Your Password").value).toBe(
        "password123",
      );
      expect(getByPlaceholderText("Enter Your Phone").value).toBe(
        "1234567890",
      );
      expect(getByPlaceholderText("Enter Your Address").value).toBe(
        "testAddress",
      );
      expect(getByPlaceholderText("Enter Your DOB").value).toBe(
        "2000-01-01",
      );
      expect(getByPlaceholderText("What is Your Favorite sports").value).toBe(
        "test",
      );
    });
  });

  it("should register the user successfully", async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(getByPlaceholderText("Enter Your Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Phone"), {
      target: { value: "1234567890" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Address"), {
      target: { value: "123 Street" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your DOB"), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), {
      target: { value: "Football" },
    });

    fireEvent.click(getByText("REGISTER"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith(
      "Register Successfully, please login",
    );
  });

  it("should display error message on failed registration", async () => {
    axios.post.mockResolvedValueOnce({ 
      data: {
        success: false,
        message: "User already exists" 
      }
    });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(getByPlaceholderText("Enter Your Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Phone"), {
      target: { value: "1234567890" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Address"), {
      target: { value: "123 Street" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your DOB"), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), {
      target: { value: "Football" },
    });

    fireEvent.click(getByText("REGISTER"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("User already exists");
  });

  it("should display error on internal error", async () => {
    const mockError = new Error("mockError");
    axios.post.mockImplementation(() => { throw mockError });
    jest.spyOn(global.console, 'log').mockImplementation(() => {});

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(getByPlaceholderText("Enter Your Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Phone"), {
      target: { value: "1234567890" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Address"), {
      target: { value: "123 Street" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your DOB"), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), {
      target: { value: "Football" },
    });

    fireEvent.click(getByText("REGISTER"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(console.log).toHaveBeenCalledWith(mockError)
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");

    axios.post.mockRestore();
    console.log.mockRestore();
  });
});
