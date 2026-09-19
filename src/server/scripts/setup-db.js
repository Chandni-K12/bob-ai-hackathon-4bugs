require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { pool, query, hasDatabase } = require('../db');

const run = async () => {
  if (!hasDatabase) {
    throw new Error('DATABASE_URL is missing. Add it to src/server/.env first.');
  }

  const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, '..', 'db', 'seed.sql'), 'utf8');

  await query(schema);
  await query(seed);

  console.log('Database schema and seed data are ready.');
};

run()
  .catch((error) => {
    console.error('Database setup failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (pool) {
      await pool.end();
    }
  });
