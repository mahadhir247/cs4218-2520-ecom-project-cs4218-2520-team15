import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, waitFor } from "@testing-library/react";
import axios from "axios";
import toast from "react-hot-toast";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import Login from "../../../pages/Auth/Login";

const mockNavigate = jest.fn()

// Mocking axios.post
jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

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

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: { category: [] } });
  });

  it("renders login form", async () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(getByText("LOGIN FORM")).toBeInTheDocument();
      expect(getByPlaceholderText("Enter Your Email")).toBeInTheDocument();
      expect(getByPlaceholderText("Enter Your Password")).toBeInTheDocument();
    });
  });

  it("inputs should be initially empty", async () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(getByText("LOGIN FORM")).toBeInTheDocument();
      expect(getByPlaceholderText("Enter Your Email").value).toBe("");
      expect(getByPlaceholderText("Enter Your Password").value).toBe("");
    });
  });

  it("should allow typing email and password", async () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>,
    );
    
    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });

    await waitFor(() => {
      expect(getByText("LOGIN FORM")).toBeInTheDocument();
      expect(getByPlaceholderText("Enter Your Email").value).toBe(
        "test@example.com",
      );
      expect(getByPlaceholderText("Enter Your Password").value).toBe(
        "password123",
      );
    });
  });

  it("should navigate to forgot password page when forgot password button is clicked", async () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(getByText("Forgot Password"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/forgot-password");
    })
  });

  it("should login the user successfully", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        user: { id: 1, name: "John Doe", email: "test@example.com" },
        token: "mockToken",
      },
    });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(getByText("LOGIN"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith(undefined, {
      duration: 5000,
      icon: "🙏",
      style: {
        background: "green",
        color: "white",
      },
    });
  });

  it("should display error message on failed login", async () => {
    axios.post.mockResolvedValueOnce({ 
      data: {
        success: false,
        message: "Invalid credentials" 
      }
    });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(getByText("LOGIN"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
  });

  it("should display error on internal error", async () => {
    const mockError = new Error("mockError");
    axios.post.mockImplementation(() => { throw mockError });
    jest.spyOn(global.console, 'log').mockImplementation(() => {});

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(getByText("LOGIN"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(console.log).toHaveBeenCalledWith(mockError)
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");

    axios.post.mockRestore();
    console.log.mockRestore();
  });
});
