import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Shipments from "./pages/Shipments";
import Trucks from "./pages/Trucks";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function getSafeUser() {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Invalid user data in localStorage:", error);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
}

export default function App() {
  const token = localStorage.getItem("token");
  const user = getSafeUser();

  return (
    <Routes>
      <Route
        path="/"
        element={
          token && user ? (
            user.role === "admin" ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/shipments" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/shipments"
        element={
          <ProtectedRoute>
            <Shipments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/trucks"
        element={
          <AdminRoute>
            <Trucks />
          </AdminRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <AdminRoute>
            <Analytics />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}