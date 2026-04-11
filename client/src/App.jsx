import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Shipments from "./pages/Shipments";
import Trucks from "./pages/Trucks";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

export default function App() {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <Routes>
      <Route
        path="/"
        element={
          token ? (
            user?.role === "admin" ? (
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
    </Routes>
  );
}