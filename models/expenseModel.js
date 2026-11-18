// Import our database connection pool
const pool = require("../db");

// Fetch all expenses from the database
async function getAllExpenses() {
  const [rows] = await pool.query(
    "SELECT * FROM expenses ORDER BY expense_date DESC"
  );
  return rows;
}

// Fetch a single expense by its ID
async function getExpenseById(id) {
  const [rows] = await pool.query("SELECT * FROM expenses WHERE id = ?", [id]);
  return rows[0];
}

// Insert a new expense into the database
async function createExpense(expense) {
  const { title, amount, category, expense_date } = expense;
  const [result] = await pool.query(
    "INSERT INTO expenses (title, amount, category, expense_date) VALUES (?, ?, ?, ?)",
    [title, amount, category, expense_date]
  );
  return result.insertId;
}

// Update an existing expense by ID
async function updateExpense(id, expense) {
  const { title, amount, category, expense_date } = expense;
  const [result] = await pool.query(
    "UPDATE expenses SET title = ?, amount = ?, category = ?, expense_date = ? WHERE id = ?",
    [title, amount, category, expense_date, id]
  );
  return result.affectedRows;
}

// Delete an expense by ID
async function deleteExpense(id) {
  const [result] = await pool.query("DELETE FROM expenses WHERE id = ?", [id]);
  return result.affectedRows;
}

async function getMonthlySummary(month) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total,
      COALESCE(SUM(CASE WHEN category = 'Food' THEN amount ELSE 0 END), 0) AS food,
      COALESCE(SUM(CASE WHEN category = 'Transport' THEN amount ELSE 0 END), 0) AS transport,
      COALESCE(SUM(CASE WHEN category = 'Bills' THEN amount ELSE 0 END), 0) AS bills,
      COALESCE(SUM(CASE WHEN category = 'Shopping' THEN amount ELSE 0 END), 0) AS shopping,
      COALESCE(SUM(CASE WHEN category = 'Entertainment' THEN amount ELSE 0 END), 0) AS entertainment,
      COALESCE(SUM(CASE WHEN category = 'Other' THEN amount ELSE 0 END), 0) AS other
      FROM expenses WHERE DATE_FORMAT(expense_date, '%Y-%m') = ?`,
    [month]
  );
  return rows[0];
}

async function getBudget(month) {
  const [rows] = await pool.query("SELECT * FROM budgets WHERE month = ?", [month]);
  return rows[0];
}

async function saveBudget(month, amount) {
  await pool.query(
    "INSERT INTO budgets (month, amount) VALUES (?, ?) ON DUPLICATE KEY UPDATE amount = VALUES(amount)",
    [month, amount]
  );
  return getBudget(month);
}

// Export so controllers can use these functions
module.exports = {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getMonthlySummary,
  getBudget,
  saveBudget,
};
