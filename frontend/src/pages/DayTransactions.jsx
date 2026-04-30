import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DesktopLayout from "../components/DesktopLayout";
import { api } from "../api/client";

const card = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 16,
};

const button = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--accent)",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 500,
  marginBottom: 16,
};

export default function DayTransactions() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [currentBudgetId, setCurrentBudgetId] = useState(null);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [date]);

  const loadData = async () => {
    try {
      setLoading(true);
      const budgets = await api.getBudgets();
      let budgetId = await api.getCurrentBudgetId();

      if (!budgetId && budgets.length > 0) {
        budgetId = budgets[0].id;
        await api.setCurrentBudgetId(budgetId);
      }

      setCurrentBudgetId(budgetId || null);

      if (!budgetId) {
        setTransactions([]);
        return;
      }

      const cats = await api.getCategories(budgetId);
      const catMap = {};
      cats.forEach((cat) => {
        catMap[cat.id] = cat.name;
      });
      setCategories(catMap);

      const txs = await api.getTransactions(budgetId);
      const filtered = txs.filter((tx) => tx.date === date);

      // Sort by date descending
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(filtered);
    } catch (error) {
      console.error("Failed to load day transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDayTotal = () => {
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  };

  if (loading) {
    return (
      <DesktopLayout title="Transactions">
        <div style={card}>
          <p style={{ color: "var(--text-muted)" }}>Loading...</p>
        </div>
      </DesktopLayout>
    );
  }

  return (
    <DesktopLayout title="Transactions">
      <div style={{ display: "grid", gap: 16 }}>
        <button style={button} onClick={() => navigate("/calendar")}>
          ← Back to Calendar
        </button>

        <div style={card}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: 20 }}>
            {formatDate(date)}
          </h2>
          <p style={{ color: "var(--text-muted)", margin: "0 0 16px 0", fontSize: 14 }}>
            Total: ${getDayTotal().toFixed(2)}
          </p>

          {transactions.length === 0 ? (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 32 }}>
              No transactions on this day.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    padding: 12,
                    background: "var(--surface-soft)",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 4, color: "var(--text)" }}>
                      {tx.note}
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {categories[tx.categoryId] || "Unknown"}
                    </div>
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 16,
                      color: "var(--danger)",
                    }}
                  >
                    ${tx.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DesktopLayout>
  );
}