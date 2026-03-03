import { useEffect, useMemo, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import DesktopLayout from "../components/DesktopLayout";
import { api } from "../api/client";

const card = {
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 16,
};

const palette = [
  "#f14949",
  "#2E96FF",
  "#11d899",
  "#f59e0b",
  "#a855f7",
  "#22c55e",
  "#0ea5e9",
  "#f97316",
];

const pieheight = 280;
const piewidth = 400;

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentBudgetId, setCurrentBudgetId] = useState(null);

  const loadData = async () => {
    try {
      const budgets = await api.getBudgets();
      let budgetId = await api.getCurrentBudgetId();

      if (!budgetId && budgets.length > 0) {
        budgetId = budgets[0].id;
        await api.setCurrentBudgetId(budgetId);
      }

      setCurrentBudgetId(budgetId || null);

      if (!budgetId) {
        setCategories([]);
        setTransactions([]);
        return;
      }

      const [cats, txs] = await Promise.all([
        api.getCategories(budgetId),
        api.getTransactions(budgetId),
      ]);

      setCategories(cats);
      setTransactions(txs);
    } catch (error) {
      console.error("Failed to load home data:", error);
    }
  };

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener("budget-data-updated", handler);
    return () => window.removeEventListener("budget-data-updated", handler);
  }, []);

  const { totalSpent, chartData, sortedData, sortedTransactions, categoryMeta } = useMemo(() => {
    const now = new Date();
    const isCurrentMonth = (dateStr) => {
      const d = new Date(dateStr);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    };

    const monthTransactions = transactions.filter((t) => t.date && isCurrentMonth(t.date));
    const total = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

    const chart = categories
      .map((category, index) => {
        const value = monthTransactions
          .filter((t) => t.categoryId === category.id)
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          id: category.id,
          value,
          label: category.name,
          color: palette[index % palette.length],
        };
      })
      .filter((item) => item.value > 0);

    const sorted = [...chart].sort((a, b) => b.value - a.value);
    const txSorted = [...transactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    const meta = new Map(
      categories.map((category, index) => [
        category.id,
        { name: category.name, color: palette[index % palette.length] },
      ])
    );

    return {
      totalSpent: total,
      chartData: chart,
      sortedData: sorted,
      sortedTransactions: txSorted,
      categoryMeta: meta,
    };
  }, [categories, transactions]);

  const income = 0;
  const net = income - totalSpent;

  return (
    <DesktopLayout title="Home">
      <div style={{ display: "grid", gap: 16 }}>
        {/* Top stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          <div style={card}>
            <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              This Month Spent
            </div>
            <div style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700 }}>
              ${totalSpent.toLocaleString()}
            </div>
          </div>

          <div style={card}>
            <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              Income
            </div>
            <div style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700 }}>
              ${income.toLocaleString()}
            </div>
          </div>

          <div style={card}>
            <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              Net
            </div>
            <div style={{ color: net >= 0 ? "#1ccb94" : "#ef4444", fontSize: 24, fontWeight: 700 }}>
              {net >= 0 ? "+" : ""}${net.toLocaleString()}
            </div>
          </div>
        </div>

        {!currentBudgetId ? (
          <div style={{ ...card, padding: 32, textAlign: "center" }}>
            <p style={{ color: "#94a3b8", marginBottom: 16 }}>
              No budget selected. Create a budget to get started.
            </p>
          </div>
        ) : (
          <>
            {/* Main row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 0.8fr",
                gap: 16,
              }}
            >
              {/* Pie chart */}
              <div style={{ ...card, minHeight: 320, position: "relative" }}>
                {chartData.length === 0 ? (
                  <div style={{ color: "#94a3b8", fontSize: 14 }}>
                    No transactions this month yet.
                  </div>
                ) : (
                  <>
                    <PieChart
                      series={[
                        {
                          innerRadius: 70,
                          outerRadius: 100,
                          data: chartData,
                        },
                      ]}
                      width={piewidth}
                      height={pieheight}
                      hideLegend
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "45%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        color: "#ffffff",
                        fontSize: 22,
                        fontWeight: 600,
                      }}
                    >
                      Expenses
                      <br />
                      ${totalSpent.toLocaleString()}
                    </div>
                  </>
                )}
              </div>

              {/* Top categories */}
              <div style={{ ...card, minHeight: 320 }}>
                <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
                  Top Categories
                </div>
                {sortedData.length === 0 ? (
                  <div style={{ color: "#94a3b8", fontSize: 14 }}>
                    No transactions this month yet.
                  </div>
                ) : (
                  sortedData.map((item) => {
                    const pct = Math.round((item.value / totalSpent) * 100);
                    return (
                      <div key={item.id} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, display: "inline-block" }} />
                            <span style={{ color: "#e2e8f0", fontSize: 13 }}>{item.label}</span>
                          </div>
                          <span style={{ color: "#94a3b8", fontSize: 13 }}>${item.value}</span>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 4, overflow: "hidden" }}>
                          <div style={{ background: item.color, width: `${pct}%`, height: "100%", borderRadius: 4 }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Transactions table */}
            <div style={{ ...card, minHeight: 240 }}>
              <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
                Recent Transactions
              </div>

              {/* Table header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr 1.5fr 1fr",
                padding: "0 8px 10px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                color: "#64748b",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}>
                <span>Date</span>
                <span>Description</span>
                <span>Category</span>
                <span style={{ textAlign: "right" }}>Amount</span>
              </div>

              {/* Table rows */}
              {sortedTransactions.length === 0 ? (
                <div style={{ color: "#94a3b8", fontSize: 14, padding: "12px 8px" }}>
                  No transactions yet.
                </div>
              ) : (
                sortedTransactions.map((tx, i) => {
                  const meta = categoryMeta.get(tx.categoryId);
                  return (
                    <div
                      key={tx.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 2fr 1.5fr 1fr",
                        padding: "12px 8px",
                        borderBottom: i < sortedTransactions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "#64748b", fontSize: 13 }}>
                        {new Date(tx.date).toLocaleDateString()}
                      </span>
                      <span style={{ color: "#e2e8f0", fontSize: 13 }}>{tx.note}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: meta?.color ?? "#888",
                          display: "inline-block",
                          flexShrink: 0,
                        }} />
                        <span style={{ color: "#94a3b8", fontSize: 13 }}>
                          {meta?.name || "Unknown"}
                        </span>
                      </span>
                      <span style={{ color: "#f1f5f9", fontSize: 13, textAlign: "right", fontWeight: 500 }}>
                        -${tx.amount}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </DesktopLayout>
  );
}