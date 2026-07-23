import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReportSummary } from '../api/types';
import { api } from '../api/client';
import { useApiResource } from '../hooks/useApiResource';
import { ReportsPage } from './ReportsPage';

vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(),
  },
}));

vi.mock('../hooks/useApiResource', () => ({
  useApiResource: vi.fn(),
}));

const mockUseApiResource = vi.mocked(useApiResource<ReportSummary[]>);
const mockApiGet = vi.mocked(api.get);

const reports: ReportSummary[] = [
  { id: 'attendance', name: 'Attendance', records: 12 },
  { id: 'revenue', name: 'Revenue', records: 4 },
];

describe('reports CSV controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApiResource.mockReturnValue({
      data: reports,
      isLoading: false,
      error: null,
      reload: vi.fn(),
      remove: vi.fn(),
    });
    mockApiGet.mockResolvedValue({ data: new Blob(['id,name\n1,Attendance']) });
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:report'),
      revokeObjectURL: vi.fn(),
    });
  });

  it('exports the selected report with date filters', async () => {
    const currentUser = userEvent.setup();
    render(<ReportsPage />);

    await currentUser.type(screen.getByLabelText(/from date/i), '2026-07-01');
    await currentUser.type(screen.getByLabelText(/to date/i), '2026-07-31');
    await currentUser.click(screen.getAllByRole('button', { name: /export csv/i })[0]);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/reports/attendance/export', {
        params: { from: '2026-07-01', to: '2026-07-31' },
        responseType: 'blob',
      });
    });
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:report');
  });

  it('clears date filters', async () => {
    const currentUser = userEvent.setup();
    render(<ReportsPage />);

    const from = screen.getByLabelText(/from date/i);
    const to = screen.getByLabelText(/to date/i);
    await currentUser.type(from, '2026-07-01');
    await currentUser.type(to, '2026-07-31');
    await currentUser.click(screen.getByRole('button', { name: /clear dates/i }));

    expect(from).toHaveValue('');
    expect(to).toHaveValue('');
  });

  it('shows export errors accessibly', async () => {
    const currentUser = userEvent.setup();
    mockApiGet.mockRejectedValueOnce(new Error('network'));

    render(<ReportsPage />);
    await currentUser.click(screen.getAllByRole('button', { name: /export csv/i })[0]);

    expect(await screen.findByRole('alert')).toHaveTextContent(/unable to export/i);
  });
});
