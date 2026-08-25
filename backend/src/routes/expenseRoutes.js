import express from "express";

import {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense
} from "../controllers/expenseController.js";

import validateExpense from "../middleware/validateExpense.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all expense routes with JWT authentication
router.use(authMiddleware);

// Create expense
router.post("/", validateExpense, createExpense);

// Get all expenses
router.get("/", getExpenses);

// Get single expense
router.get("/:id", getExpenseById);

// Update expense
router.put("/:id", validateExpense, updateExpense);

// Delete expense
router.delete("/:id", deleteExpense);

export default router;