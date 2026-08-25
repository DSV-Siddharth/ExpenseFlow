import express from "express";

import expenseRoutes from "./routes/expenseRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("ExpenseFlow API is running");
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Expense routes
app.use("/api/expenses", expenseRoutes);

// Centralized error handling middleware
app.use(errorMiddleware);

export default app;