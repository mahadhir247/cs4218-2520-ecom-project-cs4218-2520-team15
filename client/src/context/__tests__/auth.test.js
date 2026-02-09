import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';

import { AuthProvider, useAuth } from '../../auth';

let originalLocalStorage;
let originalAxiosHeaders;

beforeEach(() => {
  // save originals
  originalLocalStorage = global.localStorage;
  originalAxiosHeaders = axios.defaults && axios.defaults.headers && axios.defaults.headers.common
    ? axios.defaults.headers.common
    : undefined;

  // mock localStorage
  let store = {};
  const mockLocalStorage = {
    getItem: jest.fn((key) => (store.hasOwnProperty(key) ? store[key] : null)),
    setItem: jest.fn((key, value) => { store[key] = String(value); }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
  Object.defineProperty(global, 'localStorage', {
    value: mockLocalStorage,
    configurable: true,
  });

  // mock axios defaults headers.common
  axios.defaults = axios.defaults || {};
  axios.defaults.headers = axios.defaults.headers || {};
  axios.defaults.headers.common = {};
});

afterEach(() => {
  cleanup();
  // restore originals
  if (originalLocalStorage !== undefined) {
    Object.defineProperty(global, 'localStorage', { value: originalLocalStorage, configurable: true });
  }
  if (originalAxiosHeaders !== undefined) {
    axios.defaults.headers.common = originalAxiosHeaders;
  }
});

function TestConsumer() {
  const [auth] = useAuth();
  return (
    <div>
      <span data-testid="user">{auth.user ? auth.user.name : 'null'}</span>
      <span data-testid="token">{auth.token}</span>
    </div>
  );
}

test('provides default auth and sets axios header to empty string', () => {
  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );

  expect(screen.getByTestId('user')).toHaveTextContent('null');
  expect(screen.getByTestId('token')).toHaveTextContent('');
  expect(axios.defaults.headers.common.Authorization).toBe("");
});

test('loads auth from localStorage and updates axios default header', async () => {
  const saved = { user: { name: 'Alice', email: 'a@example.com' }, token: 'Bearer abc123' };
  localStorage.setItem('auth', JSON.stringify(saved));

  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );

  await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Alice'));
  expect(screen.getByTestId('token')).toHaveTextContent('Bearer abc123');
  expect(axios.defaults.headers.common.Authorization).toBe('Bearer abc123');
});
