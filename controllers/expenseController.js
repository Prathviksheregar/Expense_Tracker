// Import the model functions
const expenseModel = require("../models/expenseModel");

// Handler for GET /expenses
async function getExpenses(req, res) {
  try {
    const expenses = await expenseModel.getAllExpenses();
    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error.message);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
}

// Handler for GET /expenses/:id
async function getExpenseById(req, res) {
  try {
    const { id } = req.params;
    const expense = await expenseModel.getExpenseById(id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.status(200).json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error.message);
    res.status(500).json({ error: "Failed to fetch expense" });
  }
}

// Handler for POST /expenses
async function createExpense(req, res) {
  try {
    const { title, amount, category, expense_date } = req.body;

    if (!title || !amount || !category || !expense_date) {
      return res.status(400).json({
        error: "All fields are required: title, amount, category, expense_date",
      });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }
    const newExpenseId = await expenseModel.createExpense({
      title,
      amount,
      category,
      expense_date,
    });

    res.status(201).json({
      message: "Expense created successfully",
      id: newExpenseId,
    });
  } catch (error) {
    console.error("Error creating expense:", error.message);
    res.status(500).json({ error: "Failed to create expense" });
  }
}

// Handler for PUT /expenses/:id
async function updateExpense(req, res) {
  try {
    const { id } = req.params;
    const { title, amount, category, expense_date } = req.body;

    if (!title || !amount || !category || !expense_date) {
      return res.status(400).json({
        error: "All fields are required: title, amount, category, expense_date",
      });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }
    const affectedRows = await expenseModel.updateExpense(id, {
      title,
      amount,
      category,
      expense_date,
    });

    if (affectedRows === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.status(200).json({ message: "Expense updated successfully" });
  } catch (error) {
    console.error("Error updating expense:", error.message);
    res.status(500).json({ error: "Failed to update expense" });
  }
}

async function getMonthlySummary(req, res) {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: "Month must use YYYY-MM format" });
    }
    const [summary, budget] = await Promise.all([
      expenseModel.getMonthlySummary(month),
      expenseModel.getBudget(month),
    ]);
    res.json({ month, summary, budget: budget || null });
  } catch (error) {
    console.error("Error fetching monthly summary:", error.message);
    res.status(500).json({ error: "Failed to fetch monthly summary" });
  }
}

async function saveBudget(req, res) {
  try {
    const { month, amount } = req.body;
    if (!/^\d{4}-\d{2}$/.test(month || "") || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: "Month must be YYYY-MM and amount must be positive" });
    }
    res.status(200).json({ budget: await expenseModel.saveBudget(month, amount) });
  } catch (error) {
    console.error("Error saving budget:", error.message);
    res.status(500).json({ error: "Failed to save budget" });
  }
}

// Handler for DELETE /expenses/:id
async function deleteExpense(req, res) {
  try {
    const { id } = req.params;
    const affectedRows = await expenseModel.deleteExpense(id);

    if (affectedRows === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error.message);
    res.status(500).json({ error: "Failed to delete expense" });
  }
}

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getMonthlySummary,
  saveBudget,
};
