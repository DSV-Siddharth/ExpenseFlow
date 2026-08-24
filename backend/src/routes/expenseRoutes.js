import express from "express";
import { createExpense } from "../controllers/expenseController.js";

const router = express.Router();

router.post("/", createExpense);

export default router;