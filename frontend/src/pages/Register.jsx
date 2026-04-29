import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";

export default function Register() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Username is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await api.register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setSuccess("Account created successfully. Redirecting to sign in...");
      setTimeout(() => {
        nav("/", { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={page}>
      <form onSubmit={onSubmit} style={card}>
        <h1 style={{ marginTop: 0, marginBottom: 6 }}>Create Account</h1>

        <label style={label}>Username</label>
        <input
          style={input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Username"
          autoComplete="username"
        />

        <label style={label}>Email</label>
        <input
          style={input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          autoComplete="email"
        />

        <label style={label}>Password</label>
        <input
          style={input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          autoComplete="new-password"
        />

        <label style={label}>Confirm password</label>
        <input
          style={input}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          autoComplete="new-password"
        />

        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}

        <button type="submit" disabled={loading} style={button}>
          {loading ? "Creating..." : "Create account"}
        </button>

        <div style={footerCenter}>
          <Link to="/" style={linkStyle}>
            Back to sign in
          </Link>
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
  background:
    "radial-gradient(circle at top right, rgba(76, 132, 194, 0.18), transparent 18%), radial-gradient(circle at bottom left, rgba(76, 132, 194, 0.18), transparent 18%), linear-gradient(90deg, #051b25 0%, #081f4f 45%, #163b67 100%)",
  color: "white",
};

const card = {
  width: "100%",
  maxWidth: 420,
  background: "#071a34",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  padding: 22,
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
  background: "#031227",
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
  background: "#95c8da",
  color: "#041012",
  fontWeight: 900,
  cursor: "pointer",
};

const errorStyle = {
  marginTop: 10,
  color: "#fca5a5",
  fontSize: 13,
};

const successStyle = {
  marginTop: 10,
  color: "#93c5fd",
  fontSize: 13,
};

const footerCenter = {
  marginTop: 16,
  textAlign: "center",
};

const linkStyle = {
  color: "rgba(255,255,255,0.78)",
  fontSize: 13,
};