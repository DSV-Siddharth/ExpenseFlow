import express from "express";
import cors from "cors";

import expenseRoutes from "./routes/expenseRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON request bodies
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