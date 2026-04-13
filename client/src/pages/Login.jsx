import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRolePrefill = (role) => {
    if (role === "admin") {
      setFormData({
        email: "admin@freightflow.com",
        password: "admin123",
      });
    } else {
      setFormData({
        email: "client@freightflow.com",
        password: "client123",
      });
    }

    setError("");
  };

  const handleQuickDemoAccess = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/login", {
        email: "demo@freightflow.com",
        password: "demo123",
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.error || "Quick demo access failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/login", formData);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      if (response.data.user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/shipments");
      }
    } catch (error) {
      setError(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12">
        <div className="grid w-full gap-10 lg:grid-cols-2">
          <section className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              FreightFlow
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900">
              Logistics brokerage operations built for real workflow management.
            </h1>

            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Manage shipment requests, truck assignments, workflow status,
              analytics, and commission-based operations through one platform.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Shipment Operations
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  Workflow
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Truck Coordination
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  Managed
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Analytics
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  Integrated
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Sign in to FreightFlow
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Role-based access for logistics brokerage operations.
                </p>
              </div>

              <div className="mb-6 grid gap-3">
                <button
                  type="button"
                  onClick={() => handleRolePrefill("admin")}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Admin Access
                </button>

                <button
                  type="button"
                  onClick={() => handleRolePrefill("client")}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Client Access
                </button>

                <button
                  type="button"
                  onClick={handleQuickDemoAccess}
                  disabled={loading}
                  className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Opening Demo..." : "Quick Demo Access"}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">
                  Select a role above to load the appropriate access profile, or
                  use quick demo access to preview the full operations platform.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}