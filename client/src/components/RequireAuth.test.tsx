import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthRole, AuthUser } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { RequireAuth } from './RequireAuth';
import { RequireRole } from './RequireRole';

vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

function user(role: AuthRole): AuthUser {
  return {
    id: 'user-1',
    email: `${role.toLowerCase()}@example.com`,
    fullName: `${role} User`,
    role,
  };
}

function authValue(currentUser: AuthUser | null) {
  return {
    user: currentUser,
    token: currentUser ? 'token' : null,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  };
}

function renderProtected(currentUser: AuthUser | null) {
  mockUseAuth.mockReturnValue(authValue(currentUser));

  render(
    <MemoryRouter initialEntries={['/employees']}>
      <Routes>
        <Route
          path="/employees"
          element={
            <RequireAuth>
              <div>Employees page</div>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderRoleProtected(currentUser: AuthUser | null) {
  mockUseAuth.mockReturnValue(authValue(currentUser));

  render(
    <MemoryRouter initialEntries={['/salaries']}>
      <Routes>
        <Route
          path="/salaries"
          element={
            <RequireRole allowedRoles={['ADMIN', 'MANAGER']}>
              <div>Salaries page</div>
            </RequireRole>
          }
        />
        <Route path="/dashboard" element={<div>Dashboard page</div>} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('auth guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects anonymous users to login', () => {
    renderProtected(null);

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders authenticated content', () => {
    renderProtected(user('ADMIN'));

    expect(screen.getByText('Employees page')).toBeInTheDocument();
  });

  it('redirects staff away from admin financial pages', () => {
    renderRoleProtected(user('STAFF'));

    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
    expect(screen.queryByText('Salaries page')).not.toBeInTheDocument();
  });

  it('allows managers into manager financial pages', () => {
    renderRoleProtected(user('MANAGER'));

    expect(screen.getByText('Salaries page')).toBeInTheDocument();
  });
});
