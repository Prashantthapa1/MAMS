import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthRole, AuthUser } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { AppLayout } from './AppLayout';

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

function renderLayout(role: AuthRole) {
  mockUseAuth.mockReturnValue({
    user: user(role),
    token: 'token',
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  });

  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<div>Dashboard content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('role navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hides admin and financial navigation for staff users', () => {
    renderLayout('STAFF');

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /attendance/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /leave/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /employees/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /salaries/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /revenue/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /expenses/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /profit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /reports/i })).not.toBeInTheDocument();
  });

  it('shows financial navigation for managers without admin-only settings', () => {
    renderLayout('MANAGER');

    expect(screen.getByRole('link', { name: /employees/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /salaries/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /reports/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /settings/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /staff access/i })).not.toBeInTheDocument();
  });

  it('shows admin-only navigation for admins', () => {
    renderLayout('ADMIN');

    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /staff access/i })).toBeInTheDocument();
  });
});
