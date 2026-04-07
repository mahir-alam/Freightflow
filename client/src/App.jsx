import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Shipments from "./pages/Shipments";
import Trucks from "./pages/Trucks";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/shipments" element={<Shipments />} />
      <Route path="/trucks" element={<Trucks />} />
      <Route path="/analytics" element={<Analytics />} />
    </Routes>
  );
}