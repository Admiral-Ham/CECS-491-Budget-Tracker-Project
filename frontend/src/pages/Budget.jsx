import { useState, useEffect } from "react";
import DesktopLayout from "../components/DesktopLayout";
import { api } from "../api/client";

const card = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 18,
  padding: 16,
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
};

const modal = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.62)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContent = {
  background: "var(--surface-strong)",
  borderRadius: 18,
  padding: 24,
  minWidth: 400,
  maxWidth: 500,
  border: "1px solid var(--border)",
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

  const [editBudgetId, setEditBudgetId] = useState(null);
  const [editBudgetName, setEditBudgetName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryLimit, setEditCategoryLimit] = useState("");
  const [editTransactionId, setEditTransactionId] = useState(null);
  const [editTransactionNote, setEditTransactionNote] = useState("");
  const [editTransactionAmount, setEditTransactionAmount] = useState("");
  const [editTransactionCategory, setEditTransactionCategory] = useState("");

  useEffect(() => {
    loadBudgets();
  }, []);

  useEffect(() => {
    if (currentBudget) {
      loadCategories();
      loadTransactions();
    } else {
      setCategories([]);
      setTransactions([]);
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
      const filtered = data.filter((t) => t.budget_id === currentBudget.id);
      const sorted = filtered.sort(
        (a, b) => new Date(b.creation_time) - new Date(a.creation_time)
      );
      setTransactions(sorted);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    }
  };

  const selectBudget = (budget) => {
    setCurrentBudget(budget);
    setShowBudgetSelector(false);
  };

  const handleCreateBudget = async () => {
    try {
      const newBudget = await api.createBudget({ name: budgetName });
      setBudgets([...budgets, newBudget]);
      setCurrentBudget(newBudget);
      setBudgetName("");
      setShowBudgetModal(false);
    } catch (error) {
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
      alert("Failed to update budget: " + error.message);
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    const budget = budgets.find((b) => b.id === budgetId);
    if (!budget) return;

    if (!window.confirm(`Delete budget "${budget.name}"?`)) return;

    try {
      await api.deleteBudget(budgetId);

      const remaining = budgets.filter((b) => b.id !== budgetId);
      setBudgets(remaining);

      if (currentBudget?.id === budgetId) {
        setCurrentBudget(remaining[0] || null);
      }

      setShowBudgetSelector(false);
    } catch (error) {
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
      alert("Failed to update category: " + error.message);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    if (!window.confirm(`Delete category "${category.name}"?`)) return;

    try {
      await api.deleteCategory(categoryId);
      setCategories(categories.filter((c) => c.id !== categoryId));
      setTransactions(transactions.filter((t) => t.category_id !== categoryId));
    } catch (error) {
      alert("Failed to delete category: " + error.message);
    }
  };

  const handleCreateTransaction = async () => {
    if (!isValidCurrencyAmount(transactionAmount)) {
      alert("Please enter a valid amount like 10.00.");
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
      alert("Please enter a valid amount like 10.00.");
      return;
    }

    try {
      const updated = await api.updateTransaction(editTransactionId, {
        budget_id: currentBudget.id,
        category_id: editTransactionCategory,
        name: editTransactionNote,
        amount: parseFloat(editTransactionAmount),
      });

      setTransactions(transactions.map((t) => (t.id === updated.id ? updated : t)));

      setShowEditTransactionModal(false);
      setEditTransactionId(null);
      setEditTransactionNote("");
      setEditTransactionAmount("");
      setEditTransactionCategory("");
    } catch (error) {
      alert("Failed to update transaction: " + error.message);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (!transaction) return;

    if (!window.confirm(`Delete transaction "${transaction.name}"?`)) return;

    try {
      await api.deleteTransaction(transactionId);
      setTransactions(transactions.filter((t) => t.id !== transactionId));
    } catch (error) {
      alert("Failed to delete transaction: " + error.message);
    }
  };

  const toggleCategory = (categoryId) => {
    const next = new Set(expandedCategories);

    if (next.has(categoryId)) {
      next.delete(categoryId);
    } else {
      next.add(categoryId);
    }

    setExpandedCategories(next);
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
                + Create Category
              </button>

              <button style={button} onClick={() => setShowTransactionModal(true)}>
                + Create Transaction
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
            <p style={{ color: "var(--text-muted)", margin: 0 }}>
              No budget selected. Create a budget to get started.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(300px, 0.95fr) minmax(360px, 1.05fr)",
              gap: 16,
              alignItems: "start",
            }}
          >
            <div style={card}>
              <h3>Categories</h3>

              {categories.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>
                  No categories yet.
                </p>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {categories.map((category) => {
                    const total = getCategoryTotal(category.id);
                    const categoryTransactions = getTransactionsByCategory(category.id);
                    const isExpanded = expandedCategories.has(category.id);
                    const limit = Number(category.limit);
                    const progress = limit ? Math.min((total / limit) * 100, 100) : 0;

                    return (
                      <div
                        key={category.id}
                        style={{
                          border: "1px solid var(--border)",
                          borderRadius: 12,
                          overflow: "hidden",
                          background: "var(--surface-soft)",
                        }}
                      >
                        <div
                          onClick={() => toggleCategory(category.id)}
                          style={{ padding: 12, cursor: "pointer", display: "grid", gap: 10 }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                            <div>
                              <strong>{isExpanded ? "▾" : "▸"} {category.name}</strong>
                              <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                                {categoryTransactions.length} transaction
                                {categoryTransactions.length === 1 ? "" : "s"}
                              </div>
                            </div>

                            <div style={{ display: "flex", gap: 8 }}>
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
                                style={{ ...actionButton, color: "var(--danger)" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCategory(category.id);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                              <span>${total.toFixed(2)}</span>
                              <span>${limit.toFixed(2)}</span>
                            </div>

                            <div
                              style={{
                                height: 6,
                                borderRadius: 999,
                                background: "var(--surface)",
                                overflow: "hidden",
                                marginTop: 6,
                              }}
                            >
                              <div
                                style={{
                                  width: `${progress}%`,
                                  height: "100%",
                                  background: total > limit ? "var(--danger)" : "var(--accent)",
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {isExpanded && categoryTransactions.length > 0 && (
                          <div style={{ padding: "0 12px 12px", display: "grid", gap: 6 }}>
                            {categoryTransactions.map((transaction) => (
                              <div
                                key={transaction.id}
                                style={{
                                  padding: 10,
                                  borderRadius: 10,
                                  background: "var(--surface)",
                                  border: "1px solid var(--border)",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  gap: 12,
                                }}
                              >
                                <div>
                                  <strong>{transaction.name}</strong>
                                  <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                                    {new Date(transaction.creation_time).toLocaleDateString()}
                                  </div>
                                </div>

                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                  <strong>${Number(transaction.amount).toFixed(2)}</strong>
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
              <h3>All Transactions</h3>

              {transactions.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>
                  No transactions yet.
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
                          background: "var(--surface-soft)",
                          borderRadius: 10,
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div>
                          <strong>{transaction.name}</strong>
                          <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                            {category?.name || "Unknown"} •{" "}
                            {new Date(transaction.creation_time).toLocaleDateString()}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <strong>${Number(transaction.amount).toFixed(2)}</strong>
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
        )}
      </div>

      {showBudgetModal && (
        <Modal title="Create Budget" onClose={() => setShowBudgetModal(false)}>
          <label style={label}>Budget Name</label>
          <input style={input} value={budgetName} onChange={(e) => setBudgetName(e.target.value)} />
          <ModalActions
            onCancel={() => setShowBudgetModal(false)}
            onSubmit={handleCreateBudget}
            submitText="Create"
            disabled={!budgetName.trim()}
          />
        </Modal>
      )}

      {showCategoryModal && (
        <Modal title="Create Category" onClose={() => setShowCategoryModal(false)}>
          <label style={label}>Category Name</label>
          <input style={input} value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />

          <label style={{ ...label, marginTop: 16 }}>Budget Limit</label>
          <input style={input} value={categoryLimit} onChange={(e) => setCategoryLimit(e.target.value)} />

          {categoryLimit && !isValidCurrencyAmount(categoryLimit) && (
            <div style={errorText}>Enter a valid amount.</div>
          )}

          <ModalActions
            onCancel={() => setShowCategoryModal(false)}
            onSubmit={handleCreateCategory}
            submitText="Create"
            disabled={!categoryName.trim() || !isValidCurrencyAmount(categoryLimit)}
          />
        </Modal>
      )}

      {showTransactionModal && (
        <Modal title="Create Transaction" onClose={() => setShowTransactionModal(false)}>
          <label style={label}>Name</label>
          <input style={input} value={transactionNote} onChange={(e) => setTransactionNote(e.target.value)} />

          <label style={{ ...label, marginTop: 16 }}>Amount</label>
          <input style={input} value={transactionAmount} onChange={(e) => setTransactionAmount(e.target.value)} />

          <label style={{ ...label, marginTop: 16 }}>Category</label>
          <select style={input} value={transactionCategory} onChange={(e) => setTransactionCategory(e.target.value)}>
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <ModalActions
            onCancel={() => setShowTransactionModal(false)}
            onSubmit={handleCreateTransaction}
            submitText="Create"
            disabled={
              !transactionNote.trim() ||
              !isValidCurrencyAmount(transactionAmount) ||
              !transactionCategory
            }
          />
        </Modal>
      )}

      {showEditBudgetModal && (
        <Modal title="Edit Budget" onClose={() => setShowEditBudgetModal(false)}>
          <label style={label}>Budget Name</label>
          <input style={input} value={editBudgetName} onChange={(e) => setEditBudgetName(e.target.value)} />

          <ModalActions
            onCancel={() => setShowEditBudgetModal(false)}
            onSubmit={handleUpdateBudget}
            submitText="Save"
            disabled={!editBudgetName.trim()}
          />
        </Modal>
      )}

      {showEditCategoryModal && (
        <Modal title="Edit Category" onClose={() => setShowEditCategoryModal(false)}>
          <label style={label}>Category Name</label>
          <input style={input} value={editCategoryName} onChange={(e) => setEditCategoryName(e.target.value)} />

          <label style={{ ...label, marginTop: 16 }}>Limit</label>
          <input style={input} value={editCategoryLimit} onChange={(e) => setEditCategoryLimit(e.target.value)} />

          <ModalActions
            onCancel={() => setShowEditCategoryModal(false)}
            onSubmit={handleUpdateCategory}
            submitText="Save"
            disabled={!editCategoryName.trim() || !isValidCurrencyAmount(editCategoryLimit)}
          />
        </Modal>
      )}

      {showEditTransactionModal && (
        <Modal title="Edit Transaction" onClose={() => setShowEditTransactionModal(false)}>
          <label style={label}>Name</label>
          <input style={input} value={editTransactionNote} onChange={(e) => setEditTransactionNote(e.target.value)} />

          <label style={{ ...label, marginTop: 16 }}>Amount</label>
          <input style={input} value={editTransactionAmount} onChange={(e) => setEditTransactionAmount(e.target.value)} />

          <label style={{ ...label, marginTop: 16 }}>Category</label>
          <select style={input} value={editTransactionCategory} onChange={(e) => setEditTransactionCategory(e.target.value)}>
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <ModalActions
            onCancel={() => setShowEditTransactionModal(false)}
            onSubmit={handleUpdateTransaction}
            submitText="Save"
            disabled={
              !editTransactionNote.trim() ||
              !isValidCurrencyAmount(editTransactionAmount) ||
              !editTransactionCategory
            }
          />
        </Modal>
      )}

      {showBudgetSelector && (
        <Modal title="Select Budget" onClose={() => setShowBudgetSelector(false)}>
          <div style={{ display: "grid", gap: 8 }}>
            {budgets.map((budget) => (
              <div
                key={budget.id}
                onClick={() => selectBudget(budget)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  cursor: "pointer",
                  border: "1px solid var(--border)",
                  background:
                    currentBudget?.id === budget.id
                      ? "rgba(77, 174, 203, 0.14)"
                      : "var(--surface-soft)",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span>{budget.name}</span>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    style={actionButton}
                    onClick={(e) => {
                      e.stopPropagation();
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
        </Modal>
      )}
    </DesktopLayout>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div style={modal} onClick={onClose}>
      <div style={modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onCancel, onSubmit, submitText, disabled }) {
  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
      <button
        style={{
          ...button,
          background: "transparent",
          color: "var(--text-muted)",
        }}
        onClick={onCancel}
      >
        Cancel
      </button>

      <button style={button} onClick={onSubmit} disabled={disabled}>
        {submitText}
      </button>
    </div>
  );
}