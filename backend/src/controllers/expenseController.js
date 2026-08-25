import pool from "../config/db.js";

// CREATE an expense
export const createExpense = async (req, res) => {
  const { description, amount, paid_by } = req.body;

  // Validate required fields
  if (!description || !amount || !paid_by) {
    return res.status(400).json({
      message: "description, amount and paid_by are required"
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO expenses
       (description, amount, paid_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [description, amount, paid_by]
    );

    res.status(201).json({
      message: "Expense created successfully",
      expense: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating expense:", error);

    res.status(500).json({
      message: "Failed to create expense"
    });
  }
};


// GET all expenses
export const getExpenses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM expenses
       ORDER BY created_at DESC`
    );

    res.status(200).json({
      message: "Expenses fetched successfully",
      expenses: result.rows
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);

    res.status(500).json({
      message: "Failed to fetch expenses"
    });
  }
};


// GET one expense by ID
export const getExpenseById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT *
       FROM expenses
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    res.status(200).json({
      message: "Expense fetched successfully",
      expense: result.rows[0]
    });
  } catch (error) {
    console.error("Error fetching expense:", error);

    res.status(500).json({
      message: "Failed to fetch expense"
    });
  }
};