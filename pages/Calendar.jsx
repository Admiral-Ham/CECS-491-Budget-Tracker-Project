import { useEffect, useState } from "react";
import DesktopLayout from "../components/DesktopLayout";
import { api } from "../api/client";

const card = {
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 16,
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
  const [currentBudgetId, setCurrentBudgetId] = useState(null);
  
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
        return;
      }

      const txs = await api.getTransactions(budgetId);
      setTransactions(txs);
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
  
  return (
    <DesktopLayout title="Calendar">
      <div style={card}>
        {!currentBudgetId && (
          <div style={{ color: "#94a3b8", marginBottom: 16 }}>
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
                style={isToday ? { ...dayCell, ...todayCell } : dayCell}
              >
                <div style={{ fontWeight: isToday ? 700 : 500 }}>{day}</div>
                {hasTransactions(day) && <div style={indicator}></div>}
              </div>
            );
          })}
        </div>
      </div>
    </DesktopLayout>
  );
}




/* Styling From here on */
const headerRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 16,
};

const navButton = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "white",
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
  background: "rgba(20, 184, 166, 0.15)",
  border: "1px solid rgba(20, 184, 166, 0.5)",
  color: "white",
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
  color: "white",
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
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  position: "relative",
  transition: "all 0.2s",
};

const todayCell = {
  background: "rgba(20, 184, 166, 0.15)",
  border: "1px solid rgba(20, 184, 166, 0.5)",
};

const indicator = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "#14b8a6",
  marginTop: 4,
};
