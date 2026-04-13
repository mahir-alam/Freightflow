import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const hostname = window.location.hostname;
  const isLocalEnvironment =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.endsWith(".local");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePrefillAdmin = () => {
    setError("");
    setMode("login");
    setFormData({
      fullName: "",
      email: "admin@freightflow.com",
      password: "admin123",
    });
  };

  const handlePrefillClient = () => {
    setError("");
    setMode("login");
    setFormData({
      fullName: "",
      email: "client@freightflow.com",
      password: "client123",
    });
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

      navigate(
        ["admin", "demo_admin"].includes(response.data.user.role)
          ? "/dashboard"
          : "/shipments"
      );
    } catch (error) {
      console.error("Demo login error:", error);
      setError(error.response?.data?.error || "Failed to access demo");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";

      const payload =
        mode === "signup"
          ? {
              fullName: formData.fullName,
              email: formData.email,
              password: formData.password,
            }
          : {
              email: formData.email,
              password: formData.password,
            };

      const response = await api.post(endpoint, payload);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate(
        ["admin", "demo_admin"].includes(response.data.user.role)
          ? "/dashboard"
          : "/shipments"
      );
    } catch (error) {
      console.error("Auth error:", error);
      setError(
        error.response?.data?.error ||
          (mode === "signup" ? "Failed to create account" : "Failed to login")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            FreightFlow
          </p>
          <h1 className="mt-3 text-5xl font-bold leading-tight text-slate-900">
            Logistics brokerage operations built for real workflow management.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-600">
            Manage shipment requests, truck assignments, workflow status,
            analytics, and commission-based operations through one platform.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Shipment Operations</p>
              <p className="mt-2 text-2xl font-bold">Workflow</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Truck Coordination</p>
              <p className="mt-2 text-2xl font-bold">Managed</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Analytics</p>
              <p className="mt-2 text-2xl font-bold">Integrated</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-slate-900">
            {mode === "signup" ? "Create your account" : "Sign in to FreightFlow"}
          </h2>
          <p className="mt-2 text-slate-500">
            {mode === "signup"
              ? "New accounts are created with client access."
              : "Use Quick Demo to explore the full product with demo data."}
          </p>

          {mode === "login" && (
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleQuickDemoAccess}
                disabled={loading}
                className="w-full rounded-xl border border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Quick Demo
              </button>

              {isLocalEnvironment && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handlePrefillAdmin}
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Admin Access
                  </button>

                  <button
                    type="button"
                    onClick={handlePrefillClient}
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Client Access
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                placeholder="Enter your password"
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
              className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading
                ? "Processing..."
                : mode === "signup"
                ? "Create Account"
                : "Sign In"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setFormData({
                      fullName: "",
                      email: "",
                      password: "",
                    });
                  }}
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                    setFormData({
                      fullName: "",
                      email: "",
                      password: "",
                    });
                  }}
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Create an account
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}