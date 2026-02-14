import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Users from '../../../pages/admin/Users';

jest.mock('axios');

jest.mock('../../../components/Layout', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

jest.mock('../../../components/AdminMenu', () => ({
  __esModule: true,
  default: () => <div data-testid="adminmenu">AdminMenu</div>,
}));

describe('Admin Users page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('fetches and displays users', async () => {
    const mockUsers = [
      { _id: 'u1', name: 'Alice', email: 'alice@example.com', phone: '111', role: 0, createdAt: new Date().toISOString() },
      { _id: 'u2', name: 'Bob', email: 'bob@example.com', phone: '222', role: 1, createdAt: new Date().toISOString() },
    ];

    axios.get.mockResolvedValueOnce({ data: mockUsers });

    render(<Users />);

    // header present immediately
    expect(screen.getByText('All Users')).toBeInTheDocument();

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/users'));

    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('111')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();

    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    expect(screen.getByText('222')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders empty state when no users returned', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Users />);

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/users'));

    expect(await screen.findByText('No users found')).toBeInTheDocument();
  });

  it('logs error and shows empty state on API failure', async () => {
    const err = new Error('Network Error');
    axios.get.mockRejectedValueOnce(err);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<Users />);

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/users'));

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load users', err);
    expect(await screen.findByText('No users found')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
