import { NavLink } from "react-router-dom";

export default function DesktopLayout({ title, children }) {
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div style={shell}>
      <div style={bgOrnamentA} />
      <div style={bgOrnamentB} />

      <aside style={sidebar}>
        <div style={brandWrap}>
          <div style={brandBadge}>BA</div>
          <div>
            <div style={brandTitle}>Budget App</div>
          </div>
        </div>

        <NavLink to="/home" style={navItemStyle}>Home</NavLink>
        <NavLink to="/budget" style={navItemStyle}>Budget</NavLink>
        <NavLink to="/calendar" style={navItemStyle}>Calendar</NavLink>
        <NavLink to="/settings" style={navItemStyle}>Settings</NavLink>

      </aside>

      <main style={main}>
        <header style={header}>
          <h1 style={{ margin: 0, fontSize: 32 }}>{title}</h1>
          <div style={headerDate}>{todayLabel}</div>
        </header>

        <div style={content}>
          {children}
        </div>
      </main>
    </div>
  );
}

const shell = {
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  position: "relative",
  overflow: "hidden",
  color: "var(--text)",
};

const bgOrnamentA = {
  position: "absolute",
  width: 420,
  height: 420,
  borderRadius: "50%",
  background: "radial-gradient(circle, var(--orb-a), transparent)",
  top: -180,
  left: -120,
  pointerEvents: "none",
};

const bgOrnamentB = {
  position: "absolute",
  width: 340,
  height: 340,
  borderRadius: "50%",
  background: "radial-gradient(circle, var(--orb-b), transparent)",
  right: -120,
  bottom: -120,
  pointerEvents: "none",
};

const sidebar = {
  width: 250,
  padding: 18,
  borderRight: "1px solid var(--border)",
  background: "var(--surface-strong)",
  backdropFilter: "blur(10px)",
  zIndex: 1,
};

const main = {
  flex: 1,
  padding: 24,
  zIndex: 1,
};

const header = {
  marginBottom: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const content = {
  width: "100%",
  animation: "fadeUp 220ms ease",
};

const brandWrap = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 20,
  paddingBottom: 12,
  borderBottom: "1px solid var(--border)",
};

const brandBadge = {
  width: 38,
  height: 38,
  borderRadius: 12,
  display: "grid",
  placeItems: "center",
  fontWeight: 800,
  color: "#05202d",
  background: "linear-gradient(145deg, #a7d8e6, #76c1d8)",
};

const brandTitle = {
  fontFamily: "Space Grotesk, sans-serif",
  fontWeight: 700,
  fontSize: 18,
  color: "var(--text)",
};

const headerDate = {
  color: "var(--text-muted)",
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const navItemStyle = ({ isActive }) => ({
  display: "block",
  padding: "12px 12px",
  borderRadius: 12,
  marginBottom: 9,
  color: isActive ? "#061821" : "var(--text)",
  textDecoration: "none",
  border: `1px solid ${isActive ? "rgba(131, 200, 219, 0.9)" : "var(--border)"}`,
  background: isActive
    ? "linear-gradient(140deg, #a7d8e6, #76c1d8)"
    : "var(--surface-soft)",
  boxShadow: isActive ? "0 8px 18px rgba(17, 24, 39, 0.35)" : "none",
  fontWeight: isActive ? 800 : 600,
});