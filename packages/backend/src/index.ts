import 'dotenv/config';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './db/pool.js';

const app = createApp();

// Run migrations on startup
const migrateOnStartup = async () => {
  const { default: pg } = await import('pg');
  const client = new pg.Client({ connectionString: env.databaseUrl });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const applied = await client.query<{ name: string }>(
    'SELECT name FROM _migrations ORDER BY id',
  );
  const appliedNames = new Set(applied.rows.map((r) => r.name));

  const migrationsDir = path.join(__dirname, 'db/migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f: string) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (appliedNames.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    console.log(`  Applying migration: ${file}`);
    await client.query(sql);
    await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
  }

  await client.end();
  console.log('Migrations complete.');
};

migrateOnStartup()
  .then(() => {
    app.listen(env.port, '0.0.0.0', () => {
      console.log(`Backend listening on port ${env.port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
  });

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});
