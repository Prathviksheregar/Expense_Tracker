# Expense Tracker

A full-stack expense management application for recording, organizing, searching, and analyzing personal spending. Built with vanilla JavaScript, Node.js, Express, and MySQL.

## Features

- Add, edit, and delete expenses
- Search expenses by title
- Filter expenses by category
- View all-time and filtered totals
- Monthly spending dashboard
- Monthly totals and category-wise summaries
- Set a monthly budget and track spending against it
- Responsive desktop and mobile interface
- REST API with server-side input validation
- Automatic budget-table initialization

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Database Driver:** mysql2
- **Environment Variables:** dotenv

## Project Structure

```text
expense-tracker/
|-- controllers/       # HTTP request handlers
|-- models/            # MySQL queries
|-- public/            # Frontend HTML, CSS, and JavaScript
|-- routes/            # Express routes
|-- database.sql       # Database and table definitions
|-- db.js              # MySQL connection pool
|-- server.js          # Express application entry point
|-- package.json
|-- .env.example
`-- README.md
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- MySQL Server or MySQL Workbench

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/expense-tracker.git
cd expense-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the database

Open MySQL Workbench or run MySQL CLI, then execute:

```sql
source database.sql;
```

You can also copy and run the contents of `database.sql` directly.

### 4. Configure environment variables

Create a `.env` file in the project root using `.env.example` as a template:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=expense_tracker_db
DB_PORT=3306
PORT=5000
```

Never commit `.env` or real database credentials.

### 5. Start the application

```bash
npm start
```

Open `http://localhost:5000` in your browser.

## Available Categories

- Food
- Transport
- Bills
- Shopping
- Entertainment
- Other

## Monthly Budget

Select a month, enter a positive budget amount, and select **Save Budget**. The dashboard displays the month's spending and highlights the budget status when spending exceeds the configured amount.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/expenses` | Get all expenses |
| `GET` | `/expenses/:id` | Get one expense |
| `POST` | `/expenses` | Create an expense |
| `PUT` | `/expenses/:id` | Update an expense |
| `DELETE` | `/expenses/:id` | Delete an expense |
| `GET` | `/expenses/summary/month?month=YYYY-MM` | Get monthly summary and budget |
| `PUT` | `/expenses/budget` | Create or update a monthly budget |
| `GET` | `/api/health` | Check server status |

## Example Requests

### Create an expense

```json
{
  "title": "Groceries",
  "amount": 850.50,
  "category": "Food",
  "expense_date": "2026-11-18"
}
```

### Set a monthly budget

```json
{
  "month": "2026-11",
  "amount": 15000
}
```

## Database Schema

```sql
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    month CHAR(7) NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: expense tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git push -u origin main
```

## Security

- Keep `.env` out of version control
- The `.gitignore` file excludes `.env` and `node_modules`
- Use parameterized SQL queries to prevent SQL injection
- Replace example credentials before running the application

## Author

Prathvik Sheegar

## License

This project is open source and available for learning purposes.
