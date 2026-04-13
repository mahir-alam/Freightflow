import { useEffect, useState } from "react";
import Header from "../components/Header";
import api from "../services/api";
import StatCard from "../components/StatCard";
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
  LineChart,
  Line,
  CartesianGrid,
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

const Card = ({ title, subtitle, children, className = "" }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
    {(title || subtitle) && (
      <div className="mb-5">
        {title && <h2 className="text-xl font-semibold">{title}</h2>}
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
    )}
    {children}
  </section>
);

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    shipmentStatusData: [],
    truckAvailabilityData: [],
    revenueSummary: {
      totalRevenue: 0,
      averageShipmentValue: 0,
      totalCommission: 0,
      averageCommission: 0,
      averageCommissionRate: 0,
    },
    operationsSummary: {
      totalShipments: 0,
      completedShipments: 0,
      assignedShipments: 0,
      completionRate: 0,
      assignmentRate: 0,
    },
    fleetSummary: {
      totalTrucks: 0,
      assignedTrucks: 0,
      availableTrucks: 0,
      truckUtilizationRate: 0,
    },
    routeInsights: [],
    pickupInsights: [],
    dropoffInsights: [],
    truckTypeInsights: [],
    monthlyRevenueData: [],
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

  const formatPercent = (value) => `${Number(value).toFixed(1)}%`;

  const monthlyRevenueChartData = analytics.monthlyRevenueData.map((item) => ({
    ...item,
    revenueDisplay: Number(item.revenue) * currencyRates[currency],
    commissionDisplay: Number(item.commission) * currencyRates[currency],
  }));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="mt-2 text-slate-600">
              Monitor shipment performance, route demand, truck utilization,
              revenue flow, and brokerage commission trends.
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
            <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <StatCard
                title="Total Revenue"
                value={formatCurrency(analytics.revenueSummary.totalRevenue)}
                description="Total negotiated shipment value"
              />
              <StatCard
                title="Total Commission"
                value={formatCurrency(analytics.revenueSummary.totalCommission)}
                description="Total brokerage earnings tracked"
              />
              <StatCard
                title="Avg Shipment Value"
                value={formatCurrency(analytics.revenueSummary.averageShipmentValue)}
                description="Average negotiated value per shipment"
              />
              <StatCard
                title="Avg Commission"
                value={formatCurrency(analytics.revenueSummary.averageCommission)}
                description="Average commission per shipment"
              />
              <StatCard
                title="Avg Commission Rate"
                value={formatPercent(analytics.revenueSummary.averageCommissionRate)}
                description="Average commission as % of shipment value"
              />
            </section>

            <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Shipments"
                value={analytics.operationsSummary.totalShipments}
                description="All shipment records in the platform"
              />
              <StatCard
                title="Completion Rate"
                value={formatPercent(analytics.operationsSummary.completionRate)}
                description="Share of shipments completed"
              />
              <StatCard
                title="Assignment Rate"
                value={formatPercent(analytics.operationsSummary.assignmentRate)}
                description="Share of shipments with assigned trucks"
              />
              <StatCard
                title="Truck Utilization"
                value={formatPercent(analytics.fleetSummary.truckUtilizationRate)}
                description="Share of fleet currently assigned"
              />
            </section>

            <section className="mb-8 grid gap-6 xl:grid-cols-2">
              <Card
                title="Shipment Status Breakdown"
                subtitle="Distribution of shipment workflow stages"
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.shipmentStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card
                title="Truck Availability Breakdown"
                subtitle="Current operational availability across external trucks"
              >
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
              </Card>
            </section>

            <section className="mb-8 grid gap-6 xl:grid-cols-2">
              <Card
                title="Revenue Trend"
                subtitle="Revenue and commission across shipment months"
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyRevenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="revenueDisplay"
                        name="Revenue"
                        stroke="#2563eb"
                        strokeWidth={3}
                      />
                      <Line
                        type="monotone"
                        dataKey="commissionDisplay"
                        name="Commission"
                        stroke="#10b981"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card
                title="Truck Type Demand"
                subtitle="Shipment demand by required truck type"
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.truckTypeInsights}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="truckType" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </section>

            <section className="mb-8 grid gap-6 xl:grid-cols-2">
              <Card
                title="Top Pickup Locations"
                subtitle="Highest shipment volume by pickup point"
              >
                <div className="space-y-3">
                  {analytics.pickupInsights.length === 0 ? (
                    <p className="text-sm text-slate-500">No pickup insight data available.</p>
                  ) : (
                    analytics.pickupInsights.map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                      >
                        <span className="font-medium text-slate-800">{item.name}</span>
                        <span className="text-sm text-slate-500">{item.count} shipments</span>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card
                title="Top Dropoff Locations"
                subtitle="Highest shipment volume by destination"
              >
                <div className="space-y-3">
                  {analytics.dropoffInsights.length === 0 ? (
                    <p className="text-sm text-slate-500">No dropoff insight data available.</p>
                  ) : (
                    analytics.dropoffInsights.map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                      >
                        <span className="font-medium text-slate-800">{item.name}</span>
                        <span className="text-sm text-slate-500">{item.count} shipments</span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </section>

            <section className="grid gap-6">
              <Card
                title="Top Route Insights"
                subtitle="Highest volume routes with price and commission intelligence"
              >
                {analytics.routeInsights.length === 0 ? (
                  <p className="text-sm text-slate-500">No route insight data available.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="border-b border-slate-200 text-left text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Pickup</th>
                          <th className="px-4 py-3">Dropoff</th>
                          <th className="px-4 py-3">Shipments</th>
                          <th className="px-4 py-3">Avg Price</th>
                          <th className="px-4 py-3">Total Commission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.routeInsights.map((route, index) => (
                          <tr key={index} className="border-b border-slate-100">
                            <td className="px-4 py-3 font-medium">{route.pickupLocation}</td>
                            <td className="px-4 py-3">{route.dropoffLocation}</td>
                            <td className="px-4 py-3">{route.shipmentCount}</td>
                            <td className="px-4 py-3">
                              {formatCurrency(route.averagePrice)}
                            </td>
                            <td className="px-4 py-3">
                              {formatCurrency(route.totalCommission)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </section>
          </>
        )}
      </main>
    </div>
  );
}