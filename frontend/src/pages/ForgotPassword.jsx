import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    // Temporary frontend-only flow until backend reset endpoint is added.
    setSubmitted(true);
  }

  return (
    <div style={page}>
      <div style={orbA} />
      <div style={orbB} />

      <form onSubmit={onSubmit} style={card}>
        <h1 style={{ marginTop: 0, marginBottom: 6, fontSize: 34 }}>
          Forgot Password
        </h1>
        <p style={{ marginTop: 0, marginBottom: 14, color: "var(--text-muted)" }}>
          Enter your email and we will send you a password reset link.
        </p>

        <label style={label}>Email</label>
        <input
          style={input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@email.com"
          autoComplete="email"
        />

        {error && <div style={errorStyle}>{error}</div>}
        {submitted && (
          <div style={successStyle}>
            Password reset link sent to {email}.
          </div>
        )}

        <button type="submit" style={button}>
          Send reset link
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
  maxWidth: 420,
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 20,
  padding: 24,
  boxShadow: "0 24px 52px rgba(0,0,0,0.18)",
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
  background: "linear-gradient(140deg, rgba(167, 216, 230, 0.92), rgba(118, 193, 216, 0.92))",
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

const successStyle = {
  marginTop: 10,
  color: "var(--success)",
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
