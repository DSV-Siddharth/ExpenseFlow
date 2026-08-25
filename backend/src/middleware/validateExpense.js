const validateExpense = (req, res, next) => {
  const { description, amount, paid_by } = req.body;

  // Check description
  if (!description || description.trim() === "") {
    return res.status(400).json({
      message: "Description is required"
    });
  }

  // Check amount
  if (amount === undefined || amount === null || amount === "") {
    return res.status(400).json({
      message: "Amount is required"
    });
  }

  if (isNaN(amount)) {
    return res.status(400).json({
      message: "Amount must be a number"
    });
  }

  if (Number(amount) <= 0) {
    return res.status(400).json({
      message: "Amount must be greater than 0"
    });
  }

  // Check paid_by
  if (!paid_by || paid_by.trim() === "") {
    return res.status(400).json({
      message: "Paid by is required"
    });
  }

  next();
};

export default validateExpense;