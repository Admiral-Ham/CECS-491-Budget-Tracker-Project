import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Budget from "./pages/Budget";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Budget />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}