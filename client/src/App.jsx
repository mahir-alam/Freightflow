import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Shipments from "./pages/Shipments";
import Trucks from "./pages/Trucks";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/" element={token ? <Dashboard /> : <Login />} />
      <Route path="/shipments" element={<Shipments />} />
      <Route path="/trucks" element={<Trucks />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}