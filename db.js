// Load environment variables from .env into process.env
require("dotenv").config();

// Import the mysql2 library (promise-based version, so we can use async/await)
const mysql = require("mysql2/promise");

// Create a connection pool instead of a single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function initializeBudgetTable() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS budgets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      month CHAR(7) NOT NULL UNIQUE,
      amount DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );
}

// Export the pool so other files (controllers) can use it to run queries
module.exports = pool;
module.exports.initializeBudgetTable = initializeBudgetTable;
