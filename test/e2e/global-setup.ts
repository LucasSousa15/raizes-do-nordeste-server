import { Client } from 'pg';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import * as dotenv from 'dotenv';


export default async function setup(): Promise<void> {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const envTestPath = path.join(repoRoot, '.env.test');
  dotenv.config({ path: envTestPath, override: true });

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL não definido em .env.test');
  }

  const parsed = new URL(databaseUrl);
  const targetDb = parsed.pathname.replace(/^\//, '');
  if (!targetDb) {
    throw new Error(`DATABASE_URL inválida: ${databaseUrl}`);
  }

  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = '/postgres';

  const admin = new Client({ connectionString: adminUrl.toString() });
  await admin.connect();

  try {
    const { rows } = await admin.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [targetDb],
    );

    if (rows.length === 0) {
      await admin.query(`CREATE DATABASE "${targetDb.replace(/"/g, '')}"`);
      console.log(`[e2e setup] Banco ${targetDb} criado.`);
    } else {
      console.log(`[e2e setup] Banco ${targetDb} já existe.`);
    }
  } finally {
    await admin.end();
  }

  execSync('npx prisma migrate deploy', {
    cwd: repoRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });

  console.log(`[e2e setup] Migrations aplicadas em ${targetDb}.`);
}
