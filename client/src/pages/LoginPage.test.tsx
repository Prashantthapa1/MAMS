import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../auth/AuthContext';
import { LoginPage } from './LoginPage';

vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

function renderLogin(login = vi.fn().mockResolvedValue(undefined)) {
  mockUseAuth.mockReturnValue({
    user: null,
    token: null,
    isLoading: false,
    login,
    logout: vi.fn(),
  });

  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div>Signed in</div>} />
      </Routes>
    </MemoryRouter>,
  );

  return { login };
}

describe('login form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits email and password through auth context', async () => {
    const currentUser = userEvent.setup();
    const { login } = renderLogin();

    await currentUser.type(screen.getByLabelText(/email address/i), 'admin@example.com');
    await currentUser.type(screen.getByLabelText(/^password$/i), 'password123');
    await currentUser.click(screen.getByRole('button', { name: /sign in/i }));

    expect(login).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'password123',
    });
    expect(await screen.findByText('Signed in')).toBeInTheDocument();
  });

  it('toggles password visibility with an accessible control', async () => {
    const currentUser = userEvent.setup();
    renderLogin();

    const password = screen.getByLabelText(/^password$/i);
    expect(password).toHaveAttribute('type', 'password');

    await currentUser.click(screen.getByRole('button', { name: /show password/i }));

    expect(password).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
  });

  it('shows inline feedback when authentication fails', async () => {
    const currentUser = userEvent.setup();
    renderLogin(vi.fn().mockRejectedValue(new Error('bad credentials')));

    await currentUser.type(screen.getByLabelText(/email address/i), 'admin@example.com');
    await currentUser.type(screen.getByLabelText(/^password$/i), 'wrong');
    await currentUser.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not sign you in/i);
  });
});
