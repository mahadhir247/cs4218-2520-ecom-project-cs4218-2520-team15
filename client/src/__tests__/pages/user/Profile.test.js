import { render, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import toast from 'react-hot-toast';
import Profile from '../../../pages/user/Profile';

jest.mock('axios');
jest.mock('react-hot-toast');

jest.mock('../../../components/UserMenu', () => () => <div>UserMenu</div>);
jest.mock('../../../components/Layout', () => ({ __esModule: true, default: ({ children }) => <>{children}</> }));
jest.mock('../../../components/Header', () => () => <div>Header</div>);

const mockSetAuth = jest.fn();

jest.mock("@context/auth", () => ({
  useAuth: jest.fn(() => [
    { 
      user: {
        name: 'John Doe',
        email: 'john@test.com',
        phone: '88888888',
        address: '123 Street',
      },
    },
    mockSetAuth
  ]), 
}));

// Provide a localStorage mock object that can be modified
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() =>
      JSON.stringify({
        user: {
          name: 'John Doe',
          email: 'john@test.com',
          phone: '88888888',
          address: '123 Street',
        },
      })
    ),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

describe('Profile Component', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterAll(() => {
    console.log.mockRestore();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderProfile = () =>
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

  it('renders profile form with pre-filled user data', async () => {
    const { getByPlaceholderText } = renderProfile();

    await waitFor(() => {
      expect(getByPlaceholderText('Enter Your Name')).toHaveValue('John Doe');
      expect(getByPlaceholderText('Enter Your Email')).toHaveValue('john@test.com');
      expect(getByPlaceholderText('Enter Your Phone')).toHaveValue('88888888');
      expect(getByPlaceholderText('Enter Your Address')).toHaveValue('123 Street');
    });
  });

  it('submits updated profile and updates auth/localStorage and shows success (single behavior)', async () => {
    const updatedUser = {
      name: 'Jane Doe',
      email: 'john@test.com',
      phone: '82345678',
      address: '456 Street',
    };
    axios.put.mockResolvedValueOnce({ data: { updatedUser } });

    const { getByPlaceholderText, getByText } = renderProfile();

    await waitFor(() => expect(getByPlaceholderText('Enter Your Name')).toHaveValue('John Doe'));

    await act(async () => {
      fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: updatedUser.name } });
      fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: updatedUser.phone } });
      fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: updatedUser.address } });
      fireEvent.click(getByText('UPDATE'));
    });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        '/api/v1/auth/profile',
        expect.objectContaining({
          name: updatedUser.name,
          email: updatedUser.email,
          password: '',
          phone: updatedUser.phone,
          address: updatedUser.address,
        })
      );
    });

    expect(mockSetAuth).toHaveBeenCalled();
    const setArg = mockSetAuth.mock.calls[0][0];
    expect(typeof setArg).toBe('function');
    const prev = { user: { name: 'Old' }, other: 1 };
    const newState = setArg(prev);
    expect(newState.user).toEqual(updatedUser);

    // localStorage should have been written
    expect(window.localStorage.setItem).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Profile Updated Successfully');
  });

  it('shows error toast when axios.put rejects (single behavior)', async () => {
    axios.put.mockRejectedValueOnce(new Error('Update failed'));
    const { getByText } = renderProfile();

    await act(async () => {
      fireEvent.click(getByText('UPDATE'));
    });

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith('Something went wrong');
    expect(mockSetAuth).not.toHaveBeenCalled();
  });

  it('shows server-provided error message when response contains data.error', async () => {
    axios.put.mockResolvedValueOnce({ data: { error: 'Server says no' } });
    const { getByText } = renderProfile();

    await act(async () => {
      fireEvent.click(getByText('UPDATE'));
    });

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith('Server says no');
    expect(mockSetAuth).not.toHaveBeenCalled();
  });

  it('handles localStorage parse failure by overwriting stored auth', async () => {
    window.localStorage.getItem = jest.fn(() => 'not-a-json');

    const updatedUser = {
      name: 'Jane Doe',
      email: 'john@test.com',
      phone: '82345678',
      address: '456 Street',
    };
    axios.put.mockResolvedValueOnce({ data: { updatedUser } });

    const { getByPlaceholderText, getByText } = renderProfile();
    await waitFor(() => expect(getByPlaceholderText('Enter Your Name')).toHaveValue('John Doe'));

    await act(async () => {
      fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: updatedUser.name } });
      fireEvent.click(getByText('UPDATE'));
    });

    // localStorage.setItem should be called with a JSON string containing updatedUser
    expect(window.localStorage.setItem).toHaveBeenCalled();
    const raw = window.localStorage.setItem.mock.calls[0][1];
    const parsed = JSON.parse(raw);
    expect(parsed.user).toEqual(updatedUser);
  });
});
