import pool from "../config/db.js";

// CREATE EXPENSE
const createExpense = async (req, res, next) => {
  try {
    const { description, amount, paid_by, category } = req.body;
    const userId = req.user.userId;

    const result = await pool.query(
      `INSERT INTO expenses
       (description, amount, paid_by, category, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        description,
        amount,
        paid_by,
        category || "Other",
        userId,
      ]
    );

    res.status(201).json({
      message: "Expense created successfully",
      expense: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL EXPENSES
const getExpenses = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT *
       FROM expenses
       WHERE user_id = $1
       ORDER BY id ASC`,
      [userId]
    );

    res.status(200).json({
      message: "Expenses fetched successfully",
      expenses: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// GET ONE EXPENSE BY ID
const getExpenseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const expenseId = Number(id);

    if (!Number.isInteger(expenseId) || expenseId <= 0) {
      return res.status(400).json({
        message: "Invalid expense ID",
      });
    }

    const result = await pool.query(
      `SELECT *
       FROM expenses
       WHERE id = $1
       AND user_id = $2`,
      [expenseId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json({
      message: "Expense fetched successfully",
      expense: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE EXPENSE
const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      description,
      amount,
      paid_by,
      category,
    } = req.body;

    const userId = req.user.userId;
    const expenseId = Number(id);

    if (!Number.isInteger(expenseId) || expenseId <= 0) {
      return res.status(400).json({
        message: "Invalid expense ID",
      });
    }

    if (
      description === undefined ||
      amount === undefined ||
      paid_by === undefined
    ) {
      return res.status(400).json({
        message: "Description, amount and paid_by are required",
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Amount must be a valid number greater than 0",
      });
    }

    const result = await pool.query(
      `UPDATE expenses
       SET description = $1,
           amount = $2,
           paid_by = $3,
           category = $4
       WHERE id = $5
       AND user_id = $6
       RETURNING *`,
      [
        description,
        numericAmount,
        paid_by,
        category || "Other",
        expenseId,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json({
      message: "Expense updated successfully",
      expense: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE EXPENSE ERROR:", error);

    next(error);
  }
};

// DELETE EXPENSE
const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const expenseId = Number(id);

    if (!Number.isInteger(expenseId) || expenseId <= 0) {
      return res.status(400).json({
        message: "Invalid expense ID",
      });
    }

    const result = await pool.query(
      `DELETE FROM expenses
       WHERE id = $1
       AND user_id = $2
       RETURNING *`,
      [expenseId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json({
      message: "Expense deleted successfully",
      expense: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};