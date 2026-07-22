import { describe, expect, it, vi } from 'vitest';

describe('query helpers', () => {
  it('copies readonly params before passing them to pg', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/test');
    vi.stubEnv('JWT_SECRET', 'test-secret-value');
    const { query } = await import('../query.js');
    const executor = {
      query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    };

    const params = Object.freeze(['employee-id']);
    await query('SELECT * FROM employees WHERE id = $1', params, executor);

    expect(executor.query).toHaveBeenCalledWith('SELECT * FROM employees WHERE id = $1', ['employee-id']);
  });

  it('returns rows from findMany', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/test');
    vi.stubEnv('JWT_SECRET', 'test-secret-value');
    const { findMany } = await import('../query.js');
    const executor = {
      query: vi.fn().mockResolvedValue({ rows: [{ id: 'emp-1' }] }),
    };

    await expect(findMany('SELECT id FROM employees', [], executor)).resolves.toEqual([{ id: 'emp-1' }]);
  });

  it('returns null from findOne when no rows exist', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/test');
    vi.stubEnv('JWT_SECRET', 'test-secret-value');
    const { findOne } = await import('../query.js');
    const executor = {
      query: vi.fn().mockResolvedValue({ rows: [] }),
    };

    await expect(findOne('SELECT id FROM employees LIMIT 1', [], executor)).resolves.toBeNull();
  });
});
