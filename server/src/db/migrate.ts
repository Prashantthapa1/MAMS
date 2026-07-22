import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.resolve(dirname, '../../db/migrations');

async function ensureMigrationTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations() {
  const result = await pool.query<{ filename: string }>('SELECT filename FROM schema_migrations');
  return new Set(result.rows.map((row) => row.filename));
}

async function runMigration(filename: string) {
  const filePath = path.join(migrationsDirectory, filename);
  const sql = await readFile(filePath, 'utf8');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
    await client.query('COMMIT');
    console.log(`Applied migration: ${filename}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  await ensureMigrationTable();
  const applied = await getAppliedMigrations();
  const files = (await readdir(migrationsDirectory))
    .filter((filename) => filename.endsWith('.sql'))
    .sort();

  for (const filename of files) {
    if (!applied.has(filename)) {
      await runMigration(filename);
    }
  }

  await pool.end();
}

main().catch(async (error: unknown) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
