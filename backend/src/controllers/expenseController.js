import pool from "../config/db.js";

// CREATE EXPENSE
const createExpense = async (req, res) => {
  try {
    const { description, amount, paid_by } = req.body;

    const result = await pool.query(
      `INSERT INTO expenses (description, amount, paid_by)
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
      message: "Server error"
    });
  }
};

// GET ALL EXPENSES
const getExpenses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM expenses
       ORDER BY id ASC`
    );

    res.status(200).json({
      message: "Expenses fetched successfully",
      expenses: result.rows
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

// GET ONE EXPENSE BY ID
const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM expenses
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
      message: "Server error"
    });
  }
};

// UPDATE EXPENSE
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, paid_by } = req.body;

    const result = await pool.query(
      `UPDATE expenses
       SET description = $1,
           amount = $2,
           paid_by = $3
       WHERE id = $4
       RETURNING *`,
      [description, amount, paid_by, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    res.status(200).json({
      message: "Expense updated successfully",
      expense: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating expense:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

// DELETE EXPENSE
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM expenses
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    res.status(200).json({
      message: "Expense deleted successfully",
      expense: result.rows[0]
    });
  } catch (error) {
    console.error("Error deleting expense:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

export {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
};