import { useState, useEffect } from "react";
import DesktopLayout from "../components/DesktopLayout";
import { api } from "../api/client";

const card = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 18,
  padding: 16,
  backdropFilter: "blur(6px)",
};

const button = {
  padding: "8px 16px",
  borderRadius: 10,
  border: "1px solid rgba(131, 200, 219, 0.45)",
  background: "linear-gradient(145deg, rgba(167, 216, 230, 0.18), rgba(118, 193, 216, 0.12))",
  color: "var(--text)",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 700,
};

const actionButton = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--surface-soft)",
  color: "var(--text)",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 500,
};

const modal = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.62)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  backdropFilter: "blur(8px)",
};

const modalContent = {
  background: "var(--surface-strong)",
  borderRadius: 18,
  padding: 24,
  minWidth: 400,
  maxWidth: 500,
  border: "1px solid var(--border)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
};

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--login-input-bg)",
  color: "var(--text)",
  fontSize: 14,
  marginTop: 8,
  boxSizing: "border-box",
};

const label = {
  display: "block",
  color: "var(--text-muted)",
  fontSize: 14,
  fontWeight: 500,
  marginBottom: 4,
};

const errorText = {
  color: "var(--danger)",
  fontSize: 12,
  marginTop: 8,
};

const isValidCurrencyAmount = (value) => /^\d+(\.\d{1,2})?$/.test(value.trim());

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showBudgetSelector, setShowBudgetSelector] = useState(false);
  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showEditTransactionModal, setShowEditTransactionModal] = useState(false);


  const [budgetName, setBudgetName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryLimit, setCategoryLimit] = useState("");
  const [transactionNote, setTransactionNote] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionCategory, setTransactionCategory] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [editBudgetId, setEditBudgetId] = useState(null);
  const [editBudgetName, setEditBudgetName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryLimit, setEditCategoryLimit] = useState("");
  const [editTransactionId, setEditTransactionId] = useState(null);
  const [editTransactionNote, setEditTransactionNote] = useState("");
  const [editTransactionAmount, setEditTransactionAmount] = useState("");
  const [editTransactionCategory, setEditTransactionCategory] = useState("");
  const [editTransactionDate, setEditTransactionDate] = useState("");

  const selectBudget = async (budget) => {
    setCurrentBudget(budget);
    await api.setCurrentBudgetId(budget.id);
  };
  
  useEffect(() => {
    loadBudgets();
  }, []);

  // Load categories and transactions when budget changes
  useEffect(() => {
    if (currentBudget) {
      loadCategories();
      loadTransactions();
    }
  }, [currentBudget]);

  useEffect(() => {
    const handler = () => {
      loadBudgets();
      if (currentBudget) {
        loadCategories();
        loadTransactions();
      }
    };

    window.addEventListener("budget-data-updated", handler);
    return () => window.removeEventListener("budget-data-updated", handler);
  }, [currentBudget]);

  const loadBudgets = async () => {
    try {
      const data = await api.getBudgets();
      setBudgets(data);
      const storedBudgetId = await api.getCurrentBudgetId();
      const storedBudget = data.find((b) => b.id === storedBudgetId);
      if (storedBudget) {
        setCurrentBudget(storedBudget);
      } else if (data.length > 0 && !currentBudget) {
        await selectBudget(data[0]);
      }
    } catch (error) {
      console.error("Failed to load budgets:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.getCategories(currentBudget.id);
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await api.getTransactions(currentBudget.id);
      // Sort in reverse chronological order
      const sorted = data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setTransactions(sorted);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    }
  };

  const handleCreateBudget = async () => {
    try {
      const newBudget = await api.createBudget({ name: budgetName });
      setBudgets([...budgets, newBudget]);
      await selectBudget(newBudget);
      setBudgetName("");
      setShowBudgetModal(false);
    } catch (error) {
      console.error("Failed to create budget:", error);
      alert("Failed to create budget: " + error.message);
    }
  };

  const openEditBudget = (budget) => {
    setShowBudgetSelector(false);
    setEditBudgetId(budget.id);
    setEditBudgetName(budget.name);
    setShowEditBudgetModal(true);
  };

  const handleUpdateBudget = async () => {
    try {
      const updated = await api.updateBudget(editBudgetId, {
        name: editBudgetName,
      });
      setBudgets(budgets.map((b) => (b.id === updated.id ? updated : b)));
      if (currentBudget?.id === updated.id) {
        setCurrentBudget(updated);
      }
      setShowEditBudgetModal(false);
      setEditBudgetId(null);
      setEditBudgetName("");
    } catch (error) {
      console.error("Failed to update budget:", error);
      alert("Failed to update budget: " + error.message);
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    const budget = budgets.find((b) => b.id === budgetId);
    if (!budget) return;
    const confirmed = window.confirm(
      `Delete budget "${budget.name}"? This removes its categories and transactions.`
    );
    if (!confirmed) return;

    try {
      await api.deleteBudget(budgetId);
      const remaining = budgets.filter((b) => b.id !== budgetId);
      setBudgets(remaining);
      if (currentBudget?.id === budgetId) {
        setCurrentBudget(remaining[0] || null);
      }
      setShowBudgetSelector(false);
    } catch (error) {
      console.error("Failed to delete budget:", error);
      alert("Failed to delete budget: " + error.message);
    }
  };

  const handleCreateCategory = async () => {
    try {
      const newCategory = await api.createCategory(currentBudget.id, {
        name: categoryName,
        limit: parseFloat(categoryLimit),
      });
      setCategories([...categories, newCategory]);
      setCategoryName("");
      setCategoryLimit("");
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Failed to create category:", error);
      alert("Failed to create category: " + error.message);
    }
  };

  const openEditCategory = (category) => {
    setEditCategoryId(category.id);
    setEditCategoryName(category.name);
    setEditCategoryLimit(String(category.limit));
    setShowEditCategoryModal(true);
  };

  const handleUpdateCategory = async () => {
    try {
      const updated = await api.updateCategory(currentBudget.id, editCategoryId, {
        name: editCategoryName,
        limit: parseFloat(editCategoryLimit),
      });
      setCategories(
        categories.map((c) => (c.id === updated.id ? updated : c))
      );
      setShowEditCategoryModal(false);
      setEditCategoryId(null);
      setEditCategoryName("");
      setEditCategoryLimit("");
    } catch (error) {
      console.error("Failed to update category:", error);
      alert("Failed to update category: " + error.message);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;
    const confirmed = window.confirm(
      `Delete category "${category.name}"? This will also delete all transactions in this category.`
    );
    if (!confirmed) return;

    try {
      await api.deleteCategory(currentBudget.id, categoryId);
      setCategories(categories.filter((c) => c.id !== categoryId));
      setTransactions(transactions.filter((t) => t.categoryId !== categoryId));
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category: " + error.message);
    }
  };

  const handleCreateTransaction = async () => {
    if (!isValidCurrencyAmount(transactionAmount)) {
      alert("Please enter a valid amount in dollars and cents, like 10.00.");
      return;
    }

    try {
      const newTransaction = await api.createTransaction(currentBudget.id, {
        note: transactionNote,
        amount: parseFloat(transactionAmount),
        categoryId: parseInt(transactionCategory),
        date: transactionDate,
      });
      setTransactions([newTransaction, ...transactions]);
      setTransactionNote("");
      setTransactionAmount("");
      setTransactionCategory("");
      setTransactionDate(new Date().toISOString().split("T")[0]);
      setShowTransactionModal(false);
    } catch (error) {
      console.error("Failed to create transaction:", error);
      alert("Failed to create transaction: " + error.message);
    }
  };

  const openEditTransaction = (transaction) => {
    setEditTransactionId(transaction.id);
    setEditTransactionNote(transaction.note);
    setEditTransactionAmount(String(transaction.amount));
    setEditTransactionCategory(String(transaction.categoryId));
    setEditTransactionDate(transaction.date);
    setShowEditTransactionModal(true);
  };

  const handleUpdateTransaction = async () => {
    if (!isValidCurrencyAmount(editTransactionAmount)) {
      alert("Please enter a valid amount in dollars and cents, like 10.00.");
      return;
    }

    try {
      const updated = await api.updateTransaction(currentBudget.id, editTransactionId, {
        note: editTransactionNote,
        amount: parseFloat(editTransactionAmount),
        categoryId: parseInt(editTransactionCategory),
        date: editTransactionDate,
      });
      setTransactions(
        transactions.map((t) => (t.id === updated.id ? updated : t))
      );
      setShowEditTransactionModal(false);
      setEditTransactionId(null);
      setEditTransactionNote("");
      setEditTransactionAmount("");
      setEditTransactionCategory("");
      setEditTransactionDate("");
    } catch (error) {
      console.error("Failed to update transaction:", error);
      alert("Failed to update transaction: " + error.message);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (!transaction) return;
    const confirmed = window.confirm(
      `Delete transaction "${transaction.note}"?`
    );
    if (!confirmed) return;

    try {
      await api.deleteTransaction(currentBudget.id, transactionId);
      setTransactions(transactions.filter((t) => t.id !== transactionId));
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      alert("Failed to delete transaction: " + error.message);
    }
  };

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getTransactionsByCategory = (categoryId) => {
    return transactions.filter((t) => t.categoryId === categoryId);
  };

  const getCategoryTotal = (categoryId) => {
    return getTransactionsByCategory(categoryId).reduce(
      (sum, t) => sum + t.amount,
      0
    );
  };

  return (
    <DesktopLayout title="Budget">
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <button style={button} onClick={() => setShowBudgetModal(true)}>
            + Create Budget
          </button>
          {currentBudget && (
            <>
              <button style={button} onClick={() => setShowCategoryModal(true)}>
                + Create Category
              </button>
              <button style={button} onClick={() => setShowTransactionModal(true)}>
                + Create Transaction
              </button>
              <button style={{ ...button, marginLeft: "auto" }} onClick={() => setShowBudgetSelector(true)}>
                Budget: {currentBudget.name} ▼
              </button>
            </>
          )}
        </div>

        {!currentBudget ? (
          <div style={{ ...card, padding: 32, textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: 0 }}>
              No budget selected. Create a budget to get started.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 0.95fr) minmax(360px, 1.05fr)", gap: 16, alignItems: "start" }}>
              <div style={card}>
                <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                  Categories
                </div>
                {categories.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
                    No categories yet. Create one to organize transactions.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {categories.map((category) => {
                      const total = getCategoryTotal(category.id);
                      const isExpanded = expandedCategories.has(category.id);
                      const categoryTransactions = getTransactionsByCategory(category.id);
                      const progress = category.limit ? Math.min((total / category.limit) * 100, 100) : 0;

                      return (
                        <div key={category.id} style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--surface-soft)" }}>
                          <div
                            style={{
                              padding: 12,
                              cursor: "pointer",
                              display: "grid",
                              gap: 10,
                            }}
                            onClick={() => toggleCategory(category.id)}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                  <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0, marginTop: 4 }}>{isExpanded ? "▾" : "▸"}</span>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: 17, lineHeight: 1.25, whiteSpace: "normal", overflowWrap: "anywhere" }}>
                                      {category.name}
                                    </div>
                                    <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>
                                      {categoryTransactions.length} transaction{categoryTransactions.length === 1 ? "" : "s"}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                                <button style={actionButton} onClick={(e) => { e.stopPropagation(); openEditCategory(category); }}>Edit</button>
                                <button style={{ ...actionButton, color: "var(--danger)" }} onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id); }}>Delete</button>
                              </div>
                            </div>

                            <div style={{ display: "grid", gap: 8 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
                                <span style={{ color: "var(--text-muted)" }}>${total.toFixed(2)}</span>
                                <span style={{ color: "var(--text-muted)" }}>${category.limit.toFixed(2)}</span>
                              </div>
                              <div style={{ height: 6, borderRadius: 999, background: "var(--surface-soft)", border: "1px solid var(--border)", overflow: "hidden" }}>
                                <div
                                  style={{
                                    width: `${progress}%`,
                                    height: "100%",
                                    borderRadius: 999,
                                    background: total > category.limit ? "var(--danger)" : "var(--accent)",
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {isExpanded && categoryTransactions.length > 0 && (
                            <div style={{ padding: "0 12px 12px", display: "grid", gap: 6 }}>
                              {categoryTransactions.map((transaction) => (
                                <div key={transaction.id} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{transaction.note}</div>
                                    <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 3 }}>
                                      {new Date(transaction.date).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                                    <div style={{ fontWeight: 700, color: "var(--danger)" }}>${transaction.amount.toFixed(2)}</div>
                                    <button style={actionButton} onClick={(e) => { e.stopPropagation(); openEditTransaction(transaction); }}>Edit</button>
                                    <button style={{ ...actionButton, color: "var(--danger)" }} onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(transaction.id); }}>Delete</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={card}>
                <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                  All Transactions
                </div>

                {transactions.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
                    No transactions yet. Create a transaction to start tracking your expenses.
                  </p>
                ) : (
                  <div style={{ maxHeight: 460, overflowY: "auto", paddingRight: 4, display: "grid", gap: 8 }}>
                    {transactions.map((transaction) => {
                      const category = categories.find((item) => item.id === transaction.categoryId);

                      return (
                        <div
                          key={transaction.id}
                          style={{
                            padding: 12,
                            background: "var(--surface-soft)",
                            borderRadius: 10,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                            border: "1px solid var(--border)",
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {transaction.note}
                            </div>
                            <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 3 }}>
                              {category?.name || "Unknown"} • {new Date(transaction.date).toLocaleDateString()}
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                            <div style={{ fontWeight: 700, color: "var(--danger)" }}>
                              ${transaction.amount.toFixed(2)}
                            </div>
                            <button style={actionButton} onClick={() => openEditTransaction(transaction)}>
                              Edit
                            </button>
                            <button
                              style={{ ...actionButton, color: "var(--danger)" }}
                              onClick={() => handleDeleteTransaction(transaction.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Budget Modal */}
      {showBudgetModal && (
        <div style={modal} onClick={() => setShowBudgetModal(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 20px 0", fontSize: 20 }}>
              Create Budget
            </h2>
            <div style={{ marginBottom: 20 }}>
              <label style={label}>Budget Name</label>
              <input
                type="text"
                style={input}
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && budgetName.trim()) {
                    handleCreateBudget();
                  }
                }}
                placeholder="e.g., This Month's Budget"
              />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                style={{
                  ...button,
                  background: "transparent",
                  color: "var(--text-muted)",
                }}
                onClick={() => setShowBudgetModal(false)}
              >
                Cancel
              </button>
              <button
                style={button}
                onClick={handleCreateBudget}
                disabled={!budgetName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {showCategoryModal && (
        <div style={modal} onClick={() => setShowCategoryModal(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 20px 0", fontSize: 20 }}>
              Create Category
            </h2>
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Category Name</label>
              <input
                type="text"
                style={input}
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && categoryName.trim() && categoryLimit) {
                    handleCreateCategory();
                  }
                }}
                placeholder="e.g., Groceries, Transportation"
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={label}>Budget Limit</label>
              <input
                type="number"
                step="0.01"
                style={input}
                value={categoryLimit}
                onChange={(e) => setCategoryLimit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && categoryName.trim() && categoryLimit) {
                    handleCreateCategory();
                  }
                }}
                placeholder="e.g., 500.00"
              />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                style={{
                  ...button,
                  background: "transparent",
                  color: "var(--text-muted)",
                }}
                onClick={() => setShowCategoryModal(false)}
              >
                Cancel
              </button>
              <button
                style={button}
                onClick={handleCreateCategory}
                disabled={!categoryName.trim() || !categoryLimit}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Transaction Modal */}
      {showTransactionModal && (
        <div style={modal} onClick={() => setShowTransactionModal(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 20px 0", fontSize: 20 }}>
              Create Transaction
            </h2>
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Note</label>
              <input
                type="text"
                style={input}
                value={transactionNote}
                onChange={(e) => setTransactionNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && transactionNote.trim() && transactionAmount && transactionCategory && transactionDate) {
                    handleCreateTransaction();
                  }
                }}
                placeholder="e.g., Weekly groceries"
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Amount</label>
              <input
                type="text"
                inputMode="decimal"
                style={input}
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    transactionNote.trim() &&
                    isValidCurrencyAmount(transactionAmount) &&
                    transactionCategory &&
                    transactionDate
                  ) {
                    handleCreateTransaction();
                  }
                }}
                placeholder="e.g., 10.00"
              />
              {transactionAmount && !isValidCurrencyAmount(transactionAmount) && (
                <div style={errorText}>
                  Enter a valid amount in dollars and cents, like 10.00.
                </div>
              )}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Category</label>
              <select
                style={input}
                value={transactionCategory}
                onChange={(e) => setTransactionCategory(e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={label}>Date</label>
              <input
                type="date"
                style={input}
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && transactionNote.trim() && transactionAmount && transactionCategory && transactionDate) {
                    handleCreateTransaction();
                  }
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                style={{
                  ...button,
                  background: "transparent",
                  color: "var(--text-muted)",
                }}
                onClick={() => setShowTransactionModal(false)}
              >
                Cancel
              </button>
              <button
                style={button}
                onClick={handleCreateTransaction}
                disabled={
                  !transactionNote.trim() ||
                  !isValidCurrencyAmount(transactionAmount) ||
                  !transactionCategory ||
                  !transactionDate
                }
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {showEditBudgetModal && (
        <div style={modal} onClick={() => setShowEditBudgetModal(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 20px 0", fontSize: 20 }}>
              Edit Budget
            </h2>
            <div style={{ marginBottom: 20 }}>
              <label style={label}>Budget Name</label>
              <input
                type="text"
                style={input}
                value={editBudgetName}
                onChange={(e) => setEditBudgetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editBudgetName.trim()) {
                    handleUpdateBudget();
                  }
                }}
                placeholder="e.g., Monthly Budget"
              />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                style={{
                  ...button,
                  background: "transparent",
                  color: "var(--text-muted)",
                }}
                onClick={() => setShowEditBudgetModal(false)}
              >
                Cancel
              </button>
              <button
                style={button}
                onClick={handleUpdateBudget}
                disabled={!editBudgetName.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && (
        <div style={modal} onClick={() => setShowEditCategoryModal(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 20px 0", fontSize: 20 }}>
              Edit Category
            </h2>
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Category Name</label>
              <input
                type="text"
                style={input}
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editCategoryName.trim() && editCategoryLimit) {
                    handleUpdateCategory();
                  }
                }}
                placeholder="e.g., Groceries, Transportation"
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={label}>Budget Limit</label>
              <input
                type="Decimal"
                step="0.01"
                style={input}
                value={editCategoryLimit}
                onChange={(e) => setEditCategoryLimit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editCategoryName.trim() && editCategoryLimit) {
                    handleUpdateCategory();
                  }
                }}
                placeholder="e.g., 500.00"
              />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                style={{
                  ...button,
                  background: "transparent",
                  color: "var(--text-muted)",
                }}
                onClick={() => setShowEditCategoryModal(false)}
              >
                Cancel
              </button>
              <button
                style={button}
                onClick={handleUpdateCategory}
                disabled={!editCategoryName.trim() || !editCategoryLimit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditTransactionModal && (
        <div style={modal} onClick={() => setShowEditTransactionModal(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 20px 0", fontSize: 20 }}>
              Edit Transaction
            </h2>
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Note</label>
              <input
                type="text"
                style={input}
                value={editTransactionNote}
                onChange={(e) => setEditTransactionNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editTransactionNote.trim() && editTransactionAmount && editTransactionCategory && editTransactionDate) {
                    handleUpdateTransaction();
                  }
                }}
                placeholder="e.g., Weekly groceries"
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Amount</label>
              <input
                type="text"
                inputMode="decimal"
                style={input}
                value={editTransactionAmount}
                onChange={(e) => setEditTransactionAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    editTransactionNote.trim() &&
                    isValidCurrencyAmount(editTransactionAmount) &&
                    editTransactionCategory &&
                    editTransactionDate
                  ) {
                    handleUpdateTransaction();
                  }
                }}
                placeholder="e.g., 10.00"
              />
              {editTransactionAmount && !isValidCurrencyAmount(editTransactionAmount) && (
                <div style={errorText}>
                  Enter a valid amount in dollars and cents, like 10.00.
                </div>
              )}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Category</label>
              <select
                style={input}
                value={editTransactionCategory}
                onChange={(e) => setEditTransactionCategory(e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={label}>Date</label>
              <input
                type="date"
                style={input}
                value={editTransactionDate}
                onChange={(e) => setEditTransactionDate(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editTransactionNote.trim() && editTransactionAmount && editTransactionCategory && editTransactionDate) {
                    handleUpdateTransaction();
                  }
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                style={{
                  ...button,
                  background: "transparent",
                  color: "var(--text-muted)",
                }}
                onClick={() => setShowEditTransactionModal(false)}
              >
                Cancel
              </button>
              <button
                style={button}
                onClick={handleUpdateTransaction}
                disabled={
                  !editTransactionNote.trim() ||
                  !isValidCurrencyAmount(editTransactionAmount) ||
                  !editTransactionCategory ||
                  !editTransactionDate
                }
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Selector Modal */}
      {showBudgetSelector && (
        <div style={modal} onClick={() => setShowBudgetSelector(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 20px 0", fontSize: 20 }}>
              Select Budget
            </h2>
            <div style={{ display: "grid", gap: 8 }}>
              {budgets.map((budget) => (
                <div
                  key={budget.id}
                  style={{
                    padding: 12,
                    background:
                      currentBudget?.id === budget.id ? "rgba(77, 174, 203, 0.14)" : "var(--surface-soft)",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontWeight: currentBudget?.id === budget.id ? 700 : 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    border: "1px solid var(--border)",
                  }}
                  onClick={() => {
                    selectBudget(budget);
                    setShowBudgetSelector(false);
                  }}
                >
                  <span>{budget.name}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      style={actionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowBudgetSelector(false);
                        openEditBudget(budget);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      style={{ ...actionButton, color: "var(--danger)" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBudget(budget.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DesktopLayout>
  );
}
