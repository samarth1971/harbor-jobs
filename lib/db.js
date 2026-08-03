import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';

// Unified DB helper: supports local Postgres via `pg` (development)
// and Neon serverless (Vercel) via `@neondatabase/serverless` (production).
// Set `DATABASE_URL` in `.env.local` for local development.

let neonClient = null;
let pgPool = null;
let schemaReady = null;

function getConnectionInfo() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error(
      'No database connection string found (DATABASE_URL). Attach the Neon integration to Vercel or set DATABASE_URL locally.'
    );
  }

  const isLocal = /localhost|127\.0\.0\.1/.test(connectionString) || connectionString.startsWith('postgres://');

  if (isLocal) {
    if (!pgPool) {
      pgPool = new Pool({ connectionString });
    }
    return { type: 'pg', client: pgPool };
  }

  if (!neonClient) {
    neonClient = neon(connectionString);
  }
  return { type: 'neon', client: neonClient };
}

export function rowToJob(row) {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    type: row.type,
    salary: row.salary,
    tags: row.tags || [],
    description: row.description,
    logoUrl: row.logo_url || null,
    paymentReference: row.payment_reference || null,
    paymentMethod: row.payment_method || null,
    postedAt: new Date(row.created_at).toISOString(),
    source: 'posted',
  };
}

export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const conn = getConnectionInfo();

      if (conn.type === 'neon') {
        await conn.client`
          CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            location TEXT NOT NULL,
            type TEXT NOT NULL,
            salary TEXT,
            tags JSONB DEFAULT '[]'::jsonb,
            description TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;
        await conn.client`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS payment_reference TEXT;`;
        await conn.client`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS payment_method TEXT;`;
        await conn.client`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS logo_url TEXT;`;

        await conn.client`
          CREATE TABLE IF NOT EXISTS applications (
            id TEXT PRIMARY KEY,
            job_id TEXT NOT NULL,
            job_title TEXT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            link TEXT,
            note TEXT,
            submitted_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;
      } else {
        await conn.client.query(`
          CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            location TEXT NOT NULL,
            type TEXT NOT NULL,
            salary TEXT,
            tags JSONB DEFAULT '[]'::jsonb,
            description TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
        await conn.client.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS payment_reference TEXT;`);
        await conn.client.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS payment_method TEXT;`);
        await conn.client.query(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS logo_url TEXT;`);

        await conn.client.query(`
          CREATE TABLE IF NOT EXISTS applications (
            id TEXT PRIMARY KEY,
            job_id TEXT NOT NULL,
            job_title TEXT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            link TEXT,
            note TEXT,
            submitted_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
      }
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

// Tagged-template `sql` helper compatible with both Neon and pg.
export async function sql(strings, ...values) {
  const conn = getConnectionInfo();

  if (conn.type === 'neon') {
    return conn.client(strings, ...values);
  }

  let text = '';
  const params = [];
  for (let i = 0; i < strings.length; i++) {
    text += strings[i];
    if (i < values.length) {
      params.push(values[i]);
      text += `$${params.length}`;
    }
  }

  return conn.client.query(text, params);
}
