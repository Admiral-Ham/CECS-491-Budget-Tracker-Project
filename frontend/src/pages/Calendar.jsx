import { useEffect, useState } from "react";
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

export default function Calendar() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentBudgetId, setCurrentBudgetId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
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
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const handleDayClick = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
  };

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
        setTransactions([]);
        setCategories([]);
        return;
      }

      const txs = await api.getTransactions(budgetId);
      const cats = await api.getCategories(budgetId);
      setTransactions(txs);
      setCategories(cats);
    } catch (error) {
      console.error("Failed to load calendar data:", error);
    }
  };

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener("budget-data-updated", handler);
    return () => window.removeEventListener("budget-data-updated", handler);
  }, []);
  
  // Check if a date has transactions
  const hasTransactions = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return transactions.some(tx => tx.date === dateStr);
  };

  const getSelectedDateTransactions = () => {
    if (!selectedDate) return [];
    return transactions
      .filter((tx) => tx.date === selectedDate)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
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

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "Unknown";
  };

  const selectedDateTransactions = getSelectedDateTransactions();
  const selectedDateTotal = selectedDateTransactions.reduce((sum, tx) => sum + tx.amount, 0);


  return (
    <DesktopLayout title="Calendar">
      <div style={{ display: "flex", gap: 16, height: "100%", minWidth: 0 }}>
        {/* Calendar Section */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <div style={card}>
            {!currentBudgetId && (
              <div style={{ color: "var(--text-muted)", marginBottom: 16 }}>
                No budget selected. Create a budget to see transactions on the calendar.
              </div>
            )}


        {/* Calendar Header */}
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


        {/* Day names header */}
        <div style={calendarGrid}>
          {dayNames.map(name => (
            <div key={name} style={dayNameCell}>{name}</div>
          ))}
        </div>


        {/* Calendar days */}
        <div style={calendarGrid}>
          {/* Empty cells before the 1st of the month */}
          {Array(firstDay).fill(null).map((_, i) => (
            <div key={`empty-${i}`} style={emptyDayCell}></div>
          ))}
          
          {/* Actual day cells (1, 2, 3, ... 28, 29, 30, 31) */}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const day = i + 1;  // Convert 0-based index to 1-based day
            const isToday = 
              day === today.getDate() && 
              currentMonth === today.getMonth() && 
              currentYear === today.getFullYear();
            
            return (
              <div
                key={day}
                onClick={() => handleDayClick(day)}
                style={{
                  ...(isToday ? { ...dayCell, ...todayCell } : dayCell),
                  ...(selectedDate === `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                    ? selectedDayCell
                    : {}),
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: isToday ? 700 : 500 }}>{day}</div>
                {hasTransactions(day) && <div style={indicator}></div>}
              </div>
            );
          })}
        </div>
          </div>
        </div>

        {/* Side Drawer - slides in from right within flex layout */}
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
          {/* Drawer Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--border)", gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
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
                transition: "color 0.2s",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          {/* Drawer Content */}
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
                <p style={{ color: "var(--text-muted)", margin: "0 0 16px 0", fontSize: 14 }}>
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
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500, marginBottom: 4, color: "var(--text)" }}>
                          {tx.note || "Untitled transaction"}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {getCategoryName(tx.categoryId)}
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
              </>
            )}
          </div>
        </div>
      </div>

    </DesktopLayout>
  );
}




/* I HATE STYLING SO MUCH RAHAHAHAHAH */
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
  transition: "all 0.2s",
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
  transition: "all 0.2s",
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
  transition: "all 0.2s",
  color: "var(--text)",
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