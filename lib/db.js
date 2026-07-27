import { neon } from '@neondatabase/serverless';

// Backend storage via Neon Postgres, added through Vercel's native Neon
// integration (Vercel Marketplace -> Neon). That integration injects
// DATABASE_URL (and legacy POSTGRES_* vars) into the project automatically
// -- no manual connection-string handling needed once it's attached.
//
// Note: @vercel/postgres is deprecated as of 2026 in favor of this native
// integration, which is why this project uses @neondatabase/serverless
// directly rather than the older package.

function getSql() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error(
      'No database connection string found (DATABASE_URL). Attach the Neon integration to this Vercel project.'
    );
  }
  return neon(connectionString);
}

let schemaReady = null;

export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getSql();
      await sql`
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
      await sql`
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
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

export function sql(strings, ...values) {
  return getSql()(strings, ...values);
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
    postedAt: new Date(row.created_at).toISOString(),
    source: 'posted',
  };
}
