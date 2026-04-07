import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        <div>
          <p className="text-sm font-medium tracking-wide text-blue-600">
            FreightFlow
          </p>
          <h1 className="text-xl font-bold">Operations Platform</h1>
        </div>

        <nav className="flex gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-black">Dashboard</Link>
          <Link to="/shipments" className="hover:text-black">Shipments</Link>
          <Link to="/trucks" className="hover:text-black">Trucks</Link>
          <Link to="/analytics" className="hover:text-black">Analytics</Link>
        </nav>

      </div>
    </header>
  );
}