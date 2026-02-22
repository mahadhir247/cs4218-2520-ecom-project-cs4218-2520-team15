import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../context/auth";
import axios from "axios";

jest.mock("axios");

let localStorageStore = {};
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: jest.fn((key) =>
      Object.prototype.hasOwnProperty.call(localStorageStore, key)
        ? localStorageStore[key]
        : null
    ),
    setItem: jest.fn((key, value) => {
      localStorageStore[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete localStorageStore[key];
    }),
    clear: jest.fn(() => {
      localStorageStore = {};
    }),
  },
  writable: true,
});

const mockUser = {
  name: "John Doe", 
  email: "test@example.com",
  password: "test",
  phone: "123456789",
  address: "test",
  answer: "test",
  role: 0
}

const AuthConsumer = () => {
  const [auth, setAuth] = useAuth();

  const handleSubmit = () => {
    setAuth({
      ...auth,  
      user: mockUser,
      token: "mockToken",
    });
  };

  return (
    <div>
      <span data-testid="auth-value">{JSON.stringify(auth)}</span>
      <button data-testid="auth-button" onClick={handleSubmit}>
        Test Auth
      </button>
    </div>
  );
};

describe("auth test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock axios with defaults.headers.common
    axios.defaults = {
      headers: {
        common: {},
      },
    };
  });

  it("should provide null user and empty token when localStorage is empty", async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    expect(screen.getByTestId("auth-value").textContent).toBe(
      JSON.stringify({ user: null, token: "" })
    );
    expect(axios.defaults.headers.common["Authorization"]).toBe("");
    expect(window.localStorage.getItem).toHaveBeenCalledWith("auth");
  });

  it("should initialize auth data from localStorage if valid data is present", async () => {
    window.localStorage.getItem.mockReturnValueOnce(
      JSON.stringify({ user: mockUser, token: "storedToken" })
    );

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    expect(screen.getByTestId("auth-value").textContent).toBe(
      JSON.stringify({ user: mockUser, token: "storedToken" })
    );
    expect(axios.defaults.headers.common["Authorization"]).toBe("storedToken");
  });

  it("should allow updating of localStorage via setAuth", async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    fireEvent.click(screen.getByTestId("auth-button"));

    expect(screen.getByTestId("auth-value").textContent).toBe(
      JSON.stringify({ user: mockUser, token: "mockToken" })
    );
    expect(axios.defaults.headers.common["Authorization"]).toBe("mockToken");
  });

  it("should handle invalid JSON in localStorage gracefully", async () => {
    window.localStorage.getItem.mockReturnValueOnce("invalidJson");
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    )

    expect(screen.getByTestId("auth-value").textContent).toBe(
      JSON.stringify({ user: null, token: "" })
    );
    expect(axios.defaults.headers.common["Authorization"]).toBe("");
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});