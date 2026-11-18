// Base URL for our API - change this if you deploy later
const API_URL = "http://localhost:5000/expenses";

// References to key elements
const tableBody = document.getElementById("expensesTableBody");
const totalAmountEl = document.getElementById("totalAmount");
const expenseForm = document.getElementById("expenseForm");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const summaryMonth = document.getElementById("summaryMonth");
const budgetAmount = document.getElementById("budgetAmount");
const budgetStatus = document.getElementById("budgetStatus");
const monthlyTotal = document.getElementById("monthlyTotal");
const monthlyCount = document.getElementById("monthlyCount");
const categorySummary = document.getElementById("categorySummary");

// Track whether we are editing an existing expense (null = adding new)
let editingId = null;

// Keep a copy of ALL expenses fetched from the server, so search/filter
// can work on it locally without needing a new API call every time
let allExpenses = [];

summaryMonth.value = new Date().toISOString().slice(0, 7);

// Fetch all expenses from the backend and render them
async function loadExpenses() {
    try {
        const response = await fetch(API_URL);
        const expenses = await response.json();

        allExpenses = expenses; // save the full list
        applyFilters(); // render based on current search/filter state
        loadSummary();
    } catch (error) {
        console.error("Failed to load expenses:", error);
        tableBody.innerHTML = "<tr><td colspan=\"5\">Failed to load expenses. Is the server running?</td></tr>";
    }

}

async function loadSummary() {
    try {
        const response = await fetch(API_URL + "/summary/month?month=" + encodeURIComponent(summaryMonth.value));
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to load summary");
        const total = Number(result.summary.total);
        monthlyTotal.textContent = "Rs. " + total.toFixed(2);
        monthlyCount.textContent = result.summary.count;
        categorySummary.textContent = ["food", "transport", "bills", "shopping", "entertainment", "other"]
            .filter(function (category) { return Number(result.summary[category]) > 0; })
            .map(function (category) {
                return category.charAt(0).toUpperCase() + category.slice(1) + ": Rs. " + Number(result.summary[category]).toFixed(2);
            }).join("  |  ") || "No spending recorded this month";
        if (result.budget) {
            const budget = Number(result.budget.amount);
            budgetAmount.value = budget.toFixed(2);
            budgetStatus.textContent = "Rs. " + total.toFixed(2) + " / Rs. " + budget.toFixed(2);
            budgetStatus.classList.toggle("over-budget", total > budget);
        } else {
            budgetStatus.textContent = "Not set";
            budgetStatus.classList.remove("over-budget");
        }
    } catch (error) {
        console.error("Failed to load monthly summary:", error);
    }
}

// Apply the current search text and category filter to allExpenses,
// then render the result and update the total based on the filtered view
function applyFilters() {
    const searchText = searchInput.value.toLowerCase();
    const selectedCategory = filterCategory.value;

    const filtered = allExpenses.filter(function (expense) {
        const matchesSearch = expense.title.toLowerCase().includes(searchText);
        const matchesCategory = selectedCategory === "" || expense.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    renderExpenses(filtered);
    updateTotal(filtered);
}

// Render an array of expense objects into the table
function renderExpenses(expenses) {
    tableBody.innerHTML = "";

    if (expenses.length === 0) {
        tableBody.innerHTML = "<tr><td colspan=\"5\">No expenses found.</td></tr>";
        return;
    }

    expenses.forEach(function (expense) {
        const row = document.createElement("tr");
        const formattedDate = new Date(expense.expense_date).toLocaleDateString("en-IN");

        row.innerHTML =
            '<td data-label="Title">' + expense.title + "</td>" +
            '<td data-label="Amount">Rs.' + Number(expense.amount).toFixed(2) + "</td>" +
            '<td data-label="Category">' + expense.category + "</td>" +
            '<td data-label="Date">' + formattedDate + "</td>" +
            '<td data-label="Actions">' +
                '<button class="edit-btn" data-id="' + expense.id + '">Edit</button>' +
                '<button class="delete-btn" data-id="' + expense.id + '">Delete</button>' +
            "</td>";

        tableBody.appendChild(row);
    });
}

// Calculate and display the total of the given expenses
function updateTotal(expenses) {
    const total = expenses.reduce(function (sum, expense) {
        return sum + Number(expense.amount);
    }, 0);
    totalAmountEl.textContent = "Rs. " + total.toFixed(2);
}

// Re-apply filters whenever the user types in search or changes the category
searchInput.addEventListener("input", applyFilters);
filterCategory.addEventListener("change", applyFilters);

// Handle Add / Update form submission
expenseForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const expenseData = {
        title: document.getElementById("title").value,
        amount: document.getElementById("amount").value,
        category: document.getElementById("category").value,
        expense_date: document.getElementById("expense_date").value
    };

    try {
        let response;

        if (editingId) {
            response = await fetch(API_URL + "/" + editingId, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(expenseData)
            });
        } else {
            response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(expenseData)
            });
        }

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Something went wrong");
            return;
        }

        editingId = null;
        expenseForm.reset();
        document.querySelector("form button").textContent = "Add Expense";

        loadExpenses();
    } catch (error) {
        console.error("Failed to save expense:", error);
        alert("Something went wrong while saving the expense.");
    }
});

// Handle clicks inside the table (Edit / Delete) using event delegation
tableBody.addEventListener("click", async function (event) {
    const id = event.target.getAttribute("data-id");

    if (!id) return;

    if (event.target.classList.contains("delete-btn")) {
        const confirmDelete = confirm("Are you sure you want to delete this expense?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(API_URL + "/" + id, { method: "DELETE" });
            const result = await response.json();

            if (!response.ok) {
                alert(result.error || "Failed to delete expense");
                return;
            }

            loadExpenses();
        } catch (error) {
            console.error("Failed to delete expense:", error);
            alert("Something went wrong while deleting the expense.");
        }
    }

    if (event.target.classList.contains("edit-btn")) {
        try {
            const response = await fetch(API_URL + "/" + id);
            const expense = await response.json();

            document.getElementById("title").value = expense.title;
            document.getElementById("amount").value = expense.amount;
            document.getElementById("category").value = expense.category;
            document.getElementById("expense_date").value = expense.expense_date.split("T")[0];

            editingId = expense.id;
            document.querySelector("form button").textContent = "Update Expense";

            expenseForm.scrollIntoView({ behavior: "smooth" });
        } catch (error) {
            console.error("Failed to load expense for editing:", error);
            alert("Something went wrong while loading this expense.");
        }
    }
});

summaryMonth.addEventListener("change", loadSummary);
document.getElementById("saveBudget").addEventListener("click", async function () {
    const amount = budgetAmount.value;
    if (!amount || Number(amount) <= 0) {
        alert("Enter a positive monthly budget.");
        return;
    }
    try {
        const response = await fetch(API_URL + "/budget", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ month: summaryMonth.value, amount })
        });
        const result = await response.json();
        if (!response.ok) {
            alert(result.error || "Failed to save budget");
            return;
        }
        loadSummary();
    } catch (error) {
        console.error("Failed to save budget:", error);
        alert("Something went wrong while saving the budget.");
    }
});

// Load expenses as soon as the page loads
loadExpenses();
