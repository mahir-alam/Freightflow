import { Navigate } from "react-router-dom";

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

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = getSafeUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/shipments" replace />;
  }

  return children;
}