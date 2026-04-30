const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// JWT bearer token storage
const tokenStorage = {
  getToken: () => localStorage.getItem("token"),
  setToken: (token) => localStorage.setItem("token", token),
  clearToken: () => localStorage.removeItem("token"),
};

async function request(path, options = {}) {
  const token = tokenStorage.getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const msg =
      typeof data === "string"
        ? data
        : data?.detail || data?.message || "Request failed";
    throw new Error(msg);
  }

  return data;
}

export const api = {
  async login(payload) {
    const data = await request("/users/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (data.access_token) {
      tokenStorage.setToken(data.access_token);
    }

    return data;
  },

  async register(payload){
    return request("/users/register",{
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async forgotPassword(payload){
    return request("/users/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async resetPassword(payload){
    return request("/users/reset-password",{
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getMe() {
    return request("/users/me", {
      method: "GET",
    });
  },

  logout() {
    tokenStorage.clearToken();
  },

  // Budgets
  async getBudgets() {
    return request("/budgets/", {
      method: "GET",
    });
  },

  async createBudget(payload) {
    return request("/budgets/", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
      }),
    });
  },

  async getBudget(id) {
    const budgets = await request("/budgets/", {
      method: "GET",
    });
    return budgets.find((b) => b.id === id);
  },

  async updateBudget(id, payload) {
    return request(`/budgets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async deleteBudget(id) {
    return request(`/budgets/${id}`, {
      method: "DELETE",
    });
  },

  // Categories
  async getCategories(budgetId) {
    return request(`/categories/by-budget/${budgetId}`, {
      method: "GET",
    });
  },

  async createCategory(budgetId, payload) {
    return request("/categories/", {
      method: "POST",
      body: JSON.stringify({
        budget_id: budgetId,
        budget_name: payload.budget_name,
        name: payload.name,
        limit: payload.limit,
        spent: payload.spent ?? 0.0,
      }),
    });
  },

  async updateCategory(categoryId, payload) {
    return request(`/categories/${categoryId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async deleteCategory(categoryId) {
    return request(`/categories/${categoryId}`, {
      method: "DELETE",
    });
  },

  // Transactions
  async getTransactions() {
    return request("/transactions/", {
      method: "GET",
    });
  },

  async getTransaction(transactionId) {
    return request(`/transactions/${transactionId}`, {
      method: "GET",
    });
  },

  async createTransaction(payload) {
    return request("/transactions/", {
      method: "POST",
      body: JSON.stringify({
        budget_id: payload.budget_id,
        category_id: payload.category_id,
        ...(payload.goal_id ? { goal_id: payload.goal_id } : {}),
        name: payload.name,
        amount: payload.amount,
      }),
    });
  },

  async updateTransaction(transactionId, payload) {
    return request(`/transactions/${transactionId}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...(payload.budget_id ? { budget_id: payload.budget_id } : {}),
        ...(payload.category_id ? { category_id: payload.category_id } : {}),
        ...(payload.goal_id ? { goal_id: payload.goal_id } : {}),
        ...(payload.name ? { name: payload.name } : {}),
        ...(payload.amount !== undefined ? { amount: payload.amount } : {}),
      }),
    });
  },

  async deleteTransaction(transactionId) {
    return request(`/transactions/${transactionId}`, {
      method: "DELETE",
    });
  },
};