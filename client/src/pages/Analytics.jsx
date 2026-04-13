import { useEffect, useMemo, useState } from "react";
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
  <section
    className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
  >
    {(title || subtitle) && (
      <div className="mb-5">
        {title && <h2 className="text-xl font-semibold">{title}</h2>}
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
    )}
    {children}
  </section>
);

const MetricCard = ({ title, value, description }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{title}</p>
    <h3 className="mt-2 text-3xl font-bold text-slate-900">{value}</h3>
    <p className="mt-2 text-sm text-slate-500">{description}</p>
  </div>
);

const CompactMetricCard = ({ title, value, description }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{title}</p>
    <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
    <p className="mt-2 text-xs text-slate-500">{description}</p>
  </div>
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
    pandasInsights: {
      mostProfitableRoutes: [],
      lowestMarginRoutes: [],
      routeBenchmarks: [],
      monthlyShipmentTrend: [],
      truckTypeProfitability: [],
      summary: {
        averageMarginPercent: 0,
        highestMarginPercent: 0,
        lowestMarginPercent: 0,
        truckCountAnalyzed: 0,
        shipmentCountAnalyzed: 0,
      },
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
    const convertedAmount = Number(amountInBdt || 0) * currencyRates[currency];

    return `${currencySymbols[currency]}${convertedAmount.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

  const monthlyRevenueChartData = useMemo(() => {
    return analytics.monthlyRevenueData.map((item) => ({
      ...item,
      revenueDisplay: Number(item.revenue || 0) * currencyRates[currency],
      commissionDisplay: Number(item.commission || 0) * currencyRates[currency],
    }));
  }, [analytics.monthlyRevenueData, currency]);

  const pandasMonthlyTrendData = useMemo(() => {
    return analytics.pandasInsights.monthlyShipmentTrend.map((item) => ({
      ...item,
      averagePriceDisplay: Number(item.averagePrice || 0) * currencyRates[currency],
      totalCommissionDisplay:
        Number(item.totalCommission || 0) * currencyRates[currency],
    }));
  }, [analytics.pandasInsights.monthlyShipmentTrend, currency]);

  const hasRevenueTrendData = monthlyRevenueChartData.length > 1;
  const hasPandasMonthlyTrendData = pandasMonthlyTrendData.length > 1;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="mt-2 text-slate-600">
              Monitor shipment performance, route demand, truck utilization,
              revenue flow, commission trends, and Pandas-powered business insights.
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
            <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(analytics.revenueSummary.totalRevenue)}
                description="Total negotiated shipment value"
              />
              <MetricCard
                title="Total Commission"
                value={formatCurrency(analytics.revenueSummary.totalCommission)}
                description="Total brokerage earnings tracked"
              />
              <MetricCard
                title="Avg Shipment Value"
                value={formatCurrency(analytics.revenueSummary.averageShipmentValue)}
                description="Average negotiated value per shipment"
              />
              <MetricCard
                title="Avg Commission Rate"
                value={formatPercent(analytics.revenueSummary.averageCommissionRate)}
                description="Average commission as % of shipment value"
              />
            </section>

            <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <CompactMetricCard
                title="Total Shipments"
                value={analytics.operationsSummary.totalShipments}
                description="Records in the platform"
              />
              <CompactMetricCard
                title="Completion Rate"
                value={formatPercent(analytics.operationsSummary.completionRate)}
                description="Completed shipment share"
              />
              <CompactMetricCard
                title="Truck Utilization"
                value={formatPercent(analytics.fleetSummary.truckUtilizationRate)}
                description="Fleet currently assigned"
              />
              <CompactMetricCard
                title="Pandas Avg Margin"
                value={formatPercent(analytics.pandasInsights.summary.averageMarginPercent)}
                description="Average margin from analytics layer"
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
                  {hasRevenueTrendData ? (
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
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">
                      Add more monthly shipment history to show a stronger revenue trend.
                    </div>
                  )}
                </div>
              </Card>

              <Card
                title="Pandas Monthly Shipment Trend"
                subtitle="Monthly demand and margin-related trend summary"
              >
                <div className="h-80">
                  {hasPandasMonthlyTrendData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pandasMonthlyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="shipmentMonth" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar
                          dataKey="shipmentCount"
                          name="Shipments"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">
                      Add more monthly shipment data to make this trend more meaningful.
                    </div>
                  )}
                </div>
              </Card>
            </section>

            <section className="mb-8 grid gap-6 xl:grid-cols-2">
              <Card
                title="Most Profitable Routes"
                subtitle="Routes ranked by total commission and margin quality"
              >
                {analytics.pandasInsights.mostProfitableRoutes.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No route profitability data available.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {analytics.pandasInsights.mostProfitableRoutes.map((route, index) => (
                      <div
                        key={`${route.route}-${index}`}
                        className="rounded-xl bg-slate-50 p-4"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{route.route}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {route.shipmentCount} shipments
                            </p>
                          </div>
                          <div className="text-sm text-slate-600">
                            <div>
                              Commission{" "}
                              <span className="font-semibold text-slate-900">
                                {formatCurrency(route.totalCommission)}
                              </span>
                            </div>
                            <div>
                              Avg margin{" "}
                              <span className="font-semibold text-slate-900">
                                {formatPercent(route.averageMarginPercent)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card
                title="Lowest Margin Routes"
                subtitle="Routes that may need pricing review or margin improvement"
              >
                {analytics.pandasInsights.lowestMarginRoutes.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No low-margin route data available.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {analytics.pandasInsights.lowestMarginRoutes.map((route, index) => (
                      <div
                        key={`${route.route}-${index}`}
                        className="rounded-xl bg-slate-50 p-4"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{route.route}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {route.shipmentCount} shipments
                            </p>
                          </div>
                          <div className="text-sm text-slate-600">
                            <div>
                              Avg price{" "}
                              <span className="font-semibold text-slate-900">
                                {formatCurrency(route.averagePrice)}
                              </span>
                            </div>
                            <div>
                              Avg margin{" "}
                              <span className="font-semibold text-slate-900">
                                {formatPercent(route.averageMarginPercent)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <Card
                title="Route Benchmarks"
                subtitle="Pandas-generated benchmark view by route volume and pricing"
              >
                {analytics.pandasInsights.routeBenchmarks.length === 0 ? (
                  <p className="text-sm text-slate-500">No benchmark data available.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="border-b border-slate-200 text-left text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Route</th>
                          <th className="px-4 py-3">Shipments</th>
                          <th className="px-4 py-3">Avg Price</th>
                          <th className="px-4 py-3">Avg Margin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.pandasInsights.routeBenchmarks.map((route, index) => (
                          <tr key={index} className="border-b border-slate-100">
                            <td className="px-4 py-3 font-medium">{route.route}</td>
                            <td className="px-4 py-3">{route.shipmentCount}</td>
                            <td className="px-4 py-3">{formatCurrency(route.averagePrice)}</td>
                            <td className="px-4 py-3">
                              {formatPercent(route.averageMarginPercent)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              <Card
                title="Truck Type Profitability"
                subtitle="Profitability and demand by shipment truck type"
              >
                {analytics.pandasInsights.truckTypeProfitability.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No truck type profitability data available.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="border-b border-slate-200 text-left text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Truck Type</th>
                          <th className="px-4 py-3">Shipments</th>
                          <th className="px-4 py-3">Avg Price</th>
                          <th className="px-4 py-3">Total Commission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.pandasInsights.truckTypeProfitability.map(
                          (item, index) => (
                            <tr key={index} className="border-b border-slate-100">
                              <td className="px-4 py-3 font-medium">{item.truckType}</td>
                              <td className="px-4 py-3">{item.shipmentCount}</td>
                              <td className="px-4 py-3">
                                {formatCurrency(item.averagePrice)}
                              </td>
                              <td className="px-4 py-3">
                                {formatCurrency(item.totalCommission)}
                              </td>
                            </tr>
                          )
                        )}
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