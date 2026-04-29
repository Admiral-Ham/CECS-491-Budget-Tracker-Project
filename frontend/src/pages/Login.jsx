import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.login({
        email,
        password,
      });

      nav("/home");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={page}>
      <form onSubmit={onSubmit} style={card}>
        <h1 style={{ marginTop: 0, marginBottom: 6 }}>Sign in</h1>

        <label style={label}>Email</label>
        <input
          style={input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          autoComplete="email"
          required
        />

        <label style={label}>Password</label>
        <input
          style={input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoComplete="current-password"
          required
        />

        {error && <div style={errorStyle}>{error}</div>}

        <button type="submit" disabled={loading} style={button}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div style={footerRow}>
          <button
            type="button"
            onClick={() => nav("/forgot-password")}
            style={linkBtn}
          >
            Forgot password?
          </button>

          <button
            type="button"
            onClick={() => nav("/register")}
            style={linkBtn}
          >
            Create account
          </button>
        </div>
      </form>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  width: "100vw",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 24,
  background: "#0b1220",
  color: "white",
};

const card = {
  width: "100%",
  maxWidth: 420,
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
};

const label = {
  display: "block",
  marginTop: 12,
  marginBottom: 6,
  opacity: 0.85,
};

const input = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#0b1220",
  color: "white",
  outline: "none",
  boxSizing: "border-box",
};

const button = {
  marginTop: 16,
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "none",
  background: "#14b8a6",
  color: "#041012",
  fontWeight: 900,
  cursor: "pointer",
};

const errorStyle = {
  marginTop: 10,
  color: "#fb7185",
  fontSize: 13,
};

const footerRow = {
  marginTop: 14,
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
};

const linkBtn = {
  background: "transparent",
  border: "none",
  color: "rgba(255,255,255,0.8)",
  cursor: "pointer",
  padding: 0,
  textDecoration: "underline",
  fontSize: 13,
};