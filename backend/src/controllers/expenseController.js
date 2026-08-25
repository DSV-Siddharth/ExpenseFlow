import pool from "../config/db.js";

export const createExpense = async (req, res) => {
  const { description, amount, paid_by } = req.body;

  // Validate required fields
  if (!description || !amount || !paid_by) {
    return res.status(400).json({
      message: "description, amount and paid_by are required"
    });
  }

  try {
    // Insert expense into PostgreSQL
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