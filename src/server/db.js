const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

let pool = null;

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes('supabase.com')
      ? { rejectUnauthorized: false }
      : undefined,
  });
}

const query = (text, params) => {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured');
  }
  return pool.query(text, params);
};

module.exports = {
  pool,
  query,
  hasDatabase: Boolean(pool),
};
