const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

function readDatabaseUrl() {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found');
    process.exit(2);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const line = content.split(/\r?\n/).find((l) => l.startsWith('DATABASE_URL='));
  if (!line) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(2);
  }
  return line.split('=')[1].trim();
}

(async () => {
  const connectionString = readDatabaseUrl();
  console.log('Using connection string from .env.local (hidden)');
  const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000 });
  try {
    const v = await pool.query('SELECT version()');
    console.log('Connected to Postgres:', v.rows[0].version.split(',')[0]);
    const tbl = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public';");
    console.log('Public tables:', tbl.rows.map(r=>r.tablename));
  } catch (err) {
    console.error('Connection error:', err.message);
    if (err.code) console.error('PG error code:', err.code);
  } finally {
    await pool.end().catch(()=>{});
  }
})();
