import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ChevronRight,
  CreditCard,
  DollarSign,
  Edit3,
  LayoutDashboard,
  LogOut,
  Menu,
  PieChart,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const CATEGORY_NAMES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Other",
];

const CATEGORY_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#64748b",
];

function Dashboard() {
  const { user, logout } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [category, setCategory] = useState("Other");

  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchExpenses = async () => {
    try {
      setError("");

      const response = await api.get("/expenses");
      setExpenses(response.data.expenses || []);
    } catch (err) {
      console.error("Failed to fetch expenses:", err);

      setError(
        err.response?.data?.message || "Failed to load your expenses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const totalSpending = useMemo(() => {
    return expenses.reduce(
      (total, expense) => total + Number(expense.amount || 0),
      0
    );
  }, [expenses]);

  const averageExpense = useMemo(() => {
    if (expenses.length === 0) return 0;

    return totalSpending / expenses.length;
  }, [expenses, totalSpending]);

  const categoryData = useMemo(() => {
    const totals = {};

    expenses.forEach((expense) => {
      const expenseCategory = expense.category || "Other";

      totals[expenseCategory] =
        (totals[expenseCategory] || 0) +
        Number(expense.amount || 0);
    });

    return Object.entries(totals)
      .map(([name, value]) => {
        const categoryIndex = CATEGORY_NAMES.indexOf(name);

        return {
          name,
          value: Number(value.toFixed(2)),
          color:
            CATEGORY_COLORS[
              categoryIndex >= 0 ? categoryIndex : CATEGORY_COLORS.length - 1
            ],
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const monthlyData = useMemo(() => {
    const months = {};

    expenses.forEach((expense) => {
      const date = new Date(expense.created_at || expense.date);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const key = date.toLocaleDateString("en-US", {
        month: "short",
      });

      months[key] = (months[key] || 0) + Number(expense.amount || 0);
    });

    return Object.entries(months).map(([month, spending]) => ({
      month,
      spending: Number(spending.toFixed(2)),
    }));
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        expense.paid_by
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const expenseCategory = expense.category || "Other";

      const matchesCategory =
        categoryFilter === "All" ||
        expenseCategory === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, categoryFilter]);

  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => {
        const dateA = new Date(a.created_at || a.date || 0);
        const dateB = new Date(b.created_at || b.date || 0);

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [expenses]);

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Recently";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Recently";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setPaidBy("");
    setCategory("Other");
  };

  const handleAddExpense = async (event) => {
    event.preventDefault();

    if (
      !description.trim() ||
      !amount ||
      !paidBy.trim() ||
      !category
    ) {
      setError("Please fill in all expense fields.");
      return;
    }

    try {
      setAdding(true);
      setError("");

      await api.post("/expenses", {
        description: description.trim(),
        amount: Number(amount),
        paid_by: paidBy.trim(),
        category,
      });

      resetForm();
      setShowAddModal(false);

      await fetchExpenses();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add expense."
      );
    } finally {
      setAdding(false);
    }
  };

  const handleStartEdit = (expense) => {
    setEditingExpense({
      ...expense,
      category: expense.category || "Other",
    });

    setError("");
  };

  const handleUpdateExpense = async (event) => {
    event.preventDefault();

    if (!editingExpense) return;

    try {
      setUpdating(true);
      setError("");

      await api.put(`/expenses/${editingExpense.id}`, {
        description: editingExpense.description,
        amount: Number(editingExpense.amount),
        paid_by: editingExpense.paid_by,
        category: editingExpense.category || "Other",
      });

      setEditingExpense(null);

      await fetchExpenses();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update expense."
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/expenses/${id}`);

      await fetchExpenses();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete expense."
      );
    }
  };

  const handleLogout = () => {
    logout();
  };

  const navigation = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "expenses",
      label: "Expenses",
      icon: Wallet,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <div className="expenseflow-app">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`expenseflow-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Wallet size={20} />
          </div>

          <div>
            <h1>ExpenseFlow</h1>
            <span>Personal finance</span>
          </div>

          <button
            className="mobile-close-button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-navigation">
          <span className="navigation-label">MENU</span>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`navigation-item ${
                  activeSection === item.id ? "active" : ""
                }`}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>

                {activeSection === item.id && (
                  <ChevronRight
                    size={15}
                    className="navigation-arrow"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="user-info">
              <strong>{user?.name || "User"}</strong>
              <span>{user?.email || "Personal account"}</span>
            </div>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      <main className="expenseflow-main">
        <header className="topbar">
          <button
            className="mobile-menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="topbar-title">
            <span>Personal finance</span>
            <h2>
              {activeSection === "overview" && "Overview"}
              {activeSection === "expenses" && "Expenses"}
              {activeSection === "analytics" && "Analytics"}
              {activeSection === "settings" && "Settings"}
            </h2>
          </div>

          <button
            className="add-expense-button"
            onClick={() => {
              setError("");
              resetForm();
              setShowAddModal(true);
            }}
          >
            <Plus size={18} />
            Add expense
          </button>
        </header>

        <div className="dashboard-container">
          {error && (
            <div className="dashboard-alert">
              <span>{error}</span>

              <button onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}

          {activeSection === "overview" && (
            <>
              <section className="welcome-section">
                <div>
                  <span className="eyebrow">
                    YOUR MONEY, SIMPLIFIED
                  </span>

                  <h1>
                    Good to see you,{" "}
                    {user?.name?.split(" ")[0] || "there"}.
                  </h1>

                  <p>
                    Here's a clear look at where your money is going.
                  </p>
                </div>

                <div className="date-badge">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </div>
              </section>

              <section className="stats-grid">
                <div className="stat-card stat-card-primary">
                  <div className="stat-card-header">
                    <span>Total spending</span>

                    <div className="stat-icon">
                      <DollarSign size={18} />
                    </div>
                  </div>

                  <strong>{formatCurrency(totalSpending)}</strong>

                  <span className="stat-caption">
                    Across {expenses.length} expense
                    {expenses.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span>Expenses</span>

                    <div className="stat-icon soft-purple">
                      <CreditCard size={18} />
                    </div>
                  </div>

                  <strong>{expenses.length}</strong>

                  <span className="stat-caption">
                    Recorded transactions
                  </span>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span>Average expense</span>

                    <div className="stat-icon soft-green">
                      <TrendingUp size={18} />
                    </div>
                  </div>

                  <strong>{formatCurrency(averageExpense)}</strong>

                  <span className="stat-caption">
                    Average per transaction
                  </span>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span>Top category</span>

                    <div className="stat-icon soft-orange">
                      <ShoppingBag size={18} />
                    </div>
                  </div>

                  <strong>
                    {categoryData[0]?.name || "None"}
                  </strong>

                  <span className="stat-caption">
                    {categoryData[0]
                      ? formatCurrency(categoryData[0].value)
                      : "No spending yet"}
                  </span>
                </div>
              </section>

              <section className="dashboard-grid">
                <div className="panel chart-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Spending trend</h3>
                      <p>Your spending over time</p>
                    </div>

                    <BarChart3 size={19} />
                  </div>

                  <div className="chart-container">
                    {monthlyData.length === 0 ? (
                      <div className="chart-empty">
                        <BarChart3 size={30} />
                        <span>
                          Add expenses to see your trend.
                        </span>
                      </div>
                    ) : (
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <BarChart data={monthlyData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            width={45}
                          />

                          <Tooltip
                            formatter={(value) =>
                              formatCurrency(value)
                            }
                          />

                          <Bar
                            dataKey="spending"
                            radius={[6, 6, 0, 0]}
                            fill="#6366f1"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="panel category-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Categories</h3>
                      <p>Where your money goes</p>
                    </div>

                    <PieChart size={19} />
                  </div>

                  <div className="category-chart">
                    {categoryData.length === 0 ? (
                      <div className="chart-empty">
                        <PieChart size={30} />
                        <span>No categories yet.</span>
                      </div>
                    ) : (
                      <>
                        <div className="pie-wrapper">
                          <ResponsiveContainer
                            width="100%"
                            height="100%"
                          >
                            <RechartsPieChart>
                              <Pie
                                data={categoryData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={55}
                                outerRadius={82}
                                paddingAngle={3}
                              >
                                {categoryData.map((entry) => (
                                  <Cell
                                    key={entry.name}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>

                              <Tooltip
                                formatter={(value) =>
                                  formatCurrency(value)
                                }
                              />
                            </RechartsPieChart>
                          </ResponsiveContainer>

                          <div className="pie-center">
                            <strong>
                              {formatCurrency(totalSpending)}
                            </strong>
                            <span>Total</span>
                          </div>
                        </div>

                        <div className="category-list">
                          {categoryData.slice(0, 5).map((item) => (
                            <div
                              className="category-row"
                              key={item.name}
                            >
                              <div>
                                <span
                                  className="category-dot"
                                  style={{
                                    backgroundColor: item.color,
                                  }}
                                />

                                <span>{item.name}</span>
                              </div>

                              <strong>
                                {formatCurrency(item.value)}
                              </strong>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </section>

              <section className="panel recent-panel">
                <div className="panel-header">
                  <div>
                    <h3>Recent expenses</h3>
                    <p>Your latest transactions</p>
                  </div>

                  <button
                    className="text-button"
                    onClick={() => setActiveSection("expenses")}
                  >
                    View all
                    <ChevronRight size={16} />
                  </button>
                </div>

                {loading ? (
                  <div className="loading-state">
                    Loading your expenses...
                  </div>
                ) : recentExpenses.length === 0 ? (
                  <div className="empty-state">
                    <Wallet size={32} />
                    <h4>No expenses yet</h4>
                    <p>
                      Add your first expense to start tracking your
                      spending.
                    </p>

                    <button
                      className="empty-action"
                      onClick={() => {
                        resetForm();
                        setShowAddModal(true);
                      }}
                    >
                      <Plus size={17} />
                      Add expense
                    </button>
                  </div>
                ) : (
                  <div className="recent-list">
                    {recentExpenses.map((expense) => (
                      <div
                        className="recent-row"
                        key={expense.id}
                      >
                        <div className="expense-leading-icon">
                          <Wallet size={17} />
                        </div>

                        <div className="recent-description">
                          <strong>{expense.description}</strong>

                          <span>
                            {expense.category || "Other"} ·{" "}
                            {expense.paid_by} ·{" "}
                            {formatDate(
                              expense.created_at || expense.date
                            )}
                          </span>
                        </div>

                        <strong className="recent-amount">
                          {formatCurrency(expense.amount)}
                        </strong>

                        <div className="row-actions">
                          <button
                            onClick={() =>
                              handleStartEdit(expense)
                            }
                            title="Edit expense"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteExpense(expense.id)
                            }
                            title="Delete expense"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {activeSection === "expenses" && (
            <section className="expenses-page">
              <div className="page-heading">
                <div>
                  <span className="eyebrow">TRANSACTIONS</span>
                  <h1>All expenses</h1>
                  <p>
                    Search and manage everything you've spent.
                  </p>
                </div>

                <button
                  className="add-expense-button"
                  onClick={() => {
                    resetForm();
                    setShowAddModal(true);
                  }}
                >
                  <Plus size={18} />
                  Add expense
                </button>
              </div>

              <div className="filter-bar">
                <div className="search-box">
                  <Search size={18} />

                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(event.target.value)
                  }
                >
                  <option value="All">All categories</option>

                  {CATEGORY_NAMES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="panel expenses-table-panel">
                {loading ? (
                  <div className="loading-state">
                    Loading your expenses...
                  </div>
                ) : filteredExpenses.length === 0 ? (
                  <div className="empty-state">
                    <Search size={32} />
                    <h4>No matching expenses</h4>
                    <p>
                      Try changing your search or adding a new
                      expense.
                    </p>
                  </div>
                ) : (
                  <div className="expense-table">
                    <div className="expense-table-header">
                      <span>DESCRIPTION</span>
                      <span>CATEGORY</span>
                      <span>PAID BY</span>
                      <span>DATE</span>
                      <span>AMOUNT</span>
                      <span />
                    </div>

                    {filteredExpenses.map((expense) => (
                      <div
                        className="expense-table-row"
                        key={expense.id}
                      >
                        <div className="table-description">
                          <div className="expense-leading-icon">
                            <Wallet size={16} />
                          </div>

                          <strong>{expense.description}</strong>
                        </div>

                        <span>
                          {expense.category || "Other"}
                        </span>

                        <span>{expense.paid_by}</span>

                        <span>
                          {formatDate(
                            expense.created_at || expense.date
                          )}
                        </span>

                        <strong>
                          {formatCurrency(expense.amount)}
                        </strong>

                        <div className="table-actions">
                          <button
                            onClick={() =>
                              handleStartEdit(expense)
                            }
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteExpense(expense.id)
                            }
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {activeSection === "analytics" && (
            <section className="analytics-page">
              <div className="page-heading">
                <div>
                  <span className="eyebrow">INSIGHTS</span>
                  <h1>Analytics</h1>
                  <p>
                    Understand your spending patterns at a glance.
                  </p>
                </div>
              </div>

              <section className="stats-grid analytics-stats">
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span>Total spending</span>

                    <div className="stat-icon">
                      <DollarSign size={18} />
                    </div>
                  </div>

                  <strong>{formatCurrency(totalSpending)}</strong>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span>Transactions</span>

                    <div className="stat-icon soft-purple">
                      <CreditCard size={18} />
                    </div>
                  </div>

                  <strong>{expenses.length}</strong>
                </div>

                <div className="stat-card">
                  <div className="stat-card-header">
                    <span>Average</span>

                    <div className="stat-icon soft-green">
                      <TrendingUp size={18} />
                    </div>
                  </div>

                  <strong>{formatCurrency(averageExpense)}</strong>
                </div>
              </section>

              <section className="dashboard-grid">
                <div className="panel chart-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Monthly spending</h3>
                      <p>Compare your spending by month</p>
                    </div>
                  </div>

                  <div className="analytics-chart-container">
                    {monthlyData.length === 0 ? (
                      <div className="chart-empty">
                        <BarChart3 size={30} />
                        <span>No spending data yet.</span>
                      </div>
                    ) : (
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <BarChart data={monthlyData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                          />

                          <Tooltip
                            formatter={(value) =>
                              formatCurrency(value)
                            }
                          />

                          <Bar
                            dataKey="spending"
                            fill="#6366f1"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="panel category-panel">
                  <div className="panel-header">
                    <div>
                      <h3>Spending by category</h3>
                      <p>Your biggest spending areas</p>
                    </div>
                  </div>

                  <div className="analytics-category-list">
                    {categoryData.length === 0 ? (
                      <div className="chart-empty">
                        <PieChart size={30} />
                        <span>No category data yet.</span>
                      </div>
                    ) : (
                      categoryData.map((item) => {
                        const percentage =
                          totalSpending > 0
                            ? (item.value / totalSpending) * 100
                            : 0;

                        return (
                          <div
                            className="analytics-category-row"
                            key={item.name}
                          >
                            <div className="analytics-category-top">
                              <div>
                                <span
                                  className="category-dot"
                                  style={{
                                    backgroundColor: item.color,
                                  }}
                                />

                                <strong>{item.name}</strong>
                              </div>

                              <span>
                                {formatCurrency(item.value)}
                              </span>
                            </div>

                            <div className="progress-track">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: item.color,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </section>
            </section>
          )}

          {activeSection === "settings" && (
            <section className="settings-page">
              <div className="page-heading">
                <div>
                  <span className="eyebrow">PREFERENCES</span>
                  <h1>Settings</h1>
                  <p>Manage your ExpenseFlow account.</p>
                </div>
              </div>

              <div className="settings-grid">
                <div className="panel settings-card">
                  <div className="settings-card-heading">
                    <div className="settings-icon">
                      <Settings size={19} />
                    </div>

                    <div>
                      <h3>Profile</h3>
                      <p>Your account information</p>
                    </div>
                  </div>

                  <div className="profile-details">
                    <div>
                      <span>Name</span>
                      <strong>
                        {user?.name || "Not available"}
                      </strong>
                    </div>

                    <div>
                      <span>Email</span>
                      <strong>
                        {user?.email || "Not available"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="panel settings-card">
                  <div className="settings-card-heading">
                    <div className="settings-icon">
                      <Wallet size={19} />
                    </div>

                    <div>
                      <h3>Account</h3>
                      <p>Manage your ExpenseFlow session</p>
                    </div>
                  </div>

                  <button
                    className="settings-logout-button"
                    onClick={handleLogout}
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {showAddModal && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAddModal(false);
              resetForm();
            }
          }}
        >
          <div className="expense-modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">NEW TRANSACTION</span>
                <h2>Add expense</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleAddExpense}>
              <label>
                Description

                <input
                  type="text"
                  placeholder="e.g. Dinner with friends"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  required
                />
              </label>

              <label>
                Amount

                <div className="amount-input">
                  <span>₹</span>

                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value)
                    }
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </label>

              <label>
                Category

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  required
                >
                  {CATEGORY_NAMES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Paid by

                <input
                  type="text"
                  placeholder="e.g. Siddharth"
                  value={paidBy}
                  onChange={(event) =>
                    setPaidBy(event.target.value)
                  }
                  required
                />
              </label>

              <button
                className="modal-submit"
                type="submit"
                disabled={adding}
              >
                {adding ? "Adding..." : "Add expense"}
              </button>
            </form>
          </div>
        </div>
      )}

      {editingExpense && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEditingExpense(null);
            }
          }}
        >
          <div className="expense-modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">EDIT TRANSACTION</span>
                <h2>Edit expense</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setEditingExpense(null)}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleUpdateExpense}>
              <label>
                Description

                <input
                  type="text"
                  value={editingExpense.description || ""}
                  onChange={(event) =>
                    setEditingExpense({
                      ...editingExpense,
                      description: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Amount

                <div className="amount-input">
                  <span>₹</span>

                  <input
                    type="number"
                    value={editingExpense.amount || ""}
                    onChange={(event) =>
                      setEditingExpense({
                        ...editingExpense,
                        amount: event.target.value,
                      })
                    }
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </label>

              <label>
                Category

                <select
                  value={editingExpense.category || "Other"}
                  onChange={(event) =>
                    setEditingExpense({
                      ...editingExpense,
                      category: event.target.value,
                    })
                  }
                  required
                >
                  {CATEGORY_NAMES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Paid by

                <input
                  type="text"
                  value={editingExpense.paid_by || ""}
                  onChange={(event) =>
                    setEditingExpense({
                      ...editingExpense,
                      paid_by: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <button
                className="modal-submit"
                type="submit"
                disabled={updating}
              >
                {updating ? "Saving..." : "Save changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;