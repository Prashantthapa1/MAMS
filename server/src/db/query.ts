import type { PoolClient, QueryResult, QueryResultRow } from 'pg';
import { pool } from './pool.js';

type QueryParams = readonly unknown[];
type QueryExecutor = Pick<PoolClient, 'query'>;

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: QueryParams = [],
  executor: QueryExecutor = pool,
): Promise<QueryResult<T>> {
  return executor.query<T>(text, [...params]);
}

export async function findMany<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: QueryParams = [],
  executor?: QueryExecutor,
) {
  const result = await query<T>(text, params, executor);
  return result.rows;
}

export async function findOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: QueryParams = [],
  executor?: QueryExecutor,
) {
  const result = await query<T>(text, params, executor);
  return result.rows[0] ?? null;
}

export async function transaction<T>(callback: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
