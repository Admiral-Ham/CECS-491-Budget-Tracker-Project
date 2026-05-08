import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    //API Endpoint
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
      <div style={orbA} />
      <div style={orbB} />

      <form onSubmit={onSubmit} style={card}>
        <h1 style={{ marginTop: 0, marginBottom: 6, fontSize: 34 }}>
          {" "}
          Create Account{" "}
        </h1>

        <label style={label}>Username</label>
        <input
          style={input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Username"
          autoComplete="name"
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

        <button type="button" onClick={() => nav("/login")} style={linkBtn}>
          Back to sign in
        </button>
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
    "radial-gradient(circle at 14% 12%, var(--orb-a), transparent 36%), radial-gradient(circle at 82% 18%, var(--orb-b), transparent 38%), linear-gradient(130deg, var(--login-bg-start), var(--login-bg-mid) 55%, var(--login-bg-end))",
  color: "var(--text)",
  position: "relative",
  overflow: "hidden",
};

const orbA = {
  position: "absolute",
  width: 280,
  height: 280,
  borderRadius: "50%",
  background: "radial-gradient(circle, var(--orb-a), transparent)",
  top: -80,
  right: -80,
};

const orbB = {
  position: "absolute",
  width: 340,
  height: 340,
  borderRadius: "50%",
  background: "radial-gradient(circle, var(--orb-b), transparent)",
  left: -120,
  bottom: -120,
};

const card = {
  width: "100%",
  maxWidth: 460,
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 20,
  padding: 24,
  boxShadow: "0 24px 52px rgba(0,0,0,0.38)",
  backdropFilter: "blur(8px)",
  position: "relative",
  zIndex: 1,
};

const label = {
  display: "block",
  marginTop: 12,
  marginBottom: 6,
  color: "var(--text-muted)",
  fontWeight: 600,
};

const input = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--login-input-bg)",
  color: "var(--text)",
  outline: "none",
};

const button = {
  marginTop: 16,
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(131, 200, 219, 0.5)",
  background:
    "linear-gradient(140deg, rgba(167, 216, 230, 0.92), rgba(118, 193, 216, 0.92))",
  color: "#061621",
  fontWeight: 900,
  cursor: "pointer",
};

const errorStyle = {
  marginTop: 10,
  color: "var(--danger)",
  fontSize: 13,
  fontWeight: 600,
};

const linkBtn = {
  marginTop: 14,
  width: "100%",
  background: "transparent",
  border: "none",
  color: "var(--text-muted)",
  cursor: "pointer",
  textDecoration: "underline",
  fontSize: 13,
};

const successStyle = {
  marginTop: 10,
  color: "#93c5fd",
  fontSize: 13,
};
