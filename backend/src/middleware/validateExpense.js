const validateExpense = (req, res, next) => {
  const { description, amount, paid_by, category } = req.body;

  // Check description
  if (!description || description.trim() === "") {
    return res.status(400).json({
      message: "Description is required",
    });
  }

  // Check amount
  if (amount === undefined || amount === null || amount === "") {
    return res.status(400).json({
      message: "Amount is required",
    });
  }

  if (isNaN(amount)) {
    return res.status(400).json({
      message: "Amount must be a number",
    });
  }

  if (Number(amount) <= 0) {
    return res.status(400).json({
      message: "Amount must be greater than 0",
    });
  }

  // Check paid_by
  if (!paid_by || paid_by.trim() === "") {
    return res.status(400).json({
      message: "Paid by is required",
    });
  }

  // Category is optional.
  // If frontend doesn't send it, controller will use "Other".
  if (category !== undefined && category !== null && category.trim() === "") {
    return res.status(400).json({
      message: "Category cannot be empty",
    });
  }

  next();
};

export default validateExpense;