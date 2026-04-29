const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// LocalStorage helpers
const storage = {
  getBudgets: () => JSON.parse(localStorage.getItem("budgets") || "[]"),
  setBudgets: (budgets) => localStorage.setItem("budgets", JSON.stringify(budgets)),
  getCategories: () => JSON.parse(localStorage.getItem("categories") || "[]"),
  setCategories: (categories) => localStorage.setItem("categories", JSON.stringify(categories)),
  getTransactions: () => JSON.parse(localStorage.getItem("transactions") || "[]"),
  setTransactions: (transactions) => localStorage.setItem("transactions", JSON.stringify(transactions)),
  getCurrentBudgetId: () => {
    const value = localStorage.getItem("currentBudgetId");
    return value ? parseInt(value) : null;
  },
  setCurrentBudgetId: (id) => localStorage.setItem("currentBudgetId", String(id)),
};

let nextId = {
  budget: 1,
  category: 1,
  transaction: 1,
};

// Initialize IDs from existing data
const initIds = () => {
  const budgets = storage.getBudgets();
  const categories = storage.getCategories();
  const transactions = storage.getTransactions();
  
  if (budgets.length) nextId.budget = Math.max(...budgets.map(b => b.id)) + 1;
  if (categories.length) nextId.category = Math.max(...categories.map(c => c.id)) + 1;
  if (transactions.length) nextId.transaction = Math.max(...transactions.map(t => t.id)) + 1;
};

initIds();

const notifyDataChanged = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("budget-data-updated"));
  }
};

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = typeof data === "string" ? data : data?.message || "Request failed";
    throw new Error(msg);
  }
  return data;
}

export const api = {
  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Budget endpoints (using localStorage)
  getBudgets: async () => {
    return storage.getBudgets();
  },
  
  createBudget: async (payload) => {
    const budgets = storage.getBudgets();
    const newBudget = {
      id: nextId.budget++,
      name: payload.name,
      createdAt: new Date().toISOString(),
    };
    budgets.push(newBudget);
    storage.setBudgets(budgets);
    storage.setCurrentBudgetId(newBudget.id);
    notifyDataChanged();
    return newBudget;
  },
  
  getBudget: async (id) => {
    const budgets = storage.getBudgets();
    return budgets.find(b => b.id === id);
  },

  updateBudget: async (id, payload) => {
    const budgets = storage.getBudgets();
    const index = budgets.findIndex((b) => b.id === id);
    if (index !== -1) {
      budgets[index] = { ...budgets[index], ...payload };
      storage.setBudgets(budgets);
      notifyDataChanged();
      return budgets[index];
    }
    throw new Error("Budget not found");
  },

  deleteBudget: async (id) => {
    const budgets = storage.getBudgets();
    const categories = storage.getCategories();
    const transactions = storage.getTransactions();

    const remainingBudgets = budgets.filter((b) => b.id !== id);
    const remainingCategories = categories.filter((c) => c.budgetId !== id);
    const remainingTransactions = transactions.filter((t) => t.budgetId !== id);

    storage.setBudgets(remainingBudgets);
    storage.setCategories(remainingCategories);
    storage.setTransactions(remainingTransactions);

    const currentBudgetId = storage.getCurrentBudgetId();
    if (currentBudgetId === id) {
      const nextBudgetId = remainingBudgets.length ? remainingBudgets[0].id : null;
      if (nextBudgetId) {
        storage.setCurrentBudgetId(nextBudgetId);
      } else {
        localStorage.removeItem("currentBudgetId");
      }
    }

    notifyDataChanged();
    return { success: true };
  },

  getCurrentBudgetId: async () => {
    return storage.getCurrentBudgetId();
  },

  setCurrentBudgetId: async (id) => {
    storage.setCurrentBudgetId(id);
    notifyDataChanged();
    return id;
  },

  // Category endpoints (using localStorage)
  getCategories: async (budgetId) => {
    const categories = storage.getCategories();
    return categories.filter(c => c.budgetId === budgetId);
  },
  
  createCategory: async (budgetId, payload) => {
    const categories = storage.getCategories();
    const newCategory = {
      id: nextId.category++,
      budgetId: budgetId,
      name: payload.name,
      limit: payload.limit,
      createdAt: new Date().toISOString(),
    };
    categories.push(newCategory);
    storage.setCategories(categories);
    notifyDataChanged();
    return newCategory;
  },

  updateCategory: async (budgetId, categoryId, payload) => {
    const categories = storage.getCategories();
    const index = categories.findIndex(
      (c) => c.id === categoryId && c.budgetId === budgetId
    );
    if (index !== -1) {
      categories[index] = { ...categories[index], ...payload };
      storage.setCategories(categories);
      notifyDataChanged();
      return categories[index];
    }
    throw new Error("Category not found");
  },

  deleteCategory: async (budgetId, categoryId) => {
    const categories = storage.getCategories();
    const transactions = storage.getTransactions();

    const categoryExists = categories.some(
      (c) => c.id === categoryId && c.budgetId === budgetId
    );

    if (!categoryExists) {
      throw new Error("Category not found");
    }

    const remainingCategories = categories.filter(
      (c) => !(c.id === categoryId && c.budgetId === budgetId)
    );
    const remainingTransactions = transactions.filter(
      (t) => !(t.budgetId === budgetId && t.categoryId === categoryId)
    );

    storage.setCategories(remainingCategories);
    storage.setTransactions(remainingTransactions);
    notifyDataChanged();
    return { success: true };
  },

  // Transaction endpoints (using localStorage)
  getTransactions: async (budgetId) => {
    const transactions = storage.getTransactions();
    return transactions.filter(t => t.budgetId === budgetId);
  },
  
  createTransaction: async (budgetId, payload) => {
    const transactions = storage.getTransactions();
    const newTransaction = {
      id: nextId.transaction++,
      budgetId: budgetId,
      categoryId: payload.categoryId,
      note: payload.note,
      amount: payload.amount,
      date: payload.date,
      createdAt: new Date().toISOString(),
    };
    transactions.push(newTransaction);
    storage.setTransactions(transactions);
    notifyDataChanged();
    return newTransaction;
  },
  
  updateTransaction: async (budgetId, transactionId, payload) => {
    const transactions = storage.getTransactions();
    const index = transactions.findIndex(t => t.id === transactionId && t.budgetId === budgetId);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...payload };
      storage.setTransactions(transactions);
      notifyDataChanged();
      return transactions[index];
    }
    throw new Error("Transaction not found");
  },
  
  deleteTransaction: async (budgetId, transactionId) => {
    const transactions = storage.getTransactions();
    const filtered = transactions.filter(t => !(t.id === transactionId && t.budgetId === budgetId));
    storage.setTransactions(filtered);
    notifyDataChanged();
    return { success: true };
  },
};
