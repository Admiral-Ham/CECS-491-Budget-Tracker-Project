import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useState } from "react";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Budget from "./pages/Budget";
import Calendar from "./pages/Calendar";
import DayTransactions from "./pages/DayTransactions";
import Settings from "./pages/Settings";
import CreateAccount from "./pages/CreateAccount";
import ForgotPassword from "./pages/ForgotPassword";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/calendar/day/:date" element={<DayTransactions />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
