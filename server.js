require("dotenv").config();
const express = require("express");
const app = express();
const db = require("./db");

app.use(express.json());
app.use(express.static("public"));

const expenseRoutes = require("./routes/expenseRoutes");
const expenseController = require("./controllers/expenseController");

app.get("/expenses/summary/month", expenseController.getMonthlySummary);
app.put("/expenses/budget", expenseController.saveBudget);
app.use("/expenses", expenseRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running fine" });
});

const PORT = process.env.PORT || 5000;

db.initializeBudgetTable()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database initialization failed:", error.message);
    process.exit(1);
  });
