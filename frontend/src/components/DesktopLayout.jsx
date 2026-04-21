import { Link } from "react-router-dom";

export default function DesktopLayout({ title, children }) {
  return (
    <div style={page}>
      <aside style={sidebar}>
        <h2 style={{ marginTop: 0 }}>Budget App</h2>

        <nav style={nav}>
          <Link style={navLink} to="/home">Budget</Link>
          <Link style={navLink} to="/settings">Settings</Link>
        </nav>
      </aside>

      <main style={main}>
        <header style={header}>
          <h1 style={{ margin: 0, fontSize: 24 }}>{title}</h1>
        </header>

        <section>{children}</section>
      </main>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "240px 1fr",
  background: "#0b1220",
  color: "white",
};

const sidebar = {
  padding: 20,
  borderRight: "1px solid rgba(255,255,255,0.08)",
  background: "#0f172a",
};

const nav = {
  display: "grid",
  gap: 10,
  marginTop: 20,
};

const navLink = {
  color: "#cbd5e1",
  textDecoration: "none",
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.04)",
};

const main = {
  padding: 24,
};

const header = {
  marginBottom: 20,
};