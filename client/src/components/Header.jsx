import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdminLike = ["admin", "demo_admin"].includes(user?.role);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navLinkClass = (path) => {
    const isActive = location.pathname === path;

    return `rounded-lg px-4 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-blue-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-semibold tracking-wide text-blue-600">
              FreightFlow
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              Operations Platform
            </h1>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
                <p className="text-sm font-semibold text-slate-900">
                  {user.fullName}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {user.role}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-2 border-t border-slate-200 py-3">
            {isAdminLike && (
              <Link to="/dashboard" className={navLinkClass("/dashboard")}>
                Dashboard
              </Link>
            )}

            <Link to="/shipments" className={navLinkClass("/shipments")}>
              Shipments
            </Link>

            {isAdminLike && (
              <>
                <Link to="/trucks" className={navLinkClass("/trucks")}>
                  Trucks
                </Link>
                <Link to="/analytics" className={navLinkClass("/analytics")}>
                  Analytics
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}