// src/config/db.config.js
module.exports = {
  HOST: "your_db_host", // e.g., 'localhost' or IP address
  USER: "your_db_user",
  PASSWORD: "your_db_password",
  DB: "your_db_name",
  PORT: 5432, // Default PostgreSQL port
  dialect: "postgres",
  pool: { // Optional: configure connection pooling
    max: 5, // Maximum number of connections in pool
    min: 0, // Minimum number of connections in pool
    acquire: 30000, // Maximum time, in milliseconds, that pool will try to get connection before throwing error
    idle: 10000 // Maximum time, in milliseconds, that a connection can be idle before being released
  }
};
