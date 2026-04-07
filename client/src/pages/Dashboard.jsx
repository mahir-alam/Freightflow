import { useEffect, useState } from "react";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import api from "../services/api";

const currencyRates = {
  BDT: 1,
  USD: 1 / 110,
  CAD: 1 / 81,
};

const currencySymbols = {
  BDT: "৳",
  USD: "$",
  CAD: "C$",
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalShipments: 0,
    pendingShipments: 0,
    activeShipments: 0,
    availableTrucks: 0,
    totalRevenue: 0,
  });
  const [currency, setCurrency] = useState("BDT");
  const [message, setMessage] = useState("Checking server connection...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [healthResponse, statsResponse] = await Promise.all([
          api.get("/"),
          api.get("/api/dashboard"),
        ]);

        setMessage(healthResponse.data.message);
        setStats(statsResponse.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setMessage("Backend connection failed");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amountInBdt) => {
    const convertedAmount = Number(amountInBdt) * currencyRates[currency];

    return `${currencySymbols[currency]}${convertedAmount.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const dashboardCards = [
    {
      title: "Active Shipments",
      value: stats.activeShipments,
      description: "Shipments currently being processed",
    },
    {
      title: "Available Trucks",
      value: stats.availableTrucks,
      description: "External trucks ready for assignment",
    },
    {
      title: "Pending Requests",
      value: stats.pendingShipments,
      description: "Shipment requests awaiting admin action",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      description: "Total negotiated shipment value",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Shipment operations overview
            </h2>
            <p className="mt-2 max-w-3xl text-slate-600">
              A data-driven logistics brokerage platform designed to manage
              shipment operations, truck assignments, negotiated pricing, and
              commission-based workflows.
            </p>
          </div>

          <div className="w-full md:w-48">
            <label
              htmlFor="dashboardCurrency"
              className="mb-2 block text-sm font-medium text-slate-600"
            >
              Revenue Currency
            </label>
            <select
              id="dashboardCurrency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium shadow-sm outline-none focus:border-blue-500"
            >
              <option value="BDT">BDT</option>
              <option value="CAD">CAD</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </section>

        {loading ? (
          <p className="text-slate-600">Loading dashboard data...</p>
        ) : (
          <>
            <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {dashboardCards.map((card) => (
                <StatCard
                  key={card.title}
                  title={card.title}
                  value={card.value}
                  description={card.description}
                />
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Operations Summary</h3>
                    <p className="text-sm text-slate-500">
                      Live workflow visibility across shipments and assignments
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                    System Active
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">
                      Shipment Metrics
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-700">
                      <li>• Total shipments: {stats.totalShipments}</li>
                      <li>• Pending requests: {stats.pendingShipments}</li>
                      <li>• Active shipments: {stats.activeShipments}</li>
                      <li>• Revenue tracked from PostgreSQL</li>
                    </ul>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">
                      Fleet Readiness
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-700">
                      <li>• Available trucks: {stats.availableTrucks}</li>
                      <li>• External truck coordination ready</li>
                      <li>• Availability workflow active</li>
                      <li>• Platform data synced with backend</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Backend Status</p>
                <h3 className="mt-2 text-xl font-semibold">API Connection</h3>

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Server Response</p>
                  <p className="mt-2 text-base font-semibold text-slate-800">
                    {message}
                  </p>
                </div>

                <div className="mt-5">
                  <p className="text-sm text-slate-500">Environment</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    Local development with PostgreSQL
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}