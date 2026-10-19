import 'server-only';
import { Pool, type QueryResultRow } from 'pg';
import { env } from './env';

let pool: Pool | null = null;

function getPool() {
  if (!env.databaseUrl) throw new Error('DATABASE_URL не задан');
  pool ??= new Pool({ connectionString: env.databaseUrl, max: 10 });
  return pool;
}

export async function query<T extends QueryResultRow>(sql: string, params: unknown[] = []) {
  return (await getPool().query<T>(sql, params)).rows;
}
