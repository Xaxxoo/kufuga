import { Client } from 'pg';

const source = new URL(process.env.DATABASE_URL ?? 'postgresql://kufuga:kufuga@localhost:5432/kufuga');
const database = 'poultry_stellar_test';
const adminUrl = new URL(source);
adminUrl.pathname = '/postgres';

async function main(): Promise<void> {
  const client = new Client({ connectionString: adminUrl.toString() });
  await client.connect();
  if (process.argv[2] === 'create') {
    await client.query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`, [database]);
    await client.query(`DROP DATABASE IF EXISTS "${database}"`);
    await client.query(`CREATE DATABASE "${database}"`);
  } else if (process.argv[2] === 'drop') {
    await client.query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`, [database]);
    await client.query(`DROP DATABASE IF EXISTS "${database}"`);
  } else {
    throw new Error('Expected create or drop');
  }
  await client.end();
}

void main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
