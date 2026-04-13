import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import api from "../services/api";
import useDisplayCurrency from "../hooks/useDisplayCurrency";

const Card = ({ title, subtitle, right, children, className = "" }) => (
  <section
    className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
  >
    {(title || subtitle || right) && (
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {right}
      </div>
    )}
    {children}
  </section>
);

const MetricCard = ({ title, value, description }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{title}</p>
    <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
    <p className="mt-2 text-sm text-slate-500">{description}</p>
  </div>
);

const StatusBadge = ({ text, variant = "default" }) => {
  const styles = {
    Pending: "bg-amber-50 text-amber-700",
    Assigned: "bg-blue-50 text-blue-700",
    "In Transit": "bg-purple-50 text-purple-700",
    Completed: "bg-emerald-50 text-emerald-700",
    Available: "bg-emerald-50 text-emerald-700",
    Unavailable: "bg-red-50 text-red-700",
    default: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[variant] || styles.default
      }`}
    >
      {text}
    </span>
  );
};

const InsightPill = ({ label, tone = "neutral" }) => {
  const tones = {
    good: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    neutral: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
        tones[tone] || tones.neutral
      }`}
    >
      {label}
    </span>
  );
};

const SkeletonMetricCard = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
    <div className="mt-4 h-8 w-16 animate-pulse rounded bg-slate-200" />
    <div className="mt-4 h-4 w-40 animate-pulse rounded bg-slate-200" />
    <div className="mt-2 h-4 w-32 animate-pulse rounded bg-slate-200" />
  </div>
);

const SkeletonListItem = () => (
  <div className="rounded-xl bg-slate-50 p-4">
    <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
    <div className="mt-3 h-4 w-48 animate-pulse rounded bg-slate-200" />
    <div className="mt-2 h-3 w-36 animate-pulse rounded bg-slate-200" />
  </div>
);

export default function Dashboard() {
  const { currency, setCurrency, formatCurrency } = useDisplayCurrency();
  const [shipments, setShipments] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [shipmentsRes, trucksRes, analyticsRes] = await Promise.all([
          api.get("/api/shipments"),
          api.get("/api/trucks"),
          api.get("/api/analytics"),
        ]);

        setShipments(shipmentsRes.data || []);
        setTrucks(trucksRes.data || []);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const recentShipments = useMemo(() => [...shipments].slice(0, 5), [shipments]);

  const recentAvailableTrucks = useMemo(() => {
    return trucks
      .filter((truck) => truck.availabilityStatus === "Available")
      .slice(0, 5);
  }, [trucks]);

  const dashboardStats = useMemo(() => {
    const totalShipments = shipments.length;
    const pendingShipments = shipments.filter(
      (shipment) => shipment.status === "Pending"
    ).length;
    const inTransitShipments = shipments.filter(
      (shipment) => shipment.status === "In Transit"
    ).length;
    const totalRevenue = shipments.reduce(
      (sum, shipment) => sum + Number(shipment.negotiatedPrice || 0),
      0
    );
    const totalCommission = shipments.reduce(
      (sum, shipment) => sum + Number(shipment.commissionAmount || 0),
      0
    );

    return {
      totalShipments,
      pendingShipments,
      inTransitShipments,
      totalRevenue,
      totalCommission,
    };
  }, [shipments]);

  const topProfitableRoute = analytics?.pandasInsights?.mostProfitableRoutes?.[0];
  const weakestRoute = analytics?.pandasInsights?.lowestMarginRoutes?.[0];

  const marginSummary = analytics?.pandasInsights?.summary || {
    averageMarginPercent: 0,
    highestMarginPercent: 0,
    lowestMarginPercent: 0,
  };

  const lowMarginCount =
    analytics?.pandasInsights?.lowestMarginRoutes?.filter(
      (route) =>
        Number(route.averageMarginPercent) <
        Number(marginSummary.averageMarginPercent || 0)
    ).length || 0;

  const healthyMarginCount =
    analytics?.pandasInsights?.mostProfitableRoutes?.filter(
      (route) =>
        Number(route.averageMarginPercent) >=
        Number(marginSummary.averageMarginPercent || 0)
    ).length || 0;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Operations Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Monitor brokerage activity, shipment workflow, truck readiness,
              pricing intelligence, and business performance in one place.
            </p>
          </div>

          <div className="w-full md:w-52">
            <label
              htmlFor="dashboardCurrency"
              className="mb-2 block text-sm font-medium text-slate-600"
            >
              Display Currency
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
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {loading ? (
            <>
              <SkeletonMetricCard />
              <SkeletonMetricCard />
              <SkeletonMetricCard />
              <SkeletonMetricCard />
              <SkeletonMetricCard />
            </>
          ) : (
            <>
              <MetricCard
                title="Total Shipments"
                value={dashboardStats.totalShipments}
                description="All shipment records tracked in the platform"
              />
              <MetricCard
                title="Pending Shipments"
                value={dashboardStats.pendingShipments}
                description="Requests waiting for assignment or action"
              />
              <MetricCard
                title="In Transit"
                value={dashboardStats.inTransitShipments}
                description="Shipments currently moving through delivery"
              />
              <MetricCard
                title="Revenue"
                value={formatCurrency(dashboardStats.totalRevenue)}
                description="Total negotiated shipment value"
              />
              <MetricCard
                title="Commission"
                value={formatCurrency(dashboardStats.totalCommission)}
                description="Total brokerage earnings tracked"
              />
            </>
          )}
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-3">
          <Card
            title="Quick Actions"
            subtitle="Jump straight into operational workflows"
          >
            <div className="grid gap-3">
              <Link
                to="/shipments"
                className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:bg-slate-100"
              >
                Manage Shipments
              </Link>
              <Link
                to="/trucks"
                className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:bg-slate-100"
              >
                Manage Trucks
              </Link>
              <Link
                to="/analytics"
                className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:bg-slate-100"
              >
                View Full Analytics
              </Link>
            </div>
          </Card>

          <Card
            title="Platform Health"
            subtitle="High-level operational snapshot"
            className="xl:col-span-2"
          >
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                  <div className="mt-4 h-8 w-16 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                  <div className="mt-4 h-8 w-16 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                  <div className="mt-4 h-8 w-16 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                  <div className="mt-4 h-8 w-16 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">
                    Completion Rate
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {analytics
                      ? `${Number(
                          analytics.operationsSummary.completionRate
                        ).toFixed(1)}%`
                      : "0.0%"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">
                    Assignment Rate
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {analytics
                      ? `${Number(
                          analytics.operationsSummary.assignmentRate
                        ).toFixed(1)}%`
                      : "0.0%"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">
                    Truck Utilization
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {analytics
                      ? `${Number(
                          analytics.fleetSummary.truckUtilizationRate
                        ).toFixed(1)}%`
                      : "0.0%"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">
                    Avg Margin
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {analytics
                      ? `${Number(
                          analytics.pandasInsights.summary.averageMarginPercent
                        ).toFixed(1)}%`
                      : "0.0%"}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-2">
          <Card
            title="Pandas Spotlight"
            subtitle="Top and bottom route signals from profitability analysis"
          >
            {loading ? (
              <div className="grid gap-4">
                <div className="rounded-xl bg-emerald-50 p-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-emerald-100" />
                  <div className="mt-4 h-5 w-48 animate-pulse rounded bg-emerald-100" />
                  <div className="mt-3 h-4 w-40 animate-pulse rounded bg-emerald-100" />
                </div>
                <div className="rounded-xl bg-amber-50 p-4">
                  <div className="h-4 w-36 animate-pulse rounded bg-amber-100" />
                  <div className="mt-4 h-5 w-48 animate-pulse rounded bg-amber-100" />
                  <div className="mt-3 h-4 w-40 animate-pulse rounded bg-amber-100" />
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="rounded-xl bg-emerald-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-emerald-700">
                      Top Profitable Route
                    </p>
                    <InsightPill label="High Margin" tone="good" />
                  </div>

                  {topProfitableRoute ? (
                    <>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {topProfitableRoute.route}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Commission {formatCurrency(topProfitableRoute.totalCommission)} • Avg
                        margin {Number(topProfitableRoute.averageMarginPercent).toFixed(1)}%
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-slate-600">
                      No profitable route insight yet.
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-amber-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-amber-700">
                      Route Requiring Review
                    </p>
                    <InsightPill label="Margin Watch" tone="warning" />
                  </div>

                  {weakestRoute ? (
                    <>
                      <p className="mt-2 text-lg font-semibold text-slate-900">
                        {weakestRoute.route}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Avg price {formatCurrency(weakestRoute.averagePrice)} • Avg
                        margin {Number(weakestRoute.averageMarginPercent).toFixed(1)}%
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-slate-600">
                      No weak route insight yet.
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>

          <Card
            title="Margin Watch"
            subtitle="Operational pricing signals surfaced from the analytics layer"
          >
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                  <div className="mt-4 h-8 w-16 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                  <div className="mt-4 h-8 w-16 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                  <div className="mt-4 h-8 w-16 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                  <div className="mt-4 h-8 w-16 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">
                    Healthy Margin Routes
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {healthyMarginCount}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Top routes performing at or above average margin
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">
                    Low Margin Routes
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {lowMarginCount}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Routes that may need pricing review before booking
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">
                    Highest Margin Seen
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {Number(marginSummary.highestMarginPercent || 0).toFixed(1)}%
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Strongest observed commission efficiency in the dataset
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">
                    Lowest Margin Seen
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {Number(marginSummary.lowestMarginPercent || 0).toFixed(1)}%
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Weakest observed margin that may indicate underpricing
                  </p>
                </div>
              </div>
            )}
          </Card>
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-2">
          <Card
            title="Recent Shipments"
            subtitle="Latest shipment activity across the platform"
          >
            {loading ? (
              <div className="space-y-3">
                <SkeletonListItem />
                <SkeletonListItem />
                <SkeletonListItem />
              </div>
            ) : recentShipments.length === 0 ? (
              <p className="text-sm text-slate-500">
                No shipments available yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {shipment.clientName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {shipment.pickupLocation} → {shipment.dropoffLocation}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {shipment.shipmentDate} • {shipment.truckType}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <StatusBadge
                        text={shipment.status}
                        variant={shipment.status}
                      />
                      <p className="text-sm font-semibold text-slate-800">
                        {formatCurrency(shipment.negotiatedPrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card
            title="Available Trucks"
            subtitle="Quick view of trucks currently ready for assignment"
          >
            {loading ? (
              <div className="space-y-3">
                <SkeletonListItem />
                <SkeletonListItem />
                <SkeletonListItem />
              </div>
            ) : recentAvailableTrucks.length === 0 ? (
              <p className="text-sm text-slate-500">
                No available trucks right now.
              </p>
            ) : (
              <div className="space-y-3">
                {recentAvailableTrucks.map((truck) => (
                  <div
                    key={truck.id}
                    className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {truck.truckCode}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {truck.driverName} • {truck.truckType}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {truck.currentLocation} • {truck.capacityTons} tons
                      </p>
                    </div>

                    <StatusBadge
                      text={truck.availabilityStatus}
                      variant={truck.availabilityStatus}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
}