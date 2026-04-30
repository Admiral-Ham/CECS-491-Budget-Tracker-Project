import { useState, useEffect } from "react";
import DesktopLayout from "../components/DesktopLayout";
import { useNavigate } from "react-router-dom";

function ExpandableItem({ label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ ...itemStyle, padding: 0, overflow: "hidden" }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
      >
        <span>{label}</span>
        <span
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            display: "inline-block",
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </div>
      {open && (
        <div
          style={{
            padding: "0 18px 18px",
            borderTop: "1px solid var(--border)",
            color: "var(--text-muted)",
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.7,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const nav = useNavigate();
  const [isLight, setIsLight] = useState(
    () => localStorage.getItem("theme") === "light"
  );

  useEffect(() => {
    const theme = isLight ? "light" : "dark";
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [isLight]);

  function onLearn() {
    window.open("https://consumer.gov/your-money/making-budget");
  }

  function onLogout() {
    nav("/login", { replace: true });
  }

  return (
    <DesktopLayout title="Settings">
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ ...itemStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>
              {isLight ? "Light Mode" : "Dark Mode"}
            </div>
          </div>
          <button
            onClick={() => setIsLight((v) => !v)}
            style={{
              position: "relative",
              width: 52,
              height: 28,
              borderRadius: 999,
              border: "none",
              background: isLight
                ? "linear-gradient(135deg, #5bbcd6, #3a9ec0)"
                : "rgba(255,255,255,0.1)",
              cursor: "pointer",
              padding: 0,
              transition: "background 0.3s ease",
              flexShrink: 0,
              boxShadow: isLight
                ? "0 2px 8px rgba(91, 188, 214, 0.4)"
                : "inset 0 1px 3px rgba(0,0,0,0.4)",
              transform: "none",
            }}
            aria-label="Toggle light mode">
            <span
              style={{
                position: "absolute",
                top: 3,
                left: isLight ? 27 : 3,
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#fff",
                transition: "left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
              }}
            />
          </button>
        </div>
        <div style={itemStyle} onClick={onLearn}>
          Learn Budgeting Basics
        </div>
        <ExpandableItem label="Privacy">
          <p style={{ margin: "12px 0 0" }}>
            Your personal data will not be sold to third parties. Your data is stored securely and is only used to help you manage your finances.
          </p>
        </ExpandableItem>

        <ExpandableItem label="About This App">
          <p style={{ margin: "12px 0 0" }}>
            <strong style={{ color: "var(--text)" }}>Version 1.0.0</strong>
          </p>
          <p style={{ margin: "0 0 0" }}>
            This is a group project for CECS 491 created by team Technical Solutions: Albert Salmoran, Anthony Theng, Edgar Ruiz, Jason Le, and Salvador Sanchez.
            This app provides tools and resources to help you create a budget, spend your money wisely, and plan for future expenses.
            The primary goal while developing this app was to teach financial literacy and budgeting skills but can be used by anyone looking for a simple free budgeting tool.
          </p>
        </ExpandableItem>

        <div style={{ ...itemStyle, color: "#be0000" }} onClick={onLogout}>
          Log out
        </div>
      </div>
    </DesktopLayout>
  );
}

const itemStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 18,
  cursor: "pointer",
  fontWeight: 700,
  letterSpacing: "0.01em",
  backdropFilter: "blur(6px)",
};