import express from "express";

import {
  createExpense,
  getExpenses,
  getExpenseById
} from "../controllers/expenseController.js";

const router = express.Router();

router.post("/", createExpense);
router.get("/", getExpenses);
router.get("/:id", getExpenseById);

export default router;