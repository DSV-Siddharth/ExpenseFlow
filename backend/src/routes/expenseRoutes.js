import express from "express";

import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
} from "../controllers/expenseController.js";

const router = express.Router();

// CREATE EXPENSE
router.post("/", createExpense);

// GET ALL EXPENSES
router.get("/", getExpenses);

// GET ONE EXPENSE
router.get("/:id", getExpenseById);

// UPDATE EXPENSE
router.put("/:id", updateExpense);

// DELETE EXPENSE
router.delete("/:id", deleteExpense);

export default router;