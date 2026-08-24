import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("ExpenseFlow API is running");
});

app.post("/api/expenses", (req, res) => {
  console.log(req.body);

  res.json({
    message: "Expense received",
    expense: req.body
  });
});

export default app;