// src/models/db.js
const { Pool } = require('pg');
const dbConfig = require('../config/db.config.js');

// Create a connection pool
const pool = new Pool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  port: dbConfig.PORT,
  max: dbConfig.pool ? dbConfig.pool.max : undefined, // Use pool config if available
  min: dbConfig.pool ? dbConfig.pool.min : undefined,
  idleTimeoutMillis: dbConfig.pool ? dbConfig.pool.idle : undefined,
  connectionTimeoutMillis: dbConfig.pool ? dbConfig.pool.acquire : undefined,
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Export the pool itself if needed for transactions or direct pool operations
};
