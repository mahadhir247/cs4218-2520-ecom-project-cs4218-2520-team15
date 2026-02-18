import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { useAuth } from "../../../context/auth";
import AdminOrders from "../../../pages/admin/AdminOrders";

jest.mock("axios");

jest.mock('../../../components/Layout', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

jest.mock('../../../components/AdminMenu', () => ({
  __esModule: true,
  default: () => <div data-testid="adminmenu">AdminMenu</div>,
}));

jest.mock("../../../context/auth", () => ({ useAuth: jest.fn() }));

jest.mock("antd", () => {
  const mockSelect = ({ children, onChange, defaultValue }) => (
    <select 
      data-testid="status-select" 
      defaultValue={defaultValue} 
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  );

  mockSelect.Option = ({ children, value }) => (
    <option value={value}>{children}</option>
  );

  return {
    Select: mockSelect,
  };
});

describe("Admin Orders page", () => {

  const mockOrders = [
    {
      _id: "order1",
      status: "Processing",
      buyer: { name: "John" },
      createdAt: new Date().toISOString(),
      payment: { success: true },
      products: [
        { _id: "p1", name: "Laptop", description: "For testing", price: 1000 },
      ],
    },
  ];

  beforeEach(() => {
    useAuth.mockReturnValue([{token: "mock-token"}, jest.fn()]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the page and fetches orders", async () => {
    axios.get.mockResolvedValueOnce({ data: mockOrders });

    render(<AdminOrders />);

    expect(screen.getByText("All Orders")).toBeInTheDocument();

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/all-orders'));

    expect(await screen.findByText("John")).toBeInTheDocument();
    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("Laptop")).toBeInTheDocument();
    expect(screen.getByText("Price: $1000")).toBeInTheDocument();
  });

  it("renders empty state when there are no orders", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<AdminOrders />);

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/all-orders'));

    expect(screen.getByText("All Orders")).toBeInTheDocument();
    expect(await screen.getByText("No orders found.")).toBeInTheDocument();
  });

  it("does not fetch orders if user is not authenticated", () => {
    useAuth.mockReturnValue([null, jest.fn()]);

    render(<AdminOrders />);

    expect(axios.get).not.toHaveBeenCalled();
  });

  it("logs error on API failure", async () => {
    const err = new Error("Network error");
    axios.get.mockRejectedValueOnce(err);

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(<AdminOrders />);

    await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(err));
    
    expect(await screen.findByText("No orders found.")).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it("handles status change correctly", async () => {
    axios.get.mockResolvedValueOnce({ data: mockOrders });
    axios.put.mockResolvedValueOnce({ data: { success: true } });

    render(<AdminOrders />);
    
    await waitFor(() => expect(screen.getByText("John")).toBeInTheDocument());

    const select = screen.getByTestId("status-select");
    fireEvent.change(select, { target: { value: "Shipped" } });

    await waitFor(() => expect(axios.put).toHaveBeenCalledWith(
      "/api/v1/auth/order-status/order1",
      { status: "Shipped" }
    ));

    expect(axios.get).toHaveBeenCalledTimes(2); // initial fetch + after status change
  });

  it("logs error on status change API failure", async () => {
    axios.get.mockResolvedValueOnce({ data: mockOrders });

    const err = new Error("Network error");
    axios.put.mockRejectedValueOnce(err);

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(<AdminOrders />);
    
    await waitFor(() => expect(screen.getByText("John")).toBeInTheDocument());
    
    const select = screen.getByTestId("status-select");
    fireEvent.change(select, { target: { value: "Shipped" } });

    await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(err));

    consoleSpy.mockRestore();
  });
});
