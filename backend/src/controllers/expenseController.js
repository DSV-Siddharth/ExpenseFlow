export const createExpense = (req, res) => {
  console.log(req.body);

  res.json({
    message: "Expense received",
    expense: req.body
  });
};