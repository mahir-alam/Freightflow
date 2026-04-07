import { useEffect, useState } from "react";
import Header from "../components/Header";
import api from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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

const pieColors = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    shipmentStatusData: [],
    truckAvailabilityData: [],
    revenueSummary: {
      totalRevenue: 0,
      averageShipmentValue: 0,
      totalCommission: 0,
    },
  });
  const [currency, setCurrency] = useState("BDT");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/api/analytics");
        setAnalytics(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="mt-2 text-slate-600">
              Monitor operational trends across shipment workflows, truck availability,
              revenue, and commission performance.
            </p>
          </div>

          <div className="w-full md:w-48">
            <label
              htmlFor="analyticsCurrency"
              className="mb-2 block text-sm font-medium text-slate-600"
            >
              Revenue Currency
            </label>
            <select
              id="analyticsCurrency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium shadow-sm outline-none focus:border-blue-500"
            >
              <option value="BDT">BDT</option>
              <option value="CAD">CAD</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-600">Loading analytics...</p>
        ) : (
          <>
            <section className="mb-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Total Revenue</p>
                <h2 className="mt-3 text-3xl font-bold">
                  {formatCurrency(analytics.revenueSummary.totalRevenue)}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Sum of negotiated shipment values
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Average Shipment Value</p>
                <h2 className="mt-3 text-3xl font-bold">
                  {formatCurrency(analytics.revenueSummary.averageShipmentValue)}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Average negotiated value per shipment
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Total Commission</p>
                <h2 className="mt-3 text-3xl font-bold">
                  {formatCurrency(analytics.revenueSummary.totalCommission)}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Total brokerage commission tracked
                </p>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold">Shipment Status Breakdown</h2>
                  <p className="text-sm text-slate-500">
                    Distribution of shipment workflow stages
                  </p>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.shipmentStatusData}>
                      <XAxis dataKey="status" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold">Truck Availability Breakdown</h2>
                  <p className="text-sm text-slate-500">
                    Current operational availability across external trucks
                  </p>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.truckAvailabilityData}
                        dataKey="count"
                        nameKey="availabilityStatus"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        label
                      >
                        {analytics.truckAvailabilityData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={pieColors[index % pieColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}