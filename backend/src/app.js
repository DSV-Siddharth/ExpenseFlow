import express from "express";
import expenseRoutes from "./routes/expenseRoutes.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("ExpenseFlow API is running");
});

app.use("/api/expenses", expenseRoutes);

export default app;