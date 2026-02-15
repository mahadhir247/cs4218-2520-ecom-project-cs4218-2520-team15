import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Orders from '../../../pages/user/Orders';
import { AuthProvider } from '../../../context/auth';

jest.mock('axios');

jest.mock('../../../components/Layout', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

jest.mock('../../../components/UserMenu', () => ({
  __esModule: true,
  default: () => <div data-testid="usermenu">UserMenu</div>,
}));

describe('Orders page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // mock localStorage to provide auth for AuthProvider
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => JSON.stringify({ user: { name: 'Test' }, token: 'mock-token' })),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('fetches and displays orders and their products when user is authenticated', async () => {
    const mockOrders = [
      {
        _id: 'order1',
        status: 'Delivered',
        buyer: { name: 'Buyer 1' },
        createdAt: new Date().toISOString(),
        payment: { success: true },
        products: [
          { _id: 'p1', name: 'Product 1', description: 'Desc 1', price: 10 },
        ],
      },
    ];

    axios.get.mockResolvedValueOnce({ data: mockOrders });

    render(
      <AuthProvider>
        <Orders />
      </AuthProvider>
    );

    // header should be present immediately
    expect(screen.getByText('Your Orders')).toBeInTheDocument();

    // wait for axios.get to have been called and product name rendered
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/orders'));
    expect(await screen.findByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Buyer 1')).toBeInTheDocument();
    expect(screen.getByText('Desc 1')).toBeInTheDocument();
    expect(screen.getByText('Price: $10')).toBeInTheDocument();
  });

  it('renders multiple products in an order', async () => {
    const mockOrders = [
      {
        _id: 'order2',
        status: 'Shipped',
        buyer: { name: 'Buyer 2' },
        createdAt: new Date().toISOString(),
        payment: { success: true },
        products: [
          { _id: 'p1', name: 'Product A', description: 'Desc A', price: 5 },
          { _id: 'p2', name: 'Product B', description: 'Desc B', price: 15 },
        ],
      },
    ];

    axios.get.mockResolvedValueOnce({ data: mockOrders });

    const { container } = render(
      <AuthProvider>
        <Orders />
      </AuthProvider>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/orders'));

    // both products should be rendered
    expect(await screen.findByText('Product A')).toBeInTheDocument();
    expect(await screen.findByText('Product B')).toBeInTheDocument();

    // there should be two product cards rendered inside the order
    const productCards = container.querySelectorAll('.card.flex-row');
    expect(productCards.length).toBe(2);
  });

  it('handles an order with no products (renders quantity 0 and no product cards)', async () => {
    const mockOrders = [
      {
        _id: 'order0',
        status: 'Processing',
        buyer: { name: 'Buyer 0' },
        createdAt: new Date().toISOString(),
        payment: { success: false },
        products: [],
      },
    ];

    axios.get.mockResolvedValueOnce({ data: mockOrders });

    const { container } = render(
      <AuthProvider>
        <Orders />
      </AuthProvider>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/orders'));

    // quantity cell should display 0
    expect(await screen.findByText('Buyer 0')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();

    // no product cards should be rendered
    const productCards = container.querySelectorAll('.card.flex-row');
    expect(productCards.length).toBe(0);
  });

  it('handles API failure without crashing (calls console.log)', async () => {
    const err = new Error('Network Error');
    axios.get.mockRejectedValueOnce(err);
    
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(
      <AuthProvider>
        <Orders />
      </AuthProvider>
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/orders'));

    expect(consoleSpy).toHaveBeenCalledWith(err);

    expect(screen.getByText('Your Orders')).toBeInTheDocument();
    const productCards = screen.queryAllByRole('img'); // or querySelectorAll('.card.flex-row')
    expect(productCards.length).toBe(0);

    consoleSpy.mockRestore();
});
});
