import { api } from "../api/client";
import DesktopLayout from "../components/DesktopLayout";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const nav = useNavigate();

  function onLearn() {
    window.open("https://consumer.gov/your-money/making-budget");
  }

  function onLogout() {
    api.logout(); //clears JWT token
    nav("/", { replace: true });
  }

  return (
    <DesktopLayout title="Settings">
      <div style={{ display: "grid", gap: 16 }}>
        <div style={itemStyle} onClick={onLearn}>
          Learn
        </div>

        <div style={itemStyle}>Privacy</div>
        <div style={itemStyle}>About</div>

        <div style={{ ...itemStyle, color: "#be0000" }} onClick={onLogout}>
          Log out
        </div>
      </div>
    </DesktopLayout>
  );
}

const itemStyle = {
  background: "#111b33",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 16,
  cursor: "pointer",
};