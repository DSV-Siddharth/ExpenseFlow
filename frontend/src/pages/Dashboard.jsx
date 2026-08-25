import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Dashboard() {
  const { user, logout } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");

  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editPaidBy, setEditPaidBy] = useState("");

  const fetchExpenses = async () => {
    try {
      const response = await api.get("/expenses");
      setExpenses(response.data.expenses || []);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // =========================
  // ADD EXPENSE
  // =========================

  const handleAddExpense = async (e) => {
    e.preventDefault();

    setError("");
    setAdding(true);

    try {
      await api.post("/expenses", {
        description,
        amount: Number(amount),
        paid_by: paidBy,
      });

      setDescription("");
      setAmount("");
      setPaidBy("");

      await fetchExpenses();
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to add expense"
      );
    } finally {
      setAdding(false);
    }
  };

  // =========================
  // START EDIT
  // =========================

  const handleEditClick = (expense) => {
    setEditingId(expense.id);
    setEditDescription(expense.description);
    setEditAmount(expense.amount);
    setEditPaidBy(expense.paid_by);
    setError("");
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDescription("");
    setEditAmount("");
    setEditPaidBy("");
  };

  // =========================
  // UPDATE EXPENSE
  // =========================

  const handleUpdateExpense = async (id) => {
    setError("");

    try {
      await api.put(`/expenses/${id}`, {
        description: editDescription,
        amount: Number(editAmount),
        paid_by: editPaidBy,
      });

      handleCancelEdit();
      await fetchExpenses();
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update expense"
      );
    }
  };

  // =========================
  // DELETE EXPENSE
  // =========================

  const handleDeleteExpense = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await api.delete(`/expenses/${id}`);
      await fetchExpenses();
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to delete expense"
      );
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>ExpenseFlow</h1>
          <p>Welcome, {user?.name}</p>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </header>

      <main className="dashboard-content">
        {/* ADD EXPENSE */}

        <section className="add-expense-section">
          <h2>Add Expense</h2>

          <form onSubmit={handleAddExpense} className="expense-form">
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              required
            />

            <input
              type="text"
              placeholder="Paid by"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              required
            />

            <button type="submit" disabled={adding}>
              {adding ? "Adding..." : "Add Expense"}
            </button>
          </form>
        </section>

        {error && <p className="error-message">{error}</p>}

        {/* EXPENSE LIST */}

        <section className="expenses-section">
          <h2>Your Expenses</h2>

          {loading ? (
            <p>Loading expenses...</p>
          ) : expenses.length === 0 ? (
            <div className="empty-state">
              <h3>No expenses yet</h3>
              <p>Your expenses will appear here.</p>
            </div>
          ) : (
            <div className="expense-list">
              {expenses.map((expense) => (
                <div className="expense-card" key={expense.id}>
                  {editingId === expense.id ? (
                    <div className="edit-expense-form">
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) =>
                          setEditDescription(e.target.value)
                        }
                        placeholder="Description"
                      />

                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) =>
                          setEditAmount(e.target.value)
                        }
                        placeholder="Amount"
                        min="0"
                        step="0.01"
                      />

                      <input
                        type="text"
                        value={editPaidBy}
                        onChange={(e) =>
                          setEditPaidBy(e.target.value)
                        }
                        placeholder="Paid by"
                      />

                      <div className="edit-actions">
                        <button
                          className="save-button"
                          onClick={() =>
                            handleUpdateExpense(expense.id)
                          }
                        >
                          Save
                        </button>

                        <button
                          className="cancel-button"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="expense-info">
                        <h3>{expense.description}</h3>

                        <p>
                          Paid by: {expense.paid_by}
                        </p>
                      </div>

                      <div className="expense-right">
                        <strong>₹{expense.amount}</strong>

                        <div className="expense-actions">
                          <button
                            className="edit-button"
                            onClick={() =>
                              handleEditClick(expense)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleDeleteExpense(expense.id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;