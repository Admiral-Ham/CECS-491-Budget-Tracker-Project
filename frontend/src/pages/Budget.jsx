import { useState, useEffect } from "react";
import DesktopLayout from "../components/DesktopLayout";
import { api } from "../api/client";

const card = {
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 16,
};

const button = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(59, 130, 246, 0.1)",
  color: "#60a5fa",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 500,
};

const actionButton = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.06)",
  color: "#e2e8f0",
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
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContent = {
  background: "#1e293b",
  borderRadius: 16,
  padding: 24,
  minWidth: 400,
  maxWidth: 500,
  border: "1px solid rgba(255,255,255,0.1)",
};

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "#0f172a",
  color: "white",
  fontSize: 14,
  marginTop: 8,
  boxSizing: "border-box",
};

const label = {
  display: "block",
  color: "#94a3b8",
  fontSize: 14,
  fontWeight: 500,
  marginBottom: 4,
};

const errorText = {
  color: "#fca5a5",
  fontSize: 12,
  marginTop: 8,
};

const isValidCurrencyAmount = (value) => /^\d+\.\d{2}$/.test(value.trim());

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

  const [editBudgetId, setEditBudgetId] = useState(null);
  const [editBudgetName, setEditBudgetName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryLimit, setEditCategoryLimit] = useState("");
  const [editTransactionId, setEditTransactionId] = useState(null);
  const [editTransactionNote, setEditTransactionNote] = useState("");
  const [editTransactionAmount, setEditTransactionAmount] = useState("");
  const [editTransactionCategory, setEditTransactionCategory] = useState("");

  const selectBudget = async (budget) => {
    setCurrentBudget(budget);
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  useEffect(() => {
    if (currentBudget) {
      loadCategories();
      loadTransactions();
    }
  }, [currentBudget]);

  const loadBudgets = async () => {
    try {
      const data = await api.getBudgets();
      setBudgets(data);

      if (data.length > 0 && !currentBudget) {
        setCurrentBudget(data[0]);
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
      const data = await api.getTransactions();

      const filtered = data.filter(
        (t) => t.budget_id === currentBudget.id
      );

      const sorted = filtered.sort(
        (a, b) => new Date(b.creation_time) - new Date(a.creation_time)
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
        budget_name: currentBudget.name,
        name: categoryName,
        limit: parseFloat(categoryLimit),
        spent: 0.0,
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
      const updated = await api.updateCategory(editCategoryId, {
        name: editCategoryName,
        limit: parseFloat(editCategoryLimit),
      });
      setCategories(categories.map((c) => (c.id === updated.id ? updated : c)));
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
      `Delete category "${category.name}"?`
    );
    if (!confirmed) return;

    try {
      await api.deleteCategory(categoryId);
      setCategories(categories.filter((c) => c.id !== categoryId));
      setTransactions(transactions.filter((t) => t.category_id !== categoryId));
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
      const newTransaction = await api.createTransaction({
        budget_id: currentBudget.id,
        category_id: transactionCategory,
        name: transactionNote,
        amount: parseFloat(transactionAmount),
      });

      setTransactions([newTransaction, ...transactions]);
      setTransactionNote("");
      setTransactionAmount("");
      setTransactionCategory("");
      setShowTransactionModal(false);
    } catch (error) {
      console.error("Failed to create transaction:", error);
      alert("Failed to create transaction: " + error.message);
    }
  };

  const openEditTransaction = (transaction) => {
    setEditTransactionId(transaction.id);
    setEditTransactionNote(transaction.name);
    setEditTransactionAmount(String(transaction.amount));
    setEditTransactionCategory(String(transaction.category_id));
    setShowEditTransactionModal(true);
  };

  const handleUpdateTransaction = async () => {
    if (!isValidCurrencyAmount(editTransactionAmount)) {
      alert("Please enter a valid amount in dollars and cents, like 10.00.");
      return;
    }

    try {
      const updated = await api.updateTransaction(editTransactionId, {
        budget_id: currentBudget.id,
        category_id: editTransactionCategory,
        name: editTransactionNote,
        amount: parseFloat(editTransactionAmount),
      });

      setTransactions(
        transactions.map((t) => (t.id === updated.id ? updated : t))
      );
      setShowEditTransactionModal(false);
      setEditTransactionId(null);
      setEditTransactionNote("");
      setEditTransactionAmount("");
      setEditTransactionCategory("");
    } catch (error) {
      console.error("Failed to update transaction:", error);
      alert("Failed to update transaction: " + error.message);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (!transaction) return;

    const confirmed = window.confirm(
      `Delete transaction "${transaction.name}"?`
    );
    if (!confirmed) return;

    try {
      await api.deleteTransaction(transactionId);
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
    return transactions.filter((t) => t.category_id === categoryId);
  };

  const getCategoryTotal = (categoryId) => {
    return getTransactionsByCategory(categoryId).reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );
  };

  return (
    <DesktopLayout title="Budget">
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button style={button} onClick={() => setShowBudgetModal(true)}>
            + Create Budget
          </button>
          {currentBudget && (
            <>
              <button style={button} onClick={() => setShowCategoryModal(true)}>
                + Create a Category
              </button>
              <button style={button} onClick={() => setShowTransactionModal(true)}>
                + Create a Transaction
              </button>
              <button
                style={{ ...button, marginLeft: "auto" }}
                onClick={() => setShowBudgetSelector(true)}
              >
                Budget: {currentBudget.name} ▼
              </button>
            </>
          )}
        </div>

        {!currentBudget ? (
          <div style={{ ...card, padding: 32, textAlign: "center" }}>
            <p style={{ color: "#94a3b8", marginBottom: 16 }}>
              No budget selected. Create a budget to get started.
            </p>
          </div>
        ) : (
          <>
            <div style={card}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 18 }}>Categories</h3>
              {categories.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: 14 }}>
                  No Categories created. Create a category to start organizing your transactions.
                </p>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {categories.map((category) => {
                    const total = getCategoryTotal(category.id);
                    const isExpanded = expandedCategories.has(category.id);
                    const categoryTransactions = getTransactionsByCategory(category.id);

                    return (
                      <div key={category.id}>
                        <div
                          style={{
                            padding: 12,
                            background: "#1e293b",
                            borderRadius: 8,
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                          onClick={() => toggleCategory(category.id)}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 12 }}>
                              {isExpanded ? "▼" : "▶"}
                            </span>
                            <span style={{ fontWeight: 500 }}>{category.name}</span>
                          </div>
                          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                            <span style={{ color: "#94a3b8", fontSize: 14 }}>
                              ${total.toFixed(2)} / ${Number(category.limit).toFixed(2)}
                            </span>
                            <div
                              style={{
                                width: 100,
                                height: 6,
                                background: "#334155",
                                borderRadius: 3,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${Math.min((total / Number(category.limit)) * 100, 100)}%`,
                                  height: "100%",
                                  background: total > Number(category.limit) ? "#ef4444" : "#3b82f6",
                                }}
                              />
                            </div>
                            <button
                              style={actionButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditCategory(category);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              style={{ ...actionButton, color: "#fca5a5" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category.id);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {isExpanded && categoryTransactions.length > 0 && (
                          <div style={{ marginLeft: 24, marginTop: 8, display: "grid", gap: 6 }}>
                            {categoryTransactions.map((transaction) => (
                              <div
                                key={transaction.id}
                                style={{
                                  padding: "8px 12px",
                                  background: "#1e293b",
                                  borderRadius: 6,
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  fontSize: 14,
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 500 }}>{transaction.name}</div>
                                  <div
                                    style={{
                                      color: "#64748b",
                                      fontSize: 12,
                                      marginTop: 2,
                                    }}
                                  >
                                    {new Date(transaction.creation_time).toLocaleDateString()}
                                  </div>
                                </div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                  <div style={{ fontWeight: 600, color: "#ef4444" }}>
                                    ${Number(transaction.amount).toFixed(2)}
                                  </div>
                                  <button
                                    style={actionButton}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditTransaction(transaction);
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    style={{ ...actionButton, color: "#fca5a5" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTransaction(transaction.id);
                                    }}
                                  >
                                    Delete
                                  </button>
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
              <h3 style={{ margin: "0 0 16px 0", fontSize: 18 }}>All Transactions</h3>
              {transactions.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: 14 }}>
                  No transactions yet. Create a transaction to start tracking your expenses.
                </p>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {transactions.map((transaction) => {
                    const category = categories.find(
                      (c) => c.id === transaction.category_id
                    );
                    return (
                      <div
                        key={transaction.id}
                        style={{
                          padding: 12,
                          background: "#1e293b",
                          borderRadius: 8,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 500 }}>{transaction.name}</div>
                          <div
                            style={{
                              color: "#64748b",
                              fontSize: 13,
                              marginTop: 4,
                            }}
                          >
                            {category?.name || "Unknown"} •{" "}
                            {new Date(transaction.creation_time).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <div style={{ fontWeight: 600, color: "#ef4444", fontSize: 16 }}>
                            ${Number(transaction.amount).toFixed(2)}
                          </div>
                          <button
                            style={actionButton}
                            onClick={() => openEditTransaction(transaction)}
                          >
                            Edit
                          </button>
                          <button
                            style={{ ...actionButton, color: "#fca5a5" }}
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
          </>
        )}
      </div>

      {/* Keep your modal JSX exactly as you already have it */}
    </DesktopLayout>
  );
}