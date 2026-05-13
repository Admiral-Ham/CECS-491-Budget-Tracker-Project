import { useEffect, useMemo, useState } from "react";
import DesktopLayout from "../components/DesktopLayout";
import { api } from "../api/client";

const card = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 16,
  backdropFilter: "blur(6px)",
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function getDateKeyFromParts(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getDateKeyFromTransaction(tx) {
  return new Date(tx.creation_time).toISOString().split("T")[0];
}

export default function Calendar() {
  const today = new Date();

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentBudgetId, setCurrentBudgetId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getDateKeyFromParts(today.getFullYear(), today.getMonth(), today.getDate()));

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    async function loadData() {
      try {
        const budgets = await api.getBudgets();

        if (!budgets.length) {
          setCurrentBudgetId(null);
          setTransactions([]);
          setCategories([]);
          return;
        }

        const selectedBudget = budgets[0];
        setCurrentBudgetId(selectedBudget.id);

        const cats = await api.getCategories(selectedBudget.id);
        const allTransactions = await api.getTransactions();

        const budgetTransactions = allTransactions.filter(
          (tx) => tx.budget_id === selectedBudget.id
        );

        setCategories(cats);
        setTransactions(budgetTransactions);
      } catch (error) {
        console.error("Failed to load calendar data:", error);
      }
    }

    loadData();
  }, []);

  const transactionsByDate = useMemo(() => {
    const map = {};

    transactions.forEach((tx) => {
      if (!tx.creation_time) return;

      const key = getDateKeyFromTransaction(tx);

      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(tx);
    });

    return map;
  }, [transactions]);

  const selectedDateTransactions = useMemo(() => {
    if (!selectedDate) return [];

    return [...(transactionsByDate[selectedDate] || [])].sort(
      (a, b) => new Date(b.creation_time) - new Date(a.creation_time)
    );
  }, [selectedDate, transactionsByDate]);

  const selectedDateTotal = selectedDateTransactions.reduce(
    (sum, tx) => sum + Number(tx.amount),
    0
  );

  const categoryMap = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]));
  }, [categories]);

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(getDateKeyFromParts(now.getFullYear(), now.getMonth(), now.getDate()));
  };

  const handleDayClick = (day) => {
    setSelectedDate(getDateKeyFromParts(currentYear, currentMonth, day));
  };

  const hasTransactions = (day) => {
    const dateKey = getDateKeyFromParts(currentYear, currentMonth, day);
    return Boolean(transactionsByDate[dateKey]?.length);
  };

  const getDayTransactions = (day) => {
    const dateKey = getDateKeyFromParts(currentYear, currentMonth, day);
    return transactionsByDate[dateKey] || [];
  };

  const formatDate = (dateStr) => {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryName = (categoryId) => {
    return categoryMap.get(categoryId) || "Unknown";
  };

  return (
    <DesktopLayout title="Calendar">
      <div style={{ display: "flex", gap: 16, height: "100%", minWidth: 0 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <div style={card}>
            {!currentBudgetId && (
              <div style={{ color: "var(--text-muted)", marginBottom: 16 }}>
                No budget selected. Create a budget to see transactions on the calendar.
              </div>
            )}

            <div style={headerRow}>
              <button onClick={goToPreviousMonth} style={navButton}>
                ←
              </button>

              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                {monthNames[currentMonth]} {currentYear}
              </h2>

              <button onClick={goToNextMonth} style={navButton}>
                →
              </button>
            </div>

            <button onClick={goToToday} style={todayButton}>
              Today
            </button>

            <div style={calendarGrid}>
              {dayNames.map((name) => (
                <div key={name} style={dayNameCell}>
                  {name}
                </div>
              ))}
            </div>

            <div style={calendarGrid}>
              {Array(firstDay)
                .fill(null)
                .map((_, i) => (
                  <div key={`empty-${i}`} style={emptyDayCell} />
                ))}

              {Array(daysInMonth)
                .fill(null)
                .map((_, i) => {
                  const day = i + 1;
                  const dateKey = getDateKeyFromParts(currentYear, currentMonth, day);
                  const isToday =
                    day === today.getDate() &&
                    currentMonth === today.getMonth() &&
                    currentYear === today.getFullYear();
                  const isSelected = selectedDate === dateKey;
                  const dayTransactions = getDayTransactions(day);

                  return (
                    <div
                      key={day}
                      onClick={() => handleDayClick(day)}
                      style={{
                        ...dayCell,
                        ...(isToday ? todayCell : {}),
                        ...(isSelected ? selectedDayCell : {}),
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: isToday ? 700 : 500 }}>
                        {day}
                      </div>

                      {hasTransactions(day) && <div style={indicator} />}

                      {dayTransactions.slice(0, 2).map((tx) => (
                        <div key={tx.id} style={dayTransactionText}>
                          {tx.name} · ${Number(tx.amount).toFixed(2)}
                        </div>
                      ))}

                      {dayTransactions.length > 2 && (
                        <div style={dayTransactionMore}>
                          +{dayTransactions.length - 2} more
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div
          style={{
            width: selectedDate ? 320 : 0,
            background: "var(--surface)",
            borderLeft: "1px solid var(--border)",
            transition: "width 0.3s ease-out",
            display: "flex",
            flexDirection: "column",
            padding: selectedDate ? 16 : 0,
            boxSizing: "border-box",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 16,
              paddingBottom: 16,
              borderBottom: "1px solid var(--border)",
              gap: 8,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {selectedDate ? formatDate(selectedDate) : "Select a date"}
            </h3>

            <button
              onClick={() => setSelectedDate(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text)",
                fontSize: 20,
                cursor: "pointer",
                padding: 0,
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
            {!selectedDate ? (
              <p style={{ color: "var(--text-muted)", margin: 0 }}>
                Click a day in the calendar to view transactions.
              </p>
            ) : selectedDateTransactions.length === 0 ? (
              <p style={{ color: "var(--text-muted)", margin: 0 }}>
                No transactions on this day.
              </p>
            ) : (
              <>
                <p
                  style={{
                    color: "var(--text-muted)",
                    margin: "0 0 16px 0",
                    fontSize: 14,
                  }}
                >
                  Total: ${selectedDateTotal.toFixed(2)}
                </p>

                <div style={{ display: "grid", gap: 8 }}>
                  {selectedDateTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      style={{
                        padding: 12,
                        background: "var(--surface-soft)",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 500,
                            marginBottom: 4,
                            color: "var(--text)",
                          }}
                        >
                          {tx.name || "Untitled transaction"}
                        </div>

                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {getCategoryName(tx.category_id)}
                        </div>
                      </div>

                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 16,
                          color: "var(--danger)",
                        }}
                      >
                        ${Number(tx.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DesktopLayout>
  );
}

const headerRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 16,
};

const navButton = {
  background: "var(--surface-soft)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  width: 40,
  height: 40,
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const todayButton = {
  background: "linear-gradient(140deg, rgba(45, 212, 191, 0.26), rgba(56, 189, 248, 0.2))",
  border: "1px solid rgba(45, 212, 191, 0.55)",
  color: "var(--text)",
  padding: "8px 16px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  marginBottom: 16,
};

const calendarGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 12,
};

const dayNameCell = {
  padding: "8px",
  textAlign: "center",
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text-muted)",
};

const emptyDayCell = {
  padding: "12px",
  aspectRatio: "1",
};

const dayCell = {
  padding: "12px",
  aspectRatio: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  background: "var(--surface-soft)",
  border: "1px solid var(--border)",
  position: "relative",
  color: "var(--text)",
  overflow: "hidden",
};

const todayCell = {
  background: "rgba(45, 212, 191, 0.14)",
  border: "1px solid rgba(45, 212, 191, 0.5)",
};

const selectedDayCell = {
  boxShadow: "0 0 0 2px rgba(56, 189, 248, 0.5) inset",
  background: "rgba(56, 189, 248, 0.12)",
};

const indicator = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "#14b8a6",
  marginTop: 4,
};

const dayTransactionText = {
  marginTop: 4,
  maxWidth: "100%",
  fontSize: 10,
  color: "var(--text-muted)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const dayTransactionMore = {
  marginTop: 2,
  fontSize: 10,
  color: "var(--accent)",
};