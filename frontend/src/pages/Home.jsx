import React, { useEffect, useMemo, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import DesktopLayout from "../components/DesktopLayout";

const card = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 18,
  padding: 16,
  backdropFilter: "blur(6px)",
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
const panels = ["Top Categories", "Goals"];

function ButtonToggle({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "var(--surface-soft)" : "transparent",
        border: active ? "1px solid var(--border)" : "1px solid transparent",
        borderRadius: 8,
        color: active ? "var(--text)" : "var(--text-muted)",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.05em",
        padding: "5px 12px",
        textTransform: "uppercase",
        transition: "all 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}

function ToggleGroup({ active, setActive }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {panels.map((type) => (
        <ButtonToggle key={type} active={active === type} onClick={() => setActive(type)}>
          {type}
        </ButtonToggle>
      ))}
    </div>
  );
}

function loadGoals(budgetId) {
  try {
    const raw = localStorage.getItem(`goals:${budgetId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGoals(budgetId, goals) {
  localStorage.setItem(`goals:${budgetId}`, JSON.stringify(goals));
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const modalOverlay = {
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

const modalBox = {
  background: "var(--surface)",
  borderRadius: 16,
  padding: 24,
  width: 360,
  border: "1px solid var(--border)",
};

const modalInput = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--surface-soft)",
  color: "var(--text)",
  fontSize: 14,
  marginTop: 6,
  boxSizing: "border-box",
};

const modalLabel = {
  display: "block",
  color: "var(--text-muted)",
  fontSize: 13,
  fontWeight: 500,
  marginTop: 16,
};

const modalPrimaryBtn = (enabled) => ({
  padding: "8px 16px",
  borderRadius: 8,
  border: "none",
  background: enabled ? "var(--success)" : "var(--surface-soft)",
  color: enabled ? "#041012" : "var(--text-muted)",
  cursor: enabled ? "pointer" : "default",
  fontSize: 13,
  fontWeight: 700,
});

const modalSecondaryBtn = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "transparent",
  color: "var(--text-muted)",
  cursor: "pointer",
  fontSize: 13,
};

const modalDangerBtn = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid rgba(239,68,68,0.4)",
  background: "rgba(239,68,68,0.1)",
  color: "#ef4444",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
  marginRight: "auto",
};

function calcEta(remaining, monthlyAllocation) {
  if (!monthlyAllocation || monthlyAllocation <= 0 || remaining <= 0) return null;
  const months = Math.ceil(remaining / monthlyAllocation);
  const now = new Date();
  const eta = new Date(now.getFullYear(), now.getMonth() + months, 1);
  return eta.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function GoalFormModal({ goal, onSave, onDelete, onClose }) {
  const isEdit = !!goal;
  const [name, setName] = useState(goal?.name ?? "");
  const [target, setTarget] = useState(goal ? String(goal.target) : "");
  const [monthlyAllocation, setMonthlyAllocation] = useState(
    goal?.monthlyAllocation ? String(goal.monthlyAllocation) : ""
  );

  const canSave = name.trim() && target && parseFloat(target) > 0;

  const allocationVal = parseFloat(monthlyAllocation);
  const remaining = Math.max(parseFloat(target || 0) - (goal?.saved ?? 0), 0);
  const eta = calcEta(remaining, allocationVal);

  return (
    <div style={ modalOverlay } onClick={onClose}>
      <div style={modalBox} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: "0 0 4px 0", fontSize: 18, color: "var(--text)" }}>
          {isEdit ? "Edit Goal" : "New Goal"}
        </h2>
        <p style={{ margin: "0 0 4px 0", fontSize: 13, color: "var(--text-muted)" }}>
          {isEdit ? "Update your savings goal." : "What are you saving toward?"}
        </p>

        <label style={modalLabel}>Goal Name</label>
        <input
          style={modalInput}
          placeholder="e.g. New Laptop"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label style={modalLabel}>Target Amount</label>
        <input
          type="number"
          min="1"
          step="0.01"
          style={modalInput}
          placeholder="e.g. 1000"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />

        <label style={modalLabel}>Monthly Allocation (optional)</label>
        <input
          type="number"
          min="1"
          step="0.01"
          style={modalInput}
          placeholder="e.g. 200"
          value={monthlyAllocation}
          onChange={(e) => setMonthlyAllocation(e.target.value)}
        />

        {eta && (
          <div
            style={{
              marginTop: 8,
              padding: "7px 10px",
              borderRadius: 6,
              background: "rgba(20,184,166,0.08)",
              border: "1px solid rgba(20,184,166,0.2)",
              fontSize: 12,
              color: "var(--success)",
            }}
          >
            {"At $"}
            {allocationVal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2, })}
            {" a month you'll reach your goal by "}
            {eta}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 24, alignItems: "center" }}>
          {isEdit && (
            <button style={modalDangerBtn} onClick={() => onDelete(goal.id)}>
              Delete
            </button>
          )}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button style={modalSecondaryBtn} onClick={onClose}>Cancel</button>
            <button
              style={modalPrimaryBtn(canSave)}
              onClick={() =>
                canSave &&
                onSave({
                  id: goal?.id ?? newId(),
                  name: name.trim(),
                  target: parseFloat(target),
                  monthlyAllocation: allocationVal > 0 ? allocationVal : null,
                  saved: goal?.saved ?? 0,
                })
              }
            >
              {isEdit ? "Save" : "Create Goal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContributeModal({ goal, onSave, onClose }) {
  const [amount, setAmount] = useState("");
  const remaining = goal.target - goal.saved;
  const canSave = amount && parseFloat(amount) > 0;

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalBox} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: "0 0 4px 0", fontSize: 18, color: "var(--text)" }}>
          Add Contribution
        </h2>
        <p style={{ margin: "0 0 4px 0", fontSize: 13, color: "var(--text-muted)" }}>
          {goal.name} · ${goal.saved.toLocaleString()} saved of ${goal.target.toLocaleString()}
        </p>

        <label style={modalLabel}>Amount</label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          style={modalInput}
          placeholder={`Up to $${remaining.toLocaleString()} remaining`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />

        <div style={{ display: "flex", gap: 8, marginTop: 24, justifyContent: "flex-end" }}>
          <button style={modalSecondaryBtn} onClick={onClose}>Cancel</button>
          <button
            style={modalPrimaryBtn(canSave)}
            onClick={() => canSave && onSave(goal.id, parseFloat(amount))}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function GoalsPanel({ budgetId, onNewGoal, onEditGoal, onContributeGoal, goals, setGoals }) {
  useEffect(() => {
    saveGoals(budgetId, goals);
  }, [goals, budgetId]);

  useEffect(() => {
    setGoals(loadGoals(budgetId));
  }, [budgetId]);


  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <button
          onClick={onNewGoal}
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid rgba(20,184,166,0.5)",
            background: "rgba(20,184,166,0.12)",
            color: "var(--success)",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          + New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "70%",
          }}
        >
          <span style={{ color: "var(--text-muted)", textAlign: "center" }}>No goals yet.</span>
        </div>
      ) : (
        <div style={{ overflowY: "auto", maxHeight: 210, paddingRight: 4 }}>
          {goals.map((g, i) => {
            const pct = Math.min((g.saved / g.target) * 100, 100);
            const done = g.saved >= g.target;
            const color = done ? "var(--success)" : palette[i % palette.length];

            return (
              <div key={g.id} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 5,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: color,
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ color: "var(--text)", fontSize: 13, fontWeight: 500 }}>{g.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {!done && (
                      <button
                        onClick={() => onContributeGoal(g)}
                        style={{
                          padding: "2px 8px",
                          borderRadius: 5,
                          fontSize: 11,
                          fontWeight: 600,
                          border: "1px solid rgba(20,184,166,0.4)",
                          background: "rgba(20,184,166,0.1)",
                          color: "var(--success)",
                          cursor: "pointer",
                        }}
                      >
                        + Add
                      </button>
                    )}
                    <button
                      onClick={() => onEditGoal(g)}
                      style={{
                        padding: "2px 8px",
                        borderRadius: 5,
                        fontSize: 11,
                        fontWeight: 600,
                        border: "1px solid var(--border)",
                        background: "transparent",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--surface-soft)",
                    borderRadius: 4,
                    height: 6,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background: color,
                      width: `${pct}%`,
                      height: "100%",
                      borderRadius: 4,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: 4,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {g.monthlyAllocation && !done
                      ? `$${g.monthlyAllocation.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2, })}/month allocated`
                      : ""}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    <span style={{ color: done ? "var(--success)" : "var(--text)", fontWeight: 600 }}>
                      ${g.saved.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2, })}
                    </span>
                    {" / "}${g.target.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2, })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </>
  );
}

const pieWrap = {
  position: "relative",
  width: "100%",
};

const pieCenterLabel = {
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  color: "var(--text)",
  fontWeight: 700,
  pointerEvents: "none",
  padding: "0 16px",
};

const metricLabel = {
  color: "var(--text-muted)",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  marginBottom: 8,
};

const metricValue = {
  color: "var(--text)",
  fontSize: 26,
  fontWeight: 700,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const readHomeData = () => {
  if (typeof window === "undefined") {
    return {
      categories: [],
      transactions: [],
      currentBudgetId: null,
    };
  }

  const categories = JSON.parse(localStorage.getItem("categories") || "[]");
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  const currentBudgetId = (() => {
    const value = localStorage.getItem("currentBudgetId");
    return value ? parseInt(value, 10) : null;
  })();

  if (!currentBudgetId) {
    return {
      categories: [],
      transactions: [],
      currentBudgetId: null,
    };
  }

  return {
    categories: categories.filter((category) => category.budgetId === currentBudgetId),
    transactions: transactions.filter((transaction) => transaction.budgetId === currentBudgetId),
    currentBudgetId,
  };
};

function PieCardChart({ chartData, totalSpent }) {
  const wrapRef = React.useRef(null);
  const [width, setWidth] = useState(400);

  useEffect(() => {
    if (!wrapRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(wrapRef.current);
    setWidth(wrapRef.current.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={pieWrap}>
      <PieChart
        series={[{ innerRadius: 80, outerRadius: 100, data: chartData }]}
        width={width}
        height={pieheight}
        hideLegend
      />
      <div style={pieCenterLabel}>
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 6,
              fontWeight: 700,
            }}
          >
            Expenses
          </div>
          <div
            style={{
              fontSize: 34,
              lineHeight: 1,
              fontWeight: 700,
              whiteSpace: "nowrap",
              letterSpacing: "-0.02em",
            }}
          >
            ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [homeData, setHomeData] = useState(() => readHomeData());
  const [activePanel, setActivePanel] = useState(panels[0]);
  const { categories, transactions, currentBudgetId } = homeData;

  const [goals, setGoals] = useState(() => loadGoals(currentBudgetId));
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [contributeGoal, setContributeGoal] = useState(null);

  useEffect(() => {
    const handler = () => setHomeData(readHomeData());
    window.addEventListener("budget-data-updated", handler);
    return () => window.removeEventListener("budget-data-updated", handler);
  }, []);

  useEffect(() => {
    if (currentBudgetId) setGoals(loadGoals(currentBudgetId));
  }, [currentBudgetId]);

  const handleGoalSave = (goal) => {
    setGoals((prev) =>
      prev.some((g) => g.id === goal.id)
        ? prev.map((g) => (g.id === goal.id ? goal : g))
        : [...prev, goal]
    );
    setShowGoalForm(false);
    setEditGoal(null);
  };

  const handleGoalDelete = (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    setShowGoalForm(false);
    setEditGoal(null);
  };

  const handleContribute = (id, amount) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, saved: Math.min(g.saved + amount, g.target) } : g
      )
    );
    setContributeGoal(null);
  };

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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          <div style={card}>
            <div style={metricLabel}>This Month Spent</div>
            <div style={metricValue}>${totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2, })}</div>
          </div>

          <div style={card}>
            <div style={metricLabel}>Income</div>
            <div style={metricValue}>${income.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2, })}</div>
          </div>

          <div style={card}>
            <div style={metricLabel}>Net</div>
            <div
              style={{
                color: net >= 0 ? "var(--success)" : "var(--danger)",
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {net >= 0 ? "+" : "-"}${Math.abs(net).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2, })}
            </div>
          </div>
        </div>

        {!currentBudgetId ? (
          <div style={{ ...card, padding: 32, textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
              No budget selected. Create a budget to get started.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(320px, 1.2fr) minmax(220px, 0.8fr)",
                gap: 16,
              }}
            >
              <div style={{ ...card, minHeight: 320, position: "relative" }}>
                {chartData.length === 0 ? (
                  <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
                    No transactions this month yet.
                  </div>
                ) : (
                  <PieCardChart chartData={chartData} totalSpent={totalSpent} />
                )}
              </div>

              <div style={{ ...card, minHeight: 320 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <ToggleGroup active={activePanel} setActive={setActivePanel} />
                </div>

                {activePanel === "Top Categories" && (
                  <>
                    {sortedData.length === 0 ? (
                      <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
                        No transactions this month yet.
                      </div>
                    ) : (
                      sortedData.map((item) => {
                        const pct = Math.round((item.value / totalSpent) * 100);
                        return (
                          <div key={item.id} style={{ marginBottom: 14 }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 6,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: item.color,
                                    display: "inline-block",
                                    boxShadow: "0 0 0 3px rgba(0,0,0,0.06)",
                                  }}
                                />
                                <span style={{ color: "var(--text)", fontSize: 13 }}>{item.label}</span>
                              </div>
                              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>${(item.value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2, })}</span>
                            </div>
                            <div
                              style={{
                                background: "var(--surface-soft)",
                                borderRadius: 999,
                                height: 4,
                                overflow: "hidden",
                                border: "1px solid var(--border)",
                              }}
                            >
                              <div
                                style={{
                                  background: item.color,
                                  width: `${pct}%`,
                                  height: "100%",
                                  borderRadius: 999,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </>
                )}

                {activePanel === "Goals" && <GoalsPanel budgetId={currentBudgetId} goals={goals} setGoals={setGoals} onNewGoal={() => { setEditGoal(null); setShowGoalForm(true); }} onEditGoal={(g) => { setEditGoal(g); setShowGoalForm(true); }} onContributeGoal={(g) => setContributeGoal(g)} />}
              </div>
            </div>

            <div style={{ ...card, minHeight: 240 }}>
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                Recent Transactions
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr 1.5fr 1fr",
                  padding: "0 8px 10px",
                  borderBottom: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                <span>Date</span>
                <span>Description</span>
                <span>Category</span>
                <span style={{ textAlign: "right" }}>Amount</span>
              </div>

              {sortedTransactions.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: 14, padding: "12px 8px" }}>
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
                        borderBottom:
                          i < sortedTransactions.length - 1
                            ? "1px solid var(--border)"
                            : "none",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                        {new Date(tx.date).toLocaleDateString()}
                      </span>
                      <span style={{ color: "var(--text)", fontSize: 13 }}>{tx.note}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: meta?.color ?? "#888",
                            display: "inline-block",
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                          {meta?.name || "Unknown"}
                        </span>
                      </span>
                      <span
                        style={{
                          color: "var(--text)",
                          fontSize: 13,
                          textAlign: "right",
                          fontWeight: 500,
                        }}
                      >
                        -${tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2, })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
      {showGoalForm && (
        <GoalFormModal
          goal={editGoal}
          onSave={handleGoalSave}
          onDelete={handleGoalDelete}
          onClose={() => { setShowGoalForm(false); setEditGoal(null); }}
        />
      )}
      {contributeGoal && (
        <ContributeModal
          goal={contributeGoal}
          onSave={handleContribute}
          onClose={() => setContributeGoal(null)}
        />
      )}
    </DesktopLayout>
  );
}
